import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formStyles } from '../utils/formStyles';
import { SPACING } from '../utils/theme';

type AuthFormLayoutProps = {
  children: ReactNode;
  cardStyle?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

/**
 * Auth screens — ScrollView only (no KeyboardAvoidingView).
 * Android already uses adjustResize in AndroidManifest; KAV + adjustResize
 * together causes the form to jump while typing (especially password).
 */
const AuthFormLayout = ({
  children,
  cardStyle,
  edges = ['top', 'bottom'],
}: AuthFormLayoutProps) => (
  <SafeAreaView style={formStyles.authPage} edges={edges}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={[formStyles.authCard, cardStyle]} collapsable={false}>
        {children}
      </View>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xxl,
    ...Platform.select({
      android: { justifyContent: 'flex-start' as const },
      default: {},
    }),
  },
});

export default AuthFormLayout;
