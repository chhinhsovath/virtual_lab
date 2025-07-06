'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateModulePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new simulation creation page
    router.replace('/dashboard/simulations/new');
  }, [router]);

  return null;
}