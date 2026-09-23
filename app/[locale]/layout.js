import Script from 'next/script';
import dynamic from 'next/dynamic';

const InstallPWA = dynamic(() => import('../../components/InstallPWA'));

// Only load the 2 weights actually used. preload:true lets Next.js add <link rel="preload"> in <head>.
const inter = { className: 'font-sans' };

export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app'),
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'RetFRXiOgoyM5G7xUBlpRIQIZ85-z80QTyCx0lX21pM',
    },
};

export default async function LocaleLayout(props) {
    const params = await props.params;
    const { locale } = params;
    const { children } = props;

    const isRtl = locale === 'ar';

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';
    const webPageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${SITE_URL}/${locale}#webpage`,
        'url': `${SITE_URL}/${locale}`,
        'name': locale === 'ar'
            ? 'Zizex - موقع Zizex مشاهدة أفلام ومسلسلات أونلاين مجاناً'
            : locale === 'fr'
                ? 'Zizex - Regarder Films et Séries en Streaming Gratuit | Site Officiel'
                : 'Zizex - Watch Free Movies & TV Shows Online | Official Site',
        'inLanguage': locale,
        'isPartOf': {
            '@type': 'WebSite',
            '@id': 'https://zizex.vercel.app/#website',
            'name': 'Zizex',
            'url': 'https://zizex.vercel.app/'
        }
    };

    return (
        <div dir={isRtl ? 'rtl' : 'ltr'} lang={locale} className={inter.className}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
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
