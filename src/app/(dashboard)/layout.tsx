import { UserButton } from "@clerk/nextjs";
import { ReactNode, Suspense } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="flex justify-end items-center p-4 gap-4 h-16">
        <UserButton />
      </header>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        {children}
      </Suspense>
    </>
  );
}
