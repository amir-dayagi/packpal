'use client'

import { useEffect, useState } from 'react'
import { UpdateTripRequest } from '@/app_old/types/trip';
import { useTrip } from '@/app_old/hooks/useTrip';
import FormModal from '@/app_old/components/common/FormModal';


interface EditTripModalProps {
    onClose: () => void
    tripId: number
};

export default function EditTripModal({ onClose, tripId }: EditTripModalProps) {
    const { trip, updateTrip } = useTrip(tripId)
    const [name, setName] = useState(trip.name)
    const [description, setDescription] = useState(trip.description)
    const [startDate, setStartDate] = useState(trip.startDate.split('T')[0])
    const [endDate, setEndDate] = useState(trip.endDate.split('T')[0])
    const [isLoading, setIsLoading] = useState(false);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const request: UpdateTripRequest = {
            tripId,
            updates: {
                name,
                description,
                startDate,
                endDate
            }
        }
        updateTrip(request)
        setIsLoading(false)
        onClose()
    };

    return (
        <FormModal
            onClose={onClose}
            title="Edit Trip"
            submitText="Update Trip"
            isLoading={isLoading}
            handleSubmit={handleSubmit}
        >
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Trip Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-secondary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-tertiary/50 ring-1 ring-inset ring-border placeholder:text-secondary text-foreground focus:ring-2 focus:ring-primary focus:bg-background transition-all duration-200 outline-none"
                        placeholder="Where are you going?"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Description <span className="text-secondary text-xs font-normal">(Optional)</span>
                </label>
                <div className="relative">
                    <div className="absolute top-4 left-4 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-secondary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21h-4.5A2.25 2.25 0 019 18.75V14.25m9-3.75h-2.25m-2.25 0h-2.25m-2.25 0H9m0 0v2.25m0-2.25v-2.25m0 0H6.75m2.25 0H9" />
                        </svg>
                    </div>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="block w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-tertiary/50 ring-1 ring-inset ring-border placeholder:text-secondary text-foreground focus:ring-2 focus:ring-primary focus:bg-background transition-all duration-200 outline-none resize-none"
                        placeholder="Add any notes about your trip..."
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-foreground mb-2">
                        Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-secondary">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-9-9h.008v.008H12V9.75z" />
                            </svg>
                        </div>
                        <input
                            type="date"
                            id="start_date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={new Date().toJSON().slice(0, 10)}
                            className="block w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-tertiary/50 ring-1 ring-inset ring-border text-foreground focus:ring-2 focus:ring-primary focus:bg-background transition-all duration-200 outline-none"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-foreground mb-2">
                        End Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-secondary">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-9-9h.008v.008H12V9.75z" />
                            </svg>
                        </div>
                        <input
                            type="date"
                            id="end_date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                            className="block w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-tertiary/50 ring-1 ring-inset ring-border text-foreground focus:ring-2 focus:ring-primary focus:bg-background transition-all duration-200 outline-none"
                            required
                        />
                    </div>
                </div>
            </div>


        </FormModal>
    );
} 