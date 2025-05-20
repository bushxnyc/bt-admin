import "server-only";

import { graphql } from "./gql/btcore/client";
import { initClient } from "./gql/btcore/client";
import { BTUser } from "./bt-core.types";

export const DeleteUserQuery = graphql(/* GraphQL */ `
  mutation DeleteAccount($userId: String) {
    deleteUsers(filter: { id: { exact: $userId } }) {
      count
    }
  }
`);

export const GetUserQuery = graphql(/* GraphQL */ `
  query UserByID($userId: String) {
    users(filter: { id: { exact: $userId } }) {
      result {
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
  const key = process.env.CORE_API_KEY || "";
  const client = initClient(key);
  const { data } = await client.query(GetUserQuery, { userId });
  return data?.users.result[0] || null;
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

export class UserNotFoundError extends Error {
  constructor(message: string, public code?: number) {
    super(message);
    this.name = "UserNotFound";
    Object.setPrototypeOf(this, UserNotFoundError.prototype); // Maintain the prototype chain
  }
}
