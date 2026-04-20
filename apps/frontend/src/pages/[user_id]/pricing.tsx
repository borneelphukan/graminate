import { Icon, Button, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@graminate/ui";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import LoginLayout from "@/layout/LoginLayout";

const Pricing = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleCardClick = (planName: string) => {
    if (planName === "Free") return;
    setSelectedPlan(planName);
    if (user_id) {
      console.log(`Navigating user ${user_id} to checkout for ${planName}`);
    } else {
      console.log(`Navigating to checkout for ${planName}`);
    }
  };

  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "/month",
      description: "Explore the basic tools of Graminate",
      features: [
        "Basic access to CRM and Task Management tools",
        "Limited access to document storage",
        "Community support",
        "No AI access",
      ],
      buttonText: "Your current plan",
      buttonDisabled: true,
      popular: false,
    },
    {
      name: "Pro",
      price: "₹500",
      period: "/month",
      description: "Unlock the full power of Graminate with advanced AI assistance",
      features: [
        "Everything in Free",
        "Full access to Graminate AI Assistant",
        "Unlimited document storage",
        "Priority 24/7 support",
        "Advanced data analysis and reporting",
        "Multi-user management",
      ],
      buttonText: "Get Pro",
      buttonDisabled: false,
      popular: true,
    },
  ];

  return (
    <>
      <Head>
        <title>Pricing Plans</title>
      </Head>
      <LoginLayout>
        <div className="bg-gray-500 dark:bg-gray-900 py-12 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-dark dark:text-light text-center mb-8">
              Choose your plan
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`bg-white dark:bg-gray-700 rounded-lg shadow-md flex flex-col cursor-pointer transition-all ${
                    selectedPlan === plan.name
                      ? "ring-2 ring-green-400 transform scale-[1.02]"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() => handleCardClick(plan.name)}
                >
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-semibold text-dark dark:text-light mb-2 flex items-center justify-center">
                      {plan.name}
                      {plan.popular && (
                        <span className="ml-2 bg-green-200 text-light text-xs font-medium rounded-full px-2 py-0.5">
                          POPULAR
                        </span>
                      )}
                    </h3>
                    <div className="text-center mb-4">
                      <span className="text-3xl font-semibold text-dark dark:text-light">
                        {plan.price}
                      </span>
                      <span className="text-gray-300">{plan.period}</span>
                    </div>
                    <p className="text-dark dark:text-light text-center mb-4">
                      {plan.description}
                    </p>
                    <ul role="list" className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <Icon
                            type={"check"}
                            className="size-3 text-green-200 mt-1 flex-shrink-0"
                          />
                          <span className="ml-3 text-dark dark:text-light">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="px-6 py-4">
                    <Button
                      label={plan.buttonText}
                      className="w-full"
                      variant={
                        plan.buttonDisabled
                          ? "ghost"
                          : selectedPlan === plan.name
                          ? "primary"
                          : "secondary"
                      }
                      disabled={plan.buttonDisabled}
                      onClick={() => {
                        handleCardClick(plan.name);
                      }}
                      type="button"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <p className="text-dark dark:text-light text-sm font-medium uppercase tracking-widest mb-4">
                Trusted by 5,000+ agricultural businesses worldwide
              </p>
              <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                <div className="flex items-center space-x-2">
                  <Icon type="agriculture" className="text-2xl" />
                  <span className="font-bold">AgriCorp</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon type="eco" className="text-2xl" />
                  <span className="font-bold">EcoHarvest</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon type="water_drop" className="text-2xl" />
                  <span className="font-bold">PureFarm</span>
                </div>
              </div>
            </div>

            {/* Comparison Section */}
            <div className="mt-24">
              <h3 className="text-2xl font-bold text-dark dark:text-light text-center mb-12">
                Detailed Comparison
              </h3>
              <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-800">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <th className="p-4 font-semibold text-dark dark:text-light">Feature</th>
                      <th className="p-4 font-semibold text-dark dark:text-light text-center">Free</th>
                      <th className="p-4 font-semibold text-dark dark:text-light text-center">Pro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-400 dark:divide-gray-700">
                    {[
                      { name: "Graminate AI Assistant", free: false, pro: true },
                      { name: "CRM Contacts", free: "Up to 50", pro: "Unlimited" },
                      { name: "Document Storage", free: "100 MB", pro: "Unlimited" },
                      { name: "Priority Support", free: false, pro: true },
                      { name: "Advanced Analytics", free: false, pro: true },
                      { name: "Custom Reports", free: "Standard", pro: "Customizable" },
                      { name: "Multi-device Sync", free: true, pro: true },
                    ].map((feature) => (
                      <tr key={feature.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="p-4 text-sm text-dark dark:text-light">{feature.name}</td>
                        <td className="p-4 text-center">
                          {typeof feature.free === "boolean" ? (
                            feature.free ? (
                              <Icon type="check_circle" className="text-green-200" />
                            ) : (
                              <Icon type="cancel" className="text-gray-300" />
                            )
                          ) : (
                            <span className="text-sm font-medium text-dark dark:text-light">
                              {feature.free}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.pro === "boolean" ? (
                            feature.pro ? (
                              <Icon type="check_circle" className="text-green-200" />
                            ) : (
                              <Icon type="cancel" className="text-gray-400" />
                            )
                          ) : (
                            <span className="text-sm font-medium text-dark dark:text-light font-bold">
                              {feature.pro}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-24 max-w-3xl mx-auto pb-12">
              <h3 className="text-2xl font-bold text-dark dark:text-light text-center mb-12">
                Frequently Asked Questions
              </h3>
              <Accordion type="single" collapsible mode="card">
                {[
                  {
                    q: "Can I upgrade or downgrade anytime?",
                    a: "Yes! You can change your plan at any point. Upgrades take effect immediately, while downgrades occur at the end of your current billing cycle.",
                  },
                  {
                    q: "How does the AI Assistant work?",
                    a: "Our AI is specifically trained on agricultural data to help you with animal health tracking, crop analysis, and business management. It's available 24/7 on the Pro plan.",
                  },
                  {
                    q: "Is my data secure?",
                    a: "We use industry-standard encryption and secure cloud infrastructure to ensure your business data is always safe and accessible only to you.",
                  },
                ].map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-dark dark:text-light">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-dark dark:text-light">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Enterprise Banner */}
            <div className="mt-12 mb-24 p-12 rounded-[40px] bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl text-center relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-green/20 rounded-full blur-[100px] group-hover:bg-brand-green/30 transition-all duration-700" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-purple/20 rounded-full blur-[100px] group-hover:bg-brand-purple/30 transition-all duration-700" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 mb-6">
                  <Icon type="business" className="text-brand-tech-green" />
                  <span className="text-sm font-semibold tracking-wide uppercase">Enterprise Solutions</span>
                </div>
                
                <h3 className="text-4xl md:text-5xl font-black text-gray-200 mb-6 tracking-tight leading-tight">
                  Tailored for Large-Scale operations
                </h3>
                
                <p className="text-dark mb-10 max-w-3xl mx-auto text-xl leading-relaxed font-light">
                  Experience dedicated support, custom dashboard integrations, and enterprise-grade 
                  security protocols designed for agricultural cooperatives and national distributors.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <Button
                    label="Schedule a Demo"
                    className="h-14 px-10 text-lg shadow-[0_0_20px_rgba(20,120,110,0.3)] hover:shadow-[0_0_30px_rgba(20,120,110,0.5)] transition-shadow"
                    variant="primary"
                    onClick={() => (window.location.href = "mailto:sales@graminate.com")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </LoginLayout>
    </>
  );
};

export default Pricing;
