import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hellobrick.app',

  appName: 'HelloBrick Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // Allow HTTP during development if needed, but production uses HTTPS
    allowNavigation: ['api.keydesignmedia.xyz']
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
      backgroundColor: "#FFD600",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      iosSpinnerStyle: "small",
      spinnerColor: "#F97316"
    }
  }
};

export default config;

