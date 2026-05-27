import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';

import { fetchDashboard, type DashboardSummary } from '../../app/api/content';
import { fetchSyncRevision } from '../../app/api/sync';
import { LISTINGS_SYNC_INTERVAL_MS } from '../../constants/sync';
import { useRevisionPolling } from '../../hooks/useRevisionPolling';
import type { AppDispatch, RootState } from '../../app/store';
import { userLogout } from '../../app/authSlice';
import DashboardHero from '../../components/dashboard/DashboardHero';
import DashboardPanel from '../../components/dashboard/DashboardPanel';
import QuickActionGrid from '../../components/dashboard/QuickActionGrid';
import SectionHeader from '../../components/dashboard/SectionHeader';
import StatCard from '../../components/dashboard/StatCard';
import LogoutButton from '../../components/LogoutButton';
import type { MainStackParamList } from '../../navigation/types';
import { navigateDashboardLink, type DashboardLinkId } from '../../utils/dashboardLinks';
import { COLORS, FONT, RADIUS, SPACING } from '../../utils';
import { filterQuickLinksForRole } from '../../utils/roleNavigation';
import { getPrimaryRole } from '../../utils/roles';
import { runSafe } from '../../utils/runSafe';
import { ROUTES } from '../../utils/routes';

type HomeNav = StackNavigationProp<MainStackParamList, typeof ROUTES.HOME>;

const DEMO_DASHBOARD: DashboardSummary = {
  role: 'ROLE_TENANT',
  roleLabel: 'Customer',
  eyebrow: 'Welcome back',
  title: 'Your dashboard',
  subtitle: 'Browse homes, track applications, and manage payments in one place.',
  listingCount: 3,
  applicationCount: 0,
  paymentCount: 0,
  unreadNotifications: 0,
  stats: [
    { key: 'listings', title: 'Available homes', value: '3', hint: 'On marketplace', icon: 'home' },
    { key: 'applications', title: 'My applications', value: '0', hint: 'Active requests', icon: 'file' },
    { key: 'payments', title: 'Payments', value: '0', hint: 'All clear', icon: 'money' },
  ],
  quickLinks: [
    { id: 'listings', label: 'Browse listings', subtitle: 'Marketplace', icon: 'list' },
    { id: 'applications', label: 'Applications', subtitle: 'Bookings', icon: 'file' },
    { id: 'payments', label: 'Payments', subtitle: 'History', icon: 'money' },
    { id: 'notifications', label: 'Notifications', subtitle: 'Updates', icon: 'bell' },
    { id: 'profile', label: 'Profile', subtitle: 'Account', icon: 'user' },
  ],
  recentListings: [],
  recentApplications: [],
  notifications: [],
};

