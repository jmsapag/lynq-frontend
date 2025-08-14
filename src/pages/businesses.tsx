import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useBusinesses } from "../hooks/business/useBusiness";
import { useCreateBusiness } from "../hooks/business/useCreateBusiness";
import { useDeleteBusiness } from "../hooks/business/useDeleteBusiness";
import { useEditBusiness } from "../hooks/business/useEditBusiness";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  addToast,
} from "@heroui/react";
import { TrashIcon, PencilIcon, BoltIcon } from "@heroicons/react/24/outline";
import SearchBar from "../components/search/SearchBar.tsx";
import { useNavigate } from "react-router";

const BusinessesPage: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const limit = 15;
  const { businesses, loading } = useBusinesses(page, limit);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const {
    createBusiness,
    loading: creating,
    error: createError,
  } = useCreateBusiness();

  const {
    deleteBusiness,
    loading: deleting,
    error: deleteError,
  } = useDeleteBusiness();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const {
    editBusiness,
    loading: editing,
    error: editError,
  } = useEditBusiness();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<number | null>(null);

  const hasNextPage = Array.isArray(businesses) && businesses.length === limit;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createBusiness(name, address);
    if (success) {
      setShowModal(false);
      setName("");
      setAddress("");
      window.location.reload();
    } else if (createError) {
      addToast({
        title: t("toasts.createFailedTitle"),
        description: t("toasts.createFailedDescription"),
        severity: "danger",
        color: "danger",
      });
    }
  };

  const handleDeleteClick = (id: number) => {
    setBusinessToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (businessToDelete !== null) {
      const success = await deleteBusiness(businessToDelete);
      setShowDeleteModal(false);
      setBusinessToDelete(null);
      if (success) {
        window.location.reload();
      } else if (deleteError) {
        addToast({
          title: t("toasts.deleteFailedTitle"),
          description: t("toasts.deleteFailedDescription"),
          severity: "danger",
          color: "danger",
        });
      }
    }
  };

  const handleEditClick = (b: {
    id: number;
    name: string;
    address: string;
  }) => {
    setEditId(b.id);
    setEditName(b.name);
    setEditAddress(b.address);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) {
      const success = await editBusiness(editId, editName, editAddress);
      setShowEditModal(false);
      setEditId(null);
      setEditName("");
      setEditAddress("");
      if (success) {
        window.location.reload();
      } else if (editError) {
        addToast({
          title: t("toasts.editFailedTitle"),
          description: t("toasts.editFailedDescription"),
          severity: "danger",
          color: "danger",
        });
      }
    }
  };

  const [search, setSearch] = useState("");

  const filteredBusinesses = Array.isArray(businesses)
    ? businesses.filter(
        (b) =>
          search.trim() === "" ||
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.address.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  return (
    <div className="w-full mx-1">
      <div className="flex justify-end items-center mb-4 gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t("common.search") || "Search businesses..."}
          className="w-64"
        />
        <Button
          color="primary"
          variant="solid"
          size="sm"
          onPress={() => setShowModal(true)}
        >
          {t("businesses.addBusiness")}
        </Button>
      </div>

      <div>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Spinner size="lg" />
          </div>
        ) : (
          <Table aria-label="Businesses table" isStriped>
            <TableHeader>
              <TableColumn>{t("businesses.name")}</TableColumn>
              <TableColumn>{t("businesses.address")}</TableColumn>
              <TableColumn>{t("businesses.createdAt")}</TableColumn>
              <TableColumn className="text-center">
                {t("common.actions")}
              </TableColumn>
            </TableHeader>
            <TableBody emptyContent={t("common.noData")}>
              {(Array.isArray(filteredBusinesses)
                ? filteredBusinesses
                : []
              ).map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="font-medium">{b.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-default-600">{b.address}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-default-600">
                      {new Date(b.created_at).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEditClick(b)}
                        className="text-primary"
                        title={t("businesses.edit")}
                      >
                        <PencilIcon className="h-6 w-6" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleDeleteClick(b.id)}
                        className="text-danger"
                        isDisabled={deleting}
                        title={t("businesses.delete")}
                      >
                        <TrashIcon className="h-6 w-6" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-green-500 "
                        title={t("businesses.connect")}
                        onPress={() => navigate(`/business/${b.id}/connections`)}
                      >
                        <BoltIcon className="h-6 w-6" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="mt-6 flex justify-center items-center gap-4">
        <Button
          variant="bordered"
          size="sm"
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          isDisabled={page === 1 || loading}
        >
          {t("common.previous")}
        </Button>
        <span className="text-sm text-gray-600">
          {t("common.page") + " " + page}
        </span>
        <Button
          variant="bordered"
          size="sm"
          onPress={() => setPage((p) => p + 1)}
          isDisabled={!hasNextPage || loading}
        >
          {t("common.next")}
        </Button>
      </div>

      {/* Create Business Modal */}
      <Modal isOpen={showModal} onOpenChange={setShowModal}>
        <ModalContent>
          <ModalHeader>{t("businesses.addBusiness")}</ModalHeader>
          <ModalBody>
            <form
              id="create-business-form"
              onSubmit={handleCreate}
              className="space-y-4"
            >
              <Input
                label={t("businesses.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label={t("businesses.address")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              {createError && (
                <div className="text-red-500 text-sm">
                  {t("businesses.createError")}
                </div>
              )}
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="bordered"
              size="sm"
              onPress={() => setShowModal(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              form="create-business-form"
              variant="solid"
              size="sm"
              isLoading={creating}
            >
              {t("common.apply")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Business Modal */}
      <Modal isOpen={showEditModal} onOpenChange={setShowEditModal}>
        <ModalContent>
          <ModalHeader>{t("businesses.editBusiness")}</ModalHeader>
          <ModalBody>
            <form
              id="edit-business-form"
              onSubmit={handleEditSubmit}
              className="space-y-4"
            >
              <Input
                label={t("businesses.name")}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
              <Input
                label={t("businesses.address")}
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                required
              />
              {editError && (
                <div className="text-red-500 text-sm">
                  {t("businesses.editError")}
                </div>
              )}
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="bordered"
              size="sm"
              onPress={() => setShowEditModal(false)}
              isDisabled={editing}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              form="edit-business-form"
              variant="solid"
              size="sm"
              isLoading={editing}
            >
              {t("common.apply")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <ModalContent>
          <ModalHeader>{t("businesses.deleteBusiness")}</ModalHeader>
          <ModalBody>{t("businesses.deleteConfirm")}</ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              size="sm"
              onPress={() => setShowDeleteModal(false)}
              isDisabled={deleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="solid"
              color="danger"
              size="sm"
              onPress={handleConfirmDelete}
              isLoading={deleting}
            >
              {t("businesses.delete")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default BusinessesPage;
