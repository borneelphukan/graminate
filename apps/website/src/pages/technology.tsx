import Head from "next/head";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button, Icon } from "@graminate/ui";
import { useRouter } from "next/router";
import DefaultLayout from "@/layout/DefaultLayout";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" as const }
};

export default function Technology() {
  const router = useRouter();

  return (
    <DefaultLayout>
      <Head>
        <title>Technology | Graminate</title>
        <meta
          name="description"
          content="Explore how Graminate's advanced telemetry, AI diagnostics, and integrated ERP engine power the future of agrarian operations."
        />
      </Head>

      {/* =================== SECTION 1: GRAMINATE (HERO) =================== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-50 pt-24 pb-16">
        {/* Ambient tech grid overlay & Unsplash image */}
        <div className="absolute inset-0 z-0 opacity-[0.08] grayscale pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=2000&auto=format&fit=crop"
            alt="Precision Agriculture Hardware"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 via-slate-50/90 to-slate-50 z-10"></div>

        <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Copy Left */}
            <div className="lg:col-span-7 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-600 text-xs font-black tracking-[0.2em] uppercase mb-6">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Graminate Stack
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[0.95] text-balance mb-6">
                  The Advanced OS for <span className="text-emerald-600 font-medium">Precision</span> Agriculture in India.
                </h1>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light max-w-2xl">
                  Graminate is built upon specialized diagnostic intelligence and resilient logistical infrastructure, consolidating disparate telemetry variables into actionable, high-yield workflows in real-time.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                <Button 
                  label="Get Started Today" 
                  variant="primary"
                  className="h-14 px-8 rounded-full !font-bold shadow-lg shadow-emerald-600/10"
                  onClick={() => router.push("/waitlist")}
                />
              </motion.div>
            </div>

            {/* Tech Matrix Right (Minimalist Geometric Design) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[500px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/assets/screenshot-1.png" 
                  alt="Graminate Dashboard Environment"
                  className="w-full h-auto rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200 block"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =================== SECTION 2: KEY FEATURES =================== */}
      <section className="py-24 md:py-36 bg-white relative border-y border-slate-200/50">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          
          <motion.div {...fadeInUp} className="max-w-3xl mb-20">
            <span className="text-emerald-600 uppercase font-black tracking-[0.2em] text-xs mb-4 block">Capabilities</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">
              Key Features
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "diversity_3",
                title: "CRM",
                desc: "Build durable relationships with distributors, retail outlets, and direct buyers via integrated communication pipelines."
              },
              {
                icon: "egg",
                title: "Poultry Farm Management",
                desc: "Track flock cycles, maintain climate controls, and automate egg production and distribution ledgers in unified views."
              },
              {
                icon: "pets",
                title: "Cattle Management",
                desc: "Monitor livestock health schedules, tracking indices, feed consumption metrics, and pedigree ledgers."
              },
              {
                icon: "hive",
                title: "Apiculture Management",
                desc: "Maintain apiary health logs, monitor extraction seasons, and coordinate hive placement for maximum efficiency."
              },
              {
                icon: "local_florist",
                title: "Floriculture Management",
                desc: "Optimize greenhouse environments, manage germination schedules, and orchestrate delicate shipping timelines."
              },
              {
                icon: "payments",
                title: "Finance Management",
                desc: "Track operating expenditures, handle automated payroll routines, and generate instant, compliant profit reports."
              },
              {
                icon: "inventory_2",
                title: "Warehouse Management",
                desc: "Audit physical stocks in real-time, automate pallet routing, and reduce warehouse bottlenecks dynamically."
              },
              {
                icon: "storefront",
                title: "Marketplace",
                desc: "Directly trade harvests with verify-backed distributors, securing fair pricing via frictionless procurement layers."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-slate-50/80 border border-slate-200/60 rounded-3xl p-8 shadow-sm group hover:bg-white hover:shadow-2xl hover:shadow-slate-100 hover:border-emerald-500/20 transition-all duration-300"
              >
                <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-6">
                  <Icon type={feature.icon} className="!text-[24px] flex items-center justify-center" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-slate-600 font-light leading-relaxed text-base">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* =================== SECTION 3: HOW THE SYSTEM WORKS =================== */}
      <section className="py-24 md:py-36 bg-slate-50 text-slate-900 relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
          
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-24">
            <span className="text-emerald-600 uppercase font-black tracking-[0.2em] text-xs mb-4 block">Logic Pipeline</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none mb-6">
              How the System Works
            </h2>
            <p className="text-slate-600 text-lg font-light leading-relaxed">
              Graminate harmonizes fragmented data inputs into real-time, intelligent field executions across three seamless operations.
            </p>
          </motion.div>

          {/* Flow Stages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Horizontal Connecting Connector line for Desktop */}
            <div className="hidden lg:block absolute top-16 left-[8%] right-[8%] h-[2px] bg-gradient-to-r from-emerald-100 via-emerald-400 to-emerald-100 opacity-50"></div>

            {[
              {
                step: "01",
                title: "Data Logging",
                desc: "Seamlessly capture real-time inputs from manual ledgers, soil nodes, and distributed satellite telemetry pipelines.",
                icon: "edit_note"
              },
              {
                step: "02",
                title: "Allow AI to analyze data",
                desc: "Graminate algorithms process consolidated data, filtering noise to uncover critical operational insights instantly.",
                icon: "psychology"
              },
              {
                step: "03",
                title: "Model-backed harvest forecast",
                desc: "Generate high-precision harvest projections and profitability forecasts computed via dynamic tracking schemas.",
                icon: "analytics"
              },
              {
                step: "04",
                title: "Take actions",
                desc: "Deliver direct, actionable advice for farmers to maximize productivity and override external environmental agents.",
                icon: "bolt"
              }
            ].map((stage, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Ring badge container */}
                <div className="relative size-32 rounded-full bg-white border-2 border-slate-200 grid place-items-center shadow-xl shadow-slate-100 mb-8 group-hover:border-emerald-500 transition-colors duration-500 z-10">
                  <div className="absolute -top-2 -left-2 bg-emerald-600 text-white font-black text-xs tracking-widest rounded-full px-3 py-1 shadow-md">
                    STAGE {stage.step}
                  </div>
                  <Icon type={stage.icon} className="!text-[44px] text-emerald-600 flex items-center justify-center" />
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{stage.title}</h3>
                <p className="text-slate-600 font-light leading-relaxed max-w-sm">{stage.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* =================== SECTION 4: GRAMINATE MOBILE APP =================== */}
      <section className="py-24 md:py-40 bg-white overflow-hidden relative border-t border-slate-100">
        {/* Visual Ambient Splashes */}
        <div className="absolute -bottom-48 -left-48 size-[600px] bg-emerald-500/[0.04] blur-[100px] rounded-full"></div>

        <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Copy Side */}
            <div className="lg:col-span-6 space-y-8 order-2 lg:order-1">
              <motion.div {...fadeInUp}>
                <span className="text-emerald-600 font-black uppercase tracking-[0.2em] text-xs mb-4 block">For your Smartphone</span>
                <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight leading-[1.05] mb-6">
                  Graminate Mobile.<br />
                  <span className="text-emerald-600 font-medium">Field-Ready</span> Operations.
                </h2>
                <p className="text-slate-600 text-lg font-light leading-relaxed">
                  The power of Graminate’s OS fits directly into the palms of your hands. Designed for high-contrast sunlight visibility, rough-environment navigation, and offline computation.
                </p>
              </motion.div>

              {/* Download Badges Container */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-wrap gap-4 pt-8"
              >
                {/* App Store Button */}
                <a 
                  href="#" 
                  className="flex items-center gap-3.5 bg-slate-900 hover:bg-emerald-600 text-white transition-all duration-300 px-6 py-3.5 rounded-2xl group select-none shadow-md active:scale-95"
                  onClick={(e) => e.preventDefault()}
                >
                  <svg className="size-7 fill-white" viewBox="0 0 384 512">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 47.5-24.4 76.5 26.9 2.4 51.2-16.5 68.3-38.9z"/>
                  </svg>
                  <div className="text-left">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em] leading-none mb-1.5">Download for</span>
                    <span className="block text-[16px] font-black text-white leading-none">iOS</span>
                  </div>
                </a>

                {/* Google Play Button */}
                <a 
                  href="#" 
                  className="flex items-center gap-3.5 bg-slate-900 hover:bg-emerald-600 text-white transition-all duration-300 px-6 py-3.5 rounded-2xl group select-none shadow-md active:scale-95"
                  onClick={(e) => e.preventDefault()}
                >
                  <svg className="size-7 fill-white" viewBox="0 0 512 512">
                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.6-33.7-57.3 57.3 57.3 57.3 58.6-33.7c21.3-12.2 21.3-34.9 0-47.2zM104.6 499l220.7-221.3 60.1 60.1L104.6 499z"/>
                  </svg>
                  <div className="text-left">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em] leading-none mb-1.5">Download for</span>
                    <span className="block text-[16px] font-black text-white leading-none">Android</span>
                  </div>
                </a>
              </motion.div>
            </div>

            {/* Mobile Mockup Side */}
            <div className="lg:col-span-6 flex justify-center order-1 lg:order-2 relative">
              
              {/* Floating Glow Backing */}
              <div className="absolute inset-0 size-[300px] bg-emerald-500/10 blur-[80px] rounded-full m-auto animate-pulse"></div>

              <motion.div
                initial={{ opacity: 0, y: 50, rotateY: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full max-w-[320px] h-[640px] rounded-[3rem] bg-slate-950 border-[12px] border-slate-900 p-3 shadow-2xl overflow-hidden ring-1 ring-black/5"
              >
                {/* Phone Camera Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-b-2xl z-30"></div>
                
                {/* Simulated App GUI (LIGHT MODE) */}
                <div className="w-full h-full rounded-[2rem] bg-slate-50 relative z-20 flex flex-col overflow-hidden select-none">
                  
                  {/* Simulated Mobile App Header */}
                  <div className="pt-8 pb-4 px-6 bg-white flex items-center justify-between border-b border-slate-200/60 shadow-sm shadow-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="size-5 rounded-md bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white">G</div>
                      <span className="text-[12px] font-black tracking-tight uppercase text-slate-900">Graminate</span>
                    </div>
                    <Icon type="notifications_active" className="text-emerald-600 !text-[16px]" />
                  </div>

                  {/* Simulated Mobile Body UI Content */}
                  <div className="p-5 flex-1 space-y-5 overflow-y-auto scrollbar-none">
                    
                    {/* Live Metrics Widget */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Field Humidity</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-emerald-600">48.2%</span>
                        <span className="text-[10px] text-emerald-500 font-medium">Optimal</span>
                      </div>
                    </div>

                    {/* Live Alerts Card */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-800">Active Tasks</span>
                      {[
                        { t: "Check Block 04 Siphon", time: "Due 10:00 AM", p: "High" },
                        { t: "Replenish Warehouse C", time: "Due 02:00 PM", p: "Medium" }
                      ].map((task, tIdx) => (
                        <div key={tIdx} className="bg-white border border-slate-200/60 rounded-xl p-3 flex items-center justify-between shadow-sm">
                          <div>
                            <p className="text-[11px] font-bold text-slate-900 leading-none mb-1">{task.t}</p>
                            <p className="text-[9px] text-slate-500">{task.time}</p>
                          </div>
                          <span className="text-[8px] tracking-widest uppercase font-black text-emerald-600 border border-emerald-500/20 rounded px-1.5 py-0.5 bg-emerald-50">{task.p}</span>
                        </div>
                      ))}
                    </div>

                    {/* Analytics Chart visualization */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 h-36 flex flex-col justify-between shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Harvest Velocity</span>
                      {/* Mock chart bars */}
                      <div className="flex items-end justify-between gap-2 h-16 mt-2">
                        {[40, 65, 50, 85, 70, 95].map((height, hIdx) => (
                          <div key={hIdx} style={{ height: `${height}%` }} className="flex-1 bg-emerald-500/20 border-t-2 border-emerald-500 rounded-t-sm"></div>
                        ))}
                      </div>
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
