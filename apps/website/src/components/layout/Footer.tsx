"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const navigation = {
  services: [
    { key: "Software Development", href: "/services/software_development" },
    { key: "Product Design", href: "/services/product_design" },
    { key: "IT Operations", href: "/services/it_operations" },
    { key: "Technology Enablement", href: "/services/tech_consulting" },
  ],
  industries: [
    { key: "Enterprise", href: "/industries/enterprise" },
    { key: "Healthcare", href: "/industries/healthcare" },
    { key: "Finance", href: "/industries/finance" },
    { key: "Education", href: "/industries/education" },
    { key: "Public Sector", href: "/industries/public_sector" },
  ],
  ourProducts: [
    { key: "Graminate AgroERP", href: "/products/graminate" },
    // { key: "Downloads", href: "/company/downloads" },
  ],

  company: [
    { key: "About Us", href: "/company/about_us" },
    { key: "Careers", href: "/company/career" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-4 sm:pt-12 sm:pb-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-2">
            <h2 className="text-left text-3xl font-semibold text-white">
              Graminate
            </h2>
            <p className="text-sm text-gray-300">
              At Graminate, we bring your ideas into reality using the most
              modern technologies and thoughtful design powered by super
              scalable solutions.
            </p>
            <div className="flex gap-x-8 pt-6">
              {/* <a
                href="https://facebook.com"
                target="_blank"
                aria-label="Facebook"
              >
                <FontAwesomeIcon
                  icon={faFacebookF}
                  className="h-5 w-5 text-gray-300 hover:text-white"
                />
              </a> */}
              {/* <a href="https://x.com" target="_blank" aria-label="X">
                <FontAwesomeIcon
                  icon={faXTwitter}
                  className="h-5 w-5 text-gray-300 hover:text-white"
                />
              </a> */}
              {/* <a
                href="https://linkedin.com/"
                target="_blank"
                aria-label="LinkedIn"
              >
                <FontAwesomeIcon
                  icon={faLinkedin}
                  className="h-5 w-5 text-gray-300 hover:text-white"
                />
              </a> */}
              <a
                href="https://github.com/Graminate"
                target="_blank"
                aria-label="GitHub"
              >
                <FontAwesomeIcon
                  icon={faGithub}
                  className="h-5 w-5 text-gray-300 hover:text-white"
                />
              </a>
              {/* <a href="tel:+4917671259396" aria-label="Phone">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="h-5 w-5 text-gray-300 hover:text-white"
                />
              </a> */}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 xl:grid-cols-3">
            <div className="col-span-1">
              <h3 className="text-sm font-semibold text-white">Services</h3>
              <ul role="list" className="mt-2 space-y-2">
                {navigation.services.map((item) => (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-300 hover:text-white"
                    >
                      {item.key}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1">
              <h3 className="text-sm font-semibold text-white">Industries</h3>
              <ul role="list" className="mt-2 space-y-2">
                {navigation.industries.map((item) => (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-300 hover:text-white"
                    >
                      {item.key}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1">
              <h3 className="text-sm font-semibold text-white">Company</h3>
              <ul role="list" className="mt-2 space-y-2">
                {navigation.company.map((item) => (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-300 hover:text-white"
                    >
                      {item.key}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* <div className="col-span-2 xl:col-span-1">
              <h3 className="text-sm font-semibold text-white">Our Products</h3>
              <ul role="list" className="mt-2 space-y-2">
                {navigation.ourProducts.map((item) => (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-300 hover:text-white"
                    >
                      {item.key}
                    </a>
                  </li>
                ))}
              </ul>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
