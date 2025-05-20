import { AdminDeleteUserCommand, AdminDeleteUserCommandInput, AdminUpdateUserAttributesCommand } from "@aws-sdk/client-cognito-identity-provider";
import client from "./client";

export async function deleteCogUser(input: { userId: string }) {
  const commandInput: AdminDeleteUserCommandInput = {
    UserPoolId: process.env.AWS_USER_POOL_ID || "",
    Username: input.userId,
  };

  const command = new AdminDeleteUserCommand(commandInput);
  return await client.send(command);
}

export async function updateCogUserEmail(input: { userId: string; email: string }) {
  const commandInput = {
    UserPoolId: process.env.AWS_USER_POOL_ID || "",
    Username: input.userId,
    UserAttributes: [
      {
        Name: "email",
        Value: input.email,
      },
      {
        Name: "email_verified",
        Value: "true",
      },
    ],
  };

  const command = new AdminUpdateUserAttributesCommand(commandInput);
  return await client.send(command);
}
