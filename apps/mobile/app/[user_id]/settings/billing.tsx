import { Icon } from "@/components/ui/Icon";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Chip,
  DataTable,
  Divider,
  Searchbar,
  Text,
} from "@/components/ui";
import { format } from "date-fns";

type Payment = {
  payment_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  plan_type: string;
  created_at: string;
};

const BillingScreen = () => {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const { plan, fetchUserSubTypes } = useUserPreferences();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string | null>(
    null
  );
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  // Table pagination
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  const fetchBillingData = useCallback(async () => {
    if (!user_id) return;
    setIsLoading(true);
    try {
      const [billingRes, userRes] = await Promise.all([
        axiosInstance.get(`/user/${user_id}/billing-history`),
        axiosInstance.get(`/user/${user_id}`),
      ]);

      const billingData = billingRes.data?.data?.payments ?? [];
      setPayments(billingData);

      const user = userRes.data?.data?.user ?? userRes.data?.user;
      if (user?.subscription_expires_at) {
        setSubscriptionExpiry(user.subscription_expires_at);
      }
      setPendingPlan(user?.pending_plan || null);
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user_id]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const handleCancelSubscription = () => {
    if (!user_id || plan === "FREE") return;

    Alert.alert(
      "Cancel Subscription?",
      "Your plan will be downgraded to Free. Your current features will remain active until the end of your billing cycle.",
      [
        { text: "Keep my plan", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: async () => {
            setIsCancelling(true);
            try {
              await axiosInstance.post(
                `/user/${user_id}/schedule-downgrade`,
                { plan: "FREE" }
              );
              Alert.alert(
                "Subscription Cancelled",
                "Your plan will revert to Free at the end of your current billing cycle."
              );
              if (user_id) {
                fetchUserSubTypes(user_id);
                fetchBillingData();
              }
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.data?.error ||
                  "Failed to cancel subscription. Please try again."
              );
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const filteredPayments = searchQuery
    ? payments.filter(
        (p) =>
          (p.razorpay_payment_id || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          p.plan_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.status.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : payments;

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredPayments.length);
  const paginatedPayments = filteredPayments.slice(from, to);

  const planLabel =
    plan === "PRO" ? "Pro" : plan === "BASIC" ? "Standard" : "Free";

  const hasPendingCancellation = pendingPlan === "FREE" && plan !== "FREE";

  return (
    <PlatformLayout>
      <Appbar.Header>
        <Appbar.Action
          icon={() => (
            <Icon
              type={"chevron-left"}
              size={22}
              className="text-black dark:text-white"
            />
          )}
          onPress={() => router.back()}
        />
        <Appbar.Content title="Billing" />
      </Appbar.Header>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 p-4 bg-white dark:bg-gray-900"
        >
          {/* Subscription Overview */}
          <Card className="mb-4">
            <Card.Content>
              <Text
                variant="titleMedium"
                className="font-bold mb-4"
              >
                Subscription Overview
              </Text>
 
              {/* Current Plan */}
              <View className="py-1">
                <Text
                  variant="bodySmall"
                  className="text-gray-500"
                >
                  Current Plan
                </Text>
                <Chip
                  mode="flat"
                  className={`self-start mt-1 ${
                    plan === "PRO"
                      ? "bg-green-100 dark:bg-green-900"
                      : plan === "BASIC"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                  textStyle={{
                    fontWeight: "bold",
                    fontSize: 12,
                    color: "inherit"
                  }}
                >
                  <Text className={
                    plan === "PRO"
                      ? "text-green-700 dark:text-green-300"
                      : plan === "BASIC"
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }>
                    {planLabel.toUpperCase()}
                  </Text>
                </Chip>
              </View>

              <Divider className="my-3" />
 
              {/* Next Transaction Date */}
              <View className="py-1">
                <Text
                  variant="bodySmall"
                  className="text-gray-500"
                >
                  Next Transaction Date
                </Text>
                <Text className="mt-1">
                  {plan === "FREE"
                    ? "—"
                    : hasPendingCancellation
                    ? "Cancelled"
                    : subscriptionExpiry
                    ? format(new Date(subscriptionExpiry), "MMM dd, yyyy")
                    : "N/A"}
                </Text>
              </View>

              <Divider className="my-3" />
 
              {/* Cancel Subscription */}
              <View className="py-1">
                <Text
                  variant="bodySmall"
                  className="text-gray-500"
                >
                  Cancel Subscription
                </Text>
                {plan === "FREE" ? (
                  <Text
                    variant="bodyMedium"
                    className="mt-1 text-gray-500"
                  >
                    No active subscription
                  </Text>
                ) : hasPendingCancellation ? (
                  <Text
                    variant="bodyMedium"
                    className="mt-1 text-orange-500 font-semibold"
                  >
                    Cancels on{" "}
                    {subscriptionExpiry
                      ? format(new Date(subscriptionExpiry), "MMM dd, yyyy")
                      : "end of billing cycle"}
                  </Text>
                ) : (
                  <Button
                    mode="contained"
                    onPress={handleCancelSubscription}
                    disabled={isCancelling}
                    loading={isCancelling}
                    className="self-start mt-1 bg-red-600"
                    compact
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Subscription"}
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Billing History */}
          <Card className="mb-4">
            <Card.Content>
              <Text
                variant="titleMedium"
                className="font-bold mb-3"
              >
                Billing History
              </Text>

              <Searchbar
                placeholder="Search transactions..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                className="mb-3"
                style={{ elevation: 0 }}
              />

              {filteredPayments.length === 0 ? (
                <View className="items-center justify-center py-8">
                  <Icon
                    type="credit-card-off-outline"
                    size={40}
                    className="text-gray-400"
                  />
                  <Text
                    variant="bodyMedium"
                    className="mt-2 text-gray-500"
                  >
                    No transactions found
                  </Text>
                </View>
              ) : (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator>
                    <DataTable style={{ width: 800 }}>
                      <DataTable.Header className="bg-gray-100 dark:bg-gray-800">
                        <DataTable.Title style={{ width: 200, paddingLeft: 8 }}>Payment ID</DataTable.Title>
                        <DataTable.Title style={{ width: 100 }}>Plan</DataTable.Title>
                        <DataTable.Title style={{ width: 120 }}>Amount</DataTable.Title>
                        <DataTable.Title style={{ width: 220 }}>Date & Time</DataTable.Title>
                        <DataTable.Title style={{ width: 120 }}>Status</DataTable.Title>
                      </DataTable.Header>

                      {paginatedPayments.map((payment) => (
                        <DataTable.Row key={payment.payment_id} className="border-b border-gray-100 dark:border-gray-800">
                          <DataTable.Cell style={{ width: 200, paddingLeft: 8 }}>
                            <Text className="font-medium">
                              {payment.razorpay_payment_id || "—"}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={{ width: 100 }}>{payment.plan_type}</DataTable.Cell>
                          <DataTable.Cell style={{ width: 120 }}>
                            <Text className="font-semibold">
                              {payment.currency} {payment.amount}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={{ width: 220 }}>
                            <Text>
                              {payment.created_at
                                ? format(new Date(payment.created_at), "MMM dd, yyyy HH:mm")
                                : "—"}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={{ width: 120 }}>
                            <Chip
                              mode="flat"
                              compact
                              className={`h-6 ${
                                payment.status === "SUCCESS"
                                  ? "bg-green-100 dark:bg-green-900"
                                  : "bg-red-100 dark:bg-red-900"
                              }`}
                              textStyle={{
                                fontSize: 10,
                                fontWeight: "bold",
                                color: "inherit"
                              }}
                            >
                              <Text className={
                                payment.status === "SUCCESS"
                                  ? "text-green-700 dark:text-green-300"
                                  : "text-red-700 dark:text-red-300"
                              }>
                                {payment.status === "SUCCESS" ? "Success" : "Failed"}
                              </Text>
                            </Chip>
                          </DataTable.Cell>
                        </DataTable.Row>
                      ))}
                    </DataTable>
                  </ScrollView>

                  <DataTable.Pagination
                    page={page}
                    numberOfPages={Math.ceil(
                      filteredPayments.length / itemsPerPage
                    )}
                    onPageChange={(p: number) => setPage(p)}
                    label={`${from + 1}-${to} of ${filteredPayments.length}`}
                    numberOfItemsPerPage={itemsPerPage}
                    showFastPaginationControls
                  />
                </>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      )}
    </PlatformLayout>
  );
};

export default BillingScreen;
