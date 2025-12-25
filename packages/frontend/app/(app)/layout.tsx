'use client';

import ReduxProvider from "@/lib/redux/reduxProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ReduxProvider>{children}</ReduxProvider>;
}
