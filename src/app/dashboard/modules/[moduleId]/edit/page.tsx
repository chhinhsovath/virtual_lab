'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function EditModulePage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;

  useEffect(() => {
    // Redirect to the simulation edit page with the same ID
    router.replace(`/dashboard/simulations/${moduleId}/edit`);
  }, [router, moduleId]);

  return null;
}