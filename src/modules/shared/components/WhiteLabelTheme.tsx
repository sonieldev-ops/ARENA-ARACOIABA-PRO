'use client';

import React, { useEffect } from 'react';

interface WhiteLabelConfig {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

interface WhiteLabelThemeProps {
  config?: WhiteLabelConfig;
}

export function WhiteLabelTheme({ config }: WhiteLabelThemeProps) {
  useEffect(() => {
    if (!config) return;

    const root = document.documentElement;

    // Default Fallbacks
    const primary = config.primaryColor || '#FACC15'; // Amarelo Arena
    const secondary = config.secondaryColor || '#0B0C0E'; // Preto Arena

    // Aplicar variáveis CSS dinâmicas
    root.style.setProperty('--primary-custom', primary);
    root.style.setProperty('--secondary-custom', secondary);

    // Podemos também injetar uma classe ou style tag se quisermos sobrescrever o Tailwind via CSS puro
    const styleId = 'whitelabel-styles';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
      .theme-primary { color: ${primary} !important; }
      .theme-bg-primary { background-color: ${primary} !important; }
      .theme-border-primary { border-color: ${primary} !important; }
      .theme-shadow-primary { --tw-shadow-color: ${primary}40 !important; }

      /* Sobrescrever botões do shadcn se usarem classes específicas */
      .btn-custom-primary {
        background-color: ${primary} !important;
        color: ${secondary} !important;
      }
      .btn-custom-primary:hover {
        opacity: 0.9;
      }
    `;

    return () => {
      // Opcional: remover ao desmontar se quisermos que o tema seja apenas por página
      // mas para White Label por campeonato, geralmente mantemos enquanto a página estiver aberta.
    };
  }, [config]);

  return null;
}
