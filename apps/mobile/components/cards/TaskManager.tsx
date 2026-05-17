import { Icon } from "@/components/ui/Icon";
import axiosInstance from "@/lib/axiosInstance";
import React, { useCallback, useEffect, useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Menu,
  Text,
  TextInput,
  TouchableRipple,
} from "@/components/ui";

type Priority = "High" | "Medium" | "Low";
type TaskStatus = "To Do" | "In Progress" | "Checks" | "Completed";

type Task = {
  task_id: number;
  user_id: number;
  project: string;
  task: string;
  status: TaskStatus;
  priority: Priority;
  created_on: string;
};

type Props = {
  userId: number;
  projectType: string;
};

const PRIORITY_OPTIONS: Priority[] = ["High", "Medium", "Low"];

const TaskManager = ({ userId, projectType }: Props) => {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("Medium");
  const [prioritySortAsc, setPrioritySortAsc] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPriority, setEditingPriority] = useState<number | null>(null);
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);

  const capitalizedProjectType =
    projectType.charAt(0).toUpperCase() + projectType.slice(1);

  const sortTasks = useCallback((list: Task[], asc: boolean) => {
    const priorityRankLocal: Record<Priority, number> = {
      High: 1,
      Medium: 2,
      Low: 3,
    };

    const sorted = [...list].sort((a, b) => {
      const aRank = priorityRankLocal[a.priority];
      const bRank = priorityRankLocal[b.priority];
      return asc ? aRank - bRank : bRank - aRank;
    });

    return [
      ...sorted.filter((t) => t.status !== "Completed"),
      ...sorted.filter((t) => t.status === "Completed"),
    ];
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId || !projectType) return;
      try {
        setIsLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/tasks/${userId}`, {
          params: { project: projectType },
        });
        const tasks = Array.isArray(response.data)
          ? response.data
          : response.data.tasks || [];
        setTaskList(sortTasks(tasks, prioritySortAsc));
      } catch {
        setError("Failed to load tasks. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [userId, projectType, prioritySortAsc, sortTasks]);

  const handlePriorityChange = async (
    taskId: number,
    newPriority: Priority
  ) => {
    try {
      const response = await axiosInstance.put(`/tasks/update/${taskId}`, {
        priority: newPriority,
      });
      setTaskList((prev) =>
        sortTasks(
          prev.map((t) => (t.task_id === taskId ? response.data : t)),
          prioritySortAsc
        )
      );
      setEditingPriority(null);
    } catch {
      setError("Failed to update task priority. Please try again.");
    }
  };

  const toggleTaskCompletion = async (taskId: number) => {
    const task = taskList.find((t) => t.task_id === taskId);
    if (!task) return;
    try {
      const newStatus = task.status === "Completed" ? "To Do" : "Completed";
      const response = await axiosInstance.put(`/tasks/update/${taskId}`, {
        status: newStatus,
      });
      setTaskList((prev) =>
        sortTasks(
          prev.map((t) => (t.task_id === taskId ? response.data : t)),
          prioritySortAsc
        )
      );
    } catch {
      setError("Failed to update task status. Please try again.");
    }
  };

  const addNewTask = async () => {
    if (!newTaskText.trim() || !userId || !projectType) return;
    Keyboard.dismiss();
    try {
      const response = await axiosInstance.post("/tasks/add", {
        user_id: userId,
        project: projectType,
        task: newTaskText.trim(),
        status: "To Do",
        priority: newTaskPriority,
      });
      setTaskList((prev) =>
        sortTasks([...prev, response.data], prioritySortAsc)
      );
      setNewTaskText("");
      setNewTaskPriority("Medium");
      setError(null);
    } catch {
      setError("Failed to create new task. Please try again.");
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await axiosInstance.delete(`/tasks/delete/${taskId}`);
      setTaskList((prev) => prev.filter((task) => task.task_id !== taskId));
      setError(null);
    } catch {
      setError("Failed to delete task. Please try again.");
    }
  };

  const getPriorityClass = (priority: Priority) => {
    switch (priority) {
      case "High":
        return {
          bg: "bg-red-300 dark:bg-red-900/30",
          text: "text-red-100 dark:text-red-300",
        };
      case "Medium":
        return {
          bg: "bg-yellow-300 dark:bg-yellow-900/30",
          text: "text-yellow-100 dark:text-yellow-300",
        };
      case "Low":
        return {
          bg: "bg-green-300 dark:bg-green-900/30",
          text: "text-green-100 dark:text-green-300",
        };
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator animating={true} />
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-600">{error}</Text>
        </View>
      );
    }

    if (taskList.length === 0) {
      return (
        <View className="flex-1 justify-center items-center">
          <Icon
            type={"clipboard-text-outline" as any}
            size={48}
            className="text-gray-400"
          />
          <Text className="mt-3 text-gray-400">
            No tasks for {capitalizedProjectType}.
          </Text>
          <Text className="mt-1 text-xs text-gray-400">
            Add a task above to get started.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {taskList.map((task) => {
          const isCompleted = task.status === "Completed";
          const priorityClass = getPriorityClass(task.priority);
          return (
            <View key={task.task_id} className="flex-row items-center py-0.5 rounded">
              <Checkbox.Android
                status={isCompleted ? "checked" : "unchecked"}
                onPress={() => toggleTaskCompletion(task.task_id)}
              />
              <Text
                className={`flex-1 ml-3 mr-2 text-sm ${
                  isCompleted ? "line-through text-gray-400" : "text-black dark:text-white"
                }`}
                numberOfLines={1}
              >
                {task.task}
              </Text>

              {isCompleted ? (
                <Button
                  mode="contained"
                  onPress={() => deleteTask(task.task_id)}
                  className="ml-2 min-w-[70px] h-6 justify-center bg-red-300 dark:bg-red-900/30"
                  labelStyle={{ fontSize: 12, marginVertical: 0, marginHorizontal: 8 }}
                  labelClassName="text-red-100 dark:text-red-300"
                  compact
                >
                  Delete
                </Button>
              ) : editingPriority === task.task_id ? (
                <View className="flex-row items-center gap-1">
                  {PRIORITY_OPTIONS.map((p) => {
                    const pbClass = getPriorityClass(p);
                    return (
                      <Button
                        key={p}
                        onPress={() => handlePriorityChange(task.task_id, p)}
                        className={`ml-2 min-w-[70px] h-6 justify-center ${pbClass.bg}`}
                        labelStyle={{ fontSize: 12, marginVertical: 0, marginHorizontal: 8 }}
                        labelClassName={pbClass.text}
                        compact
                      >
                        {p}
                      </Button>
                    );
                  })}
                  <TouchableRipple
                    onPress={() => setEditingPriority(null)}
                    className="w-6 h-6 rounded justify-center items-center bg-gray-300 dark:bg-gray-700 ml-1"
                  >
                    <Icon
                      type="close"
                      size={12}
                      className="text-black dark:text-white"
                    />
                  </TouchableRipple>
                </View>
              ) : (
                <Button
                  mode="contained"
                  onPress={() => setEditingPriority(task.task_id)}
                  className={`ml-2 min-w-[70px] h-6 justify-center ${priorityClass.bg}`}
                  labelStyle={{ fontSize: 12, marginVertical: 0, marginHorizontal: 8 }}
                  labelClassName={priorityClass.text}
                  compact
                >
                  {task.priority}
                </Button>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View className="h-[320px] rounded-lg p-6 shadow-md bg-white dark:bg-gray-900">
      <View className="flex-row justify-between items-center mb-4">
        <Text>
          {capitalizedProjectType} Task List
        </Text>
        <TouchableRipple
          onPress={() => {
            const newAsc = !prioritySortAsc;
            setPrioritySortAsc(newAsc);
            setTaskList((prev) => sortTasks(prev, newAsc));
          }}
          className="py-1 px-2 rounded bg-gray-400 dark:bg-gray-800"
        >
          <View className="flex-row items-center">
            <Text className="text-xs font-medium mr-2">
              Priority
            </Text>
            <Icon
              type={(prioritySortAsc ? "chevron-up" : "chevron-down") as any}
              size={12}
              className="text-black dark:text-white"
            />
          </View>
        </TouchableRipple>
      </View>

      <View className="flex-row items-center mb-4 gap-2">
        <TextInput
          mode="outlined"
          placeholder={`Add new ${projectType.toLowerCase()} task`}
          value={newTaskText}
          onChangeText={setNewTaskText}
          onSubmitEditing={addNewTask}
          className="flex-1 h-10"
        />
      </View>

      <View className="flex-row items-center mb-4 gap-2">
        <Menu
          visible={priorityMenuVisible}
          onDismiss={() => setPriorityMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setPriorityMenuVisible(true)}
              disabled={!newTaskText.trim()}
              className="justify-center h-10"
            >
              {newTaskPriority}
            </Button>
          }
        >
          {PRIORITY_OPTIONS.map((p) => (
            <Menu.Item
              key={p}
              onPress={() => {
                setNewTaskPriority(p);
                setPriorityMenuVisible(false);
              }}
              title={p}
            />
          ))}
        </Menu>
        <Button
          mode="contained"
          onPress={addNewTask}
          disabled={!newTaskText.trim()}
          className="justify-center h-10"
          icon={() => (
            <Icon
              type="plus"
              size={16}
              className={!newTaskText.trim() ? "text-gray-400" : "text-white"}
            />
          )}
        />
      </View>

      <View className="flex-1 overflow-hidden">{renderContent()}</View>
    </View>
  );
};

export default TaskManager;
