import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Icon, Button } from "@graminate/ui";
import { motion } from "framer-motion";
import DefaultLayout from "@/layout/DefaultLayout";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" as const }
};

interface Job {
  id: number;
  position: string;
  type: string;
  mode: string;
  description: string;
}

export default function Careers() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/jobs/jobs");
        const data = await res.json();
        if (data.jobs) {
          setJobs(data.jobs);
        }
      } catch (error) {
        console.error("Failed to fetch operational mandates:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <DefaultLayout>
      <Head>
        <title>Careers | Graminate</title>
        <meta
          name="description"
          content="Join the architects building the future operating system for modern, high-performance agriculture."
        />
      </Head>

      {/* =================== SECTION 1: CINEMATIC HERO =================== */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-slate-50 pt-24 border-b border-slate-200/60">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-[0.08] grayscale scale-105 animate-[subtle-zoom_40s_infinite_alternate]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 via-slate-50/90 to-slate-50 z-10"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block bg-emerald-500/10 backdrop-blur-xl text-emerald-600 border border-emerald-500/20 rounded-full px-4 py-1 text-xs uppercase tracking-[0.3em] font-black mb-6">
              Build With Us
            </span>
            <h1 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tighter mb-8">
              Build intelligence for the<span className="text-emerald-600 font-medium"> givers</span> of food.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed text-balance mb-10">
              We are assembling an elite team of engineers, designers, and builders dedicated to solving global data fragmentation across humanity’s most critical industry.
            </p>
            <Button 
              label="Explore Open Positions" 
              variant="primary" 
              className="!h-14 !px-8 shadow-lg shadow-emerald-600/10 rounded-full"
              onClick={() => {
                const el = document.getElementById("open-positions");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* =================== SECTION 2: VALUES - HOW WE WORK =================== */}
      <section className="py-24 md:py-36 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-20">
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <motion.div {...fadeInUp}>
                <span className="text-emerald-600 uppercase font-black tracking-[0.2em] text-xs mb-4 block">
                  Our DNA
                </span>
                <h2 className="text-2xl md:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
                  How We <span className="text-emerald-600 font-medium">Operate</span>.
                </h2>
                <p className="text-slate-600 mt-6 font-light text-lg max-w-md leading-relaxed">
                  Graminate is built upon a standard of absolute rigor. We do not deploy boilerplate solutions; we engineer for generational impact.
                </p>
              </motion.div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    title: "First Principles Obsession",
                    desc: "We dissect constraints to their raw variables. In agrarian operations, generic assumptions lead to logistic failure.",
                    icon: "psychology_alt"
                  },
                  {
                    title: "Unwavering Transparency",
                    desc: "Information must flow friction-free. We maintain immediate synchrony across all communication nodes.",
                    icon: "visibility"
                  },
                  {
                    title: "Extreme Autonomy",
                    desc: "We empower our builders with absolute agency. If you see a legacy structural failure, you own the solution.",
                    icon: "offline_bolt"
                  },
                  {
                    title: "Durability Over Polish",
                    desc: "Agriculture is harsh. Our software is engineered to resist volatility, ensuring absolute uptime in rough conditions.",
                    icon: "verified"
                  }
                ].map((value, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500"
                  >
                    <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center mb-6">
                      <Icon type={value.icon} className="!text-[24px]" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{value.title}</h3>
                    <p className="text-slate-600 text-sm font-light leading-relaxed">{value.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =================== SECTION 3: FOUNDER'S QUOTE =================== */}
      <section className="py-24 md:py-36 bg-slate-50 border-y border-slate-200/50 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:32px_32px]"></div>
        </div>

        <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Left Side: Content */}
            <div className="lg:col-span-6 order-2 lg:order-1 space-y-6">
              <motion.div {...fadeInUp} className="space-y-6">
                <span className="text-emerald-600 uppercase font-black tracking-[0.2em] text-xs block mb-2">
                  FOUNDER & CEO
                </span>
                <blockquote className="text-2xl md:text-3xl leading-tight font-medium text-slate-900 tracking-tight text-balance">
                  &ldquo;Traditional ERP systems operate in comfortable air-conditioned towers. We built Graminate to step directly onto the mud.&rdquo;
                </blockquote>
                <div className="pt-2">
                  <cite className="block text-xl font-black text-slate-900 not-italic">Borneel B. Phukan</cite>
                  <span className="block text-sm text-slate-500 font-medium mt-0.5">Founder & CEO</span>
                </div>
                <div className="pt-4">
                  <a 
                    href="https://www.linkedin.com/in/borneelphukan/" 
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[13px] tracking-wide px-5 py-2.5 rounded-full shadow-lg shadow-emerald-600/20 transition-all duration-300 active:scale-95"
                  >
                    <svg className="size-4 fill-current" viewBox="0 0 448 512">
                      <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/>
                    </svg>
                    <span>Connect on LinkedIn</span>
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Right Side: Visual Layout */}
            <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative w-full max-w-xl rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200 group bg-slate-100"
              >
                <img 
                  src="/images/people/borneel.png" 
                  alt="Borneel B. Phukan" 
                  className="w-full h-auto block grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-[1.03]" 
                />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* =================== SECTION 4: OPEN POSITIONS =================== */}
      <section id="open-positions" className="py-24 md:py-36 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          
          <motion.div {...fadeInUp} className="max-w-3xl mb-16">
            <span className="text-emerald-600 uppercase font-black tracking-[0.2em] text-xs mb-4 block">Opportunities</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-none">
              Open Positions.
            </h2>
          </motion.div>

          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
                <p className="text-slate-500 text-sm mt-4 font-light">Syncing corporate mandates...</p>
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-emerald-500/30 rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group transition-all duration-300 shadow-lg shadow-slate-100"
                >
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
                        {job.position}
                      </h3>
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {job.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Icon type="location_on" className="!text-[16px] text-slate-400" />
                      <span>{job.mode}</span>
                    </div>
                    <p className="text-slate-600 text-base font-light leading-relaxed pt-1">
                      {job.description}
                    </p>
                  </div>
                  
                  <div className="shrink-0">
                    <a 
                      href={`mailto:careers@graminate.com?subject=Application for ${encodeURIComponent(job.position)}`}
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white border border-slate-800 hover:border-emerald-500 px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 active:scale-95 select-none text-sm shadow-md"
                    >
                      <span>Apply Protocol</span>
                      <Icon type="arrow_right_alt" className="!text-[18px]" />
                    </a>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center bg-slate-50 border border-slate-200 rounded-[2.5rem] py-20 px-6 shadow-inner shadow-slate-100">
                <Icon type="work_off" className="text-slate-300 !text-[56px] mb-4 mx-auto block" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No positions currently available</h3>
                <p className="text-slate-500 text-sm font-light">We currently have zero public openings. Submit a general blueprint below.</p>
              </div>
            )}
          </div>

          {/* Future Rollout Catch */}
          <motion.div 
            {...fadeInUp}
            className="mt-16 border-t border-slate-200 pt-16 text-center"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-3">Don’t see your exact discipline?</h3>
            <p className="text-slate-600 font-light leading-relaxed mb-8">
              We always open slots for absolute talent. Initiate an unmapped application below.
            </p>
            <a 
              href="mailto:careers@graminate.com" 
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-base group transition-colors"
            >
              <span>Submit Unsolicited Application</span>
            </a>
          </motion.div>

        </div>
      </section>

    </DefaultLayout>
  );
}
