/**
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

#include "CameraRollPackge.h"

using namespace rnoh;
using namespace facebook;

static jsi::Value _hostFunction_CameraRollTurboModuleSpecJSI_saveToCameraRoll(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count)
{
    return static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, "saveToCameraRoll", args, count);
}

static jsi::Value _hostFunction_CameraRollTurboModuleSpecJSI_getPhotos(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count)
{
    return static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, "getPhotos", args, count);
}

static jsi::Value _hostFunction_CameraRollTurboModuleSpecJSI_getAlbums(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count)
{
    return static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, "getAlbums", args, count);
}

static jsi::Value _hostFunction_CameraRollTurboModuleSpecJSI_deletePhotos(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count)
{
    return static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, "deletePhotos", args, count);
}

static jsi::Value _hostFunction_CameraRollTurboModuleSpecJSI_getPhotoByInternalID(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count)
{
    return static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, "getPhotoByInternalID", args, count);
}

static jsi::Value _hostFunction_CameraRollTurboModuleSpecJSI_getPhotoThumbnail(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count)
{
    return static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, "getPhotoThumbnail", args, count);
}


CameraRollTurboModuleSpecJSI::CameraRollTurboModuleSpecJSI(
    const ArkTSTurboModule::Context ctx, 
    const std::string name) : ArkTSTurboModule(ctx, name)
{
    methodMap_["saveToCameraRoll"] = 
        MethodMetadata{2, _hostFunction_CameraRollTurboModuleSpecJSI_saveToCameraRoll};
    methodMap_["getPhotos"] = 
        MethodMetadata{1, _hostFunction_CameraRollTurboModuleSpecJSI_getPhotos};
    methodMap_["getAlbums"] = 
        MethodMetadata{1, _hostFunction_CameraRollTurboModuleSpecJSI_getAlbums};
    methodMap_["deletePhotos"] = 
        MethodMetadata{2, _hostFunction_CameraRollTurboModuleSpecJSI_deletePhotos};
    methodMap_["getPhotoByInternalID"] = 
        MethodMetadata{2, _hostFunction_CameraRollTurboModuleSpecJSI_getPhotoByInternalID};
    methodMap_["getPhotoThumbnail"] = 
        MethodMetadata{1, _hostFunction_CameraRollTurboModuleSpecJSI_getPhotoThumbnail};
}