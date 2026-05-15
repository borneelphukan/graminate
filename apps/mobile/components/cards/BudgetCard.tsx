import { Icon } from "@/components/ui/Icon";
import React from "react";
import { View } from "react-native";
import { Card, Text, useTheme } from "@/components/ui";

type BudgetCardProps = {
  title: string;
  value: number;
  date: Date;
  icon: string;
  className?: string;
  textColorClassName?: string;
  onPress?: () => void;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const BudgetCard = ({
  title,
  value,
  date,
  icon,
  className = '',
  textColorClassName = '',
  onPress,
}: BudgetCardProps) => {
  const theme = useTheme();
  const formattedDate = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card className={`flex-1 my-0 ${className}`} onPress={onPress}>
      <Card.Content className="flex-1 p-6">
        <View className="flex-row items-center mb-2 gap-2">
          <Icon
            type={(icon) as any}
            size={24}
            className={`${textColorClassName} opacity-80`}
          />
          <Text
            variant="labelMedium"
            className="uppercase"
            style={{ color: theme.colors.onSurface }}
          >
            {title}
          </Text>
        </View>
        <Text
          variant="headlineSmall"
          className={`mt-1 font-bold ${textColorClassName}`}
        >
          {formatCurrency(value)}
        </Text>
        <Text
          variant="bodySmall"
          className="mt-auto pt-2 opacity-90"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {formattedDate}
        </Text>
      </Card.Content>
    </Card>
  );
};

export default BudgetCard;
