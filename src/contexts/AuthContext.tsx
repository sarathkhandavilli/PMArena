import { createContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getCurrentUserProfile, UserProfile } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Initialize and listen to session/user changes (purely auth state)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Synchronously set loading to true before setting user, so dependents don't check profile too early
        if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          setLoading(true);
        }
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. React to user changes and fetch profile
  useEffect(() => {
    const userId = user?.id;
    const fetchProfile = async () => {
      console.log("AuthContext: user changed, userId =", userId);
      if (userId) {
        setLoading(true);
        console.log("AuthContext: fetching profile for user", userId);
        const userProfile = await getCurrentUserProfile(userId);
        console.log("AuthContext: fetched profile:", userProfile);
        setProfile(userProfile);
        setLoading(false);
      } else {
        setProfile(null);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
