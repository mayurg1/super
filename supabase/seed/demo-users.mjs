// SUPERCAMPUS — Full demo-content seed for student / alumni / faculty.
//
// Creates demo auth users (via the Supabase ADMIN API — hashed passwords are
// handled by Supabase Auth), then:
//   - creates/confirms each auth account,
//   - fills the profiles row (role-specific fields) + privacy consent,
//   - grants the role via `user_roles`,
//   - records an `approved` role request (audit-trail consistency),
//   - adds role-appropriate education/experience/skills,
//   - seeds feed posts, marketplace listings, and projects.
//
// Idempotent: skips any user whose email already exists; on-conflict guards
// everywhere. Safe to re-run.
//
// Server-only: requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (never expose
// the service role key to the browser). Falls back to the project URL + service
// key already used by `supabase/reset-superadmin.mjs` when env vars are absent,
// so it defaults to the repo's configured dev/demo environment.

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PASSWORD = 'Demo1234!'; // shared demo password for manual testing
const CAMPUS_CODE = 'supercampus-main';

// ───────────────────────────── env / client ─────────────────────────────
function readServiceEnv() {
  const fromEnv = {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  if (fromEnv.url && fromEnv.key) return fromEnv;

  // Fallback: reuse the URL + service key already committed to
  // supabase/reset-superadmin.mjs (the repo's dev/demo admin script).
  const file = join(process.cwd(), 'supabase', 'reset-superadmin.mjs');
  if (existsSync(file)) {
    const src = readFileSync(file, 'utf8');
    const url = src.match(/https:\/\/[a-z0-9]+\.supabase\.co/)?.[0];
    const key = src.match(/eyJ[A-Za-z0-9_.-]{10,}/)?.[0];
    if (url && key) return { url, key };
  }
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or keep supabase/reset-superadmin.mjs).');
}

const { url: SUPABASE_URL, key: SERVICE_KEY } = readServiceEnv();
const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

console.log(`Targeting Supabase environment: ${SUPABASE_URL}`);
if (!/^https:\/\/.*supabase\.co$/i.test(SUPABASE_URL)) {
  throw new Error('Refusing to run against a non-Supabase-hosted URL.');
}

// ───────────────────────────── demo dataset ─────────────────────────────
const DEPARTMENTS = {
  cse: 'Computer Science',
  aids: 'AI & Data Science',
  ise: 'Information Science',
  ece: 'Electronics & Communication',
  eee: 'Electrical & Electronics',
  mech: 'Mechanical',
  civil: 'Civil',
  mba: 'MBA',
};

function student(name, email, dept, gradYear) {
  return { kind: 'student', name, email, dept, gradYear };
}
function alumni(name, email, dept, gradYear, designation) {
  return { kind: 'alumni', name, email, dept, gradYear, designation };
}
function faculty(name, email, dept, designation) {
  return { kind: 'faculty', name, email, dept, designation };
}

const DEMO_USERS = [
  student('Aarav Sharma', 'aarav.sharma@demo.supercampus.test', 'cse', 2028),
  student('Ananya Iyer', 'ananya.iyer@demo.supercampus.test', 'aids', 2027),
  student('Rohan Mehta', 'rohan.mehta@demo.supercampus.test', 'mba', 2026),
  student('Sneha Reddy', 'sneha.reddy@demo.supercampus.test', 'ece', 2028),
  student('Vikram Singh', 'vikram.singh@demo.supercampus.test', 'ise', 2027),
  student('Priya Nair', 'priya.nair@demo.supercampus.test', 'cse', 2029),

  alumni('Kavya Krishnan', 'kavya.krishnan@demo.supercampus.test', 'cse', 2021, 'Software Engineer at TechNova'),
  alumni('Aditya Rao', 'aditya.rao@demo.supercampus.test', 'aids', 2020, 'Data Scientist at CloudLabs'),
  alumni('Meera Joshi', 'meera.joshi@demo.supercampus.test', 'ece', 2019, 'Hardware Lead at CircuitWorks'),
  alumni('Dev Patel', 'dev.patel@demo.supercampus.test', 'mba', 2022, 'Product Manager at FinEdge'),

  faculty('Ramesh Verma', 'ramesh.verma@demo.supercampus.test', 'cse', 'Assistant Professor — CSE'),
  faculty('Sunita Gupta', 'sunita.gupta@demo.supercampus.test', 'aids', 'Associate Professor — AI & Data Science'),
  faculty('Farhan Khan', 'farhan.khan@demo.supercampus.test', 'eee', 'Assistant Professor — EEE'),
  faculty('Meenakshi Desai', 'meenakshi.desai@demo.supercampus.test', 'mba', 'Professor — MBA'),
];

