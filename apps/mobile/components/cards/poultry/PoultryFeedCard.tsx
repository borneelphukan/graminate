import axiosInstance from "@/lib/axiosInstance";
import {
  differenceInDays,
  isBefore,
  min as minDateFn,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Icon,
  ProgressBar,
  Text,
  TouchableRipple,
} from "@/components/ui";

type ItemRecord = {
  inventory_id: number;
  user_id: number;
  item_name: string;
  item_group: string;
  units: string;
  quantity: number;
  created_at: string;
  price_per_unit: number;
  warehouse_id: number | null;
  minimum_limit?: number;
  status?: string;
  feed?: boolean;
};

type PoultryFeedRecordForGraph = {
  feed_id: number;
  feed_given: string;
  amount_given: number;
  units: string;
  feed_date: string;
};

type FeedItemMetrics = {
  itemName: string;
  currentStockKg: number;
  currentStockDisplay: string;
  avgDailyConsumptionKg: number;
  estimatedDurationDays: number;
  units: string;
};

type Props = {
  feedItems: ItemRecord[];
  getFeedLevelColor: (days: number) => string;
  loadingFeedItems: boolean;
  timesFedToday: number;
  targetFeedingsPerDay: number;
  userId: string;
  flockId: string;
  onManageFeedClick: () => void;
};

type FeedStatItemProps = {
  icon: string;
  value: string | React.ReactNode;
  label: string;
  valueStyle?: object;
};

const FeedStatItem = ({
  icon,
  label,
  value,
  valueStyle,
}: FeedStatItemProps) => {
  if (value === null || value === undefined) return null;
  return (
    <Card className="flex-1 w-full">
      <Card.Content className="p-4 items-center gap-1">
        <Icon source={icon} size={24} className="text-green-100" />
        <Text className="text-center">{label}</Text>
        {typeof value === "string" ? (
          <Text
            className="font-bold"
            style={valueStyle}
          >
            {value}
          </Text>
        ) : (
          value
        )}
      </Card.Content>
    </Card>
  );
};

