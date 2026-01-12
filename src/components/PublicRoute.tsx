import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * PublicRoute - Redirige vers le dashboard si l'utilisateur est déjà connecté
 * Utilisé pour les routes publiques comme signin et signup
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;

