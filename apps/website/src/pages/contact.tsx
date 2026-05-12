import React, { useState } from "react";
import Head from "next/head";
import { Icon, Button } from "@graminate/ui";
import { motion } from "framer-motion";
import DefaultLayout from "@/layout/DefaultLayout";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const }
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Contact | Graminate</title>
        <meta
          name="description"
          content="Connect with the Graminate team. Initiate operational inquiries or seek specialized product integration assistance."
        />
      </Head>

      {/* =================== HERO SECTION =================== */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 bg-slate-50 overflow-hidden">
        {/* Ambient Visual Splashes */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/[0.06] blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="container mx-auto px-6 md:px-12 lg:px-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <span className="inline-block bg-emerald-500/10 backdrop-blur-xl text-emerald-600 border border-emerald-500/20 rounded-full px-4 py-1 text-xs uppercase tracking-[0.3em] font-black mb-6">
              Operational Channels
            </span>
            <h1 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1] mb-6">
              Initiate <span className="text-emerald-600 font-medium">Dialogue</span>.
            </h1>
            <p className="text-base md:text-lg text-slate-600 font-light max-w-xl mx-auto leading-relaxed">
              Connect with Graminate’s core architecture team. Whether you have product deployment inquiries or strategic directives, our lines are open.
            </p>
          </motion.div>
        </div>
      </section>

      {/* =================== MAIN CONTENT SECTION =================== */}
      <section className="pb-28 md:pb-40 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            {/* ================== LEFT: QUICK MESSAGE FORM ================== */}
            <div className="lg:col-span-7 order-2 lg:order-1 -mt-8 lg:-mt-16 relative z-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white border border-slate-200/80 shadow-2xl shadow-slate-100 rounded-[2.5rem] p-8 md:p-12"
              >
                <div className="mb-8">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-2">
                    <Icon type="chat_bubble_outline" className="text-emerald-600 !text-[22px]" />
                    Quick Message
                  </h2>
                  <p className="text-slate-500 text-sm font-light">
                    Transmit an instant direct dispatch directly to our routing system.
                  </p>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase select-none ml-1">
                        Name
                      </label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your identity"
                        className="w-full h-14 bg-slate-50 border border-slate-200/80 focus:border-emerald-500/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 rounded-2xl px-5 text-slate-900 placeholder:text-slate-400 outline-none transition-all text-sm font-medium"
                      />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase select-none ml-1">
                        Email
                      </label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="alias@example.com"
                        className="w-full h-14 bg-slate-50 border border-slate-200/80 focus:border-emerald-500/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 rounded-2xl px-5 text-slate-900 placeholder:text-slate-400 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase select-none ml-1">
                      Phone (optional)
                    </label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Your cellular line"
                      className="w-full h-14 bg-slate-50 border border-slate-200/80 focus:border-emerald-500/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 rounded-2xl px-5 text-slate-900 placeholder:text-slate-400 outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase select-none ml-1">
                      Message
                    </label>
                    <textarea 
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Type details concerning your deployment query here..."
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-emerald-500/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 rounded-2xl p-5 text-slate-900 placeholder:text-slate-400 outline-none transition-all text-sm font-medium resize-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-4">
                    <Button 
                      label="Send Message" 
                      variant="primary" 
                      className="w-full h-14 !rounded-2xl font-bold shadow-lg shadow-emerald-600/10"
                      type="submit"
                    />
                  </div>
                </form>
              </motion.div>
            </div>

            {/* ================== RIGHT: CONTACT INFO SECTION ================== */}
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-8 lg:pt-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="space-y-6"
              >
                <div className="mb-2">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-2">
                    <Icon type="alternate_email" className="text-emerald-600 !text-[22px]" />
                    Contact Info
                  </h2>
                  <p className="text-slate-500 text-sm font-light max-w-sm">
                    Bypassing digital forms? Connect immediately through specialized enterprise pipelines.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Direct Email Module */}
                  <div className="bg-slate-50/80 border border-slate-200/60 hover:bg-white hover:shadow-xl hover:shadow-slate-100 rounded-3xl p-6 flex items-start gap-5 group transition-all duration-500">
                    <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                      <Icon type="email" className="!text-[22px]" />
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mt-1">General & Sales</span>
                      <a href="mailto:hello@graminate.com" className="block text-lg font-bold text-slate-900 hover:text-emerald-600 transition-colors tracking-tight select-all">
                        hello@graminate.com
                      </a>
                    </div>
                  </div>

                  {/* Phone Support Module */}
                  <div className="bg-slate-50/80 border border-slate-200/60 hover:bg-white hover:shadow-xl hover:shadow-slate-100 rounded-3xl p-6 flex items-start gap-5 group transition-all duration-500">
                    <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                      <Icon type="phone_iphone" className="!text-[22px]" />
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mt-1">Corporate Desk</span>
                      <a href="tel:+918000000000" className="block text-lg font-bold text-slate-900 hover:text-emerald-600 transition-colors tracking-tight">
                        +91 88888 88888
                      </a>
                    </div>
                  </div>

                  {/* Corporate HQ Module */}
                  <div className="bg-slate-50/80 border border-slate-200/60 hover:bg-white hover:shadow-xl hover:shadow-slate-100 rounded-3xl p-6 flex items-start gap-5 group transition-all duration-500">
                    <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                      <Icon type="location_city" className="!text-[22px]" />
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mt-1">HQ Node</span>
                      <p className="text-base font-bold text-slate-900 tracking-tight leading-relaxed">
                        Bengaluru, Karnataka<br />
                        <span className="text-slate-500 text-sm font-light">India 560001</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>

        </div>
      </section>

    </DefaultLayout>
  );
}
