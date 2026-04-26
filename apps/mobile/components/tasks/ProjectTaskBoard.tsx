import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from "react-native";
import { Text, Searchbar, Button, Menu, useTheme, Card, SegmentedButtons, ActivityIndicator, Divider, FAB, IconButton } from "react-native-paper";
import axiosInstance from "@/lib/axiosInstance";
import { BottomDrawer } from "@/components/form/BottomDrawer";

type Task = {
  task_id: number;
  task: string;
  description?: string;
  status: string;
  priority: string;
  deadline?: string;
  project: string;
  user_id: number;
};

type Column = {
  id: string;
  title: string;
};

type Props = {
  userId: number;
  projectTitle: string;
};

const INITIAL_COLUMNS: Column[] = [
  { id: "todo", title: "TO DO" },
  { id: "progress", title: "IN PROGRESS" },
  { id: "check", title: "CHECK" },
  { id: "done", title: "DONE" },
];

const ProjectTaskBoard = ({ userId, projectTitle }: Props) => {
  const theme = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListView, setIsListView] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<string>("Priority");
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);
  const [isAddDrawerVisible, setIsAddDrawerVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsDrawerVisible, setIsDetailsDrawerVisible] = useState(false);
  const [isAddColumnDrawerVisible, setIsAddColumnDrawerVisible] = useState(false);

  const ADD_COLUMN_FIELDS = [
    { name: "title", label: "Column Title", type: "text" as const, required: true, icon: "format-title" as any },
  ];

  const ADD_TASK_FIELDS = [
    { name: "task", label: "Task Title", type: "text" as const, required: true, icon: "format-title" as any },
    { name: "priority", label: "Priority", type: "dropdown" as const, items: ["High", "Medium", "Low"], icon: "flag" as any, required: true },
    { name: "status", label: "Initial Status", type: "dropdown" as const, items: columns.map(c => c.title), icon: "progress-check" as any, required: true },
    { name: "description", label: "Description (Optional)", type: "text" as const, icon: "note-text" as any, multiline: true },
    { name: "deadline", label: "Deadline (Optional)", type: "date" as const },
  ];

  const DETAILS_TASK_FIELDS = [
    { name: "task", label: "Task Title", type: "text" as const, required: true, icon: "format-title" as any },
    { name: "priority", label: "Priority", type: "dropdown" as const, items: ["High", "Medium", "Low"], icon: "flag" as any, required: true },
    { name: "status", label: "Status", type: "dropdown" as const, items: columns.map(c => c.title), icon: "progress-check" as any, required: true },
    { name: "description", label: "Description", type: "text" as const, icon: "note-text" as any, multiline: true },
    { name: "deadline", label: "Deadline", type: "date" as const },
  ];

  const fetchTasks = useCallback(async () => {
    if (!userId || !projectTitle) return;
    setLoading(true);
    try {
      const [columnsResp, tasksResp] = await Promise.all([
        axiosInstance.get(`/tasks/columns/${userId}`, {
          params: { project: projectTitle },
        }),
        axiosInstance.get(`/tasks/${userId}`, {
          params: { project: projectTitle },
        }),
      ]);

      const fetchedCols = columnsResp.data.columns || [];
      if (fetchedCols.length > 0) {
        setColumns(fetchedCols.map((c: any) => ({
          id: c.column_id.toString(),
          title: c.title,
        })));
      }

      const fetchedTasks = Array.isArray(tasksResp.data) 
        ? tasksResp.data 
        : tasksResp.data.tasks || [];
      
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, projectTitle]);

  const handleAddTask = async (formData: any) => {
    try {
      const response = await axiosInstance.post("/tasks/add", {
        user_id: userId,
        project: projectTitle,
        task: formData.task,
        status: formData.status,
        priority: formData.priority,
        description: formData.description || "",
        deadline: formData.deadline || null,
      });
      setTasks(prev => [...prev, response.data]);
      setIsAddDrawerVisible(false);
    } catch (error) {
      console.error("Failed to add task:", error);
      throw error;
    }
  };

  const handleCreateColumn = async (formData: any) => {
    try {
      const response = await axiosInstance.post("/tasks/column/add", {
        userId: userId,
        project: projectTitle,
        title: formData.title.trim(),
        position: columns.length,
      });

      const newCol = response.data;
      setColumns((prev) => [...prev, { id: newCol.column_id.toString(), title: newCol.title }]);
      setIsAddColumnDrawerVisible(false);
    } catch (error) {
      console.error("Failed to add column:", error);
      Alert.alert("Error", "Failed to add column");
      throw error;
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    Alert.alert(
      "Delete Column",
      "This will delete the column. Tasks in it will be hidden from the board. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await axiosInstance.delete(`/tasks/column/delete/${columnId}`);
              
              // Find tasks in this column and update them to "unknown" like frontend
              const tasksToUpdate = tasks.filter(t => t.status === columnId || t.status.toLowerCase() === columns.find(c => c.id === columnId)?.title.toLowerCase());
              
              if (tasksToUpdate.length > 0) {
                await Promise.all(
                  tasksToUpdate.map(t => 
                    axiosInstance.put(`/tasks/update/${t.task_id}`, { status: "unknown" })
                  )
                );
              }

              setTasks(prev => prev.map(t => {
                const col = columns.find(c => c.id === columnId);
                if (t.status === columnId || t.status.toLowerCase() === col?.title.toLowerCase()) {
                  return { ...t, status: "unknown" };
                }
                return t;
              }));

              setColumns(prev => prev.filter(c => c.id !== columnId));
            } catch (error) {
              console.error("Failed to delete column:", error);
              Alert.alert("Error", "Failed to delete column.");
            }
          }
        },
      ]
    );
  };

  const handleUpdateTask = async (formData: any) => {
    if (!selectedTask) return;
    try {
      const payload = {
        task: formData.task,
        status: formData.status,
        priority: formData.priority,
        description: formData.description || null,
        deadline: formData.deadline || null,
      };
      await axiosInstance.put(`/tasks/update/${selectedTask.task_id}`, payload);
      setTasks(prev => prev.map(t => t.task_id === selectedTask.task_id ? { ...t, ...payload } : t));
      setIsDetailsDrawerVisible(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      await axiosInstance.delete(`/tasks/delete/${selectedTask.task_id}`);
      setTasks(prev => prev.filter(t => t.task_id !== selectedTask.task_id));
      setIsDetailsDrawerVisible(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
      Alert.alert("Error", "Failed to delete task.");
    }
  };

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsDrawerVisible(true);
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchMatch = !searchQuery || 
        task.task.toLowerCase().includes(searchQuery.toLowerCase());
      const priorityMatch = selectedPriority === "Priority" || selectedPriority === "None" ||
        task.priority?.toLowerCase() === selectedPriority.toLowerCase();
      return searchMatch && priorityMatch;
    });
  }, [tasks, searchQuery, selectedPriority]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high": return "#ef4444"; // red-500
      case "medium": return "#eab308"; // yellow-500
      case "low": return "#22c55e"; // green-500
      default: return "#6b7280"; // gray-500
    }
  };

  const renderTaskCard = (task: Task) => (
    <Card key={task.task_id} style={styles.taskCard} onPress={() => openTaskDetails(task)}>
      <Card.Content>
        <Text variant="titleMedium" numberOfLines={2} style={styles.taskTitle}>
          {task.task}
        </Text>
        <View style={styles.cardFooter}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + "20" }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
              {task.priority}
            </Text>
          </View>
          {task.deadline && (
            <Text variant="bodySmall" style={styles.deadlineText}>
              {formatDate(task.deadline)}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const BoardView = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boardContainer}>
      {columns.map((column) => {
        const columnTasks = filteredTasks.filter(t => 
          t.status?.toLowerCase() === column.title.toLowerCase() ||
          t.status === column.id
        );

        return (
          <View key={column.id} style={styles.column}>
            <View style={styles.columnHeader}>
              <Text variant="titleSmall" style={styles.columnTitle} numberOfLines={1}>
                {column.title}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{columnTasks.length}</Text>
                </View>
                <IconButton 
                  icon="delete-outline" 
                  size={18} 
                  onPress={() => handleDeleteColumn(column.id)}
                  style={{ margin: 0 }}
                />
              </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.columnScroll}>
              {columnTasks.map(renderTaskCard)}
              {columnTasks.length === 0 && (
                <View style={styles.emptyColumn}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceDisabled }}>
                    No tasks
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        );
      })}
      
      <TouchableOpacity 
        style={[styles.column, styles.addColumnBtn]} 
        onPress={() => setIsAddColumnDrawerVisible(true)}
      >
        <View style={styles.addColumnContent}>
          <IconButton icon="plus" size={24} />
          <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Add Column
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );

  const ListView = () => (
    <View style={styles.listContainer}>
      {filteredTasks.map((task, index) => (
        <View key={task.task_id}>
          <TouchableOpacity style={styles.listItem} onPress={() => openTaskDetails(task)}>
            <View style={styles.listMain}>
              <Text variant="bodyLarge" style={styles.taskTitle}>{task.task}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceDisabled }}>
                {task.status}
              </Text>
            </View>
            <View style={styles.listSide}>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + "20" }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                  {task.priority}
                </Text>
              </View>
              {task.deadline && (
                <Text variant="bodySmall" style={styles.deadlineText}>
                  {formatDate(task.deadline)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          {index < filteredTasks.length - 1 && <Divider />}
        </View>
      ))}
      {filteredTasks.length === 0 && (
        <View style={styles.centered}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceDisabled }}>
            No tasks found matching your filters.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchbarInput}
        />
        <View style={styles.actions}>
          <Menu
            visible={priorityMenuVisible}
            onDismiss={() => setPriorityMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setPriorityMenuVisible(true)}
                style={styles.priorityBtn}
                contentStyle={styles.priorityBtnContent}
                labelStyle={styles.priorityBtnLabel}
              >
                {selectedPriority}
              </Button>
            }
          >
            {["None", "Low", "Medium", "High"].map((p) => (
              <Menu.Item
                key={p}
                onPress={() => {
                  setSelectedPriority(p);
                  setPriorityMenuVisible(false);
                }}
                title={p}
              />
            ))}
          </Menu>

          <SegmentedButtons
            value={isListView ? "list" : "board"}
            onValueChange={(val) => setIsListView(val === "list")}
            buttons={[
              { value: "list", icon: "view-list", label: "List" },
              { value: "board", icon: "view-grid", label: "Board" },
            ]}
            style={styles.segmentedButtons}
            density="small"
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        isListView ? <ListView /> : <BoardView />
      )}

      <FAB
        icon="plus"
        onPress={() => setIsAddDrawerVisible(true)}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
      />

      <BottomDrawer
        isVisible={isAddDrawerVisible}
        onClose={() => setIsAddDrawerVisible(false)}
        onSubmit={handleAddTask}
        title="Add New Task"
        fields={ADD_TASK_FIELDS}
        initialValues={{
          priority: "Medium",
          status: columns[0]?.title || "To Do",
        }}
      />

      <BottomDrawer
        isVisible={isDetailsDrawerVisible}
        onClose={() => {
          setIsDetailsDrawerVisible(false);
          setSelectedTask(null);
        }}
        onSubmit={handleUpdateTask}
        title="Task Details"
        fields={DETAILS_TASK_FIELDS}
        initialValues={selectedTask ? {
          task: selectedTask.task,
          priority: selectedTask.priority,
          status: selectedTask.status,
          description: selectedTask.description,
          deadline: selectedTask.deadline?.split("T")[0],
        } : undefined}
        submitButtonText="Update Task"
      >
        <Button
          mode="text"
          onPress={() => {
            Alert.alert(
              "Delete Task",
              "Are you sure you want to delete this task?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: handleDeleteTask },
              ]
            );
          }}
          textColor={theme.colors.error}
          style={styles.deleteBtn}
          icon="delete"
        >
          Delete Task
        </Button>
      </BottomDrawer>
      <BottomDrawer
        isVisible={isAddColumnDrawerVisible}
        onClose={() => setIsAddColumnDrawerVisible(false)}
        onSubmit={handleCreateColumn}
        title="Add New Column"
        fields={ADD_COLUMN_FIELDS}
        submitButtonText="Create Column"
      />
    </View>
  );
};

