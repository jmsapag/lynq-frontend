# (ADMIN) Gestión de Usuarios

Como **Administrador (ADMIN)** de tu empresa, puedes gestionar los usuarios que tendrán acceso a la plataforma LYNQ, asignarles roles y controlar a qué ubicaciones pueden acceder.

## Acceder a la Gestión de Usuarios

1.  En la barra de navegación lateral, haz clic en **"Gestionar Usuarios"** o **"Administración de Usuarios"**. 2. Verás una tabla con la lista de usuarios de tu empresa. La tabla mostrará información como nombre, correo electrónico, rol y estado (activo/inactivo).

## Crear Nuevos Usuarios

1.  En la página de Gestión de Usuarios, haz clic en **"Crear Usuario"** o **"Invitar Usuario"**.
2.  Se abrirá un modal o formulario.
3.  Ingresa las **direcciones de correo electrónico** de los usuarios que deseas invitar. Puedes añadir varios correos.
4.  Selecciona el **Rol** que tendrán estos nuevos usuarios (generalmente `STANDARD`). No puedes crear otros `ADMIN` ni `LYNQ_TEAM`.
5.  Haz clic en **"Generar Invitaciones"** o "Enviar".
6.  El sistema generará **tokens de registro** únicos.
7.  Se enviará automáticamente un **correo electrónico de invitación** a cada dirección proporcionada, conteniendo el enlace o token para activar su cuenta.
    ## Asignar/Desasignar Usuarios a Ubicaciones

Por defecto, un usuario `STANDARD` podría no tener acceso a ninguna ubicación. Debes concederle permiso explícitamente.

1.  En la tabla de usuarios, busca al usuario que deseas gestionar.
2.  Haz clic en el icono de **"Gestionar Ubicaciones"** o **"Permisos"** asociado a ese usuario. 3. Se abrirá un modal o una sección mostrando la lista de [Ubicaciones](./administracion_empresa_ubicaciones.md) disponibles en tu empresa.
3.  **Marca/Desmarca** las casillas correspondientes a las ubicaciones a las que deseas que este usuario tenga acceso.
4.  Haz clic en **"Guardar Cambios"** (`updateUserLocations`).

El usuario ahora podrá ver los datos de las ubicaciones asignadas en su dashboard y filtros.

## Editar Rol de Usuario

## Activar/Desactivar Usuario

Puedes revocar temporalmente el acceso de un usuario sin eliminarlo.

1.  En la tabla de usuarios, busca al usuario.
2.  Utiliza el interruptor o botón en la columna **"Estado"** o **"Activo"** para cambiar su estado.
3.  Un usuario inactivo no podrá iniciar sesión. Puedes reactivarlo de la misma manera.

## Eliminar Usuario

_¡Precaución!_ Eliminar un usuario revoca permanentemente su acceso.

1.  En la tabla de usuarios, busca al usuario que deseas eliminar.
2.  Haz clic en el icono de **"Eliminar"** (papelera) asociado.
3.  Confirma la eliminación.
