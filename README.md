
Prioritising stability, low battery consumption, low memory consumption, small APK size, and reliable background playback.






react-native-track-player
- expo
- gradle
- react-navigation
- zustand



##commands:

Terminal 1 — Restart Metro
Stop the existing Metro server with Ctrl + C, then run:
cd C:\mp
npx expo start --dev-client --clear --port 8081


Terminal 2 — Restart Android app
adb reverse tcp:8081 tcp:8081
adb shell am force-stop com.example.androidmusicplayer
adb shell am start -n com.example.androidmusicplayer/.MainActivity  





 @react-native-async-storage/async-storage




REBUILD APP:

 cd C:\mp\android

 .\gradlew.bat app:assembleDebug -PreactNativeArchitectures=x86_64 --no-build-cache