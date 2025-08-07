// .storybook/preview.tsx
import type { Preview } from '@storybook/react';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n/config';
import '../src/index.css';

// Initialize i18n for Storybook
i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      translation: {
        'dashboard.metrics.totalIn': 'Total In',
        'dashboard.metrics.totalOut': 'Total Out',
        'dashboard.metrics.entryRate': 'Entry Rate',
        'dashboard.charts.peopleFlow': 'People Flow (In/Out)',
        'dashboard.charts.trafficHeatmap': 'Traffic Heatmap',
        'dashboard.charts.entryRateOverTime': 'Entry Rate Over Time'
      }
    }
  }
});

const withProviders = (Story: any) => (
  <I18nextProvider i18n={i18n}>
    <div className="min-h-screen bg-gray-50 p-6">
      <Story />
    </div>
  </I18nextProvider>
);

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
  },
  decorators: [withProviders],
};

export default preview;
