const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';

export async function generateMetadata(props) {
    const params = await props.params;
    const { locale } = params;

    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const title = isAr
        ? 'إشعار حقوق النشر (DMCA) | Zizex'
        : isFr
            ? 'Politique DMCA & Droits d\'Auteur | Zizex'
            : 'DMCA Copyright Policy | Zizex';

    const description = isAr
        ? 'سياسة حقوق النشر DMCA وإجراءات طلب حذف المحتوى على منصة Zizex.'
        : isFr
            ? 'Politique DMCA et procédures de demande de retrait de contenu sur Zizex.'
            : 'DMCA Copyright Policy and takedown request procedures for Zizex platform.';

    return {
        title,
        description,
        robots: { index: true, follow: true },
        alternates: {
            canonical: `${SITE_URL}/${locale}/dmca`,
            languages: {
                en: `${SITE_URL}/en/dmca`,
                fr: `${SITE_URL}/fr/dmca`,
                ar: `${SITE_URL}/ar/dmca`,
                'x-default': `${SITE_URL}/en/dmca`,
            },
        },
    };
}

export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'ar' }];
}

export default async function DmcaPage(props) {
    const params = await props.params;
    const { locale } = params;

    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Zizex', 'item': `${SITE_URL}/${locale}` },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': isAr ? 'إشعار حقوق النشر DMCA' : isFr ? 'Politique DMCA' : 'DMCA Policy',
                'item': `${SITE_URL}/${locale}/dmca`,
            },
        ],
    };

    const sections = isAr
        ? [
            {
                icon: 'fa-server',
                title: '1. بيان عدم استضافة المحتوى',
                body: 'Zizex لا يقوم باستضافة، أو رفع، أو حفظ أي ملفات فيديو أو وسائط على خوادمه الخاصة. جميع مقاطع الفيديو والمعلومات المعروضة يتم تضمينها (Embedding) من مشغلين ومصادر خارجية مستقلة من طرف ثالث لا تتبع لمنصتنا.'
            },
            {
                icon: 'fa-scale-balanced',
                title: '2. الامتثال لقانون DMCA',
                body: 'نحن نلتزم بشدة بقانون حماية حقوق المؤلف للملفات الرقمية (DMCA). بصفتنا دليل فهرسة فقط، نتعامل بجدية تامة مع جميع طلبات انتهاك حقوق الملكية الفكرية ونوفر آلية سريعة لحذف الروابط المخالفة.'
            },
            {
                icon: 'fa-list-check',
                title: '3. متطلبات إشعار طلب الحذف',
                body: 'لكي يتم معالجة طلب الحذف، يجب أن يتضمن الإشعار: اسم المالك أو الوكيل المخول، رابط الصفحة المخالفة على موقعنا، إثبات ملكية المحتوى، وبيانات الاتصال الخاصة بك.'
            },
            {
                icon: 'fa-clock-rotate-left',
                title: '4. زمن الاستجابة والحذف',
                body: 'بمجرد استلام إشعار قانوني مكتمل ومطابق لمتطلبات DMCA، يتعهد فريقنا بمراجعة الرابط وحذفه نهائياً من الموقع في غضون 24 إلى 48 ساعة عمل.'
            },
            {
                icon: 'fa-envelope-open-text',
                title: '5. إرسال الطلبات والتواصل',
                body: 'يرجى إرسال جميع إشعارات حقوق النشر الرسمية مباشرة إلى البريد الإلكتروني الرسمي لحقوق النشر: a.soufiane.dev@gmail.com'
            },
        ]
        : isFr
            ? [
                {
                    icon: 'fa-server',
                    title: '1. Absence d\'hébergement de contenu',
                    body: 'Zizex n\'héberge, ne télécharge et ne stocke aucun fichier vidéo ou média sur ses serveurs. Tout le contenu affiché est directement intégré (via iframe) à partir de lecteurs vidéo tiers indépendants.'
                },
                {
                    icon: 'fa-scale-balanced',
                    title: '2. Conformité à la loi DMCA',
                    body: 'Nous respectons rigoureusement le Digital Millennium Copyright Act (DMCA). En tant que simple annuaire d\'indexation, nous traitons avec le plus grand sérieux toute notification de violation de droits d\'auteur.'
                },
                {
                    icon: 'fa-list-check',
                    title: '3. Éléments requis pour la notification',
                    body: 'Pour être valide, votre demande doit inclure : le nom du titulaire des droits ou de son agent, l\'URL exacte de la page concernée sur notre site, une preuve de propriété ainsi que vos coordonnées de contact.'
                },
                {
                    icon: 'fa-clock-rotate-left',
                    title: '4. Délais de traitement',
                    body: 'Dès réception d\'une notification conforme aux exigences légales DMCA, notre équipe s\'engage à retirer le lien signalé dans un délai de 24 à 48 heures ouvrables.'
                },
                {
                    icon: 'fa-envelope-open-text',
                    title: '5. Adresse de contact officielle',
                    body: 'Veuillez adresser vos avis de retrait officiels directement à notre équipe juridique via l\'adresse email dédiée : a.soufiane.dev@gmail.com'
                },
            ]
            : [
                {
                    icon: 'fa-server',
                    title: '1. No Hosting Disclaimer',
                    body: 'Zizex does not host, stream, or store any video files or media content on its own servers. All content is embedded directly via standard iframe tags from non-affiliated third-party video platforms.'
                },
                {
                    icon: 'fa-scale-balanced',
                    title: '2. DMCA Safe Harbor Compliance',
                    body: 'We strictly comply with the Digital Millennium Copyright Act (DMCA). Operating as an indexing directory, we promptly act upon valid copyright infringement notices to remove non-compliant links.'
                },
                {
                    icon: 'fa-list-check',
                    title: '3. Required Information for Takedown',
                    body: 'To submit a valid notice, please provide: physical/electronic signature of the copyright owner or agent, direct URL(s) of the material to be removed, proof of copyright ownership, and valid contact details.'
                },
                {
                    icon: 'fa-clock-rotate-left',
                    title: '4. Response & Processing Window',
                    body: 'Upon receipt of a complete DMCA compliant notification, our administrative team will review and execute link removals within 24 to 48 business hours.'
                },
                {
                    icon: 'fa-envelope-open-text',
                    title: '5. Submitting Copyright Notices',
                    body: 'Please send all official legal takedown notices directly to our designated copyright contact: a.soufiane.dev@gmail.com'
                },
            ];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <main dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-[#070708] text-gray-200 relative overflow-hidden flex flex-col justify-between">

                {/* Ambient background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-red-600/15 via-red-900/5 to-transparent blur-3xl pointer-events-none -z-10" />

                <div>
                    {/* Hero Header */}
                    <section className="relative px-4 sm:px-6 pt-12 sm:pt-20 pb-10 sm:pb-14 text-center border-b border-zinc-800/80">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest mb-5 mx-auto">
                            <i className="fa-solid fa-gavel text-xs" />
                            <span>{isAr ? 'إشعار DMCA القانوني' : isFr ? 'Protection DMCA' : 'DMCA Protection'}</span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3 text-center">
                            {isAr ? (
                                <>حقوق النشر <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">DMCA</span></>
                            ) : isFr ? (
                                <>Politique <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">DMCA</span></>
                            ) : (
                                <>DMCA <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">Copyright Policy</span></>
                            )}
                        </h1>

                        <p className="text-gray-400 text-xs sm:text-base max-w-xl mx-auto leading-relaxed text-center">
                            {isAr
                                ? 'التزام منصة Zizex بحماية حقوق الملكية الفكرية وقانون DMCA الدولي.'
                                : isFr
                                    ? 'Engagement de la plateforme Zizex envers la protection des droits d\'auteur et la loi DMCA.'
                                    : 'Zizex\'s commitment to international copyright laws and DMCA safe harbor compliance.'}
                        </p>
                    </section>

                    {/* Content Sections */}
                    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                        <div className="grid grid-cols-1 gap-5">
                            {sections.map((s, i) => (
                                <div
                                    key={i}
                                    className="group bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 hover:border-red-500/40 rounded-2xl p-6 text-center sm:text-start flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 transition-all duration-300 shadow-lg hover:shadow-red-600/5 hover:-translate-y-0.5"
                                >
                                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-950/40 border border-red-500/20 text-red-500 text-xl mx-auto sm:mx-0 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-md">
                                        <i className={`fa-solid ${s.icon}`} />
                                    </div>
                                    <div className="flex-1 w-full text-center sm:text-start">
                                        <h2 className="text-white font-bold text-base sm:text-lg tracking-wide group-hover:text-red-400 transition-colors duration-200 text-center sm:text-start mb-2">
                                            {s.title}
                                        </h2>
                                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed text-center sm:text-start">
                                            {s.body}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Takedown Contact Card */}
                        <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center flex flex-col items-center justify-center gap-4 shadow-xl max-w-2xl mx-auto">
                            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 text-xl flex items-center justify-center mx-auto shrink-0">
                                <i className="fa-solid fa-file-circle-exclamation" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-white font-bold text-base sm:text-lg text-center">
                                    {isAr ? 'هل تريد إرسال طلب حذف DMCA؟' : isFr ? 'Soumettre une demande de retrait DMCA ?' : 'Need to submit a DMCA Takedown Notice?'}
                                </h3>
                                <p className="text-gray-400 text-xs sm:text-sm mt-1 text-center">
                                    {isAr ? 'تواصل معنا مباشرة موضحاً تفاصيل الرابط وسيتم التعامل فوراً.' : isFr ? 'Contactez-nous directement avec les URLs concernées pour un traitement rapide.' : 'Send us the affected URLs directly for immediate removal.'}
                                </p>
                            </div>
                            <a
                                href={`mailto:a.soufiane.dev@gmail.com?subject=DMCA%20Takedown%20Request%20-%20Zizex`}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-red-600/20 hover:scale-105 shrink-0 mx-auto"
                            >
                                <i className="fa-solid fa-paper-plane" />
                                <span>{isAr ? 'إرسال طلب DMCA' : isFr ? 'Envoyer une demande DMCA' : 'Send DMCA Notice'}</span>
                            </a>
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
