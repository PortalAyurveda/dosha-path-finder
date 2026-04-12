/**
 * Sanitize a phone number for wa.me links.
 * 1) Remove all non-numeric chars
 * 2) If starts with '0', remove leading zero
 * 3) If 10 or 11 digits, prepend '55' (Brazil)
 * 4) If starts with '550', remove the '0' after '55'
 * 5) If 12+ digits, keep as-is
 */
export function sanitizeWhatsApp(raw: string): string {
  let num = raw.replace(/\D/g, "");
  if (num.startsWith("0")) num = num.slice(1);
  if (num.length === 10 || num.length === 11) num = "55" + num;
  if (num.startsWith("550")) num = "55" + num.slice(3);
  return num;
}

export function whatsappLink(raw: string): string {
  return `https://wa.me/${sanitizeWhatsApp(raw)}`;
}
