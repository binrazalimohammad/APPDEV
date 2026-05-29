/** Signals all useNotifications hooks to reload from the API. */
type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeNotificationReload(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function requestNotificationReload(): void {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // ignore listener errors
    }
  }
}
