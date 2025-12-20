// Seller post filter — v1.0
// Hard filter: excludes self-promotion, offers, services
// Change ONLY when introducing a new seller-filter version
import { SELLER_RULES } from '../../config/sellerRules.js';

export default function isSellerPost(record) {
  const text = `${record.title} ${record.body}`.toLowerCase();

  // Hard triggers = instant block
  if (SELLER_RULES.hardTriggers.some(t => text.includes(t))) {
    return true;
  }

  // Soft phrase matching
  let hits = 0;

  for (const phrase of SELLER_RULES.phrases) {
    if (text.includes(phrase)) {
      hits++;
      if (hits >= 2) return true;
    }
  }

  return false;
}
