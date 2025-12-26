'use client'

import { Trip } from "@/app/types/trip";
import { formatDate } from "@/app/utils/date";

type TripHeaderProps = {
    trip?: Trip;
    onEdit: () => void;
    onDelete: () => void;
};

export default function TripHeader(props: TripHeaderProps) {
    const {
        trip,
        onEdit,
        onDelete
    } = props;

    return (
        <div className="card">
            <div className="flex items-start justify-between">
                {/* Trip Data */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary-hover/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{trip?.name || ""}</h1>
                            <div className="flex items-center gap-2 mt-2 text-sm text-secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-9-9h.008v.008H12V9.75z" />
                                </svg>
                                <span>{formatDate(trip?.start_date || "")} - {formatDate(trip?.end_date || "")}</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-secondary leading-relaxed">{trip?.description || ""}</p>
                </div>

                {/* Edit and Delete Buttons */}
                <div className="flex gap-2 ml-4">
                    <button
                        onClick={onEdit}
                        className="p-2.5 rounded-xl text-secondary hover:text-foreground hover:bg-tertiary/50 transition-all duration-200"
                        aria-label="Edit trip"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2.5 rounded-xl text-secondary hover:text-red-600 hover:bg-red-50/50 transition-all duration-200"
                        aria-label="Delete trip"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}