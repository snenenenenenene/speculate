"use client";

import ApiSection from '@/components/ApiSection';
import Cta from '@/components/Cta';
import Features from '@/components/Features';
import Hero from '@/components/Hero';

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <ApiSection />
      <Cta />
    </main>

  );
}