import { useState } from 'react';
import { Route, Routes, Outlet, useNavigate, useLocation } from 'react-router';

// Componentes globales
import NavBarDesktop from './componentes/navBar/NavBarDesktop';
import NavBarMobile from './componentes/navBar/NavBarMobile';
import MenuCrear, { type AccionMenuCrear } from './componentes/navBar/MenuCrear';

// Ventanas
import HomeFeed from './ventanas/HomeFeed';
import PostAyudaDetail from './ventanas/postAyuda/PostAyudaDetail';
import MiembroProfile from './ventanas/miembro/MiembroProfile';
import HistorialMiembro from './ventanas/miembro/HistorialMiembro';
import DonarHoras from './ventanas/transferencias/DonarHoras';
import MiembroDetail from './ventanas/miembro/MiembroDetail';
import ChatList from './ventanas/chats/ChatList';
import Chat from './ventanas/chats/Chat';
import Explorar from './ventanas/Explorar';
import Calendario from './ventanas/Calendario';
import CrearPostAyuda from './ventanas/postAyuda/CrearPostAyuda';
import AcuerdoDetail from './ventanas/acuerdos/AcuerdoDetail';
import Actividad from './ventanas/Actividad';

// Autenticación y registro
import RutaProtegida from './rutas/RutaProtegida';
import { useMiembroSesion } from './contextos/MiembroSesionContext';
import Login from './ventanas/LoginYRegistro/Login';
import Onboarding from './ventanas/LoginYRegistro/Onboarding';
import { registrarCuenta } from './api/identidad.api';

// Datos de prueba (se conservan mientras se conecta la participación real)
import {
  ACUERDOS_PARA_DETALLE_DEMO,
  ID_ACUERDO_POR_POST_DEMO,
} from './mocks/acuerdosPost.mocks';

import './App.css';

/**
 * Interfaz compartida por todas las rutas privadas.
 * Solo se monta después de que RutaProtegida valida la sesión.
 */
function LayoutPrivado() {
  const [menuCrearAbierto, setMenuCrearAbierto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function cambiarPestana(tab: string) {
    switch (tab) {
      case 'home':
        navigate('/');
        break;
      case 'profile':
        navigate('/perfil');
        break;
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

  function manejarAccionCrear(accion: AccionMenuCrear) {
    setMenuCrearAbierto(false);

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

  const activeTab =
    location.pathname.startsWith('/perfil') ? 'profile' :
    location.pathname === '/explorar' ? 'explore' :
    location.pathname.startsWith('/calendario') ? 'calendar' :
    location.pathname === '/actividad' ? 'activity' :
    'home';

  return (
    <>
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

      {menuCrearAbierto && (
        <MenuCrear
          onClose={() => setMenuCrearAbierto(false)}
          onSelect={manejarAccionCrear}
        />
      )}

      <main className="min-h-screen min-w-0 pb-24 lg:ml-60 lg:pb-0">
        <Outlet />
      </main>
    </>
  );
}

function App() {
  const navigate = useNavigate();
  const { iniciarSesion, establecerAutenticacion } = useMiembroSesion();

  // TEMPORAL: participación con acuerdos de demostración.
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

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Routes>
        {/* Rutas públicas: no incluyen las barras de navegación */}
        <Route
          path="/login"
          element={
            <Login
              onContinuar={async (credenciales) => {
                const respuesta = await iniciarSesion(credenciales);

                if (!respuesta.perfil) {
                  return 'La cuenta está activa, pero todavía no tiene perfil. No vuelvas a crear el usuario. Se necesita un flujo para completar el perfil existente.';
                }

                navigate('/');
              }}
              onCrearCuenta={() => navigate('/onboarding')}
            />
          }
        />

        <Route
          path="/onboarding"
          element={
            <Onboarding
              onFinalizar={async (datos) => {
                const resultado = await registrarCuenta(datos);
                establecerAutenticacion(resultado.autenticacion);
                navigate('/');
              }}
            />
          }
        />

        {/* Primero se verifica la sesión; después se muestra el layout privado */}
        <Route element={<RutaProtegida />}>
          <Route element={<LayoutPrivado />}>
            {/* Home */}
            <Route
              path="/"
              element={
                <HomeFeed
                  onDonarHoras={() => navigate('/donar-horas')}
                  onVerMovimientos={() => navigate('/movimientos')}
                  onVerAutorPost={(miembroId) => navigate(`/${miembroId}`)}
                  onVerDetallePost={(postId) => navigate(`/posts/${postId}`)}
                />
              }
            />

            {/* Explorar */}
            <Route
              path="/explorar"
              element={
                <Explorar
                  onVerDetallePost={(postId) => navigate(`/posts/${postId}`)}
                  onVerPerfil={(miembroId) => navigate(`/${miembroId}`)}
                />
              }
            />

            {/* Actividad */}
            <Route
              path="/actividad"
              element={
                <Actividad
                  onVerAcuerdo={(acuerdoId) => navigate(`/acuerdos/${acuerdoId}`)}
                  onExplorar={() => navigate('/explorar')}
                />
              }
            />

            {/* Perfiles */}
            <Route
              path="/perfil"
              element={
                <MiembroProfile
                  onDonarHoras={() => navigate('/donar-horas')}
                  onVerMovimientos={() => navigate('/movimientos')}
                />
              }
            />
            <Route
              path="/:miembroId"
              element={<MiembroDetail onVolver={() => navigate(-1)} />}
            />

            {/* Publicaciones de ayuda */}
            <Route
              path="/posts/:postId"
              element={
                <PostAyudaDetail
                  onBack={() => navigate(-1)}
                  onIrChat={(chatId) => navigate(`/chats/${chatId}`)}
                  onVerPerfil={(miembroId) => navigate(`/${miembroId}`)}
                  onVolverInicio={() => navigate('/')}
                  onParticipar={participarEnPostDemo}
                  onVerAcuerdo={(acuerdoId) => navigate(`/acuerdos/${acuerdoId}`)}
                />
              }
            />

            <Route
              path="/crear-post-ayuda/pide"
              element={
                <CrearPostAyuda
                  tipo="pide"
                  onVolver={() => navigate(-1)}
                  onVolverInicio={() => navigate('/')}
                />
              }
            />
            <Route
              path="/crear-post-ayuda/ofrece"
              element={
                <CrearPostAyuda
                  tipo="ofrece"
                  onVolver={() => navigate(-1)}
                  onVolverInicio={() => navigate('/')}
                />
              }
            />

            {/* Acuerdos */}
            <Route
              path="/acuerdos/:acuerdoId"
              element={
                <AcuerdoDetail
                  acuerdos={ACUERDOS_PARA_DETALLE_DEMO}
                  onVolver={() => navigate(-1)}
                  onVerPost={(postId) => navigate(`/posts/${postId}`)}
                  onIrChat={(chatId) => navigate(`/chats/${chatId}`)}
                />
              }
            />

            {/* Transferencias de horas */}
            <Route path="/donar-horas" element={<DonarHoras />} />
            <Route
              path="/movimientos"
              element={
                <HistorialMiembro onDonarHoras={() => navigate('/donar-horas')} />
              }
            />

            {/* Chats */}
            <Route
              path="/chats"
              element={
                <ChatList onAbrirChat={(chatId) => navigate(`/chats/${chatId}`)} />
              }
            />
            <Route path="/chats/:chatId" element={<Chat />} />

            {/* Calendario */}
            <Route
              path="/calendario"
              element={
                <Calendario
                  onVerAcuerdo={(acuerdoId) => navigate(`/acuerdos/${acuerdoId}`)}
                />
              }
            />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
