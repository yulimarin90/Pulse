Bitácora de Desarrollo - Proyecto Clón de X

Fecha: 19/10/2026 
- Herramienta y Modelo: Gemini (Google)
- Mensaje del Usuario: ¿cómo estructuro los tipos en TypeScript para que el modelo de usuarios y tweets funcione bien con los datos quemados sin complicarme mucho con interfaces anidadas?
- Resumen de la Respuesta: Se propuso definir interfaces claras para User, Tweet y TweetWithAuthor, separando la relación de autor en una función auxiliar simulada (withAuthor) para mantener el tipado limpio y modular.
- Archivos Creados o Modificados: src/types/index.ts, src/services/mockApi.ts

Fecha: 19/10/2026 
- Herramienta y Modelo: Gemini (Google)
- Mensaje del Usuario: ¿Cómo puedo organizar el Header y la navegación común en React Router para que no tenga que repetirlo en cada página de la SPA?
- Resumen de la Respuesta: Se sugirió crear un componente de Layout compartido o un componente principal que envuelva las rutas comunes, manteniendo el encabezado, los contadores y los enlaces de navegación fijos en la parte superior.
- Archivos Creados o Modificados: src/components/Navbar.jsx, src/App.jsx

Fecha: 20/10/2026
- Herramienta y Modelo: Gemini (Google)
- Mensaje del Usuario: Me sale un error raro al importar la página de Seguidores: 'does not provide an export named Followers'. ¿A qué se debe?
- Resumen de la Respuesta: Se explicó la diferencia entre exportaciones por defecto (export default) y exportaciones nombradas (export const), indicando cómo ajustar la importación en el router para evitar discrepancias.
- Archivos Creados o Modificados: src/routes/BaseRouter.tsx, src/pages/Followers.tsx

Fecha: 20/10/2026 
- Herramienta y Modelo: Gemini (Google)
- Mensaje del Usuario: ¿Cuál es la mejor forma de simular el login con un usuario por defecto en el Context sin que falle si actualizo la página?
- Resumen de la Respuesta: Se revisó la implementación de AuthContext utilizando useState y funciones auxiliares de autenticación mockeadas sobre los datos de prueba para gestionar la sesión activa de forma centralizada.
- Archivos Creados o Modificados: src/context/AuthContext.tsx, src/services/mockApi.ts

Fecha: 21/10/2026 
- Herramienta y Modelo: Gemini (Google)
- Mensaje del Usuario: ¿Cómo implemento la función paginateNest para cortar los arreglos de tweets y usuarios a máximo 10 por página sin romper el estado de los botones de siguiente y anterior?
- Resumen de la Respuesta: Se diseñó una función utilitaria de paginación basada en índices de arreglos (slice) que calcula las porciones de datos según la página actual y el límite fijo establecido.
- Archivos Creados o Modificados: src/utils/paginateNest.js, src/pages/Feed.tsx

Fecha: 21/10/2026 
- Herramienta y Modelo: Gemini (Google)
- Mensaje del Usuario: Necesito validar que los nombres de usuario y correos no se repitan al registrarse usando los datos simulados. ¿Cómo lo estructuro?
- Resumen de la Respuesta: Se añadió lógica de validación previa en el servicio de registro mock para verificar la existencia del usuario antes de hacer el push al arreglo de prueba.
- Archivos Creados o Modificados: src/services/mockApi.ts, src/pages/Register.tsx

Fecha: 23/10/2026 
- Herramienta y Modelo: Gemini (Google)
- Mensaje del Usuario: La aplicación se ve totalmente plana sin estilos. ¿Cómo armo un CSS base rápido con variables que imite el diseño minimalista de X?
- Resumen de la Respuesta: Se estructuró una hoja de estilos global con variables de color corporativo, tipografía nativa del sistema, bordes sutiles y diseño de tarjetas adaptado al flujo de una red social.
- Archivos Creados o Modificados: src/index.css

Fecha: 23/10/2026 
- Herramienta y Modelo: Gemini (Google)
- Mensaje del Usuario: ¿Cómo le doy formato específico al componente ChirpCard para que cumpla con el orden de autor, @usuario, fecha y cuerpo del mensaje?
- Resumen de la Respuesta: Se diseñó la estructura JSX del componente de tarjeta de tweet aplicando clases CSS orientadas a replicar la cabecera, la tipografía secundaria y el espaciado del mensaje de forma limpia.
- Archivos Creados o Modificados: src/components/ChirpCard.tsx, src/pages/Feed.tsx

Fecha: 27/10/2026 - 5:00 PM
- Herramienta y Modelo: 