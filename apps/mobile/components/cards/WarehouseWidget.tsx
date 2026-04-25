import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text, Card, useTheme, ActivityIndicator, Modal, Portal, Divider, Button } from "react-native-paper";
import { Icon } from "../ui/Icon";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type WarehouseRecord = {
  warehouse_id: number;
  name: string;
  type: string;
  city: string | null;
  state: string | null;
  storage_capacity: number | string | null;
  contact_person: string | null;
  phone: string | null;
  category?: string | null;
  items?: ItemRecord[];
};

type ItemRecord = {
  inventory_id: number;
  item_name: string;
  quantity: number;
  units: string;
  warehouse_id: number | null;
};

interface WarehouseWidgetProps {
  userId: string;
  serviceName: string;
}

const WarehouseWidget = ({ userId, serviceName }: WarehouseWidgetProps) => {
  const theme = useTheme();
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = (warehouse: WarehouseRecord) => {
    setSelectedWarehouse(warehouse);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setSelectedWarehouse(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) return;

        const [warehouseRes, inventoryRes] = await Promise.all([
          axios.get(`${API_URL}/warehouse/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/inventory/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { item_group: serviceName }
          })
        ]);
        
        const allWarehouses: WarehouseRecord[] = warehouseRes.data.warehouses || [];
        const allItems: ItemRecord[] = inventoryRes.data.items || [];

        const filteredWarehouses = allWarehouses.filter(w => 
          w.category === serviceName || 
          w.name.toLowerCase().includes(serviceName.toLowerCase())
        );

        const warehousesWithItems = filteredWarehouses.map(w => ({
          ...w,
          items: allItems.filter(item => item.warehouse_id === w.warehouse_id)
        }));

        setWarehouses(warehousesWithItems);
      } catch (error) {
        console.error("Error fetching warehouse data for mobile widget:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, serviceName]);

  if (loading) return <ActivityIndicator style={{ margin: 20 }} />;
  if (warehouses.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <Icon type={"warehouse" as any} size={24} color={theme.colors.primary} />
          </View>
          <View>
            <Text variant="titleMedium" style={styles.title}>Associated Storage</Text>
            <Text variant="bodySmall" style={styles.subtitle}>Warehouse for {serviceName}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push(`/${userId}/storage` as any)}>
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={[
          styles.listContainer, 
          warehouses.length > 2 && { maxHeight: 280 }
        ]}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        {warehouses.map((warehouse) => (
          <Card 
            key={warehouse.warehouse_id} 
            style={styles.card}
            onPress={() => router.push(`/${userId}/warehouse/${warehouse.warehouse_id}` as any)}
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={styles.warehouseName}>{warehouse.name}</Text>
                  <View style={styles.locationContainer}>
                    <Icon type={"map-marker" as any} size={14} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall" style={styles.locationText}>
                      {warehouse.city}, {warehouse.state}
                    </Text>
                  </View>
                </View>
                <View style={styles.badgeContainer}>
                  <View style={[styles.badge, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSecondaryContainer }}>
                      {warehouse.type.split(' ')[0]}
                    </Text>
                  </View>
                </View>
              </View>

              {warehouse.items && warehouse.items.length > 0 ? (
                <TouchableOpacity 
                  style={styles.inventoryContainer}
                  onPress={(e) => {
                    e.stopPropagation();
                    showModal(warehouse);
                  }}
                >
                  <View style={styles.inventoryHeader}>
                    <Icon type={"inventory" as any} size={12} color={theme.colors.primary} />
                    <Text variant="labelSmall" style={styles.inventoryTitle}>
                      STOCK ({warehouse.items.length})
                    </Text>
                    <Icon type={"chevron-right" as any} size={12} color={theme.colors.primary} style={{ marginLeft: 'auto' }} />
                  </View>
                  <View style={styles.inventoryGrid}>
                    {warehouse.items.slice(0, 2).map((item) => (
                      <View key={item.inventory_id} style={[styles.inventoryItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Text variant="labelSmall" numberOfLines={1} style={styles.itemName}>
                          {item.item_name}
                        </Text>
                        <Text variant="labelSmall" style={styles.itemQty}>
                          {item.quantity} {item.units.split(' ')[0]}
                        </Text>
                      </View>
                    ))}
                    {warehouse.items.length > 2 && (
                      <Text variant="labelSmall" style={styles.moreItems}>
                        + {warehouse.items.length - 2} more items
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.emptyInventory}>
                  <Text variant="labelSmall" style={styles.emptyText}>No items mapped</Text>
                </View>
              )}

              <View style={styles.footer}>
                <View style={styles.footerItem}>
                  <Icon type={"account" as any} size={16} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodySmall" style={styles.footerText}>
                    {warehouse.contact_person || 'N/A'}
                  </Text>
                </View>
                <View style={styles.footerItem}>
                  <Icon type={"phone" as any} size={16} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodySmall" style={styles.footerText}>
                    {warehouse.phone || 'N/A'}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={hideModal}
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.elevation.level3 }]}
        >
          {selectedWarehouse && (
            <View>
              <View style={styles.modalHeader}>
                <View>
                  <Text variant="titleLarge" style={styles.modalTitle}>{selectedWarehouse.name}</Text>
                  <Text variant="bodySmall" style={styles.modalSubtitle}>Stock Inventory</Text>
                </View>
                <TouchableOpacity onPress={hideModal} style={styles.modalCloseButton}>
                  <Icon type="close" size={24} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
              
              <Divider style={styles.modalDivider} />

              <ScrollView style={styles.modalItemsList}>
                {selectedWarehouse.items?.map((item) => (
                  <View key={item.inventory_id} style={styles.modalItemRow}>
                    <View style={styles.modalItemInfo}>
                      <Text variant="bodyLarge" style={styles.modalItemName}>{item.item_name}</Text>
                      <Text variant="bodySmall" style={styles.modalItemCategory}>{serviceName} Item</Text>
                    </View>
                    <View style={styles.modalItemBadge}>
                      <Text variant="titleMedium" style={[styles.modalItemQty, { color: theme.colors.primary }]}>
                        {item.quantity}
                      </Text>
                      <Text variant="labelSmall" style={styles.modalItemUnit}>{item.units}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <Divider style={styles.modalDivider} />

              <Button 
                mode="contained" 
                style={styles.viewMoreButton}
                onPress={() => {
                  hideModal();
                  router.push(`/${userId}/warehouse/${selectedWarehouse.warehouse_id}` as any);
                }}
              >
                View More Details
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  listContainer: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
  },
  title: {
    fontWeight: "bold",
  },
  subtitle: {
    opacity: 0.6,
  },
  card: {
    marginBottom: 12,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  warehouseName: {
    fontWeight: "600",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    opacity: 0.7,
  },
  badgeContainer: {
    alignItems: "flex-end",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    opacity: 0.7,
  },
  inventoryContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  inventoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  inventoryTitle: {
    fontWeight: "bold",
    opacity: 0.6,
  },
  inventoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  inventoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flex: 1,
    minWidth: "45%",
  },
  itemName: {
    flex: 1,
    marginRight: 4,
    opacity: 0.8,
  },
  itemQty: {
    fontWeight: "bold",
  },
  moreItems: {
    width: "100%",
    textAlign: "center",
    marginTop: 4,
    opacity: 0.6,
    fontStyle: "italic",
  },
  emptyInventory: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
  },
  emptyText: {
    opacity: 0.4,
    fontStyle: "italic",
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  modalSubtitle: {
    opacity: 0.6,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalDivider: {
    marginVertical: 12,
  },
  modalItemsList: {
    marginVertical: 8,
  },
  modalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemName: {
    fontWeight: '500',
  },
  modalItemCategory: {
    opacity: 0.5,
  },
  modalItemBadge: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  modalItemQty: {
    fontWeight: 'bold',
    lineHeight: 20,
  },
  modalItemUnit: {
    opacity: 0.6,
    fontSize: 10,
  },
  viewMoreButton: {
    marginTop: 8,
    borderRadius: 12,
  },
});

export default WarehouseWidget;