const HomeScreen = () => {
  const navigation = useNavigation<HomeNav>();
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((s: RootState) => s.auth.token);
  const user = useSelector((s: RootState) => s.auth.user);
  const [dash, setDash] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setApiError(null);
    if (!token || token === 'demo') {
      setDash(DEMO_DASHBOARD);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      setDash(await fetchDashboard(token));
    } catch (e) {
      setDash(null);
      setApiError(
        e instanceof Error
          ? e.message
          : 'Cannot load dashboard. Check Wi‑Fi and API connection.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  const reloadDashboardSilent = useCallback(async () => {
    if (!token || token === 'demo') {
      return;
    }
    try {
      setDash(await fetchDashboard(token));
    } catch {
      // keep cached dashboard on poll failure
    }
  }, [token]);

  useRevisionPolling(
    async () => {
      const sync = await fetchSyncRevision(token!);
      return { revision: sync.revision, serverTime: sync.serverTime };
    },
    reloadDashboardSilent,
    Boolean(token && token !== 'demo'),
    LISTINGS_SYNC_INTERVAL_MS,
  );

  useFocusEffect(
    useCallback(() => {
      setRefreshing(true);
      runSafe(load());
    }, [load]),
  );

  if (loading && !dash) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loadingText}>Loading your dashboard…</Text>
      </View>
    );
  }

  const data = dash ?? DEMO_DASHBOARD;
  const role = data.role ?? getPrimaryRole(user);
  const isTenant = role === 'ROLE_TENANT';
  const quickLinks = filterQuickLinksForRole(data.quickLinks ?? [], role);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            runSafe(load());
          }}
          tintColor={COLORS.primary}
        />
      }
    >
      <DashboardHero
        eyebrow={data.eyebrow}
        title={data.title}
        subtitle={data.subtitle}
        role={data.role}
        userName={user?.name ?? user?.email}
      />

      {apiError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Connection issue</Text>
          <Text style={styles.errorText}>{apiError}</Text>
        </View>
      ) : null}

      {data.adminNote ? (
        <View style={styles.adminNote}>
          <Text style={styles.adminNoteText}>{data.adminNote}</Text>
        </View>
      ) : null}

      <SectionHeader title="Overview" />
      <View style={styles.statsGrid}>
        {data.stats.map(stat => (
          <StatCard
            key={stat.key}
            title={stat.title}
            value={stat.value}
            hint={stat.hint}
            icon={stat.icon}
          />
        ))}
      </View>

      <SectionHeader
        title="Shortcuts"
        subtitle={isTenant ? 'More options in the menu (☰) at the top' : undefined}
      />
      <QuickActionGrid
        items={quickLinks}
        onPress={id => navigateDashboardLink(navigation, id as DashboardLinkId)}
      />

      {data.recentListings.length > 0 ? (
        <DashboardPanel title="Recent listings" hint="Latest">
          {data.recentListings.map(item => (
            <Pressable
              key={String(item.id)}
              style={({ pressed }) => [styles.listRow, pressed && styles.listRowPressed]}
              onPress={() =>
                navigation.navigate(ROUTES.LISTING_DETAIL, { id: Number(item.id) })
              }
            >
              <View style={styles.listRowBody}>
                <Text style={styles.listRowTitle}>{item.name}</Text>
                <Text style={styles.listRowMeta}>
                  {item.category ?? 'Uncategorized'}
                  {item.status ? ` · ${item.status}` : ''}
                </Text>
                <Text style={styles.listRowPrice}>
                  ₱{Number(item.price ?? 0).toLocaleString()}
                  <Text style={styles.perMonth}> / month</Text>
                </Text>
              </View>
            </Pressable>
          ))}
          <Pressable onPress={() => navigation.navigate(ROUTES.LISTINGS)}>
            <Text style={styles.viewAll}>View all listings</Text>
          </Pressable>
        </DashboardPanel>
      ) : null}

      {data.recentApplications.length > 0 ? (
        <DashboardPanel
          title={role === 'ROLE_LANDLORD' ? 'Recent applications' : 'My applications'}
          hint="Latest"
        >
          {data.recentApplications.map(app => (
            <Pressable
              key={String(app.id)}
              style={({ pressed }) => [styles.listRow, pressed && styles.listRowPressed]}
              onPress={() =>
                navigation.navigate(ROUTES.APPLICATION_DETAIL, { id: Number(app.id) })
              }
            >
              <View style={styles.listRowBody}>
                <Text style={styles.listRowTitle}>{app.listingName ?? 'Application'}</Text>
                <Text style={styles.listRowMeta}>
                  {role === 'ROLE_LANDLORD' && app.tenantName ? `${app.tenantName} · ` : ''}
                  {app.status}
                </Text>
              </View>
            </Pressable>
          ))}
          <Pressable onPress={() => navigation.navigate(ROUTES.APPLICATIONS)}>
            <Text style={styles.viewAll}>View all applications</Text>
          </Pressable>
        </DashboardPanel>
      ) : null}

      {data.notifications.length > 0 ? (
        <DashboardPanel
          title="Notifications"
          hint={data.unreadNotifications > 0 ? `${data.unreadNotifications} unread` : undefined}
        >
          {data.notifications.slice(0, 3).map(n => (
            <View
              key={String(n.id)}
              style={[styles.notifRow, !n.isRead && styles.notifUnread]}
            >
              <Text style={styles.notifMessage} numberOfLines={2}>
                {n.message}
              </Text>
            </View>
          ))}
          <Pressable onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}>
            <Text style={styles.viewAll}>View all notifications</Text>
          </Pressable>
        </DashboardPanel>
      ) : null}

      <View style={styles.footer}>
        <LogoutButton onLogout={() => dispatch(userLogout())} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  loadingText: {
    ...FONT.body,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorBox: {
    backgroundColor: COLORS.errorMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
  },
  errorTitle: {
    ...FONT.bodyStrong,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  errorText: {
    ...FONT.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  adminNote: {
    backgroundColor: COLORS.warningSoft,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  adminNoteText: { ...FONT.body, color: COLORS.warning },
  listRow: {
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.line,
  },
  listRowPressed: { opacity: 0.88 },
  listRowBody: { flex: 1 },
  listRowTitle: { ...FONT.bodyStrong, color: COLORS.text },
  listRowMeta: { ...FONT.caption, color: COLORS.textMuted, marginTop: 2 },
  listRowPrice: { ...FONT.bodyStrong, color: COLORS.primary, marginTop: 4 },
  perMonth: { ...FONT.caption, color: COLORS.textMuted, fontWeight: '400' },
  viewAll: {
    ...FONT.bodyStrong,
    fontSize: 14,
    color: COLORS.primary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  notifRow: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.line,
  },
  notifUnread: {
    backgroundColor: COLORS.infoSoft,
    marginHorizontal: -SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  notifMessage: { ...FONT.body, color: COLORS.text },
  footer: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
});

export default HomeScreen;
