import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import { TenantSidebarProvider } from '../../contexts/TenantSidebarContext';
import type { RootState } from '../../app/reducers';
import { getPrimaryRole } from '../../utils/roles';
import TenantSidebarLayer from './TenantSidebarLayer';

type Props = {
  children: ReactNode;
};

/** Wraps main stack — shows collapsible sidebar overlay for tenants only. */
const TenantSidebarHostInner = ({ children }: Props) => {
  const user = useSelector((s: RootState) => s.auth.user);
  const isTenant = getPrimaryRole(user) === 'ROLE_TENANT';

  return (
    <View style={styles.root}>
      <View style={styles.stack}>{children}</View>
      {isTenant ? <TenantSidebarLayer /> : null}
    </View>
  );
};

const TenantSidebarHost = ({ children }: Props) => (
  <TenantSidebarProvider>
    <TenantSidebarHostInner>{children}</TenantSidebarHostInner>
  </TenantSidebarProvider>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stack: {
    flex: 1,
  },
});

export default TenantSidebarHost;
