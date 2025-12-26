import { AssistantChatMessage } from "@/app/types/assistant";
import { Item } from "@/app/types/item";
import { Trip } from "@/app/types/trip";
import EditableTripPage from "./EditableTripPage";
import ChatPage from "./ChatPage";

type SplitViewProps = {
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
};

export default function SplitView(props: SplitViewProps) {
    const {
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
    } = props;
    
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
                <ChatPage
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