import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import Services from "@/components/cards/company/PunchCard";
import Button from "@/components/ui/Button";
import FeatureBannerImage from "../../public/images/banners/main.png";
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
import { motion, AnimatePresence } from "framer-motion";

type ProcessStep = {
  step: string;
  icon: IconDefinition;
  title: string;
  description: string;
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] },
};

const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, ease: "easeOut" },
};

const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, ease: "easeOut" },
};

export default function Home() {
  const router = useRouter();
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
      title: "Requirement Gathering",
      description:
        "First we capture and refine your product requirements with precision.",
    },
    {
      step: "2",
      icon: faCompassDrafting,
      title: "Planning & Design",
      description: "Collaborate on a transparent, end-to-end project plan.",
    },
    {
      step: "3",
      icon: faRecycle,
      title: "Implement & Optimize",
      description:
        "We build and refine your product through iterative feedback-driven development.",
    },
    {
      step: "4",
      icon: faCheck,
      title: "Review & Approval",
      description:
        "We finalize your product with collaborative review and seamless adjustments.",
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
        <title>Graminate Global IT Solutions | Welcome</title>
        <meta
          name="description"
          content="Pioneering scalable, cloud-based software solutions for small and medium-sized businesses. Driving digital transformation with affordable, high-quality services."
        />
      </Head>

      <DefaultLayout>
        <main className="flex flex-col flex-grow bg-white">
          <div className="relative bg-gray-800 text-white overflow-hidden">
            <div
              ref={backgroundRef}
              className="absolute inset-0 home-container bg-cover bg-center opacity-40"
              style={{ willChange: "transform" }}
            ></div>
            <div className="absolute inset-0"></div>
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40 md:py-48 lg:py-56 z-10" // Increased padding
            >
              <div className="max-w-4xl mx-auto text-center">
                <motion.h1
                  variants={fadeInUp}
                  className="text-base sm:text-lg md:text-xl font-semibold text-green-300 uppercase tracking-wide"
                >
                  Welcome to Graminate
                </motion.h1>
                <motion.h2
                  variants={fadeInUp}
                  className="mt-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white"
                >
                  Pioneering{" "}
                  <span className="text-emerald-400">Cloud-Based</span>
                </motion.h2>
                <motion.h3
                  variants={fadeInUp}
                  className="mt-1 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white"
                >
                  Software Solutions
                </motion.h3>
                <motion.p
                  variants={fadeInUp}
                  className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto"
                >
                  Driving digital transformation for SMBs with affordable,
                  high-quality, scalable cloud solutions tailored to
                  future-proof your business through close collaboration.
                </motion.p>
                <motion.div
                  variants={fadeInUp}
                  className="mt-12 flex justify-center"
                >
                  <Button
                    style="home"
                    text="Get in Touch"
                    onClick={() => navigateTo("/company/contact_us")}
                  />
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
                    title="Solutions for All Businesses"
                    content="Robust software solutions across modern industries, fully customised, safe, and secured under your control."
                  />
                </motion.div>
                <motion.div variants={staggerItem}>
                  <Services
                    icon={faCode}
                    title="Robust Planning & Development"
                    content="A dedicated team efficiently builds your fault-proof, high-performance software solutions based on your interests."
                  />
                </motion.div>
                <motion.div variants={staggerItem}>
                  <Services
                    icon={faCloud}
                    title="Powered by the Cloud"
                    content="Engineered and deployed in a secure, industrial-grade cloud database with high-speed accessibility."
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
                  <h4 className="text-base font-semibold text-emerald-600 uppercase tracking-wide">
                    Scale with Control
                  </h4>
                  <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    Innovative Software to Future-Proof Your Business
                  </h2>
                  <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                    At Graminate, we craft high-quality, scalable software
                    solutions tailored to your unique business
                    challenges—empowering growth through innovative technology.
                  </p>
                  <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                    Our team blends deep technical expertise in software
                    engineering, DevOps, and UX/UI design to accelerate your
                    digital transformation and ensure seamless product delivery.
                  </p>
                  <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                    Whether you&apos;re building from the ground up or
                    modernizing existing systems, Graminate enables your tech
                    evolution with future-ready tools and strategic guidance.
                  </p>
                  <Button
                    style="home"
                    text="Learn More"
                    onClick={() => navigateTo("/industries")}
                  />
                </motion.div>
                <motion.div
                  initial="initial"
                  whileInView="animate"
                  variants={scaleIn}
                  viewport={{ once: true, amount: 0.3 }}
                  className="lg:w-1/2 flex justify-center items-center mt-10 lg:mt-0"
                >
                  <Image
                    src={FeatureBannerImage}
                    alt="Feature Banner showcasing software development process"
                    className="w-full max-w-sm md:max-w-lg object-contain rounded-lg"
                    width={200}
                    height={200}
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
                  How We Approach Projects
                </h2>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                  We ensure complete transparency and adherence to deadlines
                  while developing your product through a structured process.
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
                    className="w-full h-auto max-h-[450px] object-cover rounded-lg shadow-lg"
                    src={"/images/home-page.png"}
                    alt="Modern software development workstation"
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
                  <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
                    <p className="text-green-200 text-sm font-semibold uppercase tracking-wide text-center lg:text-left">
                      What We Do
                    </p>
                    <h5 className="text-gray-900 text-2xl sm:text-3xl font-bold my-4 text-center lg:text-left">
                      We bring your ideas to Life
                    </h5>
                    <p className="text-gray-600 text-base sm:text-lg mt-4 leading-relaxed text-center lg:text-left">
                      At Graminate, we transform ideas into innovative software
                      solutions driving growth and efficiency. From sleek mobile
                      apps to robust enterprise systems, we craft code that
                      powers your vision. Let’s build the future, one line at a
                      time.
                    </p>

                    <div className="flex justify-center lg:justify-start mt-8">
                      <Button
                        style="home"
                        text="Explore Services"
                        onClick={() => navigateTo("/services")}
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
