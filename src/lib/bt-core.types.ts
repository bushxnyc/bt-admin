export type BTUser = {
  id: string;
  cognitoId?: string;
  profile: {
    email: string;
    firstName: string | null;
    username: string | null;
  } | null;
  recentMembership: {
    status: "ACTIVE" | "GRADE_PERIOD" | "SUSPENDED" | "PENDING_CANCELLATION" | "CANCELLED";
    killbillPaymentMethodPluginName: string;
    killbillPaymentMethodExternalKey: string;
  } | null;
} | null;
