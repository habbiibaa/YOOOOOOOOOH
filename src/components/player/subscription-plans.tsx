"use client";

import { useState, useEffect } from "react";
import { SubscriptionPlan, getSubscriptionPlans } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import Link from "next/link";

interface SubscriptionPlansProps {
  onSelectPlan: (plan: SubscriptionPlan) => void;
  recommendedLevel?: number;
}

export default function SubscriptionPlans({
  onSelectPlan,
  recommendedLevel,
}: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    recommendedLevel ? `level-${recommendedLevel}` : null
  );
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadPlans() {
      try {
        const plans = await getSubscriptionPlans();
        setSubscriptionPlans(plans);
      } catch (error) {
        console.error("Error loading subscription plans:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadPlans();
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan.id);
    onSelectPlan(plan);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-white">Loading subscription plans...</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Choose Your Training Plan
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Select a plan that suits your skill level and training goals
            {recommendedLevel && (
              <span className="font-semibold text-red-500">
                {" "}
                (Level {recommendedLevel} recommended for you)
              </span>
            )}
          </p>
        </div>
        {subscriptionPlans.length > 0 && (
          <>
            <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-3">
              {subscriptionPlans.slice(0, 5).map((plan, planIdx) => (
                <div
                  key={plan.id}
                  className={`relative p-2 ${
                    plan.isPopular
                      ? "z-10 sm:min-h-[540px] lg:min-w-[320px]"
                      : "sm:min-h-[520px] lg:min-w-[300px]"
                  } ${planIdx === 0 ? "rounded-t-3xl lg:rounded-tr-none lg:rounded-l-3xl" : ""} ${
                    planIdx === 2
                      ? "rounded-b-3xl lg:rounded-bl-none lg:rounded-r-3xl"
                      : ""
                  }`}
                >
                  <div
                    className={`rounded-3xl ring-2 h-full flex flex-col ${
                      selectedPlan === plan.id
                        ? "bg-red-900/20 ring-red-600"
                        : "bg-gray-900/90 ring-gray-800"
                    } ${
                      plan.isPopular
                        ? "lg:scale-105 shadow-xl z-10"
                        : "lg:scale-100"
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-5 right-0 left-0 mx-auto w-32 rounded-full bg-red-600 px-3 py-1 text-center text-xs font-medium text-white">
                        Most popular
                      </div>
                    )}
                    <div className="p-8 sm:p-10 flex-grow">
                      <h3
                        className="text-lg font-semibold leading-8 text-white"
                        id={plan.id}
                      >
                        {plan.name}
                      </h3>
                      <p className="mt-4 text-sm leading-6 text-gray-300">
                        {plan.description}
                      </p>
                      <div className="mt-6 flex items-baseline gap-x-1">
                        <span className="text-4xl font-bold tracking-tight text-white">
                          {plan.price} EGP
                        </span>
                        <span className="text-sm font-semibold leading-6 text-gray-300">
                          /month
                        </span>
                      </div>
                      <ul
                        role="list"
                        className="mt-8 space-y-3 text-sm leading-6 text-gray-300"
                      >
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex gap-x-3">
                            <Check
                              className="h-6 w-5 flex-none text-red-600"
                              aria-hidden="true"
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-auto p-6">
                      <Button
                        variant={selectedPlan === plan.id ? "default" : "outline"}
                        className={`w-full text-white ${
                          selectedPlan === plan.id
                            ? "bg-red-600 hover:bg-red-700"
                            : "border-red-600 text-red-600 hover:bg-red-950"
                        }`}
                        onClick={() => handleSelectPlan(plan)}
                      >
                        {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Walk-in Session Option */}
            {subscriptionPlans.length > 5 && (
              <div className="mt-12 mx-auto max-w-md">
                <div className="rounded-2xl bg-gray-900/90 p-6 ring-2 ring-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {subscriptionPlans[5].name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-300">
                        {subscriptionPlans[5].description}
                      </p>
                      <div className="mt-4 text-2xl font-bold text-white">
                        {subscriptionPlans[5].price} EGP
                        <span className="text-sm font-normal text-gray-400">
                          {" "}
                          / session
                        </span>
                      </div>
                    </div>
                    <Button
                      variant={selectedPlan === "walk-in" ? "default" : "outline"}
                      className={`text-white ${
                        selectedPlan === "walk-in"
                          ? "bg-red-600 hover:bg-red-700"
                          : "border-red-600 text-red-600 hover:bg-red-950"
                      }`}
                      onClick={() => handleSelectPlan(subscriptionPlans[5])}
                    >
                      {selectedPlan === "walk-in" ? "Selected" : "Select"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 