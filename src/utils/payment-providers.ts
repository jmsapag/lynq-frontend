import {
  PaymentProviderMetadata,
  PaymentProviderType,
} from "../types/payment-integration";

export const paymentProviderMetadata: Record<
  PaymentProviderType,
  PaymentProviderMetadata
> = {
  mercadopago: {
    type: "mercadopago",
    name: "MercadoPago",
    description: "Plataforma de pagos líder en América Latina",
    icon: "💳",
    requiredFields: [
      {
        field: "accessToken",
        label: "Access Token",
        type: "password",
        required: true,
        placeholder: "APP_USR-XXXX-XXXX-XXXX",
      },
      {
        field: "publicKey",
        label: "Public Key",
        type: "text",
        required: true,
        placeholder: "APP_USR-XXXX-XXXX-XXXX",
      },
      {
        field: "webhookUrl",
        label: "Webhook URL",
        type: "url",
        required: false,
        placeholder: "https://tu-app.com/webhooks/mercadopago",
      },
      {
        field: "testMode",
        label: "Modo de prueba",
        type: "select",
        required: false,
        options: [
          { value: "true", label: "Activado" },
          { value: "false", label: "Desactivado" },
        ],
      },
    ],
    testingSupported: true,
    documentationUrl: "https://www.mercadopago.com.ar/developers/es/docs",
  },
  stripe: {
    type: "stripe",
    name: "Stripe",
    description: "Plataforma global de pagos online",
    icon: "🟣",
    requiredFields: [
      {
        field: "secretKey",
        label: "Secret Key",
        type: "password",
        required: true,
        placeholder: "sk_test_XXXX o sk_live_XXXX",
      },
      {
        field: "publishableKey",
        label: "Publishable Key",
        type: "text",
        required: true,
        placeholder: "pk_test_XXXX o pk_live_XXXX",
      },
      {
        field: "webhookSecret",
        label: "Webhook Secret",
        type: "password",
        required: false,
        placeholder: "whsec_XXXX",
      },
      {
        field: "webhookUrl",
        label: "Webhook URL",
        type: "url",
        required: false,
        placeholder: "https://tu-app.com/webhooks/stripe",
      },
    ],
    testingSupported: true,
    documentationUrl: "https://stripe.com/docs",
  },
  paypal: {
    type: "paypal",
    name: "PayPal",
    description: "Sistema de pago digital global",
    icon: "💙",
    requiredFields: [
      {
        field: "clientId",
        label: "Client ID",
        type: "text",
        required: true,
        placeholder: "AXXXXXXXXXXXXXXx",
      },
      {
        field: "clientSecret",
        label: "Client Secret",
        type: "password",
        required: true,
        placeholder: "EXXXXXXXXXXXXXXx",
      },
      {
        field: "environment",
        label: "Entorno",
        type: "select",
        required: true,
        options: [
          { value: "sandbox", label: "Sandbox (Pruebas)" },
          { value: "live", label: "Live (Producción)" },
        ],
      },
      {
        field: "webhookUrl",
        label: "Webhook URL",
        type: "url",
        required: false,
        placeholder: "https://tu-app.com/webhooks/paypal",
      },
    ],
    testingSupported: true,
    documentationUrl: "https://developer.paypal.com/docs/",
  },
  other: {
    type: "other",
    name: "Otro Proveedor",
    description: "Configuración personalizada para otros proveedores de pago",
    icon: "⚙️",
    requiredFields: [
      {
        field: "apiKey",
        label: "API Key",
        type: "password",
        required: true,
        placeholder: "Tu clave API",
      },
      {
        field: "apiSecret",
        label: "API Secret",
        type: "password",
        required: false,
        placeholder: "Tu secreto API (opcional)",
      },
      {
        field: "endpoint",
        label: "API Endpoint",
        type: "url",
        required: false,
        placeholder: "https://api.proveedor.com",
      },
      {
        field: "webhookUrl",
        label: "Webhook URL",
        type: "url",
        required: false,
        placeholder: "https://tu-app.com/webhooks/custom",
      },
    ],
    testingSupported: false,
    documentationUrl: undefined,
  },
};

export const getPaymentProviderMetadata = (
  provider: PaymentProviderType,
): PaymentProviderMetadata => {
  return paymentProviderMetadata[provider];
};

export const getAllPaymentProviders = (): PaymentProviderMetadata[] => {
  return Object.values(paymentProviderMetadata);
};
