/** Fire-and-forget async work without unhandled promise rejections (RedBox). */
export function runSafe(promise: Promise<unknown>): void {
  void promise.catch(() => undefined);
}
