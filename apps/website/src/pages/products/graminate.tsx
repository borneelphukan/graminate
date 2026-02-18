import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { useEffect, useRef, useState, useCallback } from "react";
import Head from "next/head";
import Image from "next/image";
import PriceCard from "@/components/cards/company/PriceCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faArrowTrendUp,
  faBoxes,
  faChevronLeft,
  faChevronRight,
  faCloud,
  faDollar,
  faUsers,
  faUsersViewfinder,
  faWheatAwn,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] },
};

const scrollFadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.7, ease: "easeOut" },
};

const scrollStaggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  viewport: { once: true, amount: 0.1 },
};

const scrollStaggerItem = {
  initial: { opacity: 0, y: 30 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  viewport: { once: true, amount: 0.1 },
};

const featureIconHover = {
  scale: 1.1,
  transition: { type: "spring", stiffness: 400, damping: 10 },
};

const faqContent = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { opacity: 1, height: "auto", marginTop: "0.5rem" },
  transition: { duration: 0.3, ease: "easeInOut" },
};

type Frequency = "monthly" | "annually";

type FrequencyOption = {
  value: Frequency;
  labelKey: keyof typeof content;
  priceSuffix: string;
};

type PricingTier = {
  nameKey: string;
  id: string;
  href: string;
  price: Record<Frequency, string>;
  descriptionKey: string;
  featuresKeys: string[];
  mostPopular: boolean;
};

type Pricing = {
  frequencies: FrequencyOption[];
  tiers: PricingTier[];
};

const content = {
  Monthly: "Monthly",
  Yearly: "Yearly",
  "Mini Pack": "Mini Pack",
  "Regular Pack": "Regular Pack",
  "Professional Pack": "Professional Pack",
  "Mini Pack Description":
    "Essential features for individuals and small teams just getting started.",
  "Regular Pack Description":
    "Comprehensive tools for growing businesses and established teams.",
  "Professional Pack description":
    "Advanced features and support for large organizations and enterprises.",
  point1: "Core Feature A",
  point2: "Core Feature B",
  point3: "Basic Reporting",
  point4: "Email Support",
  point5: "Advanced Feature C",
  point6: "Priority Support & SLA",
  faq_q1: "What is Graminate ERP?",
  faq_a1:
    "Graminate ERP is an all-in-one software solution designed specifically for agriculture-related businesses to streamline operations, manage resources, track finances, and ultimately boost productivity and profitability.",
  faq_q2: "Who is Graminate ERP for?",
  faq_a2:
    "It is ideal for farms, poultry businesses, agricultural startups, cooperatives, distributors, and any business involved in the agricultural supply chain seeking digitalization and better management tools.",
  faq_q3: "How does the pricing work?",
  faq_a3:
    "We offer flexible monthly and annual subscription plans tailored to different business sizes and needs. Choose the pack that best fits your requirements. Annual plans offer a significant discount.",
  "Price Header": "Flexible Pricing for Every Agricultural Business",
  "Price Subheader":
    "Choose the plan that scales with your agricultural business needs.",
  "Get Started": "Get Started",
  "Why Graminate ERP ?": "Why Graminate ERP?",
  "Platform Title":
    "A platform to monitor and drive agricultural business profits",
  "Platform Desc":
    "Our software features simple interfaces designed to help you monitor operations, automate communication, track expenses, and manage critical tasks essential for the success of your business.",
  "Testimonial Quote":
    "Graminate ERP transformed how we manage our farm. Tracking yields and expenses is now effortless, giving us clear insights into our profitability. The weather and price tracking features are invaluable.",
  "Testimonial Author": "Anya Sharma",
  "Testimonial Role": "Owner, Sunrise Organics",
  "FAQ Title": "Frequently Asked Questions",
};

const faqs: {
  questionKey: keyof typeof content;
  answerKey: keyof typeof content;
}[] = [
  { questionKey: "faq_q1", answerKey: "faq_a1" },
  { questionKey: "faq_q2", answerKey: "faq_a2" },
  { questionKey: "faq_q3", answerKey: "faq_a3" },
];

