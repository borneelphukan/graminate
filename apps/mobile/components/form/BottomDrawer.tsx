import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  Alert, 
  StyleSheet, 
  View, 
  FlatList, 
  ActivityIndicator, 
  Animated, 
  Dimensions, 
  Platform, 
  Pressable, 
  ScrollView 
} from "react-native";
import { 
  PanGestureHandler, 
  State 
} from "react-native-gesture-handler";
import {
  HelperText,
  Menu,
  TextInput,
  TouchableRipple,
  Modal,
  Portal,
  Surface,
  List,
  Checkbox,
  Chip,
  Button,
  Text,
  IconButton,
  Appbar,
  Calendar,
} from "@/components/ui";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Icon } from "@/components/ui/Icon";
import { DateData } from "react-native-calendars";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type FieldType =
  | "text"
  | "dropdown"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "autocomplete"
  | "checkbox"
  | "tags"
  | "dynamic-list";

export type FormField = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  halfWidth?: boolean;
  icon?: string;
  items?: string[];
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  disabled?: boolean;
  subFields?: FormField[]; // For dynamic-list
};

type BottomDrawerProps = {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  fields?: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (data: any) => Promise<void>;
  submitButtonText?: string;
  isSubmitting?: boolean;
  children?: React.ReactNode;
};

const PaperFormDropdown = ({
  label,
  items,
  selectedValue,
  onSelect,
  error,
  leftIcon,
  disabled,
}: {
  label: string;
  items: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  error?: string;
  leftIcon?: string;
  disabled?: boolean;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <View className="mb-1">
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
                disabled={disabled}
                left={
                  leftIcon && (
                    <TextInput.Icon
                      icon={() => (
                        <Icon
                          type={leftIcon as any}
                          size={18}
                          className="text-gray-400 dark:text-gray-500"
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
                        className="text-gray-400 dark:text-gray-500"
                      />
                    )}
                  />
                }
                error={!!error}
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
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    </View>
  );
};

const PaperFormAutocomplete = ({
  label,
  value,
  onSelect,
  items,
  error,
  leftIcon,
  placeholder,
  isLoading,
}: {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  items: string[];
  error?: string;
  leftIcon?: string;
  placeholder?: string;
  isLoading?: boolean;
}) => {
  const [visible, setVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (value) {
      setSuggestions(
        items.filter((item) => item.toLowerCase().includes(value.toLowerCase()))
      );
    } else {
      setSuggestions(items);
    }
  }, [value, items]);

  return (
    <View className="relative mb-1">
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        placeholder={placeholder}
        onChangeText={(text: string) => {
          onSelect(text);
          setVisible(true);
        }}
        onFocus={() => setVisible(true)}
        onBlur={() => setTimeout(() => setVisible(false), 200)}
        error={!!error}
        left={
          leftIcon && (
            <TextInput.Icon
              icon={() => (
                <Icon
                  type={leftIcon as any}
                  size={18}
                  className="text-gray-400 dark:text-gray-500"
                />
              )}
            />
          )
        }
        right={
          isLoading ? (
            <TextInput.Icon icon={() => <ActivityIndicator size="small" />} />
          ) : (
            <TextInput.Icon icon="menu-down" onPress={() => setVisible(!visible)} />
          )
        }
      />
      {visible && suggestions.length > 0 && (
        <Surface
          className="absolute top-[54px] left-0 right-0 z-[1000] rounded-lg overflow-hidden bg-gray-50 dark:bg-dark-surface"
          elevation={3}
        >
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <List.Item
                title={item}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
              />
            )}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 200 }}
          />
        </Surface>
      )}
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    </View>
  );
};

