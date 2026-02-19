"use client"

import dynamic from 'next/dynamic';
import Loading from '@/app/loading';

const DashboardPage = dynamic(
    () => import('@/components/dashboard/DashboardPage'),
    {
        ssr: false,
        loading: () => <Loading />
    },
);

export default function Page() {
    return <DashboardPage />;
}