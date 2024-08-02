export type GetPhotosParams = {
  first: number;
  after?: string;
  groupTypes?: GroupTypes;
  groupName?: string;
  includeSharedAlbums?: boolean;
  assetType?: AssetType;
  fromTime?: number;
  toTime?: number;
  mimeTypes?: Array<string>;
  include?: Include[];
};

export enum SaveToCameraRollOptionsTypeMenu {
  video = 'video',
  photo = 'photo',
}

export type SaveToCameraRollOptions = {
  type?: SaveToCameraRollOptionsTypeMenu;
  album?: string;
};



export type GetAlbumsParams = {
  assetType?: AssetType;
};

export type AssetType = 'All' | 'Videos' | 'Photos';

export type AlbumSubType =
  | 'AlbumRegular'
  | 'AlbumSyncedEvent'
  | 'AlbumSyncedFaces'
  | 'AlbumSyncedAlbum'
  | 'AlbumImported'
  | 'AlbumMyPhotoStream'
  | 'AlbumCloudShared'
  | 'Unknown';

export type GroupTypes =
  | 'Album'
  | 'All'
  | 'Event'
  | 'Faces'
  | 'Library'
  | 'PhotoStream'
  | 'SavedPhotos';

export type Album = {
  title: string;
  count: number;
  subtype?: AlbumSubType;
};

export type SubTypes =
  | 'PhotoPanorama'
  | 'PhotoHDR'
  | 'PhotoScreenshot'
  | 'PhotoLive'
  | 'PhotoDepthEffect'
  | 'VideoStreamed'
  | 'VideoHighFrameRate'
  | 'VideoTimelapse';

export type Include =
  | 'filename'
  | 'fileSize'
  | 'fileExtension'
  | 'location'
  | 'imageSize'
  | 'playableDuration'
  | 'orientation';

export type PhotoIdentifier = {
  node: {
    type: string;
    subTypes?: SubTypes;
    group_name?: string;
    image: {
      filename: string | null;
      filepath: string | null;
      extension: string | null;
      uri: string;
      height: number;
      width: number;
      fileSize: number | null;
      playableDuration: number;
      orientation: number | null;
    };
    timestamp: number;
    modificationTimestamp: number;
    location: {
      latitude?: number;
      longitude?: number;
      altitude?: number;
      heading?: number;
      speed?: number;
    } | null;
  };
};

export type PhotoIdentifiersPage = {
  edges: Array<PhotoIdentifier>;
  page_info: {
    has_next_page: boolean;
    start_cursor?: string;
    end_cursor?: string;
  };
  limited?: boolean;
};

export type PhotoConvertionOptions = {
  convertHeicImages?: boolean;
  quality?: number
};

export type PhotoThumbnailOptions = {
  allowNetworkAccess: boolean,  //iOS only
  targetSize: {
    height: number,
    width: number
  },
  quality: number
};

export type PhotoThumbnail = {
  thumbnailBase64: string
};