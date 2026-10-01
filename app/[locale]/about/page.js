const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';

export async function generateMetadata(props) {
    const params = await props.params;
    const { locale } = params;

    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const title = isAr
        ? 'من نحن | Zizex - منصة البث المجاني الرسمية'
        : isFr
            ? 'À Propos | Zizex - Plateforme de Streaming Officielle'
            : 'About Zizex | Official Free Streaming Platform';

    const description = isAr
        ? 'تعرف على منصة Zizex، الوجهة الرسمية لمشاهدة أفضل الأفلام والمسلسلات مجاناً عبر الإنترنت بجودة HD.'
        : isFr
            ? 'Découvrez Zizex, la plateforme officielle pour regarder gratuitement les meilleurs films et séries en streaming HD.'
            : 'Learn about Zizex, the official free streaming destination to watch thousands of top movies and TV series online in HD.';

    return {
        title,
        description,
        alternates: {
            canonical: `${SITE_URL}/${locale}/about`,
            languages: {
                en: `${SITE_URL}/en/about`,
                fr: `${SITE_URL}/fr/about`,
                ar: `${SITE_URL}/ar/about`,
                'x-default': `${SITE_URL}/en/about`,
            },
        },
        openGraph: {
            title,
            description,
            url: `${SITE_URL}/${locale}/about`,
            siteName: 'Zizex',
            type: 'website',
        },
    };
}

export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'ar' }];
}

