import React from "react";
import Head from "next/head";
import { Icon, Button } from "@graminate/ui";
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
    <div className="min-h-screen bg-[#f9fafb] dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans selection:bg-brand-green/30">
      <Head>
        <title>Graminate | Training & Growth Services</title>
        <meta name="description" content="Upskill your agricultural ventures with Graminate's professional training services." />
      </Head>

      {/* Simplified Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                <Icon type="psychology" className="text-green-100" />
            </div>
            <span className="font-bold text-xl tracking-tight">Graminate <span className="text-green-200">Academy</span></span>
          </div>
          <div className="flex gap-4">
             <Link href="/login">
                <Button label="Login" variant="ghost" />
             </Link>
             <Link href="/login">
                <Button label="Join Academy" variant="primary" />
             </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-green-300/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-blue-300/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-medium text-green-200 bg-green-300/10 rounded-full border border-green-200/20">
            New courses for Summer 2026 are now open!
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent">
            Cultivate Knowledge.<br />Harvest Success.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-10">
            Join 10,000+ modern farmers learning the skills needed to build sustainable, 
            profitable, and tech-driven agricultural businesses.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button label="Browse All Courses" variant="primary" size="lg" />
            <Button label="Watch Demo" variant="secondary" size="lg" icon={{ left: "play_circle" }} />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-lg">
                <h2 className="text-3xl font-bold mb-4">Professional Training Paths</h2>
                <p className="text-gray-600 dark:text-gray-400">Curated learning experiences designed for both beginners and seasoned agricultural entrepreneurs.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="md" icon={{ left: "filter_list" }} label="Filter" />
                <Button variant="outline" size="md" icon={{ left: "sort" }} label="Recently Added" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, i) => (
              <div key={i} className="group bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 hover:shadow-2xl hover:border-green-200/50 transition-all duration-300 flex flex-col h-full">
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-300/20 group-hover:scale-110 transition-all duration-500">
                  <Icon type={course.icon as any} className="text-2xl text-gray-600 dark:text-gray-300 group-hover:text-green-200 transition-colors" />
                </div>
                <div className="mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-green-200 mb-2 block">{course.level}</span>
                    <h3 className="text-xl font-bold mb-3">{course.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                        {course.description}
                    </p>
                </div>
                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <Icon type="schedule" size={14} />
                        {course.stats}
                    </span>
                    <Button label="Enroll" variant="link" icon={{ right: "arrow_forward" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto bg-green-100 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden text-white shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
             <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to scale your farm?</h2>
             <p className="text-lg opacity-90 mb-10 max-w-lg mx-auto">
               Get unlimited access to all courses, certification programs, and our community of expert advisors.
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button label="Start 7-Day Free Trial" variant="secondary" size="lg" className="!bg-white !text-green-100 border-none shadow-xl hover:!scale-105" />
                <p className="text-sm font-medium opacity-80">No credit card required for trial.</p>
             </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-sm text-gray-500 mb-4">© 2026 Graminate Agricultural Technologies Pvt. Ltd.</p>
        <div className="flex justify-center gap-6">
            <Link href="#" className="text-gray-400 hover:text-green-200 transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-gray-400 hover:text-green-200 transition-colors">Terms of Service</Link>
            <Link href="#" className="text-gray-400 hover:text-green-200 transition-colors">Contact Support</Link>
        </div>
      </footer>
    </div>
  );
};

export default TrainingServices;
