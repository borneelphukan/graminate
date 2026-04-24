import { Icon, TextArea, Button } from "@graminate/ui";
import React, { useState, useEffect, useRef } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  action: string;
  userName: string;
  isLoading?: boolean;
};

const ReasonModal = ({ isOpen, onClose, onSubmit, action, userName, isLoading = false }: Props) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Please provide a reason for this action.");
      return;
    }
    if (trimmed.length > 120) {
      setError("Reason must be 120 characters or less.");
      return;
    }
    onSubmit(trimmed);
  };

  if (!isOpen) return null;

  const actionLabel =
    action === "Revoke Paid Access"
      ? "Revoke Paid Access"
      : action === "Allow Basic Access"
      ? "Allow Basic Access"
      : action === "Allow Pro Access"
      ? "Allow Pro Access"
      : action;

  const actionColor =
    action === "Revoke Paid Access"
      ? "text-red-500"
      : "text-green-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rounded-2xl border border-gray-400/20 shadow-2xl bg-white/20 p-1 w-full max-w-lg">
        <div
          ref={modalRef}
          className="bg-white dark:bg-gray-800 w-full p-6 rounded-xl shadow-sm animate-in fade-in zoom-in-95 duration-200"
        >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl text-dark dark:text-light font-semibold">
            Confirm Action
          </h3>
          <button
            type="button"
            className="text-dark hover:bg-gray-500 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon type={"close"} className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-5">
          <p className="text-sm text-dark dark:text-light">
            You are about to{" "}
            <span className={`font-bold ${actionColor}`}>
              {actionLabel}
            </span>{" "}
            for user{" "}
            <span className="font-semibold">{userName}</span>.
          </p>
        </div>

        <div className="mb-5">
          <TextArea
            id="action-reason"
            label="Reason for this action"
            placeholder="Enter a reason (max 120 characters)..."
            value={reason}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length <= 120) {
                setReason(val);
                setError("");
              }
            }}
            maxLength={120}
            error={error || undefined}
            hint={`${reason.length}/120 characters`}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-400 dark:border-gray-700">
          <Button label="Cancel" variant="secondary" onClick={onClose} disabled={isLoading} />
          <Button
            label={isLoading ? "Submitting..." : "Submit"}
            variant="primary"
            onClick={handleSubmit}
            disabled={reason.trim().length === 0 || isLoading}
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default ReasonModal;
