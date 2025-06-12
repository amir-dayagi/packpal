'use client'

import { useState } from 'react'
import { TripRequest } from '../../types/trip'

interface CreateTripFormProps {
    onClose: () => void;
    onCreate: (trip: TripRequest) => void;
}

export default function CreateTripForm({ onClose, onCreate }: CreateTripFormProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        onCreate({
            name,
            description: description || undefined,
            start_date: startDate,
            end_date: endDate
        });
        setIsLoading(false);
        onClose();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Trip Name*
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-lg border-0 bg-tertiary p-3 placeholder:text-secondary"
                    placeholder="Summer Vacation 2024"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border-0 bg-tertiary p-3 placeholder:text-secondary"
                    placeholder="A brief description of your trip..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                        Start Date*
                    </label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="w-full rounded-lg border-0 bg-tertiary p-3"
                    />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                        End Date*
                    </label>
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        required
                        className="w-full rounded-lg border-0 bg-tertiary p-3"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-secondary hover:text-secondary-hover transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Creating...' : 'Create Trip'}
                </button>
            </div>
        </form>
    )
} 