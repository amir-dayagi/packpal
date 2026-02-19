import { useQuery } from "@tanstack/react-query";
import { categoryService } from "../services/categoryService";

export default function useCategories(tripId: number) {
    const { data: categories } = useQuery({
        queryKey: ['categories', tripId],
        queryFn: () => categoryService.getAll({ tripId }),
    })
    return categories
}