"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SessionLogger() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") 
      console.log("Session từ client:", session);
      // In ra role, id
      console.log("User ID:", session.user?.id);
      console.log("User Role:", session.user?.role);
    
  }, [session, status]);

  return null;
}
