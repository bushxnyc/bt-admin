import { AdminDeleteUserCommand, AdminDeleteUserCommandInput } from "@aws-sdk/client-cognito-identity-provider";
import client from "./client";

export async function deleteCogUser(input: { userId: string }) {
  const commandInput: AdminDeleteUserCommandInput = {
    UserPoolId: process.env.AWS_USER_POOL_ID || "",
    Username: input.userId,
  };

  const command = new AdminDeleteUserCommand(commandInput);
  return await client.send(command);
}
