import { Dropdown, Button, Input } from "@graminate/ui";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { triggerToast } from "@/stores/toast";
import { GENDER, YESNO } from "@/constants/options";
import axiosInstance from "@/lib/utils/axiosInstance";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";

type LabourData = {
  labour_id: number;
  name: string;
  rate: number;
}

const LabourDetails = () => {
  const router = useRouter();
  const [labour, setLabour] = useState<LabourData | null>(null);


  const isLoading = !labour;

  const [displayName, setDisplayName] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [aadharCardNumber, setAadharCardNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [queryData, setQueryData] = useState<string | null>(null);
  const [role, setRole] = useState("");

  const [rationCard, setRationCard] = useState("");
  const [panCard, setPanCard] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [mnregaJobCardNumber, setMnregaJobCardNumber] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [disabilityStatus, setDisabilityStatus] = useState("");

  const [epfo, setEpfo] = useState("");
  const [esic, setEsic] = useState("");
  const [pmKisan, setPmKisan] = useState("");

  const [baseSalary, setBaseSalary] = useState("");
  const [bonus, setBonus] = useState("");
  const [overtimePay, setOvertimePay] = useState("");
  const [housingAllowance, setHousingAllowance] = useState("");
  const [travelAllowance, setTravelAllowance] = useState("");
  const [mealAllowance, setMealAllowance] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("");

  const [initialFormData, setInitialFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    contactNumber: "",
    aadharCardNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    rationCard: "",
    panCard: "",
    drivingLicense: "",
    mnregaJobCardNumber: "",
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "",
    bankBranch: "",
    disabilityStatus: "",
    role: "",
    epfo: "",
    esic: "",
    pmKisan: "",
    baseSalary: "",
    bonus: "",
    overtimePay: "",
    housingAllowance: "",
    travelAllowance: "",
    mealAllowance: "",
    paymentFrequency: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.data) {
      setQueryData(router.query.data as string);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (!queryData) return;
    try {
      const parsedLabour = JSON.parse(queryData);
      setLabour(parsedLabour);
      setDisplayName(`${parsedLabour.full_name} (${parsedLabour.role})`);
      setFullName(parsedLabour.full_name || "");
      setDateOfBirth(
        new Date(parsedLabour.date_of_birth).toLocaleDateString() || ""
      );
      setGender(parsedLabour.gender || "");
      setContactNumber(parsedLabour.contact_number || "");
      setAadharCardNumber(parsedLabour.aadhar_card_number || "");
      setAddressLine1(parsedLabour.address_line_1 || "");
      setAddressLine2(parsedLabour.address_line_2 || "");
      setCity(parsedLabour.city || "");
      setState(parsedLabour.state || "");
      setPostalCode(parsedLabour.postal_code || "");
      setRole(parsedLabour.role || "");

      setRationCard(parsedLabour.ration_card ?? "");
      setPanCard(parsedLabour.pan_card ?? "");
      setDrivingLicense(parsedLabour.driving_license ?? "");
      setMnregaJobCardNumber(parsedLabour.mnrega_job_card_number ?? "");
      setBankAccountNumber(parsedLabour.bank_account_number ?? "");
      setIfscCode(parsedLabour.ifsc_code ?? "");
      setBankName(parsedLabour.bank_name ?? "");
      setBankBranch(parsedLabour.bank_branch ?? "");
      setDisabilityStatus(parsedLabour.disability_status ? "Yes" : "No");
      setEpfo(parsedLabour.epfo ?? "");
      setEsic(parsedLabour.esic ?? "");
      setPmKisan(parsedLabour.pm_kisan ? "Yes" : "No");
      setBaseSalary(parsedLabour.base_salary?.toString() || "");
      setBonus(parsedLabour.bonus?.toString() || "");
      setOvertimePay(parsedLabour.overtime_pay?.toString() || "");
      setHousingAllowance(parsedLabour.housing_allowance?.toString() || "");
      setTravelAllowance(parsedLabour.travel_allowance?.toString() || "");
      setMealAllowance(parsedLabour.meal_allowance?.toString() || "");
      setPaymentFrequency(parsedLabour.payment_frequency || "Monthly");

      setInitialFormData({
        fullName: parsedLabour.full_name || "",
        dateOfBirth:
          new Date(parsedLabour.date_of_birth).toLocaleDateString() || "",
        gender: parsedLabour.gender || "",
        contactNumber: parsedLabour.contact_number || "",
        aadharCardNumber: parsedLabour.aadhar_card_number || "",
        addressLine1: parsedLabour.address_line_1 || "",
        addressLine2: parsedLabour.address_line_2 || "",
        city: parsedLabour.city || "",
        state: parsedLabour.state || "",
        postalCode: parsedLabour.postal_code || "",
        rationCard: parsedLabour.ration_card || "",
        panCard: parsedLabour.pan_card || "",
        drivingLicense: parsedLabour.driving_license || "",
        mnregaJobCardNumber: parsedLabour.mnrega_job_card_number || "",
        bankAccountNumber: parsedLabour.bank_account_number || "",
        ifscCode: parsedLabour.ifsc_code || "",
        bankName: parsedLabour.bank_name || "",
        bankBranch: parsedLabour.bank_branch || "",
        disabilityStatus: parsedLabour.disability_status ? "Yes" : "No",
        role: parsedLabour.role || "",
        epfo: parsedLabour.epfo || "",
        esic: parsedLabour.esic || "",
        pmKisan: parsedLabour.pm_kisan ? "Yes" : "No",
        baseSalary: parsedLabour.base_salary?.toString() || "",
        bonus: parsedLabour.bonus?.toString() || "",
        overtimePay: parsedLabour.overtime_pay?.toString() || "",
        housingAllowance: parsedLabour.housing_allowance?.toString() || "",
        travelAllowance: parsedLabour.travel_allowance?.toString() || "",
        mealAllowance: parsedLabour.meal_allowance?.toString() || "",
        paymentFrequency: parsedLabour.payment_frequency || "Monthly",
      });
    } catch (error) {
      console.error("Error parsing labour data:", error);
    }
  }, [queryData]);

  const hasChanges =
    fullName !== initialFormData.fullName ||
    dateOfBirth !== initialFormData.dateOfBirth ||
    gender !== initialFormData.gender ||
    contactNumber !== initialFormData.contactNumber ||
    aadharCardNumber !== initialFormData.aadharCardNumber ||
    addressLine1 !== initialFormData.addressLine1 ||
    addressLine2 !== initialFormData.addressLine2 ||
    city !== initialFormData.city ||
    state !== initialFormData.state ||
    postalCode !== initialFormData.postalCode ||
    rationCard !== initialFormData.rationCard ||
    panCard !== initialFormData.panCard ||
    drivingLicense !== initialFormData.drivingLicense ||
    mnregaJobCardNumber !== initialFormData.mnregaJobCardNumber ||
    bankAccountNumber !== initialFormData.bankAccountNumber ||
    ifscCode !== initialFormData.ifscCode ||
    bankName !== initialFormData.bankName ||
    bankBranch !== initialFormData.bankBranch ||
    disabilityStatus !== initialFormData.disabilityStatus ||
    role !== initialFormData.role ||
    epfo !== initialFormData.epfo ||
    esic !== initialFormData.esic ||
    pmKisan !== initialFormData.pmKisan ||
    baseSalary !== initialFormData.baseSalary ||
    bonus !== initialFormData.bonus ||
    overtimePay !== initialFormData.overtimePay ||
    housingAllowance !== initialFormData.housingAllowance ||
    travelAllowance !== initialFormData.travelAllowance ||
    mealAllowance !== initialFormData.mealAllowance ||
    paymentFrequency !== initialFormData.paymentFrequency;

  const handleSave = async () => {
    setSaving(true);

    if (!labour || !labour.labour_id) {
      triggerToast("Labour ID is missing. Cannot update.", "error");
      setSaving(false);
      return;
    }

    const payload = {
      labour_id: labour.labour_id,
      full_name: fullName,
      date_of_birth: dateOfBirth,
      gender: gender,
      contact_number: contactNumber,
      aadhar_card_number: aadharCardNumber,
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      city: city,
      state: state,
      postalCode: postalCode,

      ration_card: rationCard,
      pan_card: panCard,
      driving_license: drivingLicense,
      mnrega_job_card_number: mnregaJobCardNumber,

      bank_account_number: bankAccountNumber,
      ifsc_code: ifscCode,
      bank_name: bankName,
      bank_branch: bankBranch,

      disability_status: disabilityStatus === "Yes",
      role: role,
      epfo: epfo,
      esic: esic,
      pm_kisan: pmKisan === "Yes",

      base_salary: parseFloat(baseSalary),
      bonus: parseFloat(bonus),
      overtime_pay: parseFloat(overtimePay),
      housing_allowance: parseFloat(housingAllowance),
      travel_allowance: parseFloat(travelAllowance),
      meal_allowance: parseFloat(mealAllowance),
      payment_frequency: paymentFrequency,
    };

    try {
      const response = await axiosInstance.put("/labour/update", payload);
      triggerToast("Labour updated successfully", "success");

      setLabour(response.data.updatedLabour);
      setInitialFormData({
        fullName: payload.full_name,
        dateOfBirth: payload.date_of_birth,
        gender: payload.gender,
        contactNumber: payload.contact_number,
        aadharCardNumber: payload.aadhar_card_number,
        addressLine1: payload.address_line_1,
        addressLine2: payload.address_line_2,
        city: city,
        state: state,
        postalCode: postalCode,
        rationCard: payload.ration_card,
        panCard: payload.pan_card,
        drivingLicense: payload.driving_license,
        mnregaJobCardNumber: payload.mnrega_job_card_number,
        bankAccountNumber: payload.bank_account_number,
        ifscCode: payload.ifsc_code,
        bankName: payload.bank_name,
        bankBranch: payload.bank_branch,
        disabilityStatus: payload.disability_status ? "Yes" : "No",
        role: payload.role,
        epfo: payload.epfo,
        esic: payload.esic,
        pmKisan: payload.pm_kisan ? "Yes" : "No",
        baseSalary: payload.base_salary?.toString() || "",
        bonus: payload.bonus?.toString() || "",
        overtimePay: payload.overtime_pay?.toString() || "",
        housingAllowance: payload.housing_allowance?.toString() || "",
        travelAllowance: payload.travel_allowance?.toString() || "",
        mealAllowance: payload.meal_allowance?.toString() || "",
        paymentFrequency: payload.payment_frequency || "Monthly",
      });
    } catch (error: unknown) {
      console.error("Error updating labour:", error);

      let errorMessage = "An error occurred while updating the labour.";

      if (typeof error === "object" && error !== null) {
        const potentialError = error as {
          response?: { data?: { error?: string } };
        };
        if (potentialError.response?.data?.error) {
          errorMessage = potentialError.response.data.error;
        } else if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      triggerToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <ProfileSkeleton showAvatar={false} sections={4} />;

  return (
    <>
      <Head>
        <title>Graminate | Employee Database</title>
      </Head>
      <PlatformLayout>
        <Head>
          <title>Employee | {displayName}</title>
        </Head>
        <div className="px-6">
          <Button
            label="Back"
            variant="ghost"
            icon={{ left: "arrow_back" }}
            onClick={() =>
              router.push(`/${router.query.user_id}/labour_database`)
            }
          />
          <div className="pt-4">
            <h1 className="text-2xl font-bold mb-6">{displayName}</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-400">
                Personal Data
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="full-name"
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Input
                  id="dob"
                  label="Date of Birth"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
                <Dropdown
                  items={GENDER}
                  selectedItem={gender}
                  onSelect={(value: string) => setGender(value)}
                  
                  label="Gender"
                  width="full"
                />
                <Input
                  id="role"
                  label="Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
                <Input
                  id="contact-number"
                  label="Contact Number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
                <Input
                  id="aadhar-card"
                  label="Aadhar Card"
                  value={aadharCardNumber}
                  onChange={(e) => setAadharCardNumber(e.target.value)}
                />

                <Input
                  id="address-line-1"
                  label="Address Line 1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                />
                <Input
                  id="address-line-2"
                  label="Address Line 2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 mt-4 gap-4 w-full">
                <Input
                  id="city"
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Input
                  id="state"
                  label="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
                <Input
                  id="postal-code"
                  label="Postal Code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>

            {/* Salary Data Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-400">
                Salary Data
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="base-salary"
                  label="Basic Salary (₹)"
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                />
                <Dropdown
                  label="Payment Frequency"
                  items={["Monthly", "Weekly", "Bi-weekly", "Daily"]}
                  selectedItem={paymentFrequency}
                  onSelect={(value) => setPaymentFrequency(value)}
                  
                  width="full"
                />
                <Input
                  id="bonus-salary"
                  label="Bonus (₹)"
                  type="number"
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                />
                <Input
                  id="overtime-pay-salary"
                  label="Overtime Pay (₹)"
                  type="number"
                  value={overtimePay}
                  onChange={(e) => setOvertimePay(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 mt-4 gap-4 w-full">
                <Input
                  id="housing-allowance-salary"
                  label="Housing Allowance (Optional) (₹)"
                  type="number"
                  value={housingAllowance}
                  onChange={(e) => setHousingAllowance(e.target.value)}
                />
                <Input
                  id="travel-allowance-salary"
                  label="Travel Allowance (Optional) (₹)"
                  type="number"
                  value={travelAllowance}
                  onChange={(e) => setTravelAllowance(e.target.value)}
                />
                <Input
                  id="meal-allowance-salary"
                  label="Meal Allowance (Optional) (₹)"
                  type="number"
                  value={mealAllowance}
                  onChange={(e) => setMealAllowance(e.target.value)}
                />
              </div>
            </div>

            {/* Government Compliance Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-400">
                Government Compliance Data
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="ration-card"
                  label="Ration Card"
                  value={rationCard}
                  onChange={(e) => setRationCard(e.target.value)}
                />

                <Input
                  id="pan-card"
                  label="PAN Card"
                  value={panCard}
                  onChange={(e) => setPanCard(e.target.value)}
                />

                <Input
                  id="driving-license"
                  label="Driving License"
                  value={drivingLicense}
                  onChange={(e) => setDrivingLicense(e.target.value)}
                />

                <Input
                  id="mnrega-job-card"
                  label="MNREGA Job Card Number"
                  value={mnregaJobCardNumber}
                  onChange={(e) => setMnregaJobCardNumber(e.target.value)}
                />

                <Dropdown
                  items={YESNO}
                  selectedItem={disabilityStatus}
                  onSelect={(value: string) => setDisabilityStatus(value)}
                  
                  label="Disability Status"
                  width="full"
                />

                <Input
                  id="epfo"
                  label="EPFO"
                  value={epfo}
                  onChange={(e) => setEpfo(e.target.value)}
                />

                <Input
                  id="esic"
                  label="ESIC"
                  value={esic}
                  onChange={(e) => setEsic(e.target.value)}
                />

                <Dropdown
                  items={YESNO}
                  selectedItem={pmKisan}
                  onSelect={(value: string) => setPmKisan(value)}
                  
                  label="PM-KISAN"
                  width="full"
                />
              </div>
            </div>

            {/* Bank Data Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-400">
                Bank Data
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="bank-account-number"
                  label="Bank Account Number"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                />
                <Input
                  id="ifsc-code"
                  label="IFSC Code"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                />
                <Input
                  id="bank-name"
                  label="Bank Name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
                <Input
                  id="bank-branch"
                  label="Bank Branch"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row mt-6 space-x-4">
              <Button
                label={saving ? "Updating..." : "Update"}
                variant="primary"
                onClick={handleSave}
                disabled={!hasChanges || saving}
              />
              <Button
                label="Cancel"
                variant="secondary"
                onClick={() =>
                  router.push(
                    `/${router.query.user_id}/labour_database`
                  )
                }
              />
            </div>
          </div>
        </div>
      </PlatformLayout>
    </>
  );
};

export default LabourDetails;
