"use server";

import { DeleteUser, FindUser, GetUser, UpdateUserEmail } from "@/lib/client";
import { Customer } from "@/lib/types";
import { deleteCogUser, updateCogUserEmail } from "./cognito/CogClient";
import { Epoch } from "./epoch";
import { BTUser } from "./bt-core.types";
import { ConvertKit } from "./convertkit/ConvertKit";

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

export const updateUserEmail = async ({ userId, newEmail }: { userId: string; newEmail: string }) => {
  const coreUser = await GetUser({ userId });
  try {
    const result = await updateCogUserEmail({ email: newEmail, userId: coreUser?.cognitoId || "" });
    if (result?.$metadata.httpStatusCode == 200) {
      console.log("Updating user email in core: ", userId);
      const coreReponse = await UpdateUserEmail({ email: newEmail, id: coreUser?.id || "" });
      if (coreReponse?.success) {
        return { success: true, message: "User email updated successfully" };
      } else {
        return { success: false, message: coreReponse?.message };
      }
    } else {
      return { success: false, message: "Error updating user email" };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating user email:", error);
      return { success: false, message: error.message };
    }
    console.error("Error updating user email: ", error);
    return { success: false, message: "Unknown error occurred" };
  }
};

const deleteCoreUser = async (user: BTUser) => {
  try {
    const count = await DeleteUser({ userId: user?.id || "" });
    if (count?.deleteUsers?.count === 0) {
      return { success: false, message: "Core User Not Found: " + user?.id };
    } else {
      return { success: true, message: `${count?.deleteUsers.count.toString()} Customers deleted successfully` };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error core user:", error);
      return { success: false, message: error.message };
    }
    console.error("Error deleting core user: ", error);
    return { success: false, message: "Unknown error occurred" };
  }
};

export async function deleteUser(customerId: string) {
  console.log("Deleting user:", customerId);
  // Get CognitoId of User
  const user = await GetUser({ userId: customerId });
  const ck = new ConvertKit();
  try {
    if (user?.subscriber) {
      await ck.removeSubscriber(user?.profile?.email || "");
    }

    if (user?.recentMembership) {
      const epoch = new Epoch();
      const epochReponse = await epoch.cancelEpoch(user?.recentMembership?.killbillPaymentMethodExternalKey || "");
      if (!epochReponse?.success) {
        console.error("Error cancelling Epoch subscription:", epochReponse?.message);
        return { success: false, message: epochReponse?.message };
      }
    }

    if (user?.cognitoId) {
      const result = await deleteCogUser({ userId: user?.cognitoId });

      if (result.$metadata.httpStatusCode == 200) {
        // Simulate a delay to mimic a database operation
        return await deleteCoreUser(user);
      }
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
