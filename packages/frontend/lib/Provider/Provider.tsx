'use client';

import dynamic from 'next/dynamic';
import Loader from '@/components/Layouts/Loader';

const PageProvider = dynamic(() => import('@/components/Layouts/PageLayout'), {
    ssr: false,
    loading: () => <Loader />,
});


export default function MainProvider({ children }: { children: React.ReactNode }) {
  return <PageProvider>{children}</PageProvider>;
}