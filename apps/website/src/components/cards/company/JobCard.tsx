import React, { useState } from "react";
import Button from "@/components/ui/Button";

interface JobCardProps {
  position: string;
  type: string;
  mode: string;
  description: string;
  tasks?: string[];
  requirements?: string[];
  benefits?: string[];
  jobpost: string;
}
const JobCard: React.FC<JobCardProps> = ({
  position,
  type,
  mode,
  description,
  tasks = [],
  requirements = [],
  benefits = [],
  jobpost,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  // const router = useRouter();

  const applyForJob = () => {
    window.open(jobpost, "_blank");
  };

  // const applyForJob = () => {
  //   const formattedPosition = position.toLowerCase().replace(/\s+/g, "-");
  //   const formattedType = type.toLowerCase().replace(/\s+/g, "-");
  //   const formattedMode = mode.toLowerCase().replace(/\s+/g, "-");

  //   router.push(
  //     `/company/${formattedPosition}?type=${formattedType}&mode=${formattedMode}`
  //   );
  // };

  return (
    <div className="flex flex-col rounded-lg bg-white p-6 shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">{position}</h3>
        <Button text="Apply" style="primary" onClick={applyForJob} />
      </div>
      <p className="text-sm text-gray-600">
        {type} ⋅ {mode}
      </p>
      <p className="mt-2">{description}</p>

      {/* Show More / Show Less Toggle */}
      <button
        className="mt-2 text-blue-600 hover:underline focus:outline-none"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? "Show less" : "Show more"}
      </button>

      {showDetails && (
        <>
          {tasks.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-gray-800">Tasks</h4>
              <ul className="list-inside list-disc text-gray-600">
                {tasks.map((task, index) => (
                  <li key={index}>{task}</li>
                ))}
              </ul>
            </div>
          )}

          {requirements.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Requirements
              </h4>
              <ul className="list-inside list-disc text-gray-600">
                {requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}

          {benefits.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-gray-800">Benefits</h4>
              <ul className="list-inside list-disc text-gray-600">
                {benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobCard;
