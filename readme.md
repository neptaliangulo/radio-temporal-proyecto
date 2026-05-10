# Radio Temporal — Proyecto Final DAW

Aplicación web tipo "radio temporal" basada en un **mapa mundi interactivo**: el usuario selecciona un país y una década para escuchar canciones originarias de ese lugar y momento, simulando la experiencia de la radio local de la época. La biblioteca es **colaborativa** — todas las canciones las suben los propios usuarios.

---

## 1. Idea de proyecto

A diferencia de plataformas tradicionales de streaming como Spotify o Apple Music, donde el contenido proviene de discográficas, esta aplicación funciona como una **biblioteca musical colaborativa** construida por la comunidad.

Los usuarios pueden subir canciones y clasificarlas geográfica y temporalmente. Así se construye una base de datos musical global que permite descubrir música de diferentes culturas y épocas haciendo clic en un mapa.

Cada canción subida incluye:

- Archivo de audio (MP3, WAV…)
- Título y artista
- Año de publicación
- País de origen (código ISO-2)
- Imagen de portada (opcional)

La aplicación incluye funciones sociales:

- Perfiles personales editables (avatar + bio)
- Subida de canciones con barra de progreso real
- Likes a canciones
- Comentarios con respuestas anidadas y likes (ordenados por popularidad)
- Seguir / dejar de seguir usuarios
- Feed personalizado de usuarios seguidos
- Lista de canciones que me gustan
- Perfiles públicos visitables

---

## 2. Stack tecnológico

### Backend
- **Node.js + Express**
- **MongoDB Atlas** + Mongoose (base de datos en la nube)
- **JWT** para autenticación (tokens de 7 días)
- **bcryptjs** para hashing de contraseñas
- **Cloudinary** + multer-storage-cloudinary (audio, portadas y avatares)
- **helmet**, **cors**, **express-rate-limit**, **morgan** (seguridad y logging)

### Frontend
- **React 18** + **React Router 6**
- **Vite** como bundler y dev server
- **Leaflet** + GeoJSON público para el mapa mundi interactivo
- CSS propio sin frameworks
- i18n propio (español / inglés)

### Almacenamiento multimedia
- Todos los archivos (audio + imágenes) van a **Cloudinary**. El servidor no guarda nada localmente, lo que hace que el hosting funcione exactamente igual que en local.

---

## 3. Estructura del proyecto

```
radio-temporal-proyecto/
├── .gitignore
├── readme.md
├── backend/
│   ├── app.js               (servidor Express, conexión MongoDB, rutas)
│   ├── package.json
│   ├── nixpacks.toml        (config deploy Railway)
│   ├── .env.example
│   ├── middleware/
│   │   └── auth.js          (auth + optionalAuth JWT)
│   ├── models/
│   │   ├── User.js
│   │   ├── Song.js
│   │   └── Comment.js       (con parentId para replies y likes)
│   └── routes/
│       ├── authRoutes.js
│       ├── songRoutes.js    (canciones, likes, comentarios, replies)
│       ├── userRoutes.js    (perfil, follow, liked, avatar)
│       └── reportRoutes.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── nixpacks.toml        (config deploy Railway)
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── styles.css
        ├── api.js           (cliente fetch + XHR con progreso)
        ├── i18n.js          (es / en)
        ├── countries.js     (mapa código ISO → nombre)
        ├── context/
        │   ├── AuthContext.jsx
        │   ├── PlayerContext.jsx  (cola, shuffle, loop, volumen)
        │   └── ToastContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── MiniPlayer.jsx
        │   ├── FullPlayer.jsx   (player + comentarios con replies)
        │   ├── WorldMap.jsx     (Leaflet, bounds, estilos por país)
        │   ├── SongList.jsx
        │   ├── SongMenu.jsx
        │   ├── EditSongModal.jsx
        │   └── icons.jsx
        └── pages/
            ├── Home.jsx         (mapa + selector de década + panel canciones)
            ├── Login.jsx
            ├── Register.jsx
            ├── Upload.jsx       (drag & drop + progreso XHR)
            ├── Profile.jsx      (perfil propio, editar bio/avatar, borrar canciones)
            ├── PublicProfile.jsx
            ├── Settings.jsx     (idioma, autoplay, loop)
            ├── Search.jsx       (buscar canciones y usuarios)
            ├── LikedSongs.jsx
            ├── Feed.jsx
            ├── Song.jsx
            └── NotFound.jsx
```

---

## 4. Funcionalidades implementadas

