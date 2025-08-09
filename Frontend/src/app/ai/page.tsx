'use client';

import { Suspense } from 'react';
import ChatClient from './ChatClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatClient />
    </Suspense>
  );
}