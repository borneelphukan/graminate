import React, { useState, useEffect, useRef } from "react";
import { Button } from "@graminate/ui";

import type { OTPModal } from "@/types/card-props";

const OTPModal = ({ isOpen, email, onValidate, onClose }: OTPModal) => {
  const [otpDigits, setOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (isOpen) {
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const handleInput = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    const newOtpDigits = [...otpDigits];

    if (value.match(/^[0-9]$/)) {
      newOtpDigits[index] = value;
      setOtpDigits(newOtpDigits);

      if (index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (value === "") {
      newOtpDigits[index] = "";
      setOtpDigits(newOtpDigits);
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleValidateOTP = () => {
    const otp = otpDigits.join("");
    onValidate(otp);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="rounded-2xl border border-gray-400/20 shadow-2xl bg-white/20 p-1 w-full max-w-md mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400/20 shadow-sm p-6 md:p-8 overflow-hidden">
          <h2 className="text-xl font-semibold mb-4 text-center text-dark dark:text-light">Enter OTP</h2>
          <p className="text-center text-dark dark:text-light/80">
            An OTP has been sent to <strong>{email}</strong>
          </p>

          <div className="flex justify-center space-x-2 my-6">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el as HTMLInputElement;
                }}
                type="text"
                className="w-10 h-12 text-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-dark dark:text-light rounded-lg text-lg focus:ring-2 focus:ring-green-300 outline-none transition-all"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInput(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
            ))}
          </div>

          <div className="flex justify-center space-x-3 pt-4">
            <Button label="Cancel" variant="secondary" onClick={onClose} />
            <Button label="Validate" variant="primary" onClick={handleValidateOTP} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
