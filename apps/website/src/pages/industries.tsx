import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

type Industry = {
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

export default function Industries() {
  const industries: Industry[] = [
    {
      id: 1,
      title: "Enterprise Solutions",
      description:
        "Scalable, secure, and high-performance software tailored for businesses, including ERP, CRM, web, mobile, SaaS, and cloud applications.",
      link: "/industries/enterprise",
    },
    {
      id: 2,
      title: "Healthcare Tech",
      description:
        "Developing innovative digital health solutions, EHR integrations, telehealth platforms, and patient management systems compliant with industry standards.",
      link: "/industries/healthcare",
    },
    {
      id: 3,
      title: "FinTech & Finance",
      description:
        "Building secure financial applications, trading platforms, payment gateways, and compliance software for the modern financial landscape.",
      link: "/industries/finance",
    },
    {
      id: 4,
      title: "EdTech & Education",
      description:
        "Creating engaging e-learning platforms, student information systems, and digital tools to enhance learning experiences and administrative efficiency.",
      link: "/industries/education",
    },
    {
      id: 5,
      title: "Public Sector Services",
      description:
        "Delivering robust and accessible digital services, data management systems, and citizen engagement platforms for government and public organizations.",
      link: "/industries/public_sector",
    },
  ];

  return (
    <>
      <Head>
        <title>Graminate | Industries Served</title>
        <meta
          name="description"
          content="Graminate delivers tailored software solutions across various industries including Enterprise, Healthcare, Finance, Education, and the Public Sector."
        />
      </Head>

      <DefaultLayout>
        <div className="relative bg-gradient-to-b from-green-50 to-white isolate overflow-hidden">
          <div className="mx-auto max-w-5xl py-24 sm:py-32 lg:py-36 px-6 lg:px-8 text-center">
            <motion.div initial="initial" animate="animate" variants={fadeInUp}>
              <h1 className="text-4xl font-bold tracking-tight text-gray-800 sm:text-5xl md:text-6xl">
                Software Tailored for Your{" "}
                <span className="text-green-200">Industry</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
                Our expertise spans diverse sectors, transforming complex
                business needs into streamlined, scalable, and future-ready
                digital solutions. We partner with you from concept to
                deployment and beyond.
              </p>
            </motion.div>
          </div>

          <div
            className="absolute inset-x-0 top-[calc(100%-20rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-40rem)]"
            aria-hidden="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 0.2, scale: 1, rotate: 30 }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                delay: 0.3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#a0f2d1] to-[#34d399] sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </div>

        <div className="bg-white py-20 sm:py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={scrollFadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={scrollFadeInUp.viewport}
              className="text-center mb-16 lg:mb-20"
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Explore Our Industry Expertise
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Find out how we help businesses like yours thrive.
              </p>
            </motion.div>

            <motion.div
              variants={scrollStaggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={scrollStaggerContainer.viewport}
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2"
            >
              {industries.map((industry) => (
                <motion.div
                  key={industry.id}
                  variants={scrollStaggerItem}
                  whileHover={cardHover}
                  className="flex flex-col p-8 rounded-2xl bg-gray-50  cursor-pointer h-full overflow-hidden"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {industry.title}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed flex-grow">
                    {industry.description}
                  </p>
                  <div className="mt-6">
                    <Link href={industry.link} legacyBehavior>
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center text-green-200 font-semibold hover:text-green-100 transition-colors group"
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
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}
