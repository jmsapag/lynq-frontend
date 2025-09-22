import { PlanWizard } from "../components/payments/PlanWizard";
import { useLocation } from "react-router-dom";
import { Card, CardBody } from "@heroui/react";

const PlanCreate = () => {
  const location = useLocation();
  const fromTrial = location.state?.fromTrial || false;

  return (
    <div className="p-6">
      {fromTrial && (
        <Card className="mb-6 border-warning">
          <CardBody className="bg-warning-50">
            <h2 className="text-lg font-semibold text-warning-800 mb-2">
              Upgrade Required
            </h2>
            <p className="text-warning-700">
              You've reached your trial limits. Choose a plan to continue using
              LYNQ.
            </p>
          </CardBody>
        </Card>
      )}
      <PlanWizard />
    </div>
  );
};

export default PlanCreate;
