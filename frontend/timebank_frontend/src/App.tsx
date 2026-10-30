import { useState } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router';

//Componentes Globales
import NavBarDesktop from './componentes/navBar/NavBarDesktop'
import NavBarMobile from './componentes/navBar/NavBarMobile'
import MenuCrear, { type AccionMenuCrear } from './componentes/navBar/MenuCrear';

//Ventanas
import HomeFeed from './ventanas/HomeFeed';
import PostAyudaDetail from './ventanas/postAyuda/PostAyudaDetail'
import MiembroProfile from './ventanas/miembro/MiembroProfile'
import HistorialMiembro from './ventanas/miembro/HistorialMiembro'
import DonarHoras from './ventanas/transferencias/DonarHoras'
import ServiciosMiembro from './ventanas/miembro/ServiciosMiembro'
import AniadirServicio from './ventanas/creacionYEdicion/AniadirServicio'
import MiembroDetail from './ventanas/miembro/MiembroDetail'
import Homefeed from './ventanas/HomeFeed'
import ServiciosMiembroDetail from './ventanas/miembro/ServiciosMiembro'
import ChatList from './ventanas/chats/ChatList'
import Chat from './ventanas/chats/Chat';
import Explorar from './ventanas/Explorar'
import Calendario from './ventanas/Calendario';
import CrearPostAyuda from './ventanas/postAyuda/CrearPostAyuda';
import AcuerdoDetail from './ventanas/acuerdos/AcuerdoDetail';
import Actividad from './ventanas/Actividad';

//Datos de prueba
import {
  ACUERDOS_PARA_DETALLE_DEMO,
  ID_ACUERDO_POR_POST_DEMO,
} from './mocks/acuerdosPost.mocks';

import './App.css'

