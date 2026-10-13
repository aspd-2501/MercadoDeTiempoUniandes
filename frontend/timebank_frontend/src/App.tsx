import { useState } from 'react';

import PostAyudaDetail from './ventanas/postAyuda/PostAyudaDetail'
import MiembroProfile from './ventanas/miembro/MiembroProfile'
import HistorialMiembro from './ventanas/miembro/HistorialMiembro'
import DonarHoras from './ventanas/transferencias/DonarHoras'
import ServiciosMiembro from './ventanas/miembro/ServiciosMiembro'
import AniadirServicio from './ventanas/creacionYEdicion/AniadirServicio'
import MiembroDetail from './ventanas/miembro/MiembroDetail'
import NavBarDesktop from './componentes/navBar/NavBarDesktop'
import NavBarMobile from './componentes/navBar/NavBarMobile'
import MenuCrear from './componentes/navBar/MenuCrear';

import './App.css'


function App() {
  // 01. ESTADO DEL MENÚ CREAR
  const [menuCrearAbierto, setMenuCrearAbierto] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F6F6]">

      {/* 02. BARRAS DE NAVEGACIÓN */}
      <NavBarDesktop
        activeTab="profile"
        onCreate={() => setMenuCrearAbierto(true)}
      />

      <NavBarMobile
        activeTab="profile"
        onCreate={() => setMenuCrearAbierto(true)}
      />

      {/* 03. CONTENIDO PRINCIPAL */}
      <main className="min-w-0 min-h-screen pb-24 lg:pb-0 lg:ml-60">
        <MiembroProfile />
      </main>

      {/* 04. MENÚ EMERGENTE CREAR */}
      {menuCrearAbierto && (
        <MenuCrear
          onClose={() => setMenuCrearAbierto(false)}
        />
      )}

    </div>
  );
}


export default App
