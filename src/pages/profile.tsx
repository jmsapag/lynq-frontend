import { useTranslation } from "react-i18next";
import UserProfile from "../components/users/user-profile";

const currentUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 234 567 890",
  role: "Administrator",
  business: "ACME Inc.",
};

export default function ProfilePage() {
  const { t } = useTranslation();

  const handleEdit = () => {
    console.log("Edit action triggered");
  };

  return (
    <div className="container mx-auto px-4">
      <UserProfile user={currentUser} onEdit={handleEdit} t={t} />
    </div>
  );
}
