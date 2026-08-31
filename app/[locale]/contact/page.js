import { redirect } from 'next/navigation';

export default async function ContactPage(props) {
    const params = await props.params;
    const { locale } = params;
    redirect(`/${locale || 'en'}`);
}
