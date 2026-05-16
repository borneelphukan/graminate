import { Icon } from "@/components/ui/Icon";
import { BottomDrawer } from "@/components/form/BottomDrawer";
import {
  COMPANY_FIELDS,
  CONTACT_FIELDS,
  CONTRACT_FIELDS,
  TASK_FIELDS,
  RECEIPT_FIELDS_WITH_ITEMS,
  CompanyFormData,
  ContactFormData,
  ContractFormData,
  TaskFormData,
} from "@/constants/formConfigs";
import ProjectTaskBoard from "@/components/tasks/ProjectTaskBoard";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Alert, FlatList, SafeAreaView, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  FAB,
  Menu,
  Text,
  useTheme,
} from "@/components/ui";

// No need for a custom 'api' instance here anymore, we'll use axiosInstance

// --- Type Definitions (No Changes) ---
type Contact = {
  contact_id: number;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone_number: string;
  type: string;
  created_at: string;
};
type Company = {
  company_id: number;
  company_name: string;
  contact_person: string;
  email: string | null;
  phone_number: string | null;
  type: string;
  created_at: string;
};
type Contract = {
  deal_id: number;
  deal_name: string;
  partner: string;
  amount: number;
  stage: string;
  created_at: string;
  start_date: string;
  end_date: string | null;
};
type Receipt = {
  invoice_id: number;
  title: string;
  bill_to: string;
  due_date: string;
  created_at: string;
  receipt_date: string;
};
type Task = { task_id: number; project: string; created_at: string };
type DataItem = Contact | Company | Contract | Receipt | Task;
type ViewType = "contacts" | "companies" | "contracts" | "tasks" | "receipts";
type ProjectGroup = { title: string; count: number; data: Task[] };

