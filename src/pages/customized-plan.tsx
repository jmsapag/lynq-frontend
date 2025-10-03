import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Divider,
  addToast,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCustomizedPlan } from "../hooks/payments/useCustomizedPlan";

interface FormData {
  company: string;
  contactEmail: string;
  message: string;
}

const CustomizedPlan: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { submitRequest, isLoading, isSuccess, error, reset } =
    useCustomizedPlan();

  const [formData, setFormData] = useState<FormData>({
    company: "",
    contactEmail: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (isSuccess) {
      addToast({
        title: t("customizedPlan.toasts.successTitle"),
        description: t("customizedPlan.toasts.successDescription"),
        severity: "success",
        color: "success",
      });
    }
  }, [isSuccess, t]);

  useEffect(() => {
    if (error) {
      addToast({
        title: t("customizedPlan.toasts.errorTitle"),
        description: error,
        severity: "danger",
        color: "danger",
      });
    }
  }, [error, t]);

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    if (!formData.company.trim()) {
      errors.company = t("customizedPlan.form.companyRequired");
    }

    if (!formData.contactEmail.trim()) {
      errors.contactEmail = t("customizedPlan.form.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      errors.contactEmail = t("customizedPlan.form.emailInvalid");
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      addToast({
        title: t("toasts.formErrorTitle"),
        description: t("toasts.formErrorDescription"),
        severity: "danger",
        color: "danger",
      });
      return false;
    }

    return true;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await submitRequest({
      company: formData.company.trim(),
      contactEmail: formData.contactEmail.trim(),
      message: formData.message.trim() || undefined,
    });
  };

  const handleBackToPlans = () => {
    navigate("/subscriptions");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border shadow-none bg-white  border-gray-200">
        <CardBody className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              {t("customizedPlan.title")}
            </h1>
            <p className="text-gray-600">{t("customizedPlan.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t("customizedPlan.form.companyLabel")}
              placeholder={t("customizedPlan.form.companyPlaceholder")}
              value={formData.company}
              onValueChange={(value) => handleInputChange("company", value)}
              isInvalid={!!formErrors.company}
              errorMessage={formErrors.company}
              isRequired
              variant="bordered"
              className="w-full"
            />

            <Input
              label={t("customizedPlan.form.emailLabel")}
              placeholder={t("customizedPlan.form.emailPlaceholder")}
              type="email"
              value={formData.contactEmail}
              onValueChange={(value) =>
                handleInputChange("contactEmail", value)
              }
              isInvalid={!!formErrors.contactEmail}
              errorMessage={formErrors.contactEmail}
              isRequired
              variant="bordered"
              className="w-full"
            />

            <Textarea
              label={t("customizedPlan.form.messageLabel")}
              placeholder={t("customizedPlan.form.messagePlaceholder")}
              value={formData.message}
              onValueChange={(value) => handleInputChange("message", value)}
              variant="bordered"
              minRows={4}
              maxRows={8}
              className="w-full"
            />

            <Divider />

            <div className="flex gap-3">
              <Button
                type="submit"
                color="primary"
                isLoading={isLoading}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading
                  ? t("customizedPlan.form.submitting")
                  : t("customizedPlan.form.submit")}
              </Button>
              <Button
                type="button"
                variant="light"
                onPress={handleBackToPlans}
                disabled={isLoading}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default CustomizedPlan;
