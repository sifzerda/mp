package expo.modules.musicartwork

import android.media.MediaMetadataRetriever
import android.net.Uri
import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MusicArtworkModule : Module() {

  override fun definition() = ModuleDefinition {
    Name("MusicArtwork")

    AsyncFunction("getArtwork") { uri: String ->
      val retriever = MediaMetadataRetriever()

      try {
        val context = requireNotNull(appContext.reactContext)

        retriever.setDataSource(
          context,
          Uri.parse(uri)
        )

        val artwork = retriever.embeddedPicture

        if (artwork == null) {
          null
        } else {
          val base64 = Base64.encodeToString(
            artwork,
            Base64.NO_WRAP
          )

          "data:image/jpeg;base64,$base64"
        }
      } catch (error: Exception) {
        null
      } finally {
        retriever.release()
      }
    }
  }
}
