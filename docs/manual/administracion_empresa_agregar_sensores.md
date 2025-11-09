# (ADMIN) Agregar Nuevos Sensores

La incorporación de nuevos sensores físicos (dispositivos de conteo) a tu cuenta de LYNQ para monitorear nuevas áreas o ubicaciones es un proceso que requiere la intervención del equipo técnico de LYNQ.

Tras un análisis del código de la plataforma, se confirma que los usuarios con rol `ADMIN` **no pueden** registrar (dar de alta) nuevos sensores directamente desde la interfaz. Este es un proceso que debe realizar el equipo de `LYNQ_TEAM` para asegurar la correcta configuración e ingesta de datos.

## Proceso para Solicitar un Nuevo Sensor

Si has instalado un nuevo dispositivo físico y necesitas que reporte datos a LYNQ, sigue estos pasos:

1.  **Navega a la pantalla de Dispositivos** En la barra lateral, selecciona la página de Dispositivos.
2.  **Proporciona la Información del Sensor:** Para que el equipo de LYNQ pueda configurar el dispositivo, necesitarás proveer la siguiente información:
    - **Ubicacion del sensor :** Indica a qué ubicación (previamente creada por ti en la sección [Gestión de Ubicaciones](./administracion_empresa_ubicaciones.md)) pertenece este sensor.
    - **Proveedor del sensor (`type`:** La marca del dispositivo (ej. `FOOTFALLCAM`, `XOVIS`, `HELLA`).
    - **Número de serie:** El identificador único del dispositivo físico (número de serie).
3.  **Configuración Interna:** El equipo de `LYNQ_TEAM` registrará el dispositivo en el sistema y lo asociará a tu ubicación.
4.  **Verificación:** Una vez que el equipo de LYNQ te confirme la alta, podrás:
    - Ver los datos del nuevo sensor reflejados en los dashboards cuando filtres por la ubicación correspondiente.

Ante cualquier duda, puedes comunicarte con [Soporte](./soporte_crear_ticket.md) y recibirás la ayuda necesaria para configurar el sensor nuevo.
