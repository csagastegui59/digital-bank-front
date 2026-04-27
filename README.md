# Digital Bank Frontend

Digital Bank es una aplicación web de banca digital donde los usuarios pueden:
- Crear cuentas
- Transferir dinero (PEN y USD)
- Gestionar cuentas
- Y los administradores pueden aprobar solicitudes.

## Acceder a la aplicación
Puedes encontrar la versión de la aplicación en el siguiente link: https://digital-bank-front-two.vercel.app/

## Iniciar sesión
Al ingresar a la aplicación, veremos una pantalla como la mostrada en la imagen, podemos ingresar con la cuenta de administrador por defecto o crear una nueva

<img width="1919" height="994" alt="image" src="https://github.com/user-attachments/assets/7e13fbb7-8334-439c-b3b3-a0842c7edd69" />

## Registro
Para crear una nueva cuenta, presionamos el botón "Regístrate" y llenamos el formulario, los nombres van separados por espacios.
Ej. Si me llamo Pedro Enrique, eso va en el campo nombre y mis dos apellidos irían en el campo de apellidos, igualmente separados por un espacio "Gutierrez Ruiz"

## Ingresando a la aplicación
Al ingresar tendremos una vista parecida a la mostrada en la imagen, tendremos las cuentas disponibles en las monedas correspondientes, actualmente solo contamos con soles y dólares, al crearnos una nueva cuenta, por defecto se nos asignará una cuenta en dólares con un saldo de 1,000.00 para poder hacer transferencias y hacer pruebas. Mientras no tengamos la cuenta nueva en soles se nos mostrará un botón de "solicitar cuenta".
Al solicitar una nueva cuenta, se creará un registro pero un administrador debe aprobar la solicitud para comenzar a usarla.
<img width="1919" height="948" alt="image" src="https://github.com/user-attachments/assets/443b016d-1bdb-4d0d-aefa-da67ccb01490" />

## Transferir Saldo
Al ingresar a la opción de transferir saldo se despliega un modal con un formulario que debemos llenar para poder hacer una transferencia, en caso necesitemos una cuenta podemos ver algunas de ejemplo allí mismo para probar o podemos crear cuentas para hacer transferencias entre nuestras cuentas propias. Si necesitas mayor información sobre las cuentas registradas o alguna está bloqueada, también puedes revisar la documentación de nuestra aplicación backend en el siguiente link: https://github.com/csagastegui59/digital-bank.
Al llenar los datos correspondientes para la transferencia presionamos el botón transferir y obtendremos un mensaje confirmando la transferencia.
<img width="1919" height="949" alt="image" src="https://github.com/user-attachments/assets/a946bc92-52de-4cde-848b-12370522aea5" />

## Bloquear cuenta
Al presionar el botón de bloquear cuenta nos desplegará un modal pidiéndonos la confirmación, al confirmar la cuenta automáticamente se bloqueará y no podrá realizar ni recibir transferencias, de todas maneras puedes consultar tus movimientos pero para volver a usarla debes solicitar la reactivación clickeando el botón correspondiente y esperar que un administrador apruebe el desbloqueo.
<img width="1919" height="951" alt="image" src="https://github.com/user-attachments/assets/99f51e47-1ecf-4266-a918-90b67b663687" />

## Gestión administrador
Al ingresar como usario administrador podremos revisar en la barra de navegación la vista de gestión, aquí tendremos distintas opciones, siendo la primera aprobar cuentas, aquí podremos visualizar los datos de las cuentas nuevas que se están creando y aprobarlas, podemos filtrar las cuentas por número de cuenta o id de usuario, ingresando estos datos a la caja de búsqueda y pulsando el botón "buscar"
<img width="1919" height="952" alt="image" src="https://github.com/user-attachments/assets/f5c26765-c783-44ab-92fc-9af94df14754" />

## Historial de Transacciones
Desde esta vista podremos revisar las transacciones realizadas por los usuarios, las secciones básicas se dividen en las dos monedas de la aplicación "USD" y "PEN", esta sección es una tabla paginada y podremos filtrar por usuario, por cuenta, por montos para una revisión más sencilla.
<img width="1919" height="943" alt="image" src="https://github.com/user-attachments/assets/b56513ce-e0f6-4bd7-b8bc-6e39cc63c7f8" />
