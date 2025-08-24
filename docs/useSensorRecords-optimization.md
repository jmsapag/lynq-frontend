# Optimización del Hook useSensorRecords

## Problema Detectado

El hook `useSensorRecords` estaba experimentando **efectos en loop** cuando se cambiaban las fechas hacia atrás, causando:

```
groupBy or aggregationType changed, reprocessing data (múltiples veces)
Checking if data fetch is needed... (múltiples veces)
New range extends beyond fetched range (repetitivo)
```

## Causas del Problema

### 1. **Doble UseEffect Redundante**
```typescript
// ❌ ANTES: Dos efectos separados
useEffect(() => {
  // Efecto 1: Procesar datos cuando cambia groupBy/aggregationType
}, [groupBy, aggregationType, dateRange, rawData, filterData, processData]);

useEffect(() => {
  // Efecto 2: Fetch y procesar datos 
}, [sensorIds, dateRange, groupBy, aggregationType, needToFetch, hourRange]);
```

### 2. **Dependencias Problemáticas**
- `filterData` y `processData` son funciones que pueden cambiar en cada render
- `needToFetch` se actualizaba dentro del efecto y también estaba en las dependencias
- Esto creaba un **dependency loop** infinito

### 3. **Estado Redundante**
- La variable `needToFetch` se calculaba y actualizaba innecesariamente
- Causaba re-renders adicionales sin beneficio

## Solución Implementada

### 1. **Consolidación de Efectos**
```typescript
// ✅ DESPUÉS: Un solo efecto optimizado
useEffect(() => {
  const fetchAndProcessData = async () => {
    // Maneja tanto fetch como procesamiento en un solo lugar
    if (shouldFetch) {
      // Fetch nueva data y procesar
    } else {
      // Solo procesar data existente
    }
  };

  fetchAndProcessData();
}, [sensorIds, dateRange, groupBy, aggregationType, hourRange]);
```

### 2. **Eliminación de Dependencias Problemáticas**
- ❌ Removido: `filterData`, `processData` de las dependencias
- ❌ Removido: `needToFetch` del estado y dependencias  
- ✅ Mantenido: Solo las dependencias esenciales que realmente cambian

### 3. **Manejo Optimizado de SensorIds**
```typescript
// Mejor comparación de arrays y early return
if (prevSensorIds.length > 0 && prevSensorIds.join(',') !== sensorIds.join(',')) {
  setSensorRecordsFormData((prev) => ({
    ...prev,
    fetchedDateRange: null,
    rawData: [],
  }));
  setPrevSensorIds(sensorIds);
  return; // Exit early, let the next effect handle the fetch
}
```

### 4. **Lógica Unificada**
```typescript
if (shouldFetch) {
  console.log("New range extends beyond fetched range");
  // Fetch logic
} else {
  console.log("groupBy or aggregationType changed, reprocessing data");
  // Process existing data
}
```

## Beneficios de la Optimización

### 1. **Eliminación de Loops**
- ✅ Un solo log "Checking if data fetch is needed..." por cambio
- ✅ Un solo log de procesamiento por cambio de configuración
- ✅ No más efectos repetitivos

### 2. **Mejor Performance**
- ✅ Menos re-renders innecesarios
- ✅ Menos cálculos redundantes
- ✅ Fetch más eficiente

### 3. **Código Más Mantenible**
- ✅ Lógica consolidada en un solo lugar
- ✅ Dependencias claras y mínimas
- ✅ Flujo de datos más predecible

### 4. **Debugging Mejorado**
- ✅ Logs más claros y únicos
- ✅ Comportamiento predecible
- ✅ Fácil seguimiento del flujo de datos

## Casos de Uso Verificados

### Scenario 1: Cambio de Fecha Hacia Atrás
```
Usuario: Cambia fecha de "Hoy" a "Ayer"
Antes: 5-6 logs repetitivos, múltiples re-renders
Después: 1 log "Checking if data fetch is needed...", procesamiento único
```

### Scenario 2: Cambio de Agrupación
```
Usuario: Cambia de "daily" a "hourly"
Antes: Doble procesamiento, efectos cruzados
Después: Procesamiento único con log claro "reprocessing data"
```

### Scenario 3: Cambio de Sensores
```
Usuario: Selecciona diferentes sensores
Antes: Loops durante el reset de datos
Después: Reset limpio con early return, un solo ciclo
```

## Monitoreo y Validación

Para verificar que la optimización funciona correctamente, los logs deberían mostrar:

```bash
# ✅ Comportamiento esperado tras la optimización
Checking if data fetch is needed...
[Solo UNA vez por cambio genuino]

groupBy or aggregationType changed, reprocessing data  
[Solo cuando realmente cambian estos parámetros]

New range extends beyond fetched range
[Solo cuando se necesita fetch adicional]
```

Si aparecen logs repetitivos, indica que hay un problema que requiere investigación adicional.

## Archivos Modificados

- `/src/hooks/useSensorRecords.ts` - Hook principal optimizado
- Eliminadas dependencias: `filterData`, `processData`, `needToFetch`
- Consolidados: useEffect duplicados en uno solo
- Mejorado: manejo de cambios en sensorIds

Esta optimización mantiene toda la funcionalidad existente mientras elimina los loops problemáticos y mejora significativamente la performance del hook.
