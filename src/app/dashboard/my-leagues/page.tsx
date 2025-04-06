"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyLeaguesPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main leagues page
    router.replace("/dashboard/leagues");
  }, [router]);
  
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p className="text-muted-foreground">Redirecting to leagues page...</p>
    </div>
  );
}