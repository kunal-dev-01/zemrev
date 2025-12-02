import { memo } from "react";

// ===================== LinkSVG ===================== //
export const LinkSvg = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 32 32"
  >
    <path
      fill="currentColor"
      d="M2 16a7 7 0 0 1 7-7h4a1 1 0 1 1 0 2H9a5 5 0 0 0 0 10h4a1 1 0 1 1 0 2H9a7 7 0 0 1-7-7Zm28 0a7 7 0 0 0-7-7h-4a1 1 0 1 0 0 2h4a5 5 0 0 1 0 10h-4a1 1 0 1 0 0 2h4a7 7 0 0 0 7-7ZM9.5 15a1 1 0 1 0 0 2h13a1 1 0 1 0 0-2h-13Z"
    />
  </svg>
));

LinkSvg.displayName = "LinkSvg";

// ===================== UploadSVG ===================== //
export const UploadSvg = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
));

UploadSvg.displayName = "UploadSvg";
