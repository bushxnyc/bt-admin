"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cancelMembership, deleteUser, updateUserEmail } from "@/lib/actions";
import { Customer } from "@/lib/types";
import { Calendar as CalendarIcon, CreditCard, Smartphone, User } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function CustomerDetail({ customer, onUpdate }: { customer: Customer; onUpdate: (customer: Customer) => void }) {
  const [editedCustomer, setEditedCustomer] = useState<Customer>(customer);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedCustomer(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as Customer)
    );
  };

  const handleSelectChange = (name: string, value: string) => {
    let newValue;
    if (value === "true") {
      newValue = true;
    } else if (value === "false") {
      newValue = false;
    } else {
      newValue = value;
    }

    // Handle nested properties
    const nameParts = name.split(".");
    if (nameParts.length > 1) {
      setEditedCustomer((prev) => {
        const updatedPrev = { ...prev };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: any = updatedPrev;

        // Navigate to the parent object
        for (let i = 0; i < nameParts.length - 1; i++) {
          if (!current[nameParts[i]]) {
            current[nameParts[i]] = {};
          }
          current = current[nameParts[i]];
        }

        // Set the value on the last property
        current[nameParts[nameParts.length - 1]] = newValue;
        return updatedPrev as Customer;
      });
    } else {
      // Handle top-level properties as before
      setEditedCustomer(
        (prev) =>
          ({
            ...prev,
            [name]: newValue,
          } as Customer)
      );
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onUpdate(editedCustomer);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not available";

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return "Invalid date";
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-900 text-green-300";
      case "PENDING_CANCELLATION":
        return "bg-yellow-900 text-yellow-300";
      case "SUSPENDED":
        return "bg-orange-900 text-orange-300";
      case "CANCELLED":
        return "bg-red-900 text-red-300";
      default:
        return "";
    }
  };

  const getAccountStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-900 text-green-300";
      case "inactive":
        return "bg-red-900 text-red-300";
    }
  };

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
        <TabsTrigger value="devices">Devices</TabsTrigger>
      </TabsList>

      <div className="mt-4 md:h-[450px] h-[400px] overflow-y-auto">
        <TabsContent value="profile" className="space-y-4 h-auto">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>View and update the customer&apos;s personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" value={editedCustomer?.firstName || ""} onChange={handleChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" value={editedCustomer?.lastName || ""} onChange={handleChange} disabled={!isEditing} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" value={editedCustomer?.email} onChange={handleChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" value={editedCustomer?.username || ""} onChange={handleChange} disabled={!isEditing} />
                  </div>
                </div>

                <div className="gap-4 flex justify-center flex-row items-center">
                  <div className="space-y-2 flex flex-col w-full">
                    <Label htmlFor="status">Account Status</Label>
                    <Select
                      disabled={!isEditing}
                      value={editedCustomer?.user?.isDeactivated ? "inactive" : "active"}
                      onValueChange={(value) => handleSelectChange("user.isDeactivated", value === "inactive" ? "true" : "false")}
                    >
                      <SelectTrigger
                        className={getAccountStatusColor(editedCustomer?.user?.isDeactivated ? "inactive" : "active") + " disabled:opacity-50 uppercase"}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Enabled</SelectItem>
                        <SelectItem value="inactive">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex flex-col w-full">
                    <Label htmlFor="status">Subscriber</Label>
                    {customer?.user?.subscriber?.isActive ? (
                      <div className="ml-1 text-center rounded-sm bg-green-900 text-green-300 opacity-50 p-1">TRUE</div>
                    ) : (
                      <div className="ml-1 text-center rounded-sm bg-red-900 text-red-300 opacity-50 p-1">FALSE</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Account Created: </span>
                  <span>{formatDate(editedCustomer?.createdAt || "")}</span>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild disabled={!isEditing}>
                    <Button className="bg-red-800 hover:bg-red-800/80 p-2 rounded-md uppercase">Delete User</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete {customer?.firstName} {customer?.lastName} from all systems.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          if (customer) {
                            const respone = await deleteUser(customer.user.id);
                            if (respone?.success) {
                              toast(respone.message);
                            } else {
                              toast(respone?.message);
                            }
                          }
                        }}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4 h-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Subscription Details
              </CardTitle>
              <CardDescription>Manage the customer&apos;s subscription information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="processor">Processor</Label>
                  <Select
                    disabled={!isEditing}
                    value={editedCustomer?.user?.recentMembership?.killbillPaymentMethodPluginName || ""}
                    onValueChange={(value) => handleSelectChange("user.recentMembership.killbillPaymentMethodPluginName", value)}
                  >
                    <SelectTrigger className="disabled:opacity-50 uppercase ">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EPOCH">EPOCH</SelectItem>
                    </SelectContent>
                    <SelectContent>
                      <SelectItem value="COMP">COMP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberId">Member ID</Label>
                  <Input
                    id="memberId"
                    name="user.recentMembership.killbillPaymentMethodExternalKey"
                    value={editedCustomer?.user?.recentMembership?.killbillPaymentMethodExternalKey || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subscriptionStatus">Status</Label>
                  <Select
                    disabled={!isEditing}
                    value={editedCustomer?.user?.recentMembership?.status || ""}
                    onValueChange={(value) => handleSelectChange("user.recentMembership.status", value)}
                  >
                    <SelectTrigger
                      className={getSubscriptionStatusColor(editedCustomer?.user?.recentMembership?.status || "") + " uppercase  disabled:opacity-50"}
                    >
                      <SelectValue placeholder="NONE" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="PENDING_CANCELLATION">Pending Cancel</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended </SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="gap-2 flex flex-col space-y-2 pt-1">
                  <Label>Action</Label>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={!["ACTIVE", "SUSPENDED"].includes(customer?.user?.recentMembership?.status || "DISABLED") || !isEditing}
                        variant="ghost"
                        className="bg-red-800 text-white font-light p-1 mt-0 w-full uppercase"
                      >
                        Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will cancel the Users Membership.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex fex-row">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            const response = await cancelMembership({ customerId: customer?.user.id || "" });
                            if (response?.success) {
                              toast(response.message);
                            } else {
                              toast(response?.message);
                            }
                          }}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Last Status Change: </span>
                <span>{formatDate(editedCustomer?.user?.recentMembership?.updatedAt || "")}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4 h-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="mr-2 h-5 w-5" />
                Device Management
              </CardTitle>
              <CardDescription>View and manage the customer&apos;s connected devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deviceCount">Device Count</Label>
                <Input
                  id="deviceCount"
                  name="deviceCount"
                  type="number"
                  min="0"
                  max="10"
                  value={editedCustomer?.user?.userDevices?.length || 0}
                  readOnly
                  disabled
                />
                <p className="text-sm text-muted-foreground">Maximum devices allowed: 6</p>
              </div>

              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Connected Devices</h4>
                {editedCustomer?.user?.userDevices && editedCustomer?.user.userDevices.length > 0 ? (
                  <div className="space-y-2">
                    {editedCustomer?.user.userDevices.map((device, index) => (
                      <div key={index} className="text-sm p-2 border rounded-md flex justify-between items-center">
                        <span>{device?.id || "Unknown device"}</span>
                        {isEditing && (
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No devices connected</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              onClick={async () => {
                setEditedCustomer(customer);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={async (e) => {
                e.preventDefault();
                if (customer?.email !== editedCustomer?.email) {
                  const respone = await updateUserEmail({ userId: customer?.user.id || "", newEmail: editedCustomer?.email || "" });
                  if (respone?.success) {
                    toast(respone.message);
                  } else {
                    toast(respone?.message);
                  }
                }
                onUpdate(editedCustomer);
                setIsEditing(false);
              }}
            >
              Save Changes
            </Button>
          </>
        ) : (
          <div className="flex gap-3 flex-row w-full">
            <Button className="w-full text-lg" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </div>
        )}
      </div>
    </Tabs>
  );
}
