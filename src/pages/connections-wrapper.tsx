import { useParams } from "react-router-dom";
import { useBusinesses } from "../hooks/business/useBusiness";
import ConnectionsPage from "./connections";
import { Spinner } from "@heroui/react";
import { useTranslation } from "react-i18next";

export default function ConnectionsPageWrapper() {
  const { t } = useTranslation();
  const { businessId } = useParams<{ businessId: string }>();
  const { businesses, loading } = useBusinesses(1, 100);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!businessId) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">
          {t("connections.invalidBusinessId", "Invalid business ID")}
        </p>
      </div>
    );
  }

  const business = businesses?.find((b) => b.id === parseInt(businessId));

  if (!business) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">
          {t("connections.businessNotFound", "Business not found")}
        </p>
      </div>
    );
  }

  return (
    <ConnectionsPage businessId={businessId} businessName={business.name} />
  );
}
