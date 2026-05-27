import { useTenantSidebar } from '../../contexts/TenantSidebarContext';
import TenantSidebar from './TenantSidebar';

/** Mounts sidebar only while open — avoids render/animation conflicts. */
const TenantSidebarLayer = () => {
  const { isOpen } = useTenantSidebar();
  if (!isOpen) {
    return null;
  }
  return <TenantSidebar />;
};

export default TenantSidebarLayer;
