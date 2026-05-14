// Superseded: free-topic gating now reads from the `is_free` column on the
// `topics` (and `subjects`) database tables. These hardcoded sets are kept
// only as a fallback reference and are no longer consulted at runtime.
export const FREE_TOPIC_IDS = new Set([
  'f4289169-82b1-41c1-8b6d-cc8f61e9aaa8', // English Language AQA — Reading: Fiction & Literary Non-Fiction
  '59283ba2-7862-4daf-a6d4-a3cf694132f5', // English Literature AQA — An Inspector Calls
  '01503f0a-cb23-4fe7-a865-9d68bd683262', // History AQA — Medicine Through Time
  'f24456bd-60a0-4eb5-9243-5fb3fe6331a0', // Computer Science — Systems Architecture
  '2f89226b-2a7c-42b6-80f7-937bce050251', // Business Studies — Business in the Real World
  '480cb1c4-76f6-41c8-8fb3-0c3e54573e90', // PE — Applied Anatomy & Physiology
  'e8d0e7de-a56e-4ade-9c08-5f95c7d9c1c2', // Chemistry (Combined) AQA — Atomic Structure & the Periodic Table
  '64003556-e5cf-4328-99c0-6224adfc9471', // Chemistry (Separate) AQA — Atomic Structure & the Periodic Table
]);

export const FREE_SUBJECT_IDS = new Set([
  '813b5fdc-8020-4978-81f2-e9d498bed54f', // English Language AQA
  '1f37d924-d678-46ec-b3a4-5d973455e0eb', // English Literature AQA
  '9694cb29-cfb2-4b9d-b517-ce230936152e', // History AQA
  '32f9f399-0a0e-4e8a-b2c6-19ba538493a2', // Computer Science
  'b75f5a42-e078-485d-b910-2ccea6a8ff09', // Business Studies
  '3735e027-1de9-4ae7-a53b-4907ef0f6482', // Physical Education
  '64b717d4-d8c6-4fb7-bb53-b03f3c39a483', // Chemistry (Combined) AQA
  '9e03ae6f-b528-42f8-86c3-ffa9a75addd9', // Chemistry (Separate) AQA
]);
