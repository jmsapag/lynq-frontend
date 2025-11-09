/**
 * Manual sections structure
 * Each section represents a category with subsections
 */

export interface ManualSection {
  id: string;
  titleKey: string; // i18n key
  sections: ManualSubsection[];
}

export interface ManualSubsection {
  id: string;
  titleKey: string; // i18n key
  file: string; // filename in docs/manual
  icon?: string;
}

export const manualSections: ManualSection[] = [
  {
    id: "welcome",
    titleKey: "manual.sections.welcome.title",
    sections: [
      {
        id: "welcome-intro",
        titleKey: "manual.sections.welcome.intro",
        file: "bienvenida.md",
      },
      {
        id: "getting-started",
        titleKey: "manual.sections.welcome.gettingStarted",
        file: "primeros_pasos.md",
      },
    ],
  },
  {
    id: "visualization",
    titleKey: "manual.sections.visualization.title",
    sections: [
      {
        id: "dashboard",
        titleKey: "manual.sections.visualization.dashboard",
        file: "visualizacion_dashboard.md",
      },
      {
        id: "widgets",
        titleKey: "manual.sections.visualization.widgets",
        file: "visualizacion_widgets.md",
      },
      {
        id: "layout-editing",
        titleKey: "manual.sections.visualization.layoutEditing",
        file: "visualizacion_edicion_layout.md",
      },
      {
        id: "comparison",
        titleKey: "manual.sections.visualization.comparison",
        file: "visualizacion_comparativa.md",
      },
    ],
  },
  {
    id: "reports",
    titleKey: "manual.sections.reports.title",
    sections: [
      {
        id: "reports-config",
        titleKey: "manual.sections.reports.configuration",
        file: "reportes_configuracion.md",
      },
      {
        id: "reports-layout",
        titleKey: "manual.sections.reports.layout",
        file: "reportes_layout.md",
      },
      {
        id: "reports-sending",
        titleKey: "manual.sections.reports.sending",
        file: "reportes_envio.md",
      },
    ],
  },
  {
    id: "account-management",
    titleKey: "manual.sections.accountManagement.title",
    sections: [
      {
        id: "account-profile",
        titleKey: "manual.sections.accountManagement.profile",
        file: "gestion_cuenta_perfil.md",
      },
      {
        id: "account-subscriptions",
        titleKey: "manual.sections.accountManagement.subscriptions",
        file: "gestion_cuenta_suscripciones.md",
      },
    ],
  },
  {
    id: "company-admin",
    titleKey: "manual.sections.companyAdmin.title",
    sections: [
      {
        id: "admin-locations",
        titleKey: "manual.sections.companyAdmin.locations",
        file: "administracion_empresa_ubicaciones.md",
      },
      {
        id: "admin-users",
        titleKey: "manual.sections.companyAdmin.users",
        file: "administracion_empresa_usuarios.md",
      },
      {
        id: "admin-devices",
        titleKey: "manual.sections.companyAdmin.devices",
        file: "administracion_empresa_dispositivos.md",
      },
      {
        id: "admin-subscription",
        titleKey: "manual.sections.companyAdmin.subscription",
        file: "administracion_empresa_suscripcion.md",
      },
    ],
  },
  {
    id: "ai",
    titleKey: "manual.sections.ai.title",
    sections: [
      {
        id: "ai-assistant",
        titleKey: "manual.sections.ai.assistant",
        file: "ia_asistente.md",
      },
      {
        id: "ai-summary",
        titleKey: "manual.sections.ai.summary",
        file: "ia_resumen.md",
      },
      {
        id: "ai-predictions",
        titleKey: "manual.sections.ai.predictions",
        file: "ia_predicciones.md",
      },
    ],
  },
  {
    id: "support",
    titleKey: "manual.sections.support.title",
    sections: [
      {
        id: "support-create-ticket",
        titleKey: "manual.sections.support.createTicket",
        file: "soporte_crear_ticket.md",
      },
      {
        id: "support-view-tickets",
        titleKey: "manual.sections.support.viewTickets",
        file: "soporte_ver_tickets.md",
      },
    ],
  },
  {
    id: "glossary",
    titleKey: "manual.sections.glossary.title",
    sections: [
      {
        id: "glossary-terms",
        titleKey: "manual.sections.glossary.terms",
        file: "Glosario.md",
      },
    ],
  },
];
