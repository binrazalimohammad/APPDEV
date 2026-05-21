import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { userLogout } from '../../app/authSlice';
import type { AppDispatch, RootState } from '../../app/store';
import { useTenantSidebar } from '../../contexts/TenantSidebarContext';
import type { MainStackParamList } from '../../types/navigation';
import BrandLogo from '../BrandLogo';
import { navigateDashboardLink, type DashboardLinkId } from '../../utils/dashboardLinks';
import { COLORS, FONT, RADIUS, SPACING } from '../../utils/theme';
import { TENANT_SIDEBAR_ITEMS } from '../../utils/tenantMenuItems';
import { ROUTES } from '../../utils/routes';

const EXPANDED_WIDTH = 280;
const COLLAPSED_WIDTH = 76;

type Nav = StackNavigationProp<MainStackParamList>;

const TenantSidebar = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { isCollapsed, close, toggleCollapsed } = useTenantSidebar();
  const user = useSelector((s: RootState) => s.auth.user);

  const panelWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const slideAnim = useRef(new Animated.Value(-EXPANDED_WIDTH)).current;

  useEffect(() => {
    slideAnim.setValue(-EXPANDED_WIDTH);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const onNavigate = (item: (typeof TENANT_SIDEBAR_ITEMS)[number]) => {
    close();
    if (item.id === 'home') {
      navigation.navigate(ROUTES.HOME);
      return;
    }
    navigateDashboardLink(navigation, item.id as DashboardLinkId);
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close menu" />
      <Animated.View
        style={[
          styles.panel,
          {
            width: panelWidth,
            paddingTop: insets.top + SPACING.sm,
            paddingBottom: insets.bottom + SPACING.md,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={[styles.header, isCollapsed && styles.headerCollapsed]}>
          {!isCollapsed ? (
            <>
              <BrandLogo size="sm" showBrandText style={styles.logo} />
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name ?? user?.email ?? 'Tenant'}
              </Text>
              <Text style={styles.roleLabel}>Renter dashboard</Text>
            </>
          ) : (
            <BrandLogo size="sm" style={styles.logoCollapsed} />
          )}
        </View>

        <Pressable
          style={styles.collapseBtn}
          onPress={toggleCollapsed}
          accessibilityLabel={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Text style={styles.collapseIcon}>{isCollapsed ? '»' : '«'}</Text>
          {!isCollapsed ? <Text style={styles.collapseText}>Collapse</Text> : null}
        </Pressable>

        <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
          {TENANT_SIDEBAR_ITEMS.map(item => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.menuItem,
                isCollapsed && styles.menuItemCollapsed,
                pressed && styles.menuItemPressed,
              ]}
              onPress={() => onNavigate(item)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              {!isCollapsed ? (
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
              ) : null}
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.signOut, isCollapsed && styles.signOutCollapsed]}
            onPress={() => {
              close();
              dispatch(userLogout());
            }}
          >
            <Text style={styles.signOutIcon}>⎋</Text>
            {!isCollapsed ? <Text style={styles.signOutText}>Sign out</Text> : null}
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(62, 39, 35, 0.45)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.surface,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    zIndex: 101,
    shadowColor: '#3E2723',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    alignItems: 'center',
  },
  headerCollapsed: {
    paddingHorizontal: SPACING.xs,
  },
  logo: {
    marginBottom: SPACING.xs,
  },
  logoCollapsed: {
    marginBottom: 0,
  },
  userName: {
    ...FONT.bodyStrong,
    color: COLORS.brown,
    textAlign: 'center',
  },
  roleLabel: {
    ...FONT.caption,
    color: COLORS.primary,
    marginTop: 2,
    textAlign: 'center',
  },
  collapseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  collapseIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  collapseText: {
    ...FONT.caption,
    color: COLORS.textMuted,
  },
  menu: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: 4,
  },
  menuItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  menuItemPressed: {
    backgroundColor: COLORS.primarySoft,
  },
  menuIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
    color: COLORS.primary,
  },
  menuTextWrap: {
    flex: 1,
    marginLeft: SPACING.xs,
  },
  menuLabel: {
    ...FONT.body,
    color: COLORS.text,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.errorMuted,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
  },
  signOutCollapsed: {
    justifyContent: 'center',
    padding: SPACING.sm,
  },
  signOutIcon: {
    fontSize: 16,
    color: COLORS.error,
    width: 28,
    textAlign: 'center',
  },
  signOutText: {
    ...FONT.bodyStrong,
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
});

export default TenantSidebar;
