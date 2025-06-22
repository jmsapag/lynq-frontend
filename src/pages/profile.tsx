import { useTranslation } from "react-i18next";
import UserProfile from "../components/users/user-profile";
import { useUserProfile } from "../hooks/users/useUserProfile";
import { useUserId } from "../hooks/auth/useUserId";
import {
  useEditUserProfile,
  EditUserData,
} from "../hooks/users/useEditUserProfile";
import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  addToast,
} from "@heroui/react";

export default function ProfilePage() {
  const { t } = useTranslation();
  const userId = useUserId();
  const { user, loading, error, setUser } = useUserProfile(userId);

  const { editUser, loading: editLoading } = useEditUserProfile();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<
    (Omit<EditUserData, "role" | "business_id"> & { password?: string }) | null
  >(null);

  const handleEditClick = () => {
    if (!user) return;
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: "",
    });
    setEditMode(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form) return;
    const patchData: EditUserData = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: user.role,
      business_id: user.business_id,
      ...(form.password ? { password: form.password } : {}),
    };
    const success = await editUser(user.id, patchData);
    if (success) {
      setEditMode(false);
      setUser({
        ...user,
        name: patchData.name,
        email: patchData.email,
        phone: patchData.phone,
      });
      addToast({
        title: t("toasts.profileUpdateSuccessTitle"),
        description: t("toasts.profileUpdateSuccessDescription"),
        severity: "success",
        color: "success",
      });
    } else {
      addToast({
        title: t("toasts.profileUpdateErrorTitle"),
        description: t("toasts.profileUpdateErrorDescription"),
        severity: "danger",
        color: "danger",
      });
    }
  };

  if (loading) return <div>{t("common.loading")}</div>;
  if (error)
    return (
      <div>
        {t("common.error")}: {error}
      </div>
    );
  if (!user) return null;

  return (
    <div className="container mx-auto px-4">
      <UserProfile user={user} onEdit={handleEditClick} t={t} />
      <Modal isOpen={editMode} onOpenChange={setEditMode}>
        <ModalContent>
          <ModalHeader>{t("users.edit")}</ModalHeader>
          <ModalBody>
            <form
              id="edit-user-form"
              onSubmit={handleFormSubmit}
              className="space-y-4"
            >
              <Input
                name="name"
                label={t("users.fullName")}
                value={form?.name || ""}
                onChange={handleFormChange}
                required
              />
              <Input
                name="email"
                type="email"
                label={t("users.email")}
                value={form?.email || ""}
                onChange={handleFormChange}
                required
              />
              <Input
                name="phone"
                label={t("users.phone")}
                value={form?.phone || ""}
                onChange={handleFormChange}
                required
              />
              <Input
                name="password"
                type="password"
                label="Password"
                value={form?.password || ""}
                onChange={handleFormChange}
                autoComplete="new-password"
              />
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="bordered"
              size="sm"
              onPress={() => setEditMode(false)}
              isDisabled={editLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              form="edit-user-form"
              variant="solid"
              size="sm"
              isLoading={editLoading}
            >
              {t("common.apply")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
