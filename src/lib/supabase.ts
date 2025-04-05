import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ugiatrkqtfiidnpxbluk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaWF0cmtxdGZpaWRucHhibHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTMzODIsImV4cCI6MjA1ODIyOTM4Mn0.xo98jkIkqAHL9Xh_kPY4EdMnJ44cSFw98Xsih3p9lL4';

// Wrapper personalizado para localStorage com tratamento de erros
const storage = {
  getItem: (key: string): string | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      // Verificar se o token não está expirado
      if (key === 'sb-auth-token') {
        try {
          const parsed = JSON.parse(item);
          if (parsed.expires_at && new Date(parsed.expires_at) < new Date()) {
            localStorage.removeItem(key);
            return null;
          }
        } catch (e) {
          console.error('Erro ao parsear token:', e);
          localStorage.removeItem(key);
          return null;
        }
      }
      
      return item;
    } catch (error) {
      console.error('Erro ao acessar localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
      // Tentar limpar o storage se estiver cheio
      try {
        localStorage.clear();
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Erro ao limpar e salvar no localStorage:', e);
      }
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Erro ao remover do localStorage:', error);
    }
  },
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage,
    storageKey: 'sb-auth-token',
    flowType: 'pkce',
    debug: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
}); 