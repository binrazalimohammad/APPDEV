import { API_ORIGIN, MOBILE_API_BASE_URL } from './config';
import { apiFetch } from './client';
import type {
  ApiEnvelope,
  Application,
  Category,
  Listing,
  ListingDto,
  NotificationItem,
  Payment,
  MobileUserProfile,
  RegisterResponse,
  RegisterRole,
} from './types';

export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

function mapListing(item: ListingDto): Listing {
  return {
    ...item,
    imageUrl: resolveMediaUrl(item.image),
  };
}

export type ListingsRevisionPayload = {
  revision: string;
  count?: number;
  serverTime?: string;
};

type RevisionResponse = ApiEnvelope & {
  revision?: string;
  count?: number;
  serverTime?: string;
};

/** GET /api/mobile/listings/revision — poll for website changes */
export async function fetchListingsRevision(): Promise<ListingsRevisionPayload> {
  const body = await apiFetch<RevisionResponse>('/listings/revision', {
    baseUrl: MOBILE_API_BASE_URL,
  });
  return {
    revision: String(body.revision ?? body.meta?.revision ?? ''),
    count: body.count ?? body.meta?.count,
    serverTime: body.serverTime,
  };
}

/** GET /api/mobile/my-listings/revision (landlord) */
export async function fetchMyListingsRevision(token: string): Promise<ListingsRevisionPayload> {
  const body = await apiFetch<RevisionResponse>('/my-listings/revision', {
    token,
    baseUrl: MOBILE_API_BASE_URL,
  });
  return {
    revision: String(body.revision ?? body.meta?.revision ?? ''),
    count: body.count ?? body.meta?.count,
    serverTime: body.serverTime,
  };
}

/** GET /api/mobile/my-listings (landlord) */
export async function fetchMyListings(token: string): Promise<Listing[]> {
  const envelope = await apiFetch<ApiEnvelope<ListingDto[]>>('/my-listings', {
    token,
    baseUrl: MOBILE_API_BASE_URL,
  });
  const items = Array.isArray(envelope.data) ? envelope.data : [];
  return items.map(mapListing);
}

/** GET /api/mobile/listings (public, approved marketplace) */
export async function fetchListings(): Promise<Listing[]> {
  const envelope = await apiFetch<ApiEnvelope<ListingDto[]>>('/listings', {
    baseUrl: MOBILE_API_BASE_URL,
  });
  const items = Array.isArray(envelope.data) ? envelope.data : [];
  return items.map(mapListing);
}

/** GET /api/mobile/listings/:id (public) */
export async function fetchListing(id: number | string): Promise<Listing> {
  const envelope = await apiFetch<ApiEnvelope<ListingDto>>(`/listings/${id}`, {
    baseUrl: MOBILE_API_BASE_URL,
  });
  const item = envelope.data;
  if (!item) {
    throw new Error('Listing not found');
  }
  return mapListing(item);
}

/** GET /api/mobile/categories (public) */
export async function fetchCategories(): Promise<Category[]> {
  const envelope = await apiFetch<ApiEnvelope<Category[]>>('/categories', {
    baseUrl: MOBILE_API_BASE_URL,
  });
  return Array.isArray(envelope.data) ? envelope.data : [];
}

/** POST /api/mobile/register — creates renter/landlord account and returns JWT */
export async function registerMobileUser({
  name,
  email,
  phone,
  password,
  confirmPassword,
  role = 'ROLE_TENANT',
  platform = 'mobile',
}: {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role?: RegisterRole;
  platform?: string;
}): Promise<RegisterResponse> {
  type RegisterEnvelope = ApiEnvelope<MobileUserProfile> & {
    token?: string;
    user?: MobileUserProfile;
    message?: string;
  };
  const envelope = await apiFetch<RegisterEnvelope>('/register', {
    method: 'POST',
    baseUrl: MOBILE_API_BASE_URL,
    body: {
      name,
      email,
      phone,
      password,
      confirmPassword,
      role,
      platform,
    },
  });

  const token = envelope.token ?? '';
  if (!token) {
    throw new Error('Registration succeeded but no login token was returned. Run npm run server.');
  }

  const user = envelope.user ?? envelope.data;
  if (!user || typeof user !== 'object') {
    throw new Error('Registration succeeded but user profile is missing.');
  }

  return {
    token,
    user,
    message: envelope.message,
  };
}

