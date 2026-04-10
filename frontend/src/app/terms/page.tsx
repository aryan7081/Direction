'use client';

import Link from 'next/link';
import { Box, Container, Typography, Button } from '@mui/material';

export default function TermsOfService() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', py: { xs: 10, sm: 12 } }}>
      <Container maxWidth="md">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Button sx={{ mb: 3, textTransform: 'none', color: '#6b7280' }}>← Back to Home</Button>
        </Link>

        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#111827' }}>
          Terms of Service
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af', mb: 4 }}>
          Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, color: '#374151', lineHeight: 1.8 }}>
          <Section title="1. About Outcave">
            <P>
              Outcave is a career discovery platform for Indian students. We provide a psychometric
              assessment that recommends academic streams (Science, Commerce, Arts) and matched career
              paths based on your interests, traits, and personality.
            </P>
          </Section>

          <Section title="2. Eligibility">
            <P>
              Outcave is intended for students aged 13 and above. By using the platform, you confirm that
              you meet this age requirement. Students under 18 are encouraged to use the platform with parental knowledge.
            </P>
          </Section>

          <Section title="3. Account & Authentication">
            <P>
              You may sign in using Google Sign-In. You are responsible for maintaining the security of your
              account. Do not share your login credentials with others.
            </P>
          </Section>

          <Section title="4. Assessment & Recommendations">
            <P>
              Our assessment is based on established psychometric frameworks (RIASEC, personality traits) and is
              intended as a guidance tool only. Recommendations should be considered alongside advice from
              parents, teachers, and career counsellors.
            </P>
            <P>
              <strong>Outcave does not guarantee admission to any institution, job placement, or specific career outcome.</strong>
            </P>
          </Section>

          <Section title="5. Payments & Refunds">
            <P>
              Some features (detailed career report, PDF download) may require payment. Payments are
              processed securely through Razorpay. All prices are in Indian Rupees (INR).
            </P>
            <P>
              Due to the digital nature of the product, refunds are handled on a case-by-case basis.
              Contact <strong>support@outcave.in</strong> within 7 days of purchase if you have concerns.
            </P>
          </Section>

          <Section title="6. Intellectual Property">
            <P>
              All content on Outcave — including questions, scoring algorithms, career data, and reports — is
              the intellectual property of Outcave. You may not reproduce, distribute, or commercially use any
              content without written permission.
            </P>
          </Section>

          <Section title="7. Prohibited Use">
            <P>You agree not to:</P>
            <Ul>
              <li>Use automated tools to access the assessment</li>
              <li>Attempt to reverse-engineer the scoring system</li>
              <li>Share or resell assessment reports for commercial purposes</li>
              <li>Misrepresent your identity during registration</li>
            </Ul>
          </Section>

          <Section title="8. Limitation of Liability">
            <P>
              Outcave provides career guidance as an informational tool. We are not liable for decisions made
              based on our recommendations. The platform is provided &quot;as is&quot; without warranties of any kind.
            </P>
          </Section>

          <Section title="9. Changes to Terms">
            <P>
              We may update these Terms from time to time. Continued use of Outcave after changes constitutes
              acceptance. Material changes will be communicated via email or on-site notification.
            </P>
          </Section>

          <Section title="10. Governing Law">
            <P>
              These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive
              jurisdiction of courts in India.
            </P>
          </Section>

          <Section title="11. Contact">
            <P>
              For questions about these Terms, reach out at <strong>support@outcave.in</strong>.
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
