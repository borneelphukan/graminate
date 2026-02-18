import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface ServicesProps {
  icon: IconDefinition;
  title: string;
  content: string;
}

const Services: React.FC<ServicesProps> = ({ icon, title, content }) => {
  return (
    <div className="max-w-xl rounded overflow-hidden shadow-lg bg-white py-8">
      {/* Left-aligned Icon above the Title */}
      <div className="px-6">
        <div className="flex flex-col items-start space-y-3">
          <FontAwesomeIcon icon={icon} className="text-green-200 text-2xl" />
          <h2 className="text-black text-2xl my-2 font-semibold">{title}</h2>
        </div>
      </div>

      <div className="px-6">
        <p className="text-black text-base ">{content}</p>
      </div>
    </div>
  );
};

export default Services;
