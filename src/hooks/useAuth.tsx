
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  currentBusinessPlan: any;
  setCurrentBusinessPlan: (plan: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentBusinessPlan, setCurrentBusinessPlan] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(() => {
            if (mounted) {
              loadUserBusinessPlan(session.user.id);
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setCurrentBusinessPlan(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          if (mounted) {
            loadUserBusinessPlan(session.user.id);
          }
        }, 100);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserBusinessPlan = async (userId: string) => {
    try {
      console.log('Loading business plan for user:', userId);
      
      // Check if user has any business plans
      const { data: teamMemberships, error } = await supabase
        .from('team_members')
        .select(`
          business_plan_id,
          role,
          business_plans (
            id,
            name,
            description,
            company_id,
            companies (
              name,
              sector
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(1);

      if (error) {
        console.error('Error loading business plan:', error);
        // If it's an RLS error or no data, try to create a default plan
        if (error.code === 'PGRST116' || error.message.includes('row-level security')) {
          console.log('RLS restriction or no data found, creating default business plan');
          await createDefaultBusinessPlan(userId);
        }
        return;
      }

      if (teamMemberships && teamMemberships.length > 0) {
        console.log('Found existing business plan:', teamMemberships[0]);
        setCurrentBusinessPlan(teamMemberships[0]);
      } else {
        console.log('No business plans found, creating default');
        await createDefaultBusinessPlan(userId);
      }
    } catch (error) {
      console.error('Error in loadUserBusinessPlan:', error);
      // Always try to create a default business plan as fallback
      await createDefaultBusinessPlan(userId);
    }
  };

  const createDefaultBusinessPlan = async (userId: string) => {
    try {
      console.log('Creating default business plan for user:', userId);
      
      // Create company first
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: 'Minha Empresa',
          description: 'Descrição da empresa',
          created_by: userId
        })
        .select()
        .single();

      if (companyError) {
        console.error('Error creating company:', companyError);
        return;
      }

      console.log('Company created:', company);

      // Create business plan
      const { data: businessPlan, error: planError } = await supabase
        .from('business_plans')
        .insert({
          company_id: company.id,
          name: 'Plano de Negócios Principal',
          description: 'Seu primeiro plano de negócios',
          created_by: userId
        })
        .select()
        .single();

      if (planError) {
        console.error('Error creating business plan:', planError);
        return;
      }

      console.log('Business plan created:', businessPlan);

      // Add user as admin team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          business_plan_id: businessPlan.id,
          user_id: userId,
          role: 'admin'
        });

      if (memberError) {
        console.error('Error adding team member:', memberError);
        return;
      }

      console.log('Team member added');

      // Create default canvas sections
      const { error: sectionsError } = await supabase
        .rpc('create_default_canvas_sections', { plan_id: businessPlan.id });

      if (sectionsError) {
        console.error('Error creating canvas sections:', sectionsError);
        // Don't return here, let's still set the business plan
      }

      console.log('Canvas sections created');

      // Set as current business plan
      const newBusinessPlan = {
        business_plan_id: businessPlan.id,
        role: 'admin',
        business_plans: {
          ...businessPlan,
          companies: company
        }
      };
      
      setCurrentBusinessPlan(newBusinessPlan);

      toast({
        title: "Bem-vindo!",
        description: "Seu workspace foi criado com sucesso.",
      });
    } catch (error) {
      console.error('Error creating default business plan:', error);
      // Even if creation fails, stop loading
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive"
        });
      }
      
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });
      
      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta.",
        });
      }
      
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentBusinessPlan(null);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      currentBusinessPlan,
      setCurrentBusinessPlan
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
