# Guía de Mantenimiento - Manual de Usuario

## Cómo Añadir Nuevas Páginas al Manual

### 1. Crear el archivo Markdown

Crear el archivo en `/docs/manual/`:

```bash
cd docs/manual
touch nueva_seccion.md
```

Escribir el contenido en markdown estándar:

```markdown
# Título de la Nueva Sección

Contenido introductorio...

## Subsección 1

Contenido...

## Subsección 2

Más contenido...
```

### 2. Registrar en la configuración

Editar `src/config/manual-sections.ts`:

```typescript
export const manualSections: ManualSection[] = [
  // ... secciones existentes ...
  {
    id: "nueva-categoria",
    titleKey: "manual.sections.nuevaCategoria.title",
    sections: [
      {
        id: "nueva-seccion",
        titleKey: "manual.sections.nuevaCategoria.nuevaSeccion",
        file: "nueva_seccion.md",
      },
    ],
  },
];
```

### 3. Añadir traducciones

En `src/i18n/es.json`:

```json
{
  "manual": {
    "sections": {
      "nuevaCategoria": {
        "title": "Nueva Categoría",
        "nuevaSeccion": "Nueva Sección"
      }
    }
  }
}
```

En `src/i18n/en.json`:

```json
{
  "manual": {
    "sections": {
      "nuevaCategoria": {
        "title": "New Category",
        "nuevaSeccion": "New Section"
      }
    }
  }
}
```

### 4. Probar

```bash
npm run dev
# Navegar a /help
# Seleccionar tab "Manual de Usuario"
# Verificar que aparece la nueva sección
```

## Cómo Modificar Páginas Existentes

### Editar solo el contenido

1. Localizar el archivo en `/docs/manual/`
2. Editar el contenido markdown
3. Los cambios se reflejan automáticamente en el siguiente build

**No es necesario modificar ningún otro archivo.**

### Cambiar el título de una sección

1. Editar las traducciones en `src/i18n/es.json` y `en.json`
2. El título se actualiza automáticamente

## Cómo Reorganizar el Manual

### Cambiar orden de secciones

Editar `src/config/manual-sections.ts` y reordenar los elementos del array:

```typescript
export const manualSections: ManualSection[] = [
  // Mover esta sección arriba o abajo
  {
    id: "glossary",
    titleKey: "manual.sections.glossary.title",
    sections: [
      // ...
    ],
  },
  // ... otras secciones ...
];
```

### Mover subsección a otra categoría

Cortar la subsección de una categoría y pegarla en otra:

```typescript
{
  id: "nueva-categoria",
  titleKey: "manual.sections.nuevaCategoria.title",
  sections: [
    // Mover esta subsección aquí
    {
      id: "seccion-movida",
      titleKey: "manual.sections.nuevaCategoria.seccionMovida",
      file: "archivo.md",
    },
  ],
},
```

## Formato Markdown Soportado

### Títulos

```markdown
# Título Principal (H1)

## Título de Sección (H2)

### Subtítulo (H3)

#### Subtítulo Menor (H4)
```

### Texto

```markdown
Texto normal con **negrita** y _cursiva_.

Párrafo nuevo.
```

### Listas

```markdown
- Item lista desordenada
- Otro item
  - Sub-item anidado

1. Item lista ordenada
2. Segundo item
3. Tercer item
```

### Código

````markdown
Código inline con `código`.

```javascript
// Bloque de código
function ejemplo() {
  return "Hola";
}
```
````

### Enlaces

```markdown
[Texto del enlace](https://ejemplo.com)
[Enlace interno](#seccion)
```

### Blockquotes

```markdown
> Esto es una cita o nota importante.
> Puede tener múltiples líneas.
```

### Tablas

```markdown
| Columna 1 | Columna 2 | Columna 3 |
| --------- | --------- | --------- |
| Dato 1    | Dato 2    | Dato 3    |
| Dato 4    | Dato 5    | Dato 6    |
```

### Líneas Horizontales

```markdown
---
```

### Imágenes

```markdown
![Texto alternativo](ruta/imagen.png)
```

**Nota:** Para imágenes, considerar colocarlas en `src/assets/manual/` y referenciarlas apropiadamente.

## Personalizar Estilos

