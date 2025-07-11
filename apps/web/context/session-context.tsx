"use client";

import { createContext, useContext, ReactNode } from "react";

interface SessionContextType {
  userId: string;
  org: string;
  email: string;
  name: string;
  image: string | null | undefined;
  role: string;
  orgName: string;
  memberId: string;
  token: string;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({
  children,
  sessionData,
}: {
  children: ReactNode;
  sessionData: SessionContextType;
}) {
  return (
    <SessionContext.Provider value={sessionData}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
