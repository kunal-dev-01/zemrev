// ============================================================================
// FILE: src/services/imageService/image.api.ts
// PURPOSE: RTK Query API for image convert
// COMMIT: feat: add RTK Query endpoint for convert
// ============================================================================

import { baseApi } from "@/lib/baseApi/base.api";
import type { ConvertRequest } from "./types";

const API_URL = process.env.NEXT_PUBLIC_TOOLS_API_URL || "http://localhost:8000/api/v1";

export const imageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    convertImage: builder.mutation<Blob, ConvertRequest>({
      query: (data) => {
        const formData = new FormData();
        formData.append("file", data.file);
        formData.append("format", data.format);
        formData.append("quality", String(data.quality));

        return {
          url: `${API_URL}/convert`,
          method: "POST",
          body: formData,
          responseHandler: (response) => response.blob(),
        };
      },
    }),
  }),
  overrideExisting: false,
});

export const { useConvertImageMutation } = imageApi;