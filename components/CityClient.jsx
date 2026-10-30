'use client';
import { useReadings } from '@/lib/useReadings';
import CityDetail from './CityDetail';
import { ErrorMessage, Loading } from './Loading';
export default function CityClient({ city }) { const { data, error } = useReadings(city); if (error) return <ErrorMessage message={error} />; if (!data) return <Loading />; return <CityDetail city={city} readings={data} />; }
