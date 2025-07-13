import { Header } from "@/components/homepage/layout/Header"
import { HeroSection } from "@/components/homepage/sections/HeroSection"
import { FeaturesSection } from "@/components/homepage/sections/FeatureSection"
import { StepsSection } from "@/components/homepage/sections/StepsSection"
import { CTASection } from "@/components/homepage/sections/CTASection"
import { Footer } from "@/components/homepage/layout/Footer"
import { MissionVission } from "@/components/homepage/sections/MissionVission"
import dynamic from "next/dynamic"

import { features } from "@/types/data/features"
import { stats } from "@/types/data/stats"
import { steps } from "@/types/data/steps"


const WorldMap = dynamic(() => import('@/components/homepage/sections/WorldMap').then(mod => mod.WorldMapFeature), {
  loading: () => <p className="text-center">Loading...</p>, // Optional fallback
  ssr: false, // Optional: disables server-side rendering
});

export default function HomePage() {

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection stats={stats} />
      <WorldMap />
      <MissionVission />
      <FeaturesSection features={features} />
      <StepsSection steps={steps} />
      <CTASection />
      <Footer />
    </div>
  )
}