export default async function AboutPage(props) {
    const params = await props.params;
    const { locale } = params;

    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const content = {
        hero: isAr
            ? { headline: 'مرحباً بك في Zizex', sub: 'منصة البث المجاني الرسمية لمشاهدة الأفلام والمسلسلات' }
            : isFr
                ? { headline: 'Bienvenue sur Zizex', sub: 'La plateforme de streaming gratuite officielle pour films et séries' }
                : { headline: 'Welcome to Zizex', sub: 'The official free streaming platform for movies and TV shows' },

        mission: isAr
            ? { title: 'مهمتنا', body: 'تأسست Zizex بهدف تقديم تجربة بث مجانية وسلسة لجميع المشاهدين حول العالم. نؤمن بأن محتوى الترفيه الجيد يجب أن يكون متاحاً للجميع — بدون اشتراكات، بدون أسعار مخفية.' }
            : isFr
                ? { title: 'Notre Mission', body: "Zizex a été créé pour offrir une expérience de streaming gratuite et fluide à tous les spectateurs du monde. Nous croyons que le divertissement de qualité doit être accessible à tous — sans abonnements, sans frais cachés." }
                : { title: 'Our Mission', body: 'Zizex was founded to deliver a seamless free streaming experience to every viewer worldwide. We believe great entertainment should be accessible to all — no subscriptions, no hidden fees.' },

        features: isAr
            ? [
                { icon: '🎬', title: 'مكتبة ضخمة', desc: 'آلاف الأفلام والمسلسلات من مختلف الأنواع والأجيال.' },
                { icon: '🌍', title: 'محتوى متعدد اللغات', desc: 'استمتع بالمحتوى باللغة العربية والإنجليزية والفرنسية.' },
                { icon: '📱', title: 'متوافق مع جميع الأجهزة', desc: 'شاهد على الهاتف أو الجهاز اللوحي أو الحاسوب بسهولة.' },
                { icon: '🆓', title: 'مجاني 100%', desc: 'لا اشتراكات، لا بطاقات ائتمانية. استمتع مجاناً للأبد.' },
            ]
            : isFr
                ? [
                    { icon: '🎬', title: 'Catalogue Immense', desc: 'Des milliers de films et séries de tous genres et époques.' },
                    { icon: '🌍', title: 'Multi-langue', desc: 'Profitez du contenu en Français, Anglais et Arabe.' },
                    { icon: '📱', title: 'Tous Appareils', desc: 'Regardez sur mobile, tablette ou ordinateur facilement.' },
                    { icon: '🆓', title: '100% Gratuit', desc: 'Aucun abonnement, aucune carte bancaire. Gratuit pour toujours.' },
                ]
                : [
                    { icon: '🎬', title: 'Huge Library', desc: 'Thousands of movies and TV shows across all genres and eras.' },
                    { icon: '🌍', title: 'Multi-language', desc: 'Enjoy content in English, French, and Arabic.' },
                    { icon: '📱', title: 'All Devices', desc: 'Watch on mobile, tablet, or desktop with ease.' },
                    { icon: '🆓', title: '100% Free', desc: 'No subscriptions, no credit cards. Free forever.' },
                ],

        faq: isAr
            ? [
                { q: 'ما هو موقع Zizex؟', a: 'Zizex هو موقع بث مجاني يتيح لك مشاهدة الأفلام والمسلسلات عبر الإنترنت بجودة HD دون أي تكلفة.' },
                { q: 'هل Zizex مجاني؟', a: 'نعم! Zizex مجاني بالكامل. لا تحتاج إلى تسجيل أو اشتراك.' },
                { q: 'كيف أشاهد على Zizex؟', a: 'فقط ابحث عن الفيلم أو المسلسل الذي تريده وانقر للمشاهدة الفورية.' },
                { q: 'هل Zizex يعمل على الهاتف؟', a: 'نعم، Zizex يعمل على جميع الأجهزة: الهاتف، الجهاز اللوحي، والحاسوب.' },
            ]
            : isFr
                ? [
                    { q: "C'est quoi Zizex ?", a: "Zizex est un site de streaming gratuit qui permet de regarder films et séries en ligne en HD sans aucun coût." },
                    { q: "Zizex est-il gratuit ?", a: "Oui ! Zizex est entièrement gratuit. Aucune inscription ni abonnement requis." },
                    { q: "Comment regarder sur Zizex ?", a: "Recherchez simplement le film ou la série que vous souhaitez et cliquez pour regarder instantanément." },
                    { q: "Zizex fonctionne-t-il sur mobile ?", a: "Oui, Zizex fonctionne sur tous les appareils : téléphone, tablette et ordinateur." },
                ]
                : [
                    { q: 'What is Zizex?', a: 'Zizex is a free streaming website that lets you watch movies and TV shows online in HD with no cost.' },
                    { q: 'Is Zizex free?', a: 'Yes! Zizex is completely free. No sign-up or subscription required.' },
                    { q: 'How do I watch on Zizex?', a: 'Simply search for the movie or show you want and click to watch instantly.' },
                    { q: 'Does Zizex work on mobile?', a: 'Yes, Zizex works on all devices: phone, tablet, and desktop.' },
                ],

        ctaLabel: isAr ? 'ابدأ المشاهدة الآن' : isFr ? 'Commencer à Regarder' : 'Start Watching Now',
        ctaHref: `/${locale}`,
    };

    // FAQ JSON-LD for Google rich snippets
    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': content.faq.map(({ q, a }) => ({
            '@type': 'Question',
            'name': q,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': a,
            },
        })),
    };

    // BreadcrumbList JSON-LD
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Zizex',
                'item': `${SITE_URL}/${locale}`,
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': isAr ? 'من نحن' : isFr ? 'À Propos' : 'About',
                'item': `${SITE_URL}/${locale}/about`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <main
                dir={isAr ? 'rtl' : 'ltr'}
                style={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #0a0a0f 0%, #111827 50%, #0a0a0f 100%)',
                    color: '#f1f5f9',
                    fontFamily: "'Inter', 'Segoe UI', sans-serif",
                    padding: '0',
                }}
            >
                {/* Hero */}
                <section
                    style={{
                        textAlign: 'center',
                        padding: '80px 20px 60px',
                        background: 'linear-gradient(180deg, rgba(99,102,241,0.15) 0%, transparent 100%)',
                        borderBottom: '1px solid rgba(99,102,241,0.2)',
                    }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎬</div>
                    <h1
                        style={{
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #a78bfa, #6366f1, #60a5fa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: '0 0 16px',
                        }}
                    >
                        {content.hero.headline}
                    </h1>
                    <p
                        style={{
                            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                            color: '#94a3b8',
                            maxWidth: '640px',
                            margin: '0 auto',
                            lineHeight: 1.7,
                        }}
                    >
                        {content.hero.sub}
                    </p>
                </section>

                {/* Mission */}
                <section
                    style={{
                        maxWidth: '820px',
                        margin: '60px auto',
                        padding: '0 20px',
                    }}
                >
                    <div
                        style={{
                            background: 'rgba(99,102,241,0.08)',
                            border: '1px solid rgba(99,102,241,0.25)',
                            borderRadius: '20px',
                            padding: '40px',
                        }}
                    >
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#a78bfa', margin: '0 0 16px' }}>
                            {content.mission.title}
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.8, margin: 0 }}>
                            {content.mission.body}
                        </p>
                    </div>
                </section>

                {/* Features */}
                <section style={{ maxWidth: '1000px', margin: '0 auto 60px', padding: '0 20px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '20px',
                        }}
                    >
                        {content.features.map((f, i) => (
                            <div
                                key={i}
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '16px',
                                    padding: '28px 24px',
                                    textAlign: 'center',
                                    transition: 'transform 0.2s, border-color 0.2s',
                                }}
                            >
                                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{f.icon}</div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', margin: '0 0 8px' }}>{f.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section style={{ maxWidth: '820px', margin: '0 auto 60px', padding: '0 20px' }}>
                    <h2
                        style={{
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            textAlign: 'center',
                            color: '#e2e8f0',
                            marginBottom: '32px',
                        }}
                    >
                        {isAr ? 'الأسئلة الشائعة' : isFr ? 'Questions Fréquentes' : 'Frequently Asked Questions'}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {content.faq.map((item, i) => (
                            <div
                                key={i}
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '12px',
                                    padding: '20px 24px',
                                }}
                            >
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#a78bfa', margin: '0 0 8px' }}>
                                    {item.q}
                                </h3>
                                <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: 0, lineHeight: 1.7 }}>
                                    {item.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section style={{ textAlign: 'center', padding: '0 20px 80px' }}>
                    <a
                        href={content.ctaHref}
                        style={{
                            display: 'inline-block',
                            padding: '16px 40px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            borderRadius: '50px',
                            textDecoration: 'none',
                            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                    >
                        {content.ctaLabel}
                    </a>
                </section>
            </main>
        </>
    );
}
