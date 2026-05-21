import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type TenantSidebarContextValue = {
  isOpen: boolean;
  isCollapsed: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  toggleCollapsed: () => void;
};

const TenantSidebarContext = createContext<TenantSidebarContextValue | null>(null);

export function TenantSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const toggleCollapsed = useCallback(() => setIsCollapsed(prev => !prev), []);

  const value = useMemo(
    () => ({ isOpen, isCollapsed, open, close, toggle, toggleCollapsed }),
    [isOpen, isCollapsed, open, close, toggle, toggleCollapsed],
  );

  return (
    <TenantSidebarContext.Provider value={value}>{children}</TenantSidebarContext.Provider>
  );
}

export function useTenantSidebar(): TenantSidebarContextValue {
  const ctx = useContext(TenantSidebarContext);
  if (!ctx) {
    throw new Error('useTenantSidebar must be used within TenantSidebarProvider');
  }
  return ctx;
}

/** Safe for header button — no-op when provider missing. */
export function useTenantSidebarOptional(): TenantSidebarContextValue | null {
  return useContext(TenantSidebarContext);
}
