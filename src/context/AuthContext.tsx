import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  token: string | null;
  role: string | null;
  userId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  workcountry: string | null; // Prisma enum value e.g. IVORY_COAST
  effectiveCountryCode: string; // UI code e.g. coteIvoire, cameroun
  setEffectiveCountryCode: (code: string) => void;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [workcountry, setWorkcountry] = useState<string | null>(null);
  const [effectiveCountryCode, setEffectiveCountryCodeState] = useState<string>(
    localStorage.getItem('effectiveCountryCode') || ''
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour récupérer les données utilisateur
  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/.netlify/functions/personnel-users?id=${userId}`);
      if (response.ok) {
        const userData = await response.json();
        // Si c'est un tableau, prendre le premier élément, sinon utiliser directement
        const user = Array.isArray(userData) ? userData.find((u: any) => u.id === Number(userId)) : userData;
        if (user) {
          setFirstName(user.firstName || null);
          setLastName(user.lastName || null);
          if (user.workcountry) {
            setWorkcountry(user.workcountry);
            // Initialize from user's workcountry; no forced default
            const mapped = mapWorkcountryToCode(user.workcountry);
            setEffectiveCountryCodeState(mapped);
            localStorage.setItem('effectiveCountryCode', mapped);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const logout = () => {
    // Supprimer tous les tokens et données du localStorage
    localStorage.removeItem('token');
    localStorage.clear(); // Supprime tout le localStorage pour être sûr
    
    // Réinitialiser tous les états
    setToken(null);
    setRole(null);
    setUserId(null);
    setEmail(null);
    setFirstName(null);
    setLastName(null);
    setWorkcountry(null);
    setEffectiveCountryCodeState('');
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded: { role: string; id: string; email: string } = jwtDecode(token);
        setRole(decoded.role);
        setUserId(decoded.id);
        setEmail(decoded.email);
        
        // Récupérer les données complètes de l'utilisateur
        if (decoded.id) {
          fetchUserData(decoded.id);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        // Appeler logout directement ici
        localStorage.removeItem('token');
        localStorage.clear();
        setToken(null);
        setRole(null);
        setUserId(null);
        setEmail(null);
        setFirstName(null);
        setLastName(null);
      }
    } else {
      setFirstName(null);
      setLastName(null);
    }
    setIsLoading(false);
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  // Map Prisma Workcountry enum to UI country code used by Header/Sidebar
  const mapWorkcountryToCode = (wc: string): string => {
    const normalized = String(wc || '').toUpperCase().replace(/\s+/g, '_');
    // Fix common typos/variants
    const fixed = normalized
      .replace('IVORYCAOST', 'IVORY_COAST')
      .replace('IVORYCOAST', 'IVORY_COAST')
      .replace('COTE_D_IVOIRE', 'IVORY_COAST');
    switch (fixed) {
      case 'CAMEROON': return 'cameroun';
      case 'IVORY_COAST': return 'coteIvoire';
      case 'ITALIE': return 'italie';
      case 'GHANA': return 'ghana';
      case 'BENIN': return 'benin';
      case 'TOGO': return 'togo';
      case 'ROMANIE': return 'romanie';
      default: return 'cameroun';
    }
  };

  const setEffectiveCountryCode = (code: string) => {
    // Only allow override for SUPER_ADMIN; others are locked to their mapped workcountry
    if (role === 'SUPER_ADMIN') {
      setEffectiveCountryCodeState(code);
      localStorage.setItem('effectiveCountryCode', code);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        role, 
        userId,
        email,
        firstName,
        lastName,
        workcountry,
        effectiveCountryCode,
        setEffectiveCountryCode,
        isLoading,
        login, 
        logout,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

