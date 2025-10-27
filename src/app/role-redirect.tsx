"use client"
import { useEdenMarketBackend } from '@/contexts/backend';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RoleRedirect({ children }: { children: React.ReactNode }) {
  const { user } = useEdenMarketBackend();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === 'cashier') {
        router.replace('/cashier');
      } else if (user.role === 'courier') {
        router.replace('/courier');
      }
    }
  }, [user, router]);

  return <>{children}</>;
}
