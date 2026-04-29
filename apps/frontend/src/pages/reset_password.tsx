import { Button, Input, Popup } from "@graminate/ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import HomeNavbar from "@/components/layout/Navbar/HomeNavbar";
import axios from "axios";
import { API_BASE_URL } from "@/constants/constants";

const ResetPasswordPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    variant: "success" | "error" | "info" | "warning";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    text: "",
    variant: "info",
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email") || "";
    const tokenParam = urlParams.get("token") || "";

    if (!emailParam || !tokenParam) {
      setPopup({
        isOpen: true,
        title: "Invalid Link",
        text: "This password reset link is invalid or expired.",
        variant: "error",
        onConfirm: () => router.push("/"),
      });
      return;
    }

    setEmail(emailParam);
    setToken(tokenParam);
  }, [router]);

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setPopup({
        isOpen: true,
        title: "Error",
        text: "Passwords do not match.",
        variant: "error",
      });
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      setPopup({
        isOpen: true,
        title: "Weak Password",
        text: "Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.",
        variant: "warning",
      });
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/password/reset`, {
        email,
        token,
        newPassword,
      });

      setPopup({
        isOpen: true,
        title: "Success",
        text: "Password successfully reset. You can now log in.",
        variant: "success",
        onConfirm: () => router.push("/"),
      });
    } catch (error: unknown) {
      console.error(error);
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Something went wrong. Please try again later.";
      setPopup({
        isOpen: true,
        title: "Error",
        text: errorMessage,
        variant: "error",
      });
    }
  };

  return (
    <>
      <Head>
        <title>Graminate: Reset Password</title>
      </Head>
      <HomeNavbar />
      <div className="min-h-screen flex items-center justify-center dark:bg-dark bg-light">
        <div className="bg-white shadow-md rounded p-6 w-96">
          <h2 className="text-2xl text-dark dark:text-light font-semibold mb-4 text-center">
            Reset Account Password
          </h2>
          <p className="text-dark dark:text-light mb-6 text-center">
            Enter your new password twice to remember it well
          </p>
          <div className="mb-4 text-left">
            <Input
              id="new-password"
              label="New Password"
              placeholder="Enter New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="mb-4 text-left">
            <Input
              id="confirm-password"
              label="Confirm Password"
              placeholder="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Button
              label="Reset Password"
              variant="primary"
              onClick={handleResetPassword}
            />
          </div>
        </div>
      </div>
      <Popup
        isOpen={popup.isOpen}
        onClose={() => {
          if (popup.onConfirm) popup.onConfirm();
          setPopup((prev: any) => ({ ...prev, isOpen: false }));
        }}
        title={popup.title}
        text={popup.text}
        variant={popup.variant}
      />
    </>
  );
};

export default ResetPasswordPage;