const PoultryFeedCard = ({
  feedItems: stockFeedItems,
  getFeedLevelColor: getFeedLevelColorProp,
  loadingFeedItems: loadingStockItems,
  timesFedToday,
  targetFeedingsPerDay,
  userId,
  flockId,
  onManageFeedClick,
}: Props) => {
  const [allFeedConsumptionRecords, setAllFeedConsumptionRecords] = useState<
    PoultryFeedRecordForGraph[]
  >([]);
  const [loadingConsumptionRecords, setLoadingConsumptionRecords] =
    useState(true);
  const [perFeedItemMetrics, setPerFeedItemMetrics] = useState<
    FeedItemMetrics[]
  >([]);
  const [loadingPerItemMetrics, setLoadingPerItemMetrics] = useState(true);

  const convertAmountToKg = (amount: number, unit: string): number => {
    const unitLower = unit ? unit.toLowerCase() : "";
    if (unitLower === "kg") return amount;
    if (["g", "grams"].includes(unitLower)) return amount / 1000;
    if (["lbs", "pounds"].includes(unitLower)) return amount * 0.453592;
    return 0;
  };

  const fetchAllFeedConsumptionData = useCallback(async () => {
    if (!userId || !flockId) {
      setLoadingConsumptionRecords(false);
      return;
    }
    setLoadingConsumptionRecords(true);
    try {
      const response = await axiosInstance.get<{
        records: PoultryFeedRecordForGraph[];
      }>(`/poultry-feeds/${userId}?flockId=${flockId}&limit=10000`);
      setAllFeedConsumptionRecords(response.data.records || []);
    } catch (error) {
      console.error("Error fetching feed consumption data:", error);
      setAllFeedConsumptionRecords([]);
    } finally {
      setLoadingConsumptionRecords(false);
    }
  }, [userId, flockId]);

  useEffect(() => {
    fetchAllFeedConsumptionData();
  }, [fetchAllFeedConsumptionData]);

  useEffect(() => {
    if (loadingStockItems || loadingConsumptionRecords) {
      setLoadingPerItemMetrics(true);
      return;
    }
    setLoadingPerItemMetrics(true);
    const today = startOfDay(new Date());
    const thirtyDaysAgo = startOfDay(subDays(today, 29));

    const calculatedMetrics: FeedItemMetrics[] = stockFeedItems.map(
      (stockItem) => {
        const consumptionForThisItem = allFeedConsumptionRecords.filter(
          (record) =>
            record.feed_given === stockItem.item_name &&
            isBefore(thirtyDaysAgo, startOfDay(parseISO(record.feed_date)))
        );
        let totalKgConsumedForItemLast30Days = consumptionForThisItem.reduce(
          (total, record) =>
            total + convertAmountToKg(record.amount_given, record.units),
          0
        );
        const earliestRecordDateForItemInPeriod =
          consumptionForThisItem.length > 0
            ? minDateFn(
                consumptionForThisItem.map((r) => parseISO(r.feed_date))
              )
            : thirtyDaysAgo;
        const daysInPeriodWithDataForItem = Math.max(
          1,
          differenceInDays(today, earliestRecordDateForItemInPeriod) + 1
        );
        const avgDailyConsumptionKgForItem =
          consumptionForThisItem.length > 0
            ? totalKgConsumedForItemLast30Days /
              Math.min(30, daysInPeriodWithDataForItem)
            : 0;
        const currentStockKg = convertAmountToKg(
          stockItem.quantity,
          stockItem.units
        );
        const estimatedDurationDays =
          avgDailyConsumptionKgForItem > 0 &&
          isFinite(avgDailyConsumptionKgForItem)
            ? currentStockKg / avgDailyConsumptionKgForItem
            : currentStockKg > 0
            ? Infinity
            : 0;
        return {
          itemName: stockItem.item_name,
          currentStockKg: currentStockKg,
          currentStockDisplay: `${stockItem.quantity.toLocaleString()} ${
            stockItem.units
          }`,
          avgDailyConsumptionKg: avgDailyConsumptionKgForItem,
          estimatedDurationDays: estimatedDurationDays,
          units: stockItem.units,
        };
      }
    );
    setPerFeedItemMetrics(calculatedMetrics);
    setLoadingPerItemMetrics(false);
  }, [
    stockFeedItems,
    allFeedConsumptionRecords,
    loadingStockItems,
    loadingConsumptionRecords,
  ]);

  const feedingStatusValue = `${timesFedToday} / ${targetFeedingsPerDay}`;
  const isFeedingComplete = timesFedToday >= targetFeedingsPerDay;
  const feedingStatusColor = isFeedingComplete
    ? "#16a34a"
    : timesFedToday > 0
    ? "#F59E0B"
    : "#ef4444";

  const getFeedLevelColor = (days: number) => {
    if (days < 3) return "#ef4444";
    if (days < 7) return "#F59E0B";
    return "#16a34a";
  };

  const renderMetricsView = () => {
    if (loadingStockItems || loadingPerItemMetrics) {
      return (
        <View className="min-h-[200px] justify-center items-center p-4">
          <ActivityIndicator size="large" />
        </View>
      );
    }
    if (stockFeedItems.length === 0) {
      return (
        <View className="min-h-[200px] justify-center items-center p-4 gap-3 text-center">
          <Icon
            source="package-variant-closed"
            size={48}
            className="text-gray-300 dark:text-gray-600"
          />
          <Text className="font-bold">No Poultry Feed in Stock</Text>
          <Text className="text-gray-400 dark:text-gray-500">
            Mark items as &quot;Feed&quot; in your inventory.
          </Text>
        </View>
      );
    }
    return (
      <View className="mt-3">
        <ScrollView className="max-h-[280px] mb-2">
          {perFeedItemMetrics.map((metric) => {
            const durationColor = getFeedLevelColor(
              metric.estimatedDurationDays
            );
            const durationDisplay = !isFinite(metric.estimatedDurationDays)
              ? "N/A"
              : `${metric.estimatedDurationDays.toFixed(1)} days`;
            const progress = isFinite(metric.estimatedDurationDays)
              ? Math.min(1, metric.estimatedDurationDays / 7)
              : 0;
            return (
              <Card key={metric.itemName} className="mb-3">
                <Card.Content>
                  <Text
                    className="mb-3 font-bold"
                    numberOfLines={1}
                  >
                    {metric.itemName}
                  </Text>
                  <View className="flex-row justify-around">
                    <View className="flex-1 items-center gap-1 px-1">
                      <Icon
                        source="cube-outline"
                        size={20}
                        className="text-green-100"
                      />
                      <Text>{metric.currentStockDisplay}</Text>
                      <Text>In Stock</Text>
                    </View>
                    <View className="flex-1 items-center gap-1 px-1">
                      <Icon
                        source="chart-line"
                        size={20}
                        className="text-green-100"
                      />
                      <Text>
                        {metric.avgDailyConsumptionKg.toFixed(2)} kg/day
                      </Text>
                      <Text>Avg. Daily Use</Text>
                    </View>
                    <View className="flex-1 items-center gap-1 px-1">
                      <Icon
                        source="warehouse"
                        size={20}
                        className="text-green-100"
                      />
                      <Text
                        variant="labelLarge"
                        style={{ color: durationColor }}
                      >
                        {durationDisplay}
                      </Text>
                      <Text>Est. Duration</Text>
                      {isFinite(metric.estimatedDurationDays) && (
                        <ProgressBar
                          progress={progress}
                          color={durationColor}
                          className="w-full mt-1 h-1.5 rounded-full"
                        />
                      )}
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </ScrollView>
        <View className="flex-row justify-between gap-3 pt-3">
          <FeedStatItem
            icon="silverware-fork-knife"
            value={
              loadingStockItems ? <ActivityIndicator /> : feedingStatusValue
            }
            label="Times Fed Today"
            valueStyle={{ color: feedingStatusColor }}
          />
          <TouchableRipple
            onPress={!loadingStockItems ? onManageFeedClick : undefined}
            disabled={!userId || !flockId || loadingStockItems}
            className="flex-1 rounded-xl overflow-hidden"
          >
            <FeedStatItem
              icon="clipboard-list-outline"
              value="Log/View"
              label="Manage Feed Data"
            />
          </TouchableRipple>
        </View>
      </View>
    );
  };

  return (
    <Card>
      <Card.Title title="Feed Status & Consumption" titleVariant="titleLarge" />
      <Card.Content>{renderMetricsView()}</Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({});

export default PoultryFeedCard;
