import { useTranslation } from "react-i18next";
import { Accordion, AccordionItem } from "@heroui/react";

const FaqPage = () => {
  const { t } = useTranslation();

  const faqItems = [
    {
      key: "1",
      title: t("help.faq.q1Title"),
      content: t("help.faq.q1Content"),
    },
    {
      key: "2",
      title: t("help.faq.q2Title"),
      content: t("help.faq.q2Content"),
    },
    {
      key: "3",
      title: t("help.faq.q3Title"),
      content: t("help.faq.q3Content"),
    },
  ];

  return (
    <div className="w-full mx-1">
      <h2 className="text-xl font-semibold mb-4">{t("help.faq.title")}</h2>
      <Accordion selectionMode="multiple">
        {faqItems.map((item) => (
          <AccordionItem key={item.key} title={item.title}>
            <p className="text-gray-600">{item.content}</p>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FaqPage;
