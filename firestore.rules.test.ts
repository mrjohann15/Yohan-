// Security verification suite for firestore.rules against the Dirty Dozen payloads.
// Designed for execution with @firebase/rules-unit-testing when a Firestore Emulator is running.

export const DIRTY_DOZEN_CASES = [
  { id: 1, name: 'Unauthenticated Create', operation: 'create', path: 'products/item-1', auth: null, expected: 'PERMISSION_DENIED' },
  { id: 2, name: 'Non-Owner Authenticated Create', operation: 'create', path: 'products/item-1', auth: { uid: 'u2', email: 'attacker@example.com', email_verified: true }, expected: 'PERMISSION_DENIED' },
  { id: 3, name: 'Unverified Owner Email Spoof', operation: 'create', path: 'products/item-1', auth: { uid: 'u3', email: 'liennardjohn15@gmail.com', email_verified: false }, expected: 'PERMISSION_DENIED' },
  { id: 4, name: 'Shadow Field Injection', operation: 'create', path: 'products/item-1', extraField: { isAdmin: true }, expected: 'PERMISSION_DENIED' },
  { id: 5, name: 'Identity Spoofing on Create', operation: 'create', path: 'products/item-1', overrideOwnerId: 'other-uid', expected: 'PERMISSION_DENIED' },
  { id: 6, name: 'Client Timestamp Forgery', operation: 'create', path: 'products/item-1', forgedCreatedAt: '2020-01-01T00:00:00Z', expected: 'PERMISSION_DENIED' },
  { id: 7, name: 'Immutable Field Tampering on Update', operation: 'update', path: 'products/item-1', tamperFields: ['ownerId', 'createdAt'], expected: 'PERMISSION_DENIED' },
  { id: 8, name: 'Value Poisoning (Negative Price)', operation: 'update', path: 'products/item-1', payload: { price: -50 }, expected: 'PERMISSION_DENIED' },
  { id: 9, name: 'Resource Exhaustion (Oversized Name)', operation: 'create', path: 'products/item-1', nameLength: 2000, expected: 'PERMISSION_DENIED' },
  { id: 10, name: 'Path ID Poisoning', operation: 'create', path: 'products/bad$id', expected: 'PERMISSION_DENIED' },
  { id: 11, name: 'Draft Scraping by Non-Owner', operation: 'get', path: 'products/draft-item', auth: null, expected: 'PERMISSION_DENIED' },
  { id: 12, name: 'Non-Owner Delete', operation: 'delete', path: 'products/item-1', auth: { uid: 'u2', email: 'attacker@example.com', email_verified: true }, expected: 'PERMISSION_DENIED' },
] as const;
