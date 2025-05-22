"use client";

import { Check, ChevronLeft, ChevronRight, Clock, Copy, Mail } from "lucide-react";
import { useEffect, useState } from "react";

// Add Popover components to imports
import CustomerDetail from "@/components/customer-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { searchUsers, updateCustomer } from "@/lib/actions";
import { Customer, MembershipStatus } from "@/lib/types";
import { formatExactDateTime, formatTimeAgo } from "@/lib/utils";
import { toast } from "sonner";

export default function CustomerDashboard({
  username,
  firstName,
  lastName,
  email,
  page,
  setPageAction,
}: {
  page: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  setPageAction: (page: string) => void;
}) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Fetch customers when search params change
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const { customers, total } = await searchUsers({
          username,
          firstName,
          lastName,
          email,
          page: parseInt(page),
        });
        setTotal(total);
        setCustomers(customers || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [username, firstName, lastName, email, page]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleCustomerUpdate = async (updatedCustomer: Customer) => {
    // In a real app, this would update the database
    const updateResponse = await updateCustomer(updatedCustomer);

    // Close the dialog
    setIsDetailOpen(false);

    toast(updateResponse?.toString(), {
      onAutoClose: () => {
        location.reload();
      },
      duration: 4000,
    });
  };

  const getStatusBadge = (status: boolean) => {
    switch (status) {
      case false:
        return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Enabled</Badge>;
      case true:
        return (
          <Badge variant="destructive" className="bg-red-700 text-red-200 hover:bg-red-500/30">
            Disabled
          </Badge>
        );
      default:
        return <Badge variant="secondary">Enabled</Badge>;
    }
  };

  const getSubscriptionStatusBadge = (status: MembershipStatus | "") => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-900 text-green-300 hover:bg-blue-500/30 rounded-full">Active</Badge>;
      case "SUSPENDED":
        return <Badge className="bg-orange-900 text-orange-300 hover:bg-orange-500/30 rounded-full">Suspended</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-900 text-red-300 hover:bg-gray-500/30 rounded-full">Cancelled</Badge>;
      case "PENDING_CANCELLATION":
        return <Badge className="bg-yellow-900 text-yellow-300 hover:bg-gray-500/30 rounded-full">Pending Cancel</Badge>;
      default:
        return <div></div>;
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    if (!text) return;

    // Check if navigator.clipboard is supported
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedId(id);
          toast("Copied to clipboard");
          setTimeout(() => setCopiedId(null), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          // Fall back to alternate method
          fallbackCopyTextToClipboard(text, id);
        });
    } else {
      // Use fallback for browsers without clipboard API support
      fallbackCopyTextToClipboard(text, id);
    }
  };

  const fallbackCopyTextToClipboard = (text: string, id: string) => {
    try {
      // Create temporary textarea element
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Make the textarea out of viewport
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);

      // Focus and select the text
      textArea.focus();
      textArea.select();

      // Execute copy command
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        setCopiedId(id);
        toast("Copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        toast("Copy failed");
      }
    } catch (err) {
      console.error("Fallback: Failed to copy", err);
      toast("Copy failed");
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-4">Loading customers...</div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="text-sm text-center w-full text-muted-foreground">Showing {formatNumber(total)} customers</div>
          </div>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Button
              variant="outline"
              size="icon"
              disabled={parseInt(page) == 1}
              onClick={() => setPageAction(parseInt(page) > 1 ? (parseInt(page) - 1).toString() : page)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="w-8">
              {page}
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={customers.length === 0 || total <= parseInt(page) * 10}
              onClick={() => {
                const newPage = parseInt(page) + 1;
                setPageAction(newPage.toString());
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-full gap-3 grid md:grid-cols-2">
            {customers.map((customer) => (
              <div key={customer?.id} className="border rounded-lg p-4 hover:border-primary transition-colors bg-card">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="space-y-1 w-full">
                    <div className="flex flex-row items-end justify-between pb-1 border-b border-white/10 ">
                      <h3 className="font-medium text-2xl">
                        {customer?.firstName} {customer?.lastName}
                      </h3>
                      <Dialog open={isDetailOpen && selectedCustomer?.id === customer?.id} onOpenChange={setIsDetailOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleCustomerSelect(customer)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Customer Details</DialogTitle>
                            <DialogDescription>View and update customer information</DialogDescription>
                          </DialogHeader>
                          {selectedCustomer && <CustomerDetail customer={selectedCustomer} onUpdate={handleCustomerUpdate} />}
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex flex-row items-center sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{customer?.email.toLowerCase()}</span>
                    </div>{" "}
                    <div className="text-sm text-muted-foreground">ID: {customer?.user.id}</div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                      <Popover>
                        <PopoverTrigger asChild className="justify-start">
                          <Button variant="link" className="p-0 h-auto text-sm text-muted-foreground flex items-center gap-1 font-normal w-fit">
                            <Clock className="h-3.5 w-3.5" />
                            Seen: {formatTimeAgo(customer?.user.lastSignIn) || "Never"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">Last Login Details</h4>
                            <p className="text-sm text-muted-foreground">
                              {customer?.user.lastSignIn ? formatExactDateTime(customer.user.lastSignIn) : "No login recorded"}
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="gap-2 mt-4">
                  <div className="flex gap-4 w-full">
                    <div className="flex flex-col rounded-md  bg-[var(--section-bg)] shadow-md shadow-black/10 w-full items-center justify-start text-center p-2">
                      <div className="text-base text-muted-foreground mb-1">Account</div>
                      <div>{getStatusBadge(customer?.user.isDeactivated || false)}</div>
                    </div>
                    <div className="flex flex-col rounded-md bg-[var(--section-bg)] shadow-md shadow-black/10 w-full items-center justify-start text-center p-2">
                      <div className="text-base text-muted-foreground mb-1">Devices</div>
                      <div className="font-medium text-sm">{customer?.user.isDeactivated || 1}</div>
                    </div>
                  </div>
                  {customer?.user?.recentMembership && (
                    <div className="bg-[#805719] mt-3 w-full rounded-md flex p-3 gap-3">
                      <div className="flex flex-col w-full rounded-md bg-[var(--section-bg)] shadow-md shadow-black/10 items-center justify-start text-center p-2">
                        <div className="text-sm text-muted-foreground mb-1">Membership</div>
                        <div>{getSubscriptionStatusBadge(customer?.user.recentMembership?.status || "")}</div>
                      </div>

                      <div
                        className="flex w-full flex-col bg-[var(--section-bg)]  shadow-md shadow-black/10 items-center justify-start text-center p-2 cursor-pointer hover:bg-muted/50 rounded-md transition-colors"
                        onClick={() => copyToClipboard(customer?.user?.recentMembership?.killbillPaymentMethodExternalKey || "", "EPOCH")}
                      >
                        <div className="text-sm text-muted-foreground mb-1 flex items-center">
                          Member ID
                          {copiedId === customer?.user?.recentMembership?.killbillPaymentMethodExternalKey ? (
                            <Check className="h-3 w-3 ml-1 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 ml-1 text-muted-foreground" />
                          )}
                        </div>
                        <div className="font-medium text-sm">{customer?.user.recentMembership?.killbillPaymentMethodExternalKey}</div>
                      </div>

                      <div className="flex flex-col w-full rounded-md bg-[var(--section-bg)] shadow-md shadow-black/10 items-center justify-start text-center p-2">
                        <div className="text-sm text-muted-foreground mb-1">Processor</div>
                        <div className="font-medium text-sm">{customer?.user.recentMembership?.killbillPaymentMethodPluginName}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-2 py-4 mt-4">
            <Button
              variant="outline"
              size="icon"
              disabled={parseInt(page) == 1}
              onClick={() => setPageAction(parseInt(page) > 1 ? (parseInt(page) - 1).toString() : page)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="w-8">
              {page}
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={customers.length === 0 || total <= parseInt(page) * 10}
              onClick={() => {
                const newPage = parseInt(page) + 1;
                setPageAction(newPage.toString());
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
