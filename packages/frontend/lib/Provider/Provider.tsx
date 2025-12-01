'use client';

import dynamic from 'next/dynamic';
import Loader from '@/components/Layouts/Loader';

const AppProvider = dynamic(() => import('@/lib/redux/reduxProvider'), {
    ssr: false,
    loading: () => <Loader />,
});


export default function MainProvider({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}