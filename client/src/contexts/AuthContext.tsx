import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// User arayüzü
interface User {
  email: string;
  userId: number;
}

// AuthContext'in sunduğu fonksiyonlar ve user bilgisi
interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

// Context oluşturma
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// AuthContext'i kullanmak için hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider bileşeni, tüm uygulama içinde AuthContext'i sağlar
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
