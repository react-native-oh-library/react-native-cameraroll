/*
 * MIT License
 *
 * Copyright (C) 2023 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { TurboModule, TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { TM } from '@rnoh/react-native-openharmony/generated/ts';
import {
  Album,
  PhotoThumbnail,
  GetPhotosParams,
  PhotoIdentifier,
  GetAlbumsParams,
  PhotoIdentifiersPage,
  PhotoConvertionOptions,
  PhotoThumbnailOptions,
  SaveToCameraRollOptions,
  SaveToCameraRollOptionsTypeMenu
} from './CameraRollParamTypes';
import photoAccessHelper from '@ohos.file.photoAccessHelper';
import dataSharePredicates from '@ohos.data.dataSharePredicates';
import util from '@ohos.util';
import image from '@ohos.multimedia.image';
import { request } from '@kit.BasicServicesKit';
import fs from '@ohos.file.fs';
import { Context } from '@kit.AbilityKit';
import { fileUri } from '@kit.CoreFileKit';
import Logger from './Logger';

const ASSET_TYPE_PHOTOS = 'Photos';
const ASSET_TYPE_VIDEOS = 'Videos';
const ASSET_TYPE_ALL = 'All';
const ResourceType = 'internet';

export class CameraRollTurboModule extends TurboModule implements TM.RNCCameraRoll.Spec {
  private phAccessHelper: photoAccessHelper.PhotoAccessHelper;
  private context: Context = getContext(this);

  constructor(ctx: TurboModuleContext) {
    super(ctx);
    this.phAccessHelper = photoAccessHelper.getPhotoAccessHelper(this.ctx.uiAbilityContext);
  }

  async saveToDevice(saveUri: string, options: SaveToCameraRollOptions,
    resourceType: string): Promise<PhotoIdentifier> {
    let photoCreationConfigs: Array<photoAccessHelper.PhotoCreationConfig> = [
      {
        title: saveUri.substring(saveUri.lastIndexOf('/') + 1, saveUri.lastIndexOf('.')),
        fileNameExtension: saveUri.substring(saveUri.lastIndexOf('.') + 1),
        photoType: options.type === SaveToCameraRollOptionsTypeMenu.photo ? photoAccessHelper.PhotoType.IMAGE :
        photoAccessHelper.PhotoType.VIDEO,
        subtype: photoAccessHelper.PhotoSubtype.DEFAULT
      }
    ];
    let saveUris: string[] =
      await this.phAccessHelper.showAssetsCreationDialog([fileUri.getUriFromPath(saveUri)], photoCreationConfigs);
    if (saveUris.length) {
      let stat = fs.statSync(saveUri);
      let file = fs.openSync(saveUri, fs.OpenMode.READ_ONLY);
      let buffer = new ArrayBuffer(stat.size);
      fs.readSync(file.fd, buffer);
      let media_file = fs.openSync(saveUris[0], fs.OpenMode.READ_WRITE);
      fs.writeSync(media_file.fd, buffer);
      fs.closeSync(file);
      if (resourceType) {
        fs.unlinkSync(saveUri);
      }
      fs.closeSync(media_file);
      let result: PhotoIdentifier = {
        node: {
          id: '',
          type: options.type ?? '',
          subTypes: 'PhotoPanorama',
          sourceType: 'UserLibrary',
          group_name: [],
          image: {
            filename: photoCreationConfigs[0].title ?? null,
            filepath: null,
            extension: photoCreationConfigs[0].fileNameExtension ?? null,
            uri: saveUris[0],
            height: 0,
            width: 0,
            fileSize: stat.size,
            playableDuration: 0,
            orientation: null
          },
          timestamp: 0,
          modificationTimestamp: 0,
          location: null
        }
      };
      return result;
    } else {
      if (resourceType) {
        fs.unlinkSync(saveUri);
      }
    }
  }

  saveToCameraRoll(uri: string, options: SaveToCameraRollOptions): Promise<PhotoIdentifier> {
    return new Promise<PhotoIdentifier>(async (resolve, reject) => {
      if (!uri) {
        Logger.error(`Incorrect path.${uri}`);
        reject('Incorrect path.');
      }
      if (uri.startsWith('http') || uri.startsWith('https')) {
        try {
          let sandBoxPath: string = await this.DownloadResources(uri);
          if (sandBoxPath) {
            let saveData: PhotoIdentifier = await this.saveToDevice(sandBoxPath, options, ResourceType);
            resolve(saveData);
          }
        } catch (err) {
          reject(err);
        }
      } else {
        try {
          let saveData: PhotoIdentifier = await this.saveToDevice(uri, options, '');
          resolve(saveData);
        } catch (err) {
          Logger.error(`Failed to save, errorCode: ${err.code}`);
          reject(err);
        }
      }
    })
  }

  getPhotos(params: GetPhotosParams): Promise<PhotoIdentifiersPage> {
    return new Promise<PhotoIdentifiersPage>((resolve, reject) => {
      let first = params.first;
      let after = params.after;
      let groupTypes = params.groupTypes;
      let groupName = params.groupName;
      let includeSharedAlbums = params.includeSharedAlbums;
      let assetType = params.assetType;
      let fromTime = params.fromTime;
      let toTime = params.toTime;
      let mimeTypes = params.mimeTypes;
      let include = params.include;

      let queryBegin = parseInt(this.isEmpty(after) ? '0' : after);
      let predicates = new dataSharePredicates.DataSharePredicates();
      predicates.in('media_type', mimeTypes);
      predicates.limit(first + 1, queryBegin);
      predicates.orderByDesc('date_added').orderByDesc('date_modified');
      let fetchOptions: photoAccessHelper.FetchOptions = {
        fetchColumns: [
          photoAccessHelper.PhotoKeys.URI,
          photoAccessHelper.PhotoKeys.PHOTO_TYPE,
          photoAccessHelper.PhotoKeys.DISPLAY_NAME,
          photoAccessHelper.PhotoKeys.SIZE,
          photoAccessHelper.PhotoKeys.DATE_ADDED,
          photoAccessHelper.PhotoKeys.DATE_MODIFIED,
          photoAccessHelper.PhotoKeys.DURATION,
          photoAccessHelper.PhotoKeys.WIDTH,
          photoAccessHelper.PhotoKeys.HEIGHT,
          photoAccessHelper.PhotoKeys.ORIENTATION,
          photoAccessHelper.PhotoKeys.DATE_TAKEN,
          photoAccessHelper.PhotoKeys.FAVORITE,
          photoAccessHelper.PhotoKeys.TITLE],
        predicates: predicates
      };
      this.phAccessHelper.getAssets(fetchOptions).then((fetchResult) => {
        if (fetchResult !== undefined) {
          fetchResult.getAllObjects().then((photoAssets) => {
            if (photoAssets !== undefined && photoAssets.length != 0) {
              let has_next_page: boolean = first < photoAssets.length;
              let pageInfo: {
                has_next_page: boolean;
                start_cursor?: string;
                end_cursor?: string;
              } = {
                has_next_page: has_next_page,
                end_cursor: has_next_page ? (queryBegin + first).toString() : ''
              }
              let photos: Array<PhotoIdentifier> = new Array<PhotoIdentifier>();
              photoAssets.forEach(photoAsset => {
                let type: string = photoAsset.photoType == 1 ? 'IMAGE' : 'VIDEO'
                let photo: PhotoIdentifier = {
                  node: {
                    id: '',
                    type: type,
                    subTypes: 'PhotoPanorama',
                    sourceType: 'UserLibrary',
                    group_name: [],
                    image: {
                      filename: photoAsset.displayName,
                      filepath: null,
                      extension: null,
                      uri: photoAsset.uri,
                      height: parseInt(photoAsset.get(photoAccessHelper.PhotoKeys.HEIGHT).toString()),
                      width: parseInt(photoAsset.get(photoAccessHelper.PhotoKeys.WIDTH).toString()),
                      fileSize: parseInt(photoAsset.get(photoAccessHelper.PhotoKeys.SIZE).toString()),
                      playableDuration: parseInt(photoAsset.get(photoAccessHelper.PhotoKeys.DURATION).toString()),
                      orientation: parseInt(photoAsset.get(photoAccessHelper.PhotoKeys.ORIENTATION).toString())
                    },
                    timestamp: parseInt(photoAsset.get(photoAccessHelper.PhotoKeys.DATE_ADDED).toString()),
                    modificationTimestamp: parseInt(photoAsset.get(photoAccessHelper.PhotoKeys.DATE_MODIFIED)
                      .toString()),
                    location: null
                  }
                }
                photos.push(photo);
              })
              let resulPage: PhotoIdentifiersPage = {
                edges: photos,
                page_info: pageInfo,
              }
              resolve(resulPage);
            }
          })
        }
      }).catch(err => {
        Logger.error('getPhotos failed with err: ' + err);
      })
    })
  }

  getAlbums(params: GetAlbumsParams): Promise<Album[]> {
    return new Promise<Album[]>((resolve, reject) => {
      let albumSubtype;
      if (ASSET_TYPE_PHOTOS == params.assetType) {
        albumSubtype = photoAccessHelper.AlbumSubtype.USER_GENERIC;
      } else if (ASSET_TYPE_VIDEOS == params.assetType) {
        albumSubtype = photoAccessHelper.AlbumSubtype.VIDEO;
      } else if (ASSET_TYPE_ALL == params.assetType) {
        albumSubtype = photoAccessHelper.AlbumSubtype.ANY;
      }
      this.phAccessHelper.getAlbums(photoAccessHelper.AlbumType.USER, albumSubtype).then(result => {
        let resultAlbums: Album[] = new Array();
        result.getAllObjects().then(albums => {
          albums.forEach(album => {
            resultAlbums.push({
              title: album.albumName,
              count: album.count,
              id: '',
              type: 'All'
            })
          })
          resolve(resultAlbums);
        })
      }).catch((err: Error) => {
        Logger.error('getAlbums failed with err: ' + err);
        reject(`Could not get media, ${JSON.stringify(err)}`)
      })
    })
  }

  deletePhotos(photoUris: Array<string>): Promise<void> {
    // this.phAccessHelper.deleteAssets 为系统接口
    return new Promise<void>((resolve, reject) => {
    })
  }

  getPhotoByInternalID(internalID: string, options: PhotoConvertionOptions): Promise<PhotoIdentifier> {
    // internalID  IOS特有
    return new Promise<PhotoIdentifier>((resolve, reject) => {
      this.getPhotoByUri(internalID).then(photoAsset => {
        let type: string = photoAsset.photoType == 1 ? 'IMAGE' : 'VIDEO'
        let photo: PhotoIdentifier = {
          node: {
            id: '',
            type: type,
            subTypes: 'PhotoPanorama',
            sourceType: 'UserLibrary',
            group_name: [],
            image: {
              filename: photoAsset.displayName,
              filepath: null,
              extension: null,
              uri: photoAsset.uri,
              height: parseInt(photoAsset.get(photoAccessHelper.PhotoKeys.HEIGHT).toString()),
              width: parseInt(photoAsset.get(photoAccessHelper.PhotoKeys.WIDTH).toString()),
              fileSize: parseInt(photoAsset.get(photoAccessHelper.PhotoKeys.SIZE).toString()),
              playableDuration: parseInt(photoAsset.get(photoAccessHelper.PhotoKeys.DURATION).toString()),
              orientation: parseInt(photoAsset.get(photoAccessHelper.PhotoKeys.ORIENTATION).toString()),
            },
            timestamp: parseInt(photoAsset.get(photoAccessHelper.PhotoKeys.DATE_ADDED).toString()),
            modificationTimestamp: parseInt(photoAsset.get(photoAccessHelper.PhotoKeys.DATE_MODIFIED).toString()),
            location: null
          }
        }
        resolve(photo);
      })
    })
  }

  getPhotoThumbnail(internalID: string, options: PhotoThumbnailOptions): Promise<PhotoThumbnail> {
    // internalID  IOS特有
    return new Promise<PhotoThumbnail>((resolve, reject) => {
      this.getPhotoByUri(internalID).then(photoAsset => {
        photoAsset.getThumbnail({ height: options.targetSize.height, width: options.targetSize.width }).then(pixMap => {
          var base64 = new util.Base64Helper();
          let packOpts: image.PackingOption = {
            format: 'image/jpeg', quality: options.quality * 100
          }
          let imagePackerApi = image.createImagePacker();
          imagePackerApi.packing(pixMap, packOpts).then(arrayBuffer => {
            base64.encodeToString(new Uint8Array(arrayBuffer)).then(base64String => {
              resolve({ thumbnailBase64: base64String });
            })
          })
        })
      })
    })
  }

  isEmpty(str: string): boolean {
    if (str === null || str === undefined || str.trim().length === 0) {
      return true;
    }
    return false;
  }

  getPhotoByUri(uri: string): Promise<photoAccessHelper.PhotoAsset> {
    return new Promise<photoAccessHelper.PhotoAsset>((resolve, reject) => {
      let predicates = new dataSharePredicates.DataSharePredicates();
      predicates.equalTo('uri', uri);
      let fetchOptions: photoAccessHelper.FetchOptions = {
        fetchColumns: [
          photoAccessHelper.PhotoKeys.URI,
          photoAccessHelper.PhotoKeys.PHOTO_TYPE,
          photoAccessHelper.PhotoKeys.DISPLAY_NAME,
          photoAccessHelper.PhotoKeys.SIZE,
          photoAccessHelper.PhotoKeys.DATE_ADDED,
          photoAccessHelper.PhotoKeys.DATE_MODIFIED,
          photoAccessHelper.PhotoKeys.DURATION,
          photoAccessHelper.PhotoKeys.WIDTH,
          photoAccessHelper.PhotoKeys.HEIGHT,
          photoAccessHelper.PhotoKeys.ORIENTATION,
          photoAccessHelper.PhotoKeys.DATE_TAKEN,
          photoAccessHelper.PhotoKeys.FAVORITE,
          photoAccessHelper.PhotoKeys.TITLE],
        predicates: predicates
      };
      this.phAccessHelper.getAssets(fetchOptions).then((fetchResult) => {
        fetchResult.getFirstObject().then(photoAsset => {
          resolve(photoAsset);
        })
      })
    })
  }

  DownloadResources(saveUri): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      try {
        let downloadTask: request.DownloadTask = await request.downloadFile(this.context, { url: saveUri });
        downloadTask.on('complete', async () => {
          try {
            let downloadInfo: request.DownloadInfo = await downloadTask.getTaskInfo();
            resolve(downloadInfo.filePath);
          } catch (err) {
            Logger.error(`Failed to get downloadInfo. Code: ${err.code}, message: ${err.message}`);
          } finally {
            downloadTask.off('complete');
          }
        })
      } catch (err) {
        Logger.error(`Failed to request the download. Code: ${err.code}, message: ${err.message}`);
        reject(err);
      }
    })
  }

  addListener(eventName: string): void {
  }

  removeListeners(count: number): void {
  }

  getNowTime(): string {
    let date = new Date();
    let year = date.getFullYear().toString();
    let month = date.getMonth() + 1;
    let day = date.getDay();
    let hours = date.getHours().toString();
    let minutes = date.getMinutes().toString();
    let seconds = date.getSeconds().toString();
    let milliseconds = date.getMilliseconds().toString();
    return year + (month > 10 ? month : '0' + month) + (day > 10 ? day : '0' + day) + hours + minutes + seconds +
      milliseconds;
  }
}