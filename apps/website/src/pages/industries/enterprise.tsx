import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import CoverSection from "@/components/sections/ServiceCover";
import ContentSection from "@/components/sections/ServiceContent";

export default function Enterprise() {
  const coverImage = "/industries/en-enterprise.png";

  return (
    <>
      <Head>
        <title>Industries | Enterprise</title>
      </Head>

      <DefaultLayout>
        <CoverSection
          backgroundImage={coverImage}
          title="Enterprises"
          subtitle="At Graminate, our team of experienced software developers turn your ideas and requirements into high-quality, secured software applications explicitly tailored to digitalize your business and contribute to your long-term profits"
        />

        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-16">
            <div id="erp">
              <ContentSection
                imageSrc="/industries/en-erp.png"
                alt="Enterprise Resource Planning (ERP)"
                title="Enterprise Resource Planning (ERP)"
                paragraphs={[
                  "Our team of designers and developers develop your web applications using the most modern frameworks with a mobile-first approach. Our web applications are responsive by default, SEO-optimized, and load at lightning speed.",
                  "We develop web applications across domains like HealthCare, FinTech, EdTech, and lots more.",
                ]}
                listItems={[
                  "Responsive mobile-first, tested and secured web applications and websites.",
                  "Dynamic web apps with modern design, customized for your business needs.",
                  "Personalized or event-based websites for you or your business.",
                  "Integrated custom admin dashboards for more control.",
                  "24 x 7 Support for all the systems developed by us.",
                ]}
              />
            </div>

            <div id="crm">
              <ContentSection
                imageSrc="/industries/en-crm.png"
                alt="Customer Relationship Management (CRM)"
                title="Customer Relationship Management (CRM)"
                paragraphs={[
                  "Own a business? Our team builds robust state-of-the-art enterprise applications that integrate seamlessly with your business proceedings and existing systems. We focus on scalability, security, and efficiency, ensuring your business stays ahead.",
                  "Our enterprise software solutions are tailored to your business needs, easy to use by any of your employees, and highly customizable based on your business.",
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

            <div id="e-commerce">
              <ContentSection
                imageSrc="/industries/en-e-commerce.png"
                alt="E-Commerce Platforms"
                title="E-Commerce Platforms"
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

            <div id="saas">
              <ContentSection
                imageSrc="/industries/en-saas.png"
                alt="Other Vertical SaaS"
                title="Other Vertical SaaS"
                paragraphs={[
                  "Our team of developers are experts in developing scalable, secured and performance-optimized cloud-based collaborative tools and cloud applications for your business. Inculcate your ideas and vision and turn them into real features that are critical for your business growth and revenue.",
                  "From cloud-based collaborative tools, communication tools to data streaming platforms, our team is dedicated to ensuring your ideas succeed.",
                ]}
                listItems={[
                  "Cloud-native architecture with AWS and GCP",
                  "Scalable microservices and containerization",
                  "CI/CD pipelines for faster delivery",
                  "Built-in monitoring and logging solutions",
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
