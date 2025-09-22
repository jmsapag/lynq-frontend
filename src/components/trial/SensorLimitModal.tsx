import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface SensorLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  currentSensors: number;
  sensorLimit: number;
}

export const SensorLimitModal = ({
  isOpen,
  onClose,
  onUpgrade,
  currentSensors,
  sensorLimit,
}: SensorLimitModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Sensor Limit Reached</ModalHeader>
        <ModalBody>
          <p>
            You've reached the maximum number of sensors ({currentSensors}/
            {sensorLimit}) allowed in your free trial.
          </p>
          <p className="mt-2">
            Upgrade to a paid plan to add more sensors and unlock additional
            features.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={onUpgrade}>
            Upgrade Now
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
