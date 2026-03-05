'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              width?: number;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GSI_SCRIPT = 'https://accounts.google.com/gsi/client';

export function GoogleSignInButton({
  onSuccess,
  onError,
  disabled,
  text = 'continue_with',
  width = 280,
}: {
  onSuccess: (credential: string) => void;
  onError?: (err: unknown) => void;
  disabled?: boolean;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  width?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !containerRef.current) return;

    const loadScript = () => {
      if (document.getElementById('gsi-script')) return;
      const script = document.createElement('script');
      script.id = 'gsi-script';
      script.src = GSI_SCRIPT;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    const init = () => {
      if (!window.google?.accounts?.id) {
        loadScript();
        const check = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(check);
            doInit();
          }
        }, 100);
        return;
      }
      doInit();
    };

    const doInit = () => {
      if (!window.google?.accounts?.id || !containerRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (res) => {
          if (res.credential) onSuccessRef.current(res.credential);
        },
        auto_select: false,
      });

      containerRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text,
        width,
      });
    };

    init();
  }, [clientId, text, width]);

  if (!clientId) {
    return null;
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        '& iframe': { maxHeight: 48 },
      }}
    />
  );
}
