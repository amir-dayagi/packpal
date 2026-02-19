


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."item_origin" AS ENUM (
    'listed',
    'purchased'
);


ALTER TYPE "public"."item_origin" OWNER TO "postgres";


CREATE TYPE "public"."trip_status" AS ENUM (
    'packing',
    'traveling',
    'completed'
);


ALTER TYPE "public"."trip_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."accept_assistant_results"("p_user_id" "uuid", "p_trip" "jsonb", "p_categories" "jsonb", "p_uncategorized_items" "jsonb") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_trip_id BIGINT;
  v_category RECORD;
  v_item RECORD;
  v_nested_item RECORD;
  v_category_id BIGINT;
  v_item_id BIGINT;
  v_item_name TEXT;
  v_valid_category_ids BIGINT[] := ARRAY[]::BIGINT[];
  v_valid_item_ids BIGINT[] := ARRAY[]::BIGINT[];
BEGIN
  -- 1. Trip Upsert
  -- Using ON CONFLICT logic manually for flexibility or standard upsert
  IF (p_trip->>'id') IS NOT NULL AND (p_trip->>'id') != 'null' THEN
    v_trip_id := (p_trip->>'id')::BIGINT;
    
    UPDATE trips
    SET
      name = p_trip->>'name',
      description = p_trip->>'description',
      start_date = (p_trip->>'start_date')::DATE,
      end_date = (p_trip->>'end_date')::DATE,
      status = 'packing'
    WHERE id = v_trip_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Trip not found or access denied';
    END IF;
  ELSE
    INSERT INTO trips (user_id, name, description, start_date, end_date, status)
    VALUES (
      p_user_id,
      p_trip->>'name',
      p_trip->>'description',
      (p_trip->>'start_date')::DATE,
      (p_trip->>'end_date')::DATE,
      'packing'
    )
    RETURNING id INTO v_trip_id;
  END IF;

  -- 2. Process Categories
  IF p_categories IS NOT NULL THEN
    FOR v_category IN SELECT * FROM jsonb_array_elements(p_categories)
    LOOP
      v_category_id := NULL;
      
      -- Try to use existing ID if provided
      IF (v_category.value->>'id') IS NOT NULL AND (v_category.value->>'id') != 'null' THEN
        v_category_id := (v_category.value->>'id')::BIGINT;
        UPDATE categories SET name = v_category.value->>'name' WHERE id = v_category_id AND trip_id = v_trip_id;
        -- If update fails (e.g. deleted concurrently?), we will insert/find below? 
        -- Actually if ID provided, we assume it's valid. But let's be safe.
      END IF;

      -- If no ID or update didn't work (though update guarantees nothing if row missing), let's rely on name/logic
      IF v_category_id IS NULL THEN
         BEGIN
           INSERT INTO categories (trip_id, name)
           VALUES (v_trip_id, v_category.value->>'name')
           RETURNING id INTO v_category_id;
         EXCEPTION WHEN unique_violation THEN
           -- Category with this name exists in this trip
           SELECT id INTO v_category_id 
           FROM categories 
           WHERE trip_id = v_trip_id AND name = (v_category.value->>'name')
           LIMIT 1;
           
           -- Optionally update it?
           -- UPDATE categories SET name = v_category.value->>'name' WHERE id = v_category_id;
         END;
      END IF;
      
      v_valid_category_ids := array_append(v_valid_category_ids, v_category_id);

      -- 3. Process Items in this Category
      IF (v_category.value->'items') IS NOT NULL AND jsonb_typeof(v_category.value->'items') = 'array' THEN
        FOR v_nested_item IN SELECT * FROM jsonb_array_elements(v_category.value->'items')
        LOOP
           v_item_name := v_nested_item.value->>'name';
           v_item_id := NULL;
           
           IF (v_nested_item.value->>'id') IS NOT NULL AND (v_nested_item.value->>'id') != 'null' THEN
               -- Update existing item
               v_item_id := (v_nested_item.value->>'id')::BIGINT;
               BEGIN
                 UPDATE items SET
                   category_id = v_category_id,
                   name = v_item_name,
                   notes = v_nested_item.value->>'notes',
                   list_quantity = (v_nested_item.value->>'quantity')::INT
                 WHERE id = v_item_id AND trip_id = v_trip_id;
               EXCEPTION WHEN unique_violation THEN
                 -- Handle rename collision
                 -- This means we tried to rename item A to "Socks", but "Socks" already exists in this category/trip
                 -- Fallback: Delete item A (since we are replacing it with "Socks")? 
                 -- Or Merge?
                 -- Effectively "Socks" (existing) takes precedence.
                 -- We should mark existing "Socks" as valid.
                 SELECT id INTO v_item_id FROM items WHERE trip_id = v_trip_id AND category_id = v_category_id AND name = v_item_name LIMIT 1;
                 
                 UPDATE items SET
                     notes = v_nested_item.value->>'notes',
                     list_quantity = (v_nested_item.value->>'quantity')::INT
                 WHERE id = v_item_id;
               END;
           ELSE
               -- Insert new item
               BEGIN
                 INSERT INTO items (trip_id, category_id, name, notes, list_quantity, origin)
                 VALUES (v_trip_id, v_category_id, v_item_name, v_nested_item.value->>'notes', (v_nested_item.value->>'quantity')::INT, 'listed')
                 RETURNING id INTO v_item_id;
               EXCEPTION WHEN unique_violation THEN
                 SELECT id INTO v_item_id FROM items WHERE trip_id = v_trip_id AND category_id = v_category_id AND name = v_item_name LIMIT 1;
                 UPDATE items SET
                     notes = v_nested_item.value->>'notes',
                     list_quantity = (v_nested_item.value->>'quantity')::INT
                 WHERE id = v_item_id;
               END;
           END IF;
           
           IF v_item_id IS NOT NULL THEN
             v_valid_item_ids := array_append(v_valid_item_ids, v_item_id);
           END IF;
        END LOOP;
      END IF;
    END LOOP;
  END IF;

  -- 4. Process Uncategorized Items
  IF p_uncategorized_items IS NOT NULL THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_uncategorized_items)
    LOOP
       v_item_name := v_item.value->>'name';
       v_item_id := NULL;
       
       IF (v_item.value->>'id') IS NOT NULL AND (v_item.value->>'id') != 'null' THEN
           v_item_id := (v_item.value->>'id')::BIGINT;
           BEGIN
             UPDATE items SET
               category_id = NULL,
               name = v_item_name,
               notes = v_item.value->>'notes',
               list_quantity = (v_item.value->>'quantity')::INT
             WHERE id = v_item_id AND trip_id = v_trip_id;
           EXCEPTION WHEN unique_violation THEN
             SELECT id INTO v_item_id FROM items WHERE trip_id = v_trip_id AND category_id IS NULL AND name = v_item_name LIMIT 1;
             UPDATE items SET
                 notes = v_item.value->>'notes',
                 list_quantity = (v_item.value->>'quantity')::INT
             WHERE id = v_item_id;
           END;
       ELSE
           BEGIN
             INSERT INTO items (trip_id, category_id, name, notes, list_quantity, origin)
             VALUES (v_trip_id, NULL, v_item_name, v_item.value->>'notes', (v_item.value->>'quantity')::INT, 'listed')
             RETURNING id INTO v_item_id;
           EXCEPTION WHEN unique_violation THEN
             SELECT id INTO v_item_id FROM items WHERE trip_id = v_trip_id AND category_id IS NULL AND name = v_item_name LIMIT 1;
             UPDATE items SET
                 notes = v_item.value->>'notes',
                 list_quantity = (v_item.value->>'quantity')::INT
             WHERE id = v_item_id;
           END;
       END IF;

       IF v_item_id IS NOT NULL THEN
         v_valid_item_ids := array_append(v_valid_item_ids, v_item_id);
       END IF;
    END LOOP;
  END IF;

  -- 5. Cleanup Deleted Items and Categories
  -- Delete items first to avoid FK issues if cascade not set
  DELETE FROM items 
  WHERE trip_id = v_trip_id 
    AND id != ALL(v_valid_item_ids);

  DELETE FROM categories 
  WHERE trip_id = v_trip_id 
    AND id != ALL(v_valid_category_ids);

  RETURN v_trip_id;
