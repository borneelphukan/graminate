import { Icon, Button, Input } from "@graminate/ui";
import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";

interface VeterinaryFormProps extends SidebarProp {
  flockId: number;
}

type HealthRecordData = {
  veterinaryName: string;
  totalBirds: string;
  birdsVaccinated: string;
  vaccinesGiven: string;
  symptoms: string;
  medicineApproved: string;
  remarks: string;
  nextAppointment: string;
};

type HealthFormErrors = {
  veterinaryName?: string;
  totalBirds?: string;
  birdsVaccinated?: string;
  vaccinesGiven?: string;
  symptoms?: string;
  medicineApproved?: string;
  remarks?: string;
  nextAppointment?: string;
};

type HealthRecordPayload = {
  user_id: number;
  flock_id: number;
  total_birds: number;
  birds_vaccinated: number;
  veterinary_name?: string;
  vaccines_given?: string[];
  symptoms?: string[];
  medicine_approved?: string[];
  remarks?: string;
  next_appointment?: string;
}

const VeterinaryForm = ({
  onClose,
  formTitle,
  flockId,
}: VeterinaryFormProps) => {
  const router = useRouter();
  const { user_id: queryUserId } = router.query;
  const parsedUserId = Array.isArray(queryUserId)
    ? queryUserId[0]
    : queryUserId;

  const [animate, setAnimate] = useState(false);
  const [healthRecord, setHealthRecord] = useState<HealthRecordData>({
    veterinaryName: "",
    totalBirds: "",
    birdsVaccinated: "",
    vaccinesGiven: "",
    symptoms: "",
    medicineApproved: "",
    remarks: "",
    nextAppointment: "",
  });
  const [healthErrors, setHealthErrors] = useState<HealthFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  useAnimatePanel(setAnimate);

  const handleCloseAnimation = useCallback(() => {
    setAnimate(false);
    setTimeout(() => {
      onClose();
    }, 400);
  }, [onClose]);

  const handleClose = useCallback(() => {
    handleCloseAnimation();
  }, [handleCloseAnimation]);

  useClickOutside(panelRef, handleClose);

  const validateForm = (): boolean => {
    const errors: HealthFormErrors = {};
    let isValid = true;

    if (!healthRecord.totalBirds.trim()) {
      errors.totalBirds = "Total Birds is required.";
      isValid = false;
    } else if (isNaN(Number(healthRecord.totalBirds))) {
      errors.totalBirds = "Total Birds must be a valid number.";
      isValid = false;
    } else if (Number(healthRecord.totalBirds) < 0) {
      errors.totalBirds = "Total Birds cannot be negative.";
      isValid = false;
    }

    if (!healthRecord.birdsVaccinated.trim()) {
      errors.birdsVaccinated = "Birds Vaccinated is required.";
      isValid = false;
    } else if (isNaN(Number(healthRecord.birdsVaccinated))) {
      errors.birdsVaccinated = "Birds Vaccinated must be a valid number.";
      isValid = false;
    } else if (Number(healthRecord.birdsVaccinated) < 0) {
      errors.birdsVaccinated = "Birds Vaccinated cannot be negative.";
      isValid = false;
    } else if (
      Number(healthRecord.birdsVaccinated) > Number(healthRecord.totalBirds)
    ) {
      errors.birdsVaccinated = "Birds Vaccinated cannot exceed Total Birds.";
      isValid = false;
    }

    if (
      healthRecord.nextAppointment &&
      isNaN(new Date(healthRecord.nextAppointment).getTime())
    ) {
      errors.nextAppointment = "Invalid date format for Next Appointment.";
      isValid = false;
    }

    setHealthErrors(errors);
    return isValid;
  };

  const handleSubmitHealthRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!parsedUserId) {
      alert("User ID is missing. Cannot log health data.");
      return;
    }
    if (!flockId) {
      alert("Flock ID is missing. Cannot log health data.");
      return;
    }

    setIsLoading(true);
    const parseStringToArray = (str: string) =>
      str
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

    const payload: HealthRecordPayload = {
      user_id: Number(parsedUserId),
      flock_id: Number(flockId),
      total_birds: Number(healthRecord.totalBirds),
      birds_vaccinated: Number(healthRecord.birdsVaccinated),
    };

    if (healthRecord.veterinaryName.trim())
      payload.veterinary_name = healthRecord.veterinaryName;
    if (healthRecord.vaccinesGiven.trim())
      payload.vaccines_given = parseStringToArray(healthRecord.vaccinesGiven);
    if (healthRecord.symptoms.trim())
      payload.symptoms = parseStringToArray(healthRecord.symptoms);
    if (healthRecord.medicineApproved.trim())
      payload.medicine_approved = parseStringToArray(
        healthRecord.medicineApproved
      );
    if (healthRecord.remarks.trim()) payload.remarks = healthRecord.remarks;
    if (healthRecord.nextAppointment.trim())
      payload.next_appointment = healthRecord.nextAppointment;

    try {
      await axiosInstance.post(`/poultry-health/add`, payload);
      setHealthRecord({
        veterinaryName: "",
        totalBirds: "",
        birdsVaccinated: "",
        vaccinesGiven: "",
        symptoms: "",
        medicineApproved: "",
        remarks: "",
        nextAppointment: "",
      });
      setHealthErrors({});
      setIsLoading(false);
      handleClose();
      window.location.reload();
    } catch (error) {
      console.error("Error submitting health record:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md transition-opacity duration-300">
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full md:w-[540px] bg-white dark:bg-gray-700 overflow-hidden flex flex-col"
        style={{
          transform: animate ? "translateX(0)" : "translateX(100%)",
          transition: "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="px-8 py-6 flex justify-between items-center border-b border-gray-400 dark:border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formTitle || "Log New Health Data"}
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              Record veterinary visits and health maintenance.
            </p>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-gray-500 dark:hover:bg-gray-600 text-dark dark:text-light transition-all"
            onClick={handleClose}
            aria-label="Close panel"
          >
            <Icon type={"close"} className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
          <form
            id="veterinary-form"
            className="space-y-8"
            onSubmit={handleSubmitHealthRecord}
            noValidate
          >
            {/* Healthcare Provider Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Healthcare Provider</h3>
              </div>

              <Input
                id="veterinaryName"
                label="Veterinary Name (Optional)"
                placeholder="e.g. Dr. Smith"
                value={healthRecord.veterinaryName}
                onChange={(e) => {
                  setHealthRecord({ ...healthRecord, veterinaryName: e.target.value });
                  setHealthErrors({
                    ...healthErrors,
                    veterinaryName: undefined,
                  });
                }}
                error={healthErrors.veterinaryName}
              />
            </section>

            {/* Flock Metrics Section */}
            <section className="space-y-6 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Flock Metrics</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  id="totalBirds"
                  type="number"
                  label="Total Birds Involved"
                  placeholder="e.g. 100"
                  value={healthRecord.totalBirds}
                  onChange={(e) => {
                    setHealthRecord({ ...healthRecord, totalBirds: e.target.value });
                    setHealthErrors({ ...healthErrors, totalBirds: undefined });
                  }}
                  error={healthErrors.totalBirds}
                  required
                />
                <Input
                  id="birdsVaccinated"
                  type="number"
                  label="Birds Vaccinated"
                  placeholder="e.g. 95"
                  value={healthRecord.birdsVaccinated}
                  onChange={(e) => {
                    setHealthRecord({ ...healthRecord, birdsVaccinated: e.target.value });
                    setHealthErrors({
                      ...healthErrors,
                      birdsVaccinated: undefined,
                    });
                  }}
                  error={healthErrors.birdsVaccinated}
                  required
                />
              </div>
            </section>

            {/* Treatment & Follow-up Section */}
            <section className="space-y-6 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Treatment & Follow-up</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="vaccinesGiven"
                  label="Vaccines Given (Optional, comma-separated)"
                  placeholder="e.g. NDV, IBV"
                  value={healthRecord.vaccinesGiven}
                  onChange={(e) => {
                    setHealthRecord({ ...healthRecord, vaccinesGiven: e.target.value });
                    setHealthErrors({
                      ...healthErrors,
                      vaccinesGiven: undefined,
                    });
                  }}
                  error={healthErrors.vaccinesGiven}
                />
                <Input
                  id="symptoms"
                  label="Symptoms Observed (Optional, comma-separated)"
                  placeholder="e.g. Coughing, Sneezing"
                  value={healthRecord.symptoms}
                  onChange={(e) => {
                    setHealthRecord({ ...healthRecord, symptoms: e.target.value });
                    setHealthErrors({ ...healthErrors, symptoms: undefined });
                  }}
                  error={healthErrors.symptoms}
                />
                <Input
                  id="medicineApproved"
                  label="Medicine Approved (Optional, comma-separated)"
                  placeholder="e.g. Antibiotic X, Vitamin Y"
                  value={healthRecord.medicineApproved}
                  onChange={(e) => {
                    setHealthRecord({ ...healthRecord, medicineApproved: e.target.value });
                    setHealthErrors({
                      ...healthErrors,
                      medicineApproved: undefined,
                    });
                  }}
                  error={healthErrors.medicineApproved}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    id="nextAppointment"
                    type="date"
                    label="Next Appointment Date (Optional)"
                    value={healthRecord.nextAppointment}
                    onChange={(e) => {
                      setHealthRecord({ ...healthRecord, nextAppointment: e.target.value });
                      setHealthErrors({
                        ...healthErrors,
                        nextAppointment: undefined,
                      });
                    }}
                    error={healthErrors.nextAppointment}
                  />
                </div>
                <Input
                  id="remarks"
                  label="Remarks (Optional)"
                  placeholder="Additional notes or observations"
                  value={healthRecord.remarks}
                  onChange={(e) => {
                    setHealthRecord({ ...healthRecord, remarks: e.target.value });
                    setHealthErrors({ ...healthErrors, remarks: undefined });
                  }}
                  error={healthErrors.remarks}
                />
              </div>
            </section>
          </form>
        </div>

        {/* Action Footer */}
        <div className="p-8 border-t border-gray-400 dark:border-gray-200 grid grid-cols-2 gap-4 w-full">
          <Button
            label="Cancel"
            variant="secondary"
            onClick={handleClose}
            className="w-full"
            disabled={isLoading}
          />
          <Button
            label={isLoading ? "Saving..." : "Save Record"}
            variant="primary"
            type="submit"
            form="veterinary-form"
            className="w-full"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default VeterinaryForm;
