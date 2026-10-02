# ChronoScreenOn

Cronometro essenziale per Android, realizzato con Capacitor.

## Features

- Avvio, arresto e azzeramento
- Opzione per mantenere acceso lo schermo
- Doppio tocco per oscurare i comandi e attivare la modalita immersiva; un altro doppio tocco li ripristina
- Schermata nera con testo bianco

## Run locally

Per provare la versione web:

   npm start

Apri http://localhost:5173 nel browser. Il blocco schermo Android e la modalita immersiva funzionano solo nell'app nativa.

## APK Android

Il workflow GitHub Actions compila l'APK debug a ogni push e lo rende disponibile come artifact `chronoscreenon-apk`. Per scaricarlo, apri la run completata nella scheda Actions del repository e scarica l'artifact; estrai `app-debug.apk` e aprilo sul telefono. Android potrebbe chiedere di autorizzare l'installazione da questa origine. Per generarlo localmente:

```sh
npm ci
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

L'APK si trova in `android/app/build/outputs/apk/debug/app-debug.apk`. Una normale app Android non puo disabilitare Home, Recenti o garantire di non essere chiusa dal sistema; il doppio tocco nasconde i comandi dell'app e attiva la modalita immersiva, che Android puo interrompere con i gesti di sistema.

## Run tests

npm test