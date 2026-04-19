import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import PlatformLayout from "@/layout/PlatformLayout";
import TaskBoard from "@/components/tasks/TaskBoard";
import { Button } from "@graminate/ui";

const TasksPage = () => {
  const router = useRouter();
  const projectTitle = router.query.project as string;
  const userId = router.query.user_id as string;

  if (!router.isReady) return null;

  return (
    <>
      <Head>
        <title>Graminate | Tasks - {projectTitle}</title>
      </Head>
      <PlatformLayout>
        <div className="min-h-screen p-4 flex flex-col dark:bg-gray-900">
          <div className="mb-4 px-2">
            <Button
              label="Back"
              variant="ghost"
              icon={{ left: "arrow_back" }}
              onClick={() => router.back()}
            />
          </div>
          <div className="px-2 mb-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <h2 className="text-md dark:text-light text-dark">
                Project / {projectTitle || "Loading..."}
              </h2>
            </div>
          </div>
          
          <div className="flex-grow overflow-hidden">
             <TaskBoard projectTitle={projectTitle} userId={userId} />
          </div>
        </div>
      </PlatformLayout>
    </>
  );
};

export default TasksPage;
