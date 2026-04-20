import { Icon } from "@graminate/ui";
import React from "react";
import Loader from "@/components/ui/Loader";

type VeterinaryCardProps = {
  birdsVaccinated: number | null;
  totalBirdsInvolvedInRecord: number | null;
  nextAppointmentDate: string | null;
  onManageClick: () => void;
  loading: boolean;
};

type MetricItemProps = {
  icon: string;
  value: string | React.ReactNode;
  label: string;
};

const MetricItem = ({ icon, value, label }: MetricItemProps) => (
  <div className="flex flex-col items-center justify-center text-center p-4 bg-light dark:bg-gray-700 rounded-lg space-y-1 shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
    <Icon
      type={icon}
      className="h-6 w-6 text-blue-200 dark:text-blue-300 mb-2"
      aria-hidden="true"
    />
    <p className="text-lg font-semibold text-dark dark:text-light">{value}</p>
    <p className="text-sm text-dark dark:text-light">{label}</p>
  </div>
);

const VeterinaryCard = ({
  birdsVaccinated,
  totalBirdsInvolvedInRecord,
  nextAppointmentDate,
  onManageClick,
  loading,
}: VeterinaryCardProps) => {
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const vaccinatedDisplayValue =
    birdsVaccinated === null || totalBirdsInvolvedInRecord === null
      ? "N/A"
      : `${birdsVaccinated} / ${totalBirdsInvolvedInRecord}`;

  return (
    <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">
          Veterinary Status
        </h2>
      </div>

      {loading ? (
        <div className="flex-grow flex justify-center items-center py-8">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 flex-grow">
          <MetricItem
            icon={"vaccines"}
            value={vaccinatedDisplayValue}
            label="Birds Vaccinated (Latest)"
          />
          <MetricItem
            icon={"event_available"}
            value={formatDate(nextAppointmentDate)}
            label="Next Visit"
          />
          <div
            onClick={!loading ? onManageClick : undefined}
            className={`${!loading ? "cursor-pointer" : "cursor-not-allowed"}`}
          >
            <MetricItem
              icon={"medical_information"}
              value={"Log/View"}
              label="Manage Health Data"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VeterinaryCard;
