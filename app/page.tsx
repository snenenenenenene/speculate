"use client";

import ApiSection from '@/components/ApiSection';
import Cta from '@/components/Cta';
import Features from '@/components/Features';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <ApiSection />
      <Cta />
    </main>

  );
}