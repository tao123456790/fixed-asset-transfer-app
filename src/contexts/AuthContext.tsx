import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user' | 'manager';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const DEMO_USERS: User[] = [
  {
    id: '1',
    email: 'admin@company.com',
    fullName: 'ผู้ดูแลระบบ',
    role: 'admin'
  },
  {
    id: '2',
    email: 'user@company.com',
    fullName: 'ผู้ใช้งาน',
    role: 'user'
  },
  {
    id: '3',
    email: 'manager@company.com',
    fullName: 'ผู้จัดการ',
    role: 'manager'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find demo user
    const foundUser = DEMO_USERS.find(u => u.email === email);
    
    if (foundUser && password) { // Accept any password for demo
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      localStorage.setItem('fullName', foundUser.fullName);
    } else {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('fullName');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};