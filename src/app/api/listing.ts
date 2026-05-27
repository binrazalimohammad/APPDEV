/**
 * Property listings API (Appdev equivalent: product.ts).
 */
export {
  fetchListings,
  fetchListing,
  fetchCategories,
  fetchListingsRevision,
  fetchMyListings,
  fetchMyListingsRevision,
  resolveMediaUrl,
} from './mobile';

export type { Listing, ListingDto, Category } from './types';
export type { ListingsRevisionPayload } from './mobile';
