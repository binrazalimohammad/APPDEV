import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { SPACING } from '../../utils/theme';
import HeaderLogoutButton from './HeaderLogoutButton';
import NotificationBell from './NotificationBell';

/** Header right cluster: user logout + notification bell (always visible). */
const HeaderUserActions = () => {
  const { width } = useWindowDimensions();
  const compact = width < 380;

  return (
    <View style={styles.row}>
      <HeaderLogoutButton compact={compact} />
      <NotificationBell compact={compact} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginRight: SPACING.sm,
    maxWidth: '100%',
  },
});

export default HeaderUserActions;
