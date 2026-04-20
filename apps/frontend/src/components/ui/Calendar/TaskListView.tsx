import { Icon, Button } from "@graminate/ui";
import React from "react";
import { DisplayTask } from "./Calendar";

import Loader from "../Loader";

type TaskListViewProps = {
  selectedDate: Date;
  tasks: DisplayTask[];
  removeTask: (taskId: number) => void;
  updateTaskStatus: (taskId: number, newStatus: string) => void;
  setShowTasks: (value: boolean) => void;
  isSelectedDatePast: boolean;
  setShowAddTask: (value: boolean) => void;
  getDayStatus: (date: Date) => string;
  isLoading: boolean;
};

const getPriorityClass = (priority: "Low" | "Medium" | "High") => {
  switch (priority) {
    case "High":
      return "text-light";
    case "Medium":
      return "text-dark";
    case "Low":
      return "text-light";
    default:
      return "text-dark dark:text-light";
  }
};

const TaskListView = ({
  selectedDate,
  tasks,
  removeTask,
  updateTaskStatus,
  setShowTasks,
  isSelectedDatePast,
  setShowAddTask,
  getDayStatus,
  isLoading,
}: TaskListViewProps) => {
  const handleAddTaskClick = () => {
    setShowAddTask(true);
  };

  const handleBackClick = () => {
    setShowTasks(false);
  };

  const handleCheckboxChange = (task: DisplayTask) => {
    if (isSelectedDatePast) return;
    const newStatus = task.status === "Completed" ? "To Do" : "Completed";
    updateTaskStatus(task.task_id, newStatus);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4 border-b border-gray-400 dark:border-gray-200 pb-2">
        <button
          onClick={handleBackClick}
          className="p-2 rounded-full text-dark hover:text-dark dark:text-light hover:bg-gray-400 dark:hover:bg-gray-200 transition-colors duration-150 ease-in-out"
          aria-label="Back to calendar"
        >
          <Icon type={"arrow_back"} className="h-5 w-5" />
        </button>
        <h3 className="text-md font-semibold text-dark dark:text-light text-center">
          {getDayStatus(selectedDate)}
        </h3>

        {!isSelectedDatePast ? (
          <button
            aria-label="add tasks"
            className="p-2 rounded-full text-dark hover:text-light dark:text-light hover:bg-green-200 dark:hover:text-light transition-colors duration-150 ease-in-out"
            onClick={handleAddTaskClick}
          >
            <Icon type={"add"} className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-9 h-9"></div>
        )}
      </div>
      <div className="my-6 space-y-1 max-h-60 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Icon type={"progress_activity"}  size="lg" className="mr-2 animate- animate-spin" />
            <Loader />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-sm text-gray-300 py-4">
            No tasks scheduled for this day.
          </p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li
                key={task.task_id}
                className="py-3 flex justify-between items-center"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <input
                    type="checkbox"
                    className={`form-checkbox h-5 w-5 rounded text-green-200 border-gray-300 dark:border-gray-200 dark:bg-gray-100 dark:checked:bg-green-200 focus:ring-green-100 dark:focus:ring-green-200 mr-3 ${
                      isSelectedDatePast
                        ? "cursor-not-allowed opacity-70"
                        : "cursor-pointer"
                    }`}
                    checked={task.status === "Completed"}
                    onChange={() => handleCheckboxChange(task)}
                    disabled={isSelectedDatePast}
                    aria-label={`Mark task ${task.name} as ${
                      task.status === "Completed" ? "to do" : "completed"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium text-dark dark:text-light truncate ${
                        task.status === "Completed"
                          ? "line-through text-gray-500 dark:text-gray-400"
                          : ""
                      }`}
                    >
                      {task.name}
                    </p>
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0 w-16 text-right">
                  {task.status === "Completed" ? (
                    <Button
                      label="Delete"
                      variant="destructive"
                      type="button"
                      disabled={isSelectedDatePast}
                      onClick={() => removeTask(task.task_id)}
                    />

                  ) : (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getPriorityClass(
                        task.priority
                      )} ${
                        task.priority === "High"
                          ? "bg-red-200"
                          : task.priority === "Medium"
                          ? "bg-yellow-200"
                          : "bg-green-200"
                      }`}
                    >
                      {task.priority}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default TaskListView;