### Modificar estilos de elementos markdown

Editar `src/components/help/MarkdownRenderer.tsx`:

```typescript
components={{
  h1: ({ children }) => (
    <h1 className="text-4xl font-bold text-primary-600 mb-8">
      {children}
    </h1>
  ),
  // ... otros componentes ...
}}
```

### Añadir nuevos componentes personalizados

```typescript
components={{
  // ... existentes ...
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-lg shadow-md my-4"
    />
  ),
}}
```

## Estructura de Archivos

```
lynq-frontend/
├── docs/
│   └── manual/                    ← Archivos markdown aquí
│       ├── bienvenida.md
│       ├── primeros_pasos.md
│       └── ...
│
├── src/
│   ├── components/help/
│   │   ├── ManualViewer.tsx       ← Componente principal
│   │   └── MarkdownRenderer.tsx   ← Renderizador
│   │
│   ├── config/
│   │   └── manual-sections.ts     ← Configuración de secciones
│   │
│   ├── utils/
│   │   └── manualLoader.ts        ← Cargador de archivos
│   │
│   ├── i18n/
│   │   ├── es.json                ← Traducciones español
│   │   └── en.json                ← Traducciones inglés
│   │
│   └── pages/
│       └── help.tsx               ← Página con tabs
```

## Solución de Problemas Comunes

### Problema: Nueva sección no aparece

**Solución:**

1. Verificar que el archivo existe en `/docs/manual/`
2. Verificar que está registrado en `manual-sections.ts`
3. Verificar que las traducciones existen
4. Hacer rebuild: `npm run build`

### Problema: Markdown no se renderiza correctamente

**Solución:**

1. Verificar sintaxis markdown
2. Probar en un editor markdown externo
3. Verificar caracteres especiales
4. Consultar documentación de react-markdown

### Problema: Estilos no se aplican

**Solución:**

1. Verificar que las clases Tailwind existen
2. Verificar orden de especificidad CSS
3. Consultar `MarkdownRenderer.tsx`
4. Verificar Hero UI theme

### Problema: Imágenes no cargan

**Solución:**

1. Verificar ruta de la imagen
2. Considerar usar rutas relativas desde `public/`
3. Importar imágenes en assets si es necesario
4. Verificar configuración de Vite para assets

## Mejores Prácticas

### Escritura de Contenido

✅ **Hacer:**

- Usar títulos descriptivos
- Mantener párrafos cortos y concisos
- Usar listas para información estructurada
- Añadir ejemplos cuando sea apropiado
- Incluir capturas de pantalla cuando ayude

❌ **Evitar:**

- Títulos muy largos
- Párrafos densos de más de 5 líneas
- Jerga técnica sin explicación
- HTML directo (usar markdown)

### Organización

✅ **Hacer:**

- Agrupar contenido relacionado
- Mantener jerarquía lógica
- Usar nombres de archivo descriptivos
- Mantener consistencia en nomenclatura

❌ **Evitar:**

- Mezclar temas no relacionados
- Anidación profunda (más de 3 niveles)
- Nombres de archivo ambiguos

### Mantenimiento

✅ **Hacer:**

- Revisar y actualizar regularmente
- Mantener capturas de pantalla actualizadas
- Documentar cambios significativos
- Probar enlaces periódicamente

❌ **Evitar:**

- Contenido obsoleto
- Enlaces rotos
- Capturas de versiones antiguas

## Checklist para Nuevas Secciones

- [ ] Archivo markdown creado en `/docs/manual/`
- [ ] Contenido escrito y revisado
- [ ] Registrado en `manual-sections.ts`
- [ ] Traducciones en `es.json`
- [ ] Traducciones en `en.json`
- [ ] Build exitoso (`npm run build`)
- [ ] Probado en navegador
- [ ] Navegación funciona correctamente
- [ ] Estilos se ven bien
- [ ] Responsive en móvil
- [ ] Sin errores en consola

## Contacto para Soporte Técnico

Si necesitas ayuda con la implementación técnica del manual:

1. Revisar esta documentación
2. Consultar `/docs/MANUAL_DOCUMENTATION_IMPLEMENTATION.md`
3. Consultar `/docs/MANUAL_STRUCTURE.md`
4. Revisar el código en `src/components/help/`
