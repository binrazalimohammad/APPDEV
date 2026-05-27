import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { SPACING } from '../utils/theme';

type Props = {
  children: ReactNode;
  gap?: number;
};

/** Consistent vertical spacing between auth CTAs. */
const AuthButtonStack = ({ children, gap = SPACING.sm }: Props) => (
  <View style={[styles.stack, { gap }]}>{children}</View>
);

const styles = StyleSheet.create({
  stack: {
    alignSelf: 'stretch',
  },
});

export default AuthButtonStack;
