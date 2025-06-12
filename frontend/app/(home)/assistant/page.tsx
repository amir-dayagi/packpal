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
        <div className='flex min-h-screen max-h-screen overflow-hidden'>
            <EditableTripPage
                className="flex-2"
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
            

            <AssistantChat
                className="flex-1"
                messages={chatMessages}
                isStreaming={isStreaming}
                onSendMessage={(message) => {
                    setChatMessages(prev => [...(prev || []), { role: 'user', content: message }]);
                    callAssistant(message);
                }}
            />
            
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