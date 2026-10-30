import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import CityClient from '@/components/CityClient';
import { CITIES } from '@/lib/api';
export const dynamic = 'force-dynamic';
export default async function CityPage({ params }) { const { city } = await params; const resolved = CITIES.find((item) => item.toLowerCase() === city.toLowerCase()); if (!resolved) notFound(); return <><SiteHeader /><CityClient city={resolved} /></>; }
