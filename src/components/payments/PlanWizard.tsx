import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  addToast,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useCreatePlanWizard } from "../../hooks/payments/useCreatePlan";

const currencyOptions = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "ARS", label: "ARS" },
];
const billingOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export const PlanWizard = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const {
    step,
    setStep,
    draft,
    saveDraft,
    clearDraft,
    validate,
    error,
    setError,
    loading,
    submit,
    success,
  } = useCreatePlanWizard();

  useEffect(() => {
    if (success) {
      addToast({
        title: t("planWizard.successTitle"),
        description: t("planWizard.successDesc"),
        severity: "success",
        color: "success",
      });
      setTimeout(() => {
        setIsOpen(false);
        clearDraft();
        setStep(0);
      }, 1200);
    }
    if (error) {
      addToast({
        title: t("planWizard.errorTitle"),
        description: error,
        severity: "danger",
        color: "danger",
      });
    }
    // eslint-disable-next-line
  }, [success, error]);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    saveDraft({ ...draft, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleNext = () => {
    const validationError = validate(draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setStep(1);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setStep(0);
    clearDraft();
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep(0);
    clearDraft();
    setError(null);
  };

  return (
    <div className="w-full">
      <div className="flex justify-end items-center mb-4">
        <Button color="primary" onPress={handleOpen}>
          {t("planWizard.createPlanBtn")}
        </Button>
      </div>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen} size="lg">
        <ModalContent>
          <ModalHeader>
            {success
              ? t("planWizard.planCreated")
              : t("planWizard.createNewPlan")}
          </ModalHeader>
          <ModalBody>
            {success ? (
              <div>
                <p>
                  {t("planWizard.planId")}: {success.id}
                </p>
                <p>
                  {t("planWizard.status")}: {success.status}
                </p>
              </div>
            ) : (
              <>
                {step === 0 && (
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleNext();
                    }}
                  >
                    <Input
                      label={t("planWizard.planName")}
                      name="name"
                      value={draft.name}
                      onChange={handleInput}
                      required
                    />
                    <Input
                      label={t("planWizard.maxSensors")}
                      name="maxSensors"
                      type="number"
                      min={1}
                      value={
                        draft.maxSensors === "" ? "" : String(draft.maxSensors)
                      }
                      onChange={handleInput}
                      required
                    />
                    <Input
                      label={t("planWizard.retentionMonths")}
                      name="retentionMonths"
                      type="number"
                      min={1}
                      value={
                        draft.retentionMonths === ""
                          ? ""
                          : String(draft.retentionMonths)
                      }
                      onChange={handleInput}
                      required
                    />
                    <Input
                      label={t("planWizard.priceCents")}
                      name="priceCents"
                      type="number"
                      min={0}
                      value={
                        draft.priceCents === "" ? "" : String(draft.priceCents)
                      }
                      onChange={handleInput}
                      required
                    />
                    <Select
                      label={t("planWizard.currency")}
                      name="currency"
                      value={draft.currency}
                      onChange={handleInput}
                      required
                      items={currencyOptions}
                    >
                      {(item) => (
                        <SelectItem key={item.value}>{item.label}</SelectItem>
                      )}
                    </Select>
                    <Select
                      label={t("planWizard.billingInterval")}
                      name="billingInterval"
                      value={draft.billingInterval}
                      onChange={handleInput}
                      required
                      items={billingOptions}
                    >
                      {(item) => (
                        <SelectItem key={item.value}>{item.label}</SelectItem>
                      )}
                    </Select>
                  </form>
                )}
                {step === 1 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t("planWizard.summary")}
                    </h3>
                    <ul className="mb-4">
                      <li>
                        <strong>{t("planWizard.planName")}:</strong>{" "}
                        {draft.name}
                      </li>
                      <li>
                        <strong>{t("planWizard.maxSensors")}:</strong>{" "}
                        {draft.maxSensors}
                      </li>
                      <li>
                        <strong>{t("planWizard.retentionMonths")}:</strong>{" "}
                        {draft.retentionMonths} {t("planWizard.months")}
                      </li>
                      <li>
                        <strong>{t("planWizard.priceCents")}:</strong>{" "}
                        {draft.priceCents} {draft.currency}
                      </li>
                      <li>
                        <strong>{t("planWizard.billingInterval")}:</strong>{" "}
                        {draft.billingInterval}
                      </li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </ModalBody>
          <ModalFooter>
            {success ? (
              <Button color="primary" onPress={handleClose}>
                {t("common.close")}
              </Button>
            ) : (
              <>
                {step === 0 && (
                  <>
                    <Button variant="bordered" onPress={handleClose}>
                      {t("common.cancel")}
                    </Button>
                    <Button type="submit" color="primary" onPress={handleNext}>
                      {t("common.next")}
                    </Button>
                  </>
                )}
                {step === 1 && (
                  <>
                    <Button
                      variant="bordered"
                      onPress={() => setStep(0)}
                      disabled={loading}
                    >
                      {t("common.back")}
                    </Button>
                    <Button
                      color="primary"
                      onPress={submit}
                      isLoading={loading}
                    >
                      {t("planWizard.confirmAndCreate")}
                    </Button>
                  </>
                )}
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