END;
$$;


ALTER FUNCTION "public"."accept_assistant_results"("p_user_id" "uuid", "p_trip" "jsonb", "p_categories" "jsonb", "p_uncategorized_items" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "trip_id" bigint NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


ALTER TABLE "public"."categories" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."category_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."checkpoint_blobs" (
    "thread_id" "text" NOT NULL,
    "checkpoint_ns" "text" DEFAULT ''::"text" NOT NULL,
    "channel" "text" NOT NULL,
    "version" "text" NOT NULL,
    "type" "text" NOT NULL,
    "blob" "bytea"
);


ALTER TABLE "public"."checkpoint_blobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."checkpoint_migrations" (
    "v" integer NOT NULL
);


ALTER TABLE "public"."checkpoint_migrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."checkpoint_writes" (
    "thread_id" "text" NOT NULL,
    "checkpoint_ns" "text" DEFAULT ''::"text" NOT NULL,
    "checkpoint_id" "text" NOT NULL,
    "task_id" "text" NOT NULL,
    "idx" integer NOT NULL,
    "channel" "text" NOT NULL,
    "type" "text",
    "blob" "bytea" NOT NULL,
    "task_path" "text" DEFAULT ''::"text" NOT NULL
);


ALTER TABLE "public"."checkpoint_writes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."checkpoints" (
    "thread_id" "text" NOT NULL,
    "checkpoint_ns" "text" DEFAULT ''::"text" NOT NULL,
    "checkpoint_id" "text" NOT NULL,
    "parent_checkpoint_id" "text",
    "type" "text",
    "checkpoint" "jsonb" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."checkpoints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."items" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "trip_id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "notes" "text",
    "list_quantity" bigint,
    "packed_quantity" bigint,
    "returning_quantity" bigint,
    "purchased_quantity" bigint,
    "category_id" bigint,
    "origin" "public"."item_origin" NOT NULL
);


