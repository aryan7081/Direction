'use client';

import Link from 'next/link';
import { Box, Container, Typography, Button } from '@mui/material';

const SUPPORT_EMAIL = 'haryan458@gmail.com';
const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;

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
        <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1 }}>
          Operated for users in India. Website:{' '}
          <Link href="https://www.outcave.in" style={{ color: '#6b7280' }}>
            www.outcave.in
          </Link>
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af', mb: 4 }}>
          Last updated: 10 April 2026
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, color: '#374151', lineHeight: 1.8 }}>
          <Section title="1. About Outcave">
            <P>
              Outcave is a career discovery platform for Indian students. We provide a psychometric
              assessment that recommends academic streams (Science, Commerce, Arts) and matched career
              paths based on your interests, traits, and personality.
            </P>
            <P>
              These Terms form a binding agreement between you and the operator of Outcave when you use
              our website, assessment, or paid features. If you do not agree, please do not use the service.
            </P>
          </Section>

          <Section title="2. Eligibility">
            <P>
              Outcave is intended for students aged 13 and above. By using the platform, you confirm that
              you meet this age requirement. Students under 18 are encouraged to use the platform with parental
              knowledge and supervision where appropriate.
            </P>
          </Section>

          <Section title="3. Account & authentication">
            <P>
              You may sign in using Google Sign-In. You are responsible for maintaining the security of your
              account and for activity carried out under your account. Do not share your login credentials
              with others. Notify us immediately at{' '}
              <Email /> if you suspect unauthorised access.
            </P>
          </Section>

          <Section title="4. Assessment & recommendations">
            <P>
              Our assessment is based on established psychometric frameworks (for example RIASEC and
              personality-related dimensions) and is intended as a guidance tool only. Recommendations should
              be considered alongside advice from parents, teachers, and qualified career counsellors.
            </P>
            <P>
              <strong>
                Outcave does not guarantee admission to any institution, job placement, or any specific career
                outcome.
              </strong>{' '}
              Results depend on your answers and are not a substitute for professional academic or medical
              advice.
            </P>
          </Section>

          <Section title="5. Payments, pricing & billing">
            <P>
              Some features (such as a detailed career report or PDF download) may require a one-time or bundle
              payment. Prices are displayed before you pay and are in Indian Rupees (INR), inclusive of
              applicable taxes unless stated otherwise at checkout.
            </P>
            <P>
              Payments are processed by our payment partner (for example Razorpay). Outcave does not store your
              full card or UPI credentials; those are handled according to the payment provider&apos;s terms
              and security standards. A successful charge is confirmed when our systems or the payment
              provider record a completed transaction.
            </P>
            <P>
              <strong>Payment issues:</strong> If a payment fails, you are charged twice, the amount debited
              does not match what you agreed to, you did not receive access after a successful payment, or you
              see an unexpected charge, write to us at <Email /> as soon as possible. Include your registered
              email, date and approximate time of payment, payment method (UPI / card / netbanking), and any
              transaction or reference ID shown by your bank or Razorpay receipt. We will investigate and
              respond in reasonable time on business days.
            </P>
          </Section>

          <Section title="6. Refunds & disputes">
            <P>
              Because reports and digital access are delivered instantly after payment where technically
              possible, refunds are limited. Refund or adjustment requests must be emailed to <Email />{' '}
              within <strong>7 calendar days</strong> of the transaction, with the details listed in section
              5. We review each request fairly (for example duplicate charge, technical failure preventing access,
              or non-delivery of paid features).
            </P>
            <P>
              Chargebacks should be a last step after contacting us; raising a dispute with your bank without
              emailing us may delay resolution. For consumer-related concerns you may also use the grievance
              channel in section 11.
            </P>
          </Section>

          <Section title="7. Intellectual property">
            <P>
              All content on Outcave — including questions, scoring logic, career data, and report wording — is
              protected by intellectual property laws. You may not copy, scrape, resell, or commercially
              exploit the assessment or reports without our prior written consent.
            </P>
          </Section>

          <Section title="8. Prohibited use">
            <P>You agree not to:</P>
            <Ul>
              <li>Use bots or automated tools to abuse or scrape the service</li>
              <li>Attempt to reverse-engineer, tamper with, or circumvent security or payment controls</li>
              <li>Share or resell access to paid reports for commercial purposes</li>
              <li>Misrepresent your identity or impersonate another person</li>
            </Ul>
          </Section>

          <Section title="9. Limitation of liability">
            <P>
              Outcave provides career guidance for educational purposes. To the maximum extent permitted by
              applicable law in India, we are not liable for indirect or consequential loss, or for decisions
              you or others make based on the platform. The service is provided &quot;as is&quot; without
              warranties of merchantability or fitness for a particular purpose, except where such exclusions
              are not allowed by law.
            </P>
          </Section>

          <Section title="10. Changes to these Terms">
            <P>
              We may update these Terms from time to time. The &quot;Last updated&quot; date at the top will
              change when we do. Continued use after changes constitutes acceptance of the updated Terms.
              Where changes are material, we may also notify you by email or a notice on the site.
            </P>
          </Section>

          <Section title="11. Governing law & jurisdiction">
            <P>
              These Terms are governed by the laws of India. Disputes arising from these Terms or your use of
              Outcave shall be subject to the jurisdiction of competent courts in India, without prejudice to
              any mandatory rights you may have as a consumer under applicable law.
            </P>
          </Section>

          <Section title="12. Help, support & grievances (including payments)">
            <P>
              For <strong>help using Outcave</strong>, <strong>questions about these Terms</strong>,{' '}
              <strong>billing or payment problems</strong>, <strong>refund requests</strong>, or{' '}
              <strong>technical issues after payment</strong>, contact:
            </P>
            <P sx={{ mb: 2 }}>
              <Typography
                component="a"
                href={SUPPORT_MAILTO}
                sx={{ fontWeight: 700, color: '#15803d', textDecoration: 'underline' }}
              >
                {SUPPORT_EMAIL}
              </Typography>
            </P>
            <P>
              Use a clear subject line (for example &quot;Payment — duplicate charge&quot; or &quot;Report not
              unlocked&quot;). In the body, include: the name on the account, the email you use to sign in,
              what you were trying to buy, date and amount, and any payment reference or screenshot from your
              bank or Razorpay. This helps us resolve payment and access issues faster.
            </P>
            <P>
              We aim to acknowledge grievance and support emails within a reasonable period. If you are not
              satisfied with the outcome, you may pursue remedies available under applicable Indian law,
              including consumer protection channels where they apply to you.
            </P>
            <P>
              For how we handle personal data, see our{' '}
              <Link href="/privacy" style={{ color: '#15803d', fontWeight: 600 }}>
                Privacy Policy
              </Link>
              .
            </P>
          </Section>
        </Box>
      </Container>
    </Box>
  );
}

function Email() {
  return (
    <Typography
      component="a"
      href={SUPPORT_MAILTO}
      sx={{ fontWeight: 700, color: '#15803d', textDecoration: 'underline' }}
    >
      {SUPPORT_EMAIL}
    </Typography>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function P({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return (
    <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.8, ...sx }}>
      {children}
    </Typography>
  );
}

function Ul({ children }: { children: React.ReactNode }) {
  return <Box component="ul" sx={{ pl: 3, mb: 1, '& li': { mb: 0.5 } }}>{children}</Box>;
}
