"use client";

import { useEffect, useState } from "react";
import { getProfilePhotoAsset } from "lib/profile-photo-storage";

export const useProfilePhotoDataUrl = (photoAssetId?: string | null) => {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPhotoAsset = async () => {
      if (!photoAssetId) {
        if (isMounted) setPhotoDataUrl(null);
        return;
      }

      if (isMounted) {
        setPhotoDataUrl(null);
      }

      const asset = await getProfilePhotoAsset(photoAssetId);
      if (isMounted) {
        setPhotoDataUrl(asset?.dataUrl ?? null);
      }
    };

    loadPhotoAsset();

    return () => {
      isMounted = false;
    };
  }, [photoAssetId]);

  return photoDataUrl;
};
