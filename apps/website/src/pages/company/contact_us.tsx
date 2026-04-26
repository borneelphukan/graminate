import React, { useState } from "react";
import Head from "next/head";
import TextArea from "@/components/ui/TextArea";
import { ContactInfo, ContactErrors } from "@/lib/types";
import DefaultLayout from "@/layout/DefaultLayout";
import { Button, Input, Dropdown } from "@graminate/ui";
import emailjs from "@emailjs/browser";
import Toast from "@/components/ui/Toast";
import { triggerToast } from "@/stores/toast";
import CurrentLocation from "@/components/others/CurrentLocation";
import { services } from "@/lib/constants";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export default function ContactUs() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: "",
    lastName: "",
    email: "",
    service: "",
    message: "",
  });

  const [errors, setErrors] = useState<ContactErrors>({
    firstName: "",
    lastName: "",
    email: "",
    service: "",
    message: "",
  });

  function validateForm(values: ContactInfo): boolean {
    let valid = true;
    const newErrors: ContactErrors = {
      firstName: "",
      lastName: "",
      email: "",
      service: "",
      message: "",
    };

    if (!values.firstName.trim()) {
      newErrors.firstName = "First name is required";
      valid = false;
    }

    if (!values.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      valid = false;
    }

    if (!values.service) {
      newErrors.service = "Please select a service";
      valid = false;
    }

    if (
      !values.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
    ) {
      newErrors.email = "Enter a valid email address";
      valid = false;
    }

    if (!values.message.trim()) {
      newErrors.message = "Enter a message";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!validateForm(contactInfo)) return;

    try {
      await emailjs.send(
        SERVICE_ID!,
        TEMPLATE_ID!,
        {
          ...contactInfo,
          service: contactInfo.service || "Not specified",
        },
        PUBLIC_KEY
      );
      triggerToast(
        "Message sent successfully. A representative will be with you shortly."
      );
      setContactInfo({
        firstName: "",
        lastName: "",
        email: "",
        service: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      triggerToast("Error sending message. Please try again later.");
    }
  }

  return (
    <>
      <Head>
        <title>Graminate | Contact Us</title>
      </Head>

      <DefaultLayout>
        <div className="team-cover">
          <div className="container mx-auto px-10 h-full">
            <div className="flex items-center h-full py-10">
              <div className="max-w-xl text-white">
                <p className="text-2xl md:text-2xl">
                  Need IT consultations or customized software solutions?
                </p>
                <br />
                <p className="text-xl text-gray-300 md:text-xl">
                  Contact our team and turn your ideas into reality.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto flex h-full flex-col p-6">
          <h2 className="text-center text-3xl font-bold lg:text-left">
            Get in Touch
          </h2>
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Contact Form */}
            <div className="w-full lg:w-1/2">
              <form onSubmit={handleSubmit} className="w-full px-6 py-8">
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    id="contact-first-name"
                    label="First Name"
                    placeholder="First Name"
                    value={contactInfo.firstName}
                    onChange={(e) =>
                      setContactInfo({
                        ...contactInfo,
                        firstName: e.target.value,
                      })
                    }
                    error={errors.firstName}
                  />

                  <Input
                    id="contact-last-name"
                    label="Last Name"
                    placeholder="Last Name"
                    value={contactInfo.lastName}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, lastName: e.target.value })
                    }
                    error={errors.lastName}
                  />
                </div>

                <div className="mb-6">
                  <Input
                    id="contact-email"
                    label="Email"
                    placeholder="Email Address"
                    value={contactInfo.email}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, email: e.target.value })
                    }
                    error={errors.email}
                  />

                </div>

                <div className="mb-6">
                  <Dropdown
                    label="Select Service"
                    items={services}
                    selectedItem={contactInfo.service}
                    onSelect={(val: string) =>
                      setContactInfo({ ...contactInfo, service: val })
                    }
                    placeholder="Choose a service"
                    errorMessage={errors.service}
                    width="full"
                  />
                </div>

                <div className="mb-6">
                  <Input
                    id="contact-service-specify"
                    label="If not listed, specify request"
                    placeholder="Specify Service Request"
                    value={contactInfo.service}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, service: e.target.value })
                    }
                  />
                </div>

                <div className="mb-6">
                  <TextArea
                    label="Message"
                    placeholder="Your Message"
                    value={contactInfo.message}
                    onChange={(val: string) =>
                      setContactInfo({ ...contactInfo, message: val })
                    }
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500">{errors.message}</p>
                  )}
                </div>

                <div className="flex justify-center lg:justify-start">
                  <Button
                    label="Send"
                    variant="secondary"
                    onClick={handleSubmit}
                  />
                </div>
              </form>
            </div>

            {/* Google Map */}
            <div className="w-full lg:w-1/2">
              <CurrentLocation />
            </div>
          </div>
        </div>
      </DefaultLayout>

      <Toast />
    </>
  );
}
