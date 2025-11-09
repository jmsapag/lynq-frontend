import React, { useRef, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Input,
  Spinner,
  Divider,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import {
  PaperAirplaneIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { useAIAssistant } from "../../hooks/ai/useAIAssistant";
import { AIAssistantMessage } from "../../types/aiAssistant";
import { MarkdownMessage } from "./MarkdownMessage";

interface AIAssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { messages, isLoading, sendMessage, clearMessages } = useAIAssistant();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  return (
    <Card
      className={`
        fixed z-40 transition-all duration-300 ease-in-out
        shadow-2xl
        ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
        
        /* Desktop: bottom-right corner */
        bottom-24 right-6 w-[400px]
        
        /* Mobile: full width at bottom */
        max-md:bottom-20 max-md:right-0 max-md:left-0 max-md:w-full max-md:rounded-t-lg max-md:rounded-b-none
        
        /* Tablet: smaller width */
        md:max-w-[calc(100vw-3rem)]
      `}
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      {/* Header */}
      <CardHeader className="flex justify-between items-center pb-3 px-4 pt-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="bg-primary/10 p-2 rounded-full">
            <SparklesIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-foreground">
              {t("assistant.title")}
            </h3>
            <p className="text-xs text-gray-500">{t("assistant.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onClick={handleClear}
              aria-label={t("assistant.clear")}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onClick={onClose}
            aria-label={t("assistant.closeModal")}
          >
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <Divider />

      {/* Messages Area */}
      <CardBody className="p-4">
        <div
          className="overflow-y-auto flex flex-col gap-3 min-h-[300px] max-h-[400px]"
          ref={messagesContainerRef}
        >
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <SparklesIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  {t("assistant.welcomeMessage")}
                </p>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((message: AIAssistantMessage) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-1 mb-2">
                    <SparklesIcon className="w-3 h-3 text-primary" />
                    <span className="text-xs font-semibold text-primary">
                      LYNQ Assistant
                    </span>
                  </div>
                )}
                <div className="text-sm">
                  <MarkdownMessage
                    content={message.content}
                    isUser={message.role === "user"}
                  />
                </div>
                <p
                  className={`text-xs mt-2 ${
                    message.role === "user" ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
                <Spinner size="sm" color="primary" />
                <p className="text-sm text-gray-600">
                  {t("assistant.thinking")}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </CardBody>

      <Divider />

      {/* Input Area */}
      <CardFooter className="flex flex-col gap-2 p-3">
        <div className="flex w-full gap-2">
          <Input
            placeholder={t("assistant.placeholder")}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
            size="sm"
            classNames={{
              input: "text-sm",
              inputWrapper: "h-10",
            }}
          />
          <Button
            isIconOnly
            size="md"
            color="primary"
            onClick={handleSend}
            isDisabled={!inputValue.trim() || isLoading}
            aria-label={t("assistant.send")}
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-center">
          {t("assistant.poweredBy", { defaultValue: "Powered by AI" })}
        </p>
      </CardFooter>
    </Card>
  );
};
