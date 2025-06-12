import { useState } from "react";

import { Trip } from "@/app/types/trip";
import { Item } from "@/app/types/item";
import { formatDate } from "@/app/utils/date";
import EditablePackingListItem from "./EditablePackingListItem";
import PackingListItemSkeleton from "./skeletons/PackingListItemSkeleton";


interface EditableTripPageProps {
    className: string;
    trip: Trip;
    packingList: Partial<Item>[];
    onConfirm: () => void;
    onCancel: () => void;
    onRenameTrip: (newName: string) => void;
    onUpdateTripDates: (newDates: { start_date: string, end_date: string }) => void;
    onUpdateTripDescription: (newDescription: string) => void;
    onAddItem: (newItem: Item) => void;
    onUpdateItemQuantity: (itemName: string, newQuantity: number) => void;
    onUpdateItemNotes: (itemName: string, newNotes: string) => void;
    onRenameItem: (itemName: string, newName: string) => void;
    onDeleteItem: (itemName: string) => void;
}

export default function EditableTripPage({
    className,
    trip, 
    packingList,
    onConfirm,
    onCancel,
    onRenameTrip,
    onUpdateTripDates,
    onUpdateTripDescription,
    onAddItem,
    onUpdateItemQuantity,
    onUpdateItemNotes,
    onRenameItem,
    onDeleteItem 
}: EditableTripPageProps) {
    const [isEditingTrip, setIsEditingTrip] = useState<{
        name: boolean;
        description: boolean;
        dates: boolean;
    }>({
        name: false,
        description: false,
        dates: false,
    });

    const [editedTrip, setEditedTrip] = useState<Partial<Trip>>({
        name: trip?.name || '',
        description: trip?.description || '',
        start_date: trip?.start_date || '',
        end_date: trip?.end_date || '',
    });

    return (
        <div className={'p-4 border-r border-tertiary overflow-y-auto ' + className}>
        <div className="max-w-2xl mx-auto">
            {/* Action buttons */}
            <div className="flex justify-end gap-4 mb-6">
                <button 
                    className="px-4 py-2 text-secondary hover:text-secondary-hover transition-colors"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-hover transition-colors"
                    onClick={onConfirm}
                >
                    Confirm
                </button>
            </div>

            {/* Trip details */}
            <div className="mb-8">
                {/* Trip name */}
                <div className="mb-4">
                    {isEditingTrip.name ? (
                        <input
                            type="text"
                            value={editedTrip.name}
                            onChange={(e) => setEditedTrip(prev => ({ ...prev, name: e.target.value }))}
                            onBlur={() => onRenameTrip(editedTrip.name as string)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onRenameTrip(editedTrip.name as string);
                                if (e.key === 'Escape') {
                                    setEditedTrip(prev => ({ ...prev, name: trip.name }));
                                    setIsEditingTrip(prev => ({ ...prev, name: false }));
                                }
                            }}
                            className="text-3xl font-bold w-full bg-transparent border-b border-primary outline-none focus:border-primary-hover"
                            autoFocus
                        />
                    ) : (
                        <h1 
                            onClick={() => setIsEditingTrip(prev => ({ ...prev, name: true }))}
                            className="text-3xl font-bold cursor-text hover:text-secondary transition-colors"
                        >
                            {trip.name}
                        </h1>
                    )}
                </div>

                {/* Trip dates */}
                <div className="mb-4">
                    {isEditingTrip.dates ? (
                        <div className="flex gap-4 items-center">
                            <input
                                type="date"
                                value={editedTrip.start_date}
                                onChange={(e) => setEditedTrip(prev => ({ ...prev, start_date: e.target.value }))}
                                onBlur={() => onUpdateTripDates({ start_date: editedTrip.start_date as string, end_date: editedTrip.end_date as string })}
                                className="bg-transparent border-b border-primary outline-none focus:border-primary-hover"
                            />
                            <span className="text-secondary">-</span>
                            <input
                                type="date"
                                value={editedTrip.end_date}
                                onChange={(e) => setEditedTrip(prev => ({ ...prev, end_date: e.target.value }))}
                                onBlur={() => onUpdateTripDates({ start_date: editedTrip.start_date as string, end_date: editedTrip.end_date as string })}
                                className="bg-transparent border-b border-primary outline-none focus:border-primary-hover"
                            />
                        </div>
                    ) : (
                        <p 
                            onClick={() => setIsEditingTrip(prev => ({ ...prev, dates: true }))}
                            className="text-secondary cursor-text hover:text-secondary-hover transition-colors"
                        >
                            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                        </p>
                    )}
                </div>

                {/* Trip description */}
                {isEditingTrip.description ? (
                    <textarea
                        value={editedTrip.description}
                        onChange={(e) => setEditedTrip(prev => ({ ...prev, description: e.target.value }))}
                        onBlur={() => onUpdateTripDescription(editedTrip.description as string)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.metaKey) onUpdateTripDescription(editedTrip.description as string);
                            if (e.key === 'Escape') {
                                setEditedTrip(prev => ({ ...prev, description: trip.description || '' }));
                                setIsEditingTrip(prev => ({ ...prev, description: false }));
                            }
                        }}
                        className="w-full bg-transparent border-b border-primary outline-none focus:border-primary-hover min-h-[60px] resize-none"
                        placeholder="Add a description..."
                        autoFocus
                    />
                ) : (
                    <p 
                        onClick={() => setIsEditingTrip(prev => ({ ...prev, description: true }))}
                        className="text-secondary cursor-text hover:text-secondary-hover transition-colors"
                    >
                        {trip.description || 'Add a description...'}
                    </p>
                )}
            </div>

            {/* Packing list */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Packing List</h2>
                    <button
                        onClick={() => {
                            const newItem: Partial<Item> = {
                                trip_id: trip?.id,
                                name: '',
                                quantity: 1,
                                notes: '',
                            };
                            onAddItem(newItem as Item);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-secondary hover:text-secondary-hover transition-colors"
                        aria-label="Add item"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-2">
                    {packingList.map((item) => (
                        <EditablePackingListItem
                            key={item.name}
                            item={item}
                            onQuantityUpdate={(quantity) => {
                                onUpdateItemQuantity(item.name as string, quantity);
                            }}
                            onDelete={() => {
                                onDeleteItem(item.name as string);
                            }}
                            onNotesUpdate={(notes) => {
                                onUpdateItemNotes(item.name as string, notes);
                            }}
                            onNameUpdate={(name) => {
                                onRenameItem(item.name as string, name);
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    </div>
    );
}