const pricing: Pricing = {
  frequencies: [
    {
      value: "monthly",
      labelKey: "Monthly",
      priceSuffix: "/month",
    },
    {
      value: "annually",
      labelKey: "Yearly",
      priceSuffix: "/year",
    },
  ],
  tiers: [
    {
      nameKey: "Mini Pack",
      id: "tier-mini",
      href: "#",
      price: { monthly: "₹750", annually: "₹7500" },
      descriptionKey: "Mini Pack Description",
      featuresKeys: ["point1", "point2", "point3", "point4"],
      mostPopular: false,
    },
    {
      nameKey: "Regular Pack",
      id: "tier-regular",
      href: "#",
      price: { monthly: "₹1500", annually: "₹15000" },
      descriptionKey: "Regular Pack Description",
      featuresKeys: ["point1", "point2", "point3", "point4", "point5"],
      mostPopular: true,
    },
    {
      nameKey: "Professional Pack",
      id: "tier-professional",
      href: "#",
      price: { monthly: "₹3000", annually: "₹30000" },
      descriptionKey: "Professional Pack description",
      featuresKeys: [
        "point1",
        "point2",
        "point3",
        "point4",
        "point5",
        "point6",
      ],
      mostPopular: false,
    },
  ],
};

const features = [
  {
    icon: faAddressBook,
    title: "Customer Relationship Management (CRM)",
    description:
      "Maintain client databases, manage contracts, track receipts, and organize tasks in taskboards.",
  },
  {
    icon: faWheatAwn,
    title: "Farm & Poultry Management",
    description:
      "Track yields and boost output while encouraging organic farming practices.",
  },
  {
    icon: faArrowTrendUp,
    title: "Price Tracker",
    description:
      "Monitor live commodity prices and view historical trends to make informed decisions.",
  },
  {
    icon: faCloud,
    title: "Weather Monitor",
    description:
      "Get tailored weather updates and recommendations for your crops and produce.",
  },
  {
    icon: faDollar,
    title: "Finance Tracker",
    description:
      "Keep track of your live expenses, losses and overall profit as you proceed in your business or your yield.",
  },
  {
    icon: faBoxes,
    title: "Inventory Management",
    description:
      "Track stock levels, input/output, expiry and more to streamline your supply chain.",
  },
  {
    icon: faUsers,
    title: "Worker Management",
    description:
      "Managing a team of workers and need help managing their payment, data or performance? Streamline data for your employees.",
  },
  {
    icon: faUsersViewfinder,
    title: "Partner Finder",
    description:
      "Looking for businesses near your locality who could assist with supplies or distribution? Look no further than the Partner Finder.",
  },
];

