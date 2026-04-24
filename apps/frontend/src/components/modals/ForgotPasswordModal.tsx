import { Icon, Button } from "@graminate/ui";
import React, { useState } from "react";
import TextField from "@/components/ui/TextField";
import InfoModal from "./InfoModal";
import axios from "axios";
import { API_BASE_URL } from "@/constants/constants";

type Props = {
  isOpen: boolean;
  closeModal: () => void;
};

const ForgotPasswordModal = ({ isOpen, closeModal }: Props) => {
  const [email, setEmail] = useState("");
  const [infoModalState, setInfoModalState] = useState({
    isOpen: false,
    title: "",
    text: "",
    variant: "info" as "success" | "error" | "info" | "warning",
    onClose: () => {},
  });

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setInfoModalState({
        isOpen: true,
        title: "Error",
        text: "Please enter your email address.",
        variant: "error",
        onClose: () => {},
      });
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/password/forgot`, { email });
      setInfoModalState({
        isOpen: true,
        title: "Email Sent",
        text: "Please check your email for the reset password link.",
        variant: "success",
        onClose: closeModal,
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      const errorMessage = error.response?.data?.error || "Failed to send reset link. Please try again later.";
      setInfoModalState({
        isOpen: true,
        title: "Error",
        text: errorMessage,
        variant: "error",
        onClose: () => {},
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-lg p-8 w-11/12 max-w-md text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Forgot password?
          </h2>
          <p className="text-dark mb-6">
            No worries, we’ll send you reset instructions.
          </p>

          <form onSubmit={handleResetPassword}>
            <div className="mb-4 text-left">
              <TextField
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={setEmail}
                width="large"
              />
            </div>
            <div className="flex flex-col gap-4">
              <Button
                label="Reset Password"
                variant="primary"
                type="submit"
              />
              <Button
                label="Back to Login"
                variant="secondary"
                onClick={closeModal}
              />
            </div>
          </form>
        </div>
      </div>

      <InfoModal
        isOpen={infoModalState.isOpen}
        onClose={() => {
          setInfoModalState((prev) => ({ ...prev, isOpen: false }));
          infoModalState.onClose();
        }}
        title={infoModalState.title}
        text={infoModalState.text}
        variant={infoModalState.variant}
      />
    </>
  );
};

export default ForgotPasswordModal;
