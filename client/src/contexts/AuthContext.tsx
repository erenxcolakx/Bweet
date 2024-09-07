import axios from 'axios';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// User arayüzü
interface User {
  email: string;
  userId: number;
  name: string;
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

// AuthProvider bileşeni, tüm uygulama içinde AuthContext'i sağlar
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // İlk render sırasında ve her sayfa yenilendiğinde backend'e istek yapacak
  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_AUTH_ADDRESS}/api/check-auth`, {
          withCredentials: true, // Session çerezlerini backend'e gönder
        });

        if (response.data.success) {
          setUser(response.data.user); // Backend'den dönen oturum bilgisini frontend'e senkronize et
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          localStorage.removeItem('user'); // Oturum kapalıysa localStorage'dan temizle
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('user'); // Hata durumunda localStorage'dan kullanıcıyı temizle
        setUser(null);
      }
    };

    // Sayfa her yenilendiğinde backend'e istek yap
    syncWithBackend();
  }, []); // Boş bağımlılık dizisi ile sadece bir kez çalışacak

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};