# Manual de Usuario - Implementación en Frontend

## Descripción General

Se ha implementado exitosamente la documentación del manual de usuario dentro del frontend de LYNQ, accesible desde la página de Ayuda/Soporte. La implementación mantiene todo el contenido existente de tickets de soporte y añade una nueva pestaña de "Manual de Usuario" con navegación completa.

## Archivos Creados

### 1. Configuración de Secciones del Manual

**Archivo:** `src/config/manual-sections.ts`

Define la estructura jerárquica del manual con todas las secciones y subsecciones:

- Bienvenida (Introducción y Primeros Pasos)
- Visualización de Datos (Dashboard, Widgets, Layout, Comparación)
- Reportes Semanales (Configuración, Layout, Envío)
- Gestión de Cuenta (Perfil, Suscripciones)
- Administración de Empresa (Ubicaciones, Usuarios, Dispositivos, Suscripción)
- Soporte (Crear Ticket, Ver Tickets)
- Glosario (Términos y Métricas)

### 2. Utilidad de Carga de Archivos

**Archivo:** `src/utils/manualLoader.ts`

Utiliza Vite's `import.meta.glob` para cargar dinámicamente todos los archivos markdown desde `/docs/manual/*.md`. Proporciona funciones para:

- Cargar contenido de archivos específicos
- Listar todos los archivos disponibles

### 3. Componente de Renderizado Markdown

**Archivo:** `src/components/help/MarkdownRenderer.tsx`

Renderiza el contenido markdown con estilos consistentes con Hero UI:

- Usa `react-markdown` con plugins de GitHub Flavored Markdown
- Estilos personalizados para todos los elementos HTML (h1-h4, p, ul, ol, code, blockquote, tables, etc.)
- Sanitización de HTML para seguridad
- Diseño responsivo y accesible

### 4. Componente Visor del Manual

**Archivo:** `src/components/help/ManualViewer.tsx`

Componente principal que incluye:

- **Barra lateral de navegación**: Muestra categorías colapsables con subsecciones
- **Área de contenido**: Renderiza el markdown seleccionado
- **Estado activo**: Indica la sección actual
- **Scroll independiente**: Navegación y contenido con scroll separado
- **Expansión/Colapso**: Categorías expandibles para mejor organización

### 5. Página de Ayuda Actualizada

**Archivo:** `src/pages/help.tsx` (modificado)

Ahora incluye dos pestañas:

- **Pestaña "Soporte"**: Mantiene toda la funcionalidad existente de tickets
- **Pestaña "Manual de Usuario"**: Nueva pestaña con el visor del manual

## Traducciones

Se añadieron traducciones completas en español e inglés:

### Español (`src/i18n/es.json`)

```json
"help": {
  "tabs": {
    "support": "Soporte",
    "manual": "Manual de Usuario"
  }
},
"manual": {
  "navigation": { "title": "Navegación" },
  "sections": { ... },
  "errors": { ... }
}
```

### Inglés (`src/i18n/en.json`)

```json
"help": {
  "tabs": {
    "support": "Support",
    "manual": "User Manual"
  }
},
"manual": {
  "navigation": { "title": "Navigation" },
  "sections": { ... },
  "errors": { ... }
}
```

## Dependencias Instaladas

```bash
npm install react-markdown remark-gfm rehype-raw rehype-sanitize
```

- **react-markdown**: Renderizado de markdown en React
- **remark-gfm**: Soporte para GitHub Flavored Markdown (tablas, listas de tareas, etc.)
- **rehype-raw**: Permite HTML crudo en markdown
- **rehype-sanitize**: Sanitiza HTML para seguridad

## Archivos Markdown del Manual

Todos los archivos originales en `/docs/manual/` se mantienen intactos y se cargan dinámicamente:

1. `bienvenida.md` - Introducción a LYNQ
2. `primeros_pasos.md` - Inicio de sesión e interfaz general
3. `visualizacion_dashboard.md` - Dashboard principal
4. `visualizacion_widgets.md` - Widgets y métricas
5. `visualizacion_edicion_layout.md` - Edición de layouts
6. `visualizacion_comparativa.md` - Comparación de datos
7. `reportes_configuracion.md` - Configuración de reportes
8. `reportes_layout.md` - Layout de reportes
9. `reportes_envio.md` - Envío de reportes
10. `gestion_cuenta_perfil.md` - Gestión de perfil
11. `gestion_cuenta_suscripciones.md` - Gestión de suscripciones
12. `administracion_empresa_ubicaciones.md` - Gestión de ubicaciones
13. `administracion_empresa_usuarios.md` - Gestión de usuarios
14. `administracion_empresa_dispositivos.md` - Gestión de dispositivos
15. `administracion_empresa_suscripcion.md` - Suscripción de empresa
16. `soporte_crear_ticket.md` - Crear tickets
17. `soporte_ver_tickets.md` - Ver tickets
18. `Glosario.md` - Términos y métricas

## Características de la Implementación

### Navegación

- ✅ Navegación jerárquica con categorías colapsables
- ✅ Indicador visual de sección activa
- ✅ Scroll independiente en navegación y contenido
- ✅ Responsive design para móviles y escritorio

### Renderizado de Contenido

- ✅ Soporte completo para markdown estándar
- ✅ GitHub Flavored Markdown (tablas, código, listas)
- ✅ Estilos consistentes con Hero UI
- ✅ Sintaxis highlighting para código
- ✅ Links externos con seguridad (`target="_blank"`, `rel="noopener noreferrer"`)

### Integración

- ✅ No altera funcionalidad existente de tickets
- ✅ Sistema de pestañas para separar soporte y documentación
- ✅ Traducciones completas en ES/EN
- ✅ Carga dinámica de contenido
- ✅ Sin pérdida de información del manual original

### Accesibilidad

- ✅ Navegación por teclado
- ✅ Contraste de colores apropiado
- ✅ Estructura semántica HTML
- ✅ Responsive en todos los dispositivos

## Uso

1. **Acceder al Manual**:
   - Navegar a la página de "Ayuda" desde el menú lateral
   - Seleccionar la pestaña "Manual de Usuario"

2. **Navegar por Secciones**:
   - Hacer clic en las categorías para expandir/colapsar
   - Hacer clic en cualquier subsección para ver su contenido
   - La sección activa se resalta visualmente

3. **Leer el Contenido**:
   - El contenido markdown se renderiza con formato completo
   - Usar scroll en el área de contenido para leer documentos largos
   - Los links a otras secciones o externos funcionan correctamente

## Verificación

✅ Build exitoso sin errores  
✅ Sin errores de TypeScript  
✅ Todas las traducciones añadidas  
✅ Todos los archivos markdown cargables  
✅ Navegación funcional  
✅ Renderizado de markdown correcto  
✅ Compatibilidad con Hero UI  
✅ Funcionalidad de tickets no afectada

## Próximos Pasos (Opcional)

1. **Búsqueda**: Añadir función de búsqueda dentro del manual
2. **Favoritos**: Permitir marcar secciones favoritas
3. **Historial**: Mantener historial de secciones visitadas
4. **Impresión**: Optimizar para impresión/PDF
5. **Analytics**: Rastrear qué secciones son más consultadas
6. **Feedback**: Añadir botón "¿Fue útil?" en cada sección

## Notas Técnicas

- Los archivos markdown se cargan en tiempo de build usando Vite's glob import
- El contenido se carga de forma perezosa al seleccionar cada sección
- La sanitización HTML previene XSS pero permite contenido seguro
- El componente es completamente autónomo y reutilizable