export const BottomDrawer = ({
  isVisible,
  onClose,
  title,
  fields,
  initialValues,
  onSubmit,
  submitButtonText = "Save",
  isSubmitting: isSubmittingProp,
  children,
}: BottomDrawerProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [activeDateField, setActiveDateField] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const { darkMode } = useUserPreferences();
  const isSubmitting = isSubmittingProp || isSubmittingInternal;

  // Animation Refs
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Slide in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, fadeAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  useEffect(() => {
    if (isVisible) {
      setFormData(initialValues || {});
      setErrors({});
    }
  }, [isVisible, initialValues]);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddTag = (fieldName: string, tag: string) => {
    if (!tag.trim()) return;
    const currentTags = Array.isArray(formData[fieldName])
      ? formData[fieldName]
      : [];
    if (!currentTags.includes(tag.trim())) {
      handleInputChange(fieldName, [...currentTags, tag.trim()]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (fieldName: string, tagToRemove: string) => {
    const currentTags = Array.isArray(formData[fieldName])
      ? formData[fieldName]
      : [];
    handleInputChange(
      fieldName,
      currentTags.filter((t: string) => t !== tagToRemove)
    );
  };

  const handleDynamicListChange = (
    fieldName: string,
    index: number,
    subFieldName: string,
    value: any
  ) => {
    const currentList = Array.isArray(formData[fieldName])
      ? [...formData[fieldName]]
      : [{}];
    currentList[index] = { ...currentList[index], [subFieldName]: value };
    handleInputChange(fieldName, currentList);
  };

  const handleAddDynamicListItem = (fieldName: string) => {
    const currentList = Array.isArray(formData[fieldName])
      ? [...formData[fieldName]]
      : [];
    handleInputChange(fieldName, [...currentList, {}]);
  };

  const handleRemoveDynamicListItem = (fieldName: string, index: number) => {
    const currentList = Array.isArray(formData[fieldName])
      ? [...formData[fieldName]]
      : [];
    handleInputChange(
      fieldName,
      currentList.filter((_, i) => i !== index)
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    (fields || []).forEach((field) => {
      if (field.required && !String(formData[field.name] || "").trim()) {
        newErrors[field.name] = `${field.label} is required.`;
      } else if (
        field.type === "email" &&
        formData[field.name] &&
        !/\S+@\S+\.\S+/.test(formData[field.name])
      ) {
        newErrors[field.name] = "Please enter a valid email address.";
      } else if (field.type === "phone" && formData[field.name]) {
        const E164_REGEX = /^\+?[1-9]\d{9,14}$/;
        if (!E164_REGEX.test(formData[field.name].replace(/\s/g, ""))) {
          newErrors[field.name] = "Enter a valid phone number.";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert(
        "Validation Error",
        "Please fill all required fields correctly."
      );
      return;
    }
    setIsSubmittingInternal(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch {
      Alert.alert("Error", "Failed to save record. Please try again.");
    } finally {
      setIsSubmittingInternal(false);
    }
  };

  const renderField = useCallback((field: FormField, index: number, isHalf: boolean) => {
    const containerClass = isHalf ? "flex-1" : "w-full";

    if (field.type === "dynamic-list") {
      const items = Array.isArray(formData[field.name])
        ? formData[field.name]
        : [{}];
      return (
        <View key={field.name} className="w-full">
          <Text variant="titleMedium" className="mt-4 mb-2 font-bold">
            {field.label}
          </Text>
          {items.map((item: any, itemIndex: number) => (
            <Surface
              key={`${field.name}-${itemIndex}`}
              className="p-4 rounded-xl mb-4 bg-gray-50 dark:bg-dark-surface"
              elevation={1}
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text variant="labelLarge">
                  {field.label} #{itemIndex + 1}
                </Text>
                {items.length > 1 && (
                  <IconButton
                    icon="close-circle"
                    iconColor="#ef4444"
                    size={20}
                    onPress={() =>
                      handleRemoveDynamicListItem(field.name, itemIndex)
                    }
                  />
                )}
              </View>
              <View className="gap-2">
                {field.subFields?.map((subField) => {
                  const subFieldName = subField.name;
                  // We need a modified handleInputChange for subfields
                  const handleSubInputChange = (val: any) =>
                    handleDynamicListChange(
                      field.name,
                      itemIndex,
                      subFieldName,
                      val
                    );

                  // Create a temporary field object for rendering
                  const tempField: FormField = {
                    ...subField,
                    name: `${field.name}-${itemIndex}-${subFieldName}`,
                  };

                  // Render the subfield with overridden props
                  return (
                    <View
                      key={tempField.name}
                      className={subField.halfWidth ? "flex-1" : "w-full"}
                    >
                      {subField.type === "dropdown" ? (
                        <PaperFormDropdown
                          label={subField.label}
                          items={subField.items || []}
                          selectedValue={item[subFieldName] || ""}
                          onSelect={handleSubInputChange}
                          leftIcon={subField.icon}
                        />
                      ) : (
                        <TextInput
                          mode="outlined"
                          label={subField.label}
                          value={String(item[subFieldName] || "")}
                          onChangeText={handleSubInputChange}
                          keyboardType={
                            subField.type === "number" ? "numeric" : "default"
                          }
                          left={
                            subField.icon && (
                              <TextInput.Icon
                                icon={() => (
                                  <Icon
                                    type={subField.icon as any}
                                    size={18}
                                    className="text-dark dark:text-light"
                                  />
                                )}
                              />
                            )
                          }
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            </Surface>
          ))}
          <Button
            mode="text"
            onPress={() => handleAddDynamicListItem(field.name)}
            icon="plus"
            className="self-start mt-2"
          >
            Add Another {field.label}
          </Button>
        </View>
      );
    }

    if (field.type === "tags") {
      const currentTags = Array.isArray(formData[field.name])
        ? formData[field.name]
        : [];
      return (
        <View key={field.name} className={containerClass}>
          <TextInput
            mode="outlined"
            label={field.label}
            placeholder={field.placeholder || "Type and press add"}
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={() => handleAddTag(field.name, tagInput)}
            right={
              <TextInput.Icon
                icon="plus"
                onPress={() => handleAddTag(field.name, tagInput)}
              />
            }
          />
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 8,
              marginBottom: 12,
            }}
          >
            {currentTags.map((tag: string) => (
              <Chip
                key={tag}
                onClose={() => handleRemoveTag(field.name, tag)}
                className="bg-gray-100 dark:bg-gray-800"
              >
                {tag}
              </Chip>
            ))}
          </View>
        </View>
      );
    }

    if (field.type === "dropdown" || field.type === "autocomplete") {
      return (
        <View key={field.name} className={containerClass}>
          {field.type === "dropdown" ? (
            <PaperFormDropdown
              label={field.label}
              items={field.items || []}
              selectedValue={formData[field.name] || ""}
              onSelect={(val) => handleInputChange(field.name, val)}
              error={errors[field.name]}
              leftIcon={field.icon}
              disabled={field.disabled}
            />
          ) : (
            <PaperFormAutocomplete
              label={field.label}
              items={field.items || []}
              value={formData[field.name] || ""}
              onSelect={(val) => handleInputChange(field.name, val)}
              error={errors[field.name]}
              leftIcon={field.icon}
              placeholder={field.placeholder}
              isLoading={false}
            />
          )}
        </View>
      );
    }

    if (field.type === "checkbox") {
      return (
        <View
          key={field.name}
          className={`${containerClass} mb-3 justify-center`}
        >
          <Checkbox.Item
            label={field.label}
            status={formData[field.name] ? "checked" : "unchecked"}
            onPress={() => handleInputChange(field.name, !formData[field.name])}
            mode="android"
            disabled={field.disabled}
          />
        </View>
      );
    }

    if (field.type === "date") {
      return (
        <View key={field.name} className={containerClass}>
          <TouchableRipple
            onPress={() => {
              setActiveDateField(field.name);
              setDatePickerVisible(true);
            }}
            disabled={field.disabled}
          >
            <View pointerEvents="none">
              <TextInput
                mode="outlined"
                label={field.label}
                value={formData[field.name] || ""}
                placeholder="Select date"
                editable={false}
                disabled={field.disabled}
                error={!!errors[field.name]}
                left={
                  field.icon && (
                    <TextInput.Icon
                      icon={() => (
                        <Icon
                          type={field.icon as any}
                          size={18}
                          className="text-gray-400 dark:text-gray-500"
                        />
                      )}
                    />
                  )
                }
                right={<TextInput.Icon icon="calendar" />}
              />
            </View>
          </TouchableRipple>
          <HelperText type="error" visible={!!errors[field.name]}>
            {errors[field.name]}
          </HelperText>
        </View>
      );
    }

    return (
      <View key={field.name} className={containerClass}>
        <TextInput
          mode="outlined"
          label={field.label}
          placeholder={field.placeholder}
          value={String(formData[field.name] || "")}
          onChangeText={(text: string) => handleInputChange(field.name, text)}
          error={!!errors[field.name]}
          keyboardType={
            field.type === "number"
              ? "numeric"
              : field.type === "phone"
              ? "phone-pad"
              : field.type === "email"
              ? "email-address"
              : field.keyboardType || "default"
          }
          multiline={field.multiline}
          numberOfLines={field.numberOfLines || (field.multiline ? 4 : 1)}
          disabled={field.disabled}
          left={
            field.icon && (
              <TextInput.Icon
                icon={() => (
                  <Icon
                    type={field.icon as any}
                    size={18}
                    className="text-gray-400 dark:text-gray-500"
                  />
                )}
              />
            )
          }
        />
        <HelperText type="error" visible={!!errors[field.name]}>
          {errors[field.name]}
        </HelperText>
      </View>
    );
  }, [
    formData,
    handleRemoveDynamicListItem,
    handleDynamicListChange,
    handleAddDynamicListItem,
    tagInput,
    setTagInput,
    handleAddTag,
    handleRemoveTag,
    handleInputChange,
    errors,
    setActiveDateField,
    setDatePickerVisible,
    darkMode,
  ]);

  const renderedFields = useMemo(() => {
    const rows: React.ReactNode[] = [];
    let currentRow: { field: FormField; index: number }[] = [];

    (fields || []).forEach((field, index) => {
      if (field.halfWidth) {
        currentRow.push({ field, index });
        if (currentRow.length === 2) {
          const rowData = [...currentRow];
          rows.push(
          <View key={`row-${index}`} className="flex-row gap-4">
              {rowData.map((item) => renderField(item.field, item.index, true))}
            </View>
          );
          currentRow = [];
        }
      } else {
        if (currentRow.length === 1) {
          rows.push(
            <View key={`row-single-${index}`} className="flex-row gap-4">
              {renderField(currentRow[0].field, currentRow[0].index, true)}
              <View className="flex-1" />
            </View>
          );
          currentRow = [];
        }
        rows.push(renderField(field, index, false));
      }
    });

    if (currentRow.length === 1) {
      rows.push(
        <View key="row-last" className="flex-row gap-4">
          {renderField(currentRow[0].field, currentRow[0].index, true)}
          <View className="flex-1" />
        </View>
      );
    }

    return rows;
  }, [fields, formData, errors, tagInput, renderField]);

  const handleDayPress = (day: DateData) => {
    if (activeDateField) {
      handleInputChange(activeDateField, day.dateString);
    }
    setDatePickerVisible(false);
    setActiveDateField(null);
  };

  return (
    <>
      <Portal>
        <Modal
          visible={isVisible}
          onDismiss={handleClose}
          containerClassName="justify-end bg-transparent"
          className="w-full p-0 rounded-b-none"
        >
          <Animated.View 
            style={[
              {
                ...StyleSheet.absoluteFillObject,
                backgroundColor: "rgba(0,0,0,0.6)",
              }, 
              { opacity: fadeAnim }
            ]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={handleClose}
            />
          </Animated.View>
          
          <PanGestureHandler
            onGestureEvent={Animated.event(
              [{ nativeEvent: { translationY: slideAnim } }],
              { useNativeDriver: true }
            )}
            onHandlerStateChange={(event) => {
              if (event.nativeEvent.state === State.END) {
                if (event.nativeEvent.translationY > 100) {
                  handleClose();
                } else {
                  Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 11
                  }).start();
                }
              }
            }}
          >
            <Animated.View
              style={{
                width: "100%",
                transform: [
                  { 
                    translateY: slideAnim.interpolate({
                      inputRange: [0, SCREEN_HEIGHT],
                      outputRange: [0, SCREEN_HEIGHT],
                      extrapolate: 'clamp'
                    }) 
                  }
                ],
              }}
            >
              <Surface
                className="rounded-t-[24px] overflow-hidden bg-white dark:bg-dark-surface border-t border-gray-400 dark:border-gray-600"
                style={{ maxHeight: SCREEN_HEIGHT * 0.85 }}
                elevation={0}
              >
                <View className="items-center py-3">
                  <View className="w-10 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
                </View>

                <Appbar.Header 
                  elevated={false} 
                  className="h-12 px-2 bg-white dark:bg-dark-surface border-b border-gray-400 dark:border-gray-800"
                >
                  <Appbar.Content 
                    title={title} 
                    titleStyle={{ fontSize: 20, fontWeight: "700" }} 
                  />
                  
                </Appbar.Header>

                <ScrollView
                  className="bg-transparent"
                  contentContainerClassName="p-6 pb-10"
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View className="gap-1">
                    {renderedFields}
                    {children}
                  </View>
                </ScrollView>

                <View className={`p-6 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-gray-800 ${Platform.OS === 'ios' ? 'pb-10' : 'pb-6'}`}>
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="py-1.5 rounded-xl elevation-none"
                    labelStyle={{ fontSize: 16, fontWeight: "600", color: 'white' }}
                    icon={() => (
                      <Icon
                        type={"check" as any}
                        size={18}
                        color={"white"}
                      />
                    )}
                  >
                    {submitButtonText}
                  </Button>
                </View>
              </Surface>
            </Animated.View>
          </PanGestureHandler>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={isDatePickerVisible}
          onDismiss={() => setDatePickerVisible(false)}
          contentContainerStyle={{ margin: 20, borderRadius: 16, backgroundColor: darkMode ? "#030712" : "#ffffff" }}
        >
          <Calendar
            onDayPress={handleDayPress}
            markedDates={
              activeDateField && formData[activeDateField]
                ? {
                    [formData[activeDateField]]: {
                      selected: true,
                      disableTouchEvent: true,
                    },
                  }
                : {}
            }
          />
        </Modal>
      </Portal>
    </>
  );
};

export default BottomDrawer;
