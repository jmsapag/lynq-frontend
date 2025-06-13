import { useTranslation } from "react-i18next";

export function ContactModal({
  contactForm,
  contactErrors,
  handleContactChange,
  handleContactSubmit,
  onClose,
}: any) {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleContactSubmit(e);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-modal="true"
      role="dialog"
    >
      <div className="flex items-center justify-center min-h-screen px-4 py-8 text-center">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>
        <div className="relative z-10 inline-block bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-full max-w-lg text-left">
          <div className="bg-white px-6 pt-5 pb-6">
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-xl font-semibold text-gray-900"
                id="modal-title"
              >
                {t("contactModal.title")}
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <span className="sr-only">{t("contactModal.close")}</span>
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("contactModal.firstName")}
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  value={contactForm.nombre}
                  onChange={handleContactChange}
                  className={`block w-full px-3 py-2 border ${contactErrors.nombre ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500`}
                />
                {contactErrors.nombre && (
                  <p className="mt-1 text-xs text-red-500">
                    {contactErrors.nombre}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="apellido"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("contactModal.lastName")}
                </label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  required
                  value={contactForm.apellido}
                  onChange={handleContactChange}
                  className={`block w-full px-3 py-2 border ${contactErrors.apellido ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500`}
                />
                {contactErrors.apellido && (
                  <p className="mt-1 text-xs text-red-500">
                    {contactErrors.apellido}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("users.email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={handleContactChange}
                  className={`block w-full px-3 py-2 border ${contactErrors.email ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500`}
                />
                {contactErrors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {contactErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="telefono"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("users.phone")}
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  required
                  value={contactForm.telefono}
                  onChange={handleContactChange}
                  className={`block w-full px-3 py-2 border ${contactErrors.telefono ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500`}
                />
                {contactErrors.telefono && (
                  <p className="mt-1 text-xs text-red-500">
                    {contactErrors.telefono}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="empresa"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("users.business")}
                </label>
                <input
                  id="empresa"
                  name="empresa"
                  type="text"
                  required
                  value={contactForm.empresa}
                  onChange={handleContactChange}
                  className={`block w-full px-3 py-2 border ${contactErrors.empresa ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500`}
                />
                {contactErrors.empresa && (
                  <p className="mt-1 text-xs text-red-500">
                    {contactErrors.empresa}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="ubicacion"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("contactModal.location")}
                </label>
                <textarea
                  id="ubicacion"
                  name="ubicacion"
                  rows={2}
                  required
                  value={contactForm.ubicacion}
                  onChange={handleContactChange}
                  className={`block w-full px-3 py-2 border ${contactErrors.ubicacion ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500`}
                ></textarea>
                {contactErrors.ubicacion && (
                  <p className="mt-1 text-xs text-red-500">
                    {contactErrors.ubicacion}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                >
                  {t("contactModal.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white rounded-md shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  {t("contactModal.submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
