const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';

export async function generateMetadata(props) {
    const params = await props.params;
    const { locale } = params;

    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const title = isAr
        ? 'سياسة الخصوصية | Zizex'
        : isFr
            ? 'Politique de Confidentialité | Zizex'
            : 'Privacy Policy | Zizex';

    const description = isAr
        ? 'اقرأ سياسة خصوصية Zizex لمعرفة كيفية جمع بياناتك واستخدامها وحمايتها.'
        : isFr
            ? 'Lisez la politique de confidentialité de Zizex pour savoir comment vos données sont collectées, utilisées et protégées.'
            : 'Read the Zizex privacy policy to understand how your data is collected, used, and protected.';

    return {
        title,
        description,
        robots: { index: true, follow: false },
        alternates: {
            canonical: `${SITE_URL}/${locale}/privacy`,
            languages: {
                en: `${SITE_URL}/en/privacy`,
                fr: `${SITE_URL}/fr/privacy`,
                ar: `${SITE_URL}/ar/privacy`,
                'x-default': `${SITE_URL}/en/privacy`,
            },
        },
    };
}

export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'ar' }];
}

export default async function PrivacyPage(props) {
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
                'name': isAr ? 'سياسة الخصوصية' : isFr ? 'Confidentialité' : 'Privacy Policy',
                'item': `${SITE_URL}/${locale}/privacy`,
            },
        ],
    };

    const sections = isAr
        ? [
            { icon: 'fa-database', title: 'المعلومات التي نجمعها', body: 'قد نجمع بيانات الاستخدام غير الشخصية مثل نوع المتصفح، ونظام التشغيل، والصفحات التي تزورها. لا نجمع أي بيانات شخصية مثل الاسم أو البريد الإلكتروني دون موافقتك الصريحة.' },
            { icon: 'fa-cookie-bite', title: 'ملفات تعريف الارتباط (Cookies)', body: 'يستخدم Zizex ملفات تعريف ارتباط لتحسين تجربة المستخدم وتحليل حركة المرور. يمكنك تعطيل ملفات تعريف الارتباط أو التخصيص عبر إعدادات المتصفح في أي وقت.' },
            { icon: 'fa-rectangle-ad', title: 'الإعلانات والشركاء', body: 'يعرض Zizex إعلانات من شبكات طرف ثالث مثل Adsterra. قد تستخدم هذه الشبكات ملفات تعريف ارتباط لعرض إعلانات ملائمة. يرجى مراجعة سياسات خصوصية هذه الشبكات.' },
            { icon: 'fa-handshake', title: 'خدمات ومصادر الطرف الثالث', body: 'يستخدم Zizex بيانات وعلامات TMDB لعرض معلومات الأفلام والمسلسلات. لا نشارك بياناتك الشخصية أو سجلات الاستخدام مع أي طرف ثالث.' },
            { icon: 'fa-shield-halved', title: 'أمان البيانات والحماية', body: 'نتخذ تدابير أمنية تقنية وتنظيمية لحماية بياناتك من الوصول غير المصرح به. ومع ذلك، نذكر أنه لا يوجد نظام إلكتروني آمن بنسبة 100%.' },
            { icon: 'fa-rotate', title: 'تحديثات سياسة الخصوصية', body: 'قد نقوم بتحديث سياسة الخصوصية بشكل دوري لمواكبة التغييرات التقنية أو القانونية. يتم نشر أي تعديلات مباشرة على هذه الصفحة.' },
            { icon: 'fa-envelope', title: 'تواصل معنا واستفساراتك', body: 'إذا كان لديك أي أسئلة أو ملاحظات حول سياسة الخصوصية، يرجى التواصل مع فريق الدعم لدينا عبر: a.soufiane.dev@gmail.com' },
        ]
        : isFr
            ? [
                { icon: 'fa-database', title: 'Informations collectées', body: "Nous collectons uniquement des données d'utilisation non personnelles telles que le type de navigateur, le système d'exploitation et les pages consultées. Aucune donnée personnelle n'est collectée sans votre accord explicit." },
                { icon: 'fa-cookie-bite', title: 'Gestion des Cookies', body: "Zizex utilise des cookies pour optimiser votre navigation et analyser la fréquentation. Vous pouvez gérer ou désactiver les cookies à tout moment dans les paramètres de votre navigateur." },
                { icon: 'fa-rectangle-ad', title: 'Publicités & Partenaires', body: "Zizex affiche des annonces issues de réseaux publicitaires tiers tels qu'Adsterra. Ces réseaux peuvent utiliser des cookies anonymes pour cibler les annonces. Veuillez consulter leurs politiques de confidentialité." },
                { icon: 'fa-handshake', title: 'Services tiers & API', body: "Zizex s'appuie sur l'API TMDB pour fournir les détails et affiches des films/séries. Vos données personnelles ne sont jamais revendues ni partagées avec des tiers." },
                { icon: 'fa-shield-halved', title: 'Sécurité des Données', body: "Nous appliquons des standards de sécurité rigoureux pour protéger vos données contre tout accès non autorisé. Cependant, aucune transmission sur Internet n'est garantie totalement infaillible." },
                { icon: 'fa-rotate', title: 'Mises à jour de la Politique', body: "Cette politique de confidentialité peut être révisée périodiquement. Toute mise à jour majeure sera publiée directement sur cette page avec effet immédiat." },
                { icon: 'fa-envelope', title: 'Contact & Support', body: 'Pour toute question concernant la confidentialité ou le traitement de vos données, écrivez-nous à : a.soufiane.dev@gmail.com' },
            ]
            : [
                { icon: 'fa-database', title: 'Information We Collect', body: 'We collect non-personal technical data such as browser type, device OS, and pages viewed. We never harvest or collect personal details without your explicit consent.' },
                { icon: 'fa-cookie-bite', title: 'Cookies & Preferences', body: 'Zizex uses essential cookies to enhance site performance and analyze anonymous site metrics. You can manage or disable cookies via your browser settings anytime.' },
                { icon: 'fa-rectangle-ad', title: 'Advertising Networks', body: 'Zizex partners with trusted ad networks like Adsterra. These providers may use cookies to serve personalized advertisements. We encourage reviewing their respective privacy terms.' },
                { icon: 'fa-handshake', title: 'Third-Party Data & APIs', body: 'We utilize TMDB database services to supply media descriptions and media details. Your user data is strictly confidential and never shared with third parties.' },
                { icon: 'fa-shield-halved', title: 'Data Security Standards', body: 'We implement industry-standard encryption and security measures to shield your usage data. However, remember that no internet data transfer is 100% immune to risk.' },
                { icon: 'fa-rotate', title: 'Policy Amendments', body: 'This Privacy Policy may be updated periodically to align with legal or technical evolution. Any modifications take effect upon publication on this page.' },
                { icon: 'fa-envelope', title: 'Questions & Contact', body: 'If you have any questions or feedback regarding our privacy standards, feel free to reach out to us at: a.soufiane.dev@gmail.com' },
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
                            <i className="fa-solid fa-user-shield text-xs" />
                            <span>{isAr ? 'الخصوصية والأمان' : isFr ? 'Confidentialité & Sécurité' : 'Privacy & Security'}</span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3 text-center">
                            {isAr ? (
                                <>سياسة <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">الخصوصية</span></>
                            ) : isFr ? (
                                <>Politique de <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">Confidentialité</span></>
                            ) : (
                                <>Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">Policy</span></>
                            )}
                        </h1>

                        <p className="text-gray-400 text-xs sm:text-base max-w-lg mx-auto leading-relaxed text-center">
                            {isAr
                                ? 'نحن نلتزم بحماية خصوصيتك وضمان تجربة استخدام آمنة وشفافة على منصة Zizex.'
                                : isFr
                                    ? 'Nous nous engagions à protéger vos données et à vous offrir une expérience sûre et transparente sur Zizex.'
                                    : 'We are dedicated to protecting your data and ensuring a secure, transparent experience on Zizex.'}
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

                        {/* Bottom Info Banner */}
                        <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center flex flex-col items-center justify-center gap-4 shadow-xl max-w-2xl mx-auto">
                            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 text-xl flex items-center justify-center mx-auto shrink-0">
                                <i className="fa-solid fa-headset" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-white font-bold text-base sm:text-lg text-center">
                                    {isAr ? 'هل لديك أسئلة حول الخصوصية؟' : isFr ? 'Des questions sur la confidentialité ?' : 'Have privacy concerns?'}
                                </h3>
                                <p className="text-gray-400 text-xs sm:text-sm mt-1 text-center">
                                    {isAr ? 'فريقنا جاهز للإجابة على كافة استفساراتك في أي وقت.' : isFr ? 'Notre équipe est prête à répondre à toutes vos questions.' : 'Our support team is ready to answer any questions anytime.'}
                                </p>
                            </div>
                            <a
                                href={`/${locale}/contact`}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-red-600/20 hover:scale-105 shrink-0 mx-auto"
                            >
                                <i className="fa-solid fa-paper-plane" />
                                <span>{isAr ? 'تواصل معنا' : isFr ? 'Contactez-nous' : 'Contact Us'}</span>
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
