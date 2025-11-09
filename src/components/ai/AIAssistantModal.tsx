import React, { useRef, useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
  Spinner,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { PaperAirplaneIcon, TrashIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { useAIAssistant } from "../../hooks/ai/useAIAssistant";
import { AIAssistantMessage } from "../../types/aiAssistant";
import { MarkdownMessage } from "./MarkdownMessage";

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { messages, isLoading, sendMessage, clearMessages } = useAIAssistant();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    await sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    clearMessages();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      placement="center"
      classNames={{
        base: "max-h-[90vh]",
        body: "p-0",
      }}
    >
      <ModalContent>
        {(onModalClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">
                    {t("assistant.title")}
                  </h3>
                  <p className="text-sm text-gray-500 font-normal">
                    {t("assistant.subtitle")}
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="px-6 py-4">
              {/* Chat Messages */}
              <div className="flex flex-col gap-4 min-h-[400px] max-h-[500px] overflow-y-auto">
                {messages.length === 0 && (
                  <Card className="bg-blue-50 border border-blue-200">
                    <CardBody>
                      <div className="flex items-start gap-3">
                        <SparklesIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">
                          {t("assistant.welcomeMessage")}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {messages.map((message: AIAssistantMessage) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <Card
                      className={`max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-white"
                          : "bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <CardBody className="py-3 px-4">
                        <div className="flex items-start gap-2">
                          {message.role === "assistant" && (
                            <SparklesIcon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          )}
                          <div className="text-sm flex-1">
                            <MarkdownMessage
                              content={message.content}
                              isUser={message.role === "user"}
                            />
                          </div>
                        </div>
                        <p
                          className={`text-xs mt-2 ${
                            message.role === "user"
                              ? "text-white/70"
                              : "text-gray-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </CardBody>
                    </Card>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <Card className="bg-gray-100 border border-gray-200">
                      <CardBody className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Spinner size="sm" />
                          <p className="text-sm text-gray-600">
                            {t("assistant.thinking")}
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ModalBody>

            <ModalFooter className="flex-col gap-2 border-t border-gray-200">
              {/* Input Area */}
              <div className="flex w-full gap-2">
                <Input
                  placeholder={t("assistant.placeholder")}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                  endContent={
                    <Button
                      isIconOnly
                      size="sm"
                      color="primary"
                      variant="light"
                      onClick={handleSend}
                      isDisabled={!inputValue.trim() || isLoading}
                      aria-label={t("assistant.send")}
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                    </Button>
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="flex w-full justify-between">
                <Button
                  color="danger"
                  variant="light"
                  size="sm"
                  startContent={<TrashIcon className="w-4 h-4" />}
                  onClick={handleClear}
                  isDisabled={messages.length === 0}
                >
                  {t("assistant.clear")}
                </Button>
                <Button
                  color="default"
                  variant="light"
                  size="sm"
                  onPress={onModalClose}
                >
                  {t("assistant.closeModal")}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
