// Sistema de traducciones simple — devuelve string segun idioma actual
const dict = {
  es: {
    'nav.home':     'Inicio',
    'nav.search':   'Buscar',
    'nav.upload':   'Subir',
    'nav.profile':  'Perfil',
    'nav.settings': 'Ajustes',
    'nav.feed':     'Feed',
    'nav.liked':    'Me gusta',

    'home.click_country':   'Haz clic en un pais',
    'home.no_songs':        'Sin canciones',
    'home.tab.country':     'Por pais',
    'home.tab.recent':      'Recientes',
    'home.tab.top':         'Mas populares',
    'home.tab.random':      'Aleatorio',
    'home.play_all':        'Reproducir todo',
    'home.empty_country':   'Selecciona un pais en el mapa',
    'home.search_placeholder': 'Buscar cancion o artista...',

    'auth.login':   'Iniciar sesion',
    'auth.register':'Crear cuenta',
    'auth.email':   'Email',
    'auth.password':'Contrasena',
    'auth.username':'Nombre de usuario',
    'auth.no_account':   '¿No tienes cuenta?',
    'auth.have_account': '¿Ya tienes cuenta?',
    'auth.fill_all':     'Rellena todos los campos',

    'upload.title':    'Subir cancion',
    'upload.subtitle': 'Comparte musica con la comunidad',
    'upload.audio':    'Archivo de audio',
    'upload.cover':    'Imagen de portada',
    'upload.song':     'Nombre de la cancion',
    'upload.artist':   'Artista',
    'upload.year':     'Ano',
    'upload.country':  'Pais de origen',
    'upload.publish':  'Publicar cancion',
    'upload.uploading':'Subiendo...',
    'upload.success':  '¡Cancion publicada!',

    'profile.songs':   'Canciones',
    'profile.likes':   'Me gusta',
    'profile.followers':'Seguidores',
    'profile.published':'Canciones publicadas',
    'profile.empty':   'Aun no has subido canciones',
    'profile.empty_other': 'Este usuario aun no ha subido canciones',
    'profile.edit':    'Editar perfil',
    'profile.bio':     'Biografia',
    'profile.save':    'Guardar cambios',
    'profile.saved':   'Perfil actualizado',
    'profile.follow':  'Seguir',
    'profile.following':'Siguiendo',
    'profile.logout':  'Cerrar sesion',

    'settings.title':       'Ajustes',
    'settings.subtitle':    'Personaliza tu experiencia',
    'settings.lang':        'Idioma',
    'settings.lang_desc':   'Selecciona el idioma de la aplicacion.',
    'settings.playback':    'Reproduccion',
    'settings.autoplay':    'Reproduccion automatica',
    'settings.loop':        'Modo radio (loop)',
    'settings.account':     'Cuenta',
    'settings.about':       'Acerca de',
    'settings.about_desc':  'Una biblioteca musical colaborativa y global. Explora musica de cualquier pais y epoca, subida por la comunidad.',
    'settings.connected':   'Conectado',
    'settings.login':       'Iniciar sesion',
    'settings.logout':      'Cerrar sesion',

    'search.title':       'Buscar',
    'search.placeholder': 'Buscar canciones, artistas o usuarios...',
    'search.songs':       'Canciones',
    'search.users':       'Usuarios',
    'search.empty':       'Escribe algo para buscar',
    'search.no_results':  'Sin resultados',

    'liked.title':        'Canciones que me gustan',
    'liked.empty':        'Aun no has dado like a ninguna cancion',

    'feed.title':         'Tu feed',
    'feed.subtitle':      'Lo nuevo de los usuarios que sigues',
    'feed.empty':         'Sigue a otros usuarios para ver sus canciones aqui',

    'comments.title':     'Comentarios',
    'comments.placeholder':'Escribe un comentario...',
    'comments.empty':     'Sin comentarios aun',
    'comments.login_required': 'Inicia sesion para comentar',

    'common.cancel':      'Cancelar',
    'common.delete':      'Eliminar',
    'common.confirm':     '¿Estas seguro?',
    'common.error':       'Error',
    'common.loading':     'Cargando...'
  },
  en: {
    'nav.home':     'Home',
    'nav.search':   'Search',
    'nav.upload':   'Upload',
    'nav.profile':  'Profile',
    'nav.settings': 'Settings',
    'nav.feed':     'Feed',
    'nav.liked':    'Liked',

    'home.click_country':   'Click on a country',
    'home.no_songs':        'No songs',
    'home.tab.country':     'By country',
    'home.tab.recent':      'Recent',
    'home.tab.top':         'Top',
    'home.tab.random':      'Random',
    'home.play_all':        'Play all',
    'home.empty_country':   'Select a country on the map',
    'home.search_placeholder':'Search song or artist...',

    'auth.login':   'Log in',
    'auth.register':'Create account',
    'auth.email':   'Email',
    'auth.password':'Password',
    'auth.username':'Username',
    'auth.no_account':   "Don't have an account?",
    'auth.have_account': 'Already have an account?',
    'auth.fill_all':     'Fill in all fields',

    'upload.title':    'Upload song',
    'upload.subtitle': 'Share music with the community',
    'upload.audio':    'Audio file',
    'upload.cover':    'Cover image',
    'upload.song':     'Song name',
    'upload.artist':   'Artist',
    'upload.year':     'Year',
    'upload.country':  'Country of origin',
    'upload.publish':  'Publish song',
    'upload.uploading':'Uploading...',
    'upload.success':  'Song published!',

    'profile.songs':   'Songs',
    'profile.likes':   'Likes',
    'profile.followers':'Followers',
    'profile.published':'Published songs',
    'profile.empty':   "You haven't uploaded any songs yet",
    'profile.empty_other':"This user hasn't uploaded any songs yet",
    'profile.edit':    'Edit profile',
    'profile.bio':     'Bio',
    'profile.save':    'Save changes',
    'profile.saved':   'Profile updated',
    'profile.follow':  'Follow',
    'profile.following':'Following',
    'profile.logout':  'Log out',

    'settings.title':       'Settings',
    'settings.subtitle':    'Customize your experience',
    'settings.lang':        'Language',
    'settings.lang_desc':   'Select the app language.',
    'settings.playback':    'Playback',
    'settings.autoplay':    'Autoplay',
    'settings.loop':        'Radio mode (loop)',
    'settings.account':     'Account',
    'settings.about':       'About',
    'settings.about_desc':  'A collaborative and global music library. Explore music from any country and era, uploaded by the community.',
    'settings.connected':   'Connected',
    'settings.login':       'Log in',
    'settings.logout':      'Log out',

    'search.title':       'Search',
    'search.placeholder': 'Search songs, artists or users...',
    'search.songs':       'Songs',
    'search.users':       'Users',
    'search.empty':       'Type something to search',
    'search.no_results':  'No results',

    'liked.title':        'Liked songs',
    'liked.empty':        "You haven't liked any songs yet",

    'feed.title':         'Your feed',
    'feed.subtitle':      'New from the users you follow',
    'feed.empty':         'Follow other users to see their songs here',

    'comments.title':     'Comments',
    'comments.placeholder':'Write a comment...',
    'comments.empty':     'No comments yet',
    'comments.login_required':'Log in to comment',

    'common.cancel':      'Cancel',
    'common.delete':      'Delete',
    'common.confirm':     'Are you sure?',
    'common.error':       'Error',
    'common.loading':     'Loading...'
  }
};

let currentLang = localStorage.getItem('rt_lang') || 'es';
const subscribers = new Set();

export function getLang() { return currentLang; }
export function setLang(l) {
  if (!dict[l]) return;
  currentLang = l;
  localStorage.setItem('rt_lang', l);
  subscribers.forEach(fn => fn(l));
}
export function t(key) {
  return dict[currentLang]?.[key] ?? dict.es[key] ?? key;
}
export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

// Hook React para forzar re-render en cambio de idioma
import { useEffect, useState } from 'react';
export function useT() {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick(x => x + 1)), []);
  return t;
}
