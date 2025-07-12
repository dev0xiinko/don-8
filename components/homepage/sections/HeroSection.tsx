import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto text-center max-w-4xl">
        <Badge variant="secondary" className="mb-6">
          Capstone Project
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Transparent Donations,
          <br />
          <span className="text-emerald-600">Real Impact</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          DON-8 eliminates intermediaries and ensures every donation is tracked in real-time through blockchain
          technology. Support NGOs with complete transparency and zero hidden fees.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/register?type=donor">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Start Donating
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/register?type=ngo">
            <Button size="lg" variant="outline">
              Register NGO
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-emerald-600 mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
