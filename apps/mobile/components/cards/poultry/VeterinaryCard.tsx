import React from "react";
import { View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Icon,
  Text,
  IconSource,
  TouchableRipple,
} from "@/components/ui";

type VeterinaryCardProps = {
  birdsVaccinated: number | null;
  totalBirdsInvolvedInRecord: number | null;
  nextAppointmentDate: string | null;
  onManageClick: () => void;
  loading: boolean;
};

type MetricItemProps = {
  icon: IconSource;
  value: string | React.ReactNode;
  label: string;
};

const MetricItem = ({ icon, value, label }: MetricItemProps) => {
  return (
    <Card className="flex-1">
      <Card.Content className="min-h-[128px] items-center justify-center p-4 gap-2">
        <Icon source={icon} size={28} className="text-green-100" />
        <Text className="font-bold">{value}</Text>
        <Text className="text-center">{label}</Text>
      </Card.Content>
    </Card>
  );
};

const VeterinaryCard = ({
  birdsVaccinated,
  totalBirdsInvolvedInRecord,
  nextAppointmentDate,
  onManageClick,
  loading,
}: VeterinaryCardProps) => {
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const vaccinatedDisplayValue =
    birdsVaccinated === null || totalBirdsInvolvedInRecord === null
      ? "N/A"
      : `${birdsVaccinated} / ${totalBirdsInvolvedInRecord}`;

  return (
    <Card>
      <Card.Title title="Veterinary Status" titleVariant="titleLarge" />
      <Card.Content>
        {loading ? (
          <View className="min-h-[160px] justify-center items-center">
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <View className="gap-3">
            <View className="flex-row justify-between gap-3">
              <MetricItem
                icon="syringe"
                value={vaccinatedDisplayValue}
                label="Birds Vaccinated (Latest)"
              />
              <MetricItem
                icon="calendar-check"
                value={formatDate(nextAppointmentDate)}
                label="Next Visit"
              />
            </View>
            <TouchableRipple
              onPress={!loading ? onManageClick : undefined}
              disabled={loading}
              className="rounded-xl overflow-hidden"
            >
              <MetricItem
                icon="notebook-edit-outline"
                value="Log/View"
                label="Manage Health Data"
              />
            </TouchableRipple>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

export default VeterinaryCard;
