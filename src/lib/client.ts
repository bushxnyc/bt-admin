import "server-only";

import { BTUser } from "./bt-core.types";
import { graphql, initClient } from "./gql/btcore/client";
import { Customer } from "./types";

const DeleteUserQuery = graphql(/* GraphQL */ `
  mutation DeleteAccount($userId: String) {
    deleteUsers(filter: { id: { exact: $userId } }) {
      count
    }
    eraseSubscribers(filter: { user: { exact: $userId } }) {
      count
    }
    eraseMemberships(filter: { user: { exact: $userId } }) {
      count
    }
    eraseProfiles(filter: { user: { exact: $userId } }) {
      count
    }
    eraseUserDevices(filter: { user: { exact: $userId } }) {
      count
    }
    eraseNotifications(filter: { user: { exact: $userId } }) {
      count
    }
    eraseUsers(filter: { id: { exact: $userId } }) {
      count
    }
  }
`);

const UpdateUserEmailQuery = graphql(/* GraphQL */ `
  mutation UpdateAccount($email: String!, $id: ID!) {
    updateAccount(input: { user: $id, email: $email }) {
      id
      cognitoId
      profile {
        email
        firstName
        lastName
        username
      }
    }
  }
`);

const FindUserQuery = graphql(/* GraphQL */ `
  query FindUser($firstName: String, $lastName: String, $email: String, $username: String, $page: Int) {
    profiles(
      window: { take: 10, skip: $page }
      filter: {
        isActive: { exact: true }
        email: { pattern: $email, ignoreCase: true }
        firstName: { pattern: $firstName, ignoreCase: true }
        lastName: { pattern: $lastName, ignoreCase: true }
        username: { pattern: $username, ignoreCase: true }
      }
    ) {
      count
      result {
        id
        createdAt
        email
        firstName
        lastName
        username
        user {
          id
          cognitoId
          lastSignIn
          cognitoId
          isDeactivated
          subscriber {
            id
            isActive
          }
          recentMembership {
            id
            status
            since
            updatedAt
            killbillSubscriptionId
            killbillPaymentMethodExternalKey
            killbillPaymentMethodPluginName
          }
          memberships {
            id
            status
            since
            killbillSubscriptionId
            killbillPaymentMethodExternalKey
          }
          userDevices {
            id
          }
        }
      }
    }
  }
`);

const GetUserQuery = graphql(/* GraphQL */ `
  query UserByID($userId: ID!) {
    user(id: $userId) {
      id
      cognitoId
      profile {
        firstName
        email
        username
      }
      recentMembership {
        status
        killbillPaymentMethodExternalKey
        killbillPaymentMethodPluginName
      }
      subscriber {
        convertkitId
        isActive
      }
    }
  }
`);

const UpdateProfileQuery = graphql(/* GraphQL */ `
  mutation UpdateAccount($user: ID!, $firstName: String, $lastName: String, $username: String) {
    updateAccount(input: { user: $user, firstName: $firstName, lastName: $lastName, username: $username }) {
      id
    }
  }
`);

const UpdateUserQuery = graphql(/* GraphQL */ `
  mutation UpdateUser($id: ID!, $active: Boolean) {
    updateUser(input: { id: $id, isDeactivated: $active }) {
      id
    }
  }
`);

export async function FindUser({
  firstName,
  lastName,
  email,
  username,
  page,
}: {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  page?: number;
}) {
  const key = process.env.CORE_API_KEY || "";
  const client = initClient(key);
  const newPage = ((page ?? 1) - 1) * 10;
  const { data, error } = await client.query(FindUserQuery, { firstName, lastName, email, username, page: newPage });
  if (error) {
    error.graphQLErrors.map((e) => console.error(e.message));
    throw new UserNotFoundError(error.graphQLErrors[0].message);
  }
  return data || null;
}

export async function GetUser({ userId }: { userId: string }): Promise<BTUser> {
  try {
    const key = process.env.CORE_API_KEY || "";
    const client = initClient(key);
    const { data } = await client.query(GetUserQuery, { userId });
    return data?.user || null;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching user:", error);
      throw new UserNotFoundError(error.message);
    }
    return null;
  }
}

export async function DeleteUser({ userId }: { userId: string }) {
  const key = process.env.CORE_API_KEY || "";
  const client = initClient(key);
  const { data, error } = await client.mutation(DeleteUserQuery, { userId });
  if (error) {
    error.graphQLErrors.map((e) => console.error(e.message));
    throw new UserNotFoundError(error.graphQLErrors[0].message);
  }
  if (data?.deleteUsers.count === 0) {
    throw new UserNotFoundError("User not found", 404);
  }
  return data;
}

export async function UpdateUserEmail({ email, id }: { email: string; id: string }) {
  const key = process.env.CORE_API_KEY || "";
  const client = initClient(key);
  const { data, error } = await client.mutation(UpdateUserEmailQuery, { email, id });
  if (error) {
    error.graphQLErrors.map((e) => console.error(e.message));
    throw new UserNotFoundError(error.graphQLErrors[0].message);
  }
  if (data?.updateAccount) {
    return { success: true, user: data.updateAccount };
  } else {
    return { success: false, message: "User not found" };
  }
}

export class UserNotFoundError extends Error {
  constructor(message: string, public code?: number) {
    super(message);
    this.name = "UserNotFound";
    Object.setPrototypeOf(this, UserNotFoundError.prototype); // Maintain the prototype chain
  }
}

export async function UpdateProfile(profile: Customer) {
  const key = process.env.CORE_API_KEY || "";
  const client = initClient(key);
  const { data, error } = await client.mutation(UpdateProfileQuery, {
    user: profile?.user.id || "",
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    username: profile?.username,
  });

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: error.message };
  }
  if (data?.updateAccount.id !== undefined) {
    return { success: true, message: "User Successfully Updated!" };
  }
}

export async function UpdateUser(profile: Customer) {
  const key = process.env.CORE_API_KEY || "";
  const client = initClient(key);
  const { data, error } = await client.mutation(UpdateUserQuery, {
    id: profile?.user.id || "",
    active: profile?.user.isDeactivated,
  });
  if (error) {
    console.error("Error updating user:", error);
    return { success: false, message: error.message };
  }
  if (data?.updateUser.id !== undefined) {
    return { success: true, message: "User Successfully Updated!" };
  }
  return { success: false, message: "User not found" };
}
