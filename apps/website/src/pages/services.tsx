import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

type Service = {
  id: number;
  title: string;
  description: string;
  link: string;
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const scrollFadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
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

const cardHover = {
  y: -8,
  scale: 1.03,
  boxShadow:
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  transition: { type: "spring", stiffness: 300, damping: 15 },
};

export default function Services() {
  const services: Service[] = [
    {
      id: 1,
      title: "Software Development",
      description:
        "Turn your ideas into high-quality, secured cross-platform software applications explicitly tailored to digitalize your business and contribute to your long-term profits.",
      link: "/services/software_development",
    },
    {
      id: 2,
      title: "Product Design",
      description:
        "Experience the full potential of your ideas with our product designing team. Our team specializes in turning concepts into functional, user-centric digital products that are intuitive and scalable.",
      link: "/services/product_design",
    },
    {
      id: 3,
      title: "IT Operations",
      description:
        "From integrating and managing critical business IT infrastructure, monitoring system performances, and migrating your business to the cloud and more, we ensure that your IT systems never fail.",
      link: "/services/it_operations",
    },
    {
      id: 4,
      title: "Technology Enablement",
      description:
        "Wondering how to organize and get started with your IT project or lay the foundations of your business’s digital systems? Our experts in project management and IT strategies have covered you.",
      link: "/services/tech_consulting", // Renamed from tech_enablement based on original href
    },
  ];

  return (
    <>
      <Head>
        <title>Graminate | Our Services</title>
        <meta
          name="description"
          content="Explore our IT solutions including Software Development, Product Design, IT Operations, and Technology Enablement."
        />
      </Head>

      <DefaultLayout>
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-emerald-50 to-white isolate overflow-hidden">
          <div className="mx-auto max-w-5xl py-24 sm:py-32 lg:py-36 px-6 lg:px-8 text-center">
            <motion.div initial="initial" animate="animate" variants={fadeInUp}>
              <h1 className="text-4xl font-bold tracking-tight text-gray-800 sm:text-5xl md:text-6xl">
                Affordable & Quality{" "}
                <span className="text-emerald-600">IT Solutions</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
                Our teams provide end-to-end IT solutions in Software
                Development, Product Design, IT Operations and Technology
                Enablement at a price tailored to your business.
              </p>
            </motion.div>
          </div>
          {/* Animated Background Shape */}
          <div
            className="absolute inset-x-0 top-[calc(100%-20rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-40rem)]"
            aria-hidden="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 10 }} // Slightly different initial rotation
              animate={{ opacity: 0.2, scale: 1, rotate: -30 }} // Different end rotation
              transition={{
                duration: 4, // Slower duration
                ease: "linear",
                delay: 0.1,
                repeat: Infinity,
                repeatType: "mirror", // Use mirror instead of reverse
              }}
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#34d399] to-[#a0f2d1] sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" // Adjusted position and gradient
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </div>

        {/* Services Grid Section */}
        <div className="bg-white py-20 sm:py-12 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={scrollFadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={scrollFadeInUp.viewport}
              className="text-center mb-16 lg:mb-20"
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our Core Services
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Driving innovation and efficiency for your business.
              </p>
            </motion.div>

            <motion.div
              variants={scrollStaggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={scrollStaggerContainer.viewport}
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2"
            >
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  variants={scrollStaggerItem}
                  whileHover={cardHover}
                  className="flex flex-col p-8 rounded-2xl bg-gray-50 cursor-pointer h-full overflow-hidden"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed flex-grow">
                    {service.description}
                  </p>
                  <div className="mt-6">
                    <Link href={service.link} legacyBehavior>
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-800 transition-colors group" // Matched industry link style
                      >
                        Learn More
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="ml-2 h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </motion.a>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={scrollFadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={scrollFadeInUp.viewport}
              className="mt-24 text-center bg-green-50 p-12 rounded-2xl"
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Ready to Accelerate Your Growth?
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
                Let&apos;s build your competitive advantage together. Schedule a
                free consultation to discuss your project.
              </p>
              <div className="mt-8">
                <Link
                  href="/company/contact_us"
                  className="inline-flex items-center px-6 py-2 border border-transparent text-lg font-medium rounded-md text-white bg-green-200 hover:bg-green-100 transition-colors"
                >
                  Schedule Free Consultation
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}
