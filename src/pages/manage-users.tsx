import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  addToast,
} from "@heroui/react";
import { useBusinesses } from "../hooks/business/useBusiness";
import { useCreateRegistrationTokens } from "../hooks/useCreateRegistrationTokens";

const ManageUsersPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "STANDARD">("STANDARD");
  const [count, setCount] = useState(1);
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);

  const [showTokensModal, setShowTokensModal] = useState(false);

  const { businesses, loading: businessesLoading } = useBusinesses(1, 100);
  const {
    createTokens,
    loading: creating,
    error,
    tokens,
    setTokens,
  } = useCreateRegistrationTokens();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !count || !selectedBusiness) {
      addToast({
        title: "Form Error",
        description: "Please fill in all fields.",
        severity: "danger",
        color: "danger",
      });
      return;
    }
    try {
      const result = await createTokens(count, role, selectedBusiness);
      if (result) {
        setShowModal(false);
        setShowTokensModal(true);
        addToast({
          title: "Success",
          description: "Registration tokens created successfully!",
          severity: "success",
          color: "success",
        });
      }
    } catch (err) {
      addToast({
        title: "Error",
        description: error || "Failed to create registration tokens.",
        severity: "danger",
        color: "danger",
      });
    }
  };

  const handleCloseTokensModal = () => {
    setShowTokensModal(false);
    setTokens(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-end items-center mb-10">
        <Button variant="solid" size="sm" onPress={() => setShowModal(true)}>
          Add Users
        </Button>
      </div>

      {/* Create Users Modal */}
      <Modal isOpen={showModal} onOpenChange={setShowModal}>
        <ModalContent>
          <ModalHeader>Add Users</ModalHeader>
          <ModalBody>
            <form
              className="space-y-4"
              id="create-users-form"
              onSubmit={handleCreateUser}
            >
              <Select
                label="Role"
                value={role}
                onChange={(e) => {
                  const value = (e.target as HTMLSelectElement).value;
                  if (value === "ADMIN" || value === "STANDARD") setRole(value);
                }}
                required
              >
                <SelectItem key="ADMIN">ADMIN</SelectItem>
                <SelectItem key="STANDARD">STANDARD</SelectItem>
              </Select>
              <Input
                label="Count"
                type="number"
                min={1}
                value={count.toString()}
                onChange={(e) => setCount(Number(e.target.value))}
                required
              />
              <Select
                label="Business"
                value={selectedBusiness?.toString() || ""}
                onChange={(e) =>
                  setSelectedBusiness(
                    Number((e.target as HTMLSelectElement).value),
                  )
                }
                required
                isDisabled={businessesLoading}
              >
                {(businesses || []).map((b) => (
                  <SelectItem key={b.id}>{b.name}</SelectItem>
                ))}
              </Select>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="bordered"
              size="sm"
              onPress={() => setShowModal(false)}
              isDisabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-users-form"
              variant="solid"
              size="sm"
              isLoading={creating}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Tokens Modal */}
      <Modal isOpen={showTokensModal} onOpenChange={handleCloseTokensModal}>
        <ModalContent>
          <ModalHeader>Registration Tokens</ModalHeader>
          <ModalBody>
            {tokens && tokens.length > 0 ? (
              <ul className="space-y-2">
                {tokens.map((token, idx) => (
                  <li
                    key={idx}
                    className="bg-gray-100 rounded px-3 py-2 font-mono break-all"
                  >
                    {token}
                  </li>
                ))}
              </ul>
            ) : (
              <div>No tokens received.</div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="solid" size="sm" onPress={handleCloseTokensModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ManageUsersPage;
