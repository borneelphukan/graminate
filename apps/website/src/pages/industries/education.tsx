import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import CoverSection from "@/components/sections/ServiceCover";
import ContentSection from "@/components/sections/ServiceContent";

export default function Education() {
  const coverImage = "/industries/ed-education.png";

  return (
    <>
      <Head>
        <title>Industries | Education</title>
      </Head>

      <DefaultLayout>
        <CoverSection
          backgroundImage={coverImage}
          title="Education"
          subtitle="We design and develop innovative EdTech solutions that empower institutions, educators, and learners. From institutional management systems to interactive learning platforms and exam preparation tools. Our custom software supports better learning outcomes, operational efficiency, and digital transformation in education."
        />

        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-16">
            <div id="institution-management">
              <ContentSection
                imageSrc="/industries/ed-institution.png"
                alt="Institutional Management System"
                title="Institutional Management System"
                paragraphs={[
                  "We build comprehensive Institutional Management Systems that streamline academic and administrative operations for schools, colleges, and training centers. Our solutions are designed to reduce manual effort and improve transparency across departments.",
                  "From student enrollment to attendance, fee tracking, and staff coordination — everything is centralized in one secure, easy-to-use platform tailored to your institution’s needs.",
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

            <div id="learning_teaching">
              <ContentSection
                imageSrc="/industries/ed-learning.png"
                alt="Learning & Teaching Platforms"
                title="Learning & Teaching Platforms"
                paragraphs={[
                  "We develop interactive learning and teaching platforms that support online classes, content delivery, and student engagement. Built for schools, universities, and edtech providers, our platforms make education accessible, personalized, and scalable.",
                  "From live classes to progress tracking and teacher dashboards, we enable seamless digital learning experiences for both educators and learners.",
                ]}
                listItems={[
                  "Virtual classrooms with live and recorded sessions",
                  "Course management with multimedia content support",
                  "Student progress tracking and analytics",
                  "Teacher dashboards and grading tools",
                  "Interactive quizzes and feedback modules",
                ]}
                reverse={true}
              />
            </div>

            <div id="exam-platforms">
              <ContentSection
                imageSrc="/industries/ed-exam.png"
                alt="Exam Preparation Platforms"
                title="Exam Preparation Platforms"
                paragraphs={[
                  "Our exam preparation platforms help learners study smarter with personalized learning paths, mock tests, and performance analytics. Ideal for competitive exams, school boards, and certifications — we bring structure and efficiency to self-paced learning.",
                  "With adaptive testing and progress reports, we ensure students stay on track and improve over time.",
                ]}
                listItems={[
                  "Topic-wise mock tests and quizzes",
                  "Real-time performance tracking and analytics",
                  "Personalized learning paths based on progress",
                  "Gamified learning and rewards system",
                  "Multi-device access for study anytime, anywhere",
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
