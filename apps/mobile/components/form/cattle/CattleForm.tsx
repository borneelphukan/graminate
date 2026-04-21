import { FormModal } from "@/components/modals/FormModal";
import { Icon } from "@/components/ui/Icon";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  HelperText,
  Menu,
  TextInput,
  TouchableRipple,
  useTheme,
} from "react-native-paper";

const CATTLE_TYPES_OPTIONS = ["Cows", "Buffalo", "Goat"];
const CATTLE_PURPOSE_OPTIONS = [
  "Milk Production",
  "Meat Production",
  "Breeding",
  "Ploughing/Transport",
];

export type CattleFormData = {
  cattle_name: string;
  cattle_type: string;
  number_of_animals: string;
  purpose: string;
};

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: CattleFormData) => Promise<void>;
  cattleToEdit?: any;
};

const PaperFormDropdown = ({
  label,
  items,
  selectedValue,
  onSelect,
  error,
  disabled = false,
  leftIcon,
}: any) => {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  return (
    <View style={styles.dropdownContainer}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <TouchableRipple
            onPress={() => !disabled && setVisible(true)}
            disabled={disabled}
          >
            <View pointerEvents="none">
              <TextInput
                mode="outlined"
                label={label}
                value={selectedValue}
                editable={false}
                left={
                  leftIcon && (
                    <TextInput.Icon
                      icon={() => (
                        <Icon
                          type={leftIcon as any}
                          size={18}
                          color={theme.colors.onSurfaceVariant}
                        />
                      )}
                    />
                  )
                }
                right={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"chevron-down" as any}
                        size={16}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                  />
                }
                error={!!error}
                disabled={disabled}
              />
            </View>
          </TouchableRipple>
        }
      >
        {items.map((item: string) => (
          <Menu.Item
            key={item}
            title={item}
            onPress={() => {
              onSelect(item);
              setVisible(false);
            }}
          />
        ))}
      </Menu>
      {error && <HelperText type="error">{error}</HelperText>}
    </View>
  );
};

const CattleForm = ({ isVisible, onClose, onSubmit, cattleToEdit }: Props) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<CattleFormData>({
    cattle_name: "",
    cattle_type: "",
    number_of_animals: "",
    purpose: "",
  });
  const [errors, setErrors] = useState<Partial<CattleFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      if (cattleToEdit) {
        setFormData({
          cattle_name: cattleToEdit.cattle_name || "",
          cattle_type: cattleToEdit.cattle_type || "",
          number_of_animals: String(cattleToEdit.number_of_animals || ""),
          purpose: cattleToEdit.purpose || "",
        });
      } else {
        setFormData({
          cattle_name: "",
          cattle_type: "",
          number_of_animals: "",
          purpose: "",
        });
      }
      setErrors({});
    }
  }, [isVisible, cattleToEdit]);

  const validate = () => {
    const newErrors: Partial<CattleFormData> = {};
    if (!formData.cattle_name.trim()) newErrors.cattle_name = "Name is required";
    if (!formData.number_of_animals.trim())
      newErrors.number_of_animals = "Quantity is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isVisible={isVisible}
      onClose={onClose}
      title={cattleToEdit ? "Edit Herd" : "Add New Herd"}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitButtonText={cattleToEdit ? "Update Herd" : "Add Herd"}
    >
      <View style={styles.form}>
        <TextInput
          mode="outlined"
          label="Cattle / Herd Name"
          value={formData.cattle_name}
          onChangeText={(val) => setFormData({ ...formData, cattle_name: val })}
          error={!!errors.cattle_name}
          left={
            <TextInput.Icon
              icon={() => (
                <Icon
                  type={"tag-outline" as any}
                  size={18}
                  color={theme.colors.onSurfaceVariant}
                />
              )}
            />
          }
        />
        {errors.cattle_name && (
          <HelperText type="error">{errors.cattle_name}</HelperText>
        )}

        <TextInput
          mode="outlined"
          label="Number of Animals"
          keyboardType="numeric"
          value={formData.number_of_animals}
          onChangeText={(val) =>
            setFormData({ ...formData, number_of_animals: val })
          }
          error={!!errors.number_of_animals}
          left={
            <TextInput.Icon
              icon={() => (
                <Icon
                  type={"numeric" as any}
                  size={18}
                  color={theme.colors.onSurfaceVariant}
                />
              )}
            />
          }
        />
        {errors.number_of_animals && (
          <HelperText type="error">{errors.number_of_animals}</HelperText>
        )}

        <PaperFormDropdown
          label="Cattle Type"
          items={CATTLE_TYPES_OPTIONS}
          selectedValue={formData.cattle_type}
          onSelect={(val: string) =>
            setFormData({ ...formData, cattle_type: val })
          }
          leftIcon="cow"
        />

        <PaperFormDropdown
          label="Purpose"
          items={CATTLE_PURPOSE_OPTIONS}
          selectedValue={formData.purpose}
          onSelect={(val: string) => setFormData({ ...formData, purpose: val })}
          leftIcon="target"
        />
      </View>
    </FormModal>
  );
};

const styles = StyleSheet.create({
  form: { gap: 8 },
  dropdownContainer: { marginBottom: 4 },
});

export default CattleForm;
