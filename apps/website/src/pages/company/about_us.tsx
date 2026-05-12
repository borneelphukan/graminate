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

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.15
    }
  },
  viewport: { once: true }
};

export default function AboutUs() {
  const router = useRouter();

  return (
    <DefaultLayout>
      <Head>
        <title>About | Graminate</title>
        <meta
          name="description"
          content="We build the intelligent infrastructure powering the next evolution of sustainable, high-performance farming."
        />
      </Head>

      {/* =================== CINEMATIC HERO =================== */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-50 pt-20 border-b border-slate-200/60">
        {/* Ambient Cinematic Live Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2832&auto=format&fit=crop"
            alt="Vibrant Live Agrarian Field"
            fill
            unoptimized
            priority
            className="object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/40 via-slate-50/80 to-slate-50 z-10"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block bg-emerald-500/10 backdrop-blur-xl text-emerald-600 border border-emerald-500/20 rounded-full px-4 py-1 text-xs uppercase tracking-[0.3em] font-black mb-6">
              Our Genesis
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-8">
              Re-architecting <span className="text-emerald-600 font-medium">Agrarian</span> Horizons.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed mb-10 text-balance">
              Graminate was founded to dissolve the boundaries between traditional farming intelligence and state-of-the-art software automation.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                label="Join the Waitlist" 
                variant="primary" 
                className="!h-14 !px-8 shadow-lg shadow-emerald-600/10 rounded-full"
                onClick={() => router.push("/waitlist")}
              />
            </div>
          </motion.div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent z-10"></div>
      </section>

      {/* =================== THE NARRATIVE (Problem vs Strategy) =================== */}
      <section className="py-24 md:py-36 bg-white text-slate-900">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Sticky Left Header */}
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <motion.div {...fadeInUp}>
                <span className="text-emerald-600 uppercase font-black tracking-[0.2em] text-xs mb-4 block">
                  The Vision
                </span>
                <h2 className="text-2xl md:text-4xl font-bold leading-[1.05] tracking-tight text-slate-900">
                  Solving Data <span className="text-emerald-600 font-medium">Fragmentation</span> at the Root.
                </h2>
              </motion.div>
            </div>

            {/* Longform Narrative Right */}
            <div className="lg:col-span-7 space-y-10">
              <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="border-l-2 border-emerald-500/30 pl-8 py-2">
                <p className="text-xl md:text-2xl text-slate-800 leading-relaxed font-light">
                  Agriculture is humanity’s most vital legacy, yet its operational logistics remain disconnected. From siloed climate inputs to disconnected inventory systems, modern farm managers must coordinate highly volatile variable chains in isolation.
                </p>
              </motion.div>

              <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="space-y-6 text-slate-600 text-lg font-light leading-relaxed pl-8">
                <p>
                  At Graminate, we realized that technology alone is not the solution; orchestration is. Traditional software treats farming as an afterthought, serving generic CRM or simple accounting interfaces. We built Graminate as an absolute operating system designed exclusively for the multi-dimensional realities of crops, livestock, smart warehouses, and distributed supply chains.
                </p>
                <p>
                  Through advanced telemetry harmonization and specialized large language models, our infrastructure empowers modern agrarian enterprises to forecast resource allocation, automate logistical replenishment, and safeguard operational histories within a single, intuitive, and cinematic interface.
                </p>
              </motion.div>

              {/* Simple Statistic Matrix */}
              <motion.div 
                initial="initial"
                whileInView="animate"
                variants={staggerContainer}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-8 pt-8 pl-8"
              >
                {[
                  { label: "Integrated Operations", value: "100%" },
                  { label: "System Availability", value: "99.9%" },
                ].map((stat, i) => (
                  <motion.div 
                    key={i} 
                    variants={fadeInUp}
                    className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 backdrop-blur-sm hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-emerald-500/20 transition-all duration-300"
                  >
                    <span className="block text-4xl md:text-5xl font-black text-slate-900 mb-1 font-mono">{stat.value}</span>
                    <span className="text-slate-500 text-sm uppercase tracking-widest font-bold">{stat.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* =================== CORE PILLARS =================== */}
      <section className="py-24 bg-slate-50 relative overflow-hidden border-y border-slate-200/50">
        {/* Faint Background Gradient */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/[0.04] blur-3xl rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <motion.div {...fadeInUp} className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
              Foundational Pillars
            </h2>
            <p className="text-slate-600 text-lg font-light">
              Built to secure durability, intelligence, and absolute precision.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "psychology",
                title: "Cognitive Agronomy",
                desc: "Specialized generative models trained specifically on agro-ecological data pipelines, yielding instant diagnostic intelligence."
              },
              {
                icon: "account_tree",
                title: "Absolute Orchestration",
                desc: "Unified ERP schemas tracking assets, workflows, and transactional ledgers in instant synchrony."
              },
              {
                icon: "verified",
                title: "Rigorous Transparency",
                desc: "Traceable operational histories designed to streamline audits, verify compliance, and minimize logistic waste."
              }
            ].map((pillar, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="bg-white border border-slate-200 shadow-lg shadow-slate-200 rounded-3xl p-10 group hover:border-emerald-500/30 hover:-translate-y-2 hover:shadow-xl transition-all duration-500"
              >
                <div className="size-16 rounded-2xl bg-emerald-50 grid place-items-center mb-8 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                  <Icon type={pillar.icon} className="!text-[32px]" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{pillar.title}</h3>
                <p className="text-slate-600 leading-relaxed font-light text-base">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== LEADERSHIP SECTION =================== */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
              <motion.div {...fadeInUp}>
                <span className="text-emerald-600 font-black uppercase tracking-[0.2em] text-xs mb-4 block">
                  Leadership
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">
                  The Founders.
                </h2>
                <p className="text-slate-600 font-light text-lg leading-relaxed">
                  Driven by an unyielding curiosity and commitment to empowering agrarian legacies across India.
                </p>
              </motion.div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Founder Card */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="group relative bg-slate-50 border border-slate-200 p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden"
                >
                  <div className="relative w-full aspect-square rounded-3xl overflow-hidden mb-6">
                    <Image 
                      src="/images/people/borneel.png" 
                      alt="Borneel B. Phukan"
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Borneel B. Phukan</h3>
                  <p className="text-emerald-600 font-bold text-sm tracking-widest uppercase mb-4 mt-1">CEO & Founder</p>
                  <p className="text-slate-600 text-sm leading-relaxed font-light">
                    Leading strategic and technical innovation of Graminate, ensuring the delivery of impactful, high-performance agrarian tools.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =================== CALL TO ACTION =================== */}
      <section className="relative py-24 md:py-36 bg-emerald-50 overflow-hidden border-t border-emerald-100">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image 
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2670&auto=format&fit=crop"
            alt="Agrarian Future Visualization"
            fill
            unoptimized
            className="object-cover opacity-[0.04] scale-105 grayscale-[40%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 via-emerald-50/90 to-emerald-50 z-10"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-20 text-center max-w-3xl">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
              Ready to Scale Your Enterprise?
            </h2>
            <p className="text-slate-600 text-lg font-light mb-10 leading-relaxed max-w-xl mx-auto">
              Secure priority queue access to our next-generation deployment rollout today.
            </p>
            <Button 
              label="Secure Early Access" 
              variant="primary" 
              className="h-16 px-10 rounded-full !text-lg active:scale-95 shadow-lg shadow-emerald-600/10 transition-all"
              onClick={() => router.push("/waitlist")}
            />
          </motion.div>
        </div>
      </section>

    </DefaultLayout>
  );
}
