import React, { useState } from "react";
import { Button, Tooltip, Badge } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { AIAssistantChat } from "./AIAssistantChat";

export const AIAssistantFAB: React.FC = () => {
  const { t } = useTranslation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleToggle = () => {
    setIsChatOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Tooltip
        content={
          isChatOpen ? t("assistant.closeChat") : t("assistant.fabLabel")
        }
        placement="left"
      >
        <Badge
          content=""
          color="success"
          shape="circle"
          placement="top-right"
          isInvisible={!isChatOpen}
          classNames={{
            badge: "w-3 h-3",
          }}
        >
          <Button
            isIconOnly
            color={isChatOpen ? "default" : "primary"}
            size="lg"
            radius="full"
            onClick={handleToggle}
            className={`fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-all duration-300 ${
              isChatOpen ? "rotate-90" : "rotate-0"
            }`}
            aria-label={
              isChatOpen ? t("assistant.closeChat") : t("assistant.fabLabel")
            }
          >
            {isChatOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <SparklesIcon className="w-6 h-6" />
            )}
          </Button>
        </Badge>
      </Tooltip>

      {/* Assistant Chat Widget */}
      <AIAssistantChat isOpen={isChatOpen} onClose={handleClose} />
    </>
  );
};
