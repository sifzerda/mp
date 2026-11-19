// C:\mp\modules\music-artwork\index.d.ts

export interface MusicMetadata {
  title?: string;
  artist?: string;
  album?: string;
  albumArtist?: string;
  year?: number;
  trackNumber?: number;
  discNumber?: number;
  genre?: string;
  composer?: string;
  bitrate?: number;
  mimeType?: string;
  duration?: number;
}

export interface MusicFolder {
  folderId: string;
  folderName: string;
  folderPath: string;
  folderVolume: string;
}

export interface MusicArtworkModule {
  getArtwork(
    uri: string,
    size?: number,
    version?: string
  ): Promise<string | null>;

  getMetadata(
    uri: string
  ): Promise<MusicMetadata>;

  getMusicFolders(): Promise<
    Record<string, MusicFolder>
  >;

  clearCache(): Promise<void>;
}

declare const MusicArtwork: MusicArtworkModule;

export default MusicArtwork;