'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  phone?: string | null;
  userType?: 'customer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Set auth cookies
        document.cookie = `auth-token=${firebaseUser.uid}; path=/; max-age=86400`;
        document.cookie = `user-email=${firebaseUser.email}; path=/; max-age=86400`;

        // Sync Firebase user with Supabase
        const { data: supabaseUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', firebaseUser.uid)
          .single();

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          phone: supabaseUser?.phone || null,
          userType: supabaseUser?.user_type || 'customer',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
