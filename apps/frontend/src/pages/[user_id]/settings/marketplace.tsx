import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import PlatformLayout from "@/layout/PlatformLayout";
import SettingsBar from "@/components/layout/SettingsBar";
import { Button, Input, Icon, Popup } from "@graminate/ui";
import axiosInstance from "@/lib/utils/axiosInstance";
import Loader from "@/components/ui/Loader";

type CardDetails = {
  bank_id: number;
  cardholder_name: string;
  card_number: string;
  expiry_date: string;
  card_type: string | null;
};

const MarketplaceSettings = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const userId = Array.isArray(user_id) ? user_id[0] : user_id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingDetails, setExistingDetails] = useState<CardDetails | null>(null);

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cardType, setCardType] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    variant: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    text: "",
    variant: "info",
  });

  const fetchCardDetails = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/marketplace/bank/${userId}`);
      const data = res.data?.data;
      if (data) {
        setExistingDetails(data);
        setCardholderName(data.cardholder_name);
        setCardNumber(formatCardNumberDisplay(data.card_number));
        setExpiryDate(data.expiry_date);
        setCardType(data.card_type || "");
      }
    } catch {
      setExistingDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCardDetails();
  }, [fetchCardDetails]);

  const formatCardNumberDisplay = (value: string) => {
    const raw = value.replace(/\D/g, "").substring(0, 16);
    const groups = raw.match(/.{1,4}/g);
    return groups ? groups.join(" ") : raw;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumberDisplay(e.target.value);
    setCardNumber(formatted);

    // Detect card type basic logic
    const firstDigit = formatted.charAt(0);
    if (firstDigit === "4") setCardType("Visa");
    else if (firstDigit === "5") setCardType("Mastercard");
    else if (firstDigit === "3") setCardType("American Express");
    else if (firstDigit === "6") setCardType("Rupay");
    else setCardType("");
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length >= 2) {
      val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
    }
    setExpiryDate(val.substring(0, 5));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const rawNumber = cardNumber.replace(/\s/g, "");

    if (!cardholderName.trim()) e.cardholderName = "Cardholder name is required.";
    if (rawNumber.length < 13 || rawNumber.length > 19) {
      e.cardNumber = "Invalid card number length.";
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      e.expiryDate = "Expiry must be MM/YY format.";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !userId) return;
    setIsSaving(true);
    try {
      await axiosInstance.post("/marketplace/bank/save", {
        user_id: Number(userId),
        cardholder_name: cardholderName.trim(),
        card_number: cardNumber.replace(/\s/g, ""),
        expiry_date: expiryDate.trim(),
        card_type: cardType.trim() || "Generic",
      });
      setPopup({
        isOpen: true,
        title: "Success",
        text: "Card details updated successfully.",
        variant: "success",
      });
      setIsEditing(false);
      fetchCardDetails();
    } catch {
      setPopup({
        isOpen: true,
        title: "Error",
        text: "Failed to update payment details.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const maskCardNumber = (num: string) => {
    const clean = num.replace(/\s/g, "");
    if (clean.length < 4) return clean;
    return `•••• •••• •••• ${clean.slice(-4)}`;
  };

  const showForm = !existingDetails || isEditing;

  return (
    <>
      <Head>
        <title>Marketplace Settings | Graminate</title>
      </Head>
      <PlatformLayout>
        <div className="flex min-h-screen">
          <SettingsBar />

          <main className="flex-1 px-6 md:px-12 py-6 space-y-6">
            <h1 className="pb-2 font-bold text-xl md:text-2xl text-dark dark:text-light">
              Marketplace Payment
            </h1>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : showForm ? (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl border border-gray-400 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-6">
                  <Icon type="credit_card" className="text-xl! text-blue-600 dark:text-blue-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-dark dark:text-light opacity-80">
                    Card Details
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      id="cardholder-name"
                      label="Cardholder Name"
                      placeholder="e.g. JOHN DOE"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                      error={errors.cardholderName}
                    />
                  </div>

                  <div className="md:col-span-2 relative">
                    <Input
                      id="card-number"
                      label="Card Number"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      error={errors.cardNumber}
                    />
                    {cardType && (
                      <div className="absolute top-8 right-3 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {cardType}
                      </div>
                    )}
                  </div>

                  <Input
                    id="expiry-date"
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    error={errors.expiryDate}
                  />
                  
                  <Input
                    id="cvv-dummy"
                    label="CVV (Not Stored)"
                    placeholder="•••"
                    type="password"
                    maxLength={4}
                    disabled
                    value="***"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-400 dark:border-gray-600">
                  {isEditing && (
                    <Button
                      label="Cancel"
                      variant="secondary"
                      onClick={() => {
                        setIsEditing(false);
                        if (existingDetails) {
                          setCardholderName(existingDetails.cardholder_name);
                          setCardNumber(formatCardNumberDisplay(existingDetails.card_number));
                          setExpiryDate(existingDetails.expiry_date);
                          setCardType(existingDetails.card_type || "");
                        }
                        setErrors({});
                      }}
                    />
                  )}
                  <Button
                    label={isSaving ? "Saving..." : existingDetails ? "Update Card" : "Save Card"}
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving}
                    icon={{ left: "lock" }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl border border-gray-400 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Icon type="credit_card" className="text-xl! text-blue-600 dark:text-blue-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-dark dark:text-light opacity-80">
                      Saved Card Payment
                    </h2>
                  </div>
                  <Button
                    label="Edit"
                    variant="outline"
                    size="sm"
                    icon={{ left: "edit" }}
                    onClick={() => setIsEditing(true)}
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-6 rounded-xl shadow-lg relative overflow-hidden max-w-md mx-auto md:mx-0">
                  <div className="absolute top-0 right-0 p-4 opacity-30 text-5xl font-bold italic">
                    {existingDetails.card_type === "Generic" ? "Card" : existingDetails.card_type}
                  </div>
                  
                  <div className="mt-8">
                    <Icon type="contactless" className="text-3xl mb-4 rotate-90" />
                    <p className="text-xl md:text-2xl font-mono tracking-widest mb-6">
                      {maskCardNumber(existingDetails.card_number)}
                    </p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase opacity-70 mb-0.5">Cardholder</p>
                      <p className="font-medium tracking-wider uppercase truncate max-w-[200px]">
                        {existingDetails.cardholder_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase opacity-70 mb-0.5">Expires</p>
                      <p className="font-medium font-mono">{existingDetails.expiry_date}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-400 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Icon type="security" className="text-lg!" />
                    <span className="text-xs">Your information is stored for demonstration processing only.</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </PlatformLayout>
      <Popup
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        text={popup.text}
        variant={popup.variant}
      />
    </>
  );
};

export default MarketplaceSettings;