function App() {
  // 00. TEMPORAL: CARGAR ACUERDOS DE PRUEBA EN EL LOCAL STORAGE
  async function participarEnPostDemo(postId: string) {
  const acuerdoId = ID_ACUERDO_POR_POST_DEMO[postId];

  if (!acuerdoId || !ACUERDOS_PARA_DETALLE_DEMO[acuerdoId]) {
    throw new Error('No existe un acuerdo de prueba para este post');
  }

  return {
    acuerdoId,
    esDemostracion: true,
  };
}


  // 01. ESTADO DEL MENÚ CREAR
  const [menuCrearAbierto, setMenuCrearAbierto] = useState(false);

  // 02. NAVEGACIÓN ENTRE VENTANAS
  const navigate = useNavigate();

  function cambiarPestana(tab: string) {
    switch (tab) {
      case 'home':
        navigate('/');
        break;

      case 'profile':
        navigate('/perfil');
        break;

      /*case 'chat':
        navigate('/chats');
        break;*/

      case 'explore':
        navigate('/explorar');
        break;

      case 'calendar':
        navigate('/calendario');
        break;

      case 'activity':
        navigate('/actividad');
        break;

      default:
        // Las demás rutas se implementarán después.
        break;
    }    
  }



  // 02.1 MANEJAR ACCIONES DEL MENÚ CREAR
  function manejarAccionCrear(accion: AccionMenuCrear) {
    switch (accion) {
      case 'pedir-ayuda':
        navigate('/crear-post-ayuda/pide');
        break;

      case 'ofrecer-ayuda':
        navigate('/crear-post-ayuda/ofrece');
        break;

      case 'gestionar-servicios':
        // Pendiente: conectar con la ventana de servicios.
        break;

      case 'compartir-experiencia':
        // Pendiente: implementar esta ventana.
        break;
    }
  }

  // 03. IDENTIFICAR LA RUTA ACTUAL
  const location = useLocation();

  const activeTab =
    location.pathname.startsWith('/perfil') ? 'profile' :
    /*location.pathname.startsWith('/chats') ? 'chat' :*/
    location.pathname === '/explorar' ? 'explore' :
    location.pathname.startsWith('/calendario') ? 'calendar' :
    location.pathname === '/actividad' ? 'activity' :
    'home';

    return (
      <div className="min-h-screen bg-[#F6F6F6]">

      {/* 04. BARRAS DE NAVEGACIÓN */}
      <NavBarDesktop
        activeTab={activeTab}
        onNavigate={cambiarPestana}
        onCreate={() => setMenuCrearAbierto(true)}
      />

      <NavBarMobile
        activeTab={activeTab}
        onNavigate={cambiarPestana}
        onCreate={() => setMenuCrearAbierto(true)}
      />

      {/* 05. CONTENIDO PRINCIPAL */}
      <main className="min-h-screen min-w-0 pb-24 lg:ml-60 lg:pb-0">
        <Routes>

          {/*HomeFeed*/}
          <Route path="/" element={<HomeFeed onDonarHoras={() => navigate('/donar-horas')} onVerMovimientos={() => navigate('/movimientos')} onVerAutorPost={(miembroId) => navigate(`/${miembroId}`)} onVerDetallePost={(postId) => navigate(`/posts/${postId}`)}/>} />
          
          {/*Explorar*/}
          <Route path="explorar" element={<Explorar onVerDetallePost={(postId) => navigate(`/posts/${postId}`)} onVerPerfil={(miembroId) => navigate(`/${miembroId}`)} />} />

          {/*Actividad*/}
          <Route path="/actividad" element={<Actividad onVerAcuerdo={(acuerdoId) => navigate(`/acuerdos/${acuerdoId}`)} onExplorar={() => navigate('/explorar')} />} />

          {/*Info Miembros*/}
          <Route path="/perfil" element={<MiembroProfile onDonarHoras={() => navigate('/donar-horas')} onVerMovimientos={() => navigate('/movimientos')} />} />
          <Route path="/:miembroId" element={<MiembroDetail />} />

          {/*Posts*/}
          <Route path="/posts/:postId" element={<PostAyudaDetail onBack={() => navigate("/")} onIrChat={(chatId) => navigate(`/chats/${chatId}`)} onVerPerfil={(miembroId) => navigate(`/${miembroId}`)} onVolverInicio={() => navigate('/')} onParticipar={participarEnPostDemo} onVerAcuerdo={(acuerdoId) => navigate(`/acuerdos/${acuerdoId}`)} />} />
          {/* CREAR PUBLICACIONES DE AYUDA */}

          <Route path="/crear-post-ayuda/pide" element={<CrearPostAyuda tipo="pide" onVolver={() => navigate(-1)} onVolverInicio={() => navigate('/')}/>}/>

          <Route path="/crear-post-ayuda/ofrece" element={ <CrearPostAyuda tipo="ofrece" onVolver={() => navigate(-1)} onVolverInicio={() => navigate('/')} />} />

          {/* ACUERDOS DE SERVICIO */}
          <Route path="/acuerdos/:acuerdoId" element={ <AcuerdoDetail acuerdos={ACUERDOS_PARA_DETALLE_DEMO} onVolver={() => navigate(-1)} onVerPost={(postId) => navigate(`/posts/${postId}`)} onIrChat={(chatId) => navigate(`/chats/${chatId}`)} /> } />        
         
          {/*Transacciones de Horas*/}
          <Route path="/donar-horas" element={<DonarHoras />} />
          <Route path="/movimientos" element={<HistorialMiembro onDonarHoras={() => navigate('/donar-horas')} />} />

          {/*Chats*/}
          <Route path="/chats" element={<ChatList  onAbrirChat={(chatId) => navigate(`/chats/${chatId}`)} />} />
          <Route path="/chats/:chatId" element={<Chat />} />

          {/*Calendario*/}
          <Route path="/calendario" element={<Calendario onVerAcuerdo={(acuerdoId) => navigate(`/acuerdos/${acuerdoId}`)} />} />
          
        </Routes>
      </main>

      {/* 06. MENÚ EMERGENTE CREAR */}
      {menuCrearAbierto && (
        <MenuCrear
          onClose={() => setMenuCrearAbierto(false)}
          onSelect={manejarAccionCrear}
        />
      )}

    </div>
  );
}


export default App
