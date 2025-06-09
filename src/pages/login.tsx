import { useState } from "react";
import { LoginForm } from "../components/login/loginForm.tsx";
import { ContactModal } from "../components/login/contactModal.tsx";
import {
  BackgroundShapes,
  RightPanelGradients,
} from "../components/login/background.tsx";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/react";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    comment: "",
  });
  const [contactErrors, setContactErrors] = useState<{
    name?: string;
    email?: string;
    comment?: string;
  }>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast({
        title: "Form Error",
        description: "Please fix the form errors before submitting.",
        severity: "danger",
        color: "danger",
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 2000));
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      addToast({
        title: "Login Failed",
        description: "Please try again.",
        severity: "danger",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
    setContactErrors({ ...contactErrors, [e.target.name]: undefined });
  };

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: typeof contactErrors = {};
    if (!contactForm.name) newErrors.name = "Name is required";
    if (!contactForm.email) newErrors.email = "Email is required";
    if (!contactForm.comment) newErrors.comment = "Comment is required";

    if (Object.keys(newErrors).length > 0) {
      setContactErrors(newErrors);
      return;
    }

    setContactForm({ name: "", email: "", comment: "" });
    setIsContactModalOpen(false);
    addToast({
      title: "Message Sent Successfully",
      description: "Thank you for contacting us! We will get back to you soon.",
      severity: "success",
      color: "success",
    });
  };

  return (
    <div className="min-h-screen bg-white relative flex">
      {/* Left panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 relative z-10">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome back!
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Login to continue exploring your metrics.
            </p>
          </div>
          <LoginForm
            formData={formData}
            errors={errors}
            isLoading={isLoading}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            setIsContactModalOpen={setIsContactModalOpen}
          />
        </div>
        <BackgroundShapes />
      </div>

      {/* Right panel */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#F0FAFB] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <RightPanelGradients />
        </div>
      </div>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <ContactModal
          contactForm={contactForm}
          contactErrors={contactErrors}
          handleContactChange={handleContactChange}
          handleContactSubmit={handleContactSubmit}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
    </div>
  );
}
