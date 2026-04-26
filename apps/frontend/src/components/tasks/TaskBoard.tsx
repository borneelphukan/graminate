import TicketModal from "@/components/modals/crm/TicketModal";
import SearchBar from "@/components/ui/SearchBar";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { Column, Id, Task as FrontendTaskType } from "@/types/types";
import TaskListView from "./KanbanListView";
import SortableItem from "./SortableItem";
import ColumnContainer from "./ColumnContainer";
import TaskCard from "./TaskCard";
import axiosInstance from "@/lib/utils/axiosInstance";

import { Dropdown, Button, SegmentedControl } from "@graminate/ui";
import TaskModal from "@/components/modals/crm/TaskModal";
import React, { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";

const formatDeadlineForInput = (
  deadlineString: string | null | undefined
): string => {
  if (!deadlineString) return "";
  try {
    const date = new Date(deadlineString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string received: ${deadlineString}`);
      return "";
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error(`Error formatting date string: ${deadlineString}`, error);
    return "";
  }
};

type ApiTask = {
  task_id: number;
  task: string | null;
  description?: string | null;
  type?: string | null;
  status: string | null;
  priority?: string | null;
  deadline?: string | null;
  project: string;
  user_id: number;
  created_on: string;
};

type TaskBoardProps = {
  projectTitle: string;
  userId: string;
};

const TaskBoard = ({ projectTitle, userId }: TaskBoardProps) => {

  const initialColumns: Column[] = [
    { id: "todo", title: "TO DO" },
    { id: "progress", title: "IN PROGRESS" },
    { id: "check", title: "CHECK" },
    { id: "done", title: "DONE" },
  ];

  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [tasks, setTasks] = useState<FrontendTaskType[]>([]);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  const [isLoading, setIsLoading] = useState(true);

  // New states for adding a column
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const effectiveLoading = isLoading;

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<FrontendTaskType | null>(null);

  const [taskActionDropdownOpen, setTaskActionDropdownOpen] = useState<{
    taskId: Id;
  } | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [activeColumnIdForModal, setActiveColumnIdForModal] =
    useState<Id | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<FrontendTaskType | null>(
    null
  );
  const [columnLimits, setColumnLimits] = useState<Record<Id, string>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterLabels, setSelectedFilterLabels] = useState<string[]>(
    []
  );
  const [isListView, setIsListView] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string>("Priority");

  useEffect(() => {
    const savedPriority = localStorage.getItem("taskPriorityFilter");
    if (savedPriority) setSelectedPriority(savedPriority);

    const savedView = localStorage.getItem("taskViewPreference");
    if (savedView) setIsListView(savedView === "list");
  }, []);

  useEffect(() => {
    if (selectedPriority !== "Priority") {
      localStorage.setItem("taskPriorityFilter", selectedPriority);
    } else {
      localStorage.removeItem("taskPriorityFilter");
    }
  }, [selectedPriority]);

  useEffect(() => {
    localStorage.setItem("taskViewPreference", isListView ? "list" : "board");
  }, [isListView]);

  const dropdownItems = useMemo(() => {
    const labelsFromTasks = tasks.flatMap(
      (t: FrontendTaskType) =>
        t.type?.split(",").map((l: string) => l.trim()) ?? []
    );
    return [
      ...new Set([
        ...labelsFromTasks,
        "Finance",
        "Maintenance",
        "Research",
        "Urgent",
        "Design",
        "Dev",
        "Setup",
        "Bug",
        "DevOps",
      ]),
    ]
      .filter(Boolean)
      .sort();
  }, [tasks]);

  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(typeof document !== "undefined");
  }, []);



  useEffect(() => {
    const fetchData = async () => {
      if (!projectTitle || !userId) return;
      setIsLoading(true);
      try {
        const columnsResp = await axiosInstance.get(`/tasks/columns/${userId}`, {
          params: { project: projectTitle },
        });

        const fetchedCols = columnsResp.data.columns || [];
        let mappedColumns: Column[] = fetchedCols.map((c: { column_id: number; title: string }) => ({
          id: c.column_id.toString(),
          title: c.title,
        }));

        if (mappedColumns.length === 0) {
          mappedColumns = initialColumns;
        }

        setColumns(mappedColumns);

        const response = await axiosInstance.get(`/tasks/${userId}`, {
          params: { project: projectTitle },
        });
        const fetchedApiTasks: ApiTask[] = response.data.tasks || [];

        const actualApiTasks = fetchedApiTasks.filter(
          (apiTask) => apiTask.task != null && apiTask.status != null
        );

        const mappedTasks: FrontendTaskType[] = actualApiTasks.map(
          (task: ApiTask): FrontendTaskType => {
            // Find column by ID or Title (case-insensitive)
            const column = mappedColumns.find(
              (c) =>
                String(c.id) === String(task.status) ||
                c.title.toLowerCase() === task.status?.toLowerCase()
            );

            let columnId: Id;
            if (task.status?.toLowerCase() === "unknown") {
              columnId = "orphaned";
            } else if (column) {
              columnId = column.id;
            } else {
              // If status doesn't match any column, mark as orphaned to hide from board
              columnId = "orphaned";
            }

            return {
              id: task.task_id.toString(),
              task: task.task!,
              title: task.task!,
              description: task.description || "",
              type: task.type || "",
              columnId,
              status: task.status!,
              priority: task.priority || "Medium",
              deadline: formatDeadlineForInput(task.deadline),
            };
          }
        );
        setTasks(mappedTasks);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        Swal.fire("Error", "Could not fetch tasks or columns.", "error");
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectTitle, userId]);

  const handleCreateColumn = async () => {
    if (!newColumnTitle.trim()) {
      Swal.fire("Error", "Column title cannot be empty.", "error");
      return;
    }

    try {
      const response = await axiosInstance.post("/tasks/column/add", {
        userId: Number(userId),
        project: projectTitle,
        title: newColumnTitle.trim(),
        position: columns.length,
      });

      const newCol = response.data;
      setColumns((prev) => [...prev, { id: newCol.column_id.toString(), title: newCol.title }]);
      setNewColumnTitle("");
      setIsAddingColumn(false);
    } catch (error) {
      console.error("Failed to add column:", error);
      Swal.fire("Error", "Failed to add column", "error");
    }
  };


  const filteredTasks = useMemo(() => {
    return (tasks || []).filter((task) => {
      const taskLabels =
        task.type?.split(",").map((l) => l.trim().toLowerCase()) ?? [];
      const filterLabelsLower = selectedFilterLabels.map((l) =>
        l.toLowerCase()
      );
      const searchLower = searchQuery.toLowerCase().trim();
      const labelMatch =
        filterLabelsLower.length === 0 ||
        filterLabelsLower.some((label) => taskLabels.includes(label));
      const searchMatch =
        !searchLower ||
        task.title.toLowerCase().includes(searchLower) ||
        task.id.toString().toLowerCase().includes(searchLower);
      const priorityMatch =
        selectedPriority === "None" ||
        selectedPriority === "Priority" ||
        (task.priority &&
          task.priority.toLowerCase() === selectedPriority.toLowerCase());

      return labelMatch && searchMatch && priorityMatch;
    });
  }, [tasks, searchQuery, selectedFilterLabels, selectedPriority]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const updateColumnTitle = async (id: Id, title: string) => {
    try {
      if (!isNaN(Number(id))) {
        await axiosInstance.put(`/tasks/column/update/${id}`, { title });
      }
      setColumns((prev) =>
        prev.map((col) => (col.id === id ? { ...col, title } : col))
      );
    } catch (error) {
      console.error("Failed to update column:", error);
      Swal.fire("Error", "Failed to update column title", "error");
    }
  };

  const deleteColumn = async (id: Id) => {
    const result = await Swal.fire({
      title: "Delete Column?",
      text: "This will delete the column. Tasks in it will be marked as 'unknown' and hidden from the board.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        if (!isNaN(Number(id))) {
          await axiosInstance.delete(`/tasks/column/delete/${id}`);
        }
        
        // Find tasks in this column
        const tasksToUpdate = tasks.filter(t => t.columnId === id);
        
        // Update tasks status to "unknown" in the backend
        await Promise.all(
          tasksToUpdate.map(t => 
            axiosInstance.put(`/tasks/update/${t.id}`, { status: "unknown" })
          )
        );

        // Update local state
        setTasks(prev => prev.map(t => 
          t.columnId === id ? { ...t, status: "unknown", columnId: "orphaned" } : t
        ));

        setColumns((prev) => prev.filter((col) => col.id !== id));
      } catch (error) {
        console.error("Failed to delete column and update tasks:", error);
        Swal.fire("Error", "Failed to delete column or update task statuses.", "error");
      }
    }
  };


  const mapColumnIdToStatus = (columnId: Id): string => {
    switch (columnId) {
      case "todo":
        return "To Do";
      case "progress":
        return "In Progress";
      case "check":
        return "Checks";
      case "done":
        return "Completed";
      default:
        return "To Do";
    }
  };

  const addTask = async (columnId: Id, title: string, priority: string) => {
    if (!title.trim()) {
      Swal.fire("Error", "Task title cannot be empty.", "error");
      return;
    }
    try {
      // Find the column by id to get its title as status
      const column = columns.find(c => c.id === columnId);
      const status = column ? column.title : mapColumnIdToStatus(columnId);
      
      const response = await axiosInstance.post("/tasks/add", {

        user_id: Number(userId),
        project: projectTitle,
        task: title.trim(),
        status,
        description: "",
        priority: priority || "Medium",
      });

      const createdApiTask: ApiTask = response.data;

      if (createdApiTask.task && createdApiTask.status) {
        const newTask: FrontendTaskType = {
          task: createdApiTask.task,
          id: createdApiTask.task_id.toString(),
          columnId,
          title: createdApiTask.task,
          description: createdApiTask.description || "",
          type: createdApiTask.type || "",
          status: createdApiTask.status,
          priority: createdApiTask.priority || "Medium",
          deadline: formatDeadlineForInput(createdApiTask.deadline),
        };
        setTasks((prev) => [...prev, newTask]);
      } else {
        console.warn(
          "AddTask received a response that doesn't look like a full task:",
          createdApiTask
        );
      }
    } catch (error) {
      console.error("Failed to add task:", error);
      const msg = "Failed to create task";
      Swal.fire("Error", msg, "error");
    }
  };

  const deleteTask = async (taskId: Id) => {
    const taskIdNum =
      typeof taskId === "string" ? parseInt(taskId, 10) : taskId;
    if (isNaN(taskIdNum)) {
      Swal.fire("Error", "Invalid task ID.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Delete Task?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#04ad79",
      cancelButtonColor: "#bbbbbc",
      confirmButtonText: "Yes",
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/tasks/delete/${taskIdNum}`);
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
        setTaskActionDropdownOpen(null);
        if (isTaskModalOpen && selectedTask?.id === taskId) {
          closeTaskModal(false);
        }
        Swal.fire("Deleted!", "The task has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting task:", error);
        const msg = "Failed to delete task";
        Swal.fire("Error", msg, "error");
      }
    }
  };

  const updateTask = async (updatedTaskData: FrontendTaskType) => {
    const { id, title, status, priority, description, deadline } =
      updatedTaskData;
    const taskIdNum = typeof id === "string" ? parseInt(id, 10) : id;
    if (isNaN(taskIdNum)) {
      Swal.fire("Error", "Invalid task ID for update.", "error");
      throw new Error("Invalid task ID");
    }

    type TaskUpdatePayload = {
      task?: string;
      status?: string;
      priority?: string;
      description?: string | null;
      deadline?: string | null;
    };

    const payload: TaskUpdatePayload = {
      task: title,
      status: status,
      priority: priority,
      description: description ?? null,
      deadline: deadline ? deadline : null,
    };

    try {
      await axiosInstance.put(`/tasks/update/${taskIdNum}`, payload);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, ...updatedTaskData } : task
        )
      );

      if (selectedTask?.id === id) {
        setSelectedTask((prev) =>
          prev ? { ...prev, ...updatedTaskData } : null
        );
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      const msg = "Failed to update task details.";
      Swal.fire("Error", msg, "error");
      throw error;
    }
  };

  const openTicketModal = (colId: Id) => {
    setActiveColumnIdForModal(colId);
    setIsTicketModalOpen(true);
  };

  const closeTicketModal = () => {
    setIsTicketModalOpen(false);
    setActiveColumnIdForModal(null);
  };

  const saveColumnLimit = (limit: string) => {
    if (activeColumnIdForModal !== null) {
      const parsedLimit = limit.trim();
      if (parsedLimit === "" || /^\d+$/.test(parsedLimit)) {
        setColumnLimits((prev) => ({
          ...prev,
          [activeColumnIdForModal]: parsedLimit,
        }));
        closeTicketModal();
      } else {
        Swal.fire("Invalid Limit", "Use numbers or leave blank.", "error");
      }
    } else {
      closeTicketModal();
    }
  };

  const openTaskModal = (task: FrontendTaskType) => {
    const taskColumn = columns.find(c => c.id === task.columnId);
    const taskToOpen: FrontendTaskType = {
      ...task,
      status: task.status || (taskColumn ? taskColumn.title : mapColumnIdToStatus(task.columnId)),
      priority: task.priority || "Medium",
      description: task.description || "",
      deadline: task.deadline || "",
    };
    setSelectedTask(taskToOpen);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = (reload = true) => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
    if (reload) {
    }
  };

  const toggleTaskActionDropdown = (taskId: Id) => {
    setTaskActionDropdownOpen((prev) =>
      prev?.taskId === taskId ? null : { taskId }
    );
  };

  const handlePageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    if (
      !target.closest('[aria-label="ellipsis"]') &&
      !target.closest('[data-dropdown-menu="task"]')
    ) {
      setTaskActionDropdownOpen(null);
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setTaskActionDropdownOpen(null);
    if (active.data.current?.type === "Column") {
      setActiveColumn(columns.find((col) => col.id === active.id) || null);
      setActiveTask(null);
    } else if (active.data.current?.type === "Task") {
      setActiveTask(tasks.find((task) => task.id === active.id) || null);
      setActiveColumn(null);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !active || active.id === over.id) return;
    if (active.data.current?.type !== "Task") return;
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;
    const isActiveAColumn = active.data.current?.type === "Column";
    const isActiveATask = active.data.current?.type === "Task";

    if (isActiveAColumn) {
      setColumns((currentColumns) => {
        const activeIndex = currentColumns.findIndex(
          (col) => col.id === activeId
        );
        const overIndex = currentColumns.findIndex((col) => col.id === overId);
        if (activeIndex === -1 || overIndex === -1) return currentColumns;
        return arrayMove(currentColumns, activeIndex, overIndex);
      });
      return;
    }

    if (isActiveATask) {
      const taskBeingDragged = tasks.find((t) => t.id === activeId);
      if (!taskBeingDragged) return;

      const isOverAColumn = over.data.current?.type === "Column";
      const isOverATask = over.data.current?.type === "Task";
      let targetColumnId: Id = taskBeingDragged.columnId;

      if (isOverAColumn) {
        targetColumnId = overId;
      } else if (isOverATask) {
        const overTask = tasks.find((t) => t.id === overId);
        if (!overTask) return;
        targetColumnId = overTask.columnId;
      } else {
        return;
      }

      setTasks((currentTasks) => {
        const activeIndex = currentTasks.findIndex((t) => t.id === activeId);
        if (activeIndex === -1) return currentTasks;

        const targetColumn = columns.find(c => c.id === targetColumnId);
        const taskWithNewColumn = {
          ...currentTasks[activeIndex],
          columnId: targetColumnId,
          status: targetColumn ? targetColumn.title : mapColumnIdToStatus(targetColumnId),
        };

        const tasksWithoutActive = currentTasks.filter(

          (t) => t.id !== activeId
        );

        let finalIndex = tasksWithoutActive.findIndex(
          (t) => t.id === overId && t.columnId === targetColumnId
        );

        if (isOverAColumn) {
          const tasksInTargetColumn = tasksWithoutActive.filter(
            (t) => t.columnId === targetColumnId
          );
          if (tasksInTargetColumn.length > 0) {
            const lastTaskInColumnId =
              tasksInTargetColumn[tasksInTargetColumn.length - 1].id;
            finalIndex =
              tasksWithoutActive.findIndex((t) => t.id === lastTaskInColumnId) +
              1;
          } else {
            let insertAtIndex = tasksWithoutActive.length;
            for (let i = 0; i < columns.length; i++) {
              if (columns[i].id === targetColumnId) {
                const prevColId = i > 0 ? columns[i - 1].id : null;
                if (prevColId) {
                  const lastTaskOfPrevCol = tasksWithoutActive
                    .slice()
                    .reverse()
                    .find((t) => t.columnId === prevColId);
                  if (lastTaskOfPrevCol) {
                    insertAtIndex =
                      tasksWithoutActive.findIndex(
                        (t) => t.id === lastTaskOfPrevCol.id
                      ) + 1;
                    break;
                  } else {
                    for (let j = i - 1; j >= 0; j--) {
                      if (columns[j].id) {
                        const firstTaskOfNextCol = tasksWithoutActive.find(
                          (t) => t.columnId === columns[j].id
                        );
                        if (firstTaskOfNextCol) {
                          insertAtIndex = tasksWithoutActive.findIndex(
                            (t) => t.id === firstTaskOfNextCol.id
                          );
                          break;
                        }
                      }
                      if (j === 0) insertAtIndex = 0;
                    }
                    if (insertAtIndex !== tasksWithoutActive.length) break;
                  }
                } else {
                  insertAtIndex = 0;
                  break;
                }
              }
            }
            finalIndex = insertAtIndex;
          }
        } else if (isOverATask) {
          finalIndex = tasksWithoutActive.findIndex((t) => t.id === overId);
        }

        if (finalIndex === -1) finalIndex = tasksWithoutActive.length; // Fallback

        return [
          ...tasksWithoutActive.slice(0, finalIndex),
          taskWithNewColumn,
          ...tasksWithoutActive.slice(finalIndex),
        ];
      });

      if (taskBeingDragged.columnId !== targetColumnId) {
        const targetColumn = columns.find(c => c.id === targetColumnId);
        const newStatus = targetColumn ? targetColumn.title : mapColumnIdToStatus(targetColumnId);
        try {
          await updateTask({

            ...taskBeingDragged,
            columnId: targetColumnId,
            status: newStatus,
          });

          setTasks((prev) =>
            prev.map((t) =>
              t.id === active.id
                ? { ...t, columnId: targetColumnId, status: newStatus }
                : t
            )
          );
        } catch {
          console.error(
            "Failed to update task on drag end, reverting optimisitic update."
          );
          setTasks((prev) =>
            prev
              .map((t) =>
                t.id === active.id
                  ? {
                      ...t,
                      columnId: taskBeingDragged.columnId,
                      status: taskBeingDragged.status,
                    }
                  : t
              )
              .sort(() => {
                return 0;
              })
          );
        }
      }
    }
  };

  const toggleView = (view: boolean) => {
    setIsListView(view);
  };

  return (
    <div onClick={handlePageClick} className="flex flex-col h-full w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div className="w-full sm:w-1/3 lg:w-1/4">
          <SearchBar
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                {selectedFilterLabels.length > 0 && (
                  <Button
                    label="Clear Filters"
                    variant="secondary"
                    onClick={() => setSelectedFilterLabels([])}
                  />
                )}
                <Dropdown
                  items={["None", "Low", "Medium", "High"]}
                  direction="down"
                  placeholder="Priority"
                  selectedItem={selectedPriority}
                  onSelect={setSelectedPriority}
                  variant="small"
                />
                <SegmentedControl
                  defaultValue={isListView ? "first" : "second"}
                  options={{
                    first: {
                      label: "List",
                      icon: "list",
                      value: "first",
                      onClick: () => toggleView(true),
                    },
                    second: {
                      label: "Board",
                      icon: "grid_view",
                      value: "second",
                      onClick: () => toggleView(false),
                    },
                  }}
                />
              </div>
            </div>

          {effectiveLoading ? (
            <div className="flex-grow flex gap-4 overflow-x-auto pb-4 px-2">
              {columns.map((col) => (
                <div key={col.id} className="w-full sm:w-[270px] flex-shrink-0">
                  <ColumnContainer
                    column={col}
                    tasks={[]}
                    userId={Number(userId)}
                    projectTitle={projectTitle}
                    updateColumnTitle={() => {}}
                    openTicketModal={() => {}}
                    addTask={() => {}}
                    dropdownItems={[]}
                    openTaskModal={() => {}}
                    deleteTask={() => {}}
                    toggleDropdown={() => {}}
                    dropdownOpen={null}
                    openLabelPopup={() => {}}
                    loading={true}
                  />
                </div>
              ))}
            </div>
          ) : isListView ? (
            <TaskListView
              tasks={filteredTasks}
              columns={columns}
              openTaskModal={openTaskModal}
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
            >
              <div className="flex-grow flex gap-4 overflow-x-auto pb-4 px-2">
                <SortableContext
                  items={columnsId}
                  strategy={horizontalListSortingStrategy}
                >
                  {columns.map((col) => {
                    const tasksForColumn = filteredTasks.filter(
                      (task) => task.columnId === col.id
                    );
                    return (
                      <SortableItem key={col.id} id={col.id} isColumn>
                        <ColumnContainer
                          column={col}
                          tasks={tasksForColumn}
                          userId={Number(userId)}
                          projectTitle={projectTitle}
                          updateColumnTitle={updateColumnTitle}
                          deleteColumn={deleteColumn}
                          openTicketModal={openTicketModal}

                          addTask={addTask}
                          dropdownItems={dropdownItems}
                          openTaskModal={openTaskModal}
                          deleteTask={deleteTask}
                          toggleDropdown={(taskId: string | number) =>
                            toggleTaskActionDropdown(taskId)
                          } // Simplified toggleDropdown call
                          dropdownOpen={
                            taskActionDropdownOpen &&
                            taskActionDropdownOpen.taskId &&
                            tasksForColumn.find(
                              (t) =>
                                t.id === taskActionDropdownOpen!.taskId &&
                                t.columnId === col.id
                            )
                              ? {
                                  colId: col.id,
                                  taskId: taskActionDropdownOpen.taskId,
                                }
                              : null
                          }
                          openLabelPopup={() =>
                            console.warn("Label popup not implemented")
                          }
                        />
                      </SortableItem>
                    );
                  })}
                </SortableContext>
                
                {/* Add new column button/form */}
                <div className="w-full sm:w-[270px] flex-shrink-0">
                  {isAddingColumn ? (
                    <div className="bg-gray-500 dark:bg-gray-800 s rounded-lg p-3 w-full flex flex-col gap-2">
                      <input
                        type="text"
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        placeholder="Column title"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateColumn();
                          if (e.key === "Escape") setIsAddingColumn(false);
                        }}
                        className="bg-gray-400 dark:bg-gray-700 p-2 rounded text-dark dark:text-light focus:outline-none w-full"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          label="Add"
                          variant="primary"
                          onClick={handleCreateColumn}
                        />
                        <Button
                          label="Cancel"
                          variant="ghost"
                          onClick={() => setIsAddingColumn(false)}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingColumn(true)}
                      className="bg-gray-500/50 dark:bg-gray-800/50 hover:bg-gray-500 dark:hover:bg-gray-800 transition-colors shadow-md rounded-lg p-3 w-full text-left text-dark dark:text-light font-semibold opacity-70 flex items-center gap-2"
                    >
                      <span className="text-xl leading-none">+</span> Add Column
                    </button>
                  )}
                </div>

              </div>

              {isBrowser &&
                createPortal(
                  <DragOverlay dropAnimation={null}>
                    {activeColumn && (
                      <ColumnContainer
                        column={activeColumn}
                        tasks={tasks.filter(
                          (t) => t.columnId === activeColumn?.id
                        )}
                        userId={Number(userId)}
                        projectTitle={projectTitle}
                        updateColumnTitle={() => {}}
                        deleteColumn={() => {}}
                        openTicketModal={() => {}}

                        addTask={() => {}}
                        dropdownItems={dropdownItems}
                        openTaskModal={() => {}}
                        toggleDropdown={() => {}}
                        deleteTask={() => {}}
                        openLabelPopup={() => {}}
                        dropdownOpen={null}
                        isOverlay={true}
                      />
                    )}
                    {activeTask && (
                      <TaskCard
                        task={activeTask}
                        openTaskModal={() => {}}
                        toggleDropdown={() => {}}
                        deleteTask={() => {}}
                        openLabelPopup={() => {}}
                        dropdownOpen={null}
                        isOverlay={true}
                      />
                    )}
                  </DragOverlay>,
                  document.body
                )}
            </DndContext>
          )}

          <TicketModal
            isOpen={isTicketModalOpen}
            columnName={
              activeColumnIdForModal
                ? columns.find((c) => c.id === activeColumnIdForModal)?.title ??
                  ""
                : ""
            }
            currentLimit={
              activeColumnIdForModal
                ? columnLimits[activeColumnIdForModal as string | number] || ""
                : ""
            }
            onSave={saveColumnLimit}
            onCancel={closeTicketModal}
          />

      {selectedTask && isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          columns={columns.map((c) => ({ id: String(c.id), title: c.title }))}
          taskDetails={{
            ...selectedTask,
            title: selectedTask.title || selectedTask.task || "",
            id: String(selectedTask.id),
            columnId: String(selectedTask.columnId),
            status: selectedTask.status!,
            priority: selectedTask.priority!,
            description: selectedTask.description,
            deadline: selectedTask.deadline,
          }}
          updateTask={
            async (updatedTask) => {
              if (!selectedTask) return;
              updateTask({
                ...updatedTask,
                task: updatedTask.title,
                id: selectedTask.id,
                columnId: selectedTask.columnId,
                type: selectedTask.type,
              });
            }
          }
          deleteTask={deleteTask}
          projectName={projectTitle || "Project"}
          availableLabels={dropdownItems}
          onClose={() => closeTaskModal(true)}
        />
      )}
    </div>
  );
};

export default TaskBoard;

