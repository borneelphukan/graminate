import ContentSection from "@/components/sections/ServiceContent";
import CoverSection from "@/components/sections/ServiceCover";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";

export default function TechConsulting() {
  const coverImage = "/services/tc_consulting.png";

  return (
    <>
      <Head>
        <title>Graminate | IT Operations</title>
      </Head>

      <DefaultLayout>
        <CoverSection
          backgroundImage={coverImage}
          title="Technology Enablement"
          subtitle="We help businesses evolve and innovate through our range of enablement services. We ensure your technology landscape supports long-term growth, agility, and performance."
        />

        {/* Content Section */}
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-16">
            {/* Project Management Section */}
            <div id="project_management">
              <ContentSection
                imageSrc="/services/tc_pm.png"
                alt="Project Management"
                title="Project Management"
                paragraphs={[
                  "We provide end-to-end project management to ensure your technology initiatives are delivered on time, within scope, and aligned with business goals. Our approach emphasizes clarity, collaboration, and measurable outcomes.",
                ]}
                listItems={[
                  "Agile and traditional project management frameworks",
                  "Clear planning, milestones, and progress tracking",
                  "Risk management and issue resolution strategies",
                  "Transparent communication and stakeholder alignment",
                  "On-time delivery with continuous feedback loops",
                ]}
                reverse={true}
              />
            </div>
            {/* Technical Debt Remediation Section */}
            <div id="technical_debt">
              <ContentSection
                imageSrc="/services/tc_strategy.png"
                alt="Technical Debt Remediation"
                title="Technical Debt Remediation"
                paragraphs={[
                  "We help identify and resolve technical debt that slows down development and affects system stability. By addressing outdated code, architecture bottlenecks, and inefficient processes, we enable faster and more sustainable growth.",
                ]}
                listItems={[
                  "Codebase analysis and refactoring strategy",
                  "Removal of legacy dependencies and unused components",
                  "Improved maintainability and code performance",
                  "Best practices implementation for long-term quality",
                  "Reduced operational risk and faster feature delivery",
                ]}
              />
            </div>

            {/* Application Modernization Section */}
            <div id="application_modernization">
              <ContentSection
                imageSrc="/services/tc_modernization.png"
                alt="Application Modernization"
                title="Application Modernization"
                paragraphs={[
                  "Our team of designers and developers develop your web applications using the most modern frameworks with a mobile-first approach. Our web applications are responsive by default, SEO-optimized, and load at lightning speed.",
                ]}
                listItems={[
                  "Migration from legacy systems to modern architectures",
                  "Cloud-native and container-based modernization",
                  "Enhanced UI/UX and responsive design upgrades",
                  "Integration with modern APIs and third-party services",
                  "Improved performance, security, and maintainability",
                ]}
                reverse={true}
              />
            </div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}
