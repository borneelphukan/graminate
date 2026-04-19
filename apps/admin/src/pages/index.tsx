import React, { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import axios, { AxiosError } from "axios";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import DefaultLayout from "@/layout/LoginLayout";
import Head from "next/head";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const AuthPage = () => {
  const router = useRouter();
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/login`,
        { email: loginEmail, password: loginPassword },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;

      if (result.data?.access_token && result.data?.admin_id) {
        localStorage.setItem("admin_token", result.data.access_token);

        const adminName = `${result.data.first_name} ${result.data.last_name}`;
        localStorage.setItem("admin_name", adminName);

        router.push(`/platform/${result.data.admin_id}`);
      } else {
        throw new Error("Login failed: Incomplete data received from server.");
      }
    } catch (err) {
      console.error("Login error:", err);

      let errorMessage = "An unexpected error occurred during login.";

      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{ message?: string }>;
        if (axiosError.response) {
          errorMessage =
            axiosError.response.data?.message ||
            `Request failed with status code ${axiosError.response.status}`;
        } else if (axiosError.request) {
          errorMessage =
            "No response received from server. Check network connection.";
        } else {
          errorMessage = axiosError.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

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

      setSuccessMessage("Registration successful! Please log in.");
      setIsLoginView(true);
      setRegFirstName("");
      setRegLastName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof Error) {
        setError(
          err.message || "An unexpected error occurred during registration."
        );
      } else {
        setError("An unexpected error occurred during registration.");
      }
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
                  setError(null);
                  setSuccessMessage(null);
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
                  setError(null);
                  setSuccessMessage(null);
                }}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-100 bg-red-300 border border-red-100 rounded">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="p-3 text-sm text-green-700 bg-green-300 border border-green-200 rounded">
                {successMessage}
              </div>
            )}

            {isLoginView && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <h2 className="text-xl font-bold text-center text-gray-700">
                  Admin Login
                </h2>
                <div>
                  <TextField
                    label="Email"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(val) => setLoginEmail(val)}
                    width="large"
                  />
                </div>
                <div>
                  <TextField
                    label="Password"
                    placeholder="Enter your password"
                    password
                    value={loginPassword}
                    onChange={(val) => setLoginPassword(val)}
                    width="large"
                    isDisabled={isLoading}
                  />
                </div>
                <div>
                  <Button
                    text="Admin Login"
                    width="large"
                    style="primary"
                    type="submit"
                    isDisabled={isLoading}
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
                  <TextField
                    label="First Name"
                    placeholder="Your First Name"
                    value={regFirstName}
                    onChange={(val) => setRegFirstName(val)}
                    isDisabled={isLoading}
                    width="large"
                  />
                  <TextField
                    label="Last Name"
                    placeholder="Your Last Name"
                    value={regLastName}
                    onChange={(val) => setRegLastName(val)}
                    isDisabled={isLoading}
                    width="large"
                  />
                </div>
                <div>
                  <TextField
                    label="Email"
                    placeholder="e.g. john.doe@graminate.com"
                    value={regEmail}
                    onChange={(val) => setRegEmail(val)}
                    isDisabled={isLoading}
                    width="large"
                  />
                </div>
                <div>
                  <TextField
                    label="Password"
                    placeholder="Enter your password"
                    password
                    value={regPassword}
                    onChange={(val) => setRegPassword(val)}
                    width="large"
                    isDisabled={isLoading}
                  />
                </div>
                <div>
                  <TextField
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    password
                    value={regConfirmPassword}
                    onChange={(val) => setRegConfirmPassword(val)}
                    width="large"
                    isDisabled={isLoading}
                  />
                </div>
                <div>
                  <Button
                    text="Register Admin"
                    width="large"
                    style="primary"
                    type="submit"
                    isDisabled={isLoading}
                  />
                </div>
              </form>
            )}
          </div>
        </div>
      </DefaultLayout>
    </>
  );
};

export default AuthPage;
