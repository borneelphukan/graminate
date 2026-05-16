import { Icon } from "@/components/ui/Icon";
import { APICULTURE_FIELDS, ApicultureFormData, HIVE_FIELDS, HiveFormData } from "@/constants/formConfigs";
import { BottomDrawer } from "@/components/form/BottomDrawer";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";

import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View, ViewProps } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Divider,
  List,
  Searchbar,
  Text,
} from "@/components/ui";

type ApicultureDetail = {
  apiary_id: number;
  user_id: number;
  apiary_name: string;
  number_of_hives: number;
  area: number | null;
  created_at: string;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
};
type HiveData = {
  hive_id: number;
  apiary_id: number;
  hive_name: string;
  hive_type: string | null;
  bee_species: string | null;
  last_inspection_date: string | null;
  honey_capacity: number | null;
  unit: string | null;
};

const ApicultureDetailPage = () => {
  const router = useRouter();
  const { user_id, apiary_id } = useLocalSearchParams<{
    user_id: string;
    apiary_id: string;
  }>();

  const [apiaryData, setApiaryData] = useState<ApicultureDetail | null>(null);
  const [hives, setHives] = useState<HiveData[]>([]);
  const [loadingApiary, setLoadingApiary] = useState(true);
  const [loadingHives, setLoadingHives] = useState(true);
  const [showApiaryForm, setShowApiaryForm] = useState(false);
  const [showHiveForm, setShowHiveForm] = useState(false);
  const [hiveSearchQuery, setHiveSearchQuery] = useState("");
  const numericApiaryId = apiary_id ? parseInt(apiary_id, 10) : 0;

  const fetchApiaryDetails = useCallback(async () => {
    if (!numericApiaryId) return;
    setLoadingApiary(true);
    try {
      const response = await axiosInstance.get(
        `/apiculture/${numericApiaryId}`
      );
      setApiaryData(response.data);
    } catch {
      setApiaryData(null);
    } finally {
      setLoadingApiary(false);
    }
  }, [numericApiaryId]);

  const fetchHives = useCallback(async () => {
    if (!numericApiaryId) return;
    setLoadingHives(true);
    try {
      const response = await axiosInstance.get(
        `/bee-hives/apiary/${numericApiaryId}`
      );
      setHives(response.data.hives || []);
    } catch {
      setHives([]);
    } finally {
      setLoadingHives(false);
    }
  }, [numericApiaryId]);

  useFocusEffect(
    useCallback(() => {
      fetchApiaryDetails();
      fetchHives();
    }, [fetchApiaryDetails, fetchHives])
  );

  const handleApiaryFormSuccess = async (data: ApicultureFormData) => {
    if (!numericApiaryId) return;
    const payload = {
      ...data,
      user_id: parseInt(user_id, 10),
      number_of_hives: parseInt(data.number_of_hives, 10),
      area: data.area ? parseFloat(data.area) : null,
    };
    await axiosInstance.put(`/apiculture/update/${numericApiaryId}`, payload);
    setShowApiaryForm(false);
    await fetchApiaryDetails();
  };

  const handleHiveFormSuccess = async (data: HiveFormData) => {
    const payload = {
      ...data,
      apiary_id: numericApiaryId,
      honey_capacity: data.honey_capacity
        ? parseFloat(data.honey_capacity)
        : null,
      last_inspection_date: (data as any).last_inspection_date || null,
    };
    await axiosInstance.post(`/bee-hives/add`, payload);
    setShowHiveForm(false);
    await fetchHives();
    await fetchApiaryDetails();
  };

  const handleHiveClick = (hive: HiveData) => {
    if (!apiaryData) return;
    router.push(
      `/${user_id}/apiculture/${numericApiaryId}/${
        hive.hive_id
      }?apiaryName=${encodeURIComponent(apiaryData.apiary_name)}`
    );
  };

  const detailItems = useMemo(() => {
    if (!apiaryData) return [];
    const fullAddress = [
      apiaryData.address_line_1,
      apiaryData.city,
      apiaryData.state,
      apiaryData.postal_code,
    ]
      .filter(Boolean)
      .join(", ");
    return [
      {
        label: "Address",
        value: fullAddress || "N/A",
        icon: "location_on",
      },
      {
        label: "Total Hives",
        value: String(apiaryData.number_of_hives),
        icon: "sports_bar",
      },
      {
        label: "Area",
        value: apiaryData.area != null ? `${apiaryData.area} sq. m` : "N/A",
        icon: "crop_square",
      },
      {
        label: "Created On",
        value: new Date(apiaryData.created_at).toLocaleDateString(),
        icon: "calendar-month",
      },
    ];
  }, [apiaryData]);

  const filteredHives = useMemo(
    () =>
      hives.filter(
        (hive) =>
          hive.hive_name
            .toLowerCase()
            .includes(hiveSearchQuery.toLowerCase()) ||
          hive.hive_type?.toLowerCase().includes(hiveSearchQuery.toLowerCase())
      ),
    [hives, hiveSearchQuery]
  );

  return (
    <PlatformLayout>
      <Appbar.Header>
        <Appbar.Action
          icon={() => (
            <Icon
              type={"chevron-left" as any}
              size={22}
              className="text-dark dark:text-light"
            />
          )}
          onPress={() => router.push(`/${user_id}/apiculture`)}
        />
        <Appbar.Content title={apiaryData?.apiary_name || "Bee Yard Details"} />
        <Button
          onPress={() => setShowHiveForm(true)}
          className="text-green-100 dark:text-green-200"
          icon={() => (
            <Icon
              type={"plus" as any}
              size={18}
              className="text-green-100 dark:text-green-200"
            />
          )}
        >
          New Hive
        </Button>
      </Appbar.Header>
      <ScrollView className="bg-white dark:bg-dark">
        <View className="p-4 gap-6">
          <Card className="rounded-xl overflow-hidden">
            {loadingApiary ? (
              <ActivityIndicator className="my-6" />
            ) : apiaryData ? (
              <>
                <Card.Actions>
                  <Button onPress={() => setShowApiaryForm(true)}>
                    Edit Bee Yard
                  </Button>
                </Card.Actions>
                <Divider />
                <Card.Content className="flex-row flex-wrap">
                  {detailItems.map((item) => (
                    <List.Item
                      key={item.label}
                      title={item.value}
                      description={item.label}
                      left={(props: React.JSX.IntrinsicAttributes & React.JSX.IntrinsicClassAttributes<View> & Readonly<ViewProps>) => (
                        <View {...props} className="justify-center items-center w-6 ml-3 mr-4">
                          <Icon
                            type={(item.icon) as any}
                            size={24}
                            className="text-gray-400 dark:text-gray-500"
                          />
                        </View>
                      )}
                      className="w-1/2"
                    />
                  ))}
                </Card.Content>
              </>
            ) : (
              <Card.Content>
                <Text className="text-red-600 dark:text-red-400">
                  Bee Yard data could not be loaded.
                </Text>
              </Card.Content>
            )}
          </Card>

          <View className="gap-4">
            <Text className="text-2xl font-bold">Hives in this Bee Yard</Text>
            <Searchbar
              placeholder="Search Hives..."
              value={hiveSearchQuery}
              onChangeText={setHiveSearchQuery}
              className="bg-transparent"
            />
            {loadingHives ? (
              <ActivityIndicator className="my-6" />
            ) : filteredHives.length > 0 ? (
              filteredHives.map((item) => (
                <Card
                  key={item.hive_id}
                  onPress={() => handleHiveClick(item)}
                  className="mb-3 rounded-xl"
                >
                  <Card.Title title={item.hive_name} />
                  <Card.Content className="flex-row justify-between">
                    <Text>Type: {item.hive_type || "N/A"}</Text>
                    <Text>
                      Last Inspected:{" "}
                      {item.last_inspection_date
                        ? new Date(
                            item.last_inspection_date
                          ).toLocaleDateString()
                        : "N/A"}
                    </Text>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Text className="text-center py-8">No hives found.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {showApiaryForm && apiaryData && (
        <BottomDrawer
          isVisible={showApiaryForm}
          onClose={() => setShowApiaryForm(false)}
          title="Edit Bee Yard"
          fields={APICULTURE_FIELDS}
          initialValues={{
            apiary_name: apiaryData.apiary_name || "",
            number_of_hives: String(apiaryData.number_of_hives || ""),
            bee_species: (apiaryData as any).bee_species || "",
            hive_type: (apiaryData as any).hive_type || "",
            queen_source: (apiaryData as any).queen_source || "",
            area: apiaryData.area != null ? String(apiaryData.area) : "",
            notes: (apiaryData as any).notes || "",
          }}
          onSubmit={handleApiaryFormSuccess}
          submitButtonText="Update Bee Yard"
        />
      )}
      {showHiveForm && (
        <BottomDrawer
          isVisible={showHiveForm}
          onClose={() => setShowHiveForm(false)}
          onSubmit={handleHiveFormSuccess}
          title="Add New Hive"
          fields={HIVE_FIELDS}
        />
      )}
    </PlatformLayout>
  );
};

const styles = StyleSheet.create({});

export default ApicultureDetailPage;
