import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position: string;
}

interface AuthContextType {
  token: string | null;
  employee: Employee | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const savedEmployee = localStorage.getItem('employee');
      if (savedEmployee) {
        setEmployee(JSON.parse(savedEmployee));
      }
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, employee } = response.data;
      
      setToken(token);
      setEmployee(employee);
      localStorage.setItem('token', token);
      localStorage.setItem('employee', JSON.stringify(employee));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (data: any) => {
    try {
      await axios.post('/api/auth/register', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setToken(null);
    setEmployee(null);
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ token, employee, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};