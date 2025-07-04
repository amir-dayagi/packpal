CREATE TABLE public.assistant_processes (
  id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  payload text NOT NULL,
  CONSTRAINT agent_processes_pkey PRIMARY KEY (id),
  CONSTRAINT agent_processes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_agent_processes_user_id ON public.assistant_processes USING btree (user_id);

CREATE TABLE public.checkpoint_blobs (
  thread_id text NOT NULL,
  checkpoint_ns text NOT NULL DEFAULT ''::text,
  channel text NOT NULL,
  version text NOT NULL,
  type text NOT NULL,
  blob bytea NULL,
  CONSTRAINT checkpoint_blobs_pkey PRIMARY KEY (thread_id, checkpoint_ns, channel, version)
);
CREATE INDEX IF NOT EXISTS checkpoint_blobs_thread_id_idx ON public.checkpoint_blobs USING btree (thread_id);

CREATE TABLE public.checkpoint_migrations (
  v integer NOT NULL,
  CONSTRAINT checkpoint_migrations_pkey PRIMARY KEY (v)
);

CREATE TABLE public.checkpoint_writes (
  thread_id text NOT NULL,
  checkpoint_ns text NOT NULL DEFAULT ''::text,
  checkpoint_id text NOT NULL,
  task_id text NOT NULL,
  idx integer NOT NULL,
  channel text NOT NULL,
  type text NULL,
  blob bytea NOT NULL,
  task_path text NOT NULL DEFAULT ''::text,
  CONSTRAINT checkpoint_writes_pkey PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
);
CREATE INDEX IF NOT EXISTS checkpoint_writes_thread_id_idx ON public.checkpoint_writes USING btree (thread_id);

CREATE TABLE public.checkpoints (
  thread_id text NOT NULL,
  checkpoint_ns text NOT NULL DEFAULT ''::text,
  checkpoint_id text NOT NULL,
  parent_checkpoint_id text NULL,
  type text NULL,
  checkpoint jsonb NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT checkpoints_pkey PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);
CREATE INDEX IF NOT EXISTS checkpoints_thread_id_idx ON public.checkpoints USING btree (thread_id);

CREATE TABLE public.items (
  id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  trip_id bigint NOT NULL,
  name text NOT NULL,
  quantity bigint NOT NULL DEFAULT '1'::bigint,
  notes text NULL,
  is_packed boolean NOT NULL DEFAULT false,
  is_returning boolean NOT NULL DEFAULT false,
  CONSTRAINT items_pkey PRIMARY KEY (id),
  CONSTRAINT items_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS items_trip_id_idx ON public.items USING btree (trip_id);

CREATE TABLE public.trips (
  id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  description text NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  user_id uuid NULL,
  CONSTRAINT trips_pkey PRIMARY KEY (id),
  CONSTRAINT trips_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS trips_user_id_index ON public.trips USING btree (user_id);

-- RLS Policies for items table
CREATE POLICY "Allow select for trip owner on items" 
ON public.items 
FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.trips WHERE (public.trips.id = items.trip_id AND public.trips.user_id = (SELECT auth.uid()))));

CREATE POLICY "Allow insert for trip owner on items" 
ON public.items 
FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE (public.trips.id = items.trip_id AND public.trips.user_id = (SELECT auth.uid()))));

CREATE POLICY "Allow update for trip owner on items" 
ON public.items 
FOR UPDATE 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.trips WHERE (public.trips.id = items.trip_id AND public.trips.user_id = (SELECT auth.uid())))) 
WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE (public.trips.id = items.trip_id AND public.trips.user_id = (SELECT auth.uid()))));

CREATE POLICY "Allow delete for trip owner on items" 
ON public.items 
FOR DELETE 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.trips WHERE (public.trips.id = items.trip_id AND public.trips.user_id = (SELECT auth.uid()))));

-- RLS Policies for trips table
CREATE POLICY "Users can create their own trips" 
ON public.trips 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view their own trips" 
ON public.trips 
FOR SELECT 
TO authenticated 
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own trips" 
ON public.trips 
FOR UPDATE 
TO authenticated 
USING (user_id = (SELECT auth.uid())) 
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own trips" 
ON public.trips 
FOR DELETE 
TO authenticated 
USING (user_id = (SELECT auth.uid()));