import { Inter } from 'next/font/google';
import Script from 'next/script';
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    display: 'swap',
});

export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zizhub.vercel.app'),
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    },
};

export default async function LocaleLayout(props) {
    const params = await props.params;
    const { locale } = params;
    const { children } = props;

    const isRtl = locale === 'ar';

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizhub.vercel.app';
    const websiteJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'ZizHub',
        'url': `${SITE_URL}/${locale}`,
        'potentialAction': {
            '@type': 'SearchAction',
            'target': {
                '@type': 'EntryPoint',
                'urlTemplate': `${SITE_URL}/${locale}?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        }
    };

    const organizationJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'ZizHub',
        'url': `${SITE_URL}/${locale}`,
        'logo': `${SITE_URL}/icon-512.png`
    };

    return (
        <div dir={isRtl ? 'rtl' : 'ltr'} lang={locale} className={inter.className}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
            />
            {children}
            <SpeedInsights />

            {/* Script publicitaire Adsterra (Popunder / Social Bar) */}
            <Script
                src="https://bashsecret.com/20/6e/e9/206ee9fc8937e09edad8756e7612d82c.js"
                strategy="lazyOnload"
            />
        </div>
    );
}

// Generate static params for all supported locales to enable ISR/static export optimization
export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'ar' }];
}
