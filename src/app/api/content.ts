import { MOBILE_API_BASE_URL } from './config';
import { apiFetch } from './client';
import type { ApiEnvelope } from './types';

export type HomeContent = {
  title: string;
  tagline: string;
  features: { title: string; description: string }[];
  steps: { step: number; title: string; description: string }[];
  stats: { label: string; value: string }[];
};

export type AboutContent = {
  title: string;
  description: string;
  team: { name: string; position: string; bio: string }[];
};

export type ContactContent = {
  title: string;
  description: string;
  email: string;
  note: string;
};

export type DashboardStat = {
  key: string;
  title: string;
  value: string;
  hint: string;
  icon?: string;
};

export type DashboardQuickLink = {
  id: string;
  label: string;
  subtitle: string;
  icon?: string;
  badge?: number;
};

export type DashboardListingTile = {
  id: number | string;
  name?: string;
  price?: number | string;
  image?: string | null;
  category?: string | null;
  status?: string;
};

export type DashboardApplicationTile = {
  id: number | string;
  status: string;
  listingName?: string | null;
  tenantName?: string | null;
  createdAt?: string;
};

export type DashboardNotification = {
  id: number | string;
  type?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: string;
};

export type DashboardSummary = {
  role: string;
  roleLabel: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  listingCount: number;
  applicationCount: number;
  paymentCount: number;
  unreadNotifications: number;
  pendingApplicationCount?: number;
  pendingListingCount?: number;
  stats: DashboardStat[];
  quickLinks: DashboardQuickLink[];
  recentListings: DashboardListingTile[];
  recentApplications: DashboardApplicationTile[];
  notifications: DashboardNotification[];
  adminNote?: string;
};

export async function fetchHomeContent(): Promise<HomeContent> {
  const envelope = await apiFetch<ApiEnvelope<HomeContent>>('/home', {
    baseUrl: MOBILE_API_BASE_URL,
  });
  return envelope.data as HomeContent;
}

export async function fetchAboutContent(): Promise<AboutContent> {
  const envelope = await apiFetch<ApiEnvelope<AboutContent>>('/about', {
    baseUrl: MOBILE_API_BASE_URL,
  });
  return envelope.data as AboutContent;
}

export async function fetchContactContent(): Promise<ContactContent> {
  const envelope = await apiFetch<ApiEnvelope<ContactContent>>('/contact', {
    baseUrl: MOBILE_API_BASE_URL,
  });
  return envelope.data as ContactContent;
}

export async function fetchDashboard(token: string): Promise<DashboardSummary> {
  const envelope = await apiFetch<ApiEnvelope<DashboardSummary>>('/dashboard', {
    token,
    baseUrl: MOBILE_API_BASE_URL,
  });
  return envelope.data as DashboardSummary;
}
