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

import android.content.ContentValues
import android.os.Environment
import android.provider.OpenableColumns
import android.media.MediaScannerConnection
import android.webkit.MimeTypeMap
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

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

/* -------------------- EXTERNAL AUDIO -------------------- */

private fun getAudioFileInfo(
    context: Context,
    uri: Uri
): Map<String, Any> {

    val result = mutableMapOf<String, Any>()

    var filename = uri.lastPathSegment
        ?.substringAfterLast('/')
        ?: "Unknown Audio"

    var size = 0L

    if (uri.scheme == "content") {
        context.contentResolver.query(
            uri,
            arrayOf(
                OpenableColumns.DISPLAY_NAME,
                OpenableColumns.SIZE
            ),
            null,
            null,
            null
        )?.use { cursor ->

           if (cursor.moveToFirst()) {
                val nameIndex = cursor.getColumnIndex(
                    OpenableColumns.DISPLAY_NAME
                )

                val sizeIndex = cursor.getColumnIndex(
                    OpenableColumns.SIZE
                )

                if (nameIndex >= 0) {
                    filename = cursor.getString(nameIndex)
                        ?: filename
                }

                if (sizeIndex >= 0 && !cursor.isNull(sizeIndex)) {
                    size = cursor.getLong(sizeIndex)
                }
            }
        }
    } else if (uri.scheme == "file") {
        val file = File(requireNotNull(uri.path))

        filename = file.name
        size = file.length()
    }

    val extension = filename
        .substringAfterLast('.', "")
        .lowercase()

    val detectedMimeType = context.contentResolver.getType(uri)

 val mimeType = detectedMimeType
        ?.takeIf { it.startsWith("audio/") }
        ?: MimeTypeMap.getSingleton()
            .getMimeTypeFromExtension(extension)
        ?: "application/octet-stream"

    result["uri"] = uri.toString()
    result["filename"] = filename
    result["size"] = size
    result["mimeType"] = mimeType

    return result
}

  /* -------------------- MODULE DEFINITION -------------------- */

  override fun definition() = ModuleDefinition {
    Name("MusicArtwork")

    AsyncFunction("consumePendingAudioUris") {
    val activity = appContext.currentActivity

    if (activity == null) {
        emptyList<String>()
    } else {
        val method = activity.javaClass.getMethod("consumePendingAudioUris")

        @Suppress("UNCHECKED_CAST")
        (method.invoke(null) as? List<String>) ?: emptyList<String>()
    }
}

AsyncFunction("getAudioFileInfo") { uri: String -> val context = requireNotNull(appContext.reactContext)

    getAudioFileInfo(context, Uri.parse(uri))
}

AsyncFunction("importAudioFile") { uri: String -> val context = requireNotNull(appContext.reactContext)

    importAudioFile(context, Uri.parse(uri))
}

    AsyncFunction("getMetadata") { uri: String -> val context = requireNotNull(appContext.reactContext)
  extractMetadata(context, uri)
}

 AsyncFunction("getMusicFolders") {
      val context = requireNotNull(appContext.reactContext)
      getMusicFolders(context)
    }

    AsyncFunction("getArtwork") {
      uri: String, size: Int, version: String -> val context = requireNotNull(appContext.reactContext)
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

    /* -------------------- AUDIO METADATA -------------------- */

  private fun extractMetadata(
    context: Context,
    uri: String
  ): Map<String, Any> {

    val retriever = MediaMetadataRetriever()
    val metadata = mutableMapOf<String, Any>()

    try {
      retriever.setDataSource(
        context,
        Uri.parse(uri)
      )

      fun read(key: Int): String? {
        return retriever.extractMetadata(key)
          ?.trim()
          ?.takeIf { it.isNotEmpty() }
      }

      val textFields = mapOf(
        "title" to MediaMetadataRetriever.METADATA_KEY_TITLE,
        "artist" to MediaMetadataRetriever.METADATA_KEY_ARTIST,
        "album" to MediaMetadataRetriever.METADATA_KEY_ALBUM,
        "albumArtist" to MediaMetadataRetriever.METADATA_KEY_ALBUMARTIST,
        "genre" to MediaMetadataRetriever.METADATA_KEY_GENRE,
        "composer" to MediaMetadataRetriever.METADATA_KEY_COMPOSER,
        "mimeType" to MediaMetadataRetriever.METADATA_KEY_MIMETYPE
      )

      for ((name, key) in textFields) {
        read(key)?.let {
          metadata[name] = it
        }
      }

      val year = parseYear(
        read(MediaMetadataRetriever.METADATA_KEY_YEAR)
          ?: read(MediaMetadataRetriever.METADATA_KEY_DATE)
      )

      year?.let {
        metadata["year"] = it
      }

      parseNumber(
        read(MediaMetadataRetriever.METADATA_KEY_CD_TRACK_NUMBER)
      )?.let {
        metadata["trackNumber"] = it
      }

      parseNumber(
        read(MediaMetadataRetriever.METADATA_KEY_DISC_NUMBER)
      )?.let {
        metadata["discNumber"] = it
      }

      read(
        MediaMetadataRetriever.METADATA_KEY_DURATION
      )?.toLongOrNull()?.let {
        if (it > 0L) {
          metadata["duration"] = it / 1000.0
        }
      }

     read(
        MediaMetadataRetriever.METADATA_KEY_BITRATE
      )?.toIntOrNull()?.let {
        metadata["bitrate"] = it
      }

    } catch (error: Exception) {
      android.util.Log.w(
        "MusicArtwork",
        "Unable to extract audio metadata",
        error
      )
    } finally {
      runCatching {
        retriever.release()
      }
    }

    return metadata
  }

  private fun parseNumber(value: String?): Int? {
    return value
      ?.substringBefore("/")
      ?.trim()
      ?.toIntOrNull()
      ?.takeIf { it > 0 }
  }

  private fun parseYear(value: String?): Int? {
    if (value.isNullOrBlank()) return null

    return Regex("""\d{4}""")
      .find(value)
      ?.value
      ?.toIntOrNull()
      ?.takeIf { it in 1000..9999 }
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

  /* -------------------- IMPORT MUSIC FILES -------------------- */

private fun importAudioFile(
    context: Context,
    source: Uri
): Map<String, Any> {

    require(
        source.scheme == "content" ||
        source.scheme == "file"
    ) {
        "Unsupported audio URI"
    }

    val resolver = context.contentResolver
    val info = getAudioFileInfo(context, source)

    val filename = (info["filename"] as String)
        .replace(Regex("""[\\/:*?"<>|]"""), "_")
        .trim()
        .takeIf { it.isNotBlank() && it != "." && it != ".." }
        ?: "Imported Audio"

    val mimeType = info["mimeType"] as String

    require(mimeType.startsWith("audio/")) {
        "Unsupported audio file type"
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {

        val values = ContentValues().apply {
            put(
                MediaStore.Audio.Media.DISPLAY_NAME,
                filename
            )

            put(
                MediaStore.Audio.Media.MIME_TYPE,
                mimeType
            )

            put(
                MediaStore.Audio.Media.RELATIVE_PATH,
                "${Environment.DIRECTORY_MUSIC}/Music Player/"
            )

            put(
                MediaStore.Audio.Media.IS_PENDING,
                1
            )

            put(
                MediaStore.Audio.Media.IS_MUSIC,
                1
            )
        }

        val collection = MediaStore.Audio.Media.getContentUri(
            MediaStore.VOLUME_EXTERNAL_PRIMARY
        )

      val destination = resolver.insert(
            collection,
            values
        ) ?: error("Unable to create audio file")

        try {
            val input = resolver.openInputStream(source)
                ?: error("Unable to read audio file")

            input.use { sourceStream ->
                val output = resolver.openOutputStream(destination)
                    ?: error("Unable to write audio file")

                output.use { destinationStream ->
                    sourceStream.copyTo(destinationStream)
                }
            }

            val completed = ContentValues().apply {
                put(MediaStore.Audio.Media.IS_PENDING, 0)
            }

            resolver.update(destination, completed, null, null)

   return getAudioFileInfo(context, destination)

        } catch (error: Exception) {
            resolver.delete(destination, null, null)
            throw error
        }
    }

    // Android 9 and earlier.
    @Suppress("DEPRECATION")
    val musicDirectory = Environment
        .getExternalStoragePublicDirectory(Environment.DIRECTORY_MUSIC)

    val directory = File(musicDirectory, "Music Player")

    if (!directory.exists() && !directory.mkdirs()) {
        error("Unable to create music directory")
    }

    var destination = File(directory, filename)

    val extension = filename.substringAfterLast('.', "")
    val basename = filename.substringBeforeLast('.')

    var index = 1

    while (destination.exists()) {
        val suffix = if (extension.isBlank()) {
            ""
        } else {
            ".$extension"
        }

        destination = File(directory, "$basename ($index)$suffix")

        index++
    }

    try {
        val input = resolver.openInputStream(source) ?: error("Unable to read audio file")

        input.use { sourceStream -> destination.outputStream().use { output -> sourceStream.copyTo(output)
            }
        }

               val latch = CountDownLatch(1)
        var scannedUri: Uri? = null

        MediaScannerConnection.scanFile(
            context,
            arrayOf(destination.absolutePath),
            arrayOf(mimeType)
        ) { _, uri ->
            scannedUri = uri
            latch.countDown()
        }

        latch.await(10, TimeUnit.SECONDS)

        return getAudioFileInfo(
            context,
            scannedUri ?: Uri.fromFile(destination)
        )

    } catch (error: Exception) {
        destination.delete()
        throw error
    }
  }
}