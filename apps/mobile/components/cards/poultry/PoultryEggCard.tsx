import {
  addDays as addDaysDateFns,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  isBefore,
  min as minDateFn,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import {
  ActivityIndicator,
  Button,
  Card,
  Icon,
  Menu,
  SegmentedButtons,
  Text,
  IconSource,
  TouchableRipple,
} from "@/components/ui";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

// --- Type Definitions ---
type LatestEggMetrics = {
  totalEggs: number;
  brokenEggs: number;
  smallEggs: number;
  mediumEggs: number;
  largeEggs: number;
  extraLargeEggs: number;
};
export type PeriodOption = "Weekly" | "Monthly" | "3 Months";
const TIME_RANGE_OPTIONS: PeriodOption[] = ["Weekly", "Monthly", "3 Months"];
const today = new Date();
today.setHours(0, 0, 0, 0);

type ViewOption = "graphs" | "metrics";

type ChartData = {
  labels: string[];
  datasets: {
    data: number[];
    label?: string;
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
  legend?: string[];
};

type Props = {
  latestMetrics: LatestEggMetrics | null;
  eggCollectionLineData: ChartData;
  onManageClick: () => void;
  loading: boolean;
  error: string | null;
  onPeriodChange: (startDate: Date, endDate: Date) => void;
  earliestDataDate: Date | null;
};

// --- Sub-components using React Native Paper ---
type MetricItemProps = {
  icon: IconSource;
  value: string | React.ReactNode;
  label: string;
  isLoading?: boolean;
  isLatest?: boolean;
};

const MetricItem = ({
  icon,
  value,
  label,
  isLoading,
  isLatest,
}: MetricItemProps) => {
  return (
    <Card className="w-full h-full">
      <Card.Content className="items-center p-4 gap-2 flex-1 justify-center">
        <Icon source={icon} className="text-green-100" size={28} />
        {isLoading ? (
          <View
            className="h-8 w-[90px] rounded-lg bg-gray-200 dark:bg-gray-700"
          />
        ) : (
          <Text className="font-bold">
            {value}
          </Text>
        )}
        <Text className="text-center">
          {label} {isLatest && <Text>(Last Entry)</Text>}
        </Text>
      </Card.Content>
    </Card>
  );
};

const PaperDropdownSmall = ({
  items,
  selected,
  onSelect,
}: {
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Button
          mode="outlined"
          onPress={() => setVisible(true)}
          icon="chevron-down"
        >
          {selected}
        </Button>
      }
    >
      {items.map((item) => (
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
  );
};

const PoultryEggCard = ({
  latestMetrics,
  eggCollectionLineData: rawEggCollectionLineData,
  onManageClick,
  loading,
  error,
  onPeriodChange,
  earliestDataDate,
}: Props) => {
  const { darkMode } = useUserPreferences();
  const [activeView, setActiveView] = useState<ViewOption>("graphs");
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<PeriodOption>("Weekly");
  const [dateOffset, setDateOffset] = useState(0);

  const viewToggleOptions = [
    { value: "graphs", label: "Graphs", icon: "chart-line" },
    { value: "metrics", label: "Metrics", icon: "view-grid" },
  ];

  const currentInterval = useMemo(() => {
    let viewStartDate: Date, viewEndDate: Date;
    const referenceDate = today;
    if (selectedTimeRange === "Weekly") {
      const targetWeekStart = startOfWeek(addWeeks(referenceDate, dateOffset), {
        weekStartsOn: 1,
      });
      viewStartDate = targetWeekStart;
      viewEndDate = endOfWeek(targetWeekStart, { weekStartsOn: 1 });
    } else if (selectedTimeRange === "Monthly") {
      const targetMonthStart = startOfMonth(
        addMonths(referenceDate, dateOffset)
      );
      viewStartDate = targetMonthStart;
      viewEndDate = endOfMonth(targetMonthStart);
    } else {
      const threeMonthsViewEnd = endOfMonth(
        addMonths(referenceDate, dateOffset)
      );
      viewEndDate = minDateFn([threeMonthsViewEnd, today]);
      viewStartDate = startOfMonth(subMonths(viewEndDate, 2));
    }
    return { viewStartDate, viewEndDate };
  }, [selectedTimeRange, dateOffset]);

  useEffect(() => {
    onPeriodChange(currentInterval.viewStartDate, currentInterval.viewEndDate);
  }, [currentInterval, onPeriodChange]);

  useEffect(() => {
    setDateOffset(0);
  }, [selectedTimeRange]);

  const navigationStates = useMemo(() => {
    let isPrevDisabled = false;
    const isNextDisabled = dateOffset === 0;
    if (earliestDataDate) {
      if (selectedTimeRange === "Weekly") {
        const prevWeekStart = startOfWeek(addWeeks(today, dateOffset - 1), {
          weekStartsOn: 1,
        });
        isPrevDisabled =
          isBefore(prevWeekStart, earliestDataDate) &&
          !isBefore(addDaysDateFns(earliestDataDate, 6), prevWeekStart);
      } else if (selectedTimeRange === "Monthly") {
        const prevMonthStart = startOfMonth(addMonths(today, dateOffset - 1));
        isPrevDisabled =
          isBefore(prevMonthStart, earliestDataDate) &&
          !isBefore(endOfMonth(earliestDataDate), prevMonthStart);
      } else if (selectedTimeRange === "3 Months") {
        const threeMonthsAgoStart = startOfMonth(
          subMonths(addMonths(today, dateOffset), 2 + 3)
        );
        isPrevDisabled =
          isBefore(threeMonthsAgoStart, earliestDataDate) &&
          !isBefore(
            endOfMonth(addMonths(earliestDataDate, 2)),
            threeMonthsAgoStart
          );
      }
    } else {
      isPrevDisabled = true;
    }
    return { isPrevDisabled, isNextDisabled };
  }, [dateOffset, selectedTimeRange, earliestDataDate]);

  const handleTimeRangeSelect = (period: string) =>
    setSelectedTimeRange(period as PeriodOption);
  const handlePrev = () => setDateOffset((prev) => prev - 1);
  const handleNext = () => setDateOffset((prev) => prev + 1);

  const chartConfig = {
    backgroundColor: darkMode ? "#0a0a0a" : "#ffffff",
    backgroundGradientFrom: darkMode ? "#0a0a0a" : "#ffffff",
    backgroundGradientTo: darkMode ? "#0a0a0a" : "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) =>
      darkMode
        ? `rgba(209, 213, 219, ${opacity})`
        : `rgba(55, 65, 81, ${opacity})`,
    labelColor: (opacity = 1) =>
      `rgba(${darkMode ? "156, 163, 175" : "107, 114, 128"}, ${opacity})`,
    propsForDots: { r: "4", strokeWidth: "2" },
    style: { borderRadius: 16 },
  };

  const getDominantEggSize = (metrics: LatestEggMetrics | null): string => {
    if (!metrics) return "N/A";
    const sizesMap = {
      S: metrics.smallEggs || 0,
      M: metrics.mediumEggs || 0,
      L: metrics.largeEggs || 0,
      XL: metrics.extraLargeEggs || 0,
    };
    let maxCount = Math.max(...Object.values(sizesMap));
    if (maxCount === 0) return "N/A";
    return Object.entries(sizesMap)
      .filter(([, count]) => count === maxCount)
      .map(([size, count]) => `${size} (${count.toLocaleString()})`)
      .join(", ");
  };

  const renderContent = () => {
    if (loading && rawEggCollectionLineData.datasets.length === 0) {
      return (
        <View className="flex-1 justify-center items-center min-h-[300px] p-4 gap-3">
          <ActivityIndicator size="large" />
        </View>
      );
    }
    if (error) {
      return (
        <View className="flex-1 justify-center items-center min-h-[300px] p-4 gap-3">
          <Icon source="alert-circle" className="text-red-500" size={48} />
          <Text className="text-red-500">
            Error loading egg data
          </Text>
          <Text className="text-center">
            {error}
          </Text>
        </View>
      );
    }

    if (activeView === "metrics") {
      return (
        <View className="flex-row flex-wrap justify-between mt-4 gap-y-4">
          <View className="w-[48%] h-32">
            <MetricItem
              icon="egg-outline"
              value={getDominantEggSize(latestMetrics)}
              label="Dominant Size(s)"
              isLoading={loading && !latestMetrics}
              isLatest={!!latestMetrics}
            />
          </View>
          <View className="w-[48%] h-32">
            <MetricItem
              icon="alert-triangle-outline"
              value={
                latestMetrics ? latestMetrics.brokenEggs.toLocaleString() : "N/A"
              }
              label="Broken Eggs"
              isLoading={loading && !latestMetrics}
              isLatest={!!latestMetrics}
            />
          </View>
          <View className="w-[48%] h-32">
            <MetricItem
              icon="basket-outline"
              value={
                latestMetrics ? latestMetrics.totalEggs.toLocaleString() : "N/A"
              }
              label="Eggs Collected"
              isLoading={loading && !latestMetrics}
              isLatest={!!latestMetrics}
            />
          </View>
          <TouchableRipple
            onPress={!loading ? onManageClick : undefined}
            disabled={loading}
            className="w-[48%] h-32 rounded-xl overflow-hidden"
          >
            <MetricItem
              icon="plus-circle-outline"
              value={"Log & View"}
              label="Manage Records"
              isLoading={loading}
            />
          </TouchableRipple>
        </View>
      );
    }

    if (activeView === "graphs") {
      if (rawEggCollectionLineData.labels?.length === 0 && !loading) {
        return (
          <View className="flex-1 justify-center items-center min-h-[300px] p-4 gap-3">
            <Icon
              source="chart-line"
              className="text-gray-300 dark:text-gray-600"
              size={48}
            />
            <Text className="text-center">
              No egg collection data for this period.
            </Text>
            <Text
              className="text-gray-400 dark:text-gray-500 text-center"
            >
              Try logging collections or changing filters.
            </Text>
          </View>
        );
      }
      return (
        <>
          <View className="mt-4 justify-center items-center min-h-[320px]">
            {loading && (
              <View className="absolute inset-0 justify-center items-center z-10 rounded-2xl bg-black/40">
                <ActivityIndicator size="large" />
              </View>
            )}
            <LineChart
              data={rawEggCollectionLineData}
              width={Dimensions.get("window").width - 48}
              height={320}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 16 }}
              withShadow={false}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
            />
          </View>
          <View className="flex-row items-center justify-between mt-5">
            <Button
              icon="chevron-left"
              onPress={handlePrev}
              disabled={navigationStates.isPrevDisabled || loading}
            >
              Previous
            </Button>
            <PaperDropdownSmall
              items={TIME_RANGE_OPTIONS}
              selected={selectedTimeRange}
              onSelect={handleTimeRangeSelect}
            />
            <Button
              icon="chevron-right"
              onPress={handleNext}
              disabled={navigationStates.isNextDisabled || loading}
              contentStyle={{ flexDirection: "row-reverse" }}
            >
              Next
            </Button>
          </View>
        </>
      );
    }
    return null;
  };

  return (
    <Card className="flex-1">
      <Card.Content>
        <View className="gap-4 mb-2">
          <Text className="text-center">
            Egg Collection & Grading
          </Text>
          <SegmentedButtons
            value={activeView}
            onValueChange={(value: string) => setActiveView(value as ViewOption)}
            buttons={viewToggleOptions}
          />
        </View>
        {renderContent()}
      </Card.Content>
    </Card>
  );
};

export default PoultryEggCard;
