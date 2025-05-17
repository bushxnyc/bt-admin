"use client";

import { Suspense } from "react";
import CustomerDashboard from "@/components/customer-dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useQueryState } from "nuqs";

export default function Home() {
  const [username, setUsername] = useQueryState("username", { defaultValue: "" });
  const [firstName, setFirstName] = useQueryState("firstName", { defaultValue: "" });
  const [lastName, setLastName] = useQueryState("lastName", { defaultValue: "" });
  const [email, setEmail] = useQueryState("email", { defaultValue: "" });

  const clearForm = () => {
    setUsername("");
    setFirstName("");
    setLastName("");
    setEmail("");
  };

  return (
    <main className="container mx-auto px-4 py-6 space-y-8 min-h-screen bg-background">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
        <p className="text-muted-foreground">Search, view, and update your streaming service customers</p>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* First row - First Name and Last Name (always on same row) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder=""
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder=""
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder=""
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder=""
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                }}
              />
            </div>

            {/* Second row - Username and Email (always on same row) */}

            {/* Second row - Username and Email (always on same row) */}
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="flex items-center gap-2" onClick={clearForm}>
              Clear
            </Button>
          </div>
        </form>
      </div>

      <Suspense fallback={<CustomerListSkeleton />}>
        <CustomerDashboard username={username} firstName={firstName} lastName={lastName} email={email} />
      </Suspense>
    </main>
  );
}

function CustomerListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-muted/30 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-muted/30 rounded animate-pulse"></div>
      </div>
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-6 w-40 bg-muted/30 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-muted/30 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-4 w-full bg-muted/30 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-muted/30 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-muted/30 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
    </div>
  );
}
