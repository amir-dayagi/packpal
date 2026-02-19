import FormModal from "@/app_old/components/common/FormModal";
import { useCategoryActions } from "@/app_old/hooks/useCategoryActions";
import { CreateCategoryRequest } from "@/app_old/types/category";
import { useState } from "react";

type CreateCategoryModalProps = {
    onClose: () => void;
    tripId: number;
}

export default function CreateCategoryModal({ onClose, tripId }: CreateCategoryModalProps) {
    const { createCategory } = useCategoryActions()
    const [name, setName] = useState("")
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const request: CreateCategoryRequest = {
            newCategory: {
                name,
            },
            tripId
        }
        createCategory(request);
        setIsLoading(false);
        onClose();
    }

    return (
        <FormModal
            onClose={onClose}
            title="Create New Category"
            submitText="Create Category"
            isLoading={isLoading}
            handleSubmit={handleSubmit}
        >
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Category Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-secondary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="block w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-tertiary/50 ring-1 ring-inset ring-border placeholder:text-secondary text-foreground focus:ring-2 focus:ring-primary focus:bg-background transition-all duration-200 outline-none"
                        placeholder="Toiletries"
                    />
                </div>
            </div>
        </FormModal>
    );
}