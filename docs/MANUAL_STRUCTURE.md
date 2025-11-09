# Estructura de Navegación del Manual

## Jerarquía de Secciones

```
📚 Manual de Usuario
│
├── 🎉 Bienvenida
│   ├── Bienvenido a LYNQ (bienvenida.md)
│   └── Primeros Pasos (primeros_pasos.md)
│
├── 📊 Visualización de Datos
│   ├── Dashboard Principal (visualizacion_dashboard.md)
│   ├── Widgets y Métricas (visualizacion_widgets.md)
│   ├── Edición del Layout (visualizacion_edicion_layout.md)
│   └── Comparación (visualizacion_comparativa.md)
│
├── 📄 Reportes Semanales
│   ├── Configuración de Reportes (reportes_configuracion.md)
│   ├── Layout de Reportes (reportes_layout.md)
│   └── Envío de Reportes (reportes_envio.md)
│
├── 👤 Gestión de Cuenta
│   ├── Perfil y Configuración (gestion_cuenta_perfil.md)
│   └── Suscripciones (gestion_cuenta_suscripciones.md)
│
├── 🏢 Administración de Empresa
│   ├── Gestión de Ubicaciones (administracion_empresa_ubicaciones.md)
│   ├── Gestión de Usuarios (administracion_empresa_usuarios.md)
│   ├── Gestión de Dispositivos (administracion_empresa_dispositivos.md)
│   └── Suscripción (administracion_empresa_suscripcion.md)
│
├── 🆘 Soporte
│   ├── Crear Ticket (soporte_crear_ticket.md)
│   └── Ver Tickets (soporte_ver_tickets.md)
│
└── 📖 Glosario
    └── Términos y Métricas (Glosario.md)
```

## Arquitectura de Componentes

````
┌─────────────────────────────────────────────────────────────┐
│                        Help Page                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Tabs Component (Hero UI)                    │  │
│  │  ┌─────────────┬─────────────────────────────────┐   │  │
│  │  │  Soporte    │  Manual de Usuario (NEW)       │   │  │
│  │  └─────────────┴─────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Tab 1: Soporte (Existente)                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ - Link a FAQs                                         │  │
│  │ - Botón "Abrir Ticket de Soporte"                    │  │
│  │ - Lista de Tickets                                    │  │
│  │ - Modal de Creación de Tickets                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Tab 2: Manual de Usuario (NUEVO)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              ManualViewer Component                   │  │
│  │  ┌──────────────┬────────────────────────────────┐   │  │
│  │  │ Navigation   │    Content Area                │   │  │
│  │  │ Sidebar      │                                │   │  │
│  │  │              │  MarkdownRenderer Component    │   │  │
│  │  │ • Bienvenida │  ┌──────────────────────────┐  │   │  │
│  │  │   ├─ Intro   │  │  # Título                │  │   │  │
│  │  │   └─ Pasos   │  │                          │  │   │  │
│  │  │ • Visual...▼ │  │  ## Subtítulo            │  │   │  │
│  │  │   ├─ Dashboard│  │                          │  │   │  │
│  │  │   ├─ Widgets │  │  Contenido markdown...   │  │   │  │
│  │  │   └─ ...     │  │                          │  │   │  │
│  │  │ • Reportes▼  │  │  - Lista                 │  │   │  │
│  │  │ • Cuenta▼    │  │  - Items                 │  │   │  │
│  │  │ • Empresa▼   │  │                          │  │   │  │
│  │  │ • Soporte▼   │  │  ```code```              │  │   │  │
│  │  │ • Glosario▼  │  │                          │  │   │  │
│  │  │              │  └──────────────────────────┘  │   │  │
│  │  │  (Scroll)    │       (Scroll)                 │   │  │
│  │  └──────────────┴────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
````

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│  Usuario hace clic en sección                               │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  ManualViewer.handleSectionClick(subsection)                │
│  - Actualiza activeSection                                  │
│  - Llama loadContent(filename)                              │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  manualLoader.loadManualFile(filename)                      │
│  - Busca en import.meta.glob                                │
│  - Retorna contenido markdown o null                        │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  ManualViewer.setMarkdownContent(content)                   │
│  - Actualiza estado con contenido                           │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  MarkdownRenderer recibe contenido                          │
│  - ReactMarkdown procesa markdown                           │
│  - Aplica componentes personalizados                        │
│  - Renderiza con estilos Hero UI                            │
└─────────────────────────────────────────────────────────────┘
```

## Sistema de Archivos

```
src/
├── pages/
│   └── help.tsx                          ← Página principal con tabs
│
├── components/
│   └── help/
│       ├── CreateTicketModal.tsx         ← Existente
│       ├── ManualViewer.tsx              ← NUEVO: Navegación + contenido
│       └── MarkdownRenderer.tsx          ← NUEVO: Renderizador markdown
│
├── config/
│   ├── manual-sections.ts                ← NUEVO: Estructura del manual
│   └── stripe.ts                         ← Existente
│
├── utils/
│   └── manualLoader.ts                   ← NUEVO: Carga archivos markdown
│
└── i18n/
    ├── es.json                           ← Actualizado con traducciones
    └── en.json                           ← Actualizado con traducciones

docs/
└── manual/
    ├── bienvenida.md
    ├── primeros_pasos.md
    ├── visualizacion_dashboard.md
    ├── visualizacion_widgets.md
    ├── visualizacion_edicion_layout.md
    ├── visualizacion_comparativa.md
    ├── reportes_configuracion.md
    ├── reportes_layout.md
    ├── reportes_envio.md
    ├── gestion_cuenta_perfil.md
    ├── gestion_cuenta_suscripciones.md
    ├── administracion_empresa_ubicaciones.md
    ├── administracion_empresa_usuarios.md
    ├── administracion_empresa_dispositivos.md
    ├── administracion_empresa_suscripcion.md
    ├── soporte_crear_ticket.md
    ├── soporte_ver_tickets.md
    └── Glosario.md
```

## Características Clave

### ✅ Navegación Intuitiva

- Sidebar colapsable con categorías
- Indicador visual de sección activa
- Scroll independiente

### ✅ Renderizado Rico

- Soporte completo de markdown
- Tablas, listas, código, blockquotes
- Links internos y externos
- Estilos consistentes con Hero UI

### ✅ Bilingüe

- Español e inglés
- i18n completo para navegación
- Contenido markdown en español

### ✅ Responsive

- Adaptable a móviles y escritorio
- Sidebar responsive
- Contenido adaptable

### ✅ Integración Limpia

- No afecta funcionalidad existente
- Sistema de tabs para separación clara
- Reutilizable y mantenible
