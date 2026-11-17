'use client';
import { useReadings } from '@/lib/useReadings';
import Dashboard from './Dashboard';

export default function HomeClient() {
  const { data, ...status } = useReadings();
  return <Dashboard readings={data} status={status} />;
}
