import React, { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import axios, { AxiosError } from "axios";
import { Button, Input, Popup } from "@graminate/ui";
import DefaultLayout from "@/layout/LoginLayout";
import Head from "next/head";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const AuthPage = () => {
  const router = useRouter();
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    text: "",
    variant: "info" as "success" | "error" | "info" | "warning",
  });

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginErrorMessage("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginErrorMessage("Email and password are required.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/login`,
        { email: loginEmail, password: loginPassword },
        {
          headers: {
            "Content-Type": "application/json",
          },
          validateStatus: () => true,
        }
      );

      if (response.status === 401) {
        const serverMessage =
          response.data?.error || response.data?.message;
        
        if (serverMessage === "User does not exist") {
          setModalState({
            isOpen: true,
            title: "User Not Found",
            text: "Email not registered. Please sign up first.",
            variant: "error",
          });
        } else {
          setModalState({
            isOpen: true,
            title: "Login Failed",
            text: "Username doesn't exist or password incorrect",
            variant: "error",
          });
        }
        setIsLoading(false);
        return;
      }

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.data?.message || `Request failed with status ${response.status}`);
      }

      const result = response.data;

      if (result.data?.access_token && result.data?.admin_id) {
        localStorage.setItem("admin_token", result.data.access_token);

        const adminName = `${result.data.first_name} ${result.data.last_name}`;
        localStorage.setItem("admin_name", adminName);

        router.push(`/platform/${result.data.admin_id}`);
      } else {
        throw new Error("Login failed: Incomplete data received from server.");
      }
    } catch (err: unknown) {
      let serverMessage: string | undefined = "An unknown error occurred.";

      if (axios.isAxiosError(err)) {
        serverMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message;
      } else if (err instanceof Error) {
        serverMessage = err.message;
      }

      setModalState({
        isOpen: true,
        title: "Login Failed",
        text: serverMessage || "Invalid email or password.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setModalState({
        isOpen: true,
        title: "Registration Failed",
        text: "Passwords do not match.",
        variant: "error",
      });
      return;
    }
    setIsLoading(true);
    setLoginErrorMessage("");

    const registrationData = {
      first_name: regFirstName,
      last_name: regLastName,
      email: regEmail,
      password: regPassword,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (!response.ok || result.status !== 201) {
        if (response.status === 409 && result.message) {
          throw new Error(result.message);
        }
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      setModalState({
        isOpen: true,
        title: "Registration Successful!",
        text: "You can now log in.",
        variant: "success",
      });
      setIsLoginView(true);
      setRegFirstName("");
      setRegLastName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");
    } catch (err) {
      console.error("Registration error:", err);
      setModalState({
        isOpen: true,
        title: "Registration Failed",
        text: err instanceof Error ? err.message : "An unexpected error occurred during registration.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Graminate | Admin Portal</title>
      </Head>
      <DefaultLayout>
        <div
          className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
          style={{ backgroundImage: "url('/images/cover.png')" }}
        >
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <div className="flex border-b border-gray-300">
              <button
                className={`flex-1 py-2 text-center font-medium ${
                  isLoginView
                    ? "border-b-2 border-green-200 text-green-200"
                    : "text-gray-300 hover:text-green-200"
                }`}
                onClick={() => {
                  setIsLoginView(true);
                  setLoginErrorMessage("");
                }}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 text-center font-medium ${
                  !isLoginView
                    ? "border-b-2 border-green-200 text-green-200"
                    : "text-gray-300 hover:text-green-200"
                }`}
                onClick={() => {
                  setIsLoginView(false);
                  setLoginErrorMessage("");
                }}
              >
                Register
              </button>
            </div>



            {isLoginView && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <h2 className="text-xl font-bold text-center text-gray-700">
                  Admin Login
                </h2>
                <div>
                  <Input
                    id="admin-login-email"
                    label="Email"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    id="admin-login-password"
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {loginErrorMessage && (
                  <p className="text-red-200 text-sm mb-4">
                    {loginErrorMessage}
                  </p>
                )}
                <div>
                  <Button
                    label="Admin Login"
                    className="w-full"
                    variant="primary"
                    type="submit"
                    isLoading={isLoading}
                  />
                </div>
              </form>
            )}

            {!isLoginView && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <h2 className="text-xl font-bold text-center text-gray-700">
                  Admin Registration
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    id="admin-reg-first-name"
                    label="First Name"
                    placeholder="Your First Name"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    disabled={isLoading}
                  />
                  <Input
                    id="admin-reg-last-name"
                    label="Last Name"
                    placeholder="Your Last Name"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Input
                    id="admin-reg-email"
                    label="Email"
                    placeholder="e.g. john.doe@graminate.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Input
                    id="admin-reg-password"
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Input
                    id="admin-reg-confirm-password"
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Button
                    label="Register Admin"
                    className="w-full"
                    variant="primary"
                    type="submit"
                    isLoading={isLoading}
                  />
                </div>
              </form>
            )}
          </div>
        </div>
      </DefaultLayout>

      <Popup
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        title={modalState.title}
        text={modalState.text}
        variant={modalState.variant}
      />
    </>
  );
};

export default AuthPage;
