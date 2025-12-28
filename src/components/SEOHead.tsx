import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  schema?: object | object[];
  ogImage?: string;
  noIndex?: boolean;
}

const BASE_URL = 'https://www.typebit8.com';

export function SEOHead({
  title,
  description,
  path,
  schema,
  ogImage = '/og-image.png',
  noIndex = false,
}: SEOHeadProps) {
  const fullUrl = `${BASE_URL}${path}`;
  const fullTitle = path === '/' ? title : `${title} | typebit8`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(schema) ? schema : [schema])}
        </script>
      )}
    </Helmet>
  );
}

// Pre-defined schemas for reuse
export const schemas = {
  softwareApplication: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'typebit8',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier with 9 levels',
    },
    description:
      'Learn touch typing with all 10 fingers through gamified lessons. Master the keyboard with typebit8.',
    screenshot: 'https://www.typebit8.com/screenshot.png',
    featureList: [
      '50 Progressive Lessons',
      'Daily Challenges',
      'Streak Tracking',
      'Leaderboards',
      'Multiple Keyboard Layouts',
    ],
  },

  course: {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: '10-Finger Touch Typing Course',
    description:
      'Learn proper touch typing from scratch with our free 10-finger typing course. Master the home row, top row, and bottom row with progressive lessons.',
    provider: {
      '@type': 'Organization',
      name: 'typebit8',
      sameAs: 'https://www.typebit8.com',
    },
    educationalLevel: 'Beginner',
    isAccessibleForFree: true,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT10H',
    },
    teaches: [
      'Touch typing',
      '10-finger typing technique',
      'Keyboard muscle memory',
      'Typing speed improvement',
    ],
  },

  webApplication: (name: string, url: string, features: string[]) => ({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: features,
  }),

  faqPage: (faqs: Array<{ question: string; answer: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }),

  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'typebit8',
    url: 'https://www.typebit8.com',
    logo: 'https://www.typebit8.com/logo.png',
    description: 'Gamified touch typing education platform',
    founder: {
      '@type': 'Organization',
      name: 'Steininger AG',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Zug',
      addressCountry: 'Switzerland',
    },
  },
};
