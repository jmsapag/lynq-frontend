import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, ScrollShadow } from "@heroui/react";
import {
  manualSections,
  ManualSection,
  ManualSubsection,
} from "../../config/manual-sections";
import { loadManualFile } from "../../utils/manualLoader";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ManualViewerProps {
  className?: string;
}

/**
 * ManualViewer component
 * Displays the user manual with navigation sidebar and content area
 */
export const ManualViewer = ({ className = "" }: ManualViewerProps) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["welcome"]),
  );

  // Load initial content (welcome page)
  useEffect(() => {
    if (!activeSection && manualSections.length > 0) {
      const firstSection = manualSections[0].sections[0];
      setActiveSection(firstSection.id);
      loadContent(firstSection.file);
    }
  }, [activeSection]);

  const loadContent = (filename: string) => {
    const content = loadManualFile(filename);
    if (content) {
      setMarkdownContent(content);
    } else {
      setMarkdownContent(
        `# ${t("manual.errors.notFound")}\n\n${t("manual.errors.notFoundDescription")}`,
      );
    }
  };

  const handleInternalLinkClick = (filename: string) => {
    // Find the subsection that matches this filename
    for (const section of manualSections) {
      const subsection = section.sections.find((sub) => sub.file === filename);
      if (subsection) {
        // Expand the category if it's not already expanded
        setExpandedCategories((prev) => new Set(prev).add(section.id));
        // Navigate to the section
        setActiveSection(subsection.id);
        loadContent(subsection.file);
        // Scroll to top of content
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    // If file not found in sections, try to load it anyway
    loadContent(filename);
  };

  const handleSectionClick = (subsection: ManualSubsection) => {
    setActiveSection(subsection.id);
    loadContent(subsection.file);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const renderNavigationItem = (subsection: ManualSubsection) => {
    const isActive = activeSection === subsection.id;

    return (
      <button
        key={subsection.id}
        onClick={() => handleSectionClick(subsection)}
        className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
          isActive
            ? "bg-primary-100 text-primary-700 font-medium"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        {t(subsection.titleKey)}
      </button>
    );
  };

  const renderCategorySection = (section: ManualSection) => {
    const isExpanded = expandedCategories.has(section.id);

    return (
      <div key={section.id} className="mb-2">
        <button
          onClick={() => toggleCategory(section.id)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
        >
          <span>{t(section.titleKey)}</span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        {isExpanded && (
          <div className="ml-2 mt-1 space-y-1">
            {section.sections.map((subsection) =>
              renderNavigationItem(subsection),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col md:flex-row gap-4 h-full ${className}`}>
      {/* Navigation Sidebar */}
      <Card className="md:w-80 flex-shrink-0">
        <CardBody className="p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {t("manual.navigation.title")}
          </h2>
          <ScrollShadow className="max-h-[calc(100vh-250px)]">
            <nav className="space-y-1">
              {manualSections.map((section) => renderCategorySection(section))}
            </nav>
          </ScrollShadow>
        </CardBody>
      </Card>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <ScrollShadow className="max-h-[calc(100vh-200px)]">
          {markdownContent ? (
            <MarkdownRenderer
              content={markdownContent}
              onInternalLinkClick={handleInternalLinkClick}
            />
          ) : (
            <Card>
              <CardBody className="p-8 text-center">
                <p className="text-gray-500">{t("manual.errors.loading")}</p>
              </CardBody>
            </Card>
          )}
        </ScrollShadow>
      </div>
    </div>
  );
};
