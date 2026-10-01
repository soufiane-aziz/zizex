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
                { icon: 'fa-film', title: 'مكتبة ضخمة', desc: 'آلاف الأفلام والمسلسلات من مختلف الأنواع والأجيال.' },
                { icon: 'fa-globe', title: 'محتوى متعدد اللغات', desc: 'استمتع بالمحتوى باللغة العربية والإنجليزية والفرنسية.' },
                { icon: 'fa-mobile-screen', title: 'متوافق مع جميع الأجهزة', desc: 'شاهد على الهاتف أو الجهاز اللوحي أو الحاسوب بسهولة.' },
                { icon: 'fa-circle-check', title: 'مجاني 100%', desc: 'لا اشتراكات، لا بطاقات ائتمانية. استمتع مجاناً للأبد.' },
            ]
            : isFr
                ? [
                    { icon: 'fa-film', title: 'Catalogue Immense', desc: 'Des milliers de films et séries de tous genres et époques.' },
                    { icon: 'fa-globe', title: 'Multi-langue', desc: 'Profitez du contenu en Français, Anglais et Arabe.' },
                    { icon: 'fa-mobile-screen', title: 'Tous Appareils', desc: 'Regardez sur mobile, tablette ou ordinateur facilement.' },
                    { icon: 'fa-circle-check', title: '100% Gratuit', desc: 'Aucun abonnement, aucune carte bancaire. Gratuit pour toujours.' },
                ]
                : [
                    { icon: 'fa-film', title: 'Huge Library', desc: 'Thousands of movies and TV shows across all genres and eras.' },
                    { icon: 'fa-globe', title: 'Multi-language', desc: 'Enjoy content in English, French, and Arabic.' },
                    { icon: 'fa-mobile-screen', title: 'All Devices', desc: 'Watch on mobile, tablet, or desktop with ease.' },
                    { icon: 'fa-circle-check', title: '100% Free', desc: 'No subscriptions, no credit cards. Free forever.' },
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

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': content.faq.map(({ q, a }) => ({
            '@type': 'Question',
            'name': q,
            'acceptedAnswer': { '@type': 'Answer', 'text': a },
        })),
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Zizex', 'item': `${SITE_URL}/${locale}` },
            { '@type': 'ListItem', 'position': 2, 'name': isAr ? 'من نحن' : isFr ? 'À Propos' : 'About', 'item': `${SITE_URL}/${locale}/about` },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <main dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-dark-bg text-gray-200">

                {/* Hero */}
                <section className="border-b border-zinc-800/60 text-center px-5 pt-20 pb-16">
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                        <span className="text-crimson-600">Ziz</span><span className="text-white">ex</span>
                        <span className="text-gray-400 font-light block sm:inline sm:ms-3 text-2xl sm:text-3xl mt-1 sm:mt-0">
                            — {isAr ? 'من نحن' : isFr ? 'À Propos' : 'About Us'}
                        </span>
                    </h1>
                    <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                        {content.hero.sub}
                    </p>
                </section>

                {/* Mission */}
                <section className="max-w-3xl mx-auto px-5 py-14">
                    <div className="bg-dark-card border border-zinc-800/60 rounded-2xl p-8 sm:p-10">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-[3px] w-8 bg-crimson-600 rounded" />
                            <h2 className="text-xl font-bold text-white">{content.mission.title}</h2>
                        </div>
                        <p className="text-gray-400 leading-relaxed text-base">{content.mission.body}</p>
                    </div>
                </section>

                {/* Features */}
                <section className="max-w-5xl mx-auto px-5 pb-14">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {content.features.map((f, i) => (
                            <div key={i} className="bg-dark-card border border-zinc-800/60 rounded-xl p-6 text-center hover:border-crimson-700/50 transition-colors duration-200">
                                <i className={`fa-solid ${f.icon} text-crimson-600 text-2xl mb-4 block`} />
                                <h3 className="text-white font-bold text-sm mb-2">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="max-w-3xl mx-auto px-5 pb-14">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-[3px] w-8 bg-crimson-600 rounded" />
                        <h2 className="text-xl font-bold text-white">
                            {isAr ? 'الأسئلة الشائعة' : isFr ? 'Questions Fréquentes' : 'Frequently Asked Questions'}
                        </h2>
                    </div>
                    <div className="flex flex-col gap-3">
                        {content.faq.map((item, i) => (
                            <div key={i} className="bg-dark-card border border-zinc-800/60 rounded-xl p-5 hover:border-zinc-700 transition-colors duration-200">
                                <h3 className="text-white font-semibold text-sm mb-2">{item.q}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center px-5 pb-20">
                    <a
                        href={content.ctaHref}
                        className="inline-block px-8 py-3 bg-crimson-600 hover:bg-crimson-700 text-white font-bold rounded-lg transition-colors duration-200 text-sm"
                    >
                        {content.ctaLabel}
                    </a>
                </section>

            </main>
        </>
    );
}
