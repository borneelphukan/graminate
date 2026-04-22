import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import Services from "@/components/cards/company/PunchCard";
import { Button } from "@graminate/ui";
import {
  faChevronCircleLeft,
  faChevronCircleRight,
  faCloud,
  faCode,
  faBuilding,
  faList,
  faCompassDrafting,
  faRecycle,
  faCheck,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useRef, useEffect } from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useTranslation } from "@/contexts/I18nContext";

type ProcessStep = {
  step: string;
  icon: IconDefinition;
  title: string;
  description: string;
};

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeInUpTransition = { duration: 0.6, ease: "easeOut" as const };

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] } },
};

const scaleInTransition = { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] as const };

const slideInLeft: Variants = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const slideInRight: Variants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const backgroundRef = useRef<HTMLDivElement>(null);

  const navigateTo = (url: string) => {
    router.push(url);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (backgroundRef.current) {
        const scrollY = window.scrollY;
        const maxScroll = window.innerHeight * 0.5;
        const maxScale = 1.15;
        const baseScale = 1.0;

        const scrollRatio = Math.min(scrollY / maxScroll, 1);
        const scale = baseScale + scrollRatio * (maxScale - baseScale);

        window.requestAnimationFrame(() => {
          if (backgroundRef.current) {
            backgroundRef.current.style.transform = `scale(${scale})`;
          }
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const steps: ProcessStep[] = [
    {
      step: "1",
      icon: faList,
      title: "Account Setup",
      description:
        "Create your secure farm profile and set your regional currency and units.",
    },
    {
      step: "2",
      icon: faCompassDrafting,
      title: "Module Configuration",
      description: "Select specialized modules for Livestock, Apiculture, or Poultry management.",
    },
    {
      step: "3",
      icon: faRecycle,
      title: "Inventory Sync",
      description:
        "Seamlessly import your existing warehouse and livestock data into our smart database.",
    },
    {
      step: "4",
      icon: faCheck,
      title: "AI Integration",
      description:
        "Initialize your AI assistant with your farm's historical data for personalized insights.",
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextStep = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const paginate = (newDirection: number) => {
    if (newDirection > 0) {
      nextStep();
    } else {
      prevStep();
    }
  };

  const carouselVariants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 50 : -50,
        opacity: 0,
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 50 : -50,
        opacity: 0,
      };
    },
  };

  return (
    <>
      <Head>
        <title>{t("nav.brand")} | Smart Agricultural ERP & AI Assistance</title>
        <meta
          name="description"
          content="The complete operating system for modern farmers. Manage livestock, inventory, CRM, and leverage specialized AI to grow your agricultural business."
        />
      </Head>

      <DefaultLayout>
        <main className="flex flex-col flex-grow bg-white">
          <div className="relative bg-gray-900 text-white overflow-hidden">
            <div
              ref={backgroundRef}
              className="absolute inset-0 home-container bg-cover bg-center opacity-30 scale-105"
              style={{ 
                willChange: "transform",
                backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop")'
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/40 to-gray-900"></div>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40 md:py-48 lg:py-56 z-10"
            >
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  variants={fadeInUp}
                  transition={fadeInUpTransition}
                  className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-8"
                >
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">
                    {t("hero.badge")}
                  </span>
                </motion.div>
                
                <motion.h2
                  variants={fadeInUp}
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6"
                >
                  {t("hero.title")}
                </motion.h2>
                
                <motion.p
                  variants={fadeInUp}
                  className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light"
                >
                  {t("hero.subtitle")}
                </motion.p>
                
                <motion.div
                  variants={fadeInUp}
                  className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6"
                >
                  <Button
                    variant="primary"
                    label={t("hero.cta")}
                    onClick={() => navigateTo("http://localhost:3000/")}
                  />
                  <button 
                    onClick={() => navigateTo("/services")}
                    className="group flex items-center space-x-3 text-white font-semibold hover:text-emerald-400 transition-colors"
                  >
                    <span>{t("hero.explore")}</span>
                    <FontAwesomeIcon icon={faChevronCircleRight} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="relative py-16 sm:py-20 lg:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-40 sm:-mt-48 md:-mt-52 z-20 relative">
              <motion.div
                initial="initial"
                whileInView="animate"
                variants={staggerContainer}
                viewport={{ once: true, amount: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <motion.div variants={staggerItem}>
                  <Services
                    icon={faBuilding}
                    title={t("home.erp.title")}
                    content={t("home.erp.content")}
                  />
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Services
                    icon={faCode}
                    title={`${t("nav.brand")} ${t("home.ai.title")}`}
                    content={t("home.ai.content")}
                  />
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Services
                    icon={faCloud}
                    title={t("home.supply.title")}
                    content={t("home.supply.content")}
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
          <div className="bg-gradient-to-b from-gray-50 to-white py-20 sm:py-24 lg:py-32 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
                <motion.div
                  initial="initial"
                  whileInView="animate"
                  variants={slideInLeft}
                  viewport={{ once: true, amount: 0.3 }}
                  className="lg:w-1/2 text-center lg:text-left"
                >
                <div className="flex flex-col justify-center">
                  <h4 className="text-base font-semibold text-emerald-600 uppercase tracking-wide">
                    {t("home.transform.badge")}
                  </h4>
                  <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    {t("home.transform.title")}
                  </h2>
                  <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                    {t("home.transform.desc1").replace("{brand}", t("nav.brand"))}
                  </p>
                  <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                    {t("home.transform.desc2")}
                  </p>
                  <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                    {t("home.transform.desc3").replace("{brand}", t("nav.brand"))}
                  </p>
                  <Button
                    variant="secondary"
                    label={t("home.transform.cta")}
                    onClick={() => navigateTo("/services")}
                  />
                  </div>
                </motion.div>
                <motion.div
                  initial="initial"
                  whileInView="animate"
                  variants={scaleIn}
                  transition={scaleInTransition}
                  viewport={{ once: true, amount: 0.3 }}
                  className="lg:w-1/2 flex justify-center items-center mt-10 lg:mt-0"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2670&auto=format&fit=crop"
                    alt="Farmer using a tablet in a wheat field"
                    className="w-full max-w-sm md:max-w-lg object-cover rounded-3xl shadow-2xl"
                    width={500}
                    height={500}
                    priority
                  />
                </motion.div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-100 py-20 sm:py-24 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="initial"
                whileInView="animate"
                variants={fadeInUp}
                viewport={{ once: true, amount: 0.3 }}
                className="max-w-4xl mx-auto text-center mb-16 lg:mb-20"
              >
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {t("home.onboarding.title").replace("{brand}", t("nav.brand"))}
                </h2>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                  {t("home.onboarding.subtitle")}
                </p>
              </motion.div>

              {/* Desktop View */}
              <motion.div
                initial="initial"
                whileInView="animate"
                variants={staggerContainer}
                viewport={{ once: true, amount: 0.2 }}
                className="hidden md:flex justify-center items-start space-x-6 lg:space-x-10"
              >
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    variants={staggerItem}
                    className="flex flex-col items-center text-center p-4 max-w-[240px] group"
                  >
                    <div className="w-24 h-24 mb-4 shadow-lg rounded-full flex items-center justify-center transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-gray-200/50 group-hover:shadow-lg">
                      <FontAwesomeIcon
                        icon={step.icon}
                        className="text-emerald-500 text-4xl transition-colors duration-300 group-hover:text-emerald-600" // Changed icon color
                      />
                    </div>
                    <h5 className="text-lg font-semibold text-gray-900 mt-4">
                      {step.step}. {step.title}
                    </h5>
                    <p className="text-gray-600 text-sm mt-2 leading-snug">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="md:hidden relative mt-12 px-4 overflow-hidden">
                <div className="relative flex items-center justify-center h-72">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={currentStep}
                      custom={direction}
                      variants={carouselVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                      }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={1}
                      onDragEnd={(e, { offset, velocity }) => {
                        const swipe = Math.abs(offset.x) * velocity.x;
                        if (swipe < -1000 && currentStep < steps.length - 1) {
                          paginate(1);
                        } else if (swipe > 1000 && currentStep > 0) {
                          paginate(-1);
                        }
                      }}
                      className="absolute w-full max-w-xs mx-auto flex flex-col items-center text-center px-4 py-4"
                    >
                      <div className="w-20 h-20 mb-4 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={steps[currentStep].icon}
                          className="text-green-200 text-3xl"
                        />
                      </div>
                      <h5 className="text-xl font-semibold mt-4 text-gray-900">
                        {steps[currentStep].title}
                      </h5>
                      <p className="text-gray-600 text-base mt-2 leading-snug">
                        {steps[currentStep].description}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity duration-300 z-10`}
                  aria-label="Previous Step"
                >
                  <FontAwesomeIcon
                    icon={faChevronCircleLeft}
                    className="text-4xl"
                  />
                </button>
                <button
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity duration-300 z-10`}
                  aria-label="Next Step"
                >
                  <FontAwesomeIcon
                    icon={faChevronCircleRight}
                    className="text-4xl"
                  />
                </button>
                <div className="flex justify-center space-x-2 mt-8">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setDirection(index > currentStep ? 1 : -1);
                        setCurrentStep(index);
                      }}
                      className={`w-2.5 h-2.5 rounded-full ${
                        currentStep === index
                          ? "bg-green-200 scale-110"
                          : "bg-gray-300 hover:bg-gray-400"
                      } transition-all duration-300`}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                <motion.div
                  initial="initial"
                  whileInView="animate"
                  variants={slideInLeft}
                  viewport={{ once: true, amount: 0.3 }}
                  className="w-full lg:w-1/2"
                >
                  <Image
                    className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
                    src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2670&auto=format&fit=crop"
                    alt="Lush green vegetable farm"
                    width={800}
                    height={600}
                    loading="lazy"
                  />
                </motion.div>
                <motion.div
                  initial="initial"
                  whileInView="animate"
                  variants={slideInRight}
                  viewport={{ once: true, amount: 0.3 }}
                  className="w-full lg:w-1/2"
                >
                  <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border border-gray-400">
                    <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest mb-4">
                      {t("home.mission.badge")}
                    </p>
                    <h5 className="text-gray-900 text-3xl sm:text-4xl font-black mb-6 leading-tight">
                      {t("home.mission.title")}
                    </h5>
                    <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                      <p>
                        {t("home.mission.desc1").replace("{brand}", t("nav.brand"))}
                      </p>
                      <p>
                        {t("home.mission.desc2")}
                      </p>
                    </div>

                    <div className="mt-10">
                      <Button
                        variant="home"
                        label={t("home.mission.cta")}
                        onClick={() => navigateTo("/industries")}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </DefaultLayout>
    </>
  );
}
