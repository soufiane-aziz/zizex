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
            ? "Contactez l'équipe Zizex pour toute question ou suggestion. Nous sommes là pour vous aider."
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
        openGraph: { title, description, url: `${SITE_URL}/${locale}/contact`, siteName: 'Zizex', type: 'website' },
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

    const contactJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        '@id': `${SITE_URL}/${locale}/contact`,
        'url': `${SITE_URL}/${locale}/contact`,
        'name': isAr ? 'تواصل معنا' : isFr ? 'Contactez-nous' : 'Contact Us',
        'isPartOf': { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, 'name': 'Zizex', 'url': SITE_URL },
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Zizex', 'item': `${SITE_URL}/${locale}` },
            { '@type': 'ListItem', 'position': 2, 'name': isAr ? 'تواصل معنا' : isFr ? 'Contact' : 'Contact', 'item': `${SITE_URL}/${locale}/contact` },
        ],
    };

    const cards = isAr
        ? [
            {
                icon: 'fa-envelope',
                title: 'البريد الإلكتروني المباشر',
                desc: 'تواصل مع فريق الدعم مباشرة عبر البريد الإلكتروني وسنرد عليك في أقرب وقت.',
                href: 'mailto:a.soufiane.dev@gmail.com',
                label: 'إرسال بريد إلكتروني',
                sublabel: 'الدعم والرد السريع',
                accent: 'from-red-600/20 to-red-950/40',
            },
            {
                icon: 'fa-bug',
                title: 'الإبلاغ عن مشكلة تقنية',
                desc: 'هل واجهت مشكلة في التشغيل أو خطأ في الموقع؟ ساعدنا في تحسين المنصة.',
                href: 'mailto:a.soufiane.dev@gmail.com?subject=Bug Report - Zizex',
                label: 'إبلاغ عن خطأ',
                sublabel: 'الدعم الفني المباشر',
                accent: 'from-amber-600/20 to-amber-950/40',
            },
            {
                icon: 'fa-clapperboard',
                title: 'طلب فيلم أو مسلسل',
                desc: 'لم تجد عملك المفضل؟ اقترح إضافة فيلم أو مسلسل وسنقوم بتوفيره فوراً.',
                href: 'mailto:a.soufiane.dev@gmail.com?subject=Content Request - Zizex',
                label: 'طلب إضافة محتوى',
                sublabel: 'اقتراح وإضافة المحتوى',
                accent: 'from-rose-600/20 to-rose-950/40',
            },
        ]
        : isFr
            ? [
                {
                    icon: 'fa-envelope',
                    title: 'E-mail Direct',
                    desc: 'Contactez notre équipe de support directement et nous vous répondons rapidement.',
                    href: 'mailto:a.soufiane.dev@gmail.com',
                    label: 'Envoyer un Email',
                    sublabel: 'Support Rapide & Dédié',
                    accent: 'from-red-600/20 to-red-950/40',
                },
                {
                    icon: 'fa-bug',
                    title: 'Signaler un Problème',
                    desc: 'Problème de lecteur ou erreur technique ? Signalez-le pour correction immédiate.',
                    href: 'mailto:a.soufiane.dev@gmail.com?subject=Bug Report - Zizex',
                    label: 'Signaler un Bug',
                    sublabel: 'Assistance Technique',
                    accent: 'from-amber-600/20 to-amber-950/40',
                },
                {
                    icon: 'fa-clapperboard',
                    title: 'Demander un Contenu',
                    desc: 'Vous ne trouvez pas votre film ou série ? Suggérez-le et nous l’ajouterons.',
                    href: 'mailto:a.soufiane.dev@gmail.com?subject=Content Request - Zizex',
                    label: 'Demander un Film/Série',
                    sublabel: 'Ajout de Contenu',
                    accent: 'from-rose-600/20 to-rose-950/40',
                },
            ]
            : [
                {
                    icon: 'fa-envelope',
                    title: 'Direct Email',
                    desc: 'Reach out to our support team directly. We typically reply within 24 hours.',
                    href: 'mailto:a.soufiane.dev@gmail.com',
                    label: 'Send Direct Email',
                    sublabel: 'Fast Support Response',
                    accent: 'from-red-600/20 to-red-950/40',
                },
                {
                    icon: 'fa-bug',
                    title: 'Report Technical Bug',
                    desc: 'Found a video playback glitch or broken link? Let us know so we can fix it.',
                    href: 'mailto:a.soufiane.dev@gmail.com?subject=Bug Report - Zizex',
                    label: 'Report an Issue',
                    sublabel: 'Technical Support',
                    accent: 'from-amber-600/20 to-amber-950/40',
                },
                {
                    icon: 'fa-clapperboard',
                    title: 'Request Movie or TV Show',
                    desc: "Can't find your favorite title? Request a movie or series and we'll add it.",
                    href: 'mailto:a.soufiane.dev@gmail.com?subject=Content Request - Zizex',
                    label: 'Request Content',
                    sublabel: 'Content Suggestions',
                    accent: 'from-rose-600/20 to-rose-950/40',
                },
            ];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <main dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-[#070708] text-gray-200 relative overflow-hidden flex flex-col justify-between">

                {/* Ambient background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-red-600/15 via-red-900/5 to-transparent blur-3xl pointer-events-none -z-10" />

                <div>
                    {/* Hero Header */}
                    <section className="relative px-4 sm:px-6 pt-12 sm:pt-20 pb-10 sm:pb-14 text-center border-b border-zinc-800/80">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest mb-5 mx-auto">
                            <i className="fa-solid fa-headset text-xs" />
                            <span>{isAr ? 'مركز الدعم والتواصل' : isFr ? 'Centre d’Aide & Contact' : 'Support & Contact Center'}</span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3 text-center">
                            {isAr ? (
                                <>نحن هنا <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">لمساعدتك</span></>
                            ) : isFr ? (
                                <>Contactez <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">Zizex</span></>
                            ) : (
                                <>Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">Touch</span></>
                            )}
                        </h1>

                        <p className="text-gray-400 text-xs sm:text-base max-w-lg mx-auto leading-relaxed text-center">
                            {isAr
                                ? 'هل لديك أي استفسار، اقتراح، أو واجهتك مشكلة؟ لا تتردد في التواصل معنا في أي وقت.'
                                : isFr
                                    ? 'Des questions, suggestions ou remarques ? Écrivez-nous et notre équipe vous répondra.'
                                    : 'Have a question, feedback, or need help? We are always happy to hear from you.'}
                        </p>
                    </section>

                    {/* Contact Cards Grid */}
                    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {cards.map((card, i) => (
                                <div
                                    key={i}
                                    className="group bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 hover:border-red-500/40 rounded-2xl p-6 flex flex-col items-center text-center justify-between transition-all duration-300 shadow-xl hover:shadow-red-600/10 hover:-translate-y-1"
                                >
                                    <div className="flex flex-col items-center text-center w-full">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.accent} border border-red-500/20 text-red-500 text-2xl flex items-center justify-center mb-5 mx-auto group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-lg`}>
                                            <i className={`fa-solid ${card.icon}`} />
                                        </div>

                                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest block mb-1 text-center">
                                            {card.sublabel}
                                        </span>
                                        <h2 className="text-white font-bold text-base sm:text-lg mb-2 text-center group-hover:text-red-400 transition-colors duration-200">
                                            {card.title}
                                        </h2>
                                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 text-center">
                                            {card.desc}
                                        </p>
                                    </div>

                                    <a
                                        href={card.href}
                                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shadow-lg shadow-red-600/20 group-hover:shadow-red-600/30"
                                    >
                                        <span>{card.label}</span>
                                        <i className={`fa-solid ${isAr ? 'fa-arrow-left' : 'fa-arrow-right'} text-xs transform group-hover:translate-x-1 transition-transform`} />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Back to Home Button */}
                <div className="text-center pb-12 pt-4">
                    <a
                        href={`/${locale}`}
                        className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-gray-400 hover:text-white text-xs sm:text-sm font-medium transition-all duration-200 shadow-md mx-auto"
                    >
                        <i className={`fa-solid ${isAr ? 'fa-arrow-right' : 'fa-arrow-left'} text-xs text-red-500`} />
                        <span>{isAr ? 'العودة إلى الرئيسية' : isFr ? "Retour à l'accueil" : 'Back to Home'}</span>
                    </a>
                </div>

            </main>
        </>
    );
}
