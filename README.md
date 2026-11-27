# Android Music Player

## Releases

- [v1.0.3](https://github.com/USERNAME/REPOSITORY/releases/latest/download/MusicPlayer.apk): added audio file library importation, changed default bg to match custom styles
- v1.02: added album art from uri, metadata extraction and normalization
- v1.01: initial app

## Table of Contents

- [Releases](#releases)
- [Description](#description)
- [Badges](#badges)
- [Visuals](#visuals)
- [Installation](#installation)
- [Tech](#tech)
- [Support](#support)
- [Contributing](#contributing)
- [Authors and Acknowledgment](#authors-and-acknowledgment)
- [License](#license)
- [Project Status](#project-status)

## Description

A lightweight music player app for android devices, prioritising stability, small size and low battery usage.

Features:

- view song, album, artist, folder path
- retrieves various existing metadata for each song
- play/pause/next/previous, shuffle, repeat
- searchbar
- background and lock screen mini player playback
- audio pause when aux input disconnected
- theme/color selection
- create and store customizable playlists
- re-arrangeable song queues
- alter playback speed from 0.5x - 2x
- album art from metadata or album art from uri

### Playback capabilities:

- Sound files: .mp3, .wav, .flac, .aac, .m4a, .ogg, .opus, .amr
- Android Arhcitecture: supports ARM64, x86, x86_64, armeabi-v7a

## Badges

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) 

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Expo](https://img.shields.io/badge/expo-%231C1E24.svg?style=for-the-badge&logo=expo&logoColor=#D04A37) ![Gradle](https://img.shields.io/badge/Gradle-%2302303A.svg?style=for-the-badge&logo=Gradle&logoColor=white) ![Kotlin](https://img.shields.io/badge/kotlin-%237F52FF.svg?style=for-the-badge&logo=kotlin&logoColor=white)
![Android](https://img.shields.io/badge/Android-%233DDC84.svg?style=for-the-badge&logo=android&logoColor=white)
![Android Studio](https://img.shields.io/badge/Android_studio-%233DDC84.svg?style=for-the-badge&logo=android&logoColor=white)
![Metro](https://img.shields.io/badge/Metro_bundler-EF4242.svg?style=for-the-badge&logo=Metro&logoColor=white)

## Visuals

![pic1](https://github.com/user-attachments/assets/b30690a1-432b-4d4d-8b67-5665705c4235)
![pic2](https://github.com/user-attachments/assets/f8dbad5d-dc01-4bff-be0d-0d8b3b7e4fcd)

## Installation

Play on android device, or clone into local machine and open on IDE.

```bash
# TERMINAL 1 RESTART METRO SERVER

## Stop the existing Metro server with Ctrl + C, then run:
cd C:\mp
## then
npx expo start --dev-client --clear --port 8081

# TERMINAL 2 — RESTART ANDROID APP

adb reverse tcp:8081 tcp:8081
## then
adb shell am force-stop com.example.androidmusicplayer
## then
adb shell am start -n com.example.androidmusicplayer/.MainActivity 

## re-release

cd C:\mp\android
# Build the latest release
.\gradlew.bat app:assembleRelease -PreactNativeArchitectures=arm64-v8a --no-build-cache
## app will be located at:
C:\mp\android\app\build\outputs\apk\release\app-release.apk

# Install on physical phone
adb -d install -r ".\app\build\outputs\apk\release\app-release.apk"
 
# Launch the app
adb -d shell am force-stop com.example.androidmusicplayer
adb -d shell am start -n com.example.androidmusicplayer/.MainActivity

# Prepare GitHub APK
Copy-Item ".\app\build\outputs\apk\release\app-release.apk" "C:\mp\MusicPlayer.apk" -Force

```
## Tech

- [React Native](https://reactnative.dev/)
- [React Native Track Player](https://github.com/justinmachado/react-native-track-player)
- [ React Native Draggable Flatlist](https://github.com/aksonov/react-native-draggable-flatlist)
- [React Native Async Storage](https://github.com/react-native-async-storage/async-storage)
- [Expo](https://expo.dev/)
- [Gradle](https://developer.android.com/studio)
- [Kotlin](https://kotlinlang.org/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Media Library](https://docs.expo.dev/versions/latest/sdk/media-library/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React-Lucide] icons (https://www.npmjs.com/package/lucide-react-native)
- [Metro Bundler](https://github.com/facebook/metro)

## Support

For support, users can contact me through my portfolio contact form: [here](https://next-portfolio-sifzerdas-projects.vercel.app/contact)

## Contributing

Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". 
1.	Fork the Project
2.	Create your Feature Branch (git checkout -b feature/NewFeature)
3.	Commit your Changes (git commit -m 'Add some NewFeature')
4.	Push to the Branch (git push origin feature/NewFeature)
5.	Open a Pull Request

## Authors and acknowledgment

The author acknowledges and credits those who have contributed to this project.

## License

Distributed under the MIT License. See LICENSE.txt for more information.

## Project status

This project is complete.
