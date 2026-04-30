import { createContext, useEffect, useState, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getCurrentUserProfile, UserProfile } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isFetchingProfile: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const isInitialized = useRef(false)

  // 🔥 SINGLE SOURCE OF TRUTH
  useEffect(() => {
    let isMounted = true;

    const handleSession = async (session: Session | null, isInitial = false) => {
      if (!isMounted) return;

      if (isInitial) setLoading(true);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setIsFetchingProfile(true);
        try {
          const profileData = await getCurrentUserProfile(session.user.id);
          if (isMounted) {
            setProfile(profileData);
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
          if (isMounted) setProfile(null);
        } finally {
          if (isMounted) setIsFetchingProfile(false);
        }
      } else {
        setProfile(null);
        setIsFetchingProfile(false);
      }

      if (isMounted && isInitial) setLoading(false);
    };

    // ✅ Initial session load
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session, true);
      isInitialized.current = true;
    });

    // ✅ Auth listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (isInitialized.current) {
          handleSession(session, false);
        }
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isFetchingProfile }}>
      {children}
    </AuthContext.Provider>
  );
};