export default function GraminateERP() {
  const [faqOpen, setFaqOpen] = useState<Set<number>>(new Set());
  const toggleFAQ = (index: number) => {
    setFaqOpen((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const [frequency, setFrequency] = useState<FrequencyOption>(
    pricing.frequencies[0]
  );
  const [selectedTier, setSelectedTier] = useState<PricingTier>(
    pricing.tiers.find((tier) => tier.mostPopular) || pricing.tiers[0]
  );

  const [currentSlide, setCurrentSlide] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const featuresPerSlide = isMobile ? 1 : 4;
  const totalSlides = Math.ceil(features.length / featuresPerSlide);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev + 1);
  }, [isTransitioning]);

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev - 1);
  };

  useEffect(() => {
    if (isHoveringCarousel) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [handleNext, isHoveringCarousel]);

  const slides = [];
  if (features.length > 0) {
    const featuresToBufferEnd = features.slice(-featuresPerSlide);
    const featuresToBufferStart = features.slice(0, featuresPerSlide);

    slides.push(featuresToBufferEnd);

    for (let i = 0; i < totalSlides; i++) {
      slides.push(
        features.slice(i * featuresPerSlide, (i + 1) * featuresPerSlide)
      );
    }

    slides.push(featuresToBufferStart);
  }

  const carouselRef = useRef<HTMLDivElement>(null);
  const currentSlideRef = useRef(currentSlide);

  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (currentSlide === 0) {
      if (carouselRef.current) carouselRef.current.style.transition = "none";
      setCurrentSlide(totalSlides);
      requestAnimationFrame(() => {
        if (carouselRef.current)
          carouselRef.current.style.transition = "transform 0.5s ease-in-out";
      });
    } else if (currentSlide === slides.length - 1) {
      if (carouselRef.current) carouselRef.current.style.transition = "none";
      setCurrentSlide(1);
      requestAnimationFrame(() => {
        if (carouselRef.current)
          carouselRef.current.style.transition = "transform 0.5s ease-in-out";
      });
    }
  };

  return (
    <>
      <Head>
        <title>Graminate ERP | Agriculture Management Software</title>
        <meta
          name="description"
          content="Graminate ERP: An all-in-one solution to streamline your agricultural business, manage resources, track finances, and maximize profits."
        />
      </Head>

      <Navbar signIn />

      <main className="flex flex-grow flex-col bg-white overflow-x-hidden">
        <div className="relative isolate overflow-hidden bg-gradient-to-b from-emerald-50 to-white pt-14">
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a0f2d1] to-[#34d399] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
          <div className="py-24 sm:py-32 lg:pb-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <motion.div
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                className="mx-auto max-w-4xl text-center"
              >
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  Digitalize Your Agriculture Business with{" "}
                  <span className="text-emerald-600">Graminate ERP</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  A smart, all-in-one, easy-to-use solution to streamline your
                  agricultural startup or business, manage resources, observe
                  finances, and track growth. Maximize profits and yields.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <div className="mt-8">
                    <Link
                      href="/company/contact_us"
                      className="inline-flex items-center px-6 py-2 border border-transparent text-lg font-medium rounded-md text-white bg-green-200 hover:bg-green-100 transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial="initial"
                animate="animate"
                variants={scaleIn}
                transition={{ delay: 0.3, ...scaleIn.transition }}
                className="mt-16 sm:mt-20 flow-root"
              >
                <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                  <Image
                    src="/images/screenshot.png"
                    alt="Graminate ERP Application Screenshot"
                    width={2432}
                    height={1442}
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
          <div
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            aria-hidden="true"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#34d399] to-[#a0f2d1] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </div>

        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              variants={scrollFadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={scrollFadeInUp.viewport}
              className="mx-auto max-w-3xl lg:text-center"
            >
              <h2 className="text-base font-semibold leading-7 text-green-200">
                {content["Why Graminate ERP ?"]}
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {content["Platform Title"]}
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {content["Platform Desc"]}
              </p>
            </motion.div>

            <motion.div
              variants={scrollFadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={scrollFadeInUp.viewport}
              className="relative mx-auto mt-16 max-w-6xl sm:mt-20 lg:mt-24"
              onMouseEnter={() => setIsHoveringCarousel(true)}
              onMouseLeave={() => setIsHoveringCarousel(false)}
            >
              <button
                onClick={handlePrev}
                disabled={isTransitioning}
                className="absolute left-0 lg:-left-10 top-1/2 z-20 -translate-y-1/2 rounded-full p-2.5 text-gray-500 shadow-md hover:bg-gray-300 transition disabled:opacity-50"
                aria-label="Previous Feature"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={isTransitioning}
                className="absolute right-0 lg:-right-10 top-1/2 z-20 -translate-y-1/2 rounded-full p-2.5 text-gray-500 shadow-md hover:bg-gray-300 transition disabled:opacity-50"
                aria-label="Next Feature"
              >
                <FontAwesomeIcon icon={faChevronRight} className="h-5 w-5" />
              </button>

              <div className="overflow-hidden">
                <div
                  ref={carouselRef}
                  className="flex"
                  style={{
                    width: `${slides.length * 100}%`,
                    transform: `translateX(-${
                      (100 / slides.length) * currentSlide
                    }%)`,
                    transition: isTransitioning
                      ? "transform 0.5s ease-in-out"
                      : "none",
                  }}
                  onTransitionEnd={handleTransitionEnd}
                >
                  {slides.map((slideFeatures, slideIndex) => (
                    <div
                      key={slideIndex}
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-x-8 gap-y-10 lg:gap-y-16 px-4 md:px-6 lg:px-8 shrink-0"
                      style={{ width: `${100 / slides.length}%` }}
                      aria-hidden={slideIndex !== currentSlide}
                    >
                      {slideFeatures.map((feature, index) => (
                        <motion.div key={index} className="relative pl-16">
                          <dt className="text-base font-semibold leading-7 text-gray-900">
                            <motion.div
                              whileHover={featureIconHover}
                              className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-lg bg-green-200"
                            >
                              <FontAwesomeIcon
                                icon={feature.icon}
                                className="h-5 w-5 text-white"
                                aria-hidden="true"
                              />
                            </motion.div>
                            {feature.title}
                          </dt>
                          <dd className="mt-2 text-base leading-7 text-gray-600">
                            {feature.description}
                          </dd>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-7xl sm:px-6 lg:px-8 mb-24 sm:mb-32">
          <motion.div
            variants={scrollFadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={scrollFadeInUp.viewport}
            className="relative overflow-hidden bg-gray-900 px-6 py-20 shadow-xl sm:rounded-3xl sm:px-10 sm:py-24 md:px-12 lg:px-20"
          >
            <div className="absolute inset-0 bg-gray-900/80 mix-blend-multiply"></div>
            <motion.div
              initial={{ opacity: 0, scale: 1.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              viewport={{ once: true }}
              className="absolute -top-80 left-1/2 -z-10 h-[80rem] w-[80rem] -translate-x-1/2 transform-gpu blur-3xl"
              aria-hidden="true"
            >
              <div
                className="aspect-[1097/845] w-full bg-gradient-to-r from-[#34d399] to-[#057a55] opacity-25"
                style={{
                  clipPath:
                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                }}
              />
            </motion.div>

            <div className="relative mx-auto max-w-2xl lg:mx-0">
              <div className="h-12 w-auto text-white font-bold text-2xl">
                Graminate
              </div>
              <figure>
                <blockquote className="mt-6 text-lg font-semibold leading-8 text-white sm:text-xl sm:leading-9">
                  <p>“{content["Testimonial Quote"]}”</p>
                </blockquote>
                <figcaption className="mt-8 text-base text-white">
                  <div className="font-semibold">
                    {content["Testimonial Author"]}
                  </div>
                  <div className="mt-1">{content["Testimonial Role"]}</div>
                </figcaption>
              </figure>
            </div>
          </motion.div>
        </div>

        <div className="py-24 sm:py-32 relative isolate overflow-hidden bg-gray-50">
          <div className="absolute inset-x-0 top-0 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="aspect-[1508/632] w-[94.25rem] flex-none bg-gradient-to-r from-[#a0f2d1] to-[#34d399] opacity-20"
              style={{
                clipPath:
                  "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64.3%, 55.3% 47.5%, 46.5% 49.6%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
              }}
            />
          </div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              variants={scrollFadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={scrollFadeInUp.viewport}
              className="mx-auto max-w-4xl text-center"
            >
              <h2 className="text-base font-semibold leading-7 text-emerald-600">
                Pricing
              </h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                {content["Price Header"]}
              </p>
            </motion.div>
            <motion.p
              variants={scrollFadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={scrollFadeInUp.viewport}
              className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600"
            >
              {content["Price Subheader"]}
            </motion.p>

            <motion.div
              variants={scrollFadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={scrollFadeInUp.viewport}
              className="mt-16 flex justify-center"
            >
              <fieldset
                aria-label="Payment frequency"
                className="flex rounded-full p-1 bg-gray-400"
              >
                {pricing.frequencies.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                      frequency.value === option.value
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:bg-white/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={frequency.value === option.value}
                      onChange={() => setFrequency(option)}
                      className="sr-only"
                    />
                    {content[option.labelKey]}
                  </label>
                ))}
              </fieldset>
            </motion.div>

            <motion.div
              variants={scrollStaggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={scrollStaggerContainer.viewport}
              className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3"
            >
              {pricing.tiers.map((tier) => (
                <motion.div key={tier.id} variants={scrollStaggerItem}>
                  <PriceCard
                    label={content[tier.nameKey as keyof typeof content]}
                    description={
                      content[tier.descriptionKey as keyof typeof content]
                    }
                    price={tier.price[frequency.value]}
                    priceSuffix={frequency.priceSuffix}
                    points={tier.featuresKeys.map(
                      (key) => content[key as keyof typeof content]
                    )}
                    href={tier.href}
                    popular={tier.mostPopular}
                    isSelected={selectedTier.id === tier.id}
                    onClick={() => setSelectedTier(tier)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              variants={scrollFadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={scrollFadeInUp.viewport}
              className="mx-auto max-w-4xl divide-y divide-gray-900/10"
            >
              <h2 className="text-3xl font-bold leading-10 tracking-tight text-gray-900 text-center mb-10 sm:text-4xl">
                {content["FAQ Title"]}
              </h2>
              <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    variants={scrollStaggerItem}
                    initial="initial"
                    whileInView="whileInView"
                    viewport={scrollStaggerItem.viewport}
                    className="pt-6 first:pt-0"
                  >
                    <dt>
                      <button
                        type="button"
                        className="flex w-full items-start justify-between text-left text-gray-900 focus:outline-none group"
                        aria-controls={`faq-panel-${index}`}
                        aria-expanded={faqOpen.has(index)}
                        onClick={() => toggleFAQ(index)}
                      >
                        <span className="text-base font-semibold leading-7 group-hover:text-emerald-600 transition-colors">
                          {content[faq.questionKey as keyof typeof content]}
                        </span>
                        <span className="ml-6 flex h-7 items-center text-gray-400 group-hover:text-emerald-600 transition-colors">
                          <motion.div
                            animate={{ rotate: faqOpen.has(index) ? 45 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FontAwesomeIcon
                              icon={faPlus}
                              className={`h-5 w-5 ${
                                faqOpen.has(index) ? "text-emerald-600" : ""
                              }`}
                            />
                          </motion.div>
                        </span>
                      </button>
                    </dt>
                    <AnimatePresence initial={false}>
                      {faqOpen.has(index) && (
                        <motion.dd
                          id={`faq-panel-${index}`}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={faqContent}
                          className="overflow-hidden"
                        >
                          <p className="text-base leading-7 text-gray-600">
                            {content[faq.answerKey]}
                          </p>
                        </motion.dd>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </dl>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
