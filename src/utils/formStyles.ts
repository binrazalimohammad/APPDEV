import { StyleSheet } from 'react-native';

import { COLORS, ELEVATION, FONT, RADIUS, SPACING } from './theme';

/** Shared form layout — mirrors .cc-auth-page, .cc-auth-card, .form-group */
export const formStyles = StyleSheet.create({
  authPage: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  authScroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  authCard: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.line,
    ...ELEVATION.authCard,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...ELEVATION.card,
  },
  displayTitle: {
    ...FONT.display,
    color: COLORS.brown,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  authSub: {
    ...FONT.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontSize: 15,
  },
  sectionTitle: {
    ...FONT.label,
    color: COLORS.brown,
    marginBottom: SPACING.md,
  },
  formActions: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  authFooter: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  authFooterText: {
    ...FONT.body,
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: SPACING.xs,
  },
  link: {
    ...FONT.bodyStrong,
    color: COLORS.primary,
    fontSize: 15,
  },
  demoPill: {
    alignSelf: 'center',
    backgroundColor: COLORS.backgroundSoft,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  demoPillText: {
    ...FONT.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  demoPillStrong: {
    color: COLORS.brown,
    fontWeight: '600',
  },
  hintText: {
    ...FONT.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 18,
    paddingHorizontal: SPACING.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
});
