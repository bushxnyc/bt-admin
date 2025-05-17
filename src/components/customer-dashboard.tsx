"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Filter, MoreHorizontal, CheckCircle, AlertCircle, Zap, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CustomerDetail from "@/components/customer-detail";
import { updateCustomer, searchUsers } from "@/lib/actions";
import { Customer, MembershipStatus } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";

export default function CustomerDashboard({ username, firstName, lastName, email }: { username: string; firstName: string; lastName: string; email: string }) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

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
  }, [username, firstName, lastName, email]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleCustomerUpdate = async (updatedCustomer: Customer) => {
    try {
      // In a real app, this would update the database
      await updateCustomer(updatedCustomer);

      // Close the dialog
      setIsDetailOpen(false);

      // Show success message (in a real app)
      console.log("Customer updated successfully");
    } catch (error) {
      console.error("Failed to update customer", error);
    }
  };

  const getStatusBadge = (status: boolean) => {
    switch (status) {
      case false:
        return (
          <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" /> Active
          </Badge>
        );
      case true:
        return (
          <Badge variant="destructive" className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
            <AlertCircle className="w-3 h-3 mr-1" /> Deactivated
          </Badge>
        );
      default:
        return <Badge variant="secondary">Active</Badge>;
    }
  };

  const getSubscriptionStatusBadge = (status: MembershipStatus | "") => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 rounded-full">
            <Zap className="w-3 h-3 mr-1" /> Active
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge className="bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 rounded-full">
            <AlertCircle className="w-3 h-3 mr-1" /> Suspended
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 rounded-full">
            <XCircle className="w-3 h-3 mr-1" /> Cancelled
          </Badge>
        );
      case "PENDING_CANCELLATION":
        return (
          <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 rounded-full">
            <XCircle className="w-3 h-3 mr-1" /> Pending Cancellation
          </Badge>
        );
      default:
        return <div></div>;
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-4">Loading customers...</div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">Showing {formatNumber(total)} customers</div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer?.id} className="border rounded-lg p-4 hover:border-primary transition-colors bg-card">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="font-medium text-2xl">
                      {customer?.firstName} {customer?.lastName}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                      <span>{customer?.email.toLowerCase()}</span>
                    </div>{" "}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                      <span>Seen: {formatTimeAgo(customer?.user.lastSignIn) || ""}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleCustomerSelect(customer)}>Edit Customer</DropdownMenuItem>
                        <DropdownMenuItem>View Billing History</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">Suspend Account</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Mobile-specific layout */}
                <div className="md:hidden mt-4 space-y-3">
                  {/* Row 1: Member ID and Processor */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col items-center justify-center text-center p-2 border rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Member ID</div>
                      <div className="font-medium text-sm">{customer?.user.recentMembership?.killbillPaymentMethodExternalKey}</div>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center p-2 border rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Processor</div>
                      <div className="font-medium text-sm">{customer?.user.recentMembership?.killbillPaymentMethodPluginName}</div>
                    </div>
                  </div>

                  {/* Row 2: Account Status and Subscription Status */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col items-center justify-center text-center p-2 border rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Account Status</div>
                      <div>{getStatusBadge(customer?.user.isDeactivated || false)}</div>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center p-2 border rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Subscription</div>
                      <div>{getSubscriptionStatusBadge(customer?.user.recentMembership?.status || "")}</div>
                    </div>
                  </div>

                  {/* Row 3: Devices */}
                  <div className="flex flex-col items-center justify-center text-center p-2 border rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">Devices</div>
                    <div className="font-medium text-sm">{customer?.user.userDevices.length || 0}</div>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden md:grid md:grid-cols-5 gap-4 mt-4">
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <div className="text-xs text-muted-foreground mb-1">Member ID</div>
                    <div className="font-medium text-sm">{customer?.user.recentMembership?.killbillPaymentMethodExternalKey}</div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <div className="text-xs text-muted-foreground mb-1">Account Status</div>
                    <div>{getStatusBadge(customer?.user.isDeactivated || false)}</div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <div className="text-xs text-muted-foreground mb-1">Subscription Status</div>
                    <div>{getSubscriptionStatusBadge(customer?.user.recentMembership?.status || "")}</div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <div className="text-xs text-muted-foreground mb-1">Processor</div>
                    <div className="font-medium text-sm">{customer?.user.recentMembership?.killbillPaymentMethodPluginName}</div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <div className="text-xs text-muted-foreground mb-1">Devices</div>
                    <div className="font-medium text-sm">{customer?.user.isDeactivated || 1}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-2 py-4 mt-4">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="w-8">
              1
            </Button>
            <Button variant="outline" size="sm" className="w-8">
              2
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
