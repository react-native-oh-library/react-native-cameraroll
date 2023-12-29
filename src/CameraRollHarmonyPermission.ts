import { NativeEventEmitter, Platform } from 'react-native';
import CameraRollPermissionModule from '@react-native-camera-roll/camera-roll/src/NativeCameraRollPermissionModule';
import type { CameraRollAuthorizationStatus } from '@react-native-camera-roll/camera-roll/src/CameraRollIOSPermission';


export type HarmonyAccessLevel = 'addOnly' | 'readWrite';

//@ts-ignore
const isHarmony = Platform.OS === 'harmony';
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (isHarmony && CameraRollPermissionModule == null) {
    console.error(
        "photoLibraryPermissionModule: Native Module 'photoLibraryPermissionModule' was null! Did you run pod install?",
    );
}
export const harmonyCameraRollEventEmitter = new NativeEventEmitter(
    isHarmony ? CameraRollPermissionModule : undefined,
);

export const harmonyReadGalleryPermission = (
    accessLevel: HarmonyAccessLevel,
): Promise<CameraRollAuthorizationStatus> => {
    if (!isHarmony) throw new Error('this module is available only for harmony');

    return CameraRollPermissionModule.checkPermission(accessLevel);
};

export const harmonyRequestReadWriteGalleryPermission =
    (): Promise<CameraRollAuthorizationStatus> => {
        if (!isHarmony) throw new Error('this module is available only for harmony');

        return CameraRollPermissionModule.requestReadWritePermission();
    };

export const harmonyRequestAddOnlyGalleryPermission =
    (): Promise<CameraRollAuthorizationStatus> => {
        if (!isHarmony) throw new Error('this module is available only for harmony');

        return CameraRollPermissionModule.requestAddOnlyPermission();
    };

export const harmonyRefreshGallerySelection = (): Promise<boolean> => {
    if (!isHarmony) throw new Error('this module is available only for harmony');

    return CameraRollPermissionModule.refreshPhotoSelection();
};
