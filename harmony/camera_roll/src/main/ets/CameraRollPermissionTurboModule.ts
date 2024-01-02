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

import { TurboModule, TurboModuleContext } from 'rnoh/ts';
import abilityAccessCtrl, { Permissions } from '@ohos.abilityAccessCtrl';

type HarmonyAccessLevel = 'addOnly' | 'readWrite'
type CameraRollAuthorizationStatus = 'granted' | 'limited' | 'denied' | 'unavailable' | 'blocked' | 'not-determined';

export class CameraRollPermissionTurboModule extends TurboModule {
  private abilityAccessCtrl: abilityAccessCtrl.AtManager
  private tokenID: number // checkPermission 需要使用tokenID

  constructor(ctx: TurboModuleContext) {
    super(ctx)
    this.abilityAccessCtrl = abilityAccessCtrl.createAtManager()
  }

  checkPermission(content: string): Promise<CameraRollAuthorizationStatus> {
    // 需要应用tokenID，tokenID通过ApplicationInfo获得，获取ApplicationInfo的方法为系统接口
    return new Promise<CameraRollAuthorizationStatus>((resolve, reject) => {
      let permission: Permissions
      if (content == 'addOnly') {
        permission = 'ohos.permission.WRITE_IMAGEVIDEO'
      } else {
        permission = 'ohos.permission.READ_IMAGEVIDEO'
      }
      let status = this.abilityAccessCtrl.checkAccessTokenSync(this.tokenID, permission)
      if (status == abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED) {
        resolve('granted')
      } else {
        resolve('denied')
      }
    })
  }

  requestReadWritePermission(): Promise<CameraRollAuthorizationStatus> {
    return this.requestPermission(['ohos.permission.WRITE_IMAGEVIDEO'])
  }

  requestAddOnlyPermission(): Promise<CameraRollAuthorizationStatus> {
    return this.requestPermission(['ohos.permission.READ_IMAGEVIDEO'])
  }

  refreshPhotoSelection(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
    })
  }

  addListener(eventName: string): void {
  }

  removeListeners(count: number): void {
  }

  requestPermission(permissions: Array<Permissions>): Promise<CameraRollAuthorizationStatus> {
    let status: CameraRollAuthorizationStatus
    return new Promise<CameraRollAuthorizationStatus>((resolve, reject) => {
      this.abilityAccessCtrl.requestPermissionsFromUser(this.ctx.uiAbilityContext, permissions).then(result => {
        console.info(`result:${JSON.stringify(result)}`)
        let authResult = result.authResults[0]
        switch (authResult) {
          case -1:
            status = 'denied'
            break
          case 0:
            status = 'granted'
            break
          case 2:
            status = 'limited'
            break
          default:
            reject(`requestPermissionsFromUser failed , Permissions: ${JSON.stringify(permissions)}`)
        }
        resolve(status)
      }).catch(err => {
        console.error(`requestPermissions failed , errMsg: ${JSON.stringify(err)}`)
        resolve('not-determined')
      })
    })
  }
}