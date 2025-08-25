# Nuevas Métricas del Dashboard

## Descripción

Se han implementado tres nuevas métricas para el dashboard de Lynq:

1. **Clientes que Retornan** - Total de clientes que han regresado al establecimiento
2. **Tiempo Promedio en Local** - Tiempo promedio que los clientes permanecen en el establecimiento (en minutos)
3. **Afluencia** - Porcentaje de entradas respecto al tráfico exterior (Entradas/Tráfico exterior × 100)

## Formato de Datos

Las nuevas APIs de sensor data ahora incluyen los siguientes campos adicionales **opcionales**:

```typescript
export type SensorDataPoint = {
  timestamp: string;
  total_count_in: number;
  total_count_out: number;
  outsideTraffic?: number;      // NUEVO - OPCIONAL (FootfallCam)
  avgVisitDuration?: number;    // NUEVO - OPCIONAL (FootfallCam)
  returningCustomer?: number;   // NUEVO - OPCIONAL (FootfallCam)
};
```

⚠️ **Importante**: Las métricas `outsideTraffic`, `avgVisitDuration`, y `returningCustomer` son **opcionales** y solo están disponibles cuando el sensor FootfallCam proporciona datos de analíticas avanzadas. Los componentes manejan automáticamente la ausencia de estos datos.

## Manejo de Datos Opcionales

### Lógica de Fallback

Cuando las métricas opcionales no están disponibles:

1. **Clientes que Retornan**: Muestra "N/A" si no hay datos de `returningCustomer`
2. **Tiempo Promedio en Local**: Muestra "N/A" si no hay datos de `avgVisitDuration` 
3. **Afluencia**: Muestra "N/A" si no hay datos de `outsideTraffic`
4. **Gráficos**: Muestran mensaje "Datos no disponibles" y usan colores grises
5. **Estado Visual**: Los componentes cambian automáticamente su apariencia cuando no hay datos

### Cálculo de Métricas

- **Valores por Defecto**: `?? 0` para evitar errores de cálculo
- **Filtrado de Datos**: Solo se consideran valores `> 0` para promedios
- **Validación**: Se verifica la existencia de datos antes de mostrar gráficos
- **Agregación**: El sistema de agregación maneja correctamente valores `undefined` o `null`

## Tipos Actualizados

El tipo `TransformedSensorData` ha sido extendido para incluir las nuevas métricas:

```typescript
export type TransformedSensorData = {
  timestamps: string[];
  in: number[];
  out: number[];
  returningCustomers: number[];   // NUEVO
  avgVisitDuration: number[];     // NUEVO
  outsideTraffic: number[];       // NUEVO
  affluence: number[];            // NUEVO (calculado)
};
```

## Componentes Disponibles

### Tarjetas de Métricas

- `ReturningCustomersCard` - Tarjeta para clientes que retornan
- `AvgVisitDurationCard` - Tarjeta para tiempo promedio en local
- `AffluenceCard` - Tarjeta para afluencia
- `NewMetricsCards` - Componente que agrupa las tres tarjetas

### Gráficos

- `ReturningCustomersChart` - Gráfico de barras para clientes que retornan
- `AvgVisitDurationChart` - Gráfico de líneas para tiempo promedio
- `AffluenceChart` - Gráfico de líneas para afluencia

### Tarjetas de Gráficos

- `ReturningCustomersChartCard` - Gráfico con wrapper ChartCard
- `AvgVisitDurationChartCard` - Gráfico con wrapper ChartCard
- `AffluenceChartCard` - Gráfico con wrapper ChartCard

### Componentes Draggables

Todos los componentes anteriores tienen versiones draggables para el sistema drag & drop:

- `DraggableReturningCustomersCard`
- `DraggableAvgVisitDurationCard`
- `DraggableAffluenceCard`
- `DraggableReturningCustomersChartCard`
- `DraggableAvgVisitDurationChartCard`
- `DraggableAffluenceChartCard`

Y versiones small-card para la lista de componentes disponibles:

- `DraggableReturningCustomersSmallCard`
- `DraggableAvgVisitDurationSmallCard`
- `DraggableAffluenceSmallCard`
- `DraggableReturningCustomersChartSmallCard`
- `DraggableAvgVisitDurationChartSmallCard`
- `DraggableAffluenceChartSmallCard`

## Uso Básico

### Importar Componentes

```typescript
import {
  NewMetricsCards,
  ReturningCustomersChartCard,
  AvgVisitDurationChartCard,
  AffluenceChartCard,
} from './components/dashboard/new-metrics';
```

### Usar en el Dashboard

