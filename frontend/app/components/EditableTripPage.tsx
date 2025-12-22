import { useState } from "react";

import { Trip } from "@/app/types/trip";
import { Item } from "@/app/types/item";
import { formatDate } from "@/app/utils/date";
import EditablePackingListItem from "./EditablePackingListItem";


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

// Presentational component: renders the top action bar with cancel/confirm controls.
function EditableTripActionBar({
    onCancel,
    onConfirm,
}: {
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="shrink-0 px-4 py-3 border-b border-tertiary/60 bg-background/90 flex items-center justify-between gap-3">
            <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide text-secondary">Trip editor</span>
                <span className="text-sm text-secondary/90">
                    Make changes to your trip and packing list before applying them.
                </span>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    className="px-4 py-2 rounded-xl text-sm font-medium text-secondary hover:text-foreground hover:bg-tertiary/50 transition-colors"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-sm font-semibold text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
                    onClick={onConfirm}
                >
                    Confirm changes
                </button>
            </div>
        </div>
    );
}

// Presentational component: renders the editable trip details (name, dates, description).
function EditableTripDetailsSection({
    trip,
    isEditingTrip,
    setIsEditingTrip,
    editedTrip,
    setEditedTrip,
    onRenameTrip,
    onUpdateTripDates,
    onUpdateTripDescription,
}: {
    trip: Trip;
    isEditingTrip: {
        name: boolean;
        description: boolean;
        dates: boolean;
    };
    setIsEditingTrip: React.Dispatch<React.SetStateAction<{
        name: boolean;
        description: boolean;
        dates: boolean;
    }>>;
    editedTrip: Partial<Trip>;
    setEditedTrip: React.Dispatch<React.SetStateAction<Partial<Trip>>>;
    onRenameTrip: (newName: string) => void;
    onUpdateTripDates: (newDates: { start_date: string, end_date: string }) => void;
    onUpdateTripDescription: (newDescription: string) => void;
}) {
    return (
        <section>
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
                        className="text-2xl sm:text-3xl font-bold w-full bg-transparent border-b border-primary outline-none focus:border-primary-hover"
                        autoFocus
                    />
                ) : (
                    <h1 
                        onClick={() => setIsEditingTrip(prev => ({ ...prev, name: true }))}
                        className="text-2xl sm:text-3xl font-bold cursor-text hover:text-primary transition-colors"
                    >
                        {trip.name}
                    </h1>
                )}
            </div>

            {/* Trip dates */}
            <div className="mb-4">
                {isEditingTrip.dates ? (
                    <div className="inline-flex items-center gap-3 px-3 py-2 rounded-xl bg-tertiary/60">
                        <input
                            type="date"
                            value={editedTrip.start_date}
                            onChange={(e) => setEditedTrip(prev => ({ ...prev, start_date: e.target.value }))}
                            onBlur={() => onUpdateTripDates({ start_date: editedTrip.start_date as string, end_date: editedTrip.end_date as string })}
                            className="bg-transparent border-b border-primary outline-none focus:border-primary-hover text-sm"
                        />
                        <span className="text-secondary text-sm">to</span>
                        <input
                            type="date"
                            value={editedTrip.end_date}
                            onChange={(e) => setEditedTrip(prev => ({ ...prev, end_date: e.target.value }))}
                            onBlur={() => onUpdateTripDates({ start_date: editedTrip.start_date as string, end_date: editedTrip.end_date as string })}
                            className="bg-transparent border-b border-primary outline-none focus:border-primary-hover text-sm"
                        />
                    </div>
                ) : (
                    <button 
                        type="button"
                        onClick={() => setIsEditingTrip(prev => ({ ...prev, dates: true }))}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tertiary/60 text-xs sm:text-sm text-secondary hover:bg-tertiary-hover hover:text-foreground transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v11.25A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75zm3.75-9h13.5" />
                        </svg>
                        <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                    </button>
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
                    className="w-full bg-tertiary/50 border border-tertiary rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary-hover focus:bg-background resize-none min-h-[70px]"
                    placeholder="Add a description..."
                    autoFocus
                />
            ) : (
                <p 
                    onClick={() => setIsEditingTrip(prev => ({ ...prev, description: true }))}
                    className="text-sm text-secondary cursor-text hover:text-secondary-hover transition-colors"
                >
                    {trip.description || 'Add a description...'}
                </p>
            )}
        </section>
    );
}

// Presentational component: renders the editable packing list within the trip editor.
function EditablePackingListSection({
    trip,
    packingList,
    onAddItem,
    onUpdateItemQuantity,
    onUpdateItemNotes,
    onRenameItem,
    onDeleteItem,
}: {
    trip: Trip;
    packingList: Partial<Item>[];
    onAddItem: (newItem: Item) => void;
    onUpdateItemQuantity: (itemName: string, newQuantity: number) => void;
    onUpdateItemNotes: (itemName: string, newNotes: string) => void;
    onRenameItem: (itemName: string, newName: string) => void;
    onDeleteItem: (itemName: string) => void;
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">Packing list</h2>
                    <p className="text-xs text-secondary mt-1">
                        {packingList.length} {packingList.length === 1 ? 'item' : 'items'}
                    </p>
                </div>
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
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-xs font-medium text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
                    aria-label="Add item"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Add item</span>
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
        </section>
    );
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
        <div className={`h-full border-r border-tertiary/60 bg-background/80 overflow-hidden ${className}`}>
            <div className="h-full flex flex-col">
                {/* Top action bar */}
                <EditableTripActionBar
                    onCancel={onCancel}
                    onConfirm={onConfirm}
                />

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
                    <div className="max-w-2xl mx-auto space-y-8">
                        {/* Trip details */}
                        <EditableTripDetailsSection
                            trip={trip}
                            isEditingTrip={isEditingTrip}
                            setIsEditingTrip={setIsEditingTrip}
                            editedTrip={editedTrip}
                            setEditedTrip={setEditedTrip}
                            onRenameTrip={onRenameTrip}
                            onUpdateTripDates={onUpdateTripDates}
                            onUpdateTripDescription={onUpdateTripDescription}
                        />

                        {/* Packing list */}
                        <EditablePackingListSection
                            trip={trip}
                            packingList={packingList}
                            onAddItem={onAddItem}
                            onUpdateItemQuantity={onUpdateItemQuantity}
                            onUpdateItemNotes={onUpdateItemNotes}
                            onRenameItem={onRenameItem}
                            onDeleteItem={onDeleteItem}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}