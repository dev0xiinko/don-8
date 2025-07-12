import { Header } from "@/components/homepage/layout/Header"
import { HeroSection } from "@/components/homepage/sections/HeroSection"
import { FeaturesSection } from "@/components/homepage/sections/FeatureSection"
import { StepsSection } from "@/components/homepage/sections/StepsSection"
import { CTASection } from "@/components/homepage/sections/CTASection"
import { Footer } from "@/components/homepage/layout/Footer"

import { features } from "@/types/data/features"
import { stats } from "@/types/data/stats"
import { steps } from "@/types/data/steps"

export default function HomePage() {

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection stats={stats} />
      <FeaturesSection features={features} />
      <StepsSection steps={steps} />
      <CTASection />
      <Footer />
    </div>
  )
}
