import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import CoverSection from "@/components/sections/ServiceCover";
import ContentSection from "@/components/sections/ServiceContent";

export default function Finance() {
  const coverImage = "/industries/ft_cover.png";

  return (
    <>
      <Head>
        <title>Industries | Finance</title>
      </Head>

      <DefaultLayout>
        <CoverSection
          backgroundImage={coverImage}
          title="Finance Technology"
          subtitle="We design and develop secure, user-friendly financial software from investment and trading platforms to insurance solutions and personal finance tools. Our softwares are built to ensure compliance, drive user trust, and deliver seamless digital experiences across financial domains"
        />

        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-16">
            <div id="investment_trading">
              <ContentSection
                imageSrc="/industries/ft_trading.png"
                alt="Investment & Trading Platforms"
                title="Investment & Trading Platforms"
                paragraphs={[
                  "We develop fast, secure investment and trading platforms for stocks, crypto, and more, designed for both beginners and pros. Our solutions offer real-time data, smooth UX, and full compliance.",
                  "From portfolio tracking to advanced analytics and API integrations, we ensure your platform is reliable, scalable, and ready for today’s financial markets.",
                ]}
                listItems={[
                  "Real-time market data and trading execution",
                  "Secure user authentication and KYC integration",
                  "Portfolio tracking and performance analytics",
                  "Custom dashboards with interactive charts and reports",
                  "Integration with brokers, exchanges, and financial APIs",
                ]}
              />
            </div>

            <div id="insurance">
              <ContentSection
                imageSrc="/industries/ft_insurance.png"
                alt="Insurance Platforms"
                title="Insurance Platforms"
                paragraphs={[
                  "We build secure, user-friendly insurance platforms that simplify policy management, claims processing, and customer onboarding. Designed for both providers and users, our solutions improve efficiency and trust.",
                  "With automation, real-time data access, and seamless integrations, we help insurers deliver faster services and better customer experiences.",
                ]}
                listItems={[
                  "Policy creation, management, and renewal automation",
                  "Streamlined claims processing with status tracking",
                  "Secure user onboarding and document verification",
                  "Integration with payment gateways and third-party APIs",
                ]}
                reverse={true}
              />
            </div>

            <div id="personal_finance">
              <ContentSection
                imageSrc="/industries/ft_personal.png"
                alt="Personal Finance & Budgeting"
                title="Personal Finance & Budgeting"
                paragraphs={[
                  "We create smart personal finance and budgeting apps that help users manage income, track expenses, and build financial habits. Our solutions are intuitive, secure, and designed to promote financial wellness for individuals and families.",
                  "With real-time syncing, goal tracking, and insightful analytics, we make it easier for users to stay on top of their finances and make informed decisions.",
                ]}
                listItems={[
                  "Expense tracking and budget planning",
                  "Real-time bank and account syncing",
                  "Goal-based savings and spending insights",
                  "Alerts, reminders, and monthly summaries",
                ]}
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
