import { JsonLd } from '@/components/seo/JsonLd';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo/site';

export function SiteStructuredData() {
  const logoUrl = `${SITE_URL}/logo.png`;

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: logoUrl,
          width: 512,
          height: 512,
        },
        description: DEFAULT_DESCRIPTION,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: 'en-IN',
        description: DEFAULT_DESCRIPTION,
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  };

  return <JsonLd data={graph} />;
}