const FEED_POSTS = [
  'Welcome to the new term! 📚 Drop a comment and tell everyone what you are studying this semester.',
  'Hostel common-room cleanup is scheduled for Saturday morning. Volunteers welcome!',
  'Reminder: the campus tech symposium registrations close this Friday. Save your seat now.',
  'Any alumni here working in fintech? Looking to connect and learn about your journey.',
  'Lost a blue water bottle near the library courtyard — happy to grab it from the lost-and-found.',
  'Faculty office hours for AI & Data Science are now posted on the department board.',
  'Project group for the DBMS course still needs one more member — frontend or backend, both fine.',
  'Marketplace: selling a scientific calculator and a barely-used backpack, great condition.',
  'The campus cafeteria added a new South Indian counter this week — highly recommend the masala dosa.',
];

const MARKET_LININGS = [
  { title: 'Scientific Calculator (CASIO fx-991EX)', price: 750, condition: 'good', desc: 'Used for one semester, works perfectly, bundled with the original soft case.' },
  { title: 'Classic Backpack', price: 899, condition: 'good', desc: 'Grey 22L backpack, front laptop sleeve, minimal wear.' },
  { title: 'Textbook Bundle — Data Structures', price: 450, condition: 'fair', desc: 'Second edition, some notes in margins, all chapters intact.' },
  { title: 'Mechanical Keyboard', price: 1499, condition: 'like_new', desc: 'TKL red switches, bought a month ago, barely used.' },
];

const PROJECTS = [
  { title: 'Campus Events Calendar', category: 'Web', summary: 'A shared calendar for workshops, fests, and departmental talks.', body: 'Building a single source of truth for campus events so students can find and register for activities across departments.' },
  { title: 'Hostel Complaint Tracker', category: 'Web', summary: 'A simple dashboard for residents to track hostel complaints and maintenance.', body: 'Helping residents see status updates on maintenance requests and outpass workflows.' },
  { title: 'Alumni Mentorship Network', category: 'Mobile', summary: 'Connecting current students with alumni mentors for career guidance.', body: 'Matching students to alumni by department and career interest, with an in-app chat.' },
];



// ───────────────────────────── helpers ─────────────────────────────
const splitName = (full) => {
  const [given, ...rest] = full.trim().split(/\s+/);
  return { given, family: rest.join(' ') || '' };
};

async function seedSkills(skillNames) {
  const records = {};
  for (const name of skillNames) {
    const { data: existing } = await admin.from('skills').select('id').eq('name', name).maybeSingle();
    let id = existing?.id;
    if (!id) {
      const { data: created } = await admin.from('skills').insert({ name }).select('id').single();
      id = created?.id;
    }
    if (id) records[name] = id;
  }
  return records;
}

async function ensureRoleRequest(userId, roleId, campusId) {
  const { data: existing } = await admin
    .from('role_requests')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .maybeSingle();
  if (existing?.id) return;
  await admin.from('role_requests').insert({
    user_id: userId,
    requested_role_id: roleId,
    campus_id: campusId,
    status: 'approved',
    reviewed_at: new Date().toISOString(),
  });
}


