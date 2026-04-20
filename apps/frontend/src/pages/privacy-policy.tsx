import React from "react";
import Head from "next/head";
import { Icon } from "@graminate/ui";
import LoginLayout from "@/layout/LoginLayout";

const PrivacyPolicy = () => {
  const lastUpdated = "October 20, 2026";

  const sections = [
    {
      title: "Introduction",
      content: "Welcome to Graminate. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at support@graminate.com.",
    },
    {
      title: "Information We Collect",
      content: "We collect personal information that you provide to us such as name, address, contact information, passwords and security data, and payment information. We also collect certain information automatically when you visit, use or navigate our platform (like your IP address and device characteristics).",
    },
    {
      title: "How We Use Your Information",
      content: "We use personal information collected via our platform for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.",
    },
    {
      title: "Sharing Your Information",
      content: "We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may process or share data based on the following legal basis: Consent, Legitimate Interests, Performance of a Contract, Legal Obligations, and Vital Interests.",
    },
    {
      title: "Cookies and Tracking Technologies",
      content: "We may use cookies and similar tracking technologies to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Policy.",
    },
    {
      title: "Data Security",
      content: "We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.",
    },
    {
      title: "Your Privacy Rights",
      content: "In some regions (like the EEA and UK), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability.",
    },
  ];

  return (
    <>
      <Head>
        <title>Privacy Policy | Graminate</title>
      </Head>
      <LoginLayout>
        <div className="bg-gray-50 py-12 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold text-dark text-center mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 text-center mb-12">
              Last updated: {lastUpdated}
            </p>

            <div className="space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-200">
              {sections.map((section, index) => (
                <div key={index}>
                  <h2 className="text-xl font-bold text-dark mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-200 text-white text-sm font-bold">
                      {index + 1}
                    </span>
                    {section.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed pl-10">
                    {section.content}
                  </p>
                  {index < sections.length - 1 && (
                    <div className="mt-8 border-b border-gray-100" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 text-center text-dark dark:text-light text-sm">
              <p>© 2026 Graminate Agricultural Technologies Pvt. Ltd. All rights reserved.</p>
              <div className="mt-4 flex justify-center gap-6">
                 <Icon type="facebook" className="cursor-pointer hover:text-green-200" />
                 <Icon type="twitter" className="cursor-pointer hover:text-green-200" />
                 <Icon type="linkedin" className="cursor-pointer hover:text-green-200" />
              </div>
            </div>
          </div>
        </div>
      </LoginLayout>
    </>
  );
};

export default PrivacyPolicy;
