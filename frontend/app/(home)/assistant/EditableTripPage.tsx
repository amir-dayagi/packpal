import { useEffect, useRef, useState } from "react";

import { Trip } from "@/app/types/trip";
import { Item } from "@/app/types/item";
import { formatDate } from "@/app/utils/date";
import GradientButton from "@/app/components/GradientButton";





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
                <GradientButton
                    onClick={onConfirm}
                    size="sm"
                    className="px-4 py-2"
                >
                    Confirm Changes
                </GradientButton>
            </div>
        </div>
    );
}

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
                        onBlur={() => {
                            onRenameTrip(editedTrip.name as string);
                            setIsEditingTrip(prev => ({...prev, name: false}))
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onRenameTrip(editedTrip.name as string);
                            if (e.key === 'Escape') {
                                setEditedTrip(prev => ({ ...prev, name: trip.name }));
                                setIsEditingTrip(prev => ({ ...prev, name: false }));
                            }
                        }}
                        className="text-2xl sm:text-3xl font-bold w-full bg-transparent border-b border-primary outline-none focus:border-primary-hover text-foreground"
                        autoFocus
                    />
                ) : (
                    <h1 
                        onClick={() => setIsEditingTrip(prev => ({ ...prev, name: true }))}
                        className="text-2xl sm:text-3xl font-bold cursor-text hover:text-primary transition-colors text-foreground"
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
                            onBlur={() => {
                                onUpdateTripDates({ start_date: editedTrip.start_date as string, end_date: editedTrip.end_date as string })
                                setIsEditingTrip(prev => ({...prev, dates:false}))
                            }}
                            className="bg-transparent border-b border-primary outline-none focus:border-primary-hover text-sm text-foreground"
                            autoFocus
                        />
                        <span className="text-secondary text-sm">to</span>
                        <input
                            type="date"
                            value={editedTrip.end_date}
                            onChange={(e) => setEditedTrip(prev => ({ ...prev, end_date: e.target.value }))}
                            onBlur={() => {
                                onUpdateTripDates({ start_date: editedTrip.start_date as string, end_date: editedTrip.end_date as string })
                                setIsEditingTrip(prev => ({...prev, dates:false}))
                            }}
                            className="bg-transparent border-b border-primary outline-none focus:border-primary-hover text-sm text-foreground"
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
                    onBlur={() => {
                        onUpdateTripDescription(editedTrip.description as string)
                        setIsEditingTrip(prev => ({ ...prev, description: false }));
                    }}
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
                <GradientButton
                    onClick={() => {
                        const newItem: Partial<Item> = {
                            trip_id: trip?.id,
                            name: '',
                            quantity: 1,
                            notes: '',
                        };
                        onAddItem(newItem as Item);
                    }}
                    size="sm"
                    aria-label="Add item"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Add item</span>
                </GradientButton>
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

interface EditablePackingListItemProps {
    item: Partial<Item>
    onQuantityUpdate: (quantity: number) => void
    onDelete: () => void
    onNotesUpdate: (notes: string) => void
    onNameUpdate: (name: string) => void
}

function EditablePackingListItem({ 
    item, 
    onQuantityUpdate,
    onDelete,
    onNotesUpdate,
    onNameUpdate
}: EditablePackingListItemProps) {
    const [isEditing, setIsEditing] = useState(item.name === '')
    const [editedName, setEditedName] = useState(item.name || '')
    const [isEditingNotes, setIsEditingNotes] = useState(false)
    const [editedNotes, setEditedNotes] = useState(item.notes || '')
    const inputRef = useRef<HTMLInputElement>(null)
    const notesRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    useEffect(() => {
        if (isEditingNotes && notesRef.current) {
            notesRef.current.focus()
            notesRef.current.select()
        }
    }, [isEditingNotes])

    const handleNameSubmit = () => {
        if (editedName.trim() !== '' && editedName.trim() !== item.name) {
            onNameUpdate(editedName.trim())
            setIsEditing(false)
        }
    }

    const handleNotesSubmit = () => {
        if (editedNotes.trim() !== item.notes) {
            onNotesUpdate(editedNotes.trim())
        }
        setIsEditingNotes(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent, type: 'name' | 'notes') => {
        if (e.key === 'Enter' && type === 'name') {
            handleNameSubmit()
        } else if (e.key === 'Enter' && e.metaKey && type === 'notes') {
            handleNotesSubmit()
        } else if (e.key === 'Escape') {
            if (type === 'name') {
                setEditedName(item.name || '')
                setIsEditing(false)
            } else {
                setEditedNotes(item.notes || '')
                setIsEditingNotes(false)
            }
        }
    }

    return (
        <div className="space-y-1 bg-tertiary rounded-lg p-4">
            <div className="flex items-center gap-4">
                {/* Item name */}
                <div className="flex-1 font-medium">
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, 'name')}
                            onBlur={handleNameSubmit}
                            className="w-full bg-transparent border-b border-primary outline-none focus:border-primary-hover text-foreground"
                        />
                    ) : (
                        <div 
                            onClick={() => setIsEditing(true)}
                            className="cursor-text hover:text-secondary transition-colors text-foreground"
                        >
                            {item.name || ''}
                        </div>
                    )}
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onQuantityUpdate((item.quantity || 1) - 1)}
                        className="w-8 h-8 flex items-center justify-center text-secondary hover:cursor-pointer hover:text-secondary-hover transition-colors"
                        aria-label="Decrease quantity"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                        </svg>
                    </button>
                    <span className="w-8 text-center text-foreground">{item.quantity || 1}</span>
                    <button
                        onClick={() => onQuantityUpdate((item.quantity || 1) + 1)}
                        className="w-8 h-8 flex items-center justify-center text-secondary hover:cursor-pointer hover:text-secondary-hover transition-colors"
                        aria-label="Increase quantity"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>

                {/* Delete button */}
                <button
                    onClick={onDelete}
                    className="w-8 h-8 flex items-center justify-center text-secondary hover:cursor-pointer hover:text-red-500 transition-colors"
                    aria-label="Delete item"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </button>
            </div>

            {/* Notes section */}
            <div className="px-4 py-2">
                {isEditingNotes ? (
                    <textarea
                        ref={notesRef}
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'notes')}
                        onBlur={handleNotesSubmit}
                        className="w-full bg-transparent border-b border-primary outline-none focus:border-primary-hover text-sm min-h-[60px] resize-none text-secondary"
                        placeholder="Add notes..."
                    />
                ) : (
                    <div 
                        onClick={() => setIsEditingNotes(true)}
                        className="text-sm text-secondary hover:text-secondary-hover cursor-pointer"
                    >
                        {item.notes || 'Add notes...'}
                    </div>
                )}
            </div>
        </div>
    )
} 

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

export default function EditableTripPage(props: EditableTripPageProps) {
    const {
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
    } = props;

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