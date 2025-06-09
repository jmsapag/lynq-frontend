export function ContactModal({
  contactForm,
  contactErrors,
  handleContactChange,
  handleContactSubmit,
  onClose,
}: any) {
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
        {/* Fondo oscuro */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative z-10 inline-block bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-full max-w-lg text-left">
          <div className="bg-white px-6 pt-5 pb-6">
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-xl font-semibold text-gray-900"
                id="modal-title"
              >
                Contact Us
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  className={`block w-full px-3 py-2 border ${
                    contactErrors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500`}
                />
                {contactErrors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {contactErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  className={`block w-full px-3 py-2 border ${
                    contactErrors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500`}
                />
                {contactErrors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {contactErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Comment
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={4}
                  value={contactForm.comment}
                  onChange={handleContactChange}
                  className={`block w-full px-3 py-2 border ${
                    contactErrors.comment ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500`}
                ></textarea>
                {contactErrors.comment && (
                  <p className="mt-1 text-xs text-red-500">
                    {contactErrors.comment}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white rounded-md shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
