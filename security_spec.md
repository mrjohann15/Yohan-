# Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Owner-Only Mutations**: Only the verified shop owner (`request.auth.token.email == 'liennardjohn15@gmail.com'` AND `request.auth.token.email_verified == true`) may create, update, or delete documents in `/products/{productId}`.
2. **Public Published Reads, Private Drafts**: Unauthenticated visitors and non-owner users may only read (`get` or `list`) `/products/{productId}` documents where `isPublished == true`. Unpublished drafts (`isPublished == false`) are readable only by the verified owner.
3. **Strict Schema & Size Bounds**: Every product write must supply all 11 required fields and zero extraneous shadow fields, with enforced string length ceilings (`name <= 120`, `description <= 1500`, `category <= 60`, `imageUrl <= 200000`, `ownerId <= 128`).
4. **Immutable Ownership & Temporal Integrity**: `ownerId` must equal `request.auth.uid` on create and remain immutable on update. `createdAt` must equal `request.time` on create and remain immutable on update. `updatedAt` must equal `request.time` on both create and update.
5. **Path Variable Hardening**: `productId` must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters.

## 2. The "Dirty Dozen" Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Create**: Visitor with `auth == null` attempts `create` on `/products/item-1`.
2. **Non-Owner Authenticated Create**: User with verified email `attacker@example.com` attempts `create` on `/products/item-1`.
3. **Unverified Owner Email Spoof**: User with `email == 'liennardjohn15@gmail.com'` and `email_verified == false` attempts `create` or `update`.
4. **Shadow Field Injection**: Verified owner attempts `create` with an extra field `{ isAdmin: true }`.
5. **Identity Spoofing on Create**: Verified owner attempts `create` with `ownerId: 'other-uid'` not matching `request.auth.uid`.
6. **Client Timestamp Forgery**: Verified owner attempts `create` with a client-supplied past timestamp for `createdAt` instead of `serverTimestamp()`.
7. **Immutable Field Tampering on Update**: Verified owner attempts `update` changing `ownerId` or `createdAt`.
8. **Value Poisoning (Negative Price / Float Stock)**: Verified owner attempts `update` with `price: -50` or `stock: 1.5`.
9. **Resource Exhaustion (Oversized String)**: Verified owner attempts `create` with a 2,000-character `name` or 500KB `imageUrl`.
10. **Path ID Poisoning**: Verified owner attempts `create` at `/products/bad$id/with/chars` or >128 chars.
11. **Draft Scraping by Non-Owner**: Non-owner queries `/products` without `where('isPublished', '==', true)` or calls `get` on an unpublished draft (`isPublished: false`).
12. **Non-Owner Delete / Unknown Collection Access**: Non-owner attempts `delete` on `/products/item-1`, or any user attempts `read`/`write` on `/admins/hack`.
