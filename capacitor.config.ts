import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hellobrick.app',

  appName: 'HelloBrick',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // Allow HTTP during development if needed, but production uses HTTPS
    allowNavigation: ['hellobrick.netlify.app', 'hellobrick.app', 'www.hellobrick.app']
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'This app needs camera access to scan and identify building bricks',
        photos: 'This app needs photo access to save scanned brick images'
      }
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0A0F1E",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      iosSpinnerStyle: "small",
      spinnerColor: "#F97316"
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;

