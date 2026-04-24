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
  useTheme,
} from "react-native-paper";
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
  const theme = useTheme();
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
              type={"arrow-left"}
              size={22}
              color={theme.colors.onSurface}
            />
          )}
          onPress={() => router.back()}
        />
        <Appbar.Content title="Billing" />
      </Appbar.Header>

      {isLoading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {/* Subscription Overview */}
          <Card style={styles.card}>
            <Card.Content>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "bold", marginBottom: 16 }}
              >
                Subscription Overview
              </Text>

              {/* Current Plan */}
              <View style={styles.overviewRow}>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Current Plan
                </Text>
                <Chip
                  mode="flat"
                  style={{
                    backgroundColor:
                      plan === "PRO"
                        ? "#dcfce7"
                        : plan === "BASIC"
                        ? "#dbeafe"
                        : "#f3f4f6",
                    alignSelf: "flex-start",
                    marginTop: 4,
                  }}
                  textStyle={{
                    fontWeight: "bold",
                    fontSize: 12,
                    color:
                      plan === "PRO"
                        ? "#166534"
                        : plan === "BASIC"
                        ? "#1e40af"
                        : "#374151",
                  }}
                >
                  {planLabel.toUpperCase()}
                </Chip>
              </View>

              <Divider style={{ marginVertical: 12 }} />

              {/* Next Transaction Date */}
              <View style={styles.overviewRow}>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Next Transaction Date
                </Text>
                <Text variant="bodyMedium" style={{ marginTop: 4 }}>
                  {plan === "FREE"
                    ? "—"
                    : hasPendingCancellation
                    ? "Cancelled"
                    : subscriptionExpiry
                    ? format(new Date(subscriptionExpiry), "MMM dd, yyyy")
                    : "N/A"}
                </Text>
              </View>

              <Divider style={{ marginVertical: 12 }} />

              {/* Cancel Subscription */}
              <View style={styles.overviewRow}>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Cancel Subscription
                </Text>
                {plan === "FREE" ? (
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 4,
                    }}
                  >
                    No active subscription
                  </Text>
                ) : hasPendingCancellation ? (
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: "#f97316",
                      fontWeight: "600",
                      marginTop: 4,
                    }}
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
                    buttonColor={theme.colors.error}
                    style={{ alignSelf: "flex-start", marginTop: 4 }}
                    compact
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Subscription"}
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Billing History */}
          <Card style={styles.card}>
            <Card.Content>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "bold", marginBottom: 12 }}
              >
                Billing History
              </Text>

              <Searchbar
                placeholder="Search transactions..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={{ marginBottom: 12, elevation: 0 }}
              />

              {filteredPayments.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon
                    type="credit-card-off-outline"
                    size={40}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 8,
                    }}
                  >
                    No transactions found
                  </Text>
                </View>
              ) : (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator>
                    <DataTable style={{ width: 800 }}>
                      <DataTable.Header style={{ backgroundColor: theme.colors.surfaceVariant }}>
                        <DataTable.Title style={{ width: 200, paddingLeft: 8 }}>Payment ID</DataTable.Title>
                        <DataTable.Title style={{ width: 100 }}>Plan</DataTable.Title>
                        <DataTable.Title style={{ width: 120 }}>Amount</DataTable.Title>
                        <DataTable.Title style={{ width: 220 }}>Date & Time</DataTable.Title>
                        <DataTable.Title style={{ width: 120 }}>Status</DataTable.Title>
                      </DataTable.Header>

                      {paginatedPayments.map((payment) => (
                        <DataTable.Row key={payment.payment_id} style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant }}>
                          <DataTable.Cell style={{ width: 200, paddingLeft: 8 }}>
                            <Text variant="bodySmall" style={{ fontWeight: '500' }}>
                              {payment.razorpay_payment_id || "—"}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={{ width: 100 }}>{payment.plan_type}</DataTable.Cell>
                          <DataTable.Cell style={{ width: 120 }}>
                            <Text style={{ fontWeight: '600' }}>
                              {payment.currency} {payment.amount}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={{ width: 220 }}>
                            <Text variant="bodySmall">
                              {payment.created_at
                                ? format(new Date(payment.created_at), "MMM dd, yyyy HH:mm")
                                : "—"}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={{ width: 120 }}>
                            <Chip
                              mode="flat"
                              compact
                              style={{
                                backgroundColor:
                                  payment.status === "SUCCESS"
                                    ? "#dcfce7"
                                    : "#fee2e2",
                                height: 24,
                              }}
                              textStyle={{
                                fontSize: 10,
                                fontWeight: "bold",
                                color:
                                  payment.status === "SUCCESS"
                                    ? "#166534"
                                    : "#991b1b",
                              }}
                            >
                              {payment.status === "SUCCESS" ? "Success" : "Failed"}
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
                    onPageChange={(p) => setPage(p)}
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: { marginBottom: 16 },
  overviewRow: { paddingVertical: 4 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
});

export default BillingScreen;