### Mapa interactivo
- Mapa mundi con Leaflet renderizado en pantalla completa
- Países con música subida aparecen resaltados en verde oscuro
- Click en un país → carga sus canciones agrupadas por década
- Selector de década con flechas (← 1990s →), saltos de 10 en 10
- Bounds fijos: no se puede arrastrar fuera del mapa
- Buscador global arriba a la derecha con dropdown en tiempo real
- Panel deslizable desde abajo con las canciones del país seleccionado

### Gestión de usuarios
- Registro con validación en cliente y servidor
- Login con JWT (7 días), persistido en localStorage
- Perfil personal con avatar, bio, estadísticas (canciones / likes)
- Editar bio y foto de perfil (sheet deslizable)
- Perfiles públicos en `/u/:id`
- Sistema follow / unfollow

### Subida de canciones
- Drag & drop o selector de archivo para audio y portada
- Validación de campos obligatorios en cliente y servidor
- Límite de 30 MB por archivo
- Barra de progreso real (XHR `upload.onprogress`)
- Watchdog: si la subida no avanza en 30s, aborta con mensaje claro
- El audio y la portada se guardan en Cloudinary (accesibles desde cualquier dispositivo)

### Reproductor
- Mini player persistente en la parte inferior
- Player completo con portada, metadatos, barra de progreso clicable
- Play / Pausa / Anterior / Siguiente
- **Botón anterior**: si llevas más de 2 segundos → reinicia la canción; si menos → va a la anterior
- Modo **shuffle** (aleatorio) y **loop** (bucle)
- Control de volumen con slider vertical (click) y silenciar (doble click)
- Autoplay y loop configurables en ajustes
- `likedByMe` y `likesCount` sincronizados con el backend en tiempo real

### Comentarios
- Comentarios en el player completo, ordenados por número de likes (más popular arriba)
- **Likes en comentarios** con toggle en tiempo real
- **Respuestas anidadas** (un nivel): botón "Responder" abre input inline con `@usuario`
- Mostrar / ocultar respuestas
- Eliminar comentario propio
- Denunciar comentarios de otros usuarios

### Social
- Feed personalizado (`/feed`) con canciones de usuarios seguidos
- Página "Me gusta" (`/liked`) con todas tus canciones likeadas
- Búsqueda global de canciones y usuarios en `/search`
- Enlace al perfil del autor desde el player y desde los comentarios

---

## 5. Diagramas UML

### 5.1 Diagrama de clases

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String username
        +String email
        +String password
        +String bio
        +String avatar
        +ObjectId[] followers
        +ObjectId[] following
        +Date createdAt
        +Date updatedAt
    }

    class Song {
        +ObjectId _id
        +String title
        +String artist
        +Number year
        +String country
        +String audioUrl
        +String coverUrl
        +ObjectId uploadedBy
        +ObjectId[] likes
        +Date createdAt
        +Date updatedAt
    }

    class Comment {
        +ObjectId _id
        +ObjectId song
        +ObjectId user
        +String text
        +ObjectId[] likes
        +ObjectId parentId
        +String replyTo
        +Date createdAt
        +Date updatedAt
    }

    class Report {
        +ObjectId _id
        +String type
        +ObjectId targetId
        +String reason
        +ObjectId reportedBy
        +String status
        +Date createdAt
        +Date updatedAt
    }

    User "1" --> "0..*" Song : sube
    User "0..*" --> "0..*" User : sigue
    User "0..*" --> "0..*" Song : da like
    Song "1" --> "0..*" Comment : tiene
    User "1" --> "0..*" Comment : escribe
    User "0..*" --> "0..*" Comment : da like
    Comment "0..1" --> "0..*" Comment : parentId (reply)
    User "1" --> "0..*" Report : reportedBy
```

### 5.2 Diagrama de secuencia — Autenticación (Login)

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant Backend
    participant MongoDB

    Usuario->>Frontend: Introduce email y contraseña
    Frontend->>Backend: POST /api/auth/login { email, password }
    Backend->>MongoDB: User.findOne({ email })
    MongoDB-->>Backend: Documento User (con password hash)
    Backend->>Backend: bcrypt.compare(password, hash)
    alt Credenciales correctas
        Backend->>Backend: jwt.sign({ id }, SECRET, 7d)
        Backend-->>Frontend: 200 { token, user }
        Frontend->>Frontend: Guarda token en localStorage
        Frontend-->>Usuario: Redirige a Home
    else Credenciales incorrectas
        Backend-->>Frontend: 400 { message: "Credenciales incorrectas" }
        Frontend-->>Usuario: Muestra mensaje de error
    end
```

