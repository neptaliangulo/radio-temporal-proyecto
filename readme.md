# Radio Temporal - Proyecto

## 1. Idea de proyecto

Este proyecto consiste en el desarrollo de una aplicación de música que funciona como una **“radio temporal”** basada en un **mapa mundi interactivo**. El usuario podrá seleccionar un país y un año concreto para escuchar canciones originarias de ese lugar y momento histórico, simulando la experiencia de escuchar la radio local de esa época.

A diferencia de plataformas tradicionales de streaming musical como Spotify o Apple Music, donde el contenido proviene principalmente de discográficas o distribuidoras, esta aplicación funcionará como una **biblioteca musical colaborativa** creada por los propios usuarios.

Los usuarios podrán subir canciones a la plataforma y añadir la información necesaria para clasificarlas correctamente dentro del sistema geográfico y temporal. De esta forma, la comunidad irá construyendo una base de datos musical global que permitirá descubrir música de diferentes culturas y épocas.

Cada canción subida deberá incluir:

- Archivo de audio de la canción
- Nombre de la canción
- Nombre del artista
- Año de publicación
- País de origen
- Imagen de portada

Además, la aplicación incluirá funciones sociales que permitirán a los usuarios interactuar entre sí.

Los usuarios podrán:

- Crear perfiles personales
- Subir canciones
- Dar likes a canciones
- Escribir comentarios en las canciones
- Ver qué canciones han subido otros usuarios

El propósito principal del proyecto es crear una plataforma que permita **descubrir música de diferentes lugares y épocas del mundo**, fomentando la exploración cultural y el descubrimiento musical a través de la comunidad.

El público objetivo incluye:

- Personas interesadas en descubrir música de diferentes culturas
- Usuarios que quieren escuchar música de épocas pasadas
- Amantes de la música que buscan experiencias diferentes a las plataformas tradicionales
- Usuarios que desean compartir música con la comunidad
- Artistas poco conocidos que podran compartir su musica 

---

# 2. Requisitos funcionales

### Gestión de usuarios

- El sistema debe permitir a los usuarios **registrarse en la plataforma**.
- El sistema debe permitir a los usuarios **iniciar sesión y cerrar sesión**.
- Cada usuario debe tener un **perfil personal**.

El perfil de usuario debe mostrar:

- Nombre de usuario
- breve descripcion para presentarse o compartir redes
- Foto de perfil
- Lista de canciones subidas

---

### Subida de canciones

- Los usuarios deben poder **subir canciones a la plataforma**.
- El sistema debe permitir subir un **archivo de audio**.
- El usuario debe introducir la siguiente información al subir una canción:

  - Nombre de la canción
  - Nombre del artista
  - Año de publicación
  - País de origen
  - Imagen de portada

- El sistema debe almacenar la canción y asociarla al usuario que la subió.

---

### Exploración por mapa y época

- La aplicación debe mostrar un **mapa mundi interactivo**.
- El usuario debe poder **seleccionar un país**.
- El usuario debe poder **seleccionar un año**.
- El sistema debe filtrar las canciones según el **país y la época seleccionada** y reproducir canciones que entren esos parametros.

---

### Reproducción de música

- El sistema debe permitir **reproducir canciones** dentro de la aplicación.
- Las canciones deben reproducirse en **modo radio**, pasando automáticamente a la siguiente.
- El usuario debe poder:

  - Pausar la canción
  - Cambiar a la siguiente canción
  - Ver la información de la canción actual.

---

### Sistema de interacción

**Likes**

- Los usuarios deben poder dar **likes** a las canciones.
- Cada canción debe mostrar el **número total de likes recibidos**.

**Comentarios**

- Los usuarios deben poder **añadir comentarios** en las canciones.
- Los comentarios deben mostrarse públicamente para otros usuarios.

---

# 3. Mockup gráfico

![alt text](imagenes-readme/Captura%20de%20pantalla%202026-03-15%20213131.png)

![alt text](imagenes-readme/Captura%20de%20pantalla%202026-03-15%20213147.png)

![alt text](imagenes-readme/Captura%20de%20pantalla%202026-03-15%20213203.png)

![alt text](imagenes-readme/Captura%20de%20pantalla%202026-03-15%20213112.png)

![alt text](imagenes-readme/Captura%20de%20pantalla%202026-03-15%20213104.png)

![alt text](imagenes-readme/Captura%20de%20pantalla%202026-03-15%20213054.png)

# 4. Arquitectura y tecnología

La aplicación seguirá una arquitectura **cliente-servidor**, separando la interfaz del usuario, la lógica del sistema y el almacenamiento de datos.

## Frontend

El frontend será la parte visual de la aplicación con la que interactúan los usuarios.

Tecnologías posibles:

- **React**
- **Vue.js**
- **HTML, CSS y JavaScript**

Funciones principales del frontend:

- Mostrar el mapa interactivo
- Reproducir canciones
- Mostrar perfiles de usuario
- Permitir subir canciones
- Mostrar comentarios y likes

---

## Backend

El backend gestionará la lógica del sistema y la comunicación con la base de datos.

Tecnologías posibles:

- **Node.js**
- **Express**
- **Python (Flask o Django)**

Funciones principales del backend:

- Autenticación de usuarios
- Gestión de subida de canciones
- Gestión de comentarios y likes
- Filtrado de canciones por país y año
- Comunicación con el frontend mediante una **API REST**

---

## Base de datos

La base de datos almacenará toda la información de la aplicación.

Tecnologías posibles:

- **PostgreSQL**
- **MongoDB**

Datos almacenados:

Usuarios

- id
- nombre de usuario
- email
- contraseña
- foto de perfil

Canciones

- id
- título
- artista
- año
- país
- portada
- archivo de audio
- usuario que la subió

Interacciones

- likes
- comentarios
- fecha de publicación

---

## Almacenamiento de archivos

Los archivos de audio y las imágenes de portada pueden almacenarse utilizando:

- **AWS S3**
- **Firebase Storage**
- **Cloudinary**

Esto permitirá guardar archivos multimedia de forma segura y escalable.