// ───────────────────────────── main ─────────────────────────────
async function main() {
  const [campusRes, rolesRes, depsRes, progsRes, demoAdmin] = await Promise.all([
    admin.from('campuses').select('id').eq('code', CAMPUS_CODE).maybeSingle(),
    admin.from('roles').select('id,key'),
    admin.from('departments').select('id,code'),
    admin.from('programs').select('id,department_id,code'),
    admin.from('profiles').select('id,email').limit(1),
  ]);

  const campus = campusRes.data;
  if (!campus) throw new Error(`Campus "${CAMPUS_CODE}" not found. Run supabase/seed/campuses.sql first.`);

  const roleIds = Object.fromEntries((rolesRes.data ?? []).map((r) => [r.key, r.id]));
  const deptIds = Object.fromEntries((depsRes.data ?? []).map((d) => [d.code, d.id]));
  const programs = progsRes.data ?? [];

  // Existing demo admin (for reviewed_by / granted_by).
  const adminId = demoAdmin.data?.[0]?.id ?? null;

  // Enumerate existing auth users once for idempotency.
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existingEmail = new Set((existingUsers?.users ?? []).map((u) => u.email));

  const results = [];
  const skillMap = await seedSkills([
    'JavaScript', 'TypeScript', 'React', 'Python', 'SQL', 'Data Analysis',
    'Machine Learning', 'Circuit Design', 'Public Speaking', 'Marketing', 'Figma',
  ]);

  for (const u of DEMO_USERS) {
    const { email } = u;
    const created = !existingEmail.has(email);
    let userId;

    if (created) {
      const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
        email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: u.name },
      });
      if (authErr) {
        results.push({ email, status: 'ERROR', detail: authErr.message });
        continue;
      }
      userId = authUser.user.id;
    } else {
      const match = existingUsers.users.find((x) => x.email === email);
      userId = match.id;
    }

    const { given, family } = splitName(u.name);
    const handle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '.');
    const campusId = campus.id;
    const deptId = deptIds[u.dept];
    const program = u.kind === 'student'
      ? programs.find((p) => p.department_id === deptId && p.code === `btech-${u.dept}`)
      : null;

    // 1) profiles (the auth trigger already created a row; update it here).
    const profilePatch = {
      campus_id: campusId,
      department_id: deptId,
      program_id: u.kind === 'student' ? program?.id ?? null : null,
      given_name: given,
      family_name: family || null,
      display_name: u.name,
      handle,
      directory_visibility: 'campus',
      is_active: true,
      privacy_consent_at: new Date().toISOString(),
      ...(u.kind === 'alumni' ? { graduation_year: u.gradYear, designation: u.designation } : {}),
      ...(u.kind === 'student' ? { graduation_year: u.gradYear } : {}),
      ...(u.kind === 'faculty' ? { designation: u.designation } : {}),
      ...(u.kind === 'student' ? { bio: `${u.name} is a ${DEPARTMENTS[u.dept]} undergraduate, batch of ${u.gradYear}.` } : {}),
      ...(u.kind === 'alumni' ? { bio: `${u.name} is an alumnus working as ${u.designation}.` } : {}),
      ...(u.kind === 'faculty' ? { bio: `${u.name} is ${u.designation} at SUPERCAMPUS.` } : {}),
    };
    const profileRef = await admin.from('profiles').update(profilePatch).eq('id', userId).select('id');
    if (profileRef.error) {
      // Fail loudly instead of silently continuing with a broken row.
      throw new Error(`profiles.update failed for ${u.email} (user ${userId}): ${profileRef.error.message}`);
    }
    if (!profileRef.data || profileRef.data.length === 0) {
      throw new Error(`profiles.update matched 0 rows for ${u.email} (user ${userId}) — expected the auth-trigger profile row to exist.`);
    }


    // 2) Grant the role, matching the campus scope of the profile.
    const roleId = roleIds[u.kind];
    await admin.from('user_roles').upsert(
      { user_id: userId, role_id: roleId, campus_id: campusId, granted_by: adminId },
      { onConflict: 'user_id,role_id,campus_id' },
    );

    // 3) Approved role request for a consistent audit trail.
    await ensureRoleRequest(userId, roleId, campusId);

    // 4) Role-specific education / experience / skills.
    if (u.kind === 'student') {
      await admin.from('profile_educations').insert({
        profile_id: userId,
        institution: 'SUPERCAMPUS',
        program: `${DEPARTMENTS[u.dept]} — B.Tech`,
        started_on: new Date().toISOString().slice(0, 10),
      });
      for (const s of ['JavaScript', 'Python', 'SQL']) {
        if (skillMap[s]) {
          await admin.from('profile_skills').upsert(
            { profile_id: userId, skill_id: skillMap[s], proficiency: 3 },
            { onConflict: 'profile_id,skill_id' },
          );
        }
      }
    }
    if (u.kind === 'alumni') {
      await admin.from('profile_educations').insert({
        profile_id: userId,
        institution: 'SUPERCAMPUS',
        program: `${DEPARTMENTS[u.dept]} — Degree (${u.gradYear})`,
        started_on: `${u.gradYear - 4}-07-01`,
        ended_on: `${u.gradYear}-06-30`,
      });
      await admin.from('profile_experiences').insert({
        profile_id: userId,
        employer: u.designation.split(' at ')[1] || 'Tech firm',
        title: u.designation.split(' at ')[0],
        is_current: true,
        visibility: 'public',
      });
      for (const s of ['TypeScript', 'Data Analysis', 'Public Speaking']) {
        if (skillMap[s]) {
          await admin.from('profile_skills').upsert(
            { profile_id: userId, skill_id: skillMap[s], proficiency: 4 },
            { onConflict: 'profile_id,skill_id' },
          );
        }
      }
    }
    if (u.kind === 'faculty') {
      await admin.from('profile_experiences').insert({
        profile_id: userId,
        employer: 'SUPERCAMPUS',
        title: u.designation,
        is_current: true,
        visibility: 'public',
      });
      for (const s of ['TypeScript', 'Machine Learning', 'Figma']) {
        if (skillMap[s]) {
          await admin.from('profile_skills').upsert(
            { profile_id: userId, skill_id: skillMap[s], proficiency: 5 },
            { onConflict: 'profile_id,skill_id' },
          );
        }
      }
    }

    results.push({ email, role: u.kind, status: created ? 'created' : 'existed' });
  }


  // ─────────── marketplace categories (idempotent) ───────────
  const cats = ['Books', 'Electronics', 'Bags & Luggage', 'Stationery'];
  const catIds = {};
  for (const c of cats) {
    const { data } = await admin.from('marketplace_categories').select('id').eq('name', c).maybeSingle();
    let id = data?.id;
    if (!id) {
      const { data: rec } = await admin
        .from('marketplace_categories')
        .insert({ name: c, slug: c.toLowerCase().replace(/\s+/g, '-'), is_active: true })
        .select('id').single();
      id = rec?.id;
    }
    catIds[c] = id;
  }

  const handleFor = (email) => email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '.');
  async function profileIdFor(email) {
    const { data } = await admin.from('profiles').select('id').eq('handle', handleFor(email)).maybeSingle();
    return data?.id ?? null;
  }

  // sellers — use a few created student/faculty ids
  const sellerIds = [];
  for (const u of DEMO_USERS.filter((x) => x.kind === 'student' || x.kind === 'faculty')) {
    const id = await profileIdFor(u.email);
    if (id) sellerIds.push(id);
  }
  const sellerCycle = sellerIds.length ? sellerIds : [adminId].filter(Boolean);

  for (let i = 0; i < MARKET_LININGS.length; i++) {
    const m = MARKET_LININGS[i];
    const { data: existing } = await admin.from('marketplace_products').select('id').eq('title', m.title).maybeSingle();
    if (existing?.id) continue;
    await admin.from('marketplace_products').insert({
      seller_id: sellerCycle[i % sellerCycle.length],
      campus_id: campus.id,
      category_id: catIds[i === 0 || i === 3 ? 'Electronics' : i === 1 ? 'Bags & Luggage' : 'Books'] ?? null,
      title: m.title,
      description: m.desc,
      condition: m.condition,
      price: m.price,
      currency: 'INR',
      status: 'active',
    });
  }

  // ─────────── projects (idempotent) ───────────
  const projectOwners = [];
  for (const u of DEMO_USERS.filter((x) => x.kind === 'student')) {
    const id = await profileIdFor(u.email);
    if (id) projectOwners.push(id);
  }
  const ownerCycle = projectOwners.length ? projectOwners : [adminId].filter(Boolean);
  for (let i = 0; i < PROJECTS.length; i++) {
    const p = PROJECTS[i];
    const { data: existing } = await admin.from('projects').select('id').eq('title', p.title).maybeSingle();
    if (existing?.id) continue;
    await admin.from('projects').insert({
      owner_id: ownerCycle[i % ownerCycle.length],
      campus_id: campus.id,
      title: p.title,
      summary: p.summary,
      body: p.body,
      category: p.category,
      status: 'open',
      visibility: 'campus',
    });
  }

  // ─────────── feed posts (idempotent per body) ───────────
  const postAuthors = [];
  for (const u of DEMO_USERS) {
    const id = await profileIdFor(u.email);
    if (id) postAuthors.push(id);
  }
  const authorCycle = postAuthors.length ? postAuthors : [adminId].filter(Boolean);
  for (let i = 0; i < FEED_POSTS.length; i++) {
    const body = FEED_POSTS[i];
    const { data: existing } = await admin.from('posts').select('id').eq('body', body).maybeSingle();
    if (existing?.id) continue;
    await admin.from('posts').insert({
      author_id: authorCycle[i % authorCycle.length],
      campus_id: campus.id,
      body,
      visibility: 'campus',
      status: 'published',
      published_at: new Date(Date.now() - i * 3600_000).toISOString(),
    });
  }

  console.log('\n=== SEED SUMMARY ===');
  for (const r of results) {
    console.log(`${r.status.toUpperCase().padEnd(9)} ${r.email}  (${r.role})${r.detail ? `  [${r.detail}]` : ''}`);
  }
  if (results.some((r) => r.status === 'ERROR')) process.exitCode = 1;
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
