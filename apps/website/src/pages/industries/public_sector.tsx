import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import CoverSection from "@/components/sections/ServiceCover";
import ContentSection from "@/components/sections/ServiceContent";

export default function PublicSector() {
  const coverImage = "/industries/ps_public-sector.png";

  return (
    <>
      <Head>
        <title>Industries | Public Sector</title>
      </Head>

      <DefaultLayout>
        <CoverSection
          backgroundImage={coverImage}
          title="IT for Public Sector"
          subtitle="We deliver secure, scalable digital solutions for the public sector — including e-Governance apps, mobility platforms, and infrastructure management tools — to enhance service delivery and operational efficiency."
        />

        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-16">
            {/* E-Governance */}
            <div id="e-governance">
              <ContentSection
                imageSrc="/industries/ps_e-governance.png"
                alt="e-Governance"
                title="E-Governance"
                paragraphs={[
                  "We develop secure and citizen-centric e-Governance applications that digitize public services and improve accessibility. Our solutions help governments streamline operations and deliver faster, transparent services.",
                  "Our platforms are built with scalability and compliance in mind, making them suitable for both local and national administrations.",
                ]}
                listItems={[
                  "Integrated and easy-to-use CRM and ERP features",
                  "Secure user management and role-based access control",
                  "Protected API endpoints that guarantees safety of your data",
                  "Custom reporting and analytics modules",
                  "24 x 7 System Support",
                ]}
                reverse={true}
              />
            </div>

            {/* Mobility */}
            <div id="mobility">
              <ContentSection
                imageSrc="/industries/ps_mobility.png"
                alt="Mobility Platforms"
                title="Mobility Platforms"
                paragraphs={[
                  "If you or your business require mobile applications compatible with iOS and Android, look no further. Our developers are here to analyze your requirements and develop intuitive and high-performance cross-platform mobile apps that shall play an integral part in your business revenue.",
                  "Irrespective of your domain, our experts ensure that your customers always have the best possible user experiences and that all your requirements are fulfilled without setbacks.",
                ]}
                listItems={[
                  "Cross-platform apps with native performance",
                  "UI/UX that drives user engagement",
                  "Integrated push notification service",
                  "We deploy your application in App Store & Play Store",
                  "24 x 7 for your app after production",
                ]}
                titleClass="text-3xl font-bold text-gray-800 mb-4"
                paragraphClass="text-lg"
                listClass="list-disc list-inside mt-4 text-gray-600 space-y-2"
              />
            </div>

            {/* Urban */}
            <div id="urban">
              <ContentSection
                imageSrc="/industries/ps_urban.png"
                alt="Urban Development"
                title="Infrastructure & Urban Development"
                paragraphs={[
                  "We create digital tools to manage urban infrastructure projects, monitor assets, and support data-driven city planning. Our platforms help public agencies track progress, ensure transparency, and improve infrastructure maintenance.",
                  "Built for collaboration across departments, our solutions are tailored to drive smarter, more sustainable urban growth.",
                ]}
                listItems={[
                  "Project tracking and milestone management",
                  "GIS and map-based infrastructure planning",
                  "Budget and resource allocation tools",
                  "Maintenance scheduling and asset tracking",
                  "Citizen feedback and reporting integration",
                ]}
                reverse={true}
                titleClass="text-3xl font-bold text-gray-800 mb-4"
                paragraphClass="text-lg"
                listClass="list-disc list-inside mt-4 text-gray-600 space-y-2"
              />
            </div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}
