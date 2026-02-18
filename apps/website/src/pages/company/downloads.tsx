import Head from "next/head";
import DownloadTable from "@/components/tables/DownloadTable";
import {
  faWindows,
  faApple,
  faAndroid,
} from "@fortawesome/free-brands-svg-icons";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function Download() {
  const desktopPlatformIcons = [faWindows, faApple];
  const desktopPlatforms = ["Windows", "Mac"];

  const mobilePlatformIcons = [faAndroid, faApple];
  const mobilePlatforms = ["Android", "ios"];

  return (
    <>
      <Head>
        <title>Downloads</title>
      </Head>

      <Navbar signIn />
      {/* Header */}
      <div className="relative bg-gray-400">
        <div className="relative isolate overflow-hidden pt-1">
          <div className="mx-auto max-w-2xl pt-16 pb-5 text-center sm:pt-16 sm:pb-5 lg:pt-10 lg:pb-16">
            <h1 className="text-5xl font-bold text-gray-600 sm:text-5xl">
              Downloads
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content with 3:4 Column Layout */}
      <div className="container mx-auto py-5">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-7">
          {/* Left Column */}
          <div className="rounded-lg p-6 md:col-span-5">
            <DownloadTable
              version={"1.0.0"}
              platformIcons={desktopPlatformIcons}
              platforms={desktopPlatforms}
            />
            <DownloadTable
              version={"1.0.0"}
              platformIcons={mobilePlatformIcons}
              platforms={mobilePlatforms}
              mobile
            />
          </div>

          {/* Right Column */}
          <div className="m-2 grid h-auto grid-rows-2 gap-4 rounded-lg md:col-span-2">
            {/* First Row: Compare */}
            <div className="rounded-lg bg-gray-500 p-6">
              <h2 className="mb-2 text-xl font-semibold">
                Compare Graminate Versions
              </h2>
              <p className="text-gray-600">
                Compare different versions of Graminate ERP
              </p>
              <a href="/support" className="mt-3 inline-block text-green-600">
                {"Compare Link"} →
              </a>
            </div>

            {/* First Row: Installation Guide */}
            <div className="rounded-lg bg-gray-500 p-6">
              <h2 className="mb-2 text-xl font-semibold">Installation Guide</h2>
              <p className="text-gray-600">Installation Guide for all OS</p>
              <a href="/support" className="mt-3 inline-block text-green-600">
                Read More →
              </a>
            </div>

            {/* Second Row: Questions */}
            <div className="rounded-lg bg-gray-500 p-6">
              <h2 className="mb-2 text-xl font-semibold">Questions?</h2>
              <p className="text-gray-600">
                Contact us about anything related to Graminate Apps or services
              </p>
              <a
                href="/contact-us"
                className="mt-3 inline-block text-green-600"
              >
                Contact Us →
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
