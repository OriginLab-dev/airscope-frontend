'use client';
import { useReadings } from '@/lib/useReadings';
import CityDetail from './CityDetail';

export default function CityClient({ city }) {
  const { data, ...status } = useReadings(city);
  return <CityDetail key={city} city={city} readings={data} status={status} />;
}
