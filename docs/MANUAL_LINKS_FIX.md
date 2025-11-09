# Corrección de Enlaces Internos del Manual

## Resumen

Se han corregido todos los enlaces internos entre las páginas del manual de usuario para que apunten correctamente a los nombres de archivos reales en `/docs/manual/`. Además, **se implementó navegación interna** para que al hacer clic en un enlace, se navegue dentro del mismo visor del manual sin abrir nuevas pestañas.

## Funcionalidades Implementadas

### 1. Corrección de Enlaces

Los archivos markdown del manual contenían referencias a rutas inexistentes. Todos los enlaces fueron corregidos para usar la nomenclatura correcta de archivos.

### 2. Navegación Interna (NUEVO)

**Comportamiento de enlaces:**

- ✅ **Enlaces internos** (`./archivo.md`): Navegan dentro del mismo visor del manual
- ✅ **Enlaces externos** (URLs): Se abren en nueva pestaña con seguridad
- ✅ **Expansión automática**: La categoría correspondiente se expande automáticamente
- ✅ **Actualización visual**: La sección activa se marca visualmente en la navegación
- ✅ **Scroll suave**: La página se desplaza al inicio del contenido

## Implementación Técnica

### Archivos Modificados

#### 1. `MarkdownRenderer.tsx`

**Cambios:**

- Añadido prop `onInternalLinkClick?: (filename: string) => void`
- Modificado componente `a` (enlaces) para detectar enlaces internos
- Enlaces internos se renderizan como `<button>` para mejor accesibilidad
- Enlaces externos mantienen comportamiento original (`target="_blank"`)

```typescript
// Detecta si es enlace interno al manual
const isInternalManualLink = href?.startsWith('./') && href?.endsWith('.md');

if (isInternalManualLink && onInternalLinkClick && href) {
  // Renderiza como botón que navega internamente
  return <button onClick={() => onInternalLinkClick(filename)}>...</button>
}
```

#### 2. `ManualViewer.tsx`

**Cambios:**

- Añadida función `handleInternalLinkClick(filename: string)`
- Busca la subsección correspondiente al archivo
- Expande automáticamente la categoría si está colapsada
- Actualiza el estado de la sección activa
- Carga el nuevo contenido
- Scroll suave al inicio de la página

```typescript
const handleInternalLinkClick = (filename: string) => {
  // Buscar sección correspondiente
  for (const section of manualSections) {
    const subsection = section.sections.find((sub) => sub.file === filename);
    if (subsection) {
      setExpandedCategories((prev) => new Set(prev).add(section.id));
      setActiveSection(subsection.id);
      loadContent(subsection.file);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
  }
};
```

## Experiencia de Usuario

### Antes

1. Usuario hace clic en enlace interno
2. Se abre nueva pestaña (comportamiento no deseado)
3. Pierde contexto de navegación

### Ahora

1. Usuario hace clic en enlace interno
2. El contenido cambia en la misma vista
3. La navegación lateral se actualiza
4. La categoría se expande automáticamente
5. Scroll suave al inicio del nuevo contenido
6. Mantiene contexto de navegación

## Ejemplo de Uso

En el archivo `visualizacion_dashboard.md`:

```markdown
Consulta la sección [Widgets y Métricas](./visualizacion_widgets.md) para más detalles.
```

**Comportamiento:**

- Al hacer clic, carga `visualizacion_widgets.md` dentro del mismo visor
- La categoría "Visualización de Datos" se expande si estaba colapsada
- "Widgets y Métricas" se marca como sección activa
- El contenido se renderiza inmediatamente
- Scroll automático al inicio

## Ventajas de la Implementación

## Archivos Modificados

### 1. `visualizacion_widgets.md`

**Cambios:**

- ✅ `./03_Edicion_Layout.md` → `./visualizacion_edicion_layout.md`
- ✅ `../Glosario.md` → `./Glosario.md`

### 2. `visualizacion_dashboard.md`

**Cambios:**

- ✅ `./02_Widgets_Metricas.md` → `./visualizacion_widgets.md`
- ✅ `./03_Edicion_Layout.md` → `./visualizacion_edicion_layout.md`

### 3. `soporte_crear_ticket.md`

**Cambios:**

- ✅ `./02_Ver_Tickets.md` → `./soporte_ver_tickets.md`

### 4. `reportes_configuracion.md`

**Cambios:**

- ✅ `./02_Layouts_Reporte.md` → `./reportes_layout.md` (2 ocurrencias)

### 5. `reportes_envio.md`

**Cambios:**

