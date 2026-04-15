import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { getCareerBySlugCached } from '@/lib/seo/careerServer';
import { SITE_NAME } from '@/lib/seo/site';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const career = await getCareerBySlugCached(params.slug);
  const path = `/careers/${params.slug}`;

  if (!career) {
    return {
      title: 'Career',
      alternates: { canonical: path },
    };
  }

  const desc =
    career.description.length > 158
      ? `${career.description.slice(0, 155)}…`
      : career.description;

  return {
    title: career.name,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      title: `${career.name} (${career.stream}) | ${SITE_NAME}`,
      description: desc,
      url: path,
    },
    twitter: {
      title: `${career.name} | ${SITE_NAME}`,
      description: desc,
    },
  };
}

export default async function CareerSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const career = await getCareerBySlugCached(params.slug);

  if (!career) {
    return children;
  }

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Occupation',
    name: career.name,
    description: career.description,
    occupationalCategory: career.stream,
  };

  return (
    <>
      <JsonLd data={ld} />
      {children}
    </>
  );
}
