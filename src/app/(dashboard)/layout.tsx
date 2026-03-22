import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReactNode, Suspense } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

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
