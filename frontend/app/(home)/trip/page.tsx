"use client"

import dynamic from 'next/dynamic';
import Loading from '@/app/loading';

const TripPage = dynamic(
    () => import('@/components/trip/TripPage'),
    {
        ssr: false,
        loading: () => <Loading />
    }
);

export default function Page() {
    return <TripPage />;
}