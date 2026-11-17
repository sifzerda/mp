package expo.modules.musicartwork

import android.content.Context
import android.content.ContentUris
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.security.MessageDigest
import kotlin.math.max
import kotlin.math.roundToInt

class MusicArtworkModule : Module() {

  companion object {
    private const val CACHE_DIRECTORY = "music_artwork_v2"
    private const val MAX_CACHE_BYTES = 128L * 1024L * 1024L
    private const val MAX_CACHE_FILES = 6000
    private const val JPEG_QUALITY = 85
    private const val PRUNE_INTERVAL = 60_000L
    private val cacheLock = Any()
    private var lastPruneTime = 0L
  }

  /* -------------------- MODULE DEFINITION -------------------- */

  override fun definition() = ModuleDefinition {
    Name("MusicArtwork")

    AsyncFunction("getMusicFolders") {
      val context = requireNotNull(appContext.reactContext)
      getMusicFolders(context)
    }

    AsyncFunction("getArtwork") {
      uri: String, size: Int, version: String ->
      val context = requireNotNull(appContext.reactContext)
      extractArtwork(context, uri, size.coerceIn(64, 1024), version)
    }

    AsyncFunction("clearCache") {
      val context = requireNotNull(appContext.reactContext)

      synchronized(cacheLock) {
        getCacheDirectory(context).deleteRecursively()
        lastPruneTime = 0L
      }
    }
  }

  /* -------------------- MUSIC FOLDERS -------------------- */

  private fun getMusicFolders(
    context: Context
  ): Map<String, Map<String, String>> {

    val folders = mutableMapOf<String, Map<String, String>>()

    val volumes = if (
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
    ) {
      MediaStore.getExternalVolumeNames(context)
    } else {
      setOf("external")
    }

    val pathColumn = if (
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
    ) {
      MediaStore.MediaColumns.RELATIVE_PATH
    } else {
      MediaStore.MediaColumns.DATA
    }

    val projection = arrayOf(
      MediaStore.Audio.Media._ID,
      pathColumn
    )

    for (volume in volumes) {

      val collection =
        MediaStore.Audio.Media.getContentUri(volume)

      context.contentResolver.query(
        collection,
        projection,
        null,
        null,
        null
      )?.use { cursor ->

        val idIndex = cursor.getColumnIndexOrThrow(
          MediaStore.Audio.Media._ID
        )

        val pathIndex = cursor.getColumnIndexOrThrow(
          pathColumn
        )

        while (cursor.moveToNext()) {

          val id = cursor.getLong(idIndex)

          val rawPath = cursor.getString(pathIndex)
            ?: continue

          val folderPath = if (
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
          ) {
            rawPath.trimEnd('/')
          } else {
            File(rawPath).parent ?: continue
          }

          val folderName = folderPath
            .substringAfterLast('/')
            .ifBlank { "Root" }

          val metadata = mapOf(
            "folderId" to "$volume:$folderPath",
            "folderName" to folderName,
            "folderPath" to folderPath,
            "folderVolume" to volume
          )

          val uri = ContentUris.withAppendedId(
            collection,
            id
          ).toString()

          folders[uri] = metadata

          if (volume == "external_primary") {
            val externalUri = ContentUris.withAppendedId(
              MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
              id
            ).toString()

            folders[externalUri] = metadata
          }
        }
      }
    }

    return folders
  }

  /* -------------------- CACHE DIRECTORY -------------------- */

  private fun getCacheDirectory(
    context: Context
  ): File {
    return File(
      context.cacheDir,
      CACHE_DIRECTORY
    ).apply {
      mkdirs()
    }
  }

  private fun hash(value: String): String {
    return MessageDigest
      .getInstance("SHA-256")
      .digest(value.toByteArray(Charsets.UTF_8))
      .joinToString("") {
        "%02x".format(it.toInt() and 0xff)
      }
  }

  /* -------------------- ARTWORK EXTRACTION -------------------- */

