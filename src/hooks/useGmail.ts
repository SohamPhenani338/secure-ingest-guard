import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GmailUser {
  email: string;
  name: string;
  picture: string;
}

interface GmailTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface GmailEmail {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  snippet: string;
  headers: {
    'return-path': string;
    'reply-to': string;
    'received-spf': string;
    'dkim-signature': string;
    'authentication-results': string;
    'x-originating-ip': string;
    'message-id': string;
  };
}

const STORAGE_KEY = 'safecheck_gmail_tokens';
const USER_KEY = 'safecheck_gmail_user';

export function useGmail() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState<GmailUser | null>(null);
  const [tokens, setTokens] = useState<GmailTokens | null>(null);

  // Load saved tokens on mount
  useEffect(() => {
    const savedTokens = localStorage.getItem(STORAGE_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    
    if (savedTokens && savedUser) {
      const parsedTokens = JSON.parse(savedTokens) as GmailTokens;
      const parsedUser = JSON.parse(savedUser) as GmailUser;
      
      // Check if tokens are expired
      if (parsedTokens.expiresAt > Date.now()) {
        setTokens(parsedTokens);
        setUser(parsedUser);
        setIsConnected(true);
      } else {
        // Clear expired tokens
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !isConnected && !isConnecting) {
      handleOAuthCallback(code);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    setIsConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/`;
      
      const { data, error } = await supabase.functions.invoke('gmail-auth', {
        body: { 
          action: 'exchange-code', 
          code, 
          redirectUri 
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const newTokens: GmailTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000)
      };

      const newUser: GmailUser = {
        email: data.user.email,
        name: data.user.name || data.user.email,
        picture: data.user.picture || ''
      };

      setTokens(newTokens);
      setUser(newUser);
      setIsConnected(true);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTokens));
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      toast.success(`Connected to ${newUser.email}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast.error('Failed to connect Gmail');
    } finally {
      setIsConnecting(false);
    }
  };

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/`;
      
      const { data, error } = await supabase.functions.invoke('gmail-auth', {
        body: { action: 'get-auth-url', redirectUri }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Connect error:', error);
      toast.error('Failed to start Gmail connection');
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setTokens(null);
    setUser(null);
    setIsConnected(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    toast.success('Disconnected from Gmail');
  }, []);

  const fetchEmails = useCallback(async (maxResults = 10): Promise<GmailEmail[]> => {
    if (!tokens) {
      throw new Error('Not connected to Gmail');
    }

    // Check if token needs refresh
    if (tokens.expiresAt < Date.now() + 60000) {
      // Token expires in less than 1 minute, refresh it
      try {
        const { data, error } = await supabase.functions.invoke('gmail-auth', {
          body: { 
            action: 'refresh-token', 
            refreshToken: tokens.refreshToken 
          }
        });

        if (!error && data.access_token) {
          const newTokens: GmailTokens = {
            ...tokens,
            accessToken: data.access_token,
            expiresAt: Date.now() + (data.expires_in * 1000)
          };
          setTokens(newTokens);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newTokens));
        }
      } catch (e) {
        console.error('Token refresh failed:', e);
      }
    }

    const { data, error } = await supabase.functions.invoke('gmail-fetch', {
      body: { 
        accessToken: tokens.accessToken,
        maxResults 
      }
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return data.emails || [];
  }, [tokens]);

  return {
    isConnected,
    isConnecting,
    user,
    connect,
    disconnect,
    fetchEmails
  };
}