### 5.3 Diagrama de secuencia — Subida de canción

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant Backend
    participant Cloudinary
    participant MongoDB

    Usuario->>Frontend: Selecciona audio + portada + metadatos
    Frontend->>Frontend: Valida campos obligatorios
    Frontend->>Backend: POST /api/songs (multipart/form-data) + Bearer token
    Backend->>Backend: auth middleware — verifica JWT
    Backend->>Cloudinary: Sube audio (multer-storage-cloudinary)
    Cloudinary-->>Backend: audioUrl
    Backend->>Cloudinary: Sube portada (si existe)
    Cloudinary-->>Backend: coverUrl
    Backend->>MongoDB: Song.create({ title, artist, year, country, audioUrl, coverUrl, uploadedBy })
    MongoDB-->>Backend: Documento Song creado
    Backend-->>Frontend: 201 { song }
    Frontend-->>Usuario: Toast "Canción subida" + redirige
```

---

## 6. Diagrama Entidad-Relación (ER)

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String username
        String email
        String password
        String bio
        String avatar
        Date createdAt
        Date updatedAt
    }

    SONG {
        ObjectId _id PK
        String title
        String artist
        Number year
        String country
        String audioUrl
        String coverUrl
        ObjectId uploadedBy FK
        Date createdAt
        Date updatedAt
    }

    COMMENT {
        ObjectId _id PK
        ObjectId song FK
        ObjectId user FK
        String text
        ObjectId parentId FK
        String replyTo
        Date createdAt
        Date updatedAt
    }

    REPORT {
        ObjectId _id PK
        String type
        ObjectId targetId
        String reason
        String status
        ObjectId reportedBy FK
        Date createdAt
        Date updatedAt
    }

    USER_FOLLOWERS {
        ObjectId userId FK
        ObjectId followerId FK
    }

    SONG_LIKES {
        ObjectId songId FK
        ObjectId userId FK
    }

    COMMENT_LIKES {
        ObjectId commentId FK
        ObjectId userId FK
    }

    USER ||--o{ SONG : "sube"
    USER ||--o{ COMMENT : "escribe"
    USER ||--o{ REPORT : "reporta"
    SONG ||--o{ COMMENT : "tiene"
    COMMENT ||--o{ COMMENT : "reply a (parentId)"
    USER ||--o{ USER_FOLLOWERS : "sigue / es seguido"
    SONG ||--o{ SONG_LIKES : "recibe likes"
    USER ||--o{ SONG_LIKES : "da like"
    COMMENT ||--o{ COMMENT_LIKES : "recibe likes"
    USER ||--o{ COMMENT_LIKES : "da like"
```

---

## 7. Instalación y ejecución en local

### Requisitos
- Node.js 18+
- Cuenta en MongoDB Atlas (tier gratuito suficiente)
- Cuenta en Cloudinary (tier gratuito suficiente)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd radio-temporal-proyecto

# 2. Backend
cd backend
cp .env.example .env
# Edita .env con tus credenciales (ver sección 8)
npm install
npm run dev
# → Servidor en http://localhost:3001

# 3. Frontend (en otra terminal)
cd frontend
npm install
npm run dev
# → App en http://localhost:5173
# El proxy de Vite redirige /api → localhost:3001 automáticamente
```

---

## 8. Variables de entorno (`backend/.env`)

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/radio-temporal

JWT_SECRET=una_cadena_aleatoria_larga_y_segura

CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

> ⚠️ **Nunca subas `.env` al repositorio.** El `.gitignore` ya lo excluye. Si alguna credencial se filtró, rótala inmediatamente en Cloudinary y MongoDB Atlas.

---

## 9. Deploy en Railway

El proyecto está preparado para desplegarse en [Railway](https://railway.app) como dos servicios independientes.

### Backend
- Root directory: `backend`
- Variables de entorno: las mismas que el `.env` local más `FRONTEND_URL` con la URL del frontend en Railway

### Frontend
- Root directory: `frontend`
- Variable de entorno: `VITE_API_URL=https://tu-backend.up.railway.app/api`

Consulta el paso a paso completo en la guía de deploy incluida en el repositorio.

---

## 10. Endpoints principales de la API

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | No | Crear cuenta (devuelve token) |
| POST | `/api/auth/login` | No | Iniciar sesión |
| GET | `/api/songs` | Opcional | Listar canciones (filtros: `country`, `decade`, `q`, `sort`) |
| POST | `/api/songs` | Sí | Subir canción (multipart) |
| GET | `/api/songs/feed` | Sí | Canciones de usuarios seguidos |
| GET | `/api/songs/:id` | Opcional | Detalle de canción |
| PUT | `/api/songs/:id` | Sí | Editar canción propia |
| POST | `/api/songs/:id/like` | Sí | Toggle like |
| GET | `/api/songs/:id/comments` | No | Listar comentarios (con replies y likes) |
| POST | `/api/songs/:id/comments` | Sí | Crear comentario o reply (`parentId`) |
| POST | `/api/songs/:id/comments/:cid/like` | Sí | Toggle like en comentario |
| DELETE | `/api/songs/:id/comments/:cid` | Sí | Borrar comentario propio |
| GET | `/api/users/me` | Sí | Mi perfil + mis canciones |
| PUT | `/api/users/me` | Sí | Actualizar bio y avatar |
| GET | `/api/users/me/liked` | Sí | Mis canciones con like |
| DELETE | `/api/users/me/songs/:id` | Sí | Borrar canción propia |
| GET | `/api/users?q=` | No | Buscar usuarios |
| GET | `/api/users/:id` | No | Perfil público |
| POST | `/api/users/:id/follow` | Sí | Toggle follow |
| GET | `/api/health` | No | Healthcheck |

