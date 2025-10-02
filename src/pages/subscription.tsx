
import { SubscriptionCard } from "../components/payments/SubscriptionCard";
import { getBusinessIdFromToken } from "../hooks/auth/useAuth";

const businessId = getBusinessIdFromToken();

export default function SubscriptionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-primary-700">Suscripción</h1>
      <SubscriptionCard
        businessId={businessId || ""}
        basePriceCents={1000}
        fareTax={0.21}
        currency="USD"
        maxSensors={100}
      />
    </div>
  );
}
