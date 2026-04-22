import { Icon } from "@/components/ui/Icon";

import BeeHiveIcon from "@/assets/icon/BeeHiveIcon";
import BeeIcon from "@/assets/icon/BeeIcon";
import HoneyProductionCard from "@/components/cards/apiculture/HoneyProductionCard";
import { HIVE_FIELDS, HiveFormData, INSPECTION_FIELDS, InspectionFormData } from "@/constants/formConfigs";
import BottomDrawer from "@/components/form/BottomDrawer";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  List,
  Menu,
  SegmentedButtons,
  Text,
  useTheme,
} from "react-native-paper";

type HiveView = "status" | "inspection";
type HiveData = HiveFormData & { hive_id: number; apiary_id: number };

const HiveDetailsPage = () => {
  const router = useRouter();
  const { user_id, apiary_id, hive_id } = useLocalSearchParams<{
    user_id: string;
    apiary_id: string;
    hive_id: string;
  }>();
  const numericHiveId = hive_id ? parseInt(hive_id, 10) : 0;
  const numericApiaryId = apiary_id ? parseInt(apiary_id, 10) : 0;
  const theme = useTheme();

  const [hiveData, setHiveData] = useState<HiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHiveForm, setShowHiveForm] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspections, setInspections] = useState<InspectionFormData[]>([]);
  const [loadingInspections, setLoadingInspections] = useState(true);
  const [activeView, setActiveView] = useState<HiveView>("status");
  const [inspectionToEdit, setInspectionToEdit] =
    useState<InspectionFormData | null>(null);
  const [isMoreMenuVisible, setMoreMenuVisible] = useState(false);

  const fetchHiveDetails = useCallback(async () => {
    if (!numericHiveId) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/bee-hives/${numericHiveId}`);
      setHiveData(response.data);
    } catch (error) {
      setHiveData(null);
    } finally {
      setLoading(false);
    }
  }, [numericHiveId]);

  const fetchInspections = useCallback(async () => {
    if (!numericHiveId) return;
    setLoadingInspections(true);
    try {
      const response = await axiosInstance.get(
        `/hive-inspections/hive/${numericHiveId}`
      );
      setInspections(response.data.inspections || []);
    } catch (error) {
      setInspections([]);
    } finally {
      setLoadingInspections(false);
    }
  }, [numericHiveId]);

  useFocusEffect(
    useCallback(() => {
      fetchHiveDetails();
      fetchInspections();
    }, [fetchHiveDetails, fetchInspections])
  );

  const handleDelete = () => {
    if (!numericHiveId) return;
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this hive?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axiosInstance.delete(`/bee-hives/delete/${numericHiveId}`);
              router.replace(`/${user_id}/apiculture/${apiary_id}`);
            } catch (error) {
              Alert.alert("Error", "Failed to delete the hive.");
            }
          },
        },
      ]
    );
  };

  const handleHiveFormSuccess = async (_data: HiveFormData) => {
    setShowHiveForm(false);
    await fetchHiveDetails();
  };
  const handleInspectionSaved = async (_data: any) => {
    setShowInspectionModal(false);
    setInspectionToEdit(null);
    await fetchHiveDetails();
    await fetchInspections();
  };
  const handleAddInspectionClick = () => {
    setInspectionToEdit(null);
    setShowInspectionModal(true);
  };
  const handleEditInspection = (inspection: InspectionFormData) => {
    setInspectionToEdit(inspection);
    setShowInspectionModal(true);
  };

  const detailItems = useMemo(() => {
    if (!hiveData) return [];
    return [
      {
        label: "Hive Type",
        value: hiveData.hive_type || "N/A",
        icon: BeeHiveIcon,
      },
      {
        label: "Bee Species",
        value: hiveData.bee_species || "N/A",
        icon: BeeIcon,
      },
      {
        label: "Installation Date",
        value: hiveData.installation_date
          ? new Date(hiveData.installation_date).toLocaleDateString()
          : "N/A",
        icon: "event_available",
      },
      {
        label: "Honey Capacity",
        value: hiveData.honey_capacity
          ? `${hiveData.honey_capacity} ${hiveData.unit || ""}`.trim()
          : "N/A",
        icon: "prescriptions",
      },
      {
        label: "Ventilation",
        value: hiveData.ventilation_status || "N/A",
        icon: "air",
      },
      {
        label: "Notes",
        value: hiveData.notes || "N/A",
        icon: "note",
      },
    ];
  }, [hiveData]);

  const statusItems = useMemo(() => {
    const latestInspection = inspections?.[0];
    if (!latestInspection)
      return [
        {
          label: "Last Inspection",
          value: "No inspection data found",
          icon: "warning",
        },
      ];
    return [
      {
        label: "Last Inspection",
        value: latestInspection.inspection_date
          ? new Date(latestInspection.inspection_date).toLocaleDateString()
          : "N/A",
        icon: "event_available",
      },
      {
        label: "Queen Status",
        value: latestInspection.queen_status || "N/A",
        icon: "emoji_events",
      },
      {
        label: "Brood Pattern",
        value: latestInspection.brood_pattern || "N/A",
        icon: "science",
      },
      {
        label: "Population Strength",
        value: latestInspection.population_strength || "N/A",
        icon: "account-group",
      },
      {
        label: "Brood Frames",
        value: String(latestInspection.frames_of_brood ?? "N/A"),
        icon: BeeIcon,
      },
      {
        label: "Nectar/Honey Frames",
        value: String(latestInspection.frames_of_nectar_honey ?? "N/A"),
        icon: "prescriptions",
      },
      {
        label: "Pollen Frames",
        value: String(latestInspection.frames_of_pollen ?? "N/A"),
        icon: "eco",
      },
      {
        label: "Symptoms",
        value: latestInspection.symptoms?.join(", ") || "No symptoms noted",
        icon: "warning",
      },
    ];
  }, [inspections]);

  if (loading) {
    return (
      <PlatformLayout>
        <View style={styles.centered}>
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
            <Icon
              type={"arrow_back" as any}
              size={22}
              color={theme.colors.onSurface}
            />
          )}
          onPress={() => router.back()}
        />
        <Appbar.Content title={hiveData?.hive_name || "Hive Details"} />
        <Menu
          visible={isMoreMenuVisible}
          onDismiss={() => setMoreMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon={() => (
                <Icon
                  type={"more_vert" as any}
                  size={22}
                  color={theme.colors.onSurface}
                />
              )}
              onPress={() => setMoreMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setShowHiveForm(true);
              setMoreMenuVisible(false);
            }}
            title="Edit Hive"
            leadingIcon={() => (
              <Icon
                type={"edit" as any}
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
            )}
          />
          <Menu.Item
            onPress={() => {
              handleDelete();
              setMoreMenuVisible(false);
            }}
            title="Delete Hive"
            leadingIcon={() => (
              <Icon
                type={"delete" as any}
                size={20}
                color={theme.colors.error}
              />
            )}
            titleStyle={{ color: theme.colors.error }}
          />
        </Menu>
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Card.Title title="Hive Information" />
          <Card.Content>
            {detailItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <List.Item
                  key={item.label}
                  title={item.label}
                  description={item.value}
                  left={(props) => (
                    <View {...props} style={styles.iconContainer}>
                      {typeof ItemIcon === "function" ? (
                        <ItemIcon size={24} color={theme.colors.onSurfaceVariant} />
                      ) : (
                        <Icon
                          type={(ItemIcon) as any}
                          size={24}
                          color={theme.colors.onSurfaceVariant}
                        />
                      )}
                    </View>
                  )}
                  descriptionNumberOfLines={3}
                />
              );
            })}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="Hive Inspection"
            right={() =>
              activeView === "inspection" && (
                <Button mode="contained" onPress={handleAddInspectionClick}>
                  Add
                </Button>
              )
            }
            rightStyle={styles.cardTitleRight}
          />
          <Card.Content>
            <SegmentedButtons
              value={activeView}
              onValueChange={(value) => setActiveView(value as HiveView)}
              buttons={[
                { value: "status", label: "Status" },
                { value: "inspection", label: "Logs" },
              ]}
              style={styles.segmentedButtons}
            />
            {activeView === "status" && (
              <View>
                {statusItems.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <List.Item
                      key={item.label}
                      title={item.label}
                      description={item.value}
                      left={(props) => (
                        <View {...props} style={styles.iconContainer}>
                          {typeof ItemIcon === "function" ? (
                            <ItemIcon
                              size={24}
                              color={theme.colors.onSurfaceVariant}
                            />
                          ) : (
                            <Icon
                              type={(ItemIcon) as any}
                              size={24}
                              color={theme.colors.onSurfaceVariant}
                            />
                          )}
                        </View>
                      )}
                      descriptionNumberOfLines={3}
                    />
                  );
                })}
              </View>
            )}
            {activeView === "inspection" &&
              (loadingInspections ? (
                <ActivityIndicator style={styles.loader} />
              ) : inspections.length > 0 ? (
                inspections.map((item) => (
                  <Card
                    key={item.inspection_id}
                    mode="outlined"
                    style={styles.inspectionCard}
                    onPress={() => handleEditInspection(item)}
                  >
                    <Card.Title
                      title="Inspection"
                      subtitle={
                        item.inspection_date
                          ? new Date(item.inspection_date).toLocaleDateString()
                          : "N/A"
                      }
                    />
                    <Card.Content>
                      <Text>
                        Queen: {item.queen_status || "N/A"} | Population:{" "}
                        {item.population_strength || "N/A"}
                      </Text>
                    </Card.Content>
                  </Card>
                ))
              ) : (
                <Text style={styles.emptyText}>No inspection logs found.</Text>
              ))}
          </Card.Content>
        </Card>

        {hive_id && user_id && (
          <HoneyProductionCard userId={user_id} hiveId={hive_id} />
        )}
      </ScrollView>

      {showHiveForm && hiveData && (
        <BottomDrawer
          isVisible={showHiveForm}
          onClose={() => setShowHiveForm(false)}
          onSubmit={handleHiveFormSuccess}
          title="Edit Hive Details"
          initialValues={hiveData}
          fields={HIVE_FIELDS}
        />
      )}
      {showInspectionModal && (
        <BottomDrawer
          isVisible={showInspectionModal}
          onClose={() => {
            setShowInspectionModal(false);
            setInspectionToEdit(null);
          }}
          title={inspectionToEdit ? "Edit Inspection" : "Add New Inspection"}
          onSubmit={handleInspectionSaved}
          initialValues={inspectionToEdit || undefined}
          fields={INSPECTION_FIELDS}
        />
      )}
    </PlatformLayout>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 16, gap: 24 },
  card: {},
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 24,
    marginLeft: 14,
    marginRight: 18,
  },
  cardTitleRight: { marginRight: 8 },
  segmentedButtons: { marginBottom: 16 },
  loader: { marginVertical: 24 },
  inspectionCard: { marginTop: 12 },
  emptyText: { textAlign: "center", padding: 32 },
});

export default HiveDetailsPage;