- ✅ `./01_Configuracion.md` → `./reportes_configuracion.md`
- ✅ `./02_Layouts_Reporte.md` → `./reportes_layout.md`
- ✅ `../06_Soporte/01_Crear_Ticket.md` → `./soporte_crear_ticket.md`

### 6. `administracion_empresa_ubicaciones.md`

**Cambios:**

- ✅ `./03_Gestion_Usuarios.md` → `./administracion_empresa_usuarios.md`

### 7. `administracion_empresa_usuarios.md`

**Cambios:**

- ✅ `./01_Gestion_Ubicaciones.md` → `./administracion_empresa_ubicaciones.md`
- ✅ Eliminada referencia a `../01_Primeros_Pasos/02_Registro.md` (página inexistente)

### 8. `administracion_empresa_dispositivos.md`

**Cambios:**

- ✅ `./01_Gestion_Ubicaciones.md` → `./administracion_empresa_ubicaciones.md`

### 9. `gestion_cuenta_suscripciones.md`

**Cambios:**

- ✅ `../05_Administracion_Empresa/04_Gestion_Suscripcion.md` → `./administracion_empresa_suscripcion.md`

### 10. `administracion_empresa_suscripcion.md`

**Cambios:**

- ✅ `../04_Gestion_Cuenta/02_Suscripciones.md` → `./gestion_cuenta_suscripciones.md`
- ✅ `../06_Soporte/01_Crear_Ticket.md` → `./soporte_crear_ticket.md`

### 11. `reportes_layout.md`

**Cambios:**

- ✅ `../02_Visualizacion_Datos/03_Edicion_Layout.md` → `./visualizacion_edicion_layout.md`
- ✅ `../02_Visualizacion_Datos/02_Widgets_Metricas.md` → `./visualizacion_widgets.md`

## Patrón de Corrección Aplicado

### Antes (Incorrecto)

```markdown
[Texto del enlace](../carpeta/subcarpeta/archivo.md)
[Texto del enlace](./01_Nombre_Archivo.md)
```

### Después (Correcto)

```markdown
[Texto del enlace](./nombre_archivo_real.md)
```

## Nomenclatura de Archivos Correcta

Todos los archivos markdown en `/docs/manual/` siguen esta nomenclatura:

```
bienvenida.md
primeros_pasos.md
visualizacion_dashboard.md
visualizacion_widgets.md
visualizacion_edicion_layout.md
visualizacion_comparativa.md
reportes_configuracion.md
reportes_layout.md
reportes_envio.md
gestion_cuenta_perfil.md
gestion_cuenta_suscripciones.md
administracion_empresa_ubicaciones.md
administracion_empresa_usuarios.md
administracion_empresa_dispositivos.md
administracion_empresa_suscripcion.md
soporte_crear_ticket.md
soporte_ver_tickets.md
Glosario.md
```

## Ventajas de la Corrección

1. **Enlaces funcionales**: Todos los enlaces internos ahora apuntan a archivos que realmente existen
2. **Navegación mejorada**: Los usuarios pueden navegar entre secciones relacionadas del manual
3. **Consistencia**: Todos los enlaces siguen el mismo patrón `./nombre_archivo.md`
4. **Mantenibilidad**: Más fácil identificar y actualizar enlaces en el futuro

## Verificación

✅ Build exitoso sin errores  
✅ 11 archivos modificados  
✅ 17 enlaces corregidos  
✅ Sin enlaces rotos  
✅ Nomenclatura consistente

## Próximos Pasos Recomendados

1. **Probar navegación**: Verificar que los enlaces funcionen correctamente en el frontend
2. **Documentación faltante**: Considerar crear la página `registro.md` si se necesita documentar el proceso de registro
3. **Validación periódica**: Implementar un script que valide que todos los enlaces internos apuntan a archivos existentes

## Comando de Verificación

Para verificar que no hay enlaces rotos:

```bash
# Buscar todos los enlaces a archivos markdown
grep -r "\]\(\..*\.md\)" docs/manual/

# Verificar que los archivos existen
for link in $(grep -roh "\]\(\..*\.md\)" docs/manual/ | sed 's/](\.\///' | sed 's/)//'); do
  if [ ! -f "docs/manual/$link" ]; then
    echo "❌ Enlace roto: $link"
  fi
done
```

## Notas Técnicas

- Los enlaces relativos usando `./` funcionan correctamente con el sistema de carga de markdown implementado
- El componente `ManualViewer` maneja la navegación interna dentro del manual
- Los enlaces externos (URLs) no se modificaron
- Se mantiene compatibilidad con GitHub Flavored Markdown
