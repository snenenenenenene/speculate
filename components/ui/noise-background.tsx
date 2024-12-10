"use client";

export function NoiseBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.02] brightness-100 contrast-150 dark:opacity-[0.03]" />
    </div>
  );
}
