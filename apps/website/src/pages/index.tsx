import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import { Icon } from "@graminate/ui";
import { useState, useRef } from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useTranslation } from "@/contexts/I18nContext";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerItem: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// UI Decorative Component
const SparkleIcon = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${className} animate-pulse`} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" fill="currentColor" />
  </svg>
);

// Mesh Grid Background Pattern
const MeshBackground = () => (
  <div 
    className="absolute inset-0 pointer-events-none z-0" 
    style={{ 
      maskImage: "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
      WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)"
    }}
  >
    {[...Array(8)].map((_, i) => (
      <div 
        key={`v-${i}`} 
        className="absolute top-0 bottom-0 w-px bg-emerald-500/10" 
        style={{ left: `${(i + 1) * 12.5}%` }} 
      />
    ))}
    {[...Array(10)].map((_, i) => (
      <div 
        key={`h-${i}`} 
        className="absolute left-0 right-0 h-px bg-emerald-500/10" 
        style={{ top: `${(i + 1) * 10}%` }} 
      />
    ))}
  </div>
);

// Accordion Item Component for FAQ
const FaqItem = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => (
  <div className="border border-gray-400 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300">
    <button 
      onClick={onClick}
      className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
    >
      <span className="font-semibold text-gray-800 text-lg leading-tight">{question}</span>
      <motion.div 
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-emerald-600 flex-shrink-0"
      >
        <Icon type="expand_more" className="size-6" />
      </motion.div>
    </button>
    <motion.div
      initial={false}
      animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="px-6 pb-5 text-gray-600 text-base leading-relaxed border-t border-gray-50 pt-2">
        {answer}
      </div>
    </motion.div>
  </div>
);

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [footerEmail, setFooterEmail] = useState("");
  const scrollContainerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.4]);

  const navigateTo = (url: string) => {
    router.push(url);
  };

  const features = [
    {
      icon: "insights",
      titleKey: "home.erp.title",
      contentKey: "home.erp.content",
      img: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=1000&auto=format&fit=crop",
    },
    {
      icon: "psychology",
      titleKey: "home.ai.title",
      contentKey: "home.ai.content",
      img: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1000&auto=format&fit=crop",
    },
    {
      icon: "inventory",
      titleKey: "home.supply.title",
      contentKey: "home.supply.content",
      img: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=1000&auto=format&fit=crop",
    },
    {
      icon: "eco",
      titleKey: "home.industry.title",
      contentKey: "home.industry.content",
      img: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1000&auto=format&fit=crop",
    }
  ];

  const onboardingSteps = [
    {
      num: "01",
      title: "Setup Profile",
      desc: "Configure initial currency and units.",
      icon: "account_circle"
    },
    {
      num: "02",
      title: "Select Modules",
      desc: "Activate Specialized Modules.",
      icon: "widgets"
    },
    {
      num: "03",
      title: "Sync Data",
      desc: "Import your farm assets.",
      icon: "cloud_sync"
    }
  ];

  const faqs = [
    {
      q: "Is Graminate suitable for individual smallholders?",
      a: "Absolutely. While enterprise-scalable, Graminate has lightweight entry modules designed specifically for managing independent farms efficiently."
    },
    {
      q: "Does the AI assistant require internet connection?",
      a: "Certain forecasting and chat functionalities require a connection, however, localized tracking tools will synchronize automatically once you re-connect."
    },
    {
      q: "Can I integrate with external IoT sensors?",
      a: "Yes, our API supports major agricultural sensors for automated environmental condition logging directly into your ERP dashboard."
    }
  ];

  return (
    <>
      <Head>
        <title>{t("nav.brand")} | Precise Agricultural Operating System</title>
        <meta
          name="description"
          content="The definitive modular management ecosystem for modern agriculture, powered by actionable data and AI models."
        />
      </Head>

      <DefaultLayout>
        <main ref={scrollContainerRef} className="relative flex flex-col flex-grow bg-slate-50 overflow-x-hidden">
          
          {/* =================== HERO SECTION =================== */}
          <section className="relative bg-slate-900 min-h-[90vh] flex items-center justify-center text-center overflow-hidden pt-20">
            <MeshBackground />
            
            {/* Hero Visual Background */}
            <motion.div 
              style={{ scale: heroScale, opacity: heroOpacity }}
              className="absolute inset-0 z-0"
            >
              <Image
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop"
                alt="Modern Agrarian Cinematic View"
                fill
                priority
                unoptimized
                className="object-cover brightness-[0.35] grayscale-[20%]"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900"></div>
            </motion.div>

            {/* Sparkles */}
            <SparkleIcon size={42} className="absolute top-[20%] left-[10%] text-emerald-400/60 hidden md:block" />
            <SparkleIcon size={28} className="absolute top-[35%] right-[15%] text-emerald-300/40 hidden md:block" />
            <SparkleIcon size={18} className="absolute bottom-[30%] left-[25%] text-emerald-500/50 hidden md:block" />

            <div className="relative z-10 container mx-auto px-6 md:px-12 max-w-5xl flex flex-col items-center">
              {/* Animated Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full mb-8 shadow-2xl shadow-emerald-900/20"
              >
                <span className="size-2.5 rounded-full bg-emerald-500 inline-block animate-pulse ring-4 ring-emerald-500/20" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
                  {t("hero.badge")}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="font-black text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] tracking-tighter text-balance drop-shadow-2xl"
              >
                {t("hero.title").split(" ").slice(0, -1).join(" ")}{" "}
                <span className="text-emerald-400 font-medium relative inline-block">
                  {t("hero.title").split(" ").pop()}
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal font-display"
              >
                {t("hero.subtitle")}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-12 flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto"
              >
                <button 
                  onClick={() => navigateTo("/services")}
                  className="group relative w-full sm:w-auto h-14 px-10 rounded-full bg-emerald-500 text-white font-bold overflow-hidden transition-all hover:bg-emerald-600 hover:shadow-[0_0_40px_8px_rgba(16,185,129,0.3)] active:scale-95 flex items-center justify-center gap-3"
                >
                  <span className="relative z-10">Learn More</span>
                  <Icon type="arrow_forward" className="size-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={() => navigateTo("/waitlist")}
                  className="h-14 px-10 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center"
                >
                  Join the Waitlist
                </button>
              </motion.div>
            </div>

            {/* Bottom Fade for Seamless Transition */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>
          </section>
          
          <section className="relative z-20 py-24 md:py-32 bg-slate-900 text-white">
            <div className="container mx-auto px-6 lg:px-12">
              
              <motion.div 
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-end mb-20"
              >
                <div>
                  <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-balance leading-[1.1]">
                    Addressing the <span className="text-emerald-400 font-medium italic">Complexities</span> of Future Farming.
                  </h2>
                </div>
                <div className="flex items-center">
                  <p className="text-slate-400 text-lg max-w-md border-l-2 border-emerald-500/50 pl-6 py-2">
                    Traditional data silos lead to resource wastage. Graminate harmonizes disparate variables into one intelligent ecosystem.
                  </p>
                </div>
              </motion.div>

              {/* Cinematic Masonry/Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {features.map((feat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.15 }}
                    className={`group relative overflow-hidden rounded-3xl aspect-[3/4] cursor-pointer flex flex-col justify-end p-6 border border-white/5 shadow-2xl ${idx % 2 === 1 ? "md:mt-12" : ""}`}
                  >
                    <Image 
                      src={feat.img}
                      alt={feat.titleKey}
                      fill
                      unoptimized
                      className="object-cover absolute inset-0 grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-60 transition-all duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10"></div>
                    
                    <div className="relative z-20 flex flex-col items-start">
                      <div className="size-14 bg-emerald-500/20 backdrop-blur-lg border border-emerald-500/30 rounded-2xl grid place-items-center mb-4 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                        <Icon type={feat.icon} className="text-[28px] flex items-center justify-center" />
                      </div>
                      <span className="text-xs tracking-[0.3em] font-black text-emerald-500 mb-2 uppercase opacity-70">0{idx + 1}</span>
                      <h3 className="text-xl md:text-2xl font-bold mb-2 text-white group-hover:text-emerald-400 transition-colors">
                        {t(feat.titleKey)}
                      </h3>
                      <p className="text-slate-300/90 text-sm leading-relaxed">
                        {t(feat.contentKey)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </section>

          {/* =================== SYSTEM FEATURES (Core Capability Matrix) =================== */}
          <section className="py-24 md:py-32 bg-slate-50 relative">
            
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
              
              <motion.div 
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-20"
              >
                <motion.p variants={staggerItem} className="text-emerald-600 font-bold tracking-[0.2em] text-sm uppercase mb-4">
                  Strategic Core
                </motion.p>
                <motion.h2 variants={staggerItem} className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  {t("home.transform.title")}
                </motion.h2>
                <motion.p variants={staggerItem} className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Seamless orchestration across every layer of your agrarian business model.
                </motion.p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: "verified_user", color: "bg-emerald-500", title: "Total Governance", desc: "Rigorous tracking of access controls and operational histories." },
                  { icon: "rocket_launch", color: "bg-blue-500", title: "High Efficiency", desc: "Optimized supply paths that reduce delivery overhead." },
                  { icon: "eco", color: "bg-green-500", title: "Sustainability Driven", desc: "Eco-optimized logistics workflows to improve carbon scores." }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="bg-white border border-slate-200/60 p-10 rounded-[2.5rem] shadow-sm shadow-slate-200 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden hover:-translate-y-1"
                  >
                    {/* Hover Accent Corner */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full"></div>
                    
                    <div className="relative z-10">
                      <div className={`size-12 rounded-2xl ${item.color} text-white flex items-center justify-center shadow-lg shadow-emerald-900/10 mb-8`}>
                        <Icon type={item.icon} className="size-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-emerald-700 transition-colors">{item.title}</h3>
                      <p className="text-slate-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* =================== HOW IT WORKS / STEPS SECTION =================== */}
          <section className="py-24 bg-slate-100 border-y border-slate-200/60">
            <div className="container mx-auto px-6">
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-20"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                  Scalable. <span className="text-emerald-600 font-medium">Simpler.</span> Immediate.
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                {onboardingSteps.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="text-center group relative flex flex-col items-center"
                  >
                    {/* Connecting Lines (desktop only) */}
                    {i < onboardingSteps.length - 1 && (
                      <div className="hidden md:block absolute top-12 left-[calc(50%+3.5rem)] w-[calc(100%-7rem)] h-px bg-gradient-to-r from-emerald-200 via-emerald-400/40 to-emerald-200 z-0"></div>
                    )}

                    <div className="relative z-10">
                      <div className="size-24 rounded-full bg-white border-4 border-slate-50 shadow-lg grid place-items-center mb-6 group-hover:border-emerald-100 group-hover:shadow-emerald-200/50 transition-all duration-500">
                        <Icon type={s.icon} className="text-[36px] flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform" />
                      </div>

                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h3>
                    <p className="text-slate-500 text-base max-w-[220px]">{s.desc}</p>
                  </motion.div>
                ))}
              </div>

            </div>
          </section>

          {/* =================== FAQ ACCORDION =================== */}
          <section className="py-24 md:py-32 bg-slate-50">
            <div className="container mx-auto px-6 max-w-3xl">
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <p className="text-sm font-bold tracking-[0.2em] text-emerald-600 uppercase mb-3">Information Hub</p>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                  Frequently Asked
                </h2>
              </motion.div>

              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <FaqItem 
                      question={faq.q} 
                      answer={faq.a} 
                      isOpen={openFaq === i}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)} 
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* =================== BIG CTA =================== */}
          <section className="relative py-32 overflow-hidden">
            <div className="absolute inset-0">
              <Image 
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2670&auto=format&fit=crop"
                alt="CTA Background"
                fill
                unoptimized
                className="object-cover brightness-[0.3]"
              />
              <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-[1px]"></div>
            </div>

            <div className="relative z-10 container mx-auto px-6 text-center max-w-3xl flex flex-col items-center">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.05] mb-8"
              >
                Ready to scale your vision?
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-emerald-100 text-lg md:text-xl mb-12 max-w-xl"
              >
                Join forward-thinking agrarian pioneers using Graminate's intelligent Operating System.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg"
              >
                <input 
                  type="email" 
                  placeholder="Enter email for early access" 
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  className="w-full h-14 px-8 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl text-white placeholder:text-emerald-100/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg"
                />
                <button 
                  onClick={() => router.push(`/waitlist?email=${encodeURIComponent(footerEmail)}`)}
                  className="w-full sm:w-auto h-14 px-8 bg-emerald-500 text-white font-black rounded-full hover:bg-white hover:text-emerald-900 transition-all duration-300 whitespace-nowrap shadow-xl"
                >
                  Get Started
                </button>
              </motion.div>
            </div>
          </section>

        </main>
      </DefaultLayout>
    </>
  );
}
