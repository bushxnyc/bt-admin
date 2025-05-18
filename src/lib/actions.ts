"use server";

import { FindUser } from "@/lib/client";
import { Customer } from "@/lib/types";

export async function searchUsers(params: {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  page?: number;
}): Promise<{ customers: Customer[] | null; total: number }> {
  try {
    const data = await FindUser(params);
    if (data?.profiles?.result) {
      return { customers: data.profiles.result as Customer[], total: data.profiles.count };
    }
    return { customers: null, total: 0 };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { customers: null, total: 0 };
  }
}
// This is a mock server action
// In a real application, this would connect to your database

export async function updateCustomer(customer: Customer) {
  // Simulate a delay to mimic a database operation
  await new Promise((resolve) => setTimeout(resolve, 500));

  // In a real app, you would update the database here
  console.log("Updating customer:", customer);

  // Return the updated customer
  return customer;
}
