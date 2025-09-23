import { useState, useEffect } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export interface SubscriptionEvent {
  id: string;
  companyId: string;
  type: string;
  source: string;
  createdAt: string;
  payload: Record<string, any>;
}

export interface EventFilters {
  companyId?: string;
  type?: string;
  from?: string;
  to?: string;
}

// Service function
const getSubscriptionEvents = async (
  filters: EventFilters,
): Promise<SubscriptionEvent[]> => {
  const params = new URLSearchParams();

  if (filters.companyId) params.append("companyId", filters.companyId);
  if (filters.type) params.append("type", filters.type);
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);

  const response = await axiosPrivate.get(
    `/subscription-events?${params.toString()}`,
  );
  return response.data;
};

// Hook
export const useSubscriptionEvents = (filters: EventFilters = {}) => {
  const [events, setEvents] = useState<SubscriptionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubscriptionEvents(filters);
      setEvents(data);
    } catch (err) {
      setError("Error al cargar los eventos de suscripción");
      console.error("Error fetching subscription events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters.companyId, filters.type, filters.from, filters.to]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
};
