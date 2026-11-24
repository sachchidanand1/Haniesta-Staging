export function isAnnouncementClosedFromCookieHeader(
  cookieHeader: string | null | undefined,
): boolean {
  if (!cookieHeader) return false;
  return /(?:^|;\s*)announcement_closed=1(?:;|$)/.test(cookieHeader);
}

export function persistAnnouncementClosed(): void {
  if (typeof document !== 'undefined') {
    try {
      document.cookie = 'announcement_closed=1; path=/; max-age=31536000';
    } catch {}
  }

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('announcement_closed', '1');
    } catch {}
  }
}
