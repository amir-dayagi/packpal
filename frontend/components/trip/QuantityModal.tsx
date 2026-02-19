import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState } from "react"

interface QuantityModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    onConfirm: (quantity: number, isEntireQuantity: boolean) => void
    maxQuantity: number
}

export function QuantityModal({ open, onOpenChange, title, description, onConfirm, maxQuantity }: QuantityModalProps) {
    const [quantity, setQuantity] = useState(maxQuantity)
    const [entireQuantityChecked, setEntireQuantityChecked] = useState(true)

    useEffect(() => {
        setEntireQuantityChecked(quantity === maxQuantity)
    }, [quantity])

    useEffect(() => {
        if (entireQuantityChecked && quantity !== maxQuantity) {
            setQuantity(maxQuantity)
        } else if (!entireQuantityChecked && quantity === maxQuantity) {
            setQuantity(1)
        }
    }, [entireQuantityChecked])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onConfirm(quantity, entireQuantityChecked)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">
                            Quantity (max: {maxQuantity})
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            max={maxQuantity}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="bg-background"
                            autoFocus
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="entire-quantity-checkbox"
                            checked={entireQuantityChecked}
                            onCheckedChange={(checked) => setEntireQuantityChecked(checked as boolean)}
                        />
                        <Label htmlFor="entire-quantity-checkbox">
                            Pack entire quantity
                        </Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}