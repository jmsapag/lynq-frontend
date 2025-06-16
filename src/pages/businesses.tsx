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
} from "@heroui/react";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

const BusinessesPage: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const limit = 15;
  const { businesses, loading, error } = useBusinesses(page, limit);

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
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-end items-center mb-10">
        <Button variant="solid" size="sm" onPress={() => setShowModal(true)}>
          {t("businesses.addBusiness")}
        </Button>
      </div>

      {loading && (
        <div className="text-sm text-gray-500 mb-3">{t("common.loading")}</div>
      )}
      {error && (
        <div className="text-sm text-red-500 mb-3">
          {t("common.error")}: {error}
        </div>
      )}
      {deleteError && (
        <div className="text-sm text-red-500 mb-3">
          {t("businesses.deleteError")}: {deleteError}
        </div>
      )}
      {editError && (
        <div className="text-sm text-red-500 mb-3">
          {t("businesses.editError")}: {editError}
        </div>
      )}

      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="py-2 px-3 font-medium text-gray-700">
                {t("businesses.name")}
              </th>
              <th className="py-2 px-3 font-medium text-gray-700">
                {t("businesses.address")}
              </th>
              <th className="py-2 px-3 font-medium text-gray-700">
                {t("businesses.createdAt")}
              </th>
              <th className="py-2 px-3 font-medium text-gray-700 text-center">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(businesses) ? businesses : []).map((b, idx) => (
              <tr
                key={b.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="py-2 px-3 text-gray-900">{b.name}</td>
                <td className="py-2 px-3 text-gray-800">{b.address}</td>
                <td className="py-2 px-3 text-gray-500">
                  {new Date(b.created_at).toLocaleString()}
                </td>
                <td className="py-2 px-3 flex justify-center gap-2">
                  <button
                    className="text-blue-500 hover:text-blue-700 p-1"
                    onClick={() => handleEditClick(b)}
                    title={t("businesses.edit")}
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 p-1"
                    onClick={() => handleDeleteClick(b.id)}
                    disabled={deleting}
                    title={t("businesses.delete")}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
            {(!businesses || businesses.length === 0) && !loading && (
              <tr>
                <td colSpan={4} className="py-4 px-3 text-gray-400">
                  {t("common.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
