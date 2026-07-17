import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Button, Input, Table, TableData } from "@graminate/ui";
import PlatformLayout from "@/layout/PlatformLayout";
import axiosInstance from "@/lib/utils/axiosInstance";

type Admin = {
  admin_id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_root: boolean;
  created_at: string | null;
};

const AdminsPage = () => {
  const router = useRouter();
  const { admin_id } = router.query;

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [inviteCode, setInviteCode] = useState("");
  const [inviteExpiresAt, setInviteExpiresAt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const isRoot =
    typeof window !== "undefined" &&
    localStorage.getItem("admin_is_root") === "true";

  useEffect(() => {
    if (!admin_id) return;
    if (!isRoot) {
      router.replace(`/platform/${admin_id}`);
      return;
    }

    const fetchAdmins = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.replace("/");
        return;
      }
      try {
        const response = await axiosInstance.get("/admin/admins");
        if (response.status === 401) {
          localStorage.removeItem("admin_token");
          router.replace("/");
          return;
        }
        if (!response.data?.data?.admins) {
          throw new Error("Failed to fetch admins");
        }
        setAdmins(response.data.data.admins);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load admins");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, [router, admin_id, isRoot]);

  const handleCreateInviteCode = async () => {
    setIsGenerating(true);
    setInviteError(null);
    try {
      const response = await axiosInstance.post("/admin/invite-code");
      if (!response.data?.data?.inviteCode) {
        throw new Error("Failed to generate invite code");
      }
      setInviteCode(response.data.data.inviteCode);
      setInviteExpiresAt(response.data.data.expiresAt ?? null);
    } catch (err: unknown) {
      setInviteError(
        err instanceof Error ? err.message : "Failed to generate invite code"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const tableData: TableData = useMemo(
    () => ({
      columns: ["Name", "Email", "Role", "Created"],
      rows: admins.map((admin) => [
        `${admin.first_name} ${admin.last_name}`,
        admin.email,
        admin.is_root ? "Root" : "Admin",
        admin.created_at
          ? new Date(admin.created_at).toLocaleDateString()
          : "N/A",
      ]),
    }),
    [admins]
  );

  if (!isRoot) return null;

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Admin Management</title>
      </Head>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-light">
            Admin Management
          </h1>
          <p className="text-sm text-dark dark:text-light mt-1">
            As the root admin, you can generate invite codes and view all
            administrators.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-dark dark:text-light">
            Generate Invite Code
          </h2>
          <p className="text-sm text-dark dark:text-light">
            Share this code with new administrators so they can register.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <Input
                id="generated-invite-code"
                label=""
                placeholder="Click 'Create Invite Code' to generate"
                value={inviteCode}
                readOnly
                onChange={() => {}}
              />
            </div>
            <Button
              label="Create Invite Code"
              variant="primary"
              onClick={handleCreateInviteCode}
              isLoading={isGenerating}
            />
          </div>
          {inviteExpiresAt && (
            <p className="text-sm text-green-200">
              This code expires at{" "}
              {new Date(inviteExpiresAt).toLocaleString()} (valid for 1 hour).
            </p>
          )}
          {inviteError && (
            <p className="text-sm text-red-500">{inviteError}</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-dark dark:text-light mb-4">
            All Admin Members
          </h2>
          <Table
            data={tableData}
            filteredRows={tableData.rows}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            paginationItems={["10 per page", "25 per page", "50 per page"]}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            totalRecordCount={admins.length}
            loading={isLoading}
            hideChecks
            download={false}
          />
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        </div>
      </div>
    </PlatformLayout>
  );
};

export default AdminsPage;
