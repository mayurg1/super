import { Card } from '@supercampus/shared';

interface PrivacySection {
  title: string;
  body: string;
}

const SECTIONS: PrivacySection[] = [
  {
    title: 'What we collect',
    body: 'Depending on your role, we collect: your name, email, bio, department, program, graduation year, residency status (day scholar/hostel resident), designation (faculty/alumni/hostel staff), or phone number and business name (vendors). We also store content you create — posts, comments, marketplace listings, project details, hostel requests — and your role/permission assignments.',
  },
  {
    title: 'Why we collect it',
    body: 'To operate core features: campus feed, directory, marketplace, hostel services, job/event listings, and project collaboration. To verify your role (student, faculty, etc.) and grant appropriate access. To let other verified members of your campus find and connect with you, subject to your visibility settings.',
  },
  {
    title: 'Who can see your data',
    body: 'Your profile visibility (private/campus/public) controls who can view your profile details. Role approval is reviewed by campus administrators. We do not sell your data or share it with third parties for advertising.',
  },
  {
    title: 'How long we keep it',
    body: 'Your data is retained while your account is active. You may request deletion of your account and associated data at any time by contacting a campus administrator.',
  },
  {
    title: 'Your rights',
    body: 'You can access, correct, or request deletion of your personal data. You can control your directory visibility in your Profile settings at any time.',
  },
  {
    title: 'Security',
    body: 'Access to your data is enforced at the database level through row-level security — no one outside your permitted visibility settings and authorized administrators can access your records. Passwords are never stored in plain text (handled by Supabase Auth).',
  },
  {
    title: 'Contact',
    body: 'For privacy questions or data deletion requests, contact [ADD CONTACT EMAIL].',
  },
  {
    title: 'Compliance',
    body: 'This notice is provided in line with the Digital Personal Data Protection Act, 2023 (India).',
  },
];

export function PrivacyPolicyPage(): React.ReactElement {
  return (
    <div className="sc-auth-page">
      <Card padding="lg" className="sc-privacy-card">
        <h1 className="sc-page-title">SuperCampus Privacy Notice</h1>
        <p className="sc-page-desc">Learn how we collect, use, and protect your data.</p>
        {SECTIONS.map((section) => (
          <section key={section.title} className="sc-privacy-section">
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </Card>
    </div>
  );
}