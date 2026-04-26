import { Icon, Button, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@graminate/ui";
import React, { useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Script from "next/script";
import LoginLayout from "@/layout/LoginLayout";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import Swal from "sweetalert2";
import axiosInstance from "@/lib/utils/axiosInstance";

const Pricing = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const { plan: currentPlanFromDb, country, fetchUserSubTypes } = useUserPreferences();

  React.useEffect(() => {
    if (user_id) {
      fetchUserSubTypes(user_id as string);
    }
  }, [user_id, fetchUserSubTypes]);

  // Regional Pricing Configuration
  const REGIONAL_PRICING = useMemo(() => {
    const euroCountries = ["Germany", "France", "Spain", "Italy", "Netherlands", "Belgium", "Austria", "Portugal", "Finland", "Ireland", "Greece"];
    
    if (euroCountries.includes(country || "") || country === "Europe") {
      return { 
        currency: "EUR", 
        symbol: "€", 
        basicPrice: 5,
        proPrice: 15 
      };
    } else {
      // Default to Indian pricing (INR)
      return { 
        currency: "INR", 
        symbol: "₹", 
        basicPrice: 299,
        proPrice: 499 
      };
    }
  }, [country]);

  const handleSubscribe = async (planType: "BASIC" | "PRO") => {
    if (!user_id) {
      Swal.fire("Error", "User identification missing. Please log in again.", "error");
      return;
    }

    const price = planType === "BASIC" ? REGIONAL_PRICING.basicPrice : REGIONAL_PRICING.proPrice;

    try {
      // 1. Create order on the backend with regional pricing
      const orderResponse = await axiosInstance.post("/payment/create-order", {
        amount: price,
        currency: REGIONAL_PRICING.currency,
        userId: Number(user_id),
        planType: planType
      });
      
      const order = orderResponse.data;

      // 2. Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Graminate",
        description: `${planType.charAt(0) + planType.slice(1).toLowerCase()} Plan Subscription`,
        order_id: order.id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          Swal.fire({
            title: "Processing Payment...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          try {
            // 3. Verify payment on the backend
            await axiosInstance.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType: planType
            });
            
            Swal.fire({
              title: "Payment Successful!",
              text: `Welcome to Graminate ${planType.charAt(0) + planType.slice(1).toLowerCase()}! You are now subscribed at ${REGIONAL_PRICING.symbol}${price}/${REGIONAL_PRICING.currency === "INR" ? "month" : "mo"}.`,
              icon: "success",
              confirmButtonColor: "#10b981",
            });
            
            // Refresh user data to update the UI
            fetchUserSubTypes(user_id as string);
          } catch (error) {
            console.error("Verification error:", error);
            Swal.fire("Error", "Payment verification failed. Please contact support.", "error");
          }
        },
        modal: {
          ondismiss: () => {
            console.log("Checkout modal closed");
          }
        },
        theme: {
          color: "#10b981"
        }
      };

      const rzp = new (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      Swal.fire("Error", "Could not initiate payment. Please try again later.", "error");
    }
  };

  const handleCardClick = async (planId: string) => {
    const normalizedId = planId.toUpperCase();
    if (normalizedId === currentPlanFromDb) return;

    const planHierarchy = { 'FREE': 0, 'BASIC': 1, 'PRO': 2 };
    const currentLevel = planHierarchy[currentPlanFromDb as keyof typeof planHierarchy] || 0;
    const targetLevel = planHierarchy[normalizedId as keyof typeof planHierarchy] || 0;

    // Downgrade logic
    if (targetLevel < currentLevel) {
      const result = await Swal.fire({
        title: "Downgrade Plan?",
        text: `Are you sure you want to shift to the ${planId} plan? Your current features will remain active until the end of your billing cycle, after which you will be transitioned to ${planId}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#ef4444",
        confirmButtonText: `Yes, schedule ${planId}`,
        cancelButtonText: "Keep current plan",
        background: document.documentElement.classList.contains("dark") ? "#1f2937" : "#ffffff",
        color: document.documentElement.classList.contains("dark") ? "#f3f4f6" : "#111827",
      });

      if (result.isConfirmed) {
        try {
          const response = await axiosInstance.post(`/user/${user_id}/schedule-downgrade`, {
            plan: normalizedId
          });
          
          Swal.fire({
            title: "Downgrade Scheduled",
            text: response.data.data.message,
            icon: "success",
            confirmButtonColor: "#10b981",
          });
          
          if (user_id) fetchUserSubTypes(user_id as string);
        } catch (error: unknown) {
          console.error("Downgrade error:", error);
          const errorMessage = (error as { response?: { data?: { data?: { error?: string } } } })?.response?.data?.data?.error || "Failed to schedule downgrade. Please try again.";
          Swal.fire("Error", errorMessage, "error");
        }
      }
      return;
    }

    // Upgrade logic
    if (normalizedId === "BASIC" || normalizedId === "PRO") {
      handleSubscribe(normalizedId as "BASIC" | "PRO");
      return;
    }
  };

  const plans = useMemo(() => [
    {
      name: "Free",
      id: "FREE",
      price: `${REGIONAL_PRICING.symbol}0`,
      period: "/month",
      description: "Basic record-keeping for marginal farmers.",
      features: [
        "Access to ONLY 1 farm service",
        "Basic Finance Tracking",
        "Limited CRM (50 contacts)",
        "NO AI Assistant",
        "Community support",
      ],
      popular: false,
    },
    {
      name: "Standard",
      id: "BASIC",
      price: `${REGIONAL_PRICING.symbol}${REGIONAL_PRICING.basicPrice}`,
      period: "/month",
      description: "Full management for progressive farmers.",
      features: [
        "Access to ALL farm services",
        "Advanced Finance & Inventory",
        "Full CRM capabilities",
        "Labour & Salary Management",
        "NO AI Assistant",
      ],
      popular: true,
    },
    {
      name: "Pro",
      id: "PRO",
      price: `${REGIONAL_PRICING.symbol}${REGIONAL_PRICING.proPrice}`,
      period: "/month",
      description: "Ultimate farm ERP with AI-powered insights.",
      features: [
        "Everything in Standard",
        "Unlimited AI Assistant (Smart Toy)",
        "Advanced Data Analysis",
        "Multi-user management",
        "Priority 24/7 support",
      ],
      popular: false,
    },
  ], [REGIONAL_PRICING]);

  const getPlanStatus = (planId: string) => {
    const isCurrent = currentPlanFromDb === planId;
    return {
      isCurrent,
      buttonText: isCurrent ? "Current Plan" : `Get ${planId.charAt(0) + planId.slice(1).toLowerCase()}`,
      buttonDisabled: isCurrent,
      variant: isCurrent ? "secondary" as const : "primary" as const
    };
  };

  return (
    <>
      <Head>
        <title>Pricing Plans</title>
      </Head>
      <LoginLayout>
        <div className="bg-gray-50 py-12 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-dark text-center mb-8">
              Choose your plan
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan) => {
                const status = getPlanStatus(plan.id);
                return (
                  <div
                    key={plan.name}
                    className={`bg-white rounded-lg shadow-md flex flex-col cursor-pointer transition-all ${
                      status.isCurrent
                        ? "ring-2 ring-green-400 transform scale-[1.02]"
                        : "hover:shadow-lg"
                    }`}
                    onClick={() => handleCardClick(plan.id)}
                  >
                    <div className="p-6 flex-grow">
                      <h3 className="text-xl font-semibold text-dark mb-2 flex items-center justify-center">
                        {plan.name}
                        {plan.popular && (
                          <span className="ml-2 bg-green-200 text-white text-xs font-medium rounded-full px-2 py-0.5">
                            POPULAR
                          </span>
                        )}
                      </h3>
                      <div className="text-center mb-4">
                        <span className="text-3xl font-semibold text-dark">
                          {plan.price}
                        </span>
                        <span className="text-dark">{plan.period}</span>
                      </div>
                      <p className="text-gray-600 text-center mb-4">
                        {plan.description}
                      </p>
                      <ul role="list" className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <Icon
                              type={"check"}
                              className="size-3 text-green-300 mt-1 flex-shrink-0"
                            />
                            <span className="ml-3 text-dark">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="px-6 py-4">
                      <Button
                        label={status.buttonText}
                        className="w-full"
                        variant={status.variant}
                        disabled={status.buttonDisabled}
                        onClick={() => {
                          handleCardClick(plan.name);
                        }}
                        type="button"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <p className="text-sm text-dark dark:text-light font-medium uppercase tracking-widest mb-4">
                Trusted by 5,000+ agricultural businesses worldwide
              </p>
              <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                <div className="flex items-center space-x-2 text-dark">
                  <Icon type="agriculture" className="text-2xl" />
                  <span className="font-bold">AgriCorp</span>
                </div>
                <div className="flex items-center space-x-2 text-dark">
                  <Icon type="eco" className="text-2xl" />
                  <span className="font-bold">EcoHarvest</span>
                </div>
                <div className="flex items-center space-x-2 text-dark">
                  <Icon type="water_drop" className="text-2xl" />
                  <span className="font-bold">PureFarm</span>
                </div>
              </div>
            </div>

            {/* Comparison Section */}
            <div className="mt-24">
              <h3 className="text-2xl font-bold text-dark text-center mb-12">
                Detailed Comparison
              </h3>
              <div className="overflow-hidden rounded-xl bg-white border border-gray-400 shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-500">
                      <th className="p-4 font-semibold text-dark">Feature</th>
                      <th className="p-4 font-semibold text-dark text-center">Free</th>
                      <th className="p-4 font-semibold text-dark text-center">Standard</th>
                      <th className="p-4 font-semibold text-dark text-center">Pro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-400">
                    {[
                      { name: "Graminate AI Assistant", free: false, standard: false, pro: true },
                      { name: "Farm Services", free: "1 Service", standard: "Unlimited", pro: "Unlimited" },
                      { name: "CRM Items (per type)", free: "Up to 15", standard: "Unlimited", pro: "Unlimited" },
                      { name: "Labour & Salary Management", free: false, standard: true, pro: true },
                      { name: "Document Storage", free: "100 MB", standard: "5 GB", pro: "Unlimited" },
                      { name: "Advanced Analytics", free: false, standard: "Basic", pro: "AI-Powered" },
                      { name: "Priority Support", free: false, standard: false, pro: true },
                    ].map((feature: { name: string; free: boolean | string; standard: boolean | string; pro: boolean | string }) => (
                      <tr key={feature.name} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm text-dark">{feature.name}</td>
                        <td className="p-4 text-center">
                          {typeof feature.free === "boolean" ? (
                            feature.free ? (
                              <div className="flex justify-center"><Icon type="check_circle" className="text-green-200" /></div>
                            ) : (
                              <div className="flex justify-center"><Icon type="cancel" className="text-red-200" /></div>
                            )
                          ) : (
                            <span className="text-sm font-medium text-dark">
                              {feature.free}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.standard === "boolean" ? (
                            feature.standard ? (
                              <div className="flex justify-center"><Icon type="check_circle" className="text-green-200" /></div>
                            ) : (
                              <div className="flex justify-center"><Icon type="cancel" className="text-red-200" /></div>
                            )
                          ) : (
                            <span className="text-sm font-medium text-dark">
                              {feature.standard}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.pro === "boolean" ? (
                            feature.pro ? (
                              <div className="flex justify-center"><Icon type="check_circle" className="text-green-200" /></div>
                            ) : (
                              <div className="flex justify-center"><Icon type="cancel" className="text-red-200" /></div>
                            )
                          ) : (
                            <span className="text-sm font-medium text-dark font-bold">
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
              <h3 className="text-2xl font-bold text-dark text-center mb-12">
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
                    <AccordionTrigger className="text-dark">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Enterprise Banner */}
            <div className="mt-12 mb-24 p-12 rounded-[40px] bg-gray-900 border border-gray-800 shadow-2xl text-center relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-green/20 rounded-full blur-[100px] group-hover:bg-brand-green/30 transition-all duration-700" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-purple/20 rounded-full blur-[100px] group-hover:bg-brand-purple/30 transition-all duration-700" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 mb-6">
                  <Icon type="business" className="text-brand-tech-green" />
                  <span className="text-sm font-semibold tracking-wide uppercase text-white">Enterprise Solutions</span>
                </div>
                
                <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                  Tailored for Large-Scale operations
                </h3>
                
                <p className="text-gray-300 mb-10 max-w-3xl mx-auto text-xl leading-relaxed font-light">
                  Experience dedicated support, custom dashboard integrations, and enterprise-grade 
                  security protocols designed for agricultural cooperatives and national distributors.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <Button
                    label="Schedule a Demo"
                    className="h-14 px-10 text-lg"
                    variant="primary"
                    onClick={() => (window.location.href = "mailto:sales@graminate.com")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </LoginLayout>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
    </>
  );
};

export default Pricing;
