import Script from 'next/script';
import dynamic from 'next/dynamic';

const InstallPWA = dynamic(() => import('../../components/InstallPWA'));

// Only load the 2 weights actually used. preload:true lets Next.js add <link rel="preload"> in <head>.
const inter = { className: 'font-sans' };

export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://filmoxa.vercel.app'),
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'RetFRXiOgoyM5G7xUBlpRIQIZ85-z80QTyCx0lX21pM',
    },
};

export default async function LocaleLayout(props) {
    const params = await props.params;
    const { locale } = params;
    const { children } = props;

    const isRtl = locale === 'ar';

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://filmoxa.vercel.app';
    const websiteJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Filmoxa',
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
        'name': 'Filmoxa',
        'url': `${SITE_URL}/${locale}`,
        'logo': `${SITE_URL}/logo.png`
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
            <InstallPWA locale={locale} />

        </div>
    );
}

// Generate static params for all supported locales to enable ISR/static export optimization
export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'ar' }];
}
