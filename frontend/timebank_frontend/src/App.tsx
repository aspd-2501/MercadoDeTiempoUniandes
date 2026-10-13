import PostAyudaDetail from './ventanas/postAyuda/PostAyudaDetail'
import MiembroProfile from './ventanas/miembro/MiembroProfile'
import HistorialMiembro from './ventanas/miembro/HistorialMiembro'
import DonarHoras from './ventanas/transferencias/DonarHoras'
import ServiciosMiembro from './ventanas/miembro/ServiciosMiembro'
import AniadirServicio from './ventanas/creacionYEdicion/AniadirServicio'
import MiembroDetail from './ventanas/miembro/MiembroDetail'
import NavBarDesktop from './componentes/navBar/NavBarDesktop'
import NavBarMobile from './componentes/navBar/NavBarMobile'

import './App.css'

function App() {
  const mostrarNavegacion = true;

  return (
    <div className="min-h-screen bg-[#F6F6F6]">

      {/* 01. NAVEGACIÓN GLOBAL */}
      {mostrarNavegacion && (
        <>
          <NavBarDesktop activeTab="profile" />
          <NavBarMobile activeTab="profile" />
        </>
      )}

      {/* 02. CONTENIDO PRINCIPAL */}
      <main
        className={
          mostrarNavegacion
            ? 'min-h-screen min-w-0 pb-24 lg:pb-0 lg:ml-60'
            : 'min-h-screen min-w-0'
        }
      >
        <MiembroProfile />
      </main>

    </div>
  );
}


export default App
