import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Bodoni_Moda, Geist_Mono, Outfit } from 'next/font/google'
import { CustomCursor } from '@/components/custom-cursor'
import './globals.css'

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.toimoi.co'),
  title: {
    default: 'TOIMOI | Private Matchmaking & Dating Coaching in New York',
    template: '%s | TOIMOI',
  },
  description: 'TOIMOI is a private matchmaking and dating coaching house in New York. Personalized introductions and guidance for meaningful connection.',
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
    'TOIMOI',
  ],
  authors: [{ name: 'TOIMOI' }],
  creator: 'TOIMOI',
  publisher: 'TOIMOI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.toimoi.co',
    siteName: 'TOIMOI',
    title: 'TOIMOI | Private Matchmaking & Dating Coaching',
    description: 'A private matchmaking and dating coaching house in New York.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TOIMOI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TOIMOI | Private Matchmaking & Dating Coaching',
    description: 'A private matchmaking and dating coaching house in New York.',
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
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: '/icon.svg',
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
    name: 'TOIMOI',
    description: 'Private matchmaking and dating coaching in New York.',
    url: 'https://www.toimoi.co',
    logo: 'https://www.toimoi.co/og-image.jpg',
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
    serviceType: ['Matchmaking', 'Dating Coaching', 'Relationship Consultation'],
    priceRange: '$$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    sameAs: [],
    founder: [
      {
        '@type': 'Person',
        name: 'Noga Cohen',
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
    <html lang="en" className={`${bodoni.variable} ${outfit.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        <CustomCursor />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
