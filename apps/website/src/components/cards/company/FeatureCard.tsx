import React from "react";
import { Icon } from "@graminate/ui";

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
      <dt className="flex items-center gap-x-3 text-base leading-7 font-semibold text-gray-900">
        <Icon type={feature.icon} className="size-6 text-emerald-600" />
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
