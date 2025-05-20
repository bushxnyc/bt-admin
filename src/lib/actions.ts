"use server";

import { DeleteUser, FindUser, GetUser } from "@/lib/client";
import { Customer } from "@/lib/types";
import { deleteCogUser } from "./cognito/CogClient";
import { Epoch } from "./epoch";
import { BTUser } from "./bt-core.types";

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

const deleteCoreUser = async (user: BTUser) => {
  const count = await DeleteUser({ userId: user?.id || "" });
  if (count?.deleteUsers?.count === 0) {
    return { success: false, message: "Core User Not Found: " + user?.id };
  } else {
    console.log("Deleting customer with ID:", user?.id);
    return { success: true, message: `${count} Customer deleted successfully` };
  }
};

export async function deleteUser(customerId: string) {
  try {
    // Get CognitoId of User
    const user = await GetUser({ userId: customerId });

    if (user?.recentMembership) {
      const epoch = new Epoch();
      const epochReponse = await epoch.cancelEpoch(user?.recentMembership?.killbillPaymentMethodExternalKey || "");
      if (!epochReponse?.success) {
        console.error("Error cancelling Epoch subscription:", epochReponse?.message);
        return { success: false, message: epochReponse?.message };
      }
    }

    const result = await deleteCogUser({ userId: user?.cognitoId || "" });

    if (result.$metadata.httpStatusCode !== 200) {
      // Simulate a delay to mimic a database operation
      return await deleteCoreUser(user);
      console.log("Deleting customer with ID:", customerId);
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "UserNotFoundException") {
        const user = await GetUser({ userId: customerId });
        return await deleteCoreUser(user);
      }
      return { success: false, message: error.message };
    }
    console.error("Error deleting customer:", error);
  }
}
