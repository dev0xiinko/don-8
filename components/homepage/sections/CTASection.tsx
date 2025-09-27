import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-24 px-4 bg-emerald-600 text-white">
      <div className="container mx-auto text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Charitable Giving?</h2>
        <p className="text-xl text-emerald-100 mb-8">
          Join thousands of donors and NGOs already using DON-8 for transparent, efficient charitable giving
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/campaigns">
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
              Start Donating Today
            </Button>
          </Link>
          <Link href="/register?type=ngo">
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-emerald-600 bg-transparent"
            >
              Register Your NGO
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}