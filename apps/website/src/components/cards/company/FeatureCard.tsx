import React from "react";

interface Feature {
  title: string;
  icon: string;
  description: string[];
}

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  return (
    <div className="flex flex-col">
      <dt className="flex items-center gap-x-3 text-base leading-7 font-semibold text-gray-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
        </svg>
        {feature.title}
      </dt>
      <dd className="mt-4 text-base leading-7 text-gray-600">
        {feature.description.map((text, index) => (
          <p key={index} className="mb-4">
            {text}
          </p>
        ))}
      </dd>
    </div>
  );
};

export default FeatureCard;
