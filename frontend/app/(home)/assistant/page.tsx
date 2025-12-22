'use client';

import { AssistantChatMessage, AssistantStartChatResponse, AssistantStreamedData } from '@/app/types/assistant';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useAuth } from '../../contexts/auth'
import { Trip } from '@/app/types/trip';
import { Item } from '@/app/types/item';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from '@/app/components/Modal';
import Loading from '@/app/loading';    
import EditableTripPage from '@/app/components/EditableTripPage';
import AssistantChat from '@/app/components/AssistantChat';

// Hook: manages the resizable split-view behavior between trip editor and chat.
function useSplitView(initialPercent: number = 55) {
    const [splitPercent, setSplitPercent] = useState<number>(initialPercent);
    const isDragging = useRef(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleMouseMove(e: MouseEvent) {
            if (!isDragging.current || !containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const rawPercent = (x / rect.width) * 100;

            // Cap between 35% and 65% so both sides remain usable
            const clamped = Math.min(65, Math.max(35, rawPercent));
            setSplitPercent(clamped);
        }

        function handleMouseUp() {
            if (!isDragging.current) return;
            isDragging.current = false;
            document.body.classList.remove('select-none', 'cursor-col-resize');
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startDragging = () => {
        isDragging.current = true;
        document.body.classList.add('select-none', 'cursor-col-resize');
    };

    return {
        splitPercent,
        containerRef,
        startDragging,
    };
}

// Presentational component: renders the assistant page header.
function AssistantHeader({ editedTrip }: { editedTrip: Trip | null }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">PackPal Assistant</h1>
                <p className="text-sm text-secondary mt-1">
                    Refine your trip plan and packing list with AI in real-time.
                </p>
            </div>
            {editedTrip && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border border-tertiary/60 text-xs text-secondary">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>Editing trip:</span>
                    <span className="font-medium text-foreground truncate max-w-[180px]">
                        {editedTrip.name}
                    </span>
                </div>
            )}
        </div>
    );
}

// Presentational component: renders the draggable split view between the editable trip and assistant chat.
function AssistantSplitView({
    containerRef,
    splitPercent,
    editedTrip,
    editedPackingList,
    setIsCancelModal,
    setIsConfirmModal,
    setEditedTrip,
    setEditedPackingList,
    chatMessages,
    isStreaming,
    setChatMessages,
    callAssistant,
    startDragging,
}: {
    containerRef: React.RefObject<HTMLDivElement | null>;
    splitPercent: number;
    editedTrip: Trip | null;
    editedPackingList: Partial<Item>[];
    setIsCancelModal: (value: boolean) => void;
    setIsConfirmModal: (value: boolean) => void;
    setEditedTrip: React.Dispatch<React.SetStateAction<Trip | null>>;
    setEditedPackingList: React.Dispatch<React.SetStateAction<Partial<Item>[]>>;
    chatMessages: AssistantChatMessage[];
    isStreaming: boolean;
    setChatMessages: React.Dispatch<React.SetStateAction<AssistantChatMessage[]>>;
    callAssistant: (userMessage: string) => void;
    startDragging: () => void;
}) {
    return (
        <div
            ref={containerRef}
            className="flex-1 flex min-h-0 rounded-2xl border border-tertiary/50 bg-background/60 backdrop-blur-sm shadow-lg overflow-hidden"
        >
            {/* Left: Editable trip */}
            <div
                className="h-full min-w-[35%] max-w-[65%] transition-[flex-basis] duration-200 ease-out"
                style={{ flexBasis: `${splitPercent}%` }}
            >
                <EditableTripPage
                    className="h-full"
                    trip={editedTrip!}
                    packingList={editedPackingList}
                    onCancel={() => setIsCancelModal(true)}
                    onConfirm={() => setIsConfirmModal(true)}
                    onRenameTrip={(newName) => setEditedTrip(prev => prev ? { ...prev, name: newName } : null)}
                    onUpdateTripDates={(newDates) => setEditedTrip(prev => prev ? { ...prev, start_date: newDates.start_date, end_date: newDates.end_date } : null)}
                    onUpdateTripDescription={(newDescription) => setEditedTrip(prev => prev ? { ...prev, description: newDescription } : null)}
                    onAddItem={(newItem) => setEditedPackingList(prev => [...prev, newItem])}
                    onUpdateItemQuantity={(itemName, newQuantity) => setEditedPackingList(prev => prev.map(item => item.name === itemName ? { ...item, quantity: newQuantity } : item))}
                    onUpdateItemNotes={(itemName, newNotes) => setEditedPackingList(prev => prev.map(item => item.name === itemName ? { ...item, notes: newNotes } : item))}
                    onRenameItem={(itemName, newName) => setEditedPackingList(prev => prev.map(item => item.name === itemName ? { ...item, name: newName } : item))}
                    onDeleteItem={(itemName) => setEditedPackingList(prev => prev.filter(item => item.name !== itemName))}
                />
            </div>

            {/* Drag handle */}
            <div
                className="relative w-2 flex-shrink-0 cursor-col-resize group"
                onMouseDown={startDragging}
            >
                <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-0.5 bg-tertiary group-hover:bg-primary/60 transition-colors" />
                <div className="absolute inset-y-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-6 h-10 rounded-full bg-background/90 border border-tertiary/60 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-0.5 h-5 bg-tertiary/80 rounded-full" />
                </div>
            </div>

            {/* Right: Assistant chat */}
            <div
                className="h-full min-w-[35%] max-w-[65%] border-l border-tertiary/40 bg-background/80 transition-[flex-basis] duration-200 ease-out"
                style={{ flexBasis: `${100 - splitPercent}%` }}
            >
                <AssistantChat
                    className="h-full"
                    messages={chatMessages}
                    isStreaming={isStreaming}
                    onSendMessage={(message) => {
                        setChatMessages(prev => [...(prev || []), { role: 'user', content: message }]);
                        callAssistant(message);
                    }}
                />
            </div>
        </div>
    );
}

export default function AssistantPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [trip, setTrip] = useState<Trip | null>(null);
    const [editedTrip, setEditedTrip] = useState<Trip | null>(null);
    const [packingList, setPackingList] = useState<Partial<Item>[]>([]);
    const [editedPackingList, setEditedPackingList] = useState<Partial<Item>[]>([]);
    const [chatMessages, setChatMessages] = useState<AssistantChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [isCancelModal, setIsCancelModal] = useState<boolean>(false);
    const [isConfirmModal, setIsConfirmModal] = useState<boolean>(false);
    
    const router = useRouter();

    const { session } = useAuth();
    const searchParams = useSearchParams();
    const tripId = Number(searchParams.get('tripId'));

    useEffect(() => {
        setIsLoading(true);
        if (session && tripId) {
            // Fetch trip
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/${tripId}`, {
                headers: {
                    'Authorization': `Bearer ${session}`
                }
            })
            .then(response => response.json())
            .then(data => {
                setTrip(data.trip);
                setEditedTrip(data.trip);
            })
            .catch(error => console.error('Error fetching trip:', error));

            // Fetch packing list
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/${tripId}/packing-list`, {
                headers: {
                    'Authorization': `Bearer ${session}`
                }
            })
            .then(response => response.json())
            .then(data => {
                setPackingList(data.packing_list);
                setEditedPackingList(data.packing_list);
            })
            .catch(error => console.error('Error fetching packing list:', error));

            // Fetch chat history
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/chat-history/${tripId}`, {
                headers: {
                    'Authorization': `Bearer ${session}`
                }
            })
            .then(response => response.json())
            .then(data => setChatMessages(data.chat_history))
            .catch(error => console.error('Error fetching chat messages:', error));
        }
        setIsLoading(false);
    }, [session, tripId]);

    const { splitPercent, containerRef, startDragging } = useSplitView(55);

    
    function callAssistant(userMessage: string) {
        function handleAssistantResponse(data: AssistantStreamedData) {
            if (data.message.role === 'assistant' && data.message.content) {
                setChatMessages(prev => [...(prev || []), data.message]);
            } else if (data.message.role === 'tool') {            
                setEditedTrip(data.trip as Trip);
                setEditedPackingList(data.packing_list as Item[]);
            }
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session}`
            },
            body: JSON.stringify({
                message: userMessage,
                trip: editedTrip,
                packing_list: editedPackingList
            })
        })
        .then(async response => {
            if (response.ok) {
                const data: AssistantStartChatResponse = await response.json();
                const assistantProcessId = data.assistant_process_id;
                const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/assistant?assistant_process_id=${assistantProcessId}`);
                setIsStreaming(true);
    
                eventSource.onmessage = (event) => {
                    const parsedData: AssistantStreamedData = JSON.parse(event.data);
                    if (parsedData.done) {
                        eventSource.close();
                        setIsStreaming(false);
                        return;
                    }
                    
                    handleAssistantResponse(parsedData);
                };
    
                eventSource.onerror = (err) => {
                    console.error('Assistant stream error:', err);
                    eventSource.close();
                    setIsStreaming(false);
                };
            } else {
                console.error('Failed to create assistant process:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Failed to create assistant process:', error);
        })
    }

    function onConfirmEdits() {
        if (!editedTrip || !editedPackingList) {
            setIsConfirmModal(false);
            console.error('No trip or packing list to update');
            return;
        }
        
        // Close confirm modal and start loading
        setIsConfirmModal(false);
        setIsLoading(true);

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/accept-changes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session}`
            },
            body: JSON.stringify({
                trip: editedTrip,
                packing_list: editedPackingList
            })
        })
        .then(response => {
            if (response.ok) {
                router.push(`/trip?tripId=${editedTrip.id}`);
            } else {
                console.error('Failed to confirm changes:' + response.statusText);
            }
        })
        .catch(error => {
            console.error('Error confirming changes:' + error);
            
        });
        setIsLoading(false);
    }

    if (isLoading || editedTrip === null) {
        return <Loading/>
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-background via-background to-tertiary/20">
            <div className="h-full w-full px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
                {/* Header */}
                <AssistantHeader editedTrip={editedTrip} />

                {/* Split view container */}
                <AssistantSplitView
                    containerRef={containerRef}
                    splitPercent={splitPercent}
                    editedTrip={editedTrip}
                    editedPackingList={editedPackingList}
                    setIsCancelModal={setIsCancelModal}
                    setIsConfirmModal={setIsConfirmModal}
                    setEditedTrip={setEditedTrip}
                    setEditedPackingList={setEditedPackingList}
                    chatMessages={chatMessages}
                    isStreaming={isStreaming}
                    setChatMessages={setChatMessages}
                    callAssistant={callAssistant}
                    startDragging={startDragging}
                />
            </div>
            <Modal isOpen={isCancelModal} onClose={() => setIsCancelModal(false)} title="Cancel Edits?">
                <div className="space-y-4">
                    <p className="text-secondary">
                        Are you sure you want to cancel these changes? These changes will be lost.
                    </p>
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => setIsConfirmModal(false)}
                            className="px-4 py-2 text-secondary hover:cursor-pointer hover:text-secondary-hover transition-colors"
                        >
                            Continue Editing
                        </button>
                        <button
                            onClick={onConfirmEdits}
                            className="px-4 py-2 bg-primary text-background rounded-lg hover:cursor-pointer hover:bg-primary-hover transition-colors"
                        >
                            Cancel Edits
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isConfirmModal} onClose={() => setIsConfirmModal(false)} title="Confirm Edits?">
                <div className="space-y-4">
                    <p className="text-secondary">
                        Are you sure you want to confirm these changes? This will update your trip and packing list.
                    </p>
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => setIsConfirmModal(false)}
                            className="px-4 py-2 text-secondary hover:cursor-pointer hover:text-secondary-hover transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirmEdits}
                            className="px-4 py-2 bg-primary text-background rounded-lg hover:cursor-pointer hover:bg-primary-hover transition-colors"
                        >
                            Confirm Changes
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}