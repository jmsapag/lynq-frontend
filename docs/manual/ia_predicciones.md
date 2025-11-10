# Predicciones de IA (Forecasting)

LYNQ utiliza modelos de IA para generar **predicciones (forecasting)** de tus métricas clave. Esto te permite anticipar el comportamiento futuro del tráfico peatonal y tomar decisiones proactivas sobre staffing, inventario o campañas de marketing.

## ¿Cómo funciona?

El sistema de IA analiza los datos históricos de tus métricas (ej. afluencia por hora) y genera una predicción de cómo se comportarán esas métricas en el futuro cercano (ej. próximas 24 horas).

Estas predicciones se generan automáticamente en segundo plano por el sistema y se almacenan en la base de datos. No necesitas "ejecutar" la predicción manualmente; solo debes visualizarla.

Para hacer las predicciones se utiliza un modelo estadistico llamado SARIMA.

## ¿Dónde ver las Predicciones?

Las predicciones se visualizan directamente en los gráficos de tu dashboard.

1.  Ve a tu [Dashboard Principal](./visualizacion_dashboard.md).
2.  Selecciona un rango de fechas que incluya el día actual o días futuros.
3.  En los gráficos de series temporales (como "Afluencia por Hora"), verás:
    - Una **línea sólida** que representa los datos históricos reales.
    - Una **línea punteada** (o de un color diferente) que se extiende más allá de los datos reales. Esta es la predicción de la IA.

Al pasar el cursor sobre la línea punteada, podrás ver los valores estimados y el período de tiempo correspondiente.
