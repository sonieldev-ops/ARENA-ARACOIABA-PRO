import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.arena.aracoiabapro',
  appName: 'Arena Araçoiaba Pro',
  webDir: 'out',
  server: {
    url: 'https://arena-aracoiaba-pro.vercel.app',
    allowNavigation: [
      'arena-aracoiaba-pro.firebaseapp.com',
      'arena-aracoiaba-pro.web.app',
      'arenaaracoiaba.com.br',
      'arena-aracoiaba-pro.vercel.app'
    ],
    cleartext: false
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'AAB'
    }
  }
};

export default config;
