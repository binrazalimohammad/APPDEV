/** CasaClick mobile API envelope */
export type ApiEnvelope<T = unknown> = {
  success?: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  meta?: {
    count?: number;
    revision?: string;
    latestUpdatedAt?: string | null;
    unread?: number;
  };
};

export type ApiErrorPayload = {
  error?: string;
  message?: string;
  detail?: string;
  errors?: string[];
};

export type MobileUserProfile = {
  id?: string | number;
  email?: string;
  name?: string;
  phone?: string;
  roles?: string[];
  roleLabel?: string;
  emailVerified?: boolean;
};

export type RegisterResponse = {
  token: string;
  user: MobileUserProfile;
  message?: string;
};

export type ListingDto = {
  id: number | string;
  name?: string;
  price?: number | string;
  description?: string;
  image?: string | null;
  category?: string | null;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  landlord?: { name?: string } | null;
  /** Same flag as web marketplace (occupied listings) */
  occupied?: boolean;
};

export type Listing = ListingDto & {
  imageUrl: string | null;
};

export type Category = {
  id: number | string;
  name: string;
};

export type RegisterRole = 'ROLE_TENANT' | 'ROLE_LANDLORD';

export type ApplicationListing = {
  id: number | string;
  name?: string;
  price?: number | string;
  image?: string | null;
  imageUrl?: string | null;
};

export type Application = {
  id: number | string;
  status: string;
  message?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  listing?: ApplicationListing | null;
  landlord?: { name?: string } | null;
  tenant?: { name?: string } | null;
  payments?: Payment[];
};

export type Payment = {
  id: number | string;
  amount: string;
  status: string;
  paymentMethod?: string;
  notes?: string | null;
  transactionId?: string | null;
  createdAt?: string;
  paidAt?: string | null;
  application?: Application;
};

export type NotificationItem = {
  id: number | string;
  type: string;
  message: string;
  isRead: boolean;
  relatedEntity?: string | null;
  relatedId?: number | null;
  createdAt: string;
};
