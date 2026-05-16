import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Pressable,
  FlatList,
  ScrollView,
} from "react-native";
import {
  Text,
  IconButton,
  Button,
  TextInput,
  ActivityIndicator,
  Checkbox,
  SegmentedButtons,
  Divider,
  Badge,
} from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import axiosInstance from "@/lib/axiosInstance";
import { format, parseISO, isToday, isPast, startOfDay } from "date-fns";

export type RawBackendTask = {
  task_id: number;
  user_id: number;
  project: string;
  task: string;
  status: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  deadline?: string;
  created_on: string;
};

export type DisplayTask = RawBackendTask & {
  name: string;
  time: string;
};

export type TasksPresence = {
  [key: string]: boolean;
};

const isTodayWithPastTime = (date: Date, time: string): boolean => {
  if (!isToday(date)) return false;
  if (!time || time.toLowerCase() === "no time set") return false;

  const now = new Date();
  const [timePartStr, modifier] = time.split(" ");
  const timeParts = timePartStr.split(":").map(Number);

  if (timeParts.length !== 2 || isNaN(timeParts[0]) || isNaN(timeParts[1])) {
    return false;
  }

  let hours = timeParts[0];
  const minutes = timeParts[1];

  if (modifier) {
    const upperModifier = modifier.toUpperCase();
    if (upperModifier === "PM" && hours < 12) {
      hours += 12;
    } else if (upperModifier === "AM" && hours === 12) {
      hours = 0;
    }
  }

  const taskTime = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    0,
    0
  );
  return taskTime < now;
};

type CalendarHeaderProps = {
  calendarMonth: number;
  calendarYear: number;
  previousMonth: () => void;
  nextMonth: () => void;
};

const CalendarHeader = ({
  calendarMonth,
  calendarYear,
  previousMonth,
  nextMonth,
}: CalendarHeaderProps) => {
  const monthName = format(new Date(calendarYear, calendarMonth), "MMMM");
  
  return (
    <View className="flex-row justify-between items-center mb-5">
      <IconButton icon="chevron-left" onPress={previousMonth} className="text-black dark:text-white" />
      <Text variant="headlineSmall" className="font-bold text-black dark:text-white">
        {`${monthName} ${calendarYear}`}
      </Text>
      <IconButton icon="chevron-right" onPress={nextMonth} className="text-black dark:text-white" />
    </View>
  );
};

type CalendarGridProps = {
  calendarDays: (number | null)[];
  dayAbbreviations: string[];
  getDayStyles: (day: number | null) => any;
  calendarMonth: number;
  calendarYear: number;
  handleDateChange: (date: Date) => void;
  tasksPresence: TasksPresence;
  getDateKey: (date: Date) => string;
};

