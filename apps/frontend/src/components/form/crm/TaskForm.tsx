import { Button, Input, Icon } from "@graminate/ui";
import React, { useState, useRef, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/utils/axiosInstance";
import { triggerToast } from "@/stores/toast";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";

type TaskFormProps = {
  userId: string | string[] | undefined;
  onClose: () => void;
};

const TaskForm = ({ userId, onClose }: TaskFormProps) => {
  const [animate, setAnimate] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useAnimatePanel(setAnimate);

  const handleCloseAnimation = useCallback(() => {
    setAnimate(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const handleClose = useCallback(() => {
    handleCloseAnimation();
  }, [handleCloseAnimation]);

  useClickOutside(panelRef, handleClose);

  const [projectValue, setProjectValue] = useState("");
  const [subTypes, setSubTypes] = useState<string[]>([]);
  const [isLoadingSubTypes, setIsLoadingSubTypes] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUserSubTypes = async () => {
      setIsLoadingSubTypes(true);
      try {
        const response = await axiosInstance.get(`/user/${userId}`);
        const user = response.data?.data?.user ?? response.data?.user;
        if (!user) throw new Error("User payload missing");
        setSubTypes(Array.isArray(user.sub_type) ? user.sub_type : []);
      } catch (error) {
        console.error("Error fetching user sub_types:", error);
        setSubTypes([]);
      } finally {
        setIsLoadingSubTypes(false);
      }
    };
    if (userId) {
      fetchUserSubTypes();
    }
  }, [userId]);

  const handleProjectInputChange = (val: string) => {
    setProjectValue(val);
    if (val.length > 0) {
      const filtered = subTypes.filter((subType) =>
        subType.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions(subTypes);
      setShowSuggestions(true);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setProjectValue(suggestion);
    setShowSuggestions(false);
  };

  const handleProjectInputFocus = () => {
    if (subTypes.length > 0) {
      setSuggestions(subTypes);
      setShowSuggestions(true);
    }
  };

  const handleSubmitCategory = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!projectValue) {
      triggerToast("Please fill in Project Name.", "error");
      return;
    }
    const payload = {
      user_id: Number(userId),
      project: projectValue,
    };
    try {
      const response = await axiosInstance.post("/tasks/add", payload);
      if (response.data && response.data.task_id) {
        setProjectValue("");
        triggerToast("Project created successfully!", "success");
        onClose();
        window.location.reload();
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "An unexpected error occurred";
      triggerToast(`Error: ${message}`, "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md transition-opacity duration-300">
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full md:w-[540px] bg-white dark:bg-gray-700 overflow-hidden flex flex-col"
        style={{
          transform: animate ? "translateX(0)" : "translateX(100%)",
          transition: "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="px-8 py-6 flex justify-between items-center border-b border-gray-400 dark:border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Project
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              Initialize a new category for your tasks and activities.
            </p>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-gray-500 dark:hover:bg-gray-600 text-dark dark:text-light transition-all"
            onClick={handleClose}
            aria-label="Close panel"
          >
            <Icon type={"close"} className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
          <form
            className="space-y-8"
            onSubmit={handleSubmitCategory}
            noValidate
          >
            {/* Project Details Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="relative">
                  <Input
                    id="projectName"
                    label="Project Category"
                    value={projectValue}
                    onChange={(e) => handleProjectInputChange(e.target.value)}
                    onFocus={handleProjectInputFocus}
                    required
                  />
                  
                  {suggestions.length > 0 && showSuggestions && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-400 dark:border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-600">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Default Suggestions</p>
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 text-sm cursor-pointer text-gray-900 dark:text-white transition-colors"
                          onClick={() => selectSuggestion(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <div className="flex gap-3">
                <Icon type="info" className="text-blue-500 shrink-0" size="sm" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Projects help you organize related tasks. Once created, you can add specific activities, deadlines, and priorities to this category.
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Action Footer */}
        <div className="p-8 border-t border-gray-400 dark:border-gray-200 grid grid-cols-2 gap-4 w-full">
          <Button
            label="Cancel"
            variant="secondary"
            onClick={handleClose}
            className="w-full"
          />
          <Button
            label="Create Project"
            variant="primary"
            type="submit"
            onClick={handleSubmitCategory}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
