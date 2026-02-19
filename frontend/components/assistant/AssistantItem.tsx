import { AssistantItem as IAssistantItem } from "@/types/assistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconTrash } from "@tabler/icons-react";

interface AssistantItemProps {
    item: IAssistantItem;
    handleUpdateItem: (itemId: number, field: keyof IAssistantItem, value: string | number) => void;
    handleDeleteItem: (itemId: number) => void;
}

export function AssistantItem({ item, handleUpdateItem, handleDeleteItem }: AssistantItemProps) {
    return (
        <div
            className="group flex items-start gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
            <div className="flex-1 min-w-0 space-y-1">
                <Input
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id!, "name", e.target.value)}
                    className="h-8 font-medium border-transparent bg-transparent hover:bg-background focus:bg-background px-2 -ml-2"
                />
                <Input
                    value={item.notes || ""}
                    onChange={(e) => handleUpdateItem(item.id!, "notes", e.target.value)}
                    placeholder="Add notes..."
                    className="h-7 text-sm text-muted-foreground border-transparent bg-transparent hover:bg-background focus:bg-background px-2 -ml-2"
                />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id!, "quantity", parseInt(e.target.value) || 1)}
                    className="h-8 w-16 text-center"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteItem(item.id!)}
                >
                    <IconTrash className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}