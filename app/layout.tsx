import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif"
});
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.toimoi.co'),
  title: {
    default: 'ToiMoi | Luxury Matchmaking & Relationship Coaching in New York',
    template: '%s | ToiMoi Matchmaking',
  },
  description: 'ToiMoi is a boutique matchmaking service in New York offering personalized introductions, relationship coaching, and guidance for meaningful connections. Experience bespoke matchmaking with a deeply personal approach.',
  keywords: [
    'matchmaking',
    'matchmaker',
    'luxury matchmaking',
    'matchmaking service',
    'New York matchmaker',
    'NYC matchmaking',
    'relationship coaching',
    'dating coach',
    'personal matchmaking',
    'bespoke matchmaking',
    'elite matchmaking',
    'professional matchmaking',
    'Jewish matchmaker',
    'relationship guidance',
    'dating service',
    'find love',
    'meaningful connections',
    'ToiMoi',
  ],
  authors: [{ name: 'ToiMoi' }],
  creator: 'ToiMoi',
  publisher: 'ToiMoi',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.toimoi.co',
    siteName: 'ToiMoi',
    title: 'ToiMoi | Luxury Matchmaking & Relationship Coaching',
    description: 'Boutique matchmaking service offering personalized introductions and relationship coaching. Connecting souls, one match at a time.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ToiMoi - Luxury Matchmaking Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ToiMoi | Luxury Matchmaking & Relationship Coaching',
    description: 'Boutique matchmaking service offering personalized introductions and relationship coaching in New York.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://www.toimoi.co',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'ToiMoi',
    description: 'Boutique matchmaking service offering personalized introductions and relationship coaching for meaningful connections.',
    url: 'https://www.toimoi.co',
    logo: 'https://www.toimoi.co/logo.png',
    image: 'https://www.toimoi.co/og-image.jpg',
    telephone: '',
    email: 'toimoinow@gmail.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'New York',
      addressRegion: 'NY',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.7128,
      longitude: -74.0060,
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'New York',
      },
      {
        '@type': 'Country',
        name: 'United States',
      },
    ],
    serviceType: ['Matchmaking', 'Relationship Coaching', 'Dating Consultation'],
    priceRange: '$$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    sameAs: [
      // Add your social media URLs here
      // 'https://www.instagram.com/toimoi',
      // 'https://www.facebook.com/toimoi',
    ],
    founder: [
      {
        '@type': 'Person',
        name: 'Noga Roth',
        jobTitle: 'Co-Founder & Matchmaker',
      },
      {
        '@type': 'Person',
        name: 'Vanessa Gad',
        jobTitle: 'Co-Founder & Matchmaker',
      },
    ],
  }

  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
