// One-time backfill: set profiles.campus_id for the 14 demo users.
// Safety: only touches rows whose auth email is in DEMO_EMAILS; sets ONLY campus_id
// (deliberately excludes privacy_consent_at — that column does not exist in this DB),
// and verifies each update's { error } + returned rows instead of assuming success.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const ROOT = 'C:/Users/mayur/Desktop/supercampus/supercampus-production';
const CAMPUS = '7b72ab11-3d63-452c-bcc8-f37353156db8'; // supercampus-main

const rsa = readFileSync(ROOT + '/supabase/reset-superadmin.mjs', 'utf8');
const URL = rsa.match(/https:\/\/[a-z0-9]+\.supabase\.co/)[0];
const KEY = rsa.match(/eyJ[A-Za-z0-9_.-]{10,}/)[0];
const sbx = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

// Confirm the campus exists before we point 14 profiles at it.
const { data: campus, error: campusErr } = await sbx.from('campuses').select('id, code').eq('id', CAMPUS).maybeSingle();
if (campusErr || !campus) {
  throw new Error(`Campus ${CAMPUS} not found: ${campusErr?.message ?? 'missing'}`);
}
console.log('Campus', campus.code, campus.id, 'found.');

const DEMO_EMAILS = [
  'aarav.sharma@demo.supercampus.test', 'ananya.iyer@demo.supercampus.test',
  'rohan.mehta@demo.supercampus.test', 'sneha.reddy@demo.supercampus.test',
  'vikram.singh@demo.supercampus.test', 'priya.nair@demo.supercampus.test',
  'kavya.krishnan@demo.supercampus.test', 'aditya.rao@demo.supercampus.test',
  'meera.joshi@demo.supercampus.test', 'dev.patel@demo.supercampus.test',
  'ramesh.verma@demo.supercampus.test', 'sunita.gupta@demo.supercampus.test',
  'farhan.khan@demo.supercampus.test', 'meenakshi.desai@demo.supercampus.test',
];

const { data: users } = await sbx.auth.admin.listUsers();
const uidByEmail = new Map((users?.users ?? []).map((u) => [u.email.toLowerCase(), u.id]));

let updated = 0;
let skipped = 0;
let failed = 0;
for (const email of DEMO_EMAILS) {
  const uid = uidByEmail.get(email.toLowerCase());
  if (!uid) { console.log('SKIP (no auth user):', email); skipped++; continue; }

  const before = (await sbx.from('profiles').select('campus_id').eq('id', uid).maybeSingle()).data?.campus_id ?? null;
  // UPDATE ONLY campus_id — deliberately no privacy_consent_at.
  const { data: rows, error } = await sbx
    .from('profiles')
    .update({ campus_id: CAMPUS })
    .eq('id', uid)
    .select('id, campus_id');
  if (error) { console.log('ERROR  ', email, '->', error.message); failed++; continue; }
  const matched = rows?.length ?? 0;
  if (matched === 0) { console.log('ERROR  ', email, '-> 0 rows matched'); failed++; continue; }
  updated++;
  console.log(`OK     ${email.padEnd(44)} before=${String(before)} -> now=${rows[0].campus_id} rows=${matched}`);
}

console.log(`\nDone. updated=${updated} skipped=${skipped} failed=${failed}`);
if (failed > 0) process.exitCode = 1;