import ContentSection from "@/components/sections/ServiceContent";
import CoverSection from "@/components/sections/ServiceCover";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";

export default function ITOperations() {
  const coverImage = "/services/it_operations.png";

  return (
    <>
      <Head>
        <title>Graminate | IT Operations</title>
      </Head>

      <DefaultLayout>
        <CoverSection
          backgroundImage={coverImage}
          title="IT Operations"
          subtitle="We provide seamless IT Operations with smart Integration & Automation, real-time Monitoring & Logging, and reliable Cloud & Infrastructure management to keep your systems efficient and resilient."
        />

        {/* Content Section */}
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-16">
            {/* Integration & Automations Section */}
            <div id="integration_automation">
              <ContentSection
                imageSrc="/services/it_integration_automation.png"
                alt="Integration & Automation"
                title="Integration & Automation"
                paragraphs={[
                  "We help businesses connect their tools, platforms, and processes to create seamless workflows and reduce manual tasks. By automating repetitive operations and integrating systems efficiently, we enhance productivity, reduce errors, and accelerate business outcomes.",
                ]}
                listItems={[
                  "Connect disparate systems for unified data flow and communication.",
                  "Automate repetitive tasks to save time and reduce human errors.",
                  "Streamline business processes for improved efficiency.",
                  "Enable real-time data sync across platforms and applications.",
                  "Improve scalability and agility through smart automation strategies.",
                ]}
              />
            </div>

            {/* Monitoring & Logging Section */}
            <div id="monitoring_logging">
              <ContentSection
                imageSrc="/services/it_monitoring_logging.png"
                alt="Monitoring & Logging"
                title="Monitoring & Logging"
                paragraphs={[
                  "All our softwares are integrated with Monitoring & Logging services, which ensures your systems are always under watch, helping you detect issues early and maintain business continuity. By capturing and analyzing key performance metrics and logs, we provide actionable insights that drive stability, security, and smarter decision-making.",
                ]}
                listItems={[
                  "Proactive system monitoring to minimize downtime and disruptions.",
                  "Centralized log management for faster issue diagnosis.",
                  "Real-time alerts for critical events and anomalies.",
                  "Enhanced visibility into system performance and user activity.",
                  "Support for compliance, auditing, and operational transparency.",
                ]}
                reverse={true}
              />
            </div>

            {/* Cloud & Infrastructure Management Section */}
            <div id="cloud">
              <ContentSection
                imageSrc="/services/it_cloud.png"
                alt="Cloud Infrastructure Management"
                title="Cloud Infrastructure Management"
                paragraphs={[
                  "Our applications are built on the cloud. We manage and optimize your cloud and on-premise infrastructure to ensure scalability, security, and performance. Our team helps you leverage the full potential of modern infrastructure, so you can focus on innovation while we handle reliability, cost-efficiency, and system health.",
                ]}
                listItems={[
                  "Scalable infrastructure setup and maintenance across cloud and hybrid environments",
                  "Cost optimization and resource management for maximum ROI",
                  "Robust security measures and regular updates to protect your assets",
                  "High availability and performance tuning for critical systems",
                  "Seamless migration, deployment, and ongoing infrastructure support",
                ]}
              />
            </div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}
