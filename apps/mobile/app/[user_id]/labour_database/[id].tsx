import { Icon } from "@/components/ui/Icon";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Menu,
  Text,
  TextInput,
} from "@/components/ui";

type LabourData = {
  labour_id: number;
  full_name: string;
  date_of_birth: string;
  gender: string;
  role: string;
  contact_number: string;
  aadhar_card_number: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  ration_card?: string;
  pan_card?: string;
  driving_license?: string;
  mnrega_job_card_number?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  bank_branch?: string;
  disability_status?: boolean;
  epfo?: string;
  esic?: string;
  pm_kisan?: boolean;
  base_salary?: number;
  bonus?: number;
  overtime_pay?: number;
  housing_allowance?: number;
  travel_allowance?: number;
  meal_allowance?: number;
  payment_frequency?: string;
  created_at: string;
};

const GENDER = ["Male", "Female", "Other"];
const YESNO = ["Yes", "No"];
const PAYMENT_FREQUENCY = ["Monthly", "Weekly", "Bi-weekly", "Daily"];

const LabourDetailScreen = () => {
  const router = useRouter();
  const { user_id, id } = useLocalSearchParams<{ user_id: string; id: string }>();

  const [labour, setLabour] = useState<LabourData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [aadharCardNumber, setAadharCardNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [rationCard, setRationCard] = useState("");
  const [panCard, setPanCard] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [mnregaJobCardNumber, setMnregaJobCardNumber] = useState("");
  const [disabilityStatus, setDisabilityStatus] = useState("No");
  const [epfo, setEpfo] = useState("");
  const [esic, setEsic] = useState("");
  const [pmKisan, setPmKisan] = useState("No");

  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");

  const [baseSalary, setBaseSalary] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("Monthly");
  const [bonus, setBonus] = useState("");
  const [overtimePay, setOvertimePay] = useState("");
  const [housingAllowance, setHousingAllowance] = useState("");
  const [travelAllowance, setTravelAllowance] = useState("");
  const [mealAllowance, setMealAllowance] = useState("");

  const [initialData, setInitialData] = useState<Record<string, any>>({});

  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [disabilityMenuVisible, setDisabilityMenuVisible] = useState(false);
  const [pmKisanMenuVisible, setPmKisanMenuVisible] = useState(false);
  const [paymentFreqMenuVisible, setPaymentFreqMenuVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user_id || !id) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/labour/${encodeURIComponent(user_id)}`);
        const labours = response.data.labours || [];
        const found = labours.find((l: LabourData) => l.labour_id === Number(id));
        if (found) {
          setLabour(found);
          setFullName(found.full_name || "");
          setDateOfBirth(found.date_of_birth ? found.date_of_birth.split("T")[0] : "");
          setGender(found.gender || "");
          setRole(found.role || "");
          setContactNumber(found.contact_number || "");
          setAadharCardNumber(found.aadhar_card_number || "");
          setAddressLine1(found.address_line_1 || "");
          setAddressLine2(found.address_line_2 || "");
          setCity(found.city || "");
          setState(found.state || "");
          setPostalCode(found.postal_code || "");
          setRationCard(found.ration_card ?? "");
          setPanCard(found.pan_card ?? "");
          setDrivingLicense(found.driving_license ?? "");
          setMnregaJobCardNumber(found.mnrega_job_card_number ?? "");
          setDisabilityStatus(found.disability_status ? "Yes" : "No");
          setEpfo(found.epfo ?? "");
          setEsic(found.esic ?? "");
          setPmKisan(found.pm_kisan ? "Yes" : "No");
          setBankAccountNumber(found.bank_account_number ?? "");
          setIfscCode(found.ifsc_code ?? "");
          setBankName(found.bank_name ?? "");
          setBankBranch(found.bank_branch ?? "");
          setBaseSalary(found.base_salary?.toString() || "");
          setPaymentFrequency(found.payment_frequency || "Monthly");
          setBonus(found.bonus?.toString() || "");
          setOvertimePay(found.overtime_pay?.toString() || "");
          setHousingAllowance(found.housing_allowance?.toString() || "");
          setTravelAllowance(found.travel_allowance?.toString() || "");
          setMealAllowance(found.meal_allowance?.toString() || "");

          setInitialData({
            fullName: found.full_name || "",
            dateOfBirth: found.date_of_birth ? found.date_of_birth.split("T")[0] : "",
            gender: found.gender || "",
            role: found.role || "",
            contactNumber: found.contact_number || "",
            aadharCardNumber: found.aadhar_card_number || "",
            addressLine1: found.address_line_1 || "",
            addressLine2: found.address_line_2 || "",
            city: found.city || "",
            state: found.state || "",
            postalCode: found.postal_code || "",
            rationCard: found.ration_card ?? "",
            panCard: found.pan_card ?? "",
            drivingLicense: found.driving_license ?? "",
            mnregaJobCardNumber: found.mnrega_job_card_number ?? "",
            disabilityStatus: found.disability_status ? "Yes" : "No",
            epfo: found.epfo ?? "",
            esic: found.esic ?? "",
            pmKisan: found.pm_kisan ? "Yes" : "No",
            bankAccountNumber: found.bank_account_number ?? "",
            ifscCode: found.ifsc_code ?? "",
            bankName: found.bank_name ?? "",
            bankBranch: found.bank_branch ?? "",
            baseSalary: found.base_salary?.toString() || "",
            paymentFrequency: found.payment_frequency || "Monthly",
            bonus: found.bonus?.toString() || "",
            overtimePay: found.overtime_pay?.toString() || "",
            housingAllowance: found.housing_allowance?.toString() || "",
            travelAllowance: found.travel_allowance?.toString() || "",
            mealAllowance: found.meal_allowance?.toString() || "",
          });
        }
      } catch (error) {
        console.error("Error fetching labour data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user_id, id]);

  const hasChanges =
    fullName !== initialData.fullName ||
    dateOfBirth !== initialData.dateOfBirth ||
    gender !== initialData.gender ||
    role !== initialData.role ||
    contactNumber !== initialData.contactNumber ||
    aadharCardNumber !== initialData.aadharCardNumber ||
    addressLine1 !== initialData.addressLine1 ||
    addressLine2 !== initialData.addressLine2 ||
    city !== initialData.city ||
    state !== initialData.state ||
    postalCode !== initialData.postalCode ||
    rationCard !== initialData.rationCard ||
    panCard !== initialData.panCard ||
    drivingLicense !== initialData.drivingLicense ||
    mnregaJobCardNumber !== initialData.mnregaJobCardNumber ||
    bankAccountNumber !== initialData.bankAccountNumber ||
    ifscCode !== initialData.ifscCode ||
    bankName !== initialData.bankName ||
    bankBranch !== initialData.bankBranch ||
    disabilityStatus !== initialData.disabilityStatus ||
    epfo !== initialData.epfo ||
    esic !== initialData.esic ||
    pmKisan !== initialData.pmKisan ||
    baseSalary !== initialData.baseSalary ||
    paymentFrequency !== initialData.paymentFrequency ||
    bonus !== initialData.bonus ||
    overtimePay !== initialData.overtimePay ||
    housingAllowance !== initialData.housingAllowance ||
    travelAllowance !== initialData.travelAllowance ||
    mealAllowance !== initialData.mealAllowance;

  const handleSave = async () => {
    if (!labour) return;
    setSaving(true);
    try {
      const payload = {
        labour_id: labour.labour_id,
        full_name: fullName,
        date_of_birth: dateOfBirth,
        gender: gender,
        contact_number: contactNumber,
        aadhar_card_number: aadharCardNumber,
        address_line_1: addressLine1,
        address_line_2: addressLine2,
        city: city,
        state: state,
        postal_code: postalCode,
        ration_card: rationCard,
        pan_card: panCard,
        driving_license: drivingLicense,
        mnrega_job_card_number: mnregaJobCardNumber,
        disability_status: disabilityStatus === "Yes",
        role: role,
        epfo: epfo,
        esic: esic,
        pm_kisan: pmKisan === "Yes",
        bank_account_number: bankAccountNumber,
        ifsc_code: ifscCode,
        bank_name: bankName,
        bank_branch: bankBranch,
        base_salary: parseFloat(baseSalary) || 0,
        bonus: parseFloat(bonus) || 0,
        overtime_pay: parseFloat(overtimePay) || 0,
        housing_allowance: parseFloat(housingAllowance) || 0,
        travel_allowance: parseFloat(travelAllowance) || 0,
        meal_allowance: parseFloat(mealAllowance) || 0,
        payment_frequency: paymentFrequency,
      };
      await axiosInstance.put("/labour/update", payload);
      Alert.alert("Success", "Employee updated successfully!");
      setInitialData({
        fullName, dateOfBirth, gender, role, contactNumber, aadharCardNumber,
        addressLine1, addressLine2, city, state, postalCode,
        rationCard, panCard, drivingLicense, mnregaJobCardNumber,
        disabilityStatus, epfo, esic, pmKisan,
        bankAccountNumber, ifscCode, bankName, bankBranch,
        baseSalary, paymentFrequency, bonus, overtimePay,
        housingAllowance, travelAllowance, mealAllowance,
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Failed to update employee.";
      Alert.alert("Error", errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PlatformLayout>
        <Appbar.Header>
          <Appbar.Action
            icon={() => (
              <Icon type={"chevron-left" as any} size={22} className="text-dark dark:text-light" />
            )}
            onPress={() => router.back()}
          />
          <Appbar.Content title="Employee Details" />
        </Appbar.Header>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout>
      <Appbar.Header>
        <Appbar.Action
          icon={() => (
            <Icon type={"chevron-left" as any} size={22} className="text-dark dark:text-light" />
          )}
          onPress={() => router.back()}
        />
        <Appbar.Content title={labour?.full_name || "Employee Details"} />
        <Button
          mode="contained"
          onPress={handleSave}
          disabled={!hasChanges || saving}
          className="!px-3 !py-1.5 mr-2"
        >
          {saving ? "Updating..." : "Update"}
        </Button>
      </Appbar.Header>

      <ScrollView className="bg-white dark:bg-dark flex-1" contentContainerClassName="pb-20">
        <View className="p-4 gap-4">
          {/* Personal Data */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="w-1 h-6 bg-green-500 rounded-full" />
              <Text className="font-bold text-lg text-dark dark:text-light">Personal Data</Text>
            </View>
            <View className="gap-3">
              <TextInput mode="outlined" label="Full Name" value={fullName} onChangeText={setFullName} />
              <TextInput mode="outlined" label="Date of Birth" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" />
              <View className="relative z-20">
                <Menu
                  visible={genderMenuVisible}
                  onDismiss={() => setGenderMenuVisible(false)}
                  anchor={
                    <TextInput mode="outlined" label="Gender" value={gender} editable={false} onFocus={() => setGenderMenuVisible(true)}
                      right={<TextInput.Icon icon="chevron-down" onPress={() => setGenderMenuVisible(true)} />} />
                  }
                >
                  {GENDER.map((g) => (
                    <Menu.Item key={g} title={g} onPress={() => { setGender(g); setGenderMenuVisible(false); }} />
                  ))}
                </Menu>
              </View>
              <TextInput mode="outlined" label="Role" value={role} onChangeText={setRole} />
              <TextInput mode="outlined" label="Contact Number" value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" />
              <TextInput mode="outlined" label="Aadhar Card" value={aadharCardNumber} onChangeText={setAadharCardNumber} />
              <TextInput mode="outlined" label="Address Line 1" value={addressLine1} onChangeText={setAddressLine1} />
              <TextInput mode="outlined" label="Address Line 2" value={addressLine2} onChangeText={setAddressLine2} />
              <TextInput mode="outlined" label="City" value={city} onChangeText={setCity} />
              <TextInput mode="outlined" label="State" value={state} onChangeText={setState} />
              <TextInput mode="outlined" label="Postal Code" value={postalCode} onChangeText={setPostalCode} />
            </View>
          </View>

          {/* Salary Data */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="w-1 h-6 bg-amber-500 rounded-full" />
              <Text className="font-bold text-lg text-dark dark:text-light">Salary Data</Text>
            </View>
            <View className="gap-3">
              <TextInput mode="outlined" label="Basic Salary (₹)" value={baseSalary} onChangeText={setBaseSalary} keyboardType="numeric" />
              <View className="relative z-20">
                <Menu
                  visible={paymentFreqMenuVisible}
                  onDismiss={() => setPaymentFreqMenuVisible(false)}
                  anchor={
                    <TextInput mode="outlined" label="Payment Frequency" value={paymentFrequency} editable={false} onFocus={() => setPaymentFreqMenuVisible(true)}
                      right={<TextInput.Icon icon="chevron-down" onPress={() => setPaymentFreqMenuVisible(true)} />} />
                  }
                >
                  {PAYMENT_FREQUENCY.map((f) => (
                    <Menu.Item key={f} title={f} onPress={() => { setPaymentFrequency(f); setPaymentFreqMenuVisible(false); }} />
                  ))}
                </Menu>
              </View>
              <TextInput mode="outlined" label="Bonus (₹)" value={bonus} onChangeText={setBonus} keyboardType="numeric" />
              <TextInput mode="outlined" label="Overtime Pay (₹)" value={overtimePay} onChangeText={setOvertimePay} keyboardType="numeric" />
              <TextInput mode="outlined" label="Housing Allowance (₹)" value={housingAllowance} onChangeText={setHousingAllowance} keyboardType="numeric" />
              <TextInput mode="outlined" label="Travel Allowance (₹)" value={travelAllowance} onChangeText={setTravelAllowance} keyboardType="numeric" />
              <TextInput mode="outlined" label="Meal Allowance (₹)" value={mealAllowance} onChangeText={setMealAllowance} keyboardType="numeric" />
            </View>
          </View>

          {/* Government Compliance */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="w-1 h-6 bg-blue-500 rounded-full" />
              <Text className="font-bold text-lg text-dark dark:text-light">Government Compliance</Text>
            </View>
            <View className="gap-3">
              <TextInput mode="outlined" label="Ration Card" value={rationCard} onChangeText={setRationCard} />
              <TextInput mode="outlined" label="PAN Card" value={panCard} onChangeText={setPanCard} />
              <TextInput mode="outlined" label="Driving License" value={drivingLicense} onChangeText={setDrivingLicense} />
              <TextInput mode="outlined" label="MNREGA Job Card" value={mnregaJobCardNumber} onChangeText={setMnregaJobCardNumber} />
              <View className="relative z-20">
                <Menu
                  visible={disabilityMenuVisible}
                  onDismiss={() => setDisabilityMenuVisible(false)}
                  anchor={
                    <TextInput mode="outlined" label="Disability Status" value={disabilityStatus} editable={false} onFocus={() => setDisabilityMenuVisible(true)}
                      right={<TextInput.Icon icon="chevron-down" onPress={() => setDisabilityMenuVisible(true)} />} />
                  }
                >
                  {YESNO.map((y) => (
                    <Menu.Item key={y} title={y} onPress={() => { setDisabilityStatus(y); setDisabilityMenuVisible(false); }} />
                  ))}
                </Menu>
              </View>
              <TextInput mode="outlined" label="EPFO" value={epfo} onChangeText={setEpfo} />
              <TextInput mode="outlined" label="ESIC" value={esic} onChangeText={setEsic} />
              <View className="relative z-20">
                <Menu
                  visible={pmKisanMenuVisible}
                  onDismiss={() => setPmKisanMenuVisible(false)}
                  anchor={
                    <TextInput mode="outlined" label="PM-KISAN" value={pmKisan} editable={false} onFocus={() => setPmKisanMenuVisible(true)}
                      right={<TextInput.Icon icon="chevron-down" onPress={() => setPmKisanMenuVisible(true)} />} />
                  }
                >
                  {YESNO.map((y) => (
                    <Menu.Item key={y} title={y} onPress={() => { setPmKisan(y); setPmKisanMenuVisible(false); }} />
                  ))}
                </Menu>
              </View>
            </View>
          </View>

          {/* Bank Data */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="w-1 h-6 bg-purple-500 rounded-full" />
              <Text className="font-bold text-lg text-dark dark:text-light">Bank Data</Text>
            </View>
            <View className="gap-3">
              <TextInput mode="outlined" label="Bank Account Number" value={bankAccountNumber} onChangeText={setBankAccountNumber} />
              <TextInput mode="outlined" label="IFSC Code" value={ifscCode} onChangeText={setIfscCode} />
              <TextInput mode="outlined" label="Bank Name" value={bankName} onChangeText={setBankName} />
              <TextInput mode="outlined" label="Bank Branch" value={bankBranch} onChangeText={setBankBranch} />
            </View>
          </View>
        </View>
      </ScrollView>
    </PlatformLayout>
  );
};

export default LabourDetailScreen;
