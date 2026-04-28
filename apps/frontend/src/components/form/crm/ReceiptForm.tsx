import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { Dropdown, Button, Input, Icon } from "@graminate/ui";
import axiosInstance from "@/lib/utils/axiosInstance";
import { triggerToast } from "@/stores/toast";
import Loader from "@/components/ui/Loader";
import { useClickOutside } from "@/hooks/forms";

type Item = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

const initialReceiptItem: Item = {
  description: "",
  quantity: 1,
  rate: 0,
  amount: 0,
};

type SaleRecordForDropdown = {
  sales_id: number;
  sales_name?: string;
  sales_date: string;
  items_sold: string[];
  occupation?: string;
  invoice_created: boolean;
  prices_per_unit?: number[];
};

type ReceiptFormProps = {
  userId: string | string[] | undefined;
  onClose: () => void;
};

const ReceiptForm = ({ userId, onClose }: ReceiptFormProps) => {
  const router = useRouter();
  const { saleId: querySaleId } = router.query;

  const panelRef = useRef<HTMLDivElement>(null);

  const handleCloseAnimation = useCallback(() => {
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const handleClose = useCallback(() => {
    handleCloseAnimation();
  }, [handleCloseAnimation]);

  useClickOutside(panelRef, handleClose);

  const [receiptsValues, setReceiptsValues] = useState({
    title: "",
    receiptNumber: "",
    billTo: "",
    dueDate: "",
    paymentTerms: "",
    notes: "",
    tax: "0",
    discount: "0",
    shipping: "0",
    billToAddressLine1: "",
    billToAddressLine2: "",
    billToCity: "",
    billToState: "",
    billToPostalCode: "",
    billToCountry: "",
    items: [initialReceiptItem],
    linked_sale_id: querySaleId ? Number(querySaleId) : null,
  });
  const [receiptErrors, setReceiptErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [allSalesForUser, setAllSalesForUser] = useState<
    SaleRecordForDropdown[]
  >([]);
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const [selectedSaleForDisplay, setSelectedSaleForDisplay] = useState<
    string | null
  >(null);

  const fetchSalesAndPreselect = useCallback(async () => {
    if (!userId) return;
    setIsLoadingSales(true);
    try {
      const response = await axiosInstance.get<{
        sales: SaleRecordForDropdown[];
      }>(`/sales/user/${userId}`);
      const fetchedSales = response.data.sales || [];
      setAllSalesForUser(fetchedSales);

      if (querySaleId) {
        const preselectedSale = fetchedSales.find(
          (s) => s.sales_id === Number(querySaleId)
        );
        if (preselectedSale) {
          if (preselectedSale.invoice_created) {
            triggerToast(
              "Warning: This sale already has an invoice. Linking will be verified by the server."
            );
          }
          const displayLabel =
            preselectedSale.sales_name ||
            `Sale #${preselectedSale.sales_id} (${new Date(
              preselectedSale.sales_date
            ).toLocaleDateString()})`;
          setSelectedSaleForDisplay(displayLabel);

          const saleTitle = preselectedSale.sales_name
            ? `Invoice for ${preselectedSale.sales_name}`
            : `Invoice for Sale #${preselectedSale.sales_id}`;
          const billToName = preselectedSale.occupation || "Customer";

          const itemsFromSale = preselectedSale.items_sold.map(
            (itemDesc, index) => ({
              description: itemDesc,
              quantity: 1,
              rate:
                preselectedSale.prices_per_unit &&
                preselectedSale.prices_per_unit[index]
                  ? preselectedSale.prices_per_unit[index]
                  : 0,
              amount:
                preselectedSale.prices_per_unit &&
                preselectedSale.prices_per_unit[index]
                  ? 1 * preselectedSale.prices_per_unit[index]
                  : 0,
            })
          );

          setReceiptsValues((prev) => ({
            ...prev,
            linked_sale_id: preselectedSale.sales_id,
            title: prev.title || saleTitle,
            billTo: prev.billTo || billToName,
            items:
              itemsFromSale.length > 0 ? itemsFromSale : [initialReceiptItem],
          }));
        } else {
          setReceiptsValues((prev) => ({ ...prev, linked_sale_id: null }));
          setSelectedSaleForDisplay(null);
        }
      }
    } catch (error) {
      console.error("Error fetching sales for dropdown:", error);
      triggerToast("Could not load sales data.", "error");
    } finally {
      setIsLoadingSales(false);
    }
  }, [userId, querySaleId]);

  useEffect(() => {
    fetchSalesAndPreselect();
  }, [fetchSalesAndPreselect]);

  const validateReceiptForm = () => {
    const errors = { title: "", billTo: "", dueDate: "" };
    let isValid = true;
    if (!receiptsValues.title.trim()) {
      errors.title = "Title is required.";
      isValid = false;
    }
    if (!receiptsValues.billTo.trim()) {
      errors.billTo = "Bill To (Customer) is required.";
      isValid = false;
    }
    if (!receiptsValues.dueDate.trim()) {
      errors.dueDate = "Due Date is required.";
      isValid = false;
    }
    setReceiptErrors(errors);
    return isValid;
  };

  const handleSubmitReceipts = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!validateReceiptForm()) {
      triggerToast("Please fill all required invoice fields.", "error");
      return;
    }
    setIsLoading(true);
    const payload = {
      user_id: Number(userId),
      title: receiptsValues.title,
      bill_to: receiptsValues.billTo,
      due_date: receiptsValues.dueDate,
      receipt_number: receiptsValues.receiptNumber || null,
      payment_terms: receiptsValues.paymentTerms || null,
      notes: receiptsValues.notes || null,
      tax: parseFloat(receiptsValues.tax) || 0,
      discount: parseFloat(receiptsValues.discount) || 0,
      shipping: parseFloat(receiptsValues.shipping) || 0,
      bill_to_address_line1: receiptsValues.billToAddressLine1 || null,
      bill_to_address_line2: receiptsValues.billToAddressLine2 || null,
      bill_to_city: receiptsValues.billToCity || null,
      bill_to_state: receiptsValues.billToState || null,
      bill_to_postal_code: receiptsValues.billToPostalCode || null,
      bill_to_country: receiptsValues.billToCountry || null,
      items: receiptsValues.items
        .map(({ description, quantity, rate }) => ({
          description,
          quantity: Number(quantity) || 0,
          rate: Number(rate) || 0,
        }))
        .filter((item) => item.description && item.description.trim() !== ""),
      linked_sale_id: receiptsValues.linked_sale_id,
    };
    try {
      await axiosInstance.post("/receipts/add", payload);
      setReceiptsValues({
        title: "",
        receiptNumber: "",
        billTo: "",
        dueDate: "",
        paymentTerms: "",
        notes: "",
        tax: "0",
        discount: "0",
        shipping: "0",
        billToAddressLine1: "",
        billToAddressLine2: "",
        billToCity: "",
        billToState: "",
        billToPostalCode: "",
        billToCountry: "",
        items: [initialReceiptItem],
        linked_sale_id: null,
      });
      setSelectedSaleForDisplay(null);
      setReceiptErrors({
        title: "",
        billTo: "",
        dueDate: "",
      });
      triggerToast("Invoice added successfully!", "success");
      onClose();
      const { pathname, query } = router;
      delete query.saleId;
      router.replace({ pathname, query }, undefined, { shallow: true });
      window.location.reload();
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response: { data: { error: string } } }).response.data
              .error
          : error instanceof Error
          ? error.message
          : "An unexpected error occurred";
      triggerToast(`Error: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaleSelection = (selectedSaleIdString: string) => {
    if (selectedSaleIdString === "None" || !selectedSaleIdString) {
      setReceiptsValues((prev) => ({
        ...prev,
        linked_sale_id: null,
        title: "",
        billTo: "",
        items: [initialReceiptItem],
      }));
      setSelectedSaleForDisplay(null);
      return;
    }

    const selectedSaleId = Number(selectedSaleIdString);
    const sale = allSalesForUser.find((s) => s.sales_id === selectedSaleId);
    if (sale) {
      if (sale.invoice_created) {
        triggerToast(
          "Warning: This sale already has an invoice. Linking will be verified by the server."
        );
      }
      const displayLabel =
        sale.sales_name ||
        `Sale #${sale.sales_id} (${new Date(
          sale.sales_date
        ).toLocaleDateString()})`;
      setSelectedSaleForDisplay(displayLabel);

      const saleTitle = sale.sales_name
        ? `Invoice for ${sale.sales_name}`
        : `Invoice for Sale #${sale.sales_id}`;
      const billToName = sale.occupation || "Customer";
      const itemsFromSale = sale.items_sold.map((itemDesc, index) => ({
        description: itemDesc,
        quantity: 1,
        rate:
          sale.prices_per_unit && sale.prices_per_unit[index]
            ? sale.prices_per_unit[index]
            : 0,
        amount:
          sale.prices_per_unit && sale.prices_per_unit[index]
            ? 1 * sale.prices_per_unit[index]
            : 0,
      }));

      setReceiptsValues((prev) => ({
        ...prev,
        linked_sale_id: sale.sales_id,
        title: saleTitle,
        billTo: billToName,
        items: itemsFromSale.length > 0 ? itemsFromSale : [initialReceiptItem],
      }));
    }
  };

  const salesDropdownItems = useMemo(() => {
    const items = [
      { value: "None", label: "None (No Linked Sale)" },
      ...allSalesForUser
        .filter(
          (sale) =>
            !sale.invoice_created ||
            sale.sales_id === receiptsValues.linked_sale_id
        )
        .map((sale) => ({
          value: sale.sales_id.toString(),
          label: sale.sales_name
            ? `${sale.sales_name} (ID: ${sale.sales_id}, ${new Date(
                sale.sales_date
              ).toLocaleDateString()})`
            : `Sale #${sale.sales_id} (${new Date(
                sale.sales_date
              ).toLocaleDateString()})`,
        })),
    ];
    if (
      receiptsValues.linked_sale_id &&
      !items.find(
        (item) => item.value === receiptsValues.linked_sale_id?.toString()
      )
    ) {
      const currentLinkedSale = allSalesForUser.find(
        (s) => s.sales_id === receiptsValues.linked_sale_id
      );
      if (currentLinkedSale) {
        items.push({
          value: currentLinkedSale.sales_id.toString(),
          label: currentLinkedSale.sales_name
            ? `${currentLinkedSale.sales_name} (ID: ${
                currentLinkedSale.sales_id
              }, ${new Date(
                currentLinkedSale.sales_date
              ).toLocaleDateString()})`
            : `Sale #${currentLinkedSale.sales_id} (${new Date(
                currentLinkedSale.sales_date
              ).toLocaleDateString()})`,
        });
      }
    }
    return items;
  }, [allSalesForUser, receiptsValues.linked_sale_id]);

  const updateItem = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {
    const newItems = [...receiptsValues.items];
    const item = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "rate") {
      item.amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    }
    newItems[index] = item;
    setReceiptsValues({ ...receiptsValues, items: newItems });
  };

  const addItem = () => {
    setReceiptsValues({
      ...receiptsValues,
      items: [...receiptsValues.items, { ...initialReceiptItem }],
    });
  };

  const removeItem = (index: number) => {
    if (receiptsValues.items.length === 1) return;
    const newItems = receiptsValues.items.filter((_, i) => i !== index);
    setReceiptsValues({ ...receiptsValues, items: newItems });
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md transition-opacity duration-300">
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full md:w-[640px] bg-white dark:bg-gray-700 overflow-hidden flex flex-col"
      >
        <div className="px-8 py-6 flex justify-between items-center border-b border-gray-400 dark:border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Invoice
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              Generate a professional invoice for your customer.
            </p>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-gray-500 dark:hover:bg-gray-600 text-dark dark:text-light transition-all"
            onClick={handleClose}
            aria-label="Close panel"
          >
            <Icon type={"close"} className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
          <form
            className="space-y-8"
            onSubmit={handleSubmitReceipts}
            noValidate
          >
            {/* Invoice Details Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    id="title"
                    label="Invoice Title"
                    placeholder="e.g. Invoice for Customer"
                    value={receiptsValues.title}
                    onChange={(e) =>
                      setReceiptsValues({ ...receiptsValues, title: e.target.value })
                    }
                    error={receiptErrors.title}
                    required
                  />
                  <Input
                    id="receiptNumber"
                    label="Invoice Number"
                    placeholder="e.g. INV-2024-001"
                    value={receiptsValues.receiptNumber}
                    onChange={(e) =>
                      setReceiptsValues({
                        ...receiptsValues,
                        receiptNumber: e.target.value,
                      })
                    }
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    id="billTo"
                    label="Bill To (Customer Name)"
                    placeholder="e.g. Acme Corp"
                    value={receiptsValues.billTo}
                    onChange={(e) =>
                      setReceiptsValues({ ...receiptsValues, billTo: e.target.value })
                    }
                    error={receiptErrors.billTo}
                    required
                  />
                  <Input
                    id="dueDate"
                    type="date"
                    label="Due Date"
                    placeholder="YYYY-MM-DD"
                    value={receiptsValues.dueDate}
                    onChange={(e) =>
                      setReceiptsValues({ ...receiptsValues, dueDate: e.target.value })
                    }
                    error={receiptErrors.dueDate}
                    required
                  />
                </div>

                {isLoadingSales ? (
                  <div className="flex flex-col">
                    <label className="block mb-1 text-sm font-medium text-dark dark:text-gray-300">
                      Link to Sale (Optional)
                    </label>
                    <div className="p-2.5 border border-gray-400 dark:border-gray-200 rounded-md flex items-center justify-center h-[42px]">
                      <Loader />
                    </div>
                  </div>
                ) : (
                  <Dropdown
                    label="Link to Sale (Optional)"
                    items={salesDropdownItems.map((item) => item.label)}
                    selectedItem={selectedSaleForDisplay || "None (No Linked Sale)"}
                    onSelect={(selectedLabel) => {
                      const selectedItem = salesDropdownItems.find(
                        (item) => item.label === selectedLabel
                      );
                      handleSaleSelection(selectedItem ? selectedItem.value : "None");
                    }}
                    placeholder="Select a sale to link"
                    width="full"
                  />
                )}

                <Input
                  id="paymentTerms"
                  label="Payment Terms"
                  placeholder="e.g. Net 30, Due on Receipt"
                  value={receiptsValues.paymentTerms}
                  onChange={(e) =>
                    setReceiptsValues({
                      ...receiptsValues,
                      paymentTerms: e.target.value,
                    })
                  }
                />
              </div>
            </section>

            {/* Line Items Section */}
            <section className="space-y-6 pt-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-dark dark:text-light">Invoice Items</h3>
                </div>
                <Button 
                  label="Add Item" 
                  variant="secondary" 
                  icon={{ left: "add" }}
                  size="sm"
                  onClick={addItem}
                />
              </div>

              <div className="space-y-4">
                {receiptsValues.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-12 sm:col-span-5">
                      <Input
                        id={`item-description-${index}`}
                        label="Description"
                        placeholder="Item name/description"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <Input
                        id={`item-quantity-${index}`}
                        type="number"
                        label="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <Input
                        id={`item-rate-${index}`}
                        type="number"
                        label="Rate"
                        value={item.rate}
                        onChange={(e) => updateItem(index, "rate", e.target.value)}
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-right py-2">
                      <p className="text-xs text-dark dark:text-light mb-1">Amount</p>
                      <p className="font-semibold text-gray-900 dark:text-white">₹{item.amount.toFixed(2)}</p>
                    </div>
                    <div className="col-span-1 text-right">
                      <button 
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        disabled={receiptsValues.items.length === 1}
                      >
                        <Icon type="delete" size="md" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Billing Address Section */}
            <section className="space-y-6 pt-4 pb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Address (Optional)</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="billToAddressLine1"
                  label="Address Line 1"
                  placeholder="Customer's street address"
                  value={receiptsValues.billToAddressLine1}
                  onChange={(e) =>
                    setReceiptsValues({
                      ...receiptsValues,
                      billToAddressLine1: e.target.value,
                    })
                  }
                />
                <Input
                  id="billToAddressLine2"
                  label="Address Line 2"
                  placeholder="Apartment, suite, etc."
                  value={receiptsValues.billToAddressLine2}
                  onChange={(e) =>
                    setReceiptsValues({
                      ...receiptsValues,
                      billToAddressLine2: e.target.value,
                    })
                  }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    id="billToCity"
                    label="City"
                    placeholder="Customer's city"
                    value={receiptsValues.billToCity}
                    onChange={(e) =>
                      setReceiptsValues({
                        ...receiptsValues,
                        billToCity: e.target.value,
                      })
                    }
                  />
                  <Input
                    id="billToState"
                    label="State"
                    placeholder="Customer's state"
                    value={receiptsValues.billToState}
                    onChange={(e) =>
                      setReceiptsValues({
                        ...receiptsValues,
                        billToState: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    id="billToPostalCode"
                    label="Postal Code"
                    placeholder="Customer's postal code"
                    value={receiptsValues.billToPostalCode}
                    onChange={(e) =>
                      setReceiptsValues({
                        ...receiptsValues,
                        billToPostalCode: e.target.value,
                      })
                    }
                  />
                  <Input
                    id="billToCountry"
                    label="Country"
                    placeholder="Customer's country"
                    value={receiptsValues.billToCountry}
                    onChange={(e) =>
                      setReceiptsValues({
                        ...receiptsValues,
                        billToCountry: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Action Footer */}
        <div className="p-8 border-t border-gray-400 dark:border-gray-200 grid grid-cols-2 gap-4 w-full">
          <Button
            label="Cancel"
            variant="secondary"
            onClick={handleClose}
            className="w-full"
            disabled={isLoading || isLoadingSales}
          />
          <Button
            label={isLoading || isLoadingSales ? "Creating..." : "Create Invoice"}
            variant="primary"
            type="submit"
            onClick={handleSubmitReceipts}
            className="w-full"
            disabled={isLoading || isLoadingSales}
          />
        </div>
      </div>
    </div>
  );
};

export default ReceiptForm;
