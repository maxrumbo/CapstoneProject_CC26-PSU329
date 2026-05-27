import { apiRequest } from "./apiClient";

export const updateProfilePhoto = async (token, photoUrl) =>
  apiRequest("/profile/photo", {
    method: "PATCH",
    token,
    body: {
      photo_url: photoUrl || null,
    },
  });
