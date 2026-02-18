import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import CoverSection from "@/components/sections/ServiceCover";
import ContentSection from "@/components/sections/ServiceContent";

export default function HealthCare() {
  const coverImage = "/industries/he_healthcare.png";

  return (
    <>
      <Head>
        <title>Industries | Healthcare</title>
      </Head>

      <DefaultLayout>
        <CoverSection
          backgroundImage={coverImage}
          title="Health Care"
          subtitle="At Graminate, we develop secure, high-performance software for the healthcare industry including fitness and nutrition apps, clinical and hospital management systems, pharma platforms, and custom tools for doctors. Tailored for better care, efficiency, and compliance."
        />

        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-16">
            <div id="fitness_nutrition">
              <ContentSection
                imageSrc="/industries/he_fitness.png"
                alt="Fitness & Nutrition"
                title="Fitness & Nutrition"
                paragraphs={[
                  "We build engaging fitness and nutrition apps with workout plans, meal tracking, and habit-building features, all designed for long-term user engagement.",
                  "Our scalable apps support real-time tracking and wearable integrations, tailored exactly to your requirements.",
                ]}
                listItems={[
                  "Custom workout and meal planning modules",
                  "Calorie and macro tracking with food database integration",
                  "Wearable device and health data synchronization",
                  "User progress tracking and goal setting",
                  "Push notifications for reminders and motivation",
                ]}
                reverse={true}
              />
            </div>

            <div id="clinical-systems">
              <ContentSection
                imageSrc="/industries/he_hospital.png"
                alt="Clinical, Pharma & Hospital Management Platforms"
                title="Clinical, Pharma & Hospital Management Platforms"
                paragraphs={[
                  "We build secure, high-performance platforms for clinics, hospitals, and pharma from patient records to inventory and compliance.",
                  "Our solutions streamline operations, improve care, and integrate with existing systems.",
                ]}
                listItems={[
                  "Electronic Health Records (EHR) and patient management systems",
                  "Appointment scheduling and doctor-patient communication tools",
                  "Inventory and supply chain management for pharma operations",
                  "Role-based access and data security compliant with healthcare standards",
                  "Custom reporting, billing, and analytics for better decision-making",
                ]}
                titleClass="text-3xl font-bold text-gray-800 mb-4"
                paragraphClass="text-lg"
                listClass="list-disc list-inside mt-4 text-gray-600 space-y-2"
              />
            </div>

            <div id="doctor_softwares">
              <ContentSection
                imageSrc="/industries/he_doctor.png"
                alt="Softwares for Doctors"
                title="Softwares for Doctors"
                paragraphs={[
                  "We create personalized, easy-to-use software for doctors, dentists, therapists and more, to manage appointments, patient records, prescriptions, and communication all in one place.",
                  "Our tools help doctors save time, stay organized, and focus more on patient care",
                ]}
                listItems={[
                  "Digital patient records with quick access and updates",
                  "Appointment scheduling and calendar integration",
                  "E-prescription generation and management",
                  "Secure messaging and patient communication tools",
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
