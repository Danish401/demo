export default function ZohoTokenLoader() {
  // Intentionally no side-effects.
  // Token fetching is handled server-side by the API routes (e.g. `/api/zoho-quotations`),
  // and client-side polling here can cause excessive Zoho token refresh attempts.
  return null
}
