export type Customer = {
  id: string;
  createdAt: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  user: User;
} | null;

type Subscriber = {
  id: string;
};

type Membership = {
  id: string;
  status: MembershipStatus;
  isActive: boolean;
  since: unknown;
  killbillSubscriptionId: string;
  killbillPaymentMethodExternalKey: string;
  killbillPaymentMethodPluginName: string;
};
type User = {
  id: string;
  cognitoId: string;
  lastSignIn: string;
  isDeactivated: boolean;
  userDevices: { id: string }[] | [];
  subscriber: Subscriber | null;
  recentMembership: Membership | null;
  memberships: Membership[] | [];
};

export type MembershipStatus = "ACTIVE" | "GRADE_PERIOD" | "SUSPENDED" | "PENDING_CANCELLATION" | "CANCELLED";
