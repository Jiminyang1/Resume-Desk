const PROFILE_PHOTO_DATABASE_NAME = "open-resume-plus-assets";
const PROFILE_PHOTO_STORE_NAME = "profile-photos";
const PROFILE_PHOTO_DATABASE_VERSION = 1;
const PROFILE_PHOTO_SIZE_PX = 512;

export interface ProfilePhotoAsset {
  id: string;
  dataUrl: string;
  updatedAt: string;
}

const createAssetId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const openProfilePhotoDatabase = async () => {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB is not available in this environment");
  }

  return await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(
      PROFILE_PHOTO_DATABASE_NAME,
      PROFILE_PHOTO_DATABASE_VERSION
    );

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PROFILE_PHOTO_STORE_NAME)) {
        database.createObjectStore(PROFILE_PHOTO_STORE_NAME, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const runStoreRequest = async <T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest
) => {
  const database = await openProfilePhotoDatabase();

  return await new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(PROFILE_PHOTO_STORE_NAME, mode);
    const store = transaction.objectStore(PROFILE_PHOTO_STORE_NAME);
    const request = callback(store);

    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
};

export const getProfilePhotoAsset = async (photoAssetId?: string | null) => {
  if (!photoAssetId || typeof indexedDB === "undefined") {
    return null;
  }

  try {
    return await runStoreRequest<ProfilePhotoAsset | undefined>(
      "readonly",
      (store) => store.get(photoAssetId)
    );
  } catch {
    return null;
  }
};

export const saveProfilePhotoAsset = async (dataUrl: string) => {
  if (typeof indexedDB === "undefined") {
    return null;
  }

  const asset: ProfilePhotoAsset = {
    id: createAssetId(),
    dataUrl,
    updatedAt: new Date().toISOString(),
  };

  try {
    await runStoreRequest<IDBValidKey>("readwrite", (store) => store.put(asset));
    return asset;
  } catch {
    return null;
  }
};

export const deleteProfilePhotoAsset = async (photoAssetId?: string | null) => {
  if (!photoAssetId || typeof indexedDB === "undefined") {
    return;
  }

  try {
    await runStoreRequest<undefined>("readwrite", (store) =>
      store.delete(photoAssetId)
    );
  } catch {
    // Ignore delete failures.
  }
};

export const cloneProfilePhotoAsset = async (photoAssetId?: string | null) => {
  const existingAsset = await getProfilePhotoAsset(photoAssetId);
  if (!existingAsset) return null;

  const clonedAsset = await saveProfilePhotoAsset(existingAsset.dataUrl);
  return clonedAsset?.id ?? null;
};

const loadImageFromFile = async (file: File) => {
  const objectUrl = URL.createObjectURL(file);

  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Failed to load image"));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const resizeProfilePhotoFile = async (file: File) => {
  const image = await loadImageFromFile(file);
  const cropSize = Math.min(image.width, image.height);
  const sourceX = Math.max(0, (image.width - cropSize) / 2);
  const sourceY = Math.max(0, (image.height - cropSize) / 2);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available");
  }

  canvas.width = PROFILE_PHOTO_SIZE_PX;
  canvas.height = PROFILE_PHOTO_SIZE_PX;
  context.drawImage(
    image,
    sourceX,
    sourceY,
    cropSize,
    cropSize,
    0,
    0,
    PROFILE_PHOTO_SIZE_PX,
    PROFILE_PHOTO_SIZE_PX
  );

  const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
  return canvas.toDataURL(mimeType, mimeType === "image/jpeg" ? 0.88 : 1);
};

export const storeProfilePhotoFile = async (file: File) => {
  const resizedImage = await resizeProfilePhotoFile(file);
  return await saveProfilePhotoAsset(resizedImage);
};
