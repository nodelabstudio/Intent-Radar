// Seller intent filter — v1.0
// Detects explicit selling / solicitation language
// Change ONLY when introducing a new seller-filter version
const SELLER_PATTERNS_V1 = [
  'free consultation',
  'offering demos',
  'offering demo',
  'we built',
  'i built',
  'just launched',
  'launching',
  'our platform',
  'our tool',
  'sign up',
  'book a call',
  'get started',
  'pricing',
  'trial',
];

export default function isSellerIntent(record) {
  const text = `${record.title} ${record.body}`.toLowerCase();
  return SELLER_PATTERNS_V1.some(p => text.includes(p));
}
