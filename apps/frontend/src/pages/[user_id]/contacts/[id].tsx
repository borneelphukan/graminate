import { Dropdown, Icon, Button, Input } from "@graminate/ui";
import PlatformLayout from "@/layout/PlatformLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { triggerToast } from "@/stores/toast";
import { CONTACT_TYPES } from "@/constants/options";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";
import Head from "next/head";
import axiosInstance from "@/lib/utils/axiosInstance";
import Swal from "sweetalert2";

type Contact = {
  contact_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  type?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
};

type Form = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  type: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

const initialFormState: Form = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  type: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
};

type ApiUser = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  business_name?: string;
  imageUrl?: string | null;
  language?: string;
  time_format?: string;
  type?: string;
  sub_type?: string[];
};

type ApiUserResponse = {
  status: number;
  data: {
    user: ApiUser;
  };
};

const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.[0]?.toUpperCase() || "";
  const last = lastName?.[0]?.toUpperCase() || "";
  if (first && last) return `${first}${last}`;
  if (first) return first;
  if (last) return last;
  return "?";
};

const ContactDetails = () => {
  const router = useRouter();
  const { user_id, data } = router.query;

  const [contact, setContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<Form>(initialFormState);
  const [initialFormData, setInitialFormData] =
    useState<Form>(initialFormState);
  const [initialFullName, setInitialFullName] = useState("");
  const [avatarInitials, setAvatarInitials] = useState("?");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isLoading = !contact;

  useEffect(() => {
    if (data) {
      try {
        const parsedContact: Contact = JSON.parse(data as string);
        setContact(parsedContact);

        const newFormValues: Form = {
          firstName: parsedContact.first_name || "",
          lastName: parsedContact.last_name || "",
          email: parsedContact.email || "",
          phoneNumber: parsedContact.phone_number || "",
          type: parsedContact.type || "",
          addressLine1: parsedContact.address_line_1 || "",
          addressLine2: parsedContact.address_line_2 || "",
          city: parsedContact.city || "",
          state: parsedContact.state || "",
          postalCode: parsedContact.postal_code || "",
        };
        setFormData(newFormValues);
        setInitialFormData(newFormValues);
        const fullName =
          `${newFormValues.firstName} ${newFormValues.lastName}`.trim();
        setInitialFullName(fullName);
        setAvatarInitials(
          getInitials(newFormValues.firstName, newFormValues.lastName)
        );
      } catch {
        triggerToast("Invalid contact data format", "error");
      }
    }
  }, [data]);

  useEffect(() => {
    const fetchLoggedInUserEmail = async () => {
      if (user_id && typeof user_id === "string") {
        try {
          const response = await axiosInstance.get<ApiUserResponse>(
            `/user/${user_id}`
          );
          if (
            response.data &&
            response.data.data &&
            response.data.data.user &&
            response.data.data.user.email
          ) {
          } else {
            triggerToast("Could not retrieve your email address.");
          }
        } catch {
          triggerToast("Error retrieving your email information.", "error");
        }
      }
    };
    fetchLoggedInUserEmail();
  }, [user_id]);

  const handleInputChange = (field: keyof Form, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!contact) return;
    setSaving(true);

    const payload = {
      id: contact.contact_id,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone_number: formData.phoneNumber,
      type: formData.type,
      address_line_1: formData.addressLine1,
      address_line_2: formData.addressLine2,
      city: formData.city,
      state: formData.state,
      postal_code: formData.postalCode,
    };

    try {
      const response = await axiosInstance.put<{ contact: Contact }>(
        "/contacts/update",
        payload
      );
      triggerToast("Contact updated", "success");

      const updatedContact = response.data.contact;
      setContact(updatedContact);

      const updatedFormValues: Form = {
        firstName: updatedContact.first_name || "",
        lastName: updatedContact.last_name || "",
        email: updatedContact.email || "",
        phoneNumber: updatedContact.phone_number || "",
        type: updatedContact.type || "",
        addressLine1: updatedContact.address_line_1 || "",
        addressLine2: updatedContact.address_line_2 || "",
        city: updatedContact.city || "",
        state: updatedContact.state || "",
        postalCode: updatedContact.postal_code || "",
      };
      setFormData(updatedFormValues);
      setInitialFormData(updatedFormValues);
      const fullName =
        `${updatedFormValues.firstName} ${updatedFormValues.lastName}`.trim();
      setInitialFullName(fullName);
      setAvatarInitials(
        getInitials(updatedFormValues.firstName, updatedFormValues.lastName)
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while updating the contact.";
      triggerToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!contact) {
      triggerToast("No contact selected to delete.");
      return;
    }

    const result = await Swal.fire({
      title: "Delete Contact",
      text: `Are you sure you want to delete ${
        initialFullName || "this contact"
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
      await axiosInstance.delete(`/contacts/delete/${contact.contact_id}`);
      triggerToast("Contact deleted successfully", "success");
      router.push(`/${user_id}/crm?view=contacts`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the contact.";
      triggerToast(errorMessage, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleCallContact = () => {
    const phoneNumber = initialFormData.phoneNumber;
    if (
      phoneNumber &&
      typeof phoneNumber === "string" &&
      phoneNumber.trim() !== ""
    ) {
      window.location.href = `tel:${phoneNumber.trim()}`;
    } else {
      triggerToast("No valid phone number provided for this contact.");
    }
  };

  const handleEmailContact = () => {
    const recipientEmail = initialFormData.email;
    if (
      !recipientEmail ||
      typeof recipientEmail !== "string" ||
      recipientEmail.trim() === ""
    ) {
      triggerToast("Contact does not have a valid email address.");
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
        <title>Contact | {initialFullName || "Details"}</title>
      </Head>
      <div className="px-4 sm:px-4 lg:px-4">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 relative">
          <div className="flex flex-col sm:flex-row items-center mb-8">
            <div
              className="mr-0 sm:mr-6 mb-4 sm:mb-0 w-24 h-24 sm:w-28 sm:h-28 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-semibold flex-shrink-0 overflow-hidden"
            >
              {avatarInitials}
            </div>

            <div className="flex-grow text-center sm:text-left">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-0">
                  {initialFullName || "Contact Details"}
                </h1>
                <Button
                  label="All Contacts"
                  variant="secondary"
                  icon={{ left: "chevron_left" }}
                  onClick={() =>
                    router.push(`/${user_id}/crm?view=contacts`)
                  }
                />
              </div>

              {(initialFormData.phoneNumber ||
                initialFormData.email ||
                contact) && (
                <div className="flex items-center justify-center sm:justify-start mt-4 space-x-3">
                  {initialFormData.phoneNumber && (
                    <button
                      onClick={handleCallContact}
                      title="Call contact"
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
                      onClick={handleEmailContact}
                      title="Email contact"
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
                  {contact && (
                    <button
                      onClick={handleDeleteContact}
                      title="Delete contact"
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
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Input
                  id="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                />
                <Input
                  id="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
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
                <Dropdown
                  items={CONTACT_TYPES}
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
                router.push(`/${user_id}/crm?view=contacts`)
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

export default ContactDetails;
