import { Dropdown, Icon, Button, TextArea, Input, Popup } from "@graminate/ui";
import React, { useState, useEffect, KeyboardEvent, useMemo } from "react";

type TaskModalProps = {
  isOpen: boolean;
  taskDetails: {
    id: string;
    columnId: string;
    title: string;
    status: string;
    priority?: string;
    description?: string;
    deadline?: string;
  };
  projectName: string;
  columns?: { id: string; title: string }[];
  availableLabels: string[];
  onClose: () => void;
  updateTask: (updatedTask: {
    id: string;
    title: string;
    columnId: string;
    status: string;
    priority?: string;
    description?: string;
    deadline?: string;
  }) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
};

const TaskModal = ({
  isOpen,
  taskDetails,
  projectName,
  columns = [],
  onClose,
  deleteTask,
  updateTask,
}: TaskModalProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(taskDetails.title);
  const [editedDescription, setEditedDescription] = useState(
    taskDetails.description ?? ""
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const priorityOptions = ["Low", "Medium", "High"];
  
  // Use dynamic columns if provided
  const statusOptions = columns.length > 0
    ? columns.map(c => c.title)
    : ["To Do", "In Progress", "Checks", "Completed"];

  const initialStatus = useMemo(() => {
    if (columns.length > 0) {
      const matchingColumn = columns.find(c => c.id === taskDetails.columnId);
      if (matchingColumn) return matchingColumn.title;
    }
    return taskDetails.status;
  }, [columns, taskDetails.columnId, taskDetails.status]);

  const [taskData, setTaskData] = useState({
    ...taskDetails,
    status: initialStatus,
    priority: taskDetails.priority || "Medium",
    description: taskDetails.description ?? "",
    deadline: taskDetails.deadline ?? "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    variant: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    text: "",
    variant: "info",
  });

  const hasChanges = useMemo(() => {
    return (
      editedTitle !== taskDetails.title ||
      editedDescription !== (taskDetails.description ?? "") ||
      taskData.status !== taskDetails.status ||
      taskData.priority !== (taskDetails.priority || "Medium") ||
      taskData.deadline !== (taskDetails.deadline ?? "")
    );
  }, [editedTitle, editedDescription, taskData, taskDetails]);

  const handleSaveAll = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      const finalTaskData = {
        ...taskData,
        title: editedTitle.trim() || taskDetails.title,
        description: editedDescription,
      };
      await updateTask(finalTaskData);
      onClose();
    } catch (error) {
      console.error("Failed to save all changes:", error);
      setPopup({
        isOpen: true,
        title: "Error",
        text: "Failed to save changes. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateTaskFieldLocal = (field: keyof typeof taskData, value: string) => {
    setTaskData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeadlineChange = (newDeadline: string) => {
    updateTaskFieldLocal("deadline", newDeadline);
  };

  const handleDelete = async () => {
    setShowDropdown(false);
    try {
      await deleteTask(taskDetails.id);
      onClose();
    } catch (error) {
      console.error("Error deleting task:", error);
      setPopup({
        isOpen: true,
        title: "Error!",
        text: "Could not delete the task.",
        variant: "error",
      });
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setTaskData((prev) => ({
      ...prev,
      status: newStatus,
      columnId: mapStatusToColumnId(newStatus),
    }));
  };

  const handlePriorityChange = (newPriority: string) => {
    updateTaskFieldLocal("priority", newPriority);
  };

  const mapStatusToColumnId = (status: string): string => {
    if (columns.length > 0) {
      const col = columns.find((c) => c.title === status);
      if (col) return col.id;
    }

    switch (status) {
      case "To Do":
        return "todo";
      case "In Progress":
        return "progress";
      case "Checks":
        return "check";
      case "Completed":
        return "done";
      default:
        return "todo";
    }
  };

  useEffect(() => {
    const currentDescription = taskDetails.description ?? "";
    
    // Resolve the display status from the columnId if columns are available
    let displayStatus = taskDetails.status;
    if (columns.length > 0) {
      const matchingColumn = columns.find(c => c.id === taskDetails.columnId);
      if (matchingColumn) {
        displayStatus = matchingColumn.title;
      }
    }

    setEditedTitle(taskDetails.title);
    setEditedDescription(currentDescription);
    setTaskData({
      ...taskDetails,
      status: displayStatus,
      priority: taskDetails.priority || "Medium",
      description: currentDescription,
      deadline: taskDetails.deadline ?? "",
    });
    setIsEditingTitle(false);
    setShowDropdown(false);
  }, [taskDetails, isOpen, columns]);

  const closeModal = () => {
    if (onClose) onClose();
  };

  const startEditingTitle = () => {
    setIsEditingTitle(true);
  };

  const saveTitleLocal = () => {
    if (!editedTitle.trim()) {
      setEditedTitle(taskData.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveTitleLocal();
    } else if (e.key === "Escape") {
      setEditedTitle(taskData.title);
      setIsEditingTitle(false);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn"
      onClick={closeModal}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl p-0 max-h-[90vh] w-full max-w-4xl shadow-2xl relative flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-400 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center space-x-3">
            <Icon type="assignment" className="text-primary h-5 w-5" />
            <p className="text-dark dark:text-light text-xs font-bold uppercase tracking-widest">
              {projectName} <span className="mx-1 text-gray-300">/</span> TASK-
              {taskDetails.id}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                className="p-1 rounded-md text-dark hover:text-dark dark:text-light hover:bg-gray-400 dark:hover:bg-gray-700 transition-all"
                aria-label="Options"
                onClick={toggleDropdown}
              >
                <Icon type={"more_horiz"} className="h-6 w-6" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-2xl rounded-xl py-2 z-10 border border-gray-400 dark:border-gray-700 animate-slideIn">
                  <button
                    className="flex items-center space-x-2 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    onClick={handleDelete}
                  >
                    <Icon type="delete" size="sm" />
                    <span>Delete Task</span>
                  </button>
                </div>
              )}
            </div>

            <button
              className="p-1 rounded-md text-dark hover:text-dark dark:text-light hover:bg-gray-400 dark:hover:bg-gray-700 transition-all"
              aria-label="Close"
              onClick={closeModal}
            >
              <Icon type={"close"} className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-hide">
            {/* Title Section */}
            <div>
              {isEditingTitle ? (
                <div className="animate-slideIn">
                  <Input
                    id="task-title-input"
                    label="Title"
                    hideLabel
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={saveTitleLocal}
                    onKeyDown={handleTitleKeyDown}
                  />
                  <p className="text-xs text-dark dark:text-light mt-1 ml-1 uppercase font-bold tracking-tighter">
                    Press Enter to save • Esc to cancel
                  </p>
                </div>
              ) : (
                <h1
                  className="text-dark dark:text-light text-3xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg -ml-2 px-2 py-1 cursor-text transition-colors leading-tight"
                  onClick={startEditingTitle}
                >
                  {editedTitle}
                </h1>
              )}
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <Icon type="notes" size="sm" />
                <h2 className="font-bold text-lg">Description</h2>
              </div>

              <div className="animate-fadeIn">
                <TextArea
                  id="task-description"
                  label="Task Description"
                  hideLabel
                  placeholder="Add a more detailed description..."
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="bg-gray-50/30 dark:bg-gray-800/20 border-gray-400 dark:border-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Sidebar / Details Panel */}
          <div className="w-full md:w-80 bg-gray-50 dark:bg-gray-900/50 border-l border-gray-400 dark:border-gray-700 p-6 md:p-8 space-y-8 overflow-y-auto">
            <h3 className="text-dark dark:text-light text-sm font-bold uppercase mb-6">
              Task Properties
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <Dropdown
                  key={`status-${taskData.id}`}
                  items={statusOptions}
                  selectedItem={taskData.status}
                  onSelect={handleStatusChange}
                  label="Status"
                  width="full"
                />
              </div>

              <div className="space-y-2">
                <Dropdown
                  key={`priority-${taskData.id}`}
                  items={priorityOptions}
                  selectedItem={taskData.priority}
                  onSelect={handlePriorityChange}
                  label="Priority"
                  width="full"
                />
              </div>

              <div className="space-y-2">
                <Dropdown
                  key={`deadline-${taskData.id}`}
                  items={[]}
                  selectedItem={taskData.deadline || "Set deadline"}
                  onSelect={handleDeadlineChange}
                  label="Deadline"
                  width="full"
                  isDatePicker={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-400 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/80 flex justify-end space-x-3">
          <Button
            label="Cancel"
            onClick={closeModal}
            variant="secondary"
          />
          <Button
            label={isSaving ? "Saving..." : "Save Changes"}
            onClick={handleSaveAll}
            variant="primary"
            disabled={!hasChanges || isSaving}
          />
        </div>
      </div>
      <Popup
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        text={popup.text}
        variant={popup.variant}
      />
    </div>
  );
};

export default TaskModal;