ALTER TABLE "public"."items" OWNER TO "postgres";


ALTER TABLE "public"."items" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."items_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."trips" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "public"."trip_status" DEFAULT 'packing'::"public"."trip_status" NOT NULL
);


ALTER TABLE "public"."trips" OWNER TO "postgres";


ALTER TABLE "public"."trips" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."trips_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "category_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."checkpoint_blobs"
    ADD CONSTRAINT "checkpoint_blobs_pkey" PRIMARY KEY ("thread_id", "checkpoint_ns", "channel", "version");



ALTER TABLE ONLY "public"."checkpoint_migrations"
    ADD CONSTRAINT "checkpoint_migrations_pkey" PRIMARY KEY ("v");



ALTER TABLE ONLY "public"."checkpoint_writes"
    ADD CONSTRAINT "checkpoint_writes_pkey" PRIMARY KEY ("thread_id", "checkpoint_ns", "checkpoint_id", "task_id", "idx");



ALTER TABLE ONLY "public"."checkpoints"
    ADD CONSTRAINT "checkpoints_pkey" PRIMARY KEY ("thread_id", "checkpoint_ns", "checkpoint_id");



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "unique_cateogry_name_per_trip" UNIQUE ("name", "trip_id");



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "unique_item_name_per_trip" UNIQUE ("name", "trip_id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "unique_trip_name_per_user" UNIQUE ("name", "user_id");



CREATE INDEX "checkpoint_blobs_thread_id_idx" ON "public"."checkpoint_blobs" USING "btree" ("thread_id");



CREATE INDEX "checkpoint_writes_thread_id_idx" ON "public"."checkpoint_writes" USING "btree" ("thread_id");



CREATE INDEX "checkpoints_thread_id_idx" ON "public"."checkpoints" USING "btree" ("thread_id");



CREATE INDEX "items_trip_id_idx" ON "public"."items" USING "btree" ("trip_id");



CREATE INDEX "trips_user_id_index" ON "public"."trips" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "category_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Allow delete for trip owner on categories" ON "public"."categories" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "categories"."trip_id") AND ("trips"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Allow delete for trip owner on items" ON "public"."items" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "items"."trip_id") AND ("trips"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Allow insert for trip owner on categories" ON "public"."categories" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "categories"."trip_id") AND ("trips"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Allow insert for trip owner on items" ON "public"."items" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "items"."trip_id") AND ("trips"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Allow select for trip owner on categories" ON "public"."categories" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "categories"."trip_id") AND ("trips"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Allow select for trip owner on items" ON "public"."items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "items"."trip_id") AND ("trips"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Allow update for trip owner on categories" ON "public"."categories" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "categories"."trip_id") AND ("trips"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "categories"."trip_id") AND ("trips"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Allow update for trip owner on items" ON "public"."items" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "items"."trip_id") AND ("trips"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "items"."trip_id") AND ("trips"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can create their own trips" ON "public"."trips" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can delete their own trips" ON "public"."trips" FOR DELETE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update their own trips" ON "public"."trips" FOR UPDATE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view their own trips" ON "public"."trips" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."checkpoint_blobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."checkpoint_migrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."checkpoint_writes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."checkpoints" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trips" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."accept_assistant_results"("p_user_id" "uuid", "p_trip" "jsonb", "p_categories" "jsonb", "p_uncategorized_items" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."accept_assistant_results"("p_user_id" "uuid", "p_trip" "jsonb", "p_categories" "jsonb", "p_uncategorized_items" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_assistant_results"("p_user_id" "uuid", "p_trip" "jsonb", "p_categories" "jsonb", "p_uncategorized_items" "jsonb") TO "service_role";


















GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."category_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."category_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."category_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."checkpoint_blobs" TO "anon";
GRANT ALL ON TABLE "public"."checkpoint_blobs" TO "authenticated";
GRANT ALL ON TABLE "public"."checkpoint_blobs" TO "service_role";



GRANT ALL ON TABLE "public"."checkpoint_migrations" TO "anon";
GRANT ALL ON TABLE "public"."checkpoint_migrations" TO "authenticated";
GRANT ALL ON TABLE "public"."checkpoint_migrations" TO "service_role";



GRANT ALL ON TABLE "public"."checkpoint_writes" TO "anon";
GRANT ALL ON TABLE "public"."checkpoint_writes" TO "authenticated";
GRANT ALL ON TABLE "public"."checkpoint_writes" TO "service_role";



GRANT ALL ON TABLE "public"."checkpoints" TO "anon";
GRANT ALL ON TABLE "public"."checkpoints" TO "authenticated";
GRANT ALL ON TABLE "public"."checkpoints" TO "service_role";



GRANT ALL ON TABLE "public"."items" TO "anon";
GRANT ALL ON TABLE "public"."items" TO "authenticated";
GRANT ALL ON TABLE "public"."items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trips" TO "anon";
GRANT ALL ON TABLE "public"."trips" TO "authenticated";
GRANT ALL ON TABLE "public"."trips" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trips_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trips_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trips_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