const { width: windowWidth } = Dimensions.get("window");
const isTablet = windowWidth >= 768;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
    paddingBottom: 80, // Space for FAB
  },
  header: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  searchbar: {
    height: 40,
    elevation: 0,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderRadius: 8,
  },
  searchbarInput: {
    minHeight: 0,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  priorityBtn: {
    height: 32,
    borderRadius: 8,
  },
  priorityBtnContent: {
    height: 32,
  },
  priorityBtnLabel: {
    fontSize: 12,
    marginVertical: 0,
  },
  segmentedButtons: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  boardContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  column: {
    width: isTablet ? (windowWidth - 48) / 2 : windowWidth - 32,
    backgroundColor: "rgba(128, 128, 128, 0.05)",
    borderRadius: 12,
    padding: 12,
    maxHeight: 500,
  },
  columnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  columnTitle: {
    fontWeight: "bold",
    color: "#6b7280",
  },
  countBadge: {
    backgroundColor: "rgba(128, 128, 128, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  columnScroll: {
    flex: 1,
  },
  taskCard: {
    marginBottom: 8,
    elevation: 1,
  },
  taskTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  deadlineText: {
    color: "#6b7280",
  },
  emptyColumn: {
    alignItems: "center",
    padding: 20,
  },
  listContainer: {
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  listItem: {
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  listMain: {
    flex: 1,
  },
  listSide: {
    alignItems: "flex-end",
    gap: 4,
  },
  deleteBtn: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.2)",
  },
  addColumnBtn: {
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    height: 100, // Shorter than columns
  },
  addColumnContent: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProjectTaskBoard;
