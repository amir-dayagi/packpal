import { useState } from 'react'
import { Trip, TripRequest } from '@/app/types/trip';


interface TripFormProps {
    onSubmit: (trip: TripRequest) => void
    onCancel: () => void
    initialData?: Trip
}

export default function TripForm({ onSubmit, onCancel, initialData }: TripFormProps) {
    const [name, setName] = useState(initialData?.name || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [startDate, setStartDate] = useState(initialData?.start_date.split('T')[0] || '')
    const [endDate, setEndDate] = useState(initialData?.end_date.split('T')[0] || '')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            name,
            description: description || "",
            start_date: startDate,
            end_date: endDate
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Trip Name
                </label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border-0 bg-tertiary p-3 placeholder:text-secondary"
                    placeholder="Where are you going?"
                    required
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description (Optional)
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border-0 bg-tertiary p-3 placeholder:text-secondary"
                    placeholder="Add any notes about your trip..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start_date" className="block text-sm font-medium mb-1">
                        Start Date
                    </label>
                    <input
                        type="date"
                        id="start_date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-lg border-0 bg-tertiary p-3"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="end_date" className="block text-sm font-medium mb-1">
                        End Date
                    </label>
                    <input
                        type="date"
                        id="end_date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        className="w-full rounded-lg border-0 bg-tertiary p-3"
                        required
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-secondary hover:text-secondary-hover transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                    {initialData ? 'Save Changes' : 'Create Trip'}
                </button>
            </div>
        </form>
    )
} 