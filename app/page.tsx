import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Cpu, GitBranch, Workflow } from "lucide-react";
import Link from "next/link";
import { GradientBackground } from '@/components/GradientBackground';
import { NoiseBackground } from "@/components/ui/noise-background";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-white dark:bg-black">
      <main className="flex-1 w-full">
        <NoiseBackground />
        
        {/* Hero Section */}
        <section className="w-full min-h-screen flex items-center justify-center py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container flex flex-col items-center justify-center px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-b from-black to-black/70 dark:from-white dark:to-white/70">
                Speculative Execution Made Easy
              </h1>
              <p className="mx-auto max-w-[700px] text-black/60 md:text-xl dark:text-white/60">
                Build, test, and deploy speculative AI flows with confidence. Visualize your execution paths and optimize performance.
              </p>
              <div className="flex justify-center space-x-4 pt-4">
                <Link href="/projects">
                  <Button className="gap-2 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90" size="lg">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Screenshot */}
            <div className="w-full max-w-6xl mt-16">
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-black">
                <Image
                  src="/assets/images/placeholder-editor.png"
                  alt="Speculate Editor Screenshot"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-24 lg:py-32 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Workflow,
                  title: "Visual Flow Editor",
                  description: "Drag-and-drop interface for creating complex speculative execution flows."
                },
                {
                  icon: GitBranch,
                  title: "Version Control",
                  description: "Track changes and collaborate with built-in version control."
                },
                {
                  icon: Cpu,
                  title: "Performance Analytics",
                  description: "Monitor and optimize your speculative execution performance."
                }
              ].map((feature, i) => (
                <div key={i} className="group relative">
                  <div className="absolute -inset-px rounded-lg border border-black/10 dark:border-white/10 group-hover:border-black/20 dark:group-hover:border-white/20" />
                  <div className="relative space-y-4 p-6">
                    <div className="inline-block rounded-lg bg-black/[0.03] p-3 dark:bg-white/[0.03]">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white">{feature.title}</h3>
                    <p className="text-black/60 dark:text-white/60">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API Section */}
        <section className="w-full py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter text-black dark:text-white">
                  Powerful API Integration
                </h2>
                <p className="text-black/60 dark:text-white/60">
                  Integrate with your existing systems using our comprehensive API. Build custom solutions with ease.
                </p>
                <div className="space-x-4">
                  <Link href="/docs">
                    <Button variant="outline" className="gap-2 border-black/20 text-black hover:bg-black/[0.03] dark:border-white/20 dark:text-white dark:hover:bg-white/[0.03]">
                      <Code2 className="h-4 w-4" />
                      View Documentation
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
                <div className="absolute inset-0 bg-grid-black/[0.02] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-white/[0.02]"></div>
                <div className="relative p-6">
                  <pre className="text-sm text-black/70 dark:text-white/70">
                    <code>{`
# Example API Usage
import speculate

flow = speculate.Flow()
flow.add_node("start", type="trigger")
flow.add_node("process", type="compute")
flow.connect("start", "process")

flow.execute()
                    `}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 lg:py-32 bg-black text-white dark:bg-white dark:text-black">
          <div className="container px-4 md:px-6 mx-auto max-w-3xl text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="mx-auto max-w-[600px] text-white/80 dark:text-black/80">
                Join thousands of developers using Speculate to build better AI applications.
              </p>
              <div className="flex justify-center space-x-4 pt-4">
                <Link href="/signup">
                  <Button className="gap-2 bg-white text-black hover:bg-white/90 dark:bg-black dark:text-white dark:hover:bg-black/90">
                    Start Building
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 border-t border-black/10 dark:border-white/10">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-black/60 dark:text-white/60">
              {new Date().getFullYear()} Speculate. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="/terms" className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}