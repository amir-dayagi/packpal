'use client'

import { Item } from "@/app/types/item";
import { useRouter } from "next/navigation";
import PackingListItem from "./PackingListItem";
import { UseMutationResult } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";

type PackingListProps = {
    tripId?: number;
    packingList?: Item[];
    onCreate: () => void;
    updateItem: UseMutationResult<Response, Error, Partial<Item> & {
        id: number;
    }, {
        previousPackingList: unknown;
    }>;
    setItemToDelete: Dispatch<SetStateAction<Item | null>>
};

export default function PackingList(props: PackingListProps) {
    const router = useRouter()
    const {
        tripId,
        packingList,
        onCreate,
        updateItem,
        setItemToDelete
    } = props;

    return (
        <section className="card">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                {/* Title */}
                <div>
                    <h2 className="text-2xl font-semibold text-foreground">Packing List</h2>
                    <p className="text-sm text-secondary mt-1">
                        {packingList?.length || 0} {packingList?.length === 1 ? 'item' : 'items'}
                    </p>
                </div>

                {/* Action Buttons */}
                {packingList?.length && packingList?.length > 0 ?
                (
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push(`/assistant?tripId=${tripId}`)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 transform hover:scale-105"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                            </svg>
                            <span>Refine with AI</span>
                        </button>
                        <button
                            onClick={onCreate}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 transform hover:scale-105"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span>Add Item</span>
                        </button>
                    </div>        
                ) : null}
            </div>

            {/* List Section */}
            <div className="space-y-3">
                {packingList?.length === 0 ? (
                    // Empty List Actions
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-hover/20 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                        </div>
                        <p className="text-lg font-medium text-foreground mb-2">No items yet</p>
                        <p className="text-secondary mb-6">Start building your packing list by adding items</p>
                        <button
                            onClick={onCreate}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 transform hover:scale-105"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span>Add Your First Item</span>
                        </button>
                        <br />
                        <br />
                        <button
                            onClick={() => router.push(`/assistant?tripId=${tripId}`)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 transform hover:scale-105"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                            </svg>
                            <span>Or Use AI To Help You Pack (Recommended)</span>
                        </button>
                    </div>
                ) : (
                    packingList?.map((item) => (
                        <PackingListItem
                            key={item.id}
                            item={item}
                            onQuantityUpdate={(quantity) => 
                                updateItem.mutate({ id: item.id, quantity })
                            }
                            onTogglePacked={() => 
                                updateItem.mutate({ 
                                    id: item.id, 
                                    is_packed: !item.is_packed 
                                })
                            }
                            onToggleReturning={() => 
                                updateItem.mutate({ 
                                    id: item.id, 
                                    is_returning: !item.is_returning 
                                })
                            }
                            onDelete={() => setItemToDelete(item)}
                            onNotesUpdate={(notes) => 
                                updateItem.mutate({ id: item.id, notes })
                            }
                            onNameUpdate={(name) =>
                                updateItem.mutate({ id: item.id, name })
                            }
                        />
                    ))
                )}
            </div>
        </section>
    );
}