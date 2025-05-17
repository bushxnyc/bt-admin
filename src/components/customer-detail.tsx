"use client";

import { ChangeEvent, useState } from "react";
import { CalendarIcon, CreditCard, Smartphone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/lib/types";

export default function CustomerDetail({ customer, onUpdate }: { customer: Customer; onUpdate: (customer: Customer) => void }) {
  const [editedCustomer, setEditedCustomer] = useState<Customer>(customer);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setEditedCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    onUpdate(editedCustomer);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // const getSubscriptionStatusBadge = (status) => {
  //   const statusColors = {
  //     active: "bg-blue-500/20 text-blue-500",
  //     trial: "bg-purple-500/20 text-purple-500",
  //     past_due: "bg-orange-500/20 text-orange-500",
  //     canceled: "bg-gray-500/20 text-gray-400",
  //     paused: "bg-cyan-500/20 text-cyan-500",
  //   };

  //   return (
  //     <Badge className={`${statusColors[status] || "bg-secondary"} rounded-full ml-2`}>
  //       {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
  //     </Badge>
  //   );
  // };

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
        <TabsTrigger value="devices">Devices</TabsTrigger>
      </TabsList>

      <div className="mt-4 h-[400px] overflow-y-auto">
        <TabsContent value="profile" className="space-y-4 h-auto">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>View and update the customer's personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" value={editedCustomer.firstName} onChange={handleChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" value={editedCustomer.lastName} onChange={handleChange} disabled={!isEditing} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" value={editedCustomer.username} onChange={handleChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" value={editedCustomer.email} onChange={handleChange} disabled={!isEditing} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Account Status</Label>
                  <Select disabled={!isEditing} value={editedCustomer.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined: </span>
                  <span>{formatDate(editedCustomer?.createdAt || "")}</span>
                </div>
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
              <CardDescription>Manage the customer's subscription information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="processor">Processor</Label>
                  <Select disabled={!isEditing} value={editedCustomer.processor} onValueChange={(value) => handleSelectChange("processor", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select processor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stripe">Stripe</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Braintree">Braintree</SelectItem>
                      <SelectItem value="Adyen">Adyen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberId">Member ID</Label>
                  <Input id="memberId" name="memberId" value={editedCustomer.memberId} onChange={handleChange} disabled={!isEditing} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscriptionStatus">Subscription Status</Label>
                <Select
                  disabled={!isEditing}
                  value={editedCustomer.subscriptionStatus}
                  onValueChange={(value) => handleSelectChange("subscriptionStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subscription status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last Payment: </span>
                <span>{formatDate("")}</span>
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
              <CardDescription>View and manage the customer's connected devices</CardDescription>
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
                  value={editedCustomer.deviceCount}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <p className="text-sm text-muted-foreground">Maximum devices allowed: 6</p>
              </div>

              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Connected Devices</h4>
                <p className="text-sm text-muted-foreground">Detailed device information would be displayed here in a real application.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              Save Changes
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Edit Customer</Button>
        )}
      </div>
    </Tabs>
  );
}
