'use client';

import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import AssessmentForm from '@/app/components/AssessmentForm';
import '../../styles/assess.css';

export default function AssessPage() {
  return (
    <div className="assess-page">
      <SignedIn>
        <div className="assess-container">
          <AssessmentForm />
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}