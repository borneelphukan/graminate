import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from "react-native";
import { Text, Searchbar, Button, Menu, Card, SegmentedButtons, ActivityIndicator, Divider, FAB, IconButton } from "@/components/ui";
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
    } catch {
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
    <Card key={task.task_id} className="mb-2 elevation-sm bg-white dark:bg-dark-surface rounded-lg overflow-hidden" onPress={() => openTaskDetails(task)}>
      <Card.Content>
        <Text variant="titleMedium" numberOfLines={2} className="font-semibold mb-2 text-dark dark:text-light">
          {task.task}
        </Text>
        <View className="flex-row justify-between items-center">
          <View className="px-1.5 py-0.5 rounded" style={{ backgroundColor: getPriorityColor(task.priority) + "20" }}>
            <Text className="text-[10px] font-bold" style={{ color: getPriorityColor(task.priority) }}>
              {task.priority}
            </Text>
          </View>
          {task.deadline && (
            <Text variant="bodySmall" className="text-gray-400 dark:text-gray-500">
              {formatDate(task.deadline)}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const BoardView = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 gap-4">
      {columns.map((column) => {
        const columnTasks = filteredTasks.filter(t => 
          t.status?.toLowerCase() === column.title.toLowerCase() ||
          t.status === column.id
        );

        return (
          <View key={column.id} className="w-[300px] bg-gray-50 dark:bg-dark-surface/50 rounded-xl p-3 max-h-[500px]">
            <View className="flex-row justify-between items-center mb-3">
              <Text variant="titleSmall" className="font-bold text-gray-400 dark:text-gray-500" numberOfLines={1}>
                {column.title}
              </Text>
              <View className="flex-row items-center">
                <View className="bg-gray-200 dark:bg-gray-700 rounded-xl px-2 py-0.5">
                  <Text className="text-[10px] font-bold text-dark dark:text-light">{columnTasks.length}</Text>
                </View>
                <IconButton 
                   icon="delete-outline" 
                   size={18} 
                   onPress={() => handleDeleteColumn(column.id)}
                   className="m-0"
                />
              </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {columnTasks.map(renderTaskCard)}
              {columnTasks.length === 0 && (
                <View className="items-center p-5">
                  <Text variant="bodySmall" className="text-gray-400 dark:text-gray-600">
                    No tasks
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        );
      })}
      
      <TouchableOpacity 
        className="w-[300px] bg-gray-50 dark:bg-dark-surface/50 border-dashed border border-gray-300 dark:border-gray-700 rounded-xl justify-center items-center h-[100px]"
        onPress={() => setIsAddColumnDrawerVisible(true)}
      >
        <View className="items-center justify-center">
          <IconButton icon="plus" size={24} />
          <Text variant="titleSmall" className="text-gray-400 dark:text-gray-500">
            Add Column
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );

  const ListView = () => (
    <View className="px-4 bg-transparent">
      {filteredTasks.map((task, index) => (
        <View key={task.task_id}>
          <TouchableOpacity className="flex-row items-center py-3" onPress={() => openTaskDetails(task)}>
            <View className="flex-1">
              <Text variant="bodyLarge" className="font-semibold text-dark dark:text-light">{task.task}</Text>
              <Text variant="bodySmall" className="text-gray-400 dark:text-gray-600">
                {task.status}
              </Text>
            </View>
            <View className="items-end gap-1">
              <View className="px-1.5 py-0.5 rounded" style={{ backgroundColor: getPriorityColor(task.priority) + "20" }}>
                <Text className="text-[10px] font-bold" style={{ color: getPriorityColor(task.priority) }}>
                  {task.priority}
                </Text>
              </View>
              {task.deadline && (
                <Text variant="bodySmall" className="text-gray-400 dark:text-gray-500">
                  {formatDate(task.deadline)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          {index < filteredTasks.length - 1 && <Divider />}
        </View>
      ))}
      {filteredTasks.length === 0 && (
        <View className="flex-1 justify-center items-center p-10">
          <Text variant="bodyMedium" className="text-gray-400 dark:text-gray-600">
            No tasks found matching your filters.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 mt-4 pb-20">
      <View className="px-4 gap-3 mb-4">
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
          className="h-10 elevation-none bg-gray-100 dark:bg-gray-800 rounded-lg"
          inputStyle={{ minHeight: 0 }}
        />
        <View className="flex-row justify-between items-center gap-2">
          <Menu
            visible={priorityMenuVisible}
            onDismiss={() => setPriorityMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setPriorityMenuVisible(true)}
                className="h-8 rounded-lg"
                contentStyle={{ height: 32 }}
                labelStyle={{ fontSize: 12, marginVertical: 0 }}
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
            onValueChange={(val: string) => setIsListView(val === "list")}
            buttons={[
              { value: "list", icon: "view-list", label: "List" },
              { value: "board", icon: "view-grid", label: "Board" },
            ]}
            className="flex-1"
            density="small"
          />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center p-10">
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        isListView ? <ListView /> : <BoardView />
      )}

      <FAB
        icon="plus"
        onPress={() => setIsAddDrawerVisible(true)}
        className="absolute m-4 right-0 bottom-0 bg-green-100"
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
          className="mt-4 border border-red-500/20"
          textColor="#ef4444"
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

const styles = StyleSheet.create({});

export default ProjectTaskBoard;
