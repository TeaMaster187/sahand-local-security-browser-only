# Security Spec: Sahand Tactical System

## Data Invariants
1. AuditTrailEntry: Cannot be modified or deleted once created.
2. Directive: Must belong to authorized users. Cannot be modified if status is "Done" or "Completed".
3. Protocol: Read-only for authenticated users.

## The "Dirty Dozen" Payloads
1. Unauthorized user write: `db.collection('audit_trail').add({...})` (Unauth) -> PERMISSION_DENIED
2. Unauthorized user read: `db.collection('audit_trail').get()` (Unauth) -> PERMISSION_DENIED
3. Directive deletion: `db.collection('directives').doc('id').delete()` -> PERMISSION_DENIED
4. Illegal update to Audit: `db.collection('audit_trail').doc('id').update({...})` -> PERMISSION_DENIED
5. Missing Title in Directive: `db.collection('directives').add({status: 'Pending', progress: 50})` -> PERMISSION_DENIED
6. Invalid Progress type in Directive: `db.collection('directives').add({title: 'T', status: 'Pending', progress: '50', desc: 'D'})` -> PERMISSION_DENIED
7. Huge String in Directive: `db.collection('directives').add({title: 'T', status: 'Pending', progress: 50, desc: 'A'.repeat(5000)})` -> PERMISSION_DENIED
8. Spoof Email Verify: payload with `email_verified: false` -> PERMISSION_DENIED
9. Ghost Field Directive: payload with `ghostField: true` -> PERMISSION_DENIED
10. Update locked Directive: `db.collection('directives').doc('id').update({progress: 60})` (status: Done) -> PERMISSION_DENIED
11. Protocol write attempt: `db.collection('protocols').add({...})` -> PERMISSION_DENIED
12. PI Isolation (if added): User attempting to read another user's private info -> PERMISSION_DENIED

## Test Runner (firestore.rules.test.ts)
[Firestore Unit Test Mockup]
- Using firebase-rules-test-library to assert PERMISSION_DENIED on all 12 cases.