// --- Helper Functions (No Changes) ---
const formatDate = (dateString: string) => {
  if (!dateString) return "No date";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

// --- Card Components (Updated with FontAwesome) ---

const ContactCard = ({
  item,
  onPress,
}: {
  item: Contact;
  onPress: () => void;
}) => {
  const theme = useTheme();
  return (
    <Card onPress={onPress} className="mb-3">
      <Card.Title
        title={`${item.first_name} ${item.last_name || ""}`}
        subtitle={item.type}
      />
      <Card.Content>
        <View className="flex-row justify-between items-center mt-3">
          {item.email && (
            <View className="flex-row items-center">
              <Icon type={"email" as any} size={16} />
              <Text className="ml-2">{item.email}</Text>
            </View>
          )}
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {formatDate(item.created_at)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const CompanyCard = ({
  item,
  onPress,
}: {
  item: Company;
  onPress: () => void;
}) => {
  const theme = useTheme();
  return (
    <Card onPress={onPress} className="mb-3">
      <Card.Title
        title={item.company_name}
        subtitle={`Contact: ${item.contact_person}`}
      />
      <Card.Content>
        <View className="flex-row justify-between items-center mt-3">
          {item.phone_number && (
            <View className="flex-row items-center">
              <Icon type={"phone" as any} size={16} />
              <Text className="ml-2">{item.phone_number}</Text>
            </View>
          )}
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {formatDate(item.created_at)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const ContractCard = ({
  item,
  onPress,
}: {
  item: Contract;
  onPress: () => void;
}) => {
  const theme = useTheme();
  return (
    <Card onPress={onPress} className="mb-3">
      <Card.Title
        title={item.deal_name}
        titleNumberOfLines={2}
        right={() => (
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.primary, marginRight: 16 }}
          >
            {formatCurrency(item.amount)}
          </Text>
        )}
      />
      <Card.Content>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Partner: {item.partner}
        </Text>
        <View className="flex-row justify-between items-center mt-3">
          <Chip>{item.stage}</Chip>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            End Date: {item.end_date ? formatDate(item.end_date) : "N/A"}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const ReceiptCard = ({
  item,
  onPress,
}: {
  item: Receipt;
  onPress: () => void;
}) => {
  const theme = useTheme();
  return (
    <Card onPress={onPress} className="mb-3">
      <Card.Title title={item.title} subtitle={`Billed to: ${item.bill_to}`} />
      <Card.Content>
        <View className="flex-row justify-between items-center mt-3">
          <View className="flex-row items-center">
            <Icon
              type={"calendar-month" as any}
              size={16}
              color={theme.colors.error}
            />
            <Text className="ml-2" style={{ color: theme.colors.error }}>
              Due: {formatDate(item.due_date)}
            </Text>
          </View>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Issued: {formatDate(item.receipt_date || item.created_at)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const ProjectGroupCard = ({ group, onPress }: { group: ProjectGroup; onPress: () => void }) => (
  <Card className="mb-3" onPress={onPress}>
    <Card.Title
      title={group.title}
      right={() => (
        <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
          <Text className="mr-4 text-sm">
            {group.count} task{group.count !== 1 ? "s" : ""}
          </Text>
          <Icon type="chevron-right" size={20} />
        </View>
      )}
    />
  </Card>
);

// --- Main CRM Component ---

const CRM = () => {
  // --- Hooks and State (No Changes) ---
  const {
    user_id,
    refresh,
    view: viewFromParams,
  } = useLocalSearchParams<{
    user_id: string;
    refresh?: string;
    view?: ViewType;
  }>();
  const theme = useTheme();
  const { plan } = useUserPreferences();
  const [view, setView] = useState<ViewType>(viewFromParams || "contacts");
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isContactFormVisible, setContactFormVisible] = useState(false);
  const [isCompanyFormVisible, setCompanyFormVisible] = useState(false);
  const [isContractFormVisible, setContractFormVisible] = useState(false);
  const [isTaskFormVisible, setTaskFormVisible] = useState(false);
  const [isReceiptFormVisible, setReceiptFormVisible] = useState(false);
  const [userProjects, setUserProjects] = useState<string[]>([]);
  const [allSales, setAllSales] = useState<any[]>([]);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string | null>(null);

  const fetchAllSales = useCallback(async () => {
    if (!user_id) return;
    try {
      const response = await axiosInstance.get(`/sales/user/${user_id}`);
      setAllSales(response.data.sales || []);
    } catch {
      console.error("Error fetching sales:");
    }
  }, [user_id]);

  const fetchUserProjects = useCallback(async () => {
    if (!user_id) return;
    try {
      const response = await axiosInstance.get(`/user/${user_id}`);
      const user = response.data?.data?.user ?? response.data?.user;
      setUserProjects(Array.isArray(user?.sub_type) ? user.sub_type : []);
    } catch {
      console.error("Error fetching user projects:");
    }
  }, [user_id]);
  const [sortCriterion, setSortCriterion] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isSortMenuVisible, setSortMenuVisible] = useState(false);

  // --- VIEW_CONFIG (Updated with FontAwesome icon objects) ---
  const VIEW_CONFIG = useMemo(
    () => ({
      contacts: {
        title: "Contacts",
        endpoint: `/contacts/${user_id}`,
        dataKey: "contacts",
        icon: "account-cog",
        addText: "Contact",
      },
      companies: {
        title: "Companies",
        endpoint: `/companies/${user_id}`,
        dataKey: "companies",
        icon: "domain",
        addText: "Company",
      },
      contracts: {
        title: "Contracts",
        endpoint: `/contracts/${user_id}`,
        dataKey: "contracts",
        icon: "contract",
        addText: "Contract",
      },
      tasks: {
        title: "Projects",
        endpoint: `/tasks/${user_id}`,
        dataKey: "tasks",
        icon: "list_alt",
        addText: "Project",
      },
      receipts: {
        title: "Receipts",
        endpoint: `/receipts/${user_id}`,
        dataKey: "receipts",
        icon: "file-document",
        addText: "Receipt",
      },
    }),
    [user_id]
  );

  // --- Logic and Functions (No Changes) ---
  const SORT_OPTIONS: {
    [key in ViewType]: { value: string; label: string }[];
  } = useMemo(
    () => ({
      contacts: [
        { value: "created_at", label: "Date Created" },
        { value: "first_name", label: "Name" },
        { value: "type", label: "Type" },
      ],
      companies: [
        { value: "created_at", label: "Date Created" },
        { value: "company_name", label: "Name" },
        { value: "type", label: "Type" },
      ],
      contracts: [
        { value: "created_at", label: "Date Created" },
        { value: "deal_name", label: "Name" },
        { value: "stage", label: "Stage" },
        { value: "amount", label: "Amount" },
      ],
      tasks: [
        { value: "title", label: "Project Name" },
        { value: "count", label: "Task Count" },
      ],
      receipts: [
        { value: "created_at", label: "Date Created" },
        { value: "title", label: "Title" },
        { value: "bill_to", label: "Bill To" },
      ],
    }),
    []
  );

  const handleSelectView = useCallback(
    (newView: ViewType) => {
      if (view !== newView) {
        setView(newView);
        setData([]);
        setSearchQuery("");
        setSortCriterion(SORT_OPTIONS[newView][0].value);
        setSortOrder("desc");
        setSelectedProjectTitle(null);
      }
    },
    [view, SORT_OPTIONS],
  );

  useEffect(() => {
    if (viewFromParams && viewFromParams !== view)
      handleSelectView(viewFromParams);
  }, [viewFromParams, handleSelectView, view]);

  const fetchData = useCallback(
    async (currentView: ViewType) => {
      if (!user_id) return;
      setLoading(true);
      setError(null);
      const config = VIEW_CONFIG[currentView];
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) throw new Error("Authentication token not found.");
        const response = await axiosInstance.get(config.endpoint);
        setData(
          Array.isArray(response.data?.[config.dataKey])
            ? response.data[config.dataKey]
            : []
        );
      } catch {
        setError("An error occurred.");
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [user_id, VIEW_CONFIG]
  );

  useEffect(() => {
    fetchData(view);
  }, [view, fetchData, refresh]);

  const handleCreateContact = async (formData: ContactFormData) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token || !user_id) throw new Error("Authentication error.");
      const payload = {
        ...formData,
        user_id: Number(user_id),
        email: formData.email || null,
        phone_number: formData.phone_number || null,
        address_line_2: formData.address_line_2 || null,
      };
      await axiosInstance.post("/contacts/add", payload);
      Alert.alert("Success", "Contact created successfully.");
      await fetchData("contacts");
    } catch (err) {
      const errorMessage = "An unexpected error occurred.";
      Alert.alert("Creation Failed", errorMessage);
      throw err;
    }
  };

  const handleCreateCompany = async (formData: CompanyFormData) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token || !user_id) throw new Error("Authentication error.");
      const payload = {
        user_id: Number(user_id),
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        type: formData.type,
        address_line_1: formData.address_line_1,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        email: formData.email || null,
        phone_number: formData.phone_number || null,
        address_line_2: formData.address_line_2 || null,
        website: formData.website || null,
        industry: formData.industry || null,
      };
      await axiosInstance.post("/companies/add", payload);
      Alert.alert("Success", "Company created successfully.");
      await fetchData("companies");
    } catch (err) {
      const errorMessage = "An unexpected error occurred.";
      Alert.alert("Creation Failed", errorMessage);
      throw err;
    }
  };

  const handleCreateContract = async (formData: ContractFormData) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token || !user_id) throw new Error("Authentication error.");
      const payload = {
        user_id: Number(user_id),
        deal_name: formData.deal_name,
        stage: formData.stage,
        amount: parseFloat(formData.amount),
        start_date: formData.start_date,
        priority: formData.priority,
        partner: formData.partner || null,
        end_date: formData.end_date || null,
        category: formData.category || null,
      };
      await axiosInstance.post("/contracts/add", payload);
      Alert.alert("Success", "Contract created successfully.");
      await fetchData("contracts");
    } catch (err) {
      const errorMessage = "An unexpected error occurred.";
      Alert.alert("Creation Failed", errorMessage);
      throw err;
    }
  };

  const handleCreateTask = async (formData: TaskFormData) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token || !user_id) throw new Error("Authentication error.");
      const payload = { user_id: Number(user_id), project: formData.project };
      await axiosInstance.post("/tasks/add", payload);
      Alert.alert("Success", "Project created successfully.");
      await fetchData("tasks");
    } catch (err) {
      const errorMessage = "An unexpected error occurred.";
      Alert.alert("Creation Failed", errorMessage);
      throw err;
    }
  };

  const handleCreateReceipt = async (formData: any) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token || !user_id) throw new Error("Authentication error.");
      const items = formData.items || [];
      const payload = {
        user_id: Number(user_id),
        title: formData.title,
        receiptNumber: formData.receiptNumber,
        billTo: formData.billTo,
        dueDate: formData.dueDate,
        notes: formData.notes,
        tax: String(formData.tax || "0"),
        discount: String(formData.discount || "0"),
        shipping: String(formData.shipping || "0"),
        items: items.map((i: any) => ({
          description: i.description || "",
          quantity: String(i.quantity || "1"),
          rate: String(i.price || "0"),
        })),
        linked_sale_id: formData.linked_sale_id
          ? allSales.find(
              (s) =>
                (s.sales_name || `Sale #${s.sales_id}`) ===
                formData.linked_sale_id
            )?.sales_id
          : null,
      };
      await axiosInstance.post("/receipts/add", payload);
      Alert.alert("Success", "Receipt created successfully.");
      setReceiptFormVisible(false);
      await fetchData("receipts");
    } catch {
      const errorMessage = "An unexpected error occurred.";
      Alert.alert("Creation Failed", errorMessage);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  const sortedData = useMemo(() => {
    if (view === "tasks") return [];
    return [...filteredData].sort((a, b) => {
      const itemA = a as any,
        itemB = b as any;
      const valA = itemA[sortCriterion],
        valB = itemB[sortCriterion];
      if (valA === undefined || valA === null)
        return sortOrder === "asc" ? -1 : 1;
      if (valB === undefined || valB === null)
        return sortOrder === "asc" ? 1 : -1;
      let comparison = 0;
      if (
        [
          "created_at",
          "start_date",
          "end_date",
          "due_date",
          "receipt_date",
        ].includes(sortCriterion)
      ) {
        comparison = new Date(valA).getTime() - new Date(valB).getTime();
      } else if (typeof valA === "number" && typeof valB === "number") {
        comparison = valA - valB;
      } else {
        comparison = String(valA)
          .toLowerCase()
          .localeCompare(String(valB).toLowerCase());
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });
  }, [filteredData, sortCriterion, sortOrder, view]);

  const groupedTasksData = useMemo(() => {
    if (view !== "tasks") return [];
    const groups = (filteredData as Task[]).reduce((acc, task) => {
      if (!acc[task.project]) acc[task.project] = [];
      acc[task.project].push(task);
      return acc;
    }, {} as { [key: string]: Task[] });
    const mappedGroups = Object.keys(groups).map((key) => ({
      title: key,
      count: groups[key].length,
      data: groups[key],
    }));
    return mappedGroups.sort((a, b) => {
      const valA = a[sortCriterion as keyof ProjectGroup],
        valB = b[sortCriterion as keyof ProjectGroup];
      let comparison = 0;
      if (typeof valA === "number" && typeof valB === "number")
        comparison = valA - valB;
      else comparison = String(valA).localeCompare(String(valB));
      return sortOrder === "desc" ? -comparison : comparison;
    });
  }, [filteredData, view, sortCriterion, sortOrder]);

  const isLimitReached = useMemo(() => {
    if (plan !== "FREE") return false;
    switch (view) {
      case "contacts":
        return data.length >= 15;
      case "companies":
        return data.length >= 15;
      case "contracts":
        return data.length >= 15;
      default:
        return false;
    }
  }, [plan, view, data]);

  const resultCount =
    view === "tasks" ? groupedTasksData.length : sortedData.length;

  useEffect(() => {
    fetchData(view);
    if (view === "tasks") {
      fetchUserProjects();
    } else if (view === "receipts") {
      fetchAllSales();
    }
  }, [view, fetchData, fetchUserProjects, fetchAllSales]);

  const receiptFields = useMemo(() => {
    return RECEIPT_FIELDS_WITH_ITEMS.map((f) => {
      if (f.name === "linked_sale_id") {
        return {
          ...f,
          items: allSales.map((s) => s.sales_name || `Sale #${s.sales_id}`),
        };
      }
      return f;
    });
  }, [allSales]);

  const taskFields = useMemo(() => {
    return TASK_FIELDS.map((f) => {
      if (f.name === "project") {
        return { ...f, items: userProjects };
      }
      return f;
    });
  }, [userProjects]);

  const handleAddButtonPress = () => {
    if (isLimitReached) {
      const itemType = view.charAt(0).toUpperCase() + view.slice(1, -1);
      Alert.alert(
        "Limit Reached",
        `Free users are limited to 15 ${itemType}s. Please upgrade to Standard or Pro for unlimited access.`
      );
      return;
    }
    if (view === "contacts") setContactFormVisible(true);
    else if (view === "companies") setCompanyFormVisible(true);
    else if (view === "contracts") setContractFormVisible(true);
    else if (view === "tasks") setTaskFormVisible(true);
    else if (view === "receipts") setReceiptFormVisible(true);
  };

  const renderItem = ({ item }: { item: DataItem }) => {
    switch (view) {
      case "contacts":
        const contact = item as Contact;
        return (
          <ContactCard
            item={contact}
            onPress={() =>
              router.push(
                `/${user_id}/contacts/${
                  contact.contact_id
                }?data=${encodeURIComponent(JSON.stringify(contact))}`
              )
            }
          />
        );
      case "companies":
        const company = item as Company;
        return (
          <CompanyCard
            item={company}
            onPress={() =>
              router.push(
                `/${user_id}/companies/${
                  company.company_id
                }?data=${encodeURIComponent(JSON.stringify(company))}`
              )
            }
          />
        );
      case "contracts":
        const contract = item as Contract;
        return (
          <ContractCard
            item={contract}
            onPress={() =>
              router.push(
                `/${user_id}/contracts/${
                  contract.deal_id
                }?data=${encodeURIComponent(JSON.stringify(contract))}`
              )
            }
          />
        );
      case "receipts":
        const receipt = item as Receipt;
        return (
          <ReceiptCard
            item={receipt}
            onPress={() =>
              router.push(
                `/${user_id}/receipts/${
                  receipt.invoice_id
                }?data=${encodeURIComponent(JSON.stringify(receipt))}`
              )
            }
          />
        );
      default:
        return null;
    }
  };

  const keyExtractor = (item: DataItem): string => {
    if ((item as Contact).contact_id)
      return `contact-${(item as Contact).contact_id}`;
    if ((item as Company).company_id)
      return `company-${(item as Company).company_id}`;
    if ((item as Contract).deal_id)
      return `contract-${(item as Contract).deal_id}`;
    if ((item as Receipt).invoice_id)
      return `receipt-${(item as Receipt).invoice_id}`;
    if ((item as Task).task_id) return `task-${(item as Task).task_id}`;
    return `item-${Math.random()}`;
  };

  // --- renderContent (Updated with FontAwesome) ---
  const renderContent = () => {
    if (loading)
      return (
        <View className="flex-1 justify-center items-center p-4 gap-4">
          <ActivityIndicator size="large" />
        </View>
      );
    if (error)
      return (
        <View className="flex-1 justify-center items-center p-4 gap-4">
          <Text style={{ color: theme.colors.error }}>{error}</Text>
          <Button onPress={() => fetchData(view)}>Try Again</Button>
        </View>
      );

    if (view === "tasks") {
      if (selectedProjectTitle) {
        return (
          <View style={{ flex: 1 }}>
            <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Button 
                mode="text" 
                compact 
                icon="chevron-left" 
                onPress={() => setSelectedProjectTitle(null)}
              >
                Back
              </Button>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{selectedProjectTitle}</Text>
            </View>
            <ProjectTaskBoard 
              userId={Number(user_id)} 
              projectTitle={selectedProjectTitle} 
            />
          </View>
        );
      }

      if (groupedTasksData.length === 0) {
        return (
          <View className="flex-1 justify-center items-center p-4 gap-4">
            <Icon
              type={(VIEW_CONFIG[view].icon) as any}
              size={64}
              color={theme.colors.onSurfaceDisabled}
            />
            <Text style={{ color: theme.colors.onSurfaceDisabled }}>
              {searchQuery
                ? `No projects found for "${searchQuery}"`
                : `No projects found.`}
            </Text>
          </View>
        );
      }
      return (
        <FlatList<ProjectGroup>
          data={groupedTasksData}
          renderItem={({ item }) => (
            <ProjectGroupCard 
              group={item} 
              onPress={() => setSelectedProjectTitle(item.title)}
            />
          )}
          keyExtractor={(item) => item.title}
          onRefresh={() => fetchData(view)}
          refreshing={loading}
          contentContainerClassName="p-4 pb-24"
        />
      );
    }

    if (sortedData.length === 0) {
      return (
        <View className="flex-1 justify-center items-center p-4 gap-4">
          <Icon
            type={(VIEW_CONFIG[view].icon) as any}
            size={64}
            color={theme.colors.onSurfaceDisabled}
          />
          <Text style={{ color: theme.colors.onSurfaceDisabled }}>
            {searchQuery
              ? `No ${view} found for "${searchQuery}"`
              : `No ${view} found. Add one to get started.`}
          </Text>
        </View>
      );
    }
    return (
      <FlatList<DataItem>
        data={sortedData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onRefresh={() => fetchData(view)}
        refreshing={loading}
        contentContainerClassName="p-4 pb-24"
      />
    );
  };

  // --- Main Return JSX (Updated with FontAwesome) ---
  return (
    <PlatformLayout>
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: theme.colors.background }}
      >
        <View
          className="p-4 gap-4 border-b"
          style={{ borderBottomColor: theme.colors.outlineVariant }}
        >
          <Text variant="headlineMedium" style={{ marginBottom: 8 }}>
            {VIEW_CONFIG[view].title}
          </Text>

          <View className="flex-row justify-between items-center">
            <Text variant="labelMedium">
              {resultCount} Result{resultCount !== 1 ? "s" : ""}
            </Text>
            <Menu
              visible={isSortMenuVisible}
              onDismiss={() => setSortMenuVisible(false)}
              anchor={
                <Button
                  onPress={() => setSortMenuVisible(true)}
                  icon={({ size, color }: any) => (
                    <Icon
                      type={(sortOrder === "desc" ? "arrow-down" : "arrow-up") as any}
                      size={size}
                      color={color}
                    />
                  )}
                >
                  Sort
                </Button>
              }
            >
              {SORT_OPTIONS[view].map((option) => (
                <Menu.Item
                  key={option.value}
                  title={option.label}
                  onPress={() => {
                    setSortCriterion(option.value);
                    setSortMenuVisible(false);
                  }}
                />
              ))}
              <Divider />
              <Menu.Item
                title="Ascending"
                onPress={() => {
                  setSortOrder("asc");
                  setSortMenuVisible(false);
                }}
              />
              <Menu.Item
                title="Descending"
                onPress={() => {
                  setSortOrder("desc");
                  setSortMenuVisible(false);
                }}
              />
            </Menu>
          </View>
        </View>
        {renderContent()}
        <FAB
          icon={({ size, color }: any) => (
            <Icon type={"plus" as any} size={size} color={color} />
          )}
          label={VIEW_CONFIG[view].addText}
          className="absolute m-4 right-0 bottom-0"
          onPress={handleAddButtonPress}
        />
        <BottomDrawer
          isVisible={isContactFormVisible}
          onClose={() => setContactFormVisible(false)}
          title="Add New Contact"
          fields={CONTACT_FIELDS}
          onSubmit={handleCreateContact}
          submitButtonText="Save Contact"
        />

        <BottomDrawer
          isVisible={isCompanyFormVisible}
          onClose={() => setCompanyFormVisible(false)}
          title="Add New Company"
          fields={COMPANY_FIELDS}
          onSubmit={handleCreateCompany}
          submitButtonText="Save Company"
        />

        <BottomDrawer
          isVisible={isContractFormVisible}
          onClose={() => setContractFormVisible(false)}
          title="Add New Contract"
          fields={CONTRACT_FIELDS}
          onSubmit={handleCreateContract}
          submitButtonText="Save Contract"
        />
        <BottomDrawer
          isVisible={isTaskFormVisible}
          onClose={() => setTaskFormVisible(false)}
          onSubmit={handleCreateTask}
          title="Add New Task"
          fields={taskFields}
        />
        <BottomDrawer
          isVisible={isReceiptFormVisible}
          onClose={() => setReceiptFormVisible(false)}
          onSubmit={handleCreateReceipt}
          title="Add New Receipt"
          fields={receiptFields}
        />
      </SafeAreaView>
    </PlatformLayout>
  );
};

export default CRM;
