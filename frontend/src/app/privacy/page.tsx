'use client';

import Link from 'next/link';
import { Box, Container, Typography, Button } from '@mui/material';

export default function PrivacyPolicy() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', py: { xs: 10, sm: 12 } }}>
      <Container maxWidth="md">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Button sx={{ mb: 3, textTransform: 'none', color: '#6b7280' }}>← Back to Home</Button>
        </Link>

        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#111827' }}>
          Privacy Policy
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af', mb: 4 }}>
          Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, color: '#374151', lineHeight: 1.8 }}>
          <Section title="1. Information We Collect">
            <P>When you use Outcave, we may collect:</P>
            <Ul>
              <li>Your name and email address (via Google Sign-In)</li>
              <li>Your assessment responses (Phase 1 questionnaire; optional premium add-on if you purchase it)</li>
              <li>Basic device information (for example browser type) for improving the experience</li>
              <li>
                <strong>Technical access logs:</strong> when you use our website or API, our servers may record your
                IP address, the path requested, and a short browser identifier (user agent). We use this for security,
                abuse prevention, and understanding how the service is used. These logs are not used for advertising.
              </li>
            </Ul>
            <P>We do NOT collect sensitive personal data such as Aadhaar numbers, financial details, or biometric data.</P>
          </Section>

          <Section title="2. How We Use Your Information">
            <Ul>
              <li>To generate your stream recommendation and career matches</li>
              <li>To create and deliver your assessment report</li>
              <li>To improve our assessment accuracy and user experience</li>
              <li>To communicate important updates about your account</li>
              <li>To protect the service, investigate issues, and comply with legal obligations where applicable</li>
            </Ul>
          </Section>

          <Section title="3. Data Storage & Security">
            <P>
              Your data is stored securely on encrypted servers. Assessment responses are linked to your account
              and are not shared with third parties. We use industry-standard security measures to protect your information.
            </P>
          </Section>

          <Section title="4. Third-Party Services">
            <P>We use the following third-party services:</P>
            <Ul>
              <li><strong>Google Sign-In</strong> — for authentication (governed by Google&apos;s Privacy Policy)</li>
              <li><strong>Razorpay</strong> — for payment processing (governed by Razorpay&apos;s Privacy Policy)</li>
            </Ul>
            <P>We do not sell, rent, or share your personal data with advertisers or data brokers.</P>
          </Section>

          <Section title="5. Your Rights">
            <P>You have the right to:</P>
            <Ul>
              <li>Access your personal data</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of non-essential communications</li>
            </Ul>
            <P>To exercise these rights, contact us at <strong>haryan458@gmail.com</strong>.</P>
          </Section>

          <Section title="6. Children's Privacy">
            <P>
              Outcave is designed for students aged 13 and above. We encourage students under 18 to use
              the platform with parental awareness. We do not knowingly collect data from children under 13.
            </P>
          </Section>

          <Section title="7. Changes to This Policy">
            <P>
              We may update this Privacy Policy from time to time. Changes will be posted on this page
              with an updated date. Continued use of Outcave constitutes acceptance of the updated policy.
            </P>
          </Section>

          <Section title="8. Contact Us">
            <P>
              For any questions about this Privacy Policy, reach out at{' '}
              <strong>haryan458@gmail.com</strong>.
            </P>
          </Section>
        </Box>
      </Container>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>{title}</Typography>
      {children}
    </Box>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>{children}</Typography>;
}

function Ul({ children }: { children: React.ReactNode }) {
  return <Box component="ul" sx={{ pl: 3, mb: 1, '& li': { mb: 0.5 } }}>{children}</Box>;
}
