import './globals.css';
import './experience.css';
import Experience from '@/components/Experience';
export const metadata = { title:'AIRSCOPE | Air quality, in motion', description:'Air-quality monitoring for Kolkata, Howrah, and Asansol.' };
export default function RootLayout({ children }) { return <html lang="en"><body><Experience>{children}</Experience></body></html>; }