  private fun extractArtwork(
    context: Context,
    uri: String,
    size: Int,
    version: String
  ): String? {

    val cacheDirectory = getCacheDirectory(context)

    val cacheKey = hash("$uri|$size|$version")

    val outputFile = File(
      cacheDirectory,
      "$cacheKey.jpg"
    )

    synchronized(cacheLock) {
      if (
        outputFile.isFile &&
        outputFile.length() > 0L
      ) {
        outputFile.setLastModified(
          System.currentTimeMillis()
        )

        return Uri.fromFile(outputFile).toString()
      }
    }

    val retriever = MediaMetadataRetriever()

    var decodedBitmap: Bitmap? = null
    var resizedBitmap: Bitmap? = null
    var temporaryFile: File? = null

    try {
      retriever.setDataSource(
        context,
        Uri.parse(uri)
      )

      val artwork = retriever.embeddedPicture
        ?: return null

      // Read dimensions without decoding the image.
      val bounds = BitmapFactory.Options().apply {
        inJustDecodeBounds = true
      }

      BitmapFactory.decodeByteArray(
        artwork,
        0,
        artwork.size,
        bounds
      )

      if (
        bounds.outWidth <= 0 ||
        bounds.outHeight <= 0
      ) {
        return null
      }

      // Decode a smaller bitmap to reduce memory usage.
      val options = BitmapFactory.Options().apply {
        inSampleSize = calculateSampleSize(
          bounds.outWidth,
          bounds.outHeight,
          size
        )

        inPreferredConfig = Bitmap.Config.ARGB_8888
      }

      val decoded = BitmapFactory.decodeByteArray(
        artwork,
        0,
        artwork.size,
        options
      ) ?: return null

      decodedBitmap = decoded

      val resized = resizeBitmap(decoded, size)

      resizedBitmap = resized

      // Write to a temporary file first.
      val temp = File.createTempFile(
        "artwork_",
        ".tmp",
        cacheDirectory
      )

      temporaryFile = temp

      val success = temp.outputStream().use {
        resized.compress(
          Bitmap.CompressFormat.JPEG,
          JPEG_QUALITY,
          it
        )
      }

      if (!success) return null

      synchronized(cacheLock) {
        if (!outputFile.exists()) {
          if (!temp.renameTo(outputFile)) {
            return null
          }
        }

        outputFile.setLastModified(
          System.currentTimeMillis()
        )

        pruneCache(cacheDirectory)
      }

      return Uri.fromFile(outputFile).toString()

    } finally {
      temporaryFile?.delete()

      if (
        resizedBitmap != null &&
        resizedBitmap !== decodedBitmap
      ) {
        resizedBitmap.recycle()
      }

      decodedBitmap?.recycle()

      runCatching {
        retriever.release()
      }
    }
  }

  /* -------------------- IMAGE SAMPLING -------------------- */

  private fun calculateSampleSize(
    width: Int,
    height: Int,
    targetSize: Int
  ): Int {

    val largestDimension = max(width, height)

    var sampleSize = 1

    while (
      largestDimension / (sampleSize * 2) >=
      targetSize
    ) {
      sampleSize *= 2
    }

    return sampleSize
  }

  /* -------------------- IMAGE RESIZING -------------------- */

  private fun resizeBitmap(
    bitmap: Bitmap,
    targetSize: Int
  ): Bitmap {

    val largestDimension = max(
      bitmap.width,
      bitmap.height
    )

    if (largestDimension <= targetSize) {
      return bitmap
    }

    val scale = targetSize.toFloat() /
      largestDimension.toFloat()

    val width = max(
      1,
      (bitmap.width * scale).roundToInt()
    )

    val height = max(
      1,
      (bitmap.height * scale).roundToInt()
    )

    return Bitmap.createScaledBitmap(
      bitmap,
      width,
      height,
      true
    )
  }

  /* -------------------- CACHE PRUNING -------------------- */

  private fun pruneCache(
    directory: File
  ) {
    val now = System.currentTimeMillis()

    if (now - lastPruneTime < PRUNE_INTERVAL) {
      return
    }

    lastPruneTime = now

    val files = directory.listFiles()
      ?.filter {
        it.isFile && it.extension == "jpg"
      }
      ?.sortedBy {
        it.lastModified()
      }
      ?: return

    var totalBytes = files.sumOf {
      it.length()
    }

    var totalFiles = files.size

    for (file in files) {
      if (
        totalBytes <= MAX_CACHE_BYTES &&
        totalFiles <= MAX_CACHE_FILES
      ) {
        break
      }

      val length = file.length()

      if (file.delete()) {
        totalBytes -= length
        totalFiles--
      }
    }
  }
}