### Formato de datos intercambiados

**Registro / Login — respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "664f1a2b3c4d5e6f7a8b9c0d",
    "username": "johndoe",
    "avatar": "https://res.cloudinary.com/..."
  }
}
```

**Canción — respuesta:**
```json
{
  "_id": "664f1a2b3c4d5e6f7a8b9c0e",
  "title": "La Bamba",
  "artist": "Ritchie Valens",
  "year": 1958,
  "country": "MX",
  "audioUrl": "https://res.cloudinary.com/.../audio.mp3",
  "coverUrl": "https://res.cloudinary.com/.../cover.jpg",
  "uploadedBy": { "_id": "...", "username": "johndoe", "avatar": "..." },
  "likes": ["664f...", "664f..."],
  "likesCount": 2,
  "likedByMe": true,
  "createdAt": "2026-05-01T10:00:00.000Z"
}
```

**Comentario — respuesta:**
```json
{
  "_id": "664f1a2b3c4d5e6f7a8b9c0f",
  "song": "664f1a2b3c4d5e6f7a8b9c0e",
  "user": { "_id": "...", "username": "johndoe", "avatar": "..." },
  "text": "Qué temazo",
  "likes": [],
  "likedByMe": false,
  "parentId": null,
  "replyTo": "",
  "replies": [],
  "createdAt": "2026-05-01T11:00:00.000Z"
}
```

---

## 11. Dependencias

### Backend
| Paquete | Versión | Uso |
|---|---|---|
| express | ^4.18.2 | Framework HTTP |
| mongoose | ^7.6.0 | ODM para MongoDB |
| jsonwebtoken | ^9.0.2 | Autenticación JWT |
| bcryptjs | ^2.4.3 | Hash de contraseñas |
| cloudinary | ^1.41.0 | Almacenamiento multimedia |
| multer | ^1.4.5-lts.1 | Procesamiento multipart |
| multer-storage-cloudinary | ^4.0.0 | Integración multer + Cloudinary |
| cors | ^2.8.5 | Control de acceso cross-origin |
| helmet | ^7.1.0 | Cabeceras de seguridad HTTP |
| express-rate-limit | ^7.1.5 | Limitador de peticiones |
| morgan | ^1.10.0 | Logger de peticiones HTTP |
| dotenv | ^16.3.1 | Variables de entorno |

### Frontend
| Paquete | Versión | Uso |
|---|---|---|
| react | ^18.3.1 | Librería UI |
| react-dom | ^18.3.1 | Renderizado en el DOM |
| react-router-dom | ^6.26.0 | Enrutamiento SPA |
| leaflet | ^1.9.4 | Mapa mundi interactivo |
| vite | ^5.4.0 | Bundler y dev server |
| @vitejs/plugin-react | ^4.3.1 | Plugin React para Vite |

---

## 12. Capturas de pantalla

### Mapa principal
![Mapa principal](imagenes-readme/Captura%20de%20pantalla%202026-05-10%20191344.png)

### País seleccionado con canciones agrupadas por década
![País seleccionado](imagenes-readme/Captura%20de%20pantalla%202026-05-10%20191519.png)

### Player completo con comentarios y respuestas
![Player completo](imagenes-readme/Captura%20de%20pantalla%202026-05-10%20191449.png)

### Subida de canción
![Subida de canción](imagenes-readme/Captura%20de%20pantalla%202026-05-10%20191408.png)

### Perfil de usuario
![Perfil de usuario](imagenes-readme/Captura%20de%20pantalla%202026-05-10%20191418.png)

### Buscador
![Buscador](imagenes-readme/Captura%20de%20pantalla%202026-05-10%20191354.png)

### Ajustes
![Ajustes](imagenes-readme/Captura%20de%20pantalla%202026-05-10%20191428.png)

### Login
![Login](imagenes-readme/Captura%20de%20pantalla%202026-05-10%20191540.png)
