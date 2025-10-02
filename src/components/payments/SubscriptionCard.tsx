import { useState } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { createStripeCheckoutSession } from "../../services/stripeCheckoutService";

interface SubscriptionCardProps {
  businessId: string;
  basePriceCents: number;
  fareTax: number;
  currency: string;
  maxSensors?: number;
}

export const SubscriptionCard = ({ businessId, basePriceCents, fareTax, currency, maxSensors = 100 }: SubscriptionCardProps) => {
  const [sensorCount, setSensorCount] = useState(1);
  const [inputValue, setInputValue] = useState('1');
  const [inputError, setInputError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const pricePerSensor = basePriceCents * (1 + fareTax);
  const totalPrice = pricePerSensor * sensorCount;

  return (
    <Card className="w-full max-w-sm shadow-lg border border-primary-200 rounded-xl bg-white flex flex-col justify-between">
      <CardBody className="p-6 flex flex-col gap-4">
        <div className="mb-2">
          <span className="block text-3xl font-extrabold text-primary-700 tracking-tight mb-1">
            Suscripción LYNQ
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">Precio por sensor</span>
          <span className="text-2xl font-bold text-primary-700">{(pricePerSensor / 100).toFixed(2)} {currency}</span>
          <span className="text-xs text-gray-400">Incluye impuestos</span>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <span className="text-sm text-gray-600">Cantidad de sensores</span>
          <div className="flex items-center gap-2">
            <Button
              variant="bordered"
              size="sm"
              className="px-2 py-1"
              onPress={() => {
                const newVal = Math.max(1, sensorCount - 1);
                setSensorCount(newVal);
                setInputValue(String(newVal));
                setInputError(null);
              }}
              disabled={sensorCount <= 1}
            >
              -
            </Button>
            <div className="relative flex flex-col items-center justify-center w-14">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                max={maxSensors}
                value={inputValue}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setInputValue(val);
                  if (val === "") {
                    setInputError(null);
                  } else {
                    const num = Number(val);
                    if (num < 1 || num > maxSensors) {
                      setInputError(`Debe ser entre 1 y ${maxSensors}`);
                    } else {
                      setInputError(null);
                    }
                    setSensorCount(Math.max(1, Math.min(maxSensors, num)));
                  }
                }}
                className={`w-full text-center text-lg font-semibold text-primary-700 bg-primary-50 rounded-md border py-1 focus:outline-none focus:ring-2 focus:ring-primary-300 appearance-none ${inputError ? 'border-danger-500 ring-danger-300' : 'border-primary-200'}`}
                style={{ MozAppearance: 'textfield' }}
              />
              <span className="block text-xs text-danger-600 h-4 mt-1 pointer-events-none select-none absolute left-0 right-0 top-full" style={{ minHeight: '1rem', height: '1rem' }}>
                {inputError ? inputError : ''}
              </span>
            </div>
            <Button
              variant="bordered"
              size="sm"
              className="px-2 py-1"
              onPress={() => {
                const newVal = Math.min(maxSensors, sensorCount + 1);
                setSensorCount(newVal);
                setInputValue(String(newVal));
                setInputError(null);
              }}
              disabled={sensorCount >= maxSensors}
            >
              +
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <span className="text-sm text-gray-500">Total mensual</span>
          <span className="text-3xl font-extrabold text-primary-600">{(totalPrice / 100).toFixed(2)} {currency}</span>
        </div>
        <Button
          color="primary"
          className="w-full mt-4 py-3 text-base font-bold rounded-lg shadow-sm hover:bg-primary-700 transition"
          disabled={!!inputError || loading}
          onPress={async () => {
            setLoading(true);
            setCheckoutError(null);
            try {
              const res = await createStripeCheckoutSession(businessId);
              window.location.href = res.url;
            } catch (e: any) {
              setCheckoutError(e?.response?.data?.message || "Error al iniciar checkout");
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Redirigiendo..." : "Suscribirme"}
        </Button>
        {checkoutError && (
          <div className="text-danger-600 text-sm mt-2 text-center">{checkoutError}</div>
        )}
      </CardBody>
    </Card>
  );
};