function mapApplication(raw: Application): Application {
  const listing = raw.listing;
  return {
    ...raw,
    listing: listing
      ? {
          ...listing,
          imageUrl: resolveMediaUrl(listing.image ?? null),
        }
      : null,
  };
}

export async function fetchApplications(token: string): Promise<Application[]> {
  const envelope = await apiFetch<ApiEnvelope<Application[]>>('/applications', {
    token,
    baseUrl: MOBILE_API_BASE_URL,
  });
  const items = Array.isArray(envelope.data) ? envelope.data : [];
  return items.map(mapApplication);
}

export async function fetchApplication(
  token: string,
  id: number,
): Promise<Application> {
  const envelope = await apiFetch<ApiEnvelope<Application>>(`/applications/${id}`, {
    token,
    baseUrl: MOBILE_API_BASE_URL,
  });
  if (!envelope.data) {
    throw new Error('Application not found');
  }
  return mapApplication(envelope.data);
}

export async function applyToListing(
  token: string,
  listingId: number,
  message: string,
): Promise<Application> {
  const envelope = await apiFetch<ApiEnvelope<Application>>(`/listings/${listingId}/apply`, {
    method: 'POST',
    token,
    baseUrl: MOBILE_API_BASE_URL,
    body: { message },
  });
  if (!envelope.data) {
    throw new Error('Apply failed');
  }
  return mapApplication(envelope.data);
}

export async function fetchPayments(token: string): Promise<Payment[]> {
  const envelope = await apiFetch<ApiEnvelope<Payment[]>>('/payments', {
    token,
    baseUrl: MOBILE_API_BASE_URL,
  });
  return Array.isArray(envelope.data) ? envelope.data : [];
}

export async function submitPayment(
  token: string,
  applicationId: number,
  body: { amount?: string; paymentMethod?: string; notes?: string },
): Promise<Payment> {
  const envelope = await apiFetch<ApiEnvelope<Payment>>(
    `/applications/${applicationId}/payments`,
    {
      method: 'POST',
      token,
      baseUrl: MOBILE_API_BASE_URL,
      body,
    },
  );
  if (!envelope.data) {
    throw new Error('Payment failed');
  }
  return envelope.data;
}

type RealtimeConfigPayload = {
  realtimeOrigin: string | null;
};

/** GET /api/mobile/realtime-config — public Socket.IO URL from Railway WS_BROADCAST_URL */
export async function fetchRealtimeConfig(): Promise<string | null> {
  try {
    const envelope = await apiFetch<ApiEnvelope<RealtimeConfigPayload>>('/realtime-config', {
      baseUrl: MOBILE_API_BASE_URL,
    });
    const url = envelope.data?.realtimeOrigin;
    if (typeof url !== 'string' || !url.trim()) {
      return null;
    }
    return url.trim().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export async function fetchNotifications(token: string): Promise<{
  items: NotificationItem[];
  unread: number;
}> {
  const envelope = await apiFetch<ApiEnvelope<NotificationItem[]>>('/notifications', {
    token,
    baseUrl: MOBILE_API_BASE_URL,
  });
  return {
    items: Array.isArray(envelope.data) ? envelope.data : [],
    unread: (envelope.meta as { unread?: number })?.unread ?? 0,
  };
}

export async function markNotificationRead(token: string, id: number): Promise<void> {
  await apiFetch(`/notifications/${id}/read`, {
    method: 'POST',
    token,
    baseUrl: MOBILE_API_BASE_URL,
  });
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  await apiFetch('/notifications/read-all', {
    method: 'POST',
    token,
    baseUrl: MOBILE_API_BASE_URL,
  });
}

/** POST /api/mobile/push-token — register FCM device token for remote push */
export async function registerPushToken(
  token: string,
  fcmToken: string,
  platform: 'android' | 'ios' = 'android',
): Promise<void> {
  await apiFetch('/push-token', {
    method: 'POST',
    token,
    baseUrl: MOBILE_API_BASE_URL,
    body: { token: fcmToken, platform },
  });
}

/** DELETE /api/mobile/push-token — clear server token on logout */
export async function unregisterPushToken(token: string): Promise<void> {
  await apiFetch('/push-token', {
    method: 'DELETE',
    token,
    baseUrl: MOBILE_API_BASE_URL,
  });
}
