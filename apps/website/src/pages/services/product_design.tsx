import ContentSection from "@/components/sections/ServiceContent";
import CoverSection from "@/components/sections/ServiceCover";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import Image from "next/image";

export default function ProductDesign() {
  const coverImage = "/services/pd_design_cover.webp";

  return (
    <>
      <Head>
        <title>Graminate | Design Development</title>
      </Head>
      <DefaultLayout>
        {/* Cover Section */}
        <CoverSection
          backgroundImage={coverImage}
          title="Product Design"
          subtitle="Our team of product designing experts work together tirelessly to turn your business ideas into working prototypes that provide the whole native experience of your digital product when its published."
        />

        {/* Content Section */}
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-16">
            {/* UI/UX Design Section */}
            <div id="uiux_design">
              <ContentSection
                imageSrc="/services/pd_uiux_design.png"
                alt="UI/UX Design"
                title="UI/UX Design"
                paragraphs={[
                  "We craft intuitive and engaging digital experiences that align with your brand and user needs. Our UI/UX design approach focuses on usability, accessibility, and aesthetics to maximize user satisfaction and business impact.",
                ]}
                listItems={[
                  "User-centered design tailored to your target audience",
                  "Intuitive navigation and seamless user journeys",
                  "High-fidelity wireframes and interactive prototypes",
                  "Mobile-first and responsive interface design",
                  "Improved engagement and conversion through optimized UX",
                ]}
              />
            </div>

            {/* Web Design Section */}
            <div id="web_design">
              <ContentSection
                imageSrc="/services/pd_web_design.png"
                alt="Web Design"
                title="Web Design"
                paragraphs={[
                  "We design user-friendly and visually consistent interfaces across websites, web applications, and desktop software. Our focus is on delivering functional, aesthetic, and accessible designs that enhance user interaction and align with your business goals.",
                ]}
                listItems={[
                  "UI design for websites, web apps, and desktop software",
                  "Consistent design systems for cohesive user experiences",
                  "Responsive and adaptive layouts across devices and platforms",
                  "Wireframes and prototypes for fast validation and feedback",
                  "Seamless collaboration with developers for design implementation",
                ]}
                reverse={true}
              />
            </div>

            {/* CAD Section */}
            <div id="cad">
              <section className="animate-fadeIn flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                  <Image
                    src="/services/pd_cad.png"
                    alt="Mobile Applications"
                    className="rounded-xl shadow-lg w-full"
                    height={500}
                    width={500}
                  />
                </div>
                <div className="md:w-1/2">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Computer-Aided Design (CAD)
                  </h2>
                  <p className="text-lg text-gray-600">
                    We offer precise and detailed CAD solutions for businesses
                    in engineering, manufacturing, and architecture. Our CAD
                    services help turn ideas into technical drawings, 3D models,
                    and production-ready designs.
                  </p>
                  <ul className="list-disc list-inside mt-4 text-gray-600 space-y-2">
                    <li>
                      2D and 3D modeling for accurate visual representation
                    </li>
                    <li>
                      Detailed technical drawings for engineering and
                      manufacturing
                    </li>
                    <li>
                      CAD support for prototyping, simulation, and product
                      development
                    </li>
                    <li>Efficient revision workflows and version control</li>
                    <li>
                      Compatibility with major CAD platforms and industry
                      standards
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}
