import Head from "next/head";
import Image from "next/image";
import { motion } from "framer-motion";
import MembersCard from "@/components/cards/company/MembersCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const teamMembers = [
  {
    avatar: "/images/people/borneel.png",
    name: "Borneel B. Phukan",
    role: "CEO / CTO",
    description:
      "Leading strategic and technical innovation of Graminate, ensuring the delivery of impactful, client-focused software solutions.",
  },
  // {
  //   avatar: "/images/people/lisa.png",
  //   name: "Lisa Klinnert",
  //   role: "Secretary",
  //   description:
  //     "Chief of Human Resources with years of expertise in the medical science and medical technology sector, with proved expertise in HR management.",
  // },
];

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const imageAnimation = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export default function AboutUs() {
  return (
    <>
      <Head>
        <title>About Us | Graminate</title>
        <meta
          name="description"
          content="Learn more about the team, mission, and values driving Graminate forward."
        />
      </Head>

      <Navbar contact />
      <main className="isolate bg-white">
        {/* Hero section */}
        <div className="relative isolate -z-10 overflow-hidden bg-gradient-to-b from-green-200 pt-14">
          <div
            className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:-mr-80 lg:-mr-96"
            aria-hidden="true"
          />
          <div className="mx-auto max-w-7xl px-6 py-32 sm:py-40 lg:px-8">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8"
            >
              <motion.h1
                variants={fadeInUp}
                className="max-w-2xl text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:col-span-2 xl:col-auto"
              >
                We are a passionate team building the future of software.
              </motion.h1>
              <motion.div
                variants={fadeInUp}
                className="mt-6 max-w-xl lg:mt-0 xl:col-end-1 xl:row-start-1"
              >
                <p className="text-lg leading-8 text-gray-600">
                  At Graminate, we combine technical expertise with creative
                  thinking to deliver exceptional software solutions, optimize
                  IT operations, and ensure product quality. We partner with our
                  clients to turn their vision into reality.
                </p>
              </motion.div>
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerContainer}
                className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0 xl:mt-10"
              >
                <div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-none xl:pt-80">
                  <motion.div variants={imageAnimation} className="relative">
                    <Image
                      src="/images/about_us/team-collaboration.png"
                      alt="Team working collaboratively"
                      width={176}
                      height={264}
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                  </motion.div>
                </div>
                <div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
                  <motion.div variants={imageAnimation} className="relative">
                    <Image
                      src="/images/about_us/code-closeup.png"
                      alt="Close-up of code on screen"
                      width={176}
                      height={264}
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                  </motion.div>
                  <motion.div variants={imageAnimation} className="relative">
                    <Image
                      src="/images/about_us/office-space.png"
                      alt="Modern office environment"
                      width={176}
                      height={264}
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                  </motion.div>
                </div>
                <div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
                  <motion.div variants={imageAnimation} className="relative">
                    <Image
                      src="/images/about_us/UI-Design.png"
                      alt="UI design sketch"
                      width={176}
                      height={264}
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        <div className="mx-auto -mt-12 max-w-7xl px-6 sm:mt-0 lg:px-8 xl:-mt-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            >
              Our Mission
            </motion.h2>
            <div className="mt-6 flex flex-col gap-x-8 gap-y-20 lg:flex-row">
              <motion.div
                variants={fadeInUp}
                className="lg:w-full lg:max-w-2xl lg:flex-auto"
              >
                <p className="text-xl leading-8 text-gray-600">
                  To empower businesses through innovative technology solutions,
                  delivering exceptional value and fostering long-term
                  partnerships built on trust, quality, and collaboration.
                </p>
                <p className="mt-8 text-base leading-7 text-gray-600">
                  We strive to understand the unique challenges and
                  opportunities of each client, crafting bespoke software,
                  optimizing IT infrastructure, and ensuring robust quality
                  assurance. Our goal is to be the catalyst for the success of
                  our clients in the digital age.
                </p>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="lg:flex lg:flex-auto lg:justify-center"
              >
                <dl className="w-64 space-y-8 xl:w-80">
                  <div className="flex flex-col-reverse gap-y-3 border-l border-gray-900/20 pl-6">
                    <dt className="text-sm leading-6 text-gray-600">
                      Team Members & Interns
                    </dt>
                    <dd className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                      10+
                    </dd>
                  </div>
                  {/* <div className="flex flex-col-reverse gap-y-3 border-l border-gray-900/20 pl-6">
                    <dt className="text-sm leading-6 text-gray-600">
                      Seed Fund Investment
                    </dt>
                    <dd className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                      $300K
                    </dd>
                  </div> */}
                  <div className="flex flex-col-reverse gap-y-3 border-l border-gray-900/20 pl-6">
                    <dt className="text-sm leading-6 text-gray-600">
                      Active Client Partnerships
                    </dt>
                    <dd className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                      2+
                    </dd>
                  </div>
                </dl>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* <div className="mt-32 sm:mt-40 xl:mx-auto xl:max-w-7xl xl:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={imageAnimation}
          >
            <Image
              src="/images/placeholder/team_photo.jpg" // Replace with a relevant, high-quality image
              alt="Graminate team collaborating in the office"
              width={1200} 
              height={480}
              className="aspect-[5/2] w-full object-cover xl:rounded-3xl shadow-lg"
            />
          </motion.div>
        </div> */}

        <div className="mx-auto mt-12 max-w-7xl px-6 sm:mt-40 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="mx-auto max-w-2xl lg:mx-0"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            >
              Our Values
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg leading-8 text-gray-600"
            >
              The core principles that guide our work, interactions, and
              decisions every day.
            </motion.p>
          </motion.div>
          <motion.dl
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.1 }} // Trigger animation earlier for the grid
            variants={staggerContainer}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          >
            {[
              {
                name: "Innovation-Driven Solutions",
                description:
                  "We push the boundaries of technology to deliver cutting-edge software and product design, empowering businesses to thrive.",
              },
              {
                name: "Excellence in IT Operations",
                description:
                  "We optimize IT operations for seamless performance, scalability, and reliability, letting you focus on growth.",
              },
              {
                name: "Quality at Every Stage",
                description:
                  "From rigorous testing to meticulous detail, we ensure every product and service meets the highest standards.",
              },
              {
                name: "Collaborative Partnership",
                description:
                  "We build strong, transparent relationships through open communication and teamwork for effective, sustainable solutions.",
              },
              {
                name: "Continuous Learning",
                description:
                  "The tech world evolves rapidly, and so do we. We embrace learning to bring the latest tools and best practices to every project.",
              },
              {
                name: "Integrity & Respect",
                description:
                  "We operate with honesty and respect for our clients, team members, and the broader community in all interactions.",
              },
            ].map((value) => (
              <motion.div
                key={value.name}
                variants={fadeInUp}
                className="transition-transform duration-300 hover:scale-[1.03] p-6 rounded-lg hover:shadow-md bg-gray-50/50" // Subtle hover effect + background
              >
                <dt className="font-semibold text-gray-900">{value.name}</dt>
                <dd className="mt-1 text-gray-600">{value.description}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>

        {/* Logo cloud */}
        <div className="relative isolate -z-10 mt-32 mb-24 sm:mt-40 sm:mb-32">
          <div className="absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 justify-center overflow-hidden [mask-image:radial-gradient(50%_45%_at_50%_55%,white,transparent)]">
            {/* Optional decorative SVG */}
            <svg
              className="h-[60rem] w-[100rem] flex-none stroke-gray-400"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="e9033f3e-f665-41a6-84ef-756f6778e6fe"
                  width={200}
                  height={200}
                  x="50%"
                  y="50%"
                  patternUnits="userSpaceOnUse"
                  patternTransform="translate(-100 0)"
                >
                  <path d="M.5 200V.5H200" fill="none" />
                </pattern>
              </defs>
              <svg x="50%" y="50%" className="overflow-visible fill-gray-50">
                <path
                  d="M-300 0h201v201h-201Z M300 200h201v201h-201Z"
                  strokeWidth={0}
                />
              </svg>
              <rect
                width="100%"
                height="100%"
                strokeWidth={0}
                fill="url(#e9033f3e-f665-41a6-84ef-756f6778e6fe)"
              />
            </svg>
          </div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeInUp}
              className="text-center"
            >
              <h2 className="text-lg font-semibold leading-8 text-gray-900">
                Trusted by innovative companies
              </h2>
            </motion.div>
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
              className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5"
            >
              <motion.div
                variants={fadeInUp}
                className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
              >
                <Image
                  src="/images/about_us/client_guwahati-jobs.png"
                  alt="Guwahati-Jobs.in"
                  width={158}
                  height={48}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                />
              </motion.div>
              {/* <motion.div
                variants={fadeInUp}
                className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
              >
                <Image
                  src="/images/about_us/client_guwahati-jobs.png"
                  alt="Guwahati-Jobs.in"
                  width={158}
                  height={48}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                />
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
              >
                <Image
                  src="/images/about_us/client_guwahati-jobs.png"
                  alt="Guwahati-Jobs.in"
                  width={158}
                  height={48}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                />
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
              >
                <Image
                  src="/images/about_us/client_guwahati-jobs.png"
                  alt="Guwahati-Jobs.in"
                  width={158}
                  height={48}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                />
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
              >
                <Image
                  src="/images/about_us/client_guwahati-jobs.png"
                  alt="Guwahati-Jobs.in"
                  width={158}
                  height={48}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                />
              </motion.div> */}
            </motion.div>
          </div>
        </div>

        {/* Team section */}
        <div className="bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.5 }}
              variants={staggerContainer}
              className="mx-auto max-w-2xl text-center"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              >
                Meet Our Leadership
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="mt-6 text-lg leading-8 text-gray-600"
              >
                We’re a dynamic group of individuals passionate about technology
                and dedicated to delivering exceptional results for our clients.
              </motion.p>
            </motion.div>
            <motion.ul
              role="list"
              initial="initial"
              whileInView="animate"
              variants={staggerContainer}
              viewport={{ once: true, amount: 0.1 }}
              className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3" // Adjusted grid for better spacing if more members are added
            >
              {teamMembers.map((member) => (
                <motion.li key={member.name} variants={fadeInUp}>
                  <MembersCard
                    avatar={member.avatar}
                    name={member.name}
                    role={member.role}
                    description={member.description}
                  />
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
