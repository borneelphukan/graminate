import { Dropdown, Icon, Button, Input } from "@graminate/ui";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { triggerToast } from "@/stores/toast";
import { COMPANY_TYPES, INDUSTRY_OPTIONS } from "@/constants/options";
import axiosInstance from "@/lib/utils/axiosInstance";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";
import Swal from "sweetalert2";

type Company = {
  company_id: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone_number?: string;
  type?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  website?: string;
  industry?: string;
};

type Form = {
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  type: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  website: string;
  industry: string;
};

const initialFormState: Form = {
  companyName: "",
  contactPerson: "",
  email: "",
  phoneNumber: "",
  type: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  website: "",
  industry: "",
};

const getInitials = (companyName?: string): string => {
  if (!companyName) return "?";
  const words = companyName.trim().split(/\s+/);
  if (words.length === 0 || words[0] === "") return "?";
  if (words.length === 1) {
    return words[0][0]?.toUpperCase() || "?";
  }
  const first = words[0][0]?.toUpperCase() || "";
  const last = words[words.length - 1][0]?.toUpperCase() || "";
  if (first && last) return `${first}${last}`;
  if (first) return first;
  return "?";
};

const CompanyDetails = () => {
  const router = useRouter();
  const { user_id, data } = router.query;

  const [company, setCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<Form>(initialFormState);
  const [initialFormData, setInitialFormData] =
    useState<Form>(initialFormState);
  const [initialCompanyName, setInitialCompanyName] = useState("");
  const [avatarInitials, setAvatarInitials] = useState("?");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isLoading = !company;

  useEffect(() => {
    if (data) {
      try {
        const parsedCompany: Company = JSON.parse(data as string);
        setCompany(parsedCompany);

        const newFormValues: Form = {
          companyName: parsedCompany.company_name || "",
          contactPerson: parsedCompany.contact_person || "",
          email: parsedCompany.email || "",
          phoneNumber: parsedCompany.phone_number || "",
          type: parsedCompany.type || "",
          addressLine1: parsedCompany.address_line_1 || "",
          addressLine2: parsedCompany.address_line_2 || "",
          city: parsedCompany.city || "",
          state: parsedCompany.state || "",
          postalCode: parsedCompany.postal_code || "",
          website: parsedCompany.website || "",
          industry: parsedCompany.industry || "",
        };
        setFormData(newFormValues);
        setInitialFormData(newFormValues);
        setInitialCompanyName(newFormValues.companyName);
        setAvatarInitials(getInitials(newFormValues.companyName));
      } catch {
        triggerToast("Invalid company data format", "error");
      }
    }
  }, [data]);

  const handleInputChange = (field: keyof Form, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);

    const payload = {
      id: company.company_id,
      company_name: formData.companyName,
      contact_person: formData.contactPerson,
      email: formData.email,
      phone_number: formData.phoneNumber,
      address_line_1: formData.addressLine1,
      address_line_2: formData.addressLine2,
      city: formData.city,
      state: formData.state,
      postal_code: formData.postalCode,
      type: formData.type,
      website: formData.website,
      industry: formData.industry,
    };

    try {
      const response = await axiosInstance.put<{ company: Company }>(
        "/companies/update",
        payload
      );
      triggerToast("Company updated successfully", "success");

      const updatedCompany = response.data.company;
      setCompany(updatedCompany);

      const updatedFormValues: Form = {
        companyName: updatedCompany.company_name || "",
        contactPerson: updatedCompany.contact_person || "",
        email: updatedCompany.email || "",
        phoneNumber: updatedCompany.phone_number || "",
        type: updatedCompany.type || "",
        addressLine1: updatedCompany.address_line_1 || "",
        addressLine2: updatedCompany.address_line_2 || "",
        city: updatedCompany.city || "",
        state: updatedCompany.state || "",
        postalCode: updatedCompany.postal_code || "",
        website: updatedCompany.website || "",
        industry: updatedCompany.industry || "",
      };
      setFormData(updatedFormValues);
      setInitialFormData(updatedFormValues);
      setInitialCompanyName(updatedFormValues.companyName);
      setAvatarInitials(getInitials(updatedFormValues.companyName));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while updating the company.";
      triggerToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!company) {
      triggerToast("No company selected to delete.");
      return;
    }

    const result = await Swal.fire({
      title: "Delete Company",
      text: `Are you sure you want to delete ${
        initialCompanyName || "this company"
      }? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#04ad79",
      cancelButtonColor: "#bbbbbc",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (!result.isConfirmed) {
      return;
    }

    setDeleting(true);
    try {
      await axiosInstance.delete(`/companies/delete/${company.company_id}`);
      triggerToast("Company deleted successfully", "success");
      router.push(`/${user_id}/crm?view=companies`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the company.";
      triggerToast(errorMessage, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleCallCompany = () => {
    const phoneNumber = initialFormData.phoneNumber;
    if (
      phoneNumber &&
      typeof phoneNumber === "string" &&
      phoneNumber.trim() !== ""
    ) {
      window.location.href = `tel:${phoneNumber.trim()}`;
    } else {
      triggerToast("No valid phone number provided for this company.");
    }
  };

  const handleEmailCompany = () => {
    const recipientEmail = initialFormData.email;
    if (
      !recipientEmail ||
      typeof recipientEmail !== "string" ||
      recipientEmail.trim() === ""
    ) {
      triggerToast("Company does not have a valid email address.");
      return;
    }
    const mailtoLink = `mailto:${recipientEmail.trim()}`;
    try {
      window.location.href = mailtoLink;
    } catch {
      triggerToast("Could not open email client.", "error");
    }
  };

  if (isLoading) return <ProfileSkeleton />;

  const hasChanges =
    Object.keys(formData).some(
      (key) =>
        formData[key as keyof Form] !== initialFormData[key as keyof Form]
    );

  return (
    <PlatformLayout>
      <Head>
        <title>Company | {initialCompanyName || "Details"}</title>
      </Head>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 relative">
          <div className="flex flex-col sm:flex-row items-center mb-8">
            <div
              className="mr-0 sm:mr-6 mb-4 sm:mb-0 w-24 h-24 sm:w-28 sm:h-28 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-semibold flex-shrink-0 overflow-hidden"
            >
              {avatarInitials}
            </div>

            <div className="flex-grow text-center sm:text-left">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
                  {initialCompanyName || "Company Details"}
                </h1>
                <Button
                  label="All Companies"
                  variant="secondary"
                  icon={{ left: "arrow_back" }}
                  onClick={() =>
                    router.push(`/${user_id}/crm?view=companies`)
                  }
                />
              </div>

              {(initialFormData.phoneNumber ||
                initialFormData.email ||
                company) && (
                <div className="flex items-center justify-center sm:justify-start mt-4 space-x-3">
                  {initialFormData.phoneNumber && (
                    <button
                      onClick={handleCallCompany}
                      title="Call company"
                      className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 dark:focus-visible:ring-offset-gray-800 rounded-lg p-1"
                    >
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors duration-150 ease-in-out">
                        <Icon
                          type={"phone"}
                          className="w-6 h-6 text-slate-600 dark:text-slate-300"
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Call
                      </span>
                    </button>
                  )}

                  {initialFormData.email && (
                    <button
                      onClick={handleEmailCompany}
                      title="Email company"
                      className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 dark:focus-visible:ring-offset-gray-800 rounded-lg p-1"
                    >
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors duration-150 ease-in-out">
                        <Icon
                          type={"mail"}
                          className="w-6 h-6 text-slate-600 dark:text-slate-300"
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Email
                      </span>
                    </button>
                  )}
                  {company && (
                    <button
                      onClick={handleDeleteCompany}
                      title="Delete company"
                      disabled={deleting}
                      className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 dark:focus-visible:ring-offset-gray-800 rounded-lg p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors duration-150 ease-in-out">
                        <Icon
                          type={"delete"}
                          className="w-6 h-6 text-slate-600 dark:text-slate-300"
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Delete
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4 pb-1 border-b border-gray-400 dark:border-gray-700 text-dark dark:text-light">
                Company Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Input
                  id="companyName"
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                />
                <Input
                  id="contactPerson"
                  label="Contact Person"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                <Input
                  id="phoneNumber"
                  label="Phone Number"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                />
                <Input
                  id="website"
                  label="Website"
                  placeholder="e.g. https://company.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                />
                <Dropdown
                  items={INDUSTRY_OPTIONS}
                  selectedItem={formData.industry}
                  onSelect={(value: string) =>
                    handleInputChange("industry", value)
                  }
                  
                  label="Industry"
                  width="full"
                />
                <Dropdown
                  items={COMPANY_TYPES}
                  selectedItem={formData.type}
                  onSelect={(value: string) => handleInputChange("type", value)}
                  
                  label="Type"
                  width="full"
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4 pb-1 border-b border-gray-400 dark:border-gray-700 text-dark dark:text-light">
                Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Input
                  id="addressLine1"
                  label="Address Line 1"
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                />
                <Input
                  id="addressLine2"
                  label="Address Line 2"
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                />
                <Input
                  id="city"
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
                <Input
                  id="state"
                  label="State / Province"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />
                <Input
                  id="postalCode"
                  label="Postal / Zip Code"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end mt-10 pt-6 border-t border-gray-400 dark:border-gray-700 space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() =>
                router.push(`/${user_id}/crm?view=companies`)
              }
            />
            <Button
              label={saving ? "Saving..." : "Save Changes"}
              variant="primary"
              onClick={handleSave}
              disabled={!hasChanges || saving}
            />
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
};

export default CompanyDetails;