```tsx
// Usar el hook useSensorRecords actualizado
const { data, loading, error } = useSensorRecords(
  sensorRecordsFormData,
  setSensorRecordsFormData
);

// Las nuevas métricas ya están incluidas en el data
return (
  <div>
    {/* Tarjetas de métricas */}
    <NewMetricsCards
      data={data}
      dateRange={dateRange}
    />
    
    {/* Gráficos */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ReturningCustomersChartCard
        data={data}
        groupBy={groupBy}
        dateRange={dateRange}
      />
      <AvgVisitDurationChartCard
        data={data}
        groupBy={groupBy}
        dateRange={dateRange}
      />
      <AffluenceChartCard
        data={data}
        groupBy={groupBy}
        dateRange={dateRange}
      />
    </div>
  </div>
);
```

### Integración con Drag & Drop

```tsx
import {
  DraggableReturningCustomersSmallCard,
  DraggableAvgVisitDurationSmallCard,
  DraggableAffluenceSmallCard,
} from './components/dashboard/new-metrics';

// En la lista de componentes disponibles
const availableItems = [
  // ... otros elementos
  <DraggableReturningCustomersSmallCard />,
  <DraggableAvgVisitDurationSmallCard />,
  <DraggableAffluenceSmallCard />,
];
```

## Procesamiento de Datos

### Hook useSensorRecords

El hook `useSensorRecords` ha sido actualizado para procesar automáticamente las nuevas métricas:

1. **Agregación de Datos**: Las nuevas métricas se agregan correctamente según el tipo de agregación seleccionado
2. **Filtrado**: Los datos se filtran por rango de fecha y horas
3. **Transformación**: Los datos se transforman al formato `TransformedSensorData` con las nuevas métricas
4. **Cálculo de Afluencia**: La afluencia se calcula automáticamente como `(entradas/tráfico_exterior) × 100`

### Lógica de Cálculo

- **Clientes que Retornan**: Suma directa del campo `returningCustomer`
- **Tiempo Promedio en Local**: Promedio ponderado del campo `avgVisitDuration`
- **Afluencia**: `(total_count_in / outsideTraffic) × 100` cuando `outsideTraffic > 0`

## Traducciones

Se han agregado traducciones en inglés y español para todas las nuevas métricas:

### Inglés (en.json)
```json
{
  "dashboard": {
    "metrics": {
      "returningCustomers": "Returning Customers",
      "avgVisitDuration": "Average Visit Duration",
      "affluence": "Affluence"
    },
    "charts": {
      "returningCustomers": {
        "title": "Returning Customers",
        "description": "Evolution of customers returning to the establishment"
      }
    }
  }
}
```

### Español (es.json)
```json
{
  "dashboard": {
    "metrics": {
      "returningCustomers": "Clientes que Retornan",
      "avgVisitDuration": "Tiempo Promedio en Local",
      "affluence": "Afluencia"
    },
    "charts": {
      "returningCustomers": {
        "title": "Clientes que Retornan",
        "description": "Evolución de clientes que regresan al establecimiento"
      }
    }
  }
}
```

## Exportación

Todas las métricas soportan exportación en múltiples formatos:

- **PNG**: Imágenes de alta calidad
- **PDF**: Documentos para reportes
- **CSV**: Datos tabulares para análisis

## Ejemplo de Demo

Puedes ver un ejemplo completo en el archivo `new-metrics-demo.stories.tsx` que incluye:

- Todas las métricas en un dashboard completo
- Datos de ejemplo
- Diferentes agrupaciones temporales
- Documentación interactiva

## Archivos Modificados

1. **Tipos**:
   - `src/types/sensorDataResponse.ts` - Tipos actualizados

2. **Hooks**:
   - `src/hooks/sensor-data/useTransformData.ts` - Transformación de datos
   - `src/hooks/sensor-data/group-data/aggregate-time-series-service.ts` - Agregación

3. **Componentes Nuevos**:
   - `src/components/dashboard/charts/returning-customers-chart.tsx`
   - `src/components/dashboard/charts/avg-visit-duration-chart.tsx`
   - `src/components/dashboard/charts/affluence-chart.tsx`
   - `src/components/dashboard/charts/*-card.tsx` (tarjetas individuales)
   - `src/components/dashboard/new-metrics/draggable-new-metrics.tsx`

4. **Traducciones**:
   - `src/i18n/en.json` - Traducciones en inglés
   - `src/i18n/es.json` - Traducciones en español

## Compatibilidad

- ✅ Sistema de drag & drop existente
- ✅ Filtros de fecha y sensores
- ✅ Agrupación temporal (5min, 15min, hora, día, etc.)
- ✅ Tipos de agregación (suma, promedio, min, max)
- ✅ Exportación de datos
- ✅ Traducciones multiidioma
- ✅ Responsive design
