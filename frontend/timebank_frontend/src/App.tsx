import { useState } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router';

//Componentes Globales
import NavBarDesktop from './componentes/navBar/NavBarDesktop'
import NavBarMobile from './componentes/navBar/NavBarMobile'
import MenuCrear from './componentes/navBar/MenuCrear'

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

import './App.css'


function App() {
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

      case 'chat':
        navigate('/chats');
        break;

      default:
        // Las demás rutas se implementarán después.
        break;
    }    
  }

  // 03. IDENTIFICAR LA RUTA ACTUAL
  const location = useLocation();

  const activeTab =
    location.pathname.startsWith('/perfil') ? 'profile' :
    location.pathname.startsWith('/chats') ? 'chat' :
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
          <Route path="/" element={<HomeFeed onDonarHoras={() => navigate('/donar-horas')} onVerMovimientos={() => navigate('/movimientos')}/>} />
          <Route path="/perfil" element={<MiembroProfile onDonarHoras={() => navigate('/donar-horas')} onVerMovimientos={() => navigate('/movimientos')} />} />
          <Route path="/donar-horas" element={<DonarHoras />} />
          <Route path="/movimientos" element={<HistorialMiembro onDonarHoras={() => navigate('/donar-horas')} />} />

          {/*Chats*/}
          <Route path="/chats" element={<ChatList  onAbrirChat={(chatId) => navigate(`/chats/${chatId}`)} />} />
          <Route path="/chats/:chatId" element={<Chat />} />
          
        </Routes>
      </main>

      {/* 06. MENÚ EMERGENTE CREAR */}
      {menuCrearAbierto && (
        <MenuCrear
          onClose={() => setMenuCrearAbierto(false)}
        />
      )}

    </div>
  );
}


export default App
