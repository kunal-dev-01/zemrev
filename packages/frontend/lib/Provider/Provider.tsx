'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/Layouts/Spinner';

const AppProvider = dynamic(() => import('@/lib/redux/reduxProvider'), {
    loading: () => <div className="w-full h-screen flex items-center justify-center">
      <Spinner />
    </div>,
});


export default function MainProvider({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}