import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  ScrollView,
} from "react-native";
import {
  Text,
  IconButton,
  Button,
  TextInput,
  useTheme,
  ActivityIndicator,
  Checkbox,
  SegmentedButtons,
  Divider,
} from "react-native-paper";
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
  const theme = useTheme();
  const monthName = format(new Date(calendarYear, calendarMonth), "MMMM");
  
  return (
    <View style={styles.headerContainer}>
      <IconButton icon="chevron-left" onPress={previousMonth} iconColor={theme.colors.onSurface} />
      <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
        {`${monthName} ${calendarYear}`}
      </Text>
      <IconButton icon="chevron-right" onPress={nextMonth} iconColor={theme.colors.onSurface} />
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
  const theme = useTheme();
  
  return (
    <View style={styles.gridContainer}>
      <View style={styles.dayAbbrRow}>
        {dayAbbreviations.map((dayAbbr) => (
          <Text key={dayAbbr} style={[styles.dayAbbrText, { color: theme.colors.onSurfaceVariant }]}>
            {dayAbbr}
          </Text>
        ))}
      </View>
      <View style={styles.daysGrid}>
        {calendarDays.map((day, index) => {
          const date = day ? new Date(calendarYear, calendarMonth, day) : null;
          const dateKey = date ? getDateKey(date) : null;
          const hasTasks = day && dateKey && tasksPresence[dateKey];
          const { containerStyle, textStyle, isPastDate } = getDayStyles(day);

          return (
            <Pressable
              key={index}
              style={styles.dayCell}
              onPress={() => day && !isPastDate && handleDateChange(date!)}
              disabled={!day || isPastDate}
            >
              <View style={[styles.dayCircle, containerStyle]}>
                <Text style={[styles.dayText, textStyle]}>{day}</Text>
              </View>
              {hasTasks && (
                <View style={[styles.taskIndicator, { backgroundColor: theme.colors.primary }]} />
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
  const theme = useTheme();
  const dateFormatted = format(selectedDate, "EEEE, MMMM do");
  const isPastDate = isPast(startOfDay(selectedDate)) && !isToday(selectedDate);

  return (
    <View style={styles.flex}>
      <View style={styles.viewHeader}>
        <IconButton icon="arrow-left" onPress={() => setShowTasks(false)} />
        <View style={styles.headerTextContainer}>
          <Text variant="titleLarge" style={{ fontWeight: "bold" }}>{dateFormatted}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {tasks.length} task(s) scheduled
          </Text>
        </View>
        {!isPastDate && (
          <IconButton
            icon="plus-circle"
            iconColor={theme.colors.primary}
            size={28}
            onPress={() => setShowAddTask(true)}
          />
        )}
      </View>

      <Divider />

      {isLoading ? (
        <ActivityIndicator style={styles.centered} />
      ) : tasks.length === 0 ? (
        <View style={styles.centered}>
          <Icon type="calendar-blank" size={64} color={theme.colors.onSurfaceDisabled} />
          <Text variant="bodyLarge" style={styles.emptyText}>No tasks for this day.</Text>
          {!isPastDate && (
            <Button mode="contained" onPress={() => setShowAddTask(true)} style={styles.emptyButton}>
              Add Your First Task
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.task_id.toString()}
          contentContainerStyle={styles.taskList}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <Checkbox
                status={item.status === "Completed" ? "checked" : "unchecked"}
                onPress={() => updateTaskStatus(item.task_id, item.status === "Completed" ? "To Do" : "Completed")}
              />
              <View style={styles.taskInfo}>
                <Text
                  variant="bodyLarge"
                  style={[
                    styles.taskTitle,
                    item.status === "Completed" && styles.taskCompletedText
                  ]}
                >
                  {item.name}
                </Text>
                <View style={styles.taskMeta}>
                  <Text variant="bodySmall" style={styles.taskTime}>{item.time}</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor:
                          item.priority === "High"
                            ? theme.colors.errorContainer
                            : item.priority === "Medium"
                            ? "#FFF4E5" // Light Amber
                            : theme.colors.primaryContainer,
                      },
                    ]}
                  >
                    <Text
                      variant="labelSmall"
                      style={{
                        color:
                          item.priority === "High"
                            ? theme.colors.error
                            : item.priority === "Medium"
                            ? "#B26200" // Dark Amber
                            : theme.colors.primary,
                        fontWeight: "bold",
                        fontSize: 10,
                      }}
                    >
                      {item.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              <IconButton
                icon="delete-outline"
                iconColor={theme.colors.onSurfaceVariant}
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
  const theme = useTheme();
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
    <ScrollView style={styles.flex} contentContainerStyle={styles.addFormContainer}>
      <Text variant="headlineSmall" style={styles.formTitle}>New Task</Text>
      
      <View style={styles.formGroup}>
        <TextInput
          label="What needs to be done?"
          value={taskName}
          onChangeText={setTaskName}
          mode="outlined"
          style={styles.input}
        />
        
        <View>
          <TextInput
            label="Category"
            value={project}
            onChangeText={setProject}
            onFocus={() => setShowSuggestions(true)}
            mode="outlined"
            style={styles.input}
            right={<TextInput.Icon icon="chevron-down" />}
          />
          {showSuggestions && (
            <View style={[styles.suggestions, { backgroundColor: theme.colors.surfaceVariant }]}>
              {filteredSuggestions.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => {
                    setProject(item);
                    setShowSuggestions(false);
                  }}
                  style={styles.suggestionItem}
                >
                  <Text>{item}</Text>
                </Pressable>
              ))}
              {filteredSuggestions.length === 0 && (
                <Text style={styles.suggestionItem}>No categories found</Text>
              )}
            </View>
          )}
        </View>

        <TextInput
          label="Time (e.g., 02:30 PM)"
          value={time}
          onChangeText={setTime}
          mode="outlined"
          style={styles.input}
        />

        <Text variant="labelLarge" style={styles.label}>Priority</Text>
        <SegmentedButtons
          value={priority}
          onValueChange={v => setPriority(v as any)}
          buttons={[
            { value: "Low", label: "Low" },
            { value: "Medium", label: "Medium" },
            { value: "High", label: "High" },
          ]}
        />
      </View>

      <View style={styles.formButtons}>
        <Button mode="outlined" onPress={() => setShowAddTask(false)} style={styles.button}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={!taskName || !project || loading}
          style={styles.button}
        >
          Save Task
        </Button>
      </View>
    </ScrollView>
  );
};

const Calendar = ({ route, userId: propUserId }: any) => {
  const userId = propUserId || route?.params?.user_id;
  const theme = useTheme();
  
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
    if (!day) return { containerStyle: {}, textStyle: {}, isPastDate: false };
    
    const d = new Date(calendarYear, calendarMonth, day);
    const dateKey = getDateKey(d);
    const isTodayDate = isToday(d);
    const isPastDate = isPast(startOfDay(d)) && !isTodayDate;
    const isSelected = getDateKey(selectedDate) === dateKey;

    let containerStyle = {};
    let textStyle = { color: theme.colors.onSurface };

    if (isSelected) {
      containerStyle = { backgroundColor: theme.colors.primary };
      textStyle = { color: theme.colors.onPrimary };
    } else if (isTodayDate) {
      containerStyle = { borderColor: theme.colors.primary, borderWidth: 2 };
    } else if (isPastDate) {
      textStyle = { color: theme.colors.onSurfaceDisabled };
    }

    return { containerStyle, textStyle, isPastDate };
  };

  return (
    <View style={[styles.main, { backgroundColor: theme.colors.background }]}>
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
        <View style={styles.calendarView}>
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

const styles = StyleSheet.create({
  main: { flex: 1, minHeight: 450 },
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  calendarView: { padding: 16 },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontWeight: "bold" },
  gridContainer: { width: "100%" },
  dayAbbrRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
  dayAbbrText: { width: 40, textAlign: "center", fontSize: 12, fontWeight: "600" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: `${100 / 7}%`, height: 60, justifyContent: "center", alignItems: "center" },
  dayCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  dayText: { fontSize: 16, fontWeight: "500" },
  taskIndicator: { width: 4, height: 4, borderRadius: 2, position: "absolute", bottom: 8 },
  viewHeader: { flexDirection: "row", alignItems: "center", padding: 8, height: 70 },
  headerTextContainer: { flex: 1, marginLeft: 8 },
  emptyText: { marginTop: 16, color: "#666" },
  emptyButton: { marginTop: 20 },
  taskList: { padding: 16 },
  taskCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.03)", padding: 12, borderRadius: 12, marginBottom: 12 },
  taskInfo: { flex: 1, marginLeft: 12 },
  taskTitle: { fontWeight: "600" },
  taskCompletedText: { textDecorationLine: "line-through", opacity: 0.5 },
  taskMeta: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  taskTime: { color: "#666", marginRight: 12 },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  addFormContainer: { padding: 20 },
  formTitle: { fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  formGroup: { gap: 16 },
  input: { backgroundColor: "transparent" },
  label: { marginTop: 8, fontWeight: "600" },
  suggestions: { borderRadius: 8, marginTop: 4, elevation: 3 },
  suggestionItem: { padding: 12, borderBottomWidth: 0.5, borderBottomColor: "rgba(0,0,0,0.1)" },
  formButtons: { flexDirection: "row", gap: 12, marginTop: 32 },
  button: { flex: 1 },
});

export default Calendar;
