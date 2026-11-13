import { useState } from 'react';
import { Route, Routes, Outlet, Navigate, useNavigate, useLocation } from 'react-router';

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
import ServiciosMiembro from './ventanas/miembro/ServiciosMiembro';
import AniadirServicio from './ventanas/creacionYEdicion/AniadirServicio';
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
import { participarEnPublicacion } from './api/participaciones.api';

import './App.css';

/**
 * Se habilita SOLO cuando el backend publique y pruebe el POST transaccional.
 * Mientras tanto, los botones de participación real permanecen deshabilitados.
 */
const PARTICIPACION_HABILITADA = import.meta.env.VITE_PARTICIPACION_HABILITADA === 'true';

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
        navigate('/mis-servicios');
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
                  onExplorar={() => navigate('/explorar')}
                  onVerAcuerdo={(id) => navigate(`/acuerdos/${id}`)}
                  onIrChat={(id) => navigate(`/acuerdos/${id}/chat`)}
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
            <Route path="/mis-servicios" element={<ServiciosMiembro />} />
            <Route path="/anadir-servicio" element={<AniadirServicio onCerrar={() => navigate('/mis-servicios')} />} />
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
                  onVerPerfil={(miembroId) => navigate(`/${miembroId}`)}
                  onVolverInicio={() => navigate('/')}
                  onVerAcuerdo={(acuerdoId) => navigate(`/acuerdos/${acuerdoId}`)}
                  onIrChat={(acuerdoId) => navigate(`/acuerdos/${acuerdoId}/chat`)}
                  onParticipar={PARTICIPACION_HABILITADA ? participarEnPublicacion : undefined}
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
                  onVolver={() => navigate(-1)}
                  onVerPost={(postId) => navigate(`/posts/${postId}`)}
                  onIrChat={(acuerdoId) => navigate(`/acuerdos/${acuerdoId}/chat`)}
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
            {/* Enlaces de chats antiguos: no abrir chats independientes del acuerdo. */}
            <Route path="/chats/*" element={<Navigate to="/actividad" replace />} />

            {/* Chat exclusivo del acuerdo. No existe mensajería directa entre miembros. */}
            <Route
              path="/acuerdos/:acuerdoId/chat"
              element={
                <Chat
                  onAbrirPerfil={(id) => navigate(`/${id}`)}
                  onVerAcuerdo={(id) => navigate(`/acuerdos/${id}`)}
                />
              }
            />

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
