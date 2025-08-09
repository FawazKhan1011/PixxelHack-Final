"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      const hasTaken = localStorage.getItem(`hasTakenAssessment_${user.id}`);

      if (!hasTaken) {
        router.replace("/assessment");
      } else {
        router.replace("/dashboard");
      }
    } else {
      router.replace("/sign-in");
    }
  }, [user, isLoaded, router]);

  return null; // Optional: add loading spinner here
}
