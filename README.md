react-native-track-player
- expo
- gradle



commands:

run Metro: adb shell am start -n com.example.androidmusicplayer/.MainActivity

stop Metro: adb shell am force-stop com.example.androidmusicplayer    

 @react-native-async-storage/async-storage




REBUILD APP:

 cd C:\mp\android

 .\gradlew.bat app:assembleDebug -PreactNativeArchitectures=x86_64 --no-build-cache