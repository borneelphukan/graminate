import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const companyName = "Graminate";

  return (
    <footer className="bg-gray-500 text-gray-600 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm">
          © {currentYear} {companyName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
