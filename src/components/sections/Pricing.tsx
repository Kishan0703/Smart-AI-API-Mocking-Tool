"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    description: "Perfect for personal projects and learning",
    price: { monthly: 0, yearly: 0 },
    icon: Zap,
    features: [
      "Up to 5 mock endpoints",
      "AI-powered data generation",
      "All HTTP methods supported",
      "Chaos Mode (latency & errors)",
      "Local storage persistence",
      "Community support",
    ],
    cta: "Get Started Free",
    ctaVariant: "secondary" as const,
    popular: false,
  },
  {
    name: "Pro",
    description: "For professional developers and small teams",
    price: { monthly: 12, yearly: 99 },
    icon: Sparkles,
    features: [
      "Unlimited mock endpoints",
      "Enhanced AI generation",
      "Cloud persistence & sync",
      "Team collaboration (up to 5)",
      "Custom response headers",
      "Webhook notifications",
      "Priority email support",
      "API analytics dashboard",
    ],
    cta: "Start Free Trial",
    ctaVariant: "primary" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large teams with advanced needs",
    price: { monthly: null, yearly: null },
    icon: Building2,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "SSO / SAML authentication",
      "Self-hosted deployment option",
      "Custom SLA",
      "Dedicated support manager",
      "Custom integrations",
      "Advanced security controls",
    ],
    cta: "Contact Sales",
    ctaVariant: "secondary" as const,
    popular: false,
  },
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container-main">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              !isYearly ? "text-gray-900" : "text-gray-500"
            )}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={cn(
              "relative w-14 h-7 rounded-full transition-colors",
              isYearly ? "bg-indigo-600" : "bg-gray-300"
            )}
          >
            <span
              className={cn(
                "absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform",
                isYearly ? "translate-x-8" : "translate-x-1"
              )}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              isYearly ? "text-gray-900" : "text-gray-500"
            )}
          >
            Yearly
            <span className="ml-1.5 text-xs text-green-600 font-semibold">
              Save 30%
            </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02]",
                plan.popular
                  ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-2xl shadow-indigo-500/25 ring-4 ring-indigo-600/20"
                  : "bg-white border-2 border-gray-200 hover:border-indigo-200 hover:shadow-xl"
              )}
            >
              {plan.popular && (
                <div className="popular-badge">Most Popular</div>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    plan.popular
                      ? "bg-white/20"
                      : "bg-indigo-100"
                  )}
                >
                  <plan.icon
                    className={cn(
                      "w-6 h-6",
                      plan.popular ? "text-white" : "text-indigo-600"
                    )}
                  />
                </div>
                <h3
                  className={cn(
                    "text-2xl font-bold mb-2",
                    plan.popular ? "text-white" : "text-gray-900"
                  )}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    "text-sm",
                    plan.popular ? "text-indigo-100" : "text-gray-600"
                  )}
                >
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                {plan.price.monthly !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "text-5xl font-bold",
                        plan.popular ? "text-white" : "text-gray-900"
                      )}
                    >
                      ${isYearly ? Math.round(plan.price.yearly / 12) : plan.price.monthly}
                    </span>
                    <span
                      className={cn(
                        plan.popular ? "text-indigo-200" : "text-gray-500"
                      )}
                    >
                      /month
                    </span>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "text-3xl font-bold",
                      plan.popular ? "text-white" : "text-gray-900"
                    )}
                  >
                    Custom
                  </div>
                )}
                {plan.price.yearly !== null && isYearly && plan.price.yearly > 0 && (
                  <p
                    className={cn(
                      "text-sm mt-1",
                      plan.popular ? "text-indigo-200" : "text-gray-500"
                    )}
                  >
                    Billed ${plan.price.yearly} yearly
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={cn(
                        "w-5 h-5 flex-shrink-0 mt-0.5",
                        plan.popular ? "text-indigo-200" : "text-green-500"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        plan.popular ? "text-indigo-100" : "text-gray-600"
                      )}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={cn(
                  "w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all",
                  plan.popular
                    ? "bg-white text-indigo-600 hover:bg-indigo-50"
                    : plan.ctaVariant === "primary"
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                )}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            Trusted by 10,000+ developers at companies like
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-12 mt-6 opacity-50 grayscale">
            {["Vercel", "Stripe", "Shopify", "GitHub", "Figma"].map((company) => (
              <span
                key={company}
                className="text-lg font-bold text-gray-400"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
