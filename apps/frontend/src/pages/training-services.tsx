import React from "react";
import Head from "next/head";
import { Icon, Button } from "@graminate/ui";
import LoginLayout from "@/layout/LoginLayout";
import Link from "next/link";


const TrainingServices = () => {
  const courses = [
    {
      title: "Advanced Poultry Management",
      description: "Master the art of poultry farming with our comprehensive guide to flock health, nutrition, and market optimization.",
      icon: "flutter_dash",
      stats: "12 Modules • 24 Hours",
      level: "Intermediate",
    },
    {
      title: "Commercial Bee Keeping",
      description: "Learn sustainable apiculture practices from industry experts. From hive setup to honey processing and marketing.",
      icon: "hive",
      stats: "8 Modules • 15 Hours",
      level: "Beginner",
    },
    {
      title: "Smart Farm Automation",
      description: "Integrate IoT and automation into your farm. Monitor soil health, moisture, and livestock remotely with ease.",
      icon: "precision_manufacturing",
      stats: "10 Modules • 20 Hours",
      level: "Advanced",
    },
    {
      title: "Sustainable Soil Health",
      description: "Understand the science behind crop rotation, organic fertilizers, and regenerative agriculture for long-term yields.",
      icon: "grass",
      stats: "6 Modules • 12 Hours",
      level: "Intermediate",
    },
    {
      title: "Fisheries & Aquaculture",
      description: "Build and manage high-yield fish farms. Expert tips on pond construction, water quality, and species selection.",
      icon: "set_meal",
      stats: "15 Modules • 30 Hours",
      level: "Professional",
    },
    {
      title: "Agricultural Finance",
      description: "Master bookkeeping, tax planning, and loan applications specifically tailored for modern agricultural entrepreneurs.",
      icon: "payments",
      stats: "5 Modules • 10 Hours",
      level: "Beginner",
    },
  ];

  return (
    <>
      <Head>
        <title>Training & Growth Services | Graminate</title>
      </Head>
      <LoginLayout>
        <div className="bg-gray-50 py-12 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-dark mb-4">
                Professional Training Paths
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-gray-600">
                Join 10,000+ modern farmers learning the skills needed to build sustainable, 
                profitable, and tech-driven agricultural businesses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-xl shadow-md border border-gray-400 p-8 flex flex-col h-full hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                    <Icon type={course.icon as any} className="text-2xl text-gray-600" />
                  </div>
                  <div className="mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-green-200 mb-2 block">{course.level}</span>
                    <h3 className="text-xl font-bold text-dark mb-3">{course.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                  <div className="mt-auto pt-6 border-t border-gray-400 dark:border-gray-700 flex items-center justify-between font-medium">
                    <span className="text-xs text-dark dark:text-light flex items-center gap-1">
                      <Icon type="schedule" size={14} />
                      {course.stats}
                    </span>
                    <Button label="Enroll Now" variant="link" icon={{ right: "arrow_forward" }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-20 bg-gray-900 rounded-2xl p-10 text-center text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-green-200/10 rounded-full blur-3xl -mr-32 -mt-32" />
               <h2 className="text-3xl font-bold mb-4">Ready to scale your farm?</h2>
               <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
                 Get unlimited access to all courses, certification programs, and our community of expert advisors.
               </p>
               <Button label="Start 7-Day Free Trial" variant="primary" size="lg" className="bg-green-200 border-none px-8" />
            </div>

            <div className="mt-12 text-center text-dark dark:text-light text-sm font-medium">
              <p className="mb-4 font-normal opacity-70">© 2026 Graminate Agricultural Technologies Pvt. Ltd. All rights reserved.</p>
              <div className="flex justify-center gap-8">
                 <Link href="/privacy-policy" target="_blank" className="hover:text-green-200 transition-colors">Privacy Policy</Link>
                 <Link href="#" className="hover:text-green-200 transition-colors">Terms of Service</Link>
                 <Link href="#" className="hover:text-green-200 transition-colors">Contact Support</Link>
              </div>
            </div>

          </div>
        </div>
      </LoginLayout>
    </>
  );
};

export default TrainingServices;
