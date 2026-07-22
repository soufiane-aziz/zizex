import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    display: 'swap',
});

export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zshow.vercel.app'),
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    },
};

export default async function LocaleLayout(props) {
    const params = await props.params;
    const { locale } = params;
    const { children } = props;

    const isRtl = locale === 'ar';

    return (
        <div dir={isRtl ? 'rtl' : 'ltr'} className={inter.className}>
            {children}
            <Analytics />
            <SpeedInsights />

            {/* Script publicitaire Adsterra (Popunder / Social Bar) */}
            <Script
                src="https://environmenttalentrabble.com/68/12/fd/6812fd2ddecf93fdec55c8887f83a17c.js"
                strategy="lazyOnload"
            />
        </div>
    );
}

// Generate static params for all supported locales to enable ISR/static export optimization
export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'ar' }];
}
