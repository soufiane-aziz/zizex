const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';

export async function generateMetadata(props) {
    const params = await props.params;
    const { locale } = params;

    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const title = isAr
        ? 'تواصل معنا | Zizex'
        : isFr
            ? 'Contactez-nous | Zizex'
            : 'Contact Us | Zizex';

    const description = isAr
        ? 'تواصل مع فريق Zizex لأي استفسار أو مقترح. نحن هنا لمساعدتك.'
        : isFr
            ? 'Contactez l\'équipe Zizex pour toute question ou suggestion. Nous sommes là pour vous aider.'
            : 'Contact the Zizex team for any inquiry or suggestion. We are here to help you.';

    return {
        title,
        description,
        alternates: {
            canonical: `${SITE_URL}/${locale}/contact`,
            languages: {
                en: `${SITE_URL}/en/contact`,
                fr: `${SITE_URL}/fr/contact`,
                ar: `${SITE_URL}/ar/contact`,
                'x-default': `${SITE_URL}/en/contact`,
            },
        },
        openGraph: {
            title,
            description,
            url: `${SITE_URL}/${locale}/contact`,
            siteName: 'Zizex',
            type: 'website',
        },
    };
}

export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'ar' }];
}

export default async function ContactPage(props) {
    const params = await props.params;
    const { locale } = params;

    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const content = {
        title: isAr ? 'تواصل معنا' : isFr ? 'Contactez-nous' : 'Contact Us',
        sub: isAr
            ? 'هل لديك سؤال أو اقتراح؟ نحن نحب أن نسمع منك!'
            : isFr
                ? 'Avez-vous une question ou une suggestion ? Nous adorons avoir de vos nouvelles !'
                : 'Have a question or suggestion? We love to hear from you!',
        emailLabel: isAr ? 'البريد الإلكتروني' : isFr ? 'E-mail' : 'Email',
        emailDesc: isAr
            ? 'تواصل معنا مباشرة عبر البريد الإلكتروني وسنرد عليك في أقرب وقت ممكن.'
            : isFr
                ? 'Contactez-nous directement par e-mail et nous vous répondrons dans les plus brefs délais.'
                : 'Reach us directly by email and we will reply as soon as possible.',
        reportLabel: isAr ? 'الإبلاغ عن مشكلة' : isFr ? 'Signaler un problème' : 'Report an Issue',
        reportDesc: isAr
            ? 'هل واجهت مشكلة تقنية؟ أخبرنا بها حتى نتمكن من إصلاحها.'
            : isFr
                ? 'Avez-vous rencontré un problème technique ? Informez-nous afin que nous puissions le corriger.'
                : 'Did you encounter a technical issue? Tell us about it so we can fix it.',
        requestLabel: isAr ? 'طلب محتوى' : isFr ? 'Demande de contenu' : 'Content Request',
        requestDesc: isAr
            ? 'لا تجد ما تبحث عنه؟ اقترح فيلماً أو مسلسلاً وسنضيفه.'
            : isFr
                ? 'Vous ne trouvez pas ce que vous cherchez ? Suggérez un film ou une série et nous l\'ajouterons.'
                : "Can't find what you're looking for? Suggest a movie or series and we'll add it.",
        email: 'support@zizex.vercel.app',
    };

    // ContactPage JSON-LD
    const contactJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        '@id': `${SITE_URL}/${locale}/contact`,
        'url': `${SITE_URL}/${locale}/contact`,
        'name': content.title,
        'description': content.sub,
        'isPartOf': {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            'name': 'Zizex',
            'url': SITE_URL,
        },
    };

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
                'name': content.title,
                'item': `${SITE_URL}/${locale}/contact`,
            },
        ],
    };

    const cards = [
        {
            icon: '✉️',
            title: content.emailLabel,
            desc: content.emailDesc,
            action: `mailto:${content.email}`,
            actionLabel: content.email,
        },
        {
            icon: '🐛',
            title: content.reportLabel,
            desc: content.reportDesc,
            action: `mailto:${content.email}?subject=Bug Report`,
            actionLabel: isAr ? 'إبلاغ عن مشكلة' : isFr ? 'Signaler' : 'Report Bug',
        },
        {
            icon: '🎬',
            title: content.requestLabel,
            desc: content.requestDesc,
            action: `mailto:${content.email}?subject=Content Request`,
            actionLabel: isAr ? 'طلب محتوى' : isFr ? 'Demander' : 'Request Content',
        },
    ];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
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
                    padding: '80px 20px',
                }}
            >
                {/* Header */}
                <section style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
                    <h1
                        style={{
                            fontSize: 'clamp(2rem, 5vw, 3rem)',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #a78bfa, #6366f1, #60a5fa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: '0 0 16px',
                        }}
                    >
                        {content.title}
                    </h1>
                    <p
                        style={{
                            fontSize: '1.1rem',
                            color: '#94a3b8',
                            maxWidth: '560px',
                            margin: '0 auto',
                            lineHeight: 1.7,
                        }}
                    >
                        {content.sub}
                    </p>
                </section>

                {/* Cards */}
                <section style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: '24px',
                        }}
                    >
                        {cards.map((card, i) => (
                            <div
                                key={i}
                                style={{
                                    background: 'rgba(99,102,241,0.07)',
                                    border: '1px solid rgba(99,102,241,0.2)',
                                    borderRadius: '20px',
                                    padding: '32px 28px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                }}
                            >
                                <div style={{ fontSize: '2.5rem' }}>{card.icon}</div>
                                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
                                    {card.title}
                                </h2>
                                <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, lineHeight: 1.7, flexGrow: 1 }}>
                                    {card.desc}
                                </p>
                                <a
                                    href={card.action}
                                    style={{
                                        display: 'inline-block',
                                        marginTop: '8px',
                                        padding: '10px 20px',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        borderRadius: '50px',
                                        textDecoration: 'none',
                                        textAlign: 'center',
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    {card.actionLabel}
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Back link */}
                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                    <a
                        href={`/${locale}`}
                        style={{
                            color: '#6366f1',
                            textDecoration: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                        }}
                    >
                        ← {isAr ? 'العودة إلى الرئيسية' : isFr ? 'Retour à l\'accueil' : 'Back to Home'}
                    </a>
                </div>
            </main>
        </>
    );
}
