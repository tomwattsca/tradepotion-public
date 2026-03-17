import { redirect } from 'next/navigation';
interface Props { params: { slug: string } }
export default function CoinRedirectPage({ params }: Props) {
  redirect(`/coins/${params.slug}`);
}
