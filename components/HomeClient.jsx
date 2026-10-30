'use client';
import { useReadings } from '@/lib/useReadings';
import Dashboard from './Dashboard';
import { ErrorMessage, Loading } from './Loading';
export default function HomeClient() { const { data, error } = useReadings(); if (error) return <ErrorMessage message={error} />; if (!data) return <Loading />; return <Dashboard readings={data} />; }
