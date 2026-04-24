"use client";

import { useTranslation } from "@/contexts/I18nContext";

const Footer = () => {
  const { t } = useTranslation();

  const navigation = {
    features: [
      { label: t("footer.links.erp"), href: "/services#modules" },
      { label: t("footer.links.ai"), href: "/services#intelligence" },
      { label: t("footer.links.supply"), href: "/services#tools" },
      { label: t("footer.links.enterprise"), href: "/services#enterprise" },
    ],
    solutions: [
      { label: t("footer.links.farmers"), href: "/industries#independent" },
      { label: t("footer.links.cooperatives"), href: "/industries#cooperatives" },
      { label: t("footer.links.distributors"), href: "/industries#distributors" },
    ],
    company: [
      { label: t("nav.aboutus"), href: "/company/about_us" },
      { label: t("nav.careers"), href: "/company/career" },
      { label: "Pricing", href: "/pricing" },
    ],
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-6">
            <h2 className="text-left text-3xl font-black text-white tracking-tight">
              {t("nav.brand")}
            </h2>
            <p className="text-base text-gray-400 leading-relaxed max-w-sm">
              {t("footer.tagline")}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 xl:grid-cols-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t("nav.features")}</h3>
              <ul role="list" className="mt-4 space-y-3">
                {navigation.features.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t("nav.solutions")}</h3>
              <ul role="list" className="mt-4 space-y-3">
                {navigation.solutions.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t("nav.aboutus")}</h3>
              <ul role="list" className="mt-4 space-y-3">
                {navigation.company.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {t("nav.brand")}. {t("footer.rights")}
          </p>
          <div className="flex gap-6 text-xs text-gray-500 hover:text-gray-400">
            <a href="/privacy">{t("footer.privacy")}</a>
            <a href="/terms">{t("footer.terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
