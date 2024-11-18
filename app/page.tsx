"use client";

import ApiSection from '@/components/ApiSection';
import Cta from '@/components/Cta';
import Features from '@/components/Features';
import { GradientBackground } from '@/components/GradientBackground';
import Hero from '@/components/Hero';

export default function Home() {
  return (
    <main className='relative'>
      <GradientBackground />
      <Hero />
      <Features />
      <ApiSection />
      <Cta />
    </main>

  );
}