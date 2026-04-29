import { useEffect, useState, useCallback } from "react";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/utils/axiosInstance";
import { Button, Icon } from "@graminate/ui";
import Loader from "@/components/ui/Loader";

type FloricultureData = {
  flower_id: number;
  user_id: number;
  flower_name: string;
  flower_type: string | null;
  area: number | null;
  method: string | null;
  planting_date: string | null;
  created_at: string | null;
};

const FloricultureDetail = () => {
  const router = useRouter();
  const { user_id, flower_id } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const parsedFlowerId = Array.isArray(flower_id) ? flower_id[0] : flower_id;

  const [flower, setFlower] = useState<FloricultureData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFlowerDetails = useCallback(async () => {
    if (!parsedFlowerId) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/floriculture/${parsedFlowerId}`);
      setFlower(response.data);
    } catch (error) {
      console.error("Error fetching flower details:", error);
    } finally {
      setLoading(false);
    }
  }, [parsedFlowerId]);

  useEffect(() => {
    if (router.isReady) {
      fetchFlowerDetails();
    }
  }, [router.isReady, fetchFlowerDetails]);

  if (loading) {
    return (
      <PlatformLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      </PlatformLayout>
    );
  }

  if (!flower) {
    return (
      <PlatformLayout>
        <div className="container mx-auto p-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
            Flower not found.
          </div>
          <Button
            label="Back to Floriculture"
            variant="secondary"
            className="mt-4"
            onClick={() => router.push(`/${parsedUserId}/floriculture`)}
          />
        </div>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | {flower.flower_name}</title>
      </Head>
      <div className="container mx-auto p-6 flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/${parsedUserId}/floriculture`)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Icon type="arrow_back" />
          </button>
          <h1 className="text-3xl font-bold text-dark dark:text-light">
            {flower.flower_name}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailCard icon="local_florist" label="Flower Type" value={flower.flower_type || "N/A"} />
          <DetailCard icon="square_foot" label="Area" value={flower.area ? `${flower.area} sq ft` : "N/A"} />
          <DetailCard icon="psychology" label="Method" value={flower.method || "N/A"} />
          <DetailCard
            icon="calendar_today"
            label="Planting Date"
            value={flower.planting_date ? new Date(flower.planting_date).toLocaleDateString() : "N/A"}
          />
          <DetailCard
            icon="update"
            label="Last Updated"
            value={flower.created_at ? new Date(flower.created_at).toLocaleDateString() : "N/A"}
          />
        </div>
      </div>
    </PlatformLayout>
  );
};

const DetailCard = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
      <Icon type={icon} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xl font-bold text-dark dark:text-light mt-1">{value}</p>
    </div>
  </div>
);

export default FloricultureDetail;
