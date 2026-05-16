import PlatformLayout from "@/components/layout/PlatformLayout";
import PoultryFeedsModal from "@/components/modals/poultry/PoultryFeedsModal";
import axiosInstance from "@/lib/axiosInstance";
import { format, parseISO } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Card,
  Icon,
  Searchbar,
  Text,
} from "@/components/ui";

type FeedRecord = {
  feed_id: number;
  user_id: number;
  flock_id: number;
  feed_given: string;
  amount_given: number;
  units: string;
  feed_date: string;
  created_at: string;
};

type ItemRecord = {
  inventory_id: number;
  item_name: string;
  units: string;
  quantity: number;
  feed?: boolean;
};

type FlockData = {
  flock_id: number;
  flock_name: string;
};

const PoultryFeedsScreen = () => {
  const router = useRouter();
  const { user_id, flock_id } = useLocalSearchParams<{
    user_id: string;
    flock_id: string;
  }>();

  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>([]);
  const [flockData, setFlockData] = useState<FlockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FeedRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableFeedItems, setAvailableFeedItems] = useState<ItemRecord[]>(
    []
  );
  const [loadingFeedItems, setLoadingFeedItems] = useState(true);

  const fetchFlockDetails = useCallback(async () => {
    if (!flock_id) return;
    try {
      const response = await axiosInstance.get<FlockData>(`/flock/${flock_id}`);
      setFlockData(response.data);
    } catch {
      setFlockData(null);
    }
  }, [flock_id]);

  const fetchFeedRecords = useCallback(async () => {
    if (!user_id || !flock_id) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get<{ records: FeedRecord[] }>(
        `/poultry-feeds/${user_id}?flockId=${flock_id}`
      );
      setFeedRecords(response.data.records || []);
    } catch {
      setFeedRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user_id, flock_id]);

  const fetchAvailableFeedInventory = useCallback(async () => {
    if (!user_id) {
      setLoadingFeedItems(false);
      return;
    }
    setLoadingFeedItems(true);
    try {
      const response = await axiosInstance.get<{ items: ItemRecord[] }>(
        `/inventory/${user_id}`,
        { params: { item_group: "Poultry" } }
      );
      setAvailableFeedItems(
        (response.data.items || []).filter((item) => item.feed === true)
      );
    } catch {
      setAvailableFeedItems([]);
    } finally {
      setLoadingFeedItems(false);
    }
  }, [user_id]);

  useEffect(() => {
    if (flock_id) fetchFlockDetails();
    if (user_id && flock_id) fetchFeedRecords();
    if (user_id) fetchAvailableFeedInventory();
  }, [
    user_id,
    flock_id,
    fetchFlockDetails,
    fetchFeedRecords,
    fetchAvailableFeedInventory,
  ]);

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return feedRecords;
    return feedRecords.filter((record) =>
      Object.values(record).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [feedRecords, searchQuery]);

  const handleAddRecord = () => {
    if (loadingFeedItems) {
      Alert.alert("Loading...", "Checking available feed items. Please wait.");
      return;
    }
    if (availableFeedItems.length === 0) {
      Alert.alert(
        "No Feed Items Found",
        "Your inventory has no items marked as feed. Please add feed items first."
      );
    } else {
      setEditingRecord(null);
      setShowFeedModal(true);
    }
  };

  const handleEditRecord = (record: FeedRecord) => {
    setEditingRecord(record);
    setShowFeedModal(true);
  };

  const pageTitle = flockData
    ? `Feed Records (${flockData.flock_name})`
    : "Feed Records";

  const renderItem = ({ item }: { item: FeedRecord }) => (
    <Card onPress={() => handleEditRecord(item)} className="mb-3">
      <Card.Content>
        <View className="flex-row justify-between items-start mb-2">
          <Text variant="titleMedium" className="flex-1 font-bold">
            {item.feed_given}
          </Text>
          <Text
            variant="labelSmall"
            className="text-gray-500"
          >
            Logged: {format(parseISO(item.created_at), "MMM d, yyyy")}
          </Text>
        </View>
        <View className="flex-row items-center mt-1">
          <Icon
            source="weight-kilogram"
            size={16}
            className="text-gray-500"
          />
          <Text variant="bodyMedium" className="ml-2">
            {item.amount_given.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {item.units}
          </Text>
        </View>
        <View className="flex-row items-center mt-1">
          <Icon
            source="calendar-month"
            size={16}
            className="text-gray-500"
          />
          <Text variant="bodyMedium" className="ml-2">
            {format(parseISO(item.feed_date), "PP")}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <PlatformLayout>
      <Appbar.Header className="bg-gray-900">
        <Appbar.BackAction
          color="white"
          onPress={() => {
            if (user_id && flock_id)
              router.push(`/${user_id}/poultry/${flock_id}`);
            else router.back();
          }}
        />
        <Appbar.Content
          title={pageTitle}
          titleStyle={{ color: "white" }}
          subtitle={
            loading ? "Loading..." : `${filteredRecords.length} Record(s)`
          }
          subtitleStyle={{ color: "rgba(255,255,255,0.7)" }}
        />
        <Appbar.Action
          icon="plus-circle"
          color="white"
          onPress={handleAddRecord}
          disabled={loadingFeedItems}
        />
      </Appbar.Header>
      <View className="flex-1 bg-gray-50 dark:bg-gray-950">
        <Searchbar
          placeholder="Search by feed name, date, units..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="m-4 mt-2"
        />
        {loading ? (
          <View className="flex-1 justify-center items-center p-4">
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={filteredRecords}
            renderItem={renderItem}
            keyExtractor={(item) => item.feed_id.toString()}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center p-4">
                <Text className="text-gray-400">
                  No feed records found for this flock.
                </Text>
              </View>
            }
          />
        )}
      </View>
      {showFeedModal && user_id && flock_id && (
        <PoultryFeedsModal
          isVisible={showFeedModal}
          onClose={() => {
            setShowFeedModal(false);
            setEditingRecord(null);
          }}
          formTitle={
            editingRecord
              ? `Edit Feed for ${flockData?.flock_name}`
              : `Log Feed for ${flockData?.flock_name}`
          }
          flockId={Number(flock_id)}
          userId={Number(user_id)}
          feedRecordToEdit={editingRecord}
          onRecordSaved={() => {
            fetchFeedRecords();
            fetchAvailableFeedInventory();
            setShowFeedModal(false);
            setEditingRecord(null);
          }}
        />
      )}
    </PlatformLayout>
  );
};

export default PoultryFeedsScreen;
