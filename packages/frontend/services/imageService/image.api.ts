// ============================================================================
// FILE: src/services/imageService/image.api.ts
// PURPOSE: RTK Query API
// ============================================================================

import { baseApi } from "@/lib/baseApi/base.api";
import { OutputFormat } from "./types";

export const imageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    convertImage: builder.mutation<Blob, {
      file?: File;
      url?: string;
      format: OutputFormat;
      quality: number;
    }>({
      query: ({ file, url, format, quality }) => {
        const formData = new FormData();
        if (file) formData.append("file", file);
        if (url) formData.append("url", url);
        formData.append("format", format);
        formData.append("quality", quality.toString());
        
        return {
          url: "/convert",
          method: "POST",
          body: formData,
          responseHandler: async (response) => {
            if (!response.ok) throw new Error("Conversion failed");
            return response.blob();
          },
        };
      },
    }),
  }),
});

export const { useConvertImageMutation } = imageApi;