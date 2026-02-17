import React from "react";
import Head from "next/head";
import PlatformLayout from "@/layouts/PlatformLayout";

const AdminDashboardPage = () => {
  return (
    <>
      <Head>
        <title>Graminate | Admin Dashboard</title>
      </Head>
      <PlatformLayout>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        </div>
      </PlatformLayout>
    </>
  );
};

export default AdminDashboardPage;
