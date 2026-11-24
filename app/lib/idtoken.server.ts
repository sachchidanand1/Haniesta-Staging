// Minimal JWT (JWS) payload decoder (no signature verification)
export function decodeIdTokenClaims(idToken: string): Record<string, any> {
  try {
    const parts = idToken.split('.');
    if (parts.length < 2) return {};
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padded = payload + '==='.slice((payload.length + 3) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function extractCustomerFromClaims(claims: Record<string, any>) {
  const id = claims.sub || claims.customer_id || claims.id || '';
  const email = claims.email || claims.email_address || '';
  const firstName = claims.given_name || claims.first_name || claims.name || '';
  const lastName = claims.family_name || claims.last_name || '';
  const phone = claims.phone || claims.phone_number || '';
  return {id, email, first_name: firstName, last_name: lastName, phone};
}

export function toCustomerGid(possibleId?: string) {
  if (!possibleId) return undefined;
  if (possibleId.startsWith('gid://shopify/Customer/')) return possibleId;
  if (/^\d+$/.test(possibleId)) return `gid://shopify/Customer/${possibleId}`;
  return possibleId;
}


