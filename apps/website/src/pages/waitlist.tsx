import React, { useState, useEffect } from "react";
import Head from "next/head";
import DefaultLayout from "@/layout/DefaultLayout";
import { Button, Input, Icon } from "@graminate/ui";
import { motion } from "framer-motion";
import { triggerToast } from "@/stores/toast";
import Toast from "@/components/ui/Toast";
import { useRouter } from "next/router";

export default function Waitlist() {
  const router = useRouter();
  const [role, setRole] = useState<"Farmer" | "Seller">("Farmer");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  
  useEffect(() => {
    if (router.isReady && router.query.email) {
      const emailVal = Array.isArray(router.query.email) ? router.query.email[0] : router.query.email;
      setForm(prev => ({ ...prev, email: emailVal }));
    }
  }, [router.isReady, router.query.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { firstName: "", lastName: "", email: "" };
    let hasError = false;
    
    if (!form.firstName.trim()) { 
      newErrors.firstName = "First name required"; 
      hasError = true; 
    }
    if (!form.lastName.trim()) { 
      newErrors.lastName = "Last name required"; 
      hasError = true; 
    }
    if (!form.email.trim() || !form.email.includes("@")) { 
      newErrors.email = "Valid email required"; 
      hasError = true; 
    }
    
    setErrors(newErrors);
    if (hasError) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          role: role,
        }),
      });

      if (response.ok) {
        triggerToast("Success! You've been added to the waitlist.");
        setForm({ firstName: "", lastName: "", email: "", phone: "" });
        setTimeout(() => {
          router.push("/");
        }, 2500);
      } else {
        const data = await response.json();
        triggerToast(data.message || "Unable to join. Please try again.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      triggerToast("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Join the Waitlist | Graminate</title>
      </Head>

      <DefaultLayout>
        <main className="min-h-screen pt-28 pb-20 bg-slate-50 relative overflow-hidden flex items-center justify-center px-6">
          {/* Decorative background blur */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl aspect-square bg-emerald-100/50 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none"></div>

          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-xl bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-slate-200/80 border border-slate-200/60"
          >
            <div className="text-center mb-8">
              <div className="inline-block bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1 mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Early Access</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Join the Waitlist
              </h1>
              <p className="mt-3 text-slate-600 text-base">
                Complete details below to reserve your access token.
              </p>
            </div>

            <div className="mb-10 flex justify-center gap-5">
              <button
                type="button"
                onClick={() => setRole("Farmer")}
                className={`flex items-center gap-2 px-8 py-2.5 rounded-full border transition-all text-lg font-normal leading-none ${
                  role === "Farmer" 
                  ? "bg-[#EAF6ED] border-[#B7E2CA] text-[#2EA278]" 
                  : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Farmer
                {role === "Farmer" && <Icon type="check_circle" className="!text-[22px] inline-flex items-center justify-center" />}
              </button>
              
              <button
                type="button"
                onClick={() => setRole("Seller")}
                className={`flex items-center gap-2 px-8 py-2.5 rounded-full border transition-all text-lg font-normal leading-none ${
                  role === "Seller" 
                  ? "bg-[#EAF6ED] border-[#B7E2CA] text-[#2EA278]" 
                  : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Seller
                {role === "Seller" && <Icon type="check_circle" className="!text-[22px] inline-flex items-center justify-center" />}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Input 
                    id="firstName"
                    label="First Name"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    error={errors.firstName}
                  />
                </div>
                <div>
                  <Input 
                    id="lastName"
                    label="Last Name"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    error={errors.lastName}
                  />
                </div>
              </div>

              <div>
                <Input 
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  error={errors.email}
                />
              </div>

              <div>
                <Input 
                  id="phone"
                  label="Phone Number (Optional)"
                  type="tel"
                  placeholder="+91"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="pt-4">
                <Button 
                  label={loading ? "Processing..." : "Submit"}
                  variant="primary"
                  className="w-full h-14 text-base font-bold !rounded-2xl hover:shadow-lg hover:shadow-slate-200 active:scale-[0.98] transition-all"
                  onClick={handleSubmit}
                  disabled={loading}
                />
              </div>
            </form>
          </motion.div>
        </main>
      </DefaultLayout>
      <Toast />
    </>
  );
}
