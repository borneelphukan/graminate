import React from "react";
import Head from "next/head";
import FeatureCard from "@/components/cards/company/FeatureCard";
import JobCard from "@/components/cards/company/JobCard";
import { reasonsForJoining, companyFeatures } from "@/lib/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

import { Jobs } from "@/lib/types";
import DefaultLayout from "@/layout/DefaultLayout";

const jobs: Jobs[] = [
  // {
  //   position: "Frontend Developer",
  //   type: "Full-time",
  //   mode: "Remote",
  //   description:
  //     "Join our frontend team to build responsive user interfaces using React, TailwindCSS, and TypeScript.",
  //   tasks: [
  //     "Develop new UI features and components",
  //     "Collaborate with designers and backend developers",
  //     "Write clean, testable code",
  //   ],
  //   requirements: [
  //     "2+ years experience with React and TypeScript",
  //     "Familiarity with REST APIs",
  //     "Good understanding of responsive design",
  //   ],
  //   benefits: [
  //     "Fully remote team",
  //     "Flexible working hours",
  //     "Annual learning budget",
  //   ],
  //   jobpost: "https://www.linkedin.com/jobs/view/frontend-developer-123456",
  // },
];

// Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Careers = () => {
  return (
    <>
      <Head>
        <title>Graminate | Careers</title>
        <meta
          name="description"
          content="Join the Graminate team. Explore open positions and learn why Graminate is a great place to work."
        />
      </Head>

      <DefaultLayout>
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-emerald-50 to-white isolate overflow-hidden">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="mx-auto max-w-4xl py-24 sm:py-32 lg:py-36 px-6 lg:px-8 text-center"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-4xl font-bold tracking-tight text-gray-800 sm:text-6xl"
            >
              Build the Future with Us
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              transition={{ delay: 0.2, ...fadeInUp.transition }}
              className="mt-6 text-lg leading-8 text-gray-600"
            >
              We are constantly looking for passionate individuals to join our
              innovative team. Discover your next opportunity at Graminate.
            </motion.p>
          </motion.div>
          <div
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#a0f2d1] to-[#34d399] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </div>

        {/* Reasons for Joining Section */}
        <div className="py-20 sm:py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
              className="mx-auto max-w-3xl lg:text-center"
            >
              <h2 className="text-base font-semibold leading-7 text-emerald-600">
                Why Graminate?
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Experience Growth, Innovation, and Collaboration
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                We believe in fostering a supportive environment where talent
                thrives. Here&apos;s what makes Graminate a special place to
                work.
              </p>
            </motion.div>
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.1 }} // Adjust amount as needed
              variants={staggerContainer}
              className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
            >
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {companyFeatures.map((feature, index) => (
                  <motion.div key={index} variants={staggerItem}>
                    <FeatureCard feature={feature} />
                  </motion.div>
                ))}
              </dl>
            </motion.div>
          </div>
        </div>

        {/* Perks & Benefits Section */}
        <div className="bg-gray-50 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-none lg:mx-0 lg:flex lg:items-center lg:gap-x-16">
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
                className="lg:w-1/2 lg:flex-auto"
              >
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Work Perks & Benefits
                </h2>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  We invest in our team&apos;s well-being and professional
                  development with a comprehensive benefits package.
                </p>
                <motion.ul
                  role="list"
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={staggerContainer}
                  className="mt-10 grid grid-cols-1 gap-x-8 gap-y-3 text-base leading-7 text-gray-700 sm:grid-cols-2"
                >
                  {reasonsForJoining.map((item, index) => (
                    <motion.li
                      key={index}
                      variants={staggerItem}
                      className="flex gap-x-3 items-center"
                    >
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        className="h-5 w-5 flex-none text-emerald-500"
                        aria-hidden="true"
                      />
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
              {/* Optional: Add an image or illustration here */}
              {/* <motion.div
                     initial={{ opacity: 0, scale: 0.9 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.5, delay: 0.2 }}
                     className="mt-16 sm:mt-24 lg:mt-0 lg:w-1/2 lg:flex-shrink-0">
                    <img src="/path/to/your/image.jpg" alt="Team collaboration" className="rounded-xl shadow-lg"/>
                 </motion.div> */}
            </div>
          </div>
        </div>

        {/* Available Positions Section */}
        <div className="py-20 sm:py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              className="mx-auto max-w-3xl lg:text-center"
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Open Positions
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Find your place at Graminate. Explore our current openings
                below.
              </p>
            </motion.div>
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.1 }} // Trigger when 10% is visible
              variants={staggerContainer}
              className="mx-auto mt-16 max-w-4xl"
            >
              {jobs.length > 0 ? (
                <div className="space-y-8">
                  {jobs.map((job, index) => (
                    <motion.div key={index} variants={staggerItem}>
                      <JobCard {...job} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mt-10 text-center"
                >
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    No open positions
                  </h3>

                  <div className="mt-6">
                    {/* Optional: Add a link to a general application or contact page */}
                    {/* <button type="button" className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
                        Contact Us
                        </button> */}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
};

export default Careers;
