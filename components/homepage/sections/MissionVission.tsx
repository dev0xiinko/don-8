import Image from "next/image"
import { Check, TrendingUp } from "lucide-react"

export function MissionVission() {
  return (
    <div className="muted-foreground px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Main Heading and Description */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Let Us Come Together To Make <span className="block text-muted-foreground">A Difference</span>
              </h1>

              <p className="text-muted-foreground text-lg leading-relaxed">
                At DON-8, Every Donation Is Tracked On The Blockchain—Ensuring Full Transparency, Eliminating
                Intermediaries, And Building Trust Between Donors And Organizations. Give With Confidence, Knowing Your
                Support Makes A Clear And Measurable Difference.
              </p>
            </div>

            {/* Mission and Vision Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Our Mission Card */}
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Check className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-600">Our Mission</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  To Empower Transparent And Trusted Giving Through Blockchain Technology—Connecting Donors And NGOs In
                  Real Time With Accountability And Purpose.
                </p>
              </div>

              {/* Our Vision Card */}
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-600">Our Vission</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A World Where Every Donation Creates Visible, Verifiable Impact.
                </p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-lg overflow-hidden shadow-lg border border-border">
              <Image
                src="/a02tw0.jpg"
                alt="Group of families and children sitting together, representing the beneficiaries of charitable donations"
                width={600}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