const CalendarGrid = ({
  calendarDays,
  dayAbbreviations,
  getDayStyles,
  calendarMonth,
  calendarYear,
  handleDateChange,
  tasksPresence,
  getDateKey,
}: CalendarGridProps) => {
  
  return (
    <View className="w-full">
      <View className="flex-row justify-around mb-3">
        {dayAbbreviations.map((dayAbbr) => (
          <Text key={dayAbbr} className="w-10 text-center text-[12px] font-semibold text-gray-500">
            {dayAbbr}
          </Text>
        ))}
      </View>
      <View className="flex-row flex-wrap">
        {calendarDays.map((day, index) => {
          const date = day ? new Date(calendarYear, calendarMonth, day) : null;
          const dateKey = date ? getDateKey(date) : null;
          const hasTasks = day && dateKey && tasksPresence[dateKey];
          const { containerStyle, textStyle, isPastDate } = getDayStyles(day);

          return (
            <Pressable
              key={index}
              className="w-[14.28%] h-[60px] justify-center items-center"
              onPress={() => day && !isPastDate && handleDateChange(date!)}
              disabled={!day || isPastDate}
            >
              <View 
                className={`w-10 h-10 rounded-full justify-center items-center ${containerStyle}`}
              >
                <Text className={`text-base font-medium ${textStyle}`}>{day}</Text>
              </View>
              {hasTasks && (
                <View className="w-1 h-1 rounded-full absolute bottom-2 bg-emerald-600" />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

type TaskListViewProps = {
  selectedDate: Date;
  tasks: DisplayTask[];
  removeTask: (taskId: number) => void;
  updateTaskStatus: (taskId: number, newStatus: string) => void;
  setShowTasks: (value: boolean) => void;
  setShowAddTask: (value: boolean) => void;
  isLoading: boolean;
};

const TaskListView = ({
  selectedDate,
  tasks,
  removeTask,
  updateTaskStatus,
  setShowTasks,
  setShowAddTask,
  isLoading,
}: TaskListViewProps) => {
  const dateFormatted = format(selectedDate, "EEEE, MMMM do");
  const isPastDate = isPast(startOfDay(selectedDate)) && !isToday(selectedDate);

  return (
    <View className="flex-1">
      <View className="flex-row items-center p-2 h-[70px]">
        <IconButton icon="chevron-left" onPress={() => setShowTasks(false)} />
        <View className="flex-1 ml-2">
          <Text variant="titleLarge" className="font-bold">{dateFormatted}</Text>
          <Text variant="bodySmall" className="text-gray-500">
            {tasks.length} task(s) scheduled
          </Text>
        </View>
        {!isPastDate && (
          <IconButton
            icon="plus-circle"
            className="text-emerald-600"
            size={28}
            onPress={() => setShowAddTask(true)}
          />
        )}
      </View>

      <Divider />

      {isLoading ? (
        <ActivityIndicator className="flex-1 justify-center items-center p-5" />
      ) : tasks.length === 0 ? (
        <View className="flex-1 justify-center items-center p-5 gap-4">
          <Icon type="calendar-blank" size={64} className="text-gray-300" />
          <Text variant="bodyLarge" className="mt-4 text-gray-500">No tasks for this day.</Text>
          {!isPastDate && (
            <Button mode="contained" onPress={() => setShowAddTask(true)} className="mt-5">
              Add Your First Task
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.task_id.toString()}
          contentContainerClassName="p-4"
          renderItem={({ item }) => (
            <View className="flex-row items-center p-3 rounded-xl mb-3 bg-gray-50 dark:bg-gray-800">
              <Checkbox
                status={item.status === "Completed" ? "checked" : "unchecked"}
                onPress={() => updateTaskStatus(item.task_id, item.status === "Completed" ? "To Do" : "Completed")}
              />
              <View className="flex-1 ml-3">
                <Text
                  variant="bodyLarge"
                  className={item.status === "Completed" ? "line-through opacity-50" : ""}
                >
                  {item.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Text variant="bodySmall" className="text-dark dark:text-light mr-3">{item.time}</Text>
                  <Badge
                    className={`ml-2 px-2 rounded-md ${
                      item.priority === "High"
                        ? "bg-red-100 dark:bg-red-900"
                        : item.priority === "Medium"
                        ? "bg-amber-100 dark:bg-amber-900"
                        : "bg-emerald-100 dark:bg-emerald-900"
                    }`}
                    size={20}
                  >
                    <Text
                      variant="labelSmall"
                      className={`font-bold text-[10px] ${
                        item.priority === "High"
                          ? "text-red-700 dark:text-red-300"
                          : item.priority === "Medium"
                          ? "text-amber-700 dark:text-amber-300"
                          : "text-emerald-700 dark:text-emerald-300"
                      }`}
                    >
                      {item.priority.toUpperCase()}
                    </Text>
                  </Badge>
                </View>
              </View>
              <IconButton
                icon="delete-outline"
                className="text-gray-500"
                size={20}
                onPress={() => removeTask(item.task_id)}
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

type AddTaskViewProps = {
  selectedDate: Date;
  setShowAddTask: (value: boolean) => void;
  userId: number;
  refreshTasks: () => void;
  subTypes: string[];
};

const AddTaskView = ({
  selectedDate,
  setShowAddTask,
  userId,
  refreshTasks,
  subTypes,
}: AddTaskViewProps) => {
  const [taskName, setTaskName] = useState("");
  const [project, setProject] = useState("");
  const [time, setTime] = useState("12:00 PM");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!project) return subTypes;
    return subTypes.filter(s => s.toLowerCase().includes(project.toLowerCase()));
  }, [project, subTypes]);

  const handleSave = async () => {
    if (!taskName.trim() || !project.trim()) return;

    if (isTodayWithPastTime(selectedDate, time)) {
      alert("You cannot add tasks to past times today.");
      return;
    }

    setLoading(true);
    try {
      const deadlineDate = format(selectedDate, "yyyy-MM-dd");
      // Note: Backend expectation for deadline often includes time. 
      // If backend only wants date, use deadlineDate. 
      // If it wants ISO with time, we'd need to parse 'time' string.
      
      const payload = {
        user_id: userId,
        project: project,
        task: taskName.trim(),
        status: "To Do",
        priority,
        deadline: deadlineDate, // Simplified to date to match mobile pattern
      };

      await axiosInstance.post("/tasks/add", payload);
      refreshTasks();
      setShowAddTask(false);
    } catch (error) {
      console.error("Add task error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1" contentContainerClassName="p-5">
      <Text variant="headlineSmall" className="font-bold mb-6 text-center">New Task</Text>
      
      <View className="gap-4">
        <TextInput
          label="What needs to be done?"
          value={taskName}
          onChangeText={setTaskName}
          mode="outlined"
          className="bg-transparent"
        />
        
        <View>
          <TextInput
            label="Category"
            value={project}
            onChangeText={setProject}
            onFocus={() => setShowSuggestions(true)}
            mode="outlined"
            className="bg-transparent"
            right={<TextInput.Icon icon="chevron-down" />}
          />
          {showSuggestions && (
            <View className="rounded-lg mt-1 elevation-3 bg-white dark:bg-gray-800">
              {filteredSuggestions.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => {
                    setProject(item);
                    setShowSuggestions(false);
                  }}
                  className="p-3 border-b border-[rgba(0,0,0,0.1)]"
                >
                  <Text>{item}</Text>
                </Pressable>
              ))}
              {filteredSuggestions.length === 0 && (
                <Text className="p-3 border-b border-[rgba(0,0,0,0.1)]">No categories found</Text>
              )}
            </View>
          )}
        </View>

        <TextInput
          label="Time (e.g., 02:30 PM)"
          value={time}
          onChangeText={setTime}
          mode="outlined"
          className="bg-transparent"
        />

        <Text variant="labelLarge" className="mt-2 font-semibold">Priority</Text>
        <SegmentedButtons
          value={priority}
          onValueChange={(v: any) => setPriority(v as any)}
          buttons={[
            { value: "Low", label: "Low" },
            { value: "Medium", label: "Medium" },
            { value: "High", label: "High" },
          ]}
        />
      </View>

      <View className="flex-row gap-3 mt-8">
        <Button mode="outlined" onPress={() => setShowAddTask(false)} className="flex-1">
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={!taskName || !project || loading}
          className="flex-1"
        >
          Save Task
        </Button>
      </View>
    </ScrollView>
  );
};

const Calendar = ({ route, userId: propUserId }: any) => {
  const userId = propUserId || route?.params?.user_id;
  
  const [displayedTasks, setDisplayedTasks] = useState<DisplayTask[]>([]);
  const [tasksForGrid, setTasksForGrid] = useState<TasksPresence>({});
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showTasks, setShowTasks] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [subTypes, setSubTypes] = useState<string[]>([]);

  const getDateKey = (date: Date): string => format(date, "yyyy-MM-dd");

  const fetchTasksForDate = useCallback(async (date: Date) => {
    if (!userId) return;
    setIsLoadingTasks(true);
    const dateKey = getDateKey(date);
    try {
      const response = await axiosInstance.get(`/tasks/${userId}?deadlineDate=${dateKey}`);
      const raw = response.data?.tasks || [];
      const processed = raw.map((t: any) => ({
        ...t,
        name: t.task,
        time: t.deadline ? format(parseISO(t.deadline), "hh:mm a") : "No time set",
      }));
      setDisplayedTasks(processed);
    } catch {
      setDisplayedTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [userId]);

  const fetchGridPresence = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await axiosInstance.get(`/tasks/${userId}`);
      const raw = response.data?.tasks || [];
      const presence: TasksPresence = {};
      raw.forEach((t: any) => {
        if (t.deadline) {
          const key = t.deadline.split("T")[0];
          presence[key] = true;
        }
      });
      setTasksForGrid(presence);
    } catch {}
  }, [userId]);

  useEffect(() => {
    const fetchMeta = async () => {
      if (!userId) return;
      try {
        const response = await axiosInstance.get(`/user/${userId}`);
        const user = response.data?.data?.user;
        setSubTypes(user?.sub_type || []);
      } catch {}
    };
    fetchMeta();
    fetchGridPresence();
  }, [userId, fetchGridPresence]);

  useEffect(() => {
    if (showTasks) fetchTasksForDate(selectedDate);
  }, [showTasks, selectedDate, fetchTasksForDate]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setShowTasks(true);
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await axiosInstance.put(`/tasks/update/${taskId}`, { status: newStatus });
      setDisplayedTasks(prev => prev.map(t => t.task_id === taskId ? { ...t, status: newStatus } : t));
    } catch {}
  };

  const removeTask = async (taskId: number) => {
    try {
      await axiosInstance.delete(`/tasks/delete/${taskId}`);
      fetchTasksForDate(selectedDate);
      fetchGridPresence();
    } catch {}
  };

  const generateCalendarDays = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  };

  const calendarDays = generateCalendarDays(calendarMonth, calendarYear);

  const getDayStyles = (day: number | null) => {
    if (!day) return { containerStyle: "", textStyle: "", isPastDate: false };
    
    const d = new Date(calendarYear, calendarMonth, day);
    const dateKey = getDateKey(d);
    const isTodayDate = isToday(d);
    const isPastDate = isPast(startOfDay(d)) && !isTodayDate;
    const isSelected = getDateKey(selectedDate) === dateKey;

    let containerStyle = "";
    let textStyle = "text-black dark:text-white";

    if (isSelected) {
      containerStyle = "bg-emerald-600";
      textStyle = "text-white";
    } else if (isTodayDate) {
      containerStyle = "border-2 border-emerald-600";
    } else if (isPastDate) {
      textStyle = "text-gray-400";
    }

    return { containerStyle, textStyle, isPastDate };
  };

  return (
    <View className="border border-gray-400 dark:border-gray-800 rounded-xl overflow-hidden min-h-[450px] bg-white dark:bg-gray-900">
      {showAddTask ? (
        <AddTaskView
          selectedDate={selectedDate}
          setShowAddTask={setShowAddTask}
          userId={Number(userId)}
          refreshTasks={() => {
            fetchTasksForDate(selectedDate);
            fetchGridPresence();
          }}
          subTypes={subTypes}
        />
      ) : showTasks ? (
        <TaskListView
          selectedDate={selectedDate}
          tasks={displayedTasks}
          removeTask={removeTask}
          updateTaskStatus={updateTaskStatus}
          setShowTasks={setShowTasks}
          setShowAddTask={setShowAddTask}
          isLoading={isLoadingTasks}
        />
      ) : (
        <View className="p-4">
          <CalendarHeader
            calendarMonth={calendarMonth}
            calendarYear={calendarYear}
            previousMonth={() => {
              if (calendarMonth === 0) {
                setCalendarMonth(11);
                setCalendarYear(v => v - 1);
              } else setCalendarMonth(v => v - 1);
            }}
            nextMonth={() => {
              if (calendarMonth === 11) {
                setCalendarMonth(0);
                setCalendarYear(v => v + 1);
              } else setCalendarMonth(v => v + 1);
            }}
          />
          <CalendarGrid
            calendarDays={calendarDays}
            dayAbbreviations={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
            getDayStyles={getDayStyles}
            calendarMonth={calendarMonth}
            calendarYear={calendarYear}
            handleDateChange={handleDateChange}
            tasksPresence={tasksForGrid}
            getDateKey={getDateKey}
          />
        </View>
      )}
    </View>
  );
};

export default Calendar;
