import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CameraIcon,
  PlusSmallIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { BaseForm } from "components/ResumeForm/Form";
import { Input, Textarea } from "components/ResumeForm/Form/InputGroup";
import { useTranslation } from "components/AppPreferencesProvider";
import { getProfilePhotoAsset, storeProfilePhotoFile } from "lib/profile-photo-storage";
import {
  addProfileExtraDetail,
  changeProfile,
  changeProfileExtraDetail,
  deleteProfileExtraDetail,
  selectProfile,
} from "lib/redux/resumeSlice";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { type ResumeProfile } from "lib/redux/types";

export const ProfileForm = () => {
  const copy = useTranslation();
  const profile = useAppSelector(selectProfile);
  const dispatch = useAppDispatch();
  const {
    name,
    email,
    phone,
    url,
    summary,
    location,
    photoAssetId,
    extraDetails,
  } = profile;
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPhotoPreview = async () => {
      if (!photoAssetId) {
        if (isMounted) setPhotoPreviewUrl(null);
        return;
      }

      const asset = await getProfilePhotoAsset(photoAssetId);
      if (isMounted) {
        setPhotoPreviewUrl(asset?.dataUrl ?? null);
      }
    };

    loadPhotoPreview();

    return () => {
      isMounted = false;
    };
  }, [photoAssetId]);

  const handleProfileChange = (
    field: Exclude<keyof ResumeProfile, "photoAssetId" | "extraDetails">,
    value: string
  ) => {
    dispatch(changeProfile({ field, value }));
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    try {
      setIsUploadingPhoto(true);
      const asset = await storeProfilePhotoFile(nextFile);
      if (!asset) return;

      dispatch(changeProfile({ field: "photoAssetId", value: asset.id }));
      setPhotoPreviewUrl(asset.dataUrl);
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = "";
    }
  };

  const handleRemovePhoto = () => {
    dispatch(changeProfile({ field: "photoAssetId", value: null }));
    setPhotoPreviewUrl(null);
  };

  return (
    <BaseForm>
      <div className="grid grid-cols-6 gap-2.5">
        <div className="col-span-full border border-slate-300 bg-stone-50 p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden border border-slate-300 bg-white">
                {photoPreviewUrl ? (
                  <Image
                    src={photoPreviewUrl}
                    alt={copy.forms.profile.photo}
                    width={64}
                    height={64}
                    unoptimized={true}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <CameraIcon
                    className="h-7 w-7 text-slate-300"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">
                  {copy.forms.profile.photo}
                </div>
                <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                  {copy.forms.profile.photoDescription}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="btn-secondary h-9 cursor-pointer px-3 text-sm">
                {photoPreviewUrl
                  ? copy.forms.profile.replacePhoto
                  : copy.forms.profile.uploadPhoto}
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                />
              </label>
              {photoPreviewUrl && (
                <button
                  type="button"
                  className="btn-danger h-9 px-3 text-sm"
                  onClick={handleRemovePhoto}
                >
                  {copy.forms.profile.removePhoto}
                </button>
              )}
            </div>
          </div>
        </div>

        <Input
          label={copy.forms.profile.name}
          labelClassName="col-span-full"
          name="name"
          placeholder={copy.forms.profile.namePlaceholder}
          value={name}
          onChange={handleProfileChange}
        />
        <Textarea
          label={copy.forms.profile.objective}
          labelClassName="col-span-full"
          name="summary"
          placeholder={copy.forms.profile.objectivePlaceholder}
          value={summary}
          onChange={handleProfileChange}
        />
        <Input
          label={copy.forms.profile.email}
          labelClassName="col-span-4"
          name="email"
          placeholder={copy.forms.profile.emailPlaceholder}
          value={email}
          onChange={handleProfileChange}
        />
        <Input
          label={copy.forms.profile.phone}
          labelClassName="col-span-2"
          name="phone"
          placeholder={copy.forms.profile.phonePlaceholder}
          value={phone}
          onChange={handleProfileChange}
        />
        <Input
          label={copy.forms.profile.website}
          labelClassName="col-span-4"
          name="url"
          placeholder={copy.forms.profile.websitePlaceholder}
          value={url}
          onChange={handleProfileChange}
        />
        <Input
          label={copy.forms.profile.location}
          labelClassName="col-span-2"
          name="location"
          placeholder={copy.forms.profile.locationPlaceholder}
          value={location}
          onChange={handleProfileChange}
        />

        <div className="col-span-full border border-slate-300 bg-stone-50 p-3">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {copy.forms.profile.extraDetails}
              </div>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                {copy.forms.profile.extraDetailsDescription}
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary h-9 px-3 text-sm"
              onClick={() => dispatch(addProfileExtraDetail())}
            >
              <PlusSmallIcon
                className="-ml-0.5 mr-1 h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
              {copy.forms.profile.addDetail}
            </button>
          </div>

          {extraDetails.length > 0 && (
            <div className="mt-3 space-y-2.5">
              {extraDetails.map((detail, idx) => (
                <div
                  key={detail.id}
                  className="border border-slate-300 bg-white p-3"
                >
                  <div className="grid grid-cols-1 gap-2.5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1fr)_auto]">
                    <label className="text-[13px] font-medium text-gray-700">
                      {copy.forms.profile.detailLabel}
                      <input
                        type="text"
                        value={detail.label}
                        placeholder={copy.forms.profile.detailLabelPlaceholder}
                        onChange={(event) =>
                          dispatch(
                            changeProfileExtraDetail({
                              idx,
                              field: "label",
                              value: event.target.value,
                            })
                          )
                        }
                        className="mt-1 block w-full rounded-sm border border-slate-300 px-2.5 py-1.5 text-sm leading-6 text-gray-900 outline-none transition focus:border-slate-500"
                      />
                    </label>
                    <label className="text-[13px] font-medium text-gray-700">
                      {copy.forms.profile.detailValue}
                      <input
                        type="text"
                        value={detail.value}
                        placeholder={copy.forms.profile.detailValuePlaceholder}
                        onChange={(event) =>
                          dispatch(
                            changeProfileExtraDetail({
                              idx,
                              field: "value",
                              value: event.target.value,
                            })
                          )
                        }
                        className="mt-1 block w-full rounded-sm border border-slate-300 px-2.5 py-1.5 text-sm leading-6 text-gray-900 outline-none transition focus:border-slate-500"
                      />
                    </label>
                    <label className="text-[13px] font-medium text-gray-700">
                      {copy.forms.profile.detailHref}
                      <input
                        type="text"
                        value={detail.href ?? ""}
                        placeholder={copy.forms.profile.detailHrefPlaceholder}
                        onChange={(event) =>
                          dispatch(
                            changeProfileExtraDetail({
                              idx,
                              field: "href",
                              value: event.target.value,
                            })
                          )
                        }
                        className="mt-1 block w-full rounded-sm border border-slate-300 px-2.5 py-1.5 text-sm leading-6 text-gray-900 outline-none transition focus:border-slate-500"
                      />
                    </label>
                    <button
                      type="button"
                      className="btn-danger h-9 self-end px-2.5 text-sm"
                      onClick={() =>
                        dispatch(deleteProfileExtraDetail({ idx }))
                      }
                      aria-label={copy.forms.profile.removeDetail}
                    >
                      <TrashIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BaseForm>
  );
};
