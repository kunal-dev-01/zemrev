import { memo } from "react";

// ================ File Image SVG ================ //
export const FileImage = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <path d="M14 2v6h6" />
      <circle cx="10" cy="13" r="2" />
      <path d="m20 17l-1.09-1.09a2 2 0 0 0-2.82 0L10 22" />
    </g>
  </svg>
));

FileImage.displayName = "FileImage";

// ================ Minimize2 SVG ================ //
export const Minimize2 = memo(() => (
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
      d="M4 14h6v6m10-10h-6V4m0 6l7-7M3 21l7-7"
    />
  </svg>
));

Minimize2.displayName = "Minimize2";


// =============== Resize SVG ================ //
export const ResizeSvg = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 28 28"
  >
    <path
      fill="currentColor"
      d="M11.75 3h-5A3.75 3.75 0 0 0 3 6.75v2a.75.75 0 0 0 1.5 0v-2A2.25 2.25 0 0 1 6.75 4.5h5a.75.75 0 0 0 0-1.5m-5 20.5a2.25 2.25 0 0 1-2.25-2.25v-6.5a2.25 2.25 0 0 1 2.25-2.25h6.5a2.25 2.25 0 0 1 2.25 2.25v6.5a2.25 2.25 0 0 1-2.25 2.25zM3 21.25A3.75 3.75 0 0 0 6.75 25h6.5A3.75 3.75 0 0 0 17 21.25v-6.5A3.75 3.75 0 0 0 13.25 11h-6.5A3.75 3.75 0 0 0 3 14.75zM19.25 25a.75.75 0 0 1 0-1.5h2a2.25 2.25 0 0 0 2.25-2.25v-5a.75.75 0 0 1 1.5 0v5A3.75 3.75 0 0 1 21.25 25zM25 11.75a.75.75 0 0 1-1.5 0v-5a2.25 2.25 0 0 0-2.25-2.25h-5a.75.75 0 0 1 0-1.5h5A3.75 3.75 0 0 1 25 6.75z"
    />
  </svg>
));

ResizeSvg.displayName = "ResizeSvg";

// ============================= ArrowRightLeft ======================
export const ArrowRightLeft = memo(() => (
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
      d="M7 10h14l-4-4m0 8H3l4 4"
    />
  </svg>
));

ArrowRightLeft.displayName = "ArrowRightLeft";

// =============== Zap SVG ================ //
export const Zap = memo(() => (
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
      strokeWidth="1.5"
      d="m13.058 2.577l-7.941 10.74a.612.612 0 0 0-.068.597a.543.543 0 0 0 .188.235a.468.468 0 0 0 .273.084h5.986l-.907 7.023a.243.243 0 0 0 .027.135a.21.21 0 0 0 .094.09c.04.02.083.024.125.013a.2.2 0 0 0 .107-.07l7.941-10.741a.612.612 0 0 0 .068-.597a.544.544 0 0 0-.188-.234a.468.468 0 0 0-.273-.085h-5.986l.907-7.023a.243.243 0 0 0-.027-.135a.21.21 0 0 0-.094-.09a.183.183 0 0 0-.125-.013a.199.199 0 0 0-.107.07"
    />
  </svg>
));

Zap.displayName = "Zap";

// ============== Shield SVG ================ //
export const Shield = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M19.63 3.65a1 1 0 0 0-.84-.2a8 8 0 0 1-6.22-1.27a1 1 0 0 0-1.14 0a8 8 0 0 1-6.22 1.27a1 1 0 0 0-.84.2a1 1 0 0 0-.37.78v7.45a9 9 0 0 0 3.77 7.33l3.65 2.6a1 1 0 0 0 1.16 0l3.65-2.6A9 9 0 0 0 20 11.88V4.43a1 1 0 0 0-.37-.78ZM18 11.88a7 7 0 0 1-2.93 5.7L12 19.77l-3.07-2.19A7 7 0 0 1 6 11.88v-6.3a10 10 0 0 0 6-1.39a10 10 0 0 0 6 1.39Z"
    />
  </svg>
));

Shield.displayName = "Shield";

// ============== HardDrive SVG ================ //
export const HardDrive = memo(() => (
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
      strokeWidth="1.5"
      d="M3.25 13h17.5M5.45 4.11l-2.162 7.847A8 8 0 0 0 3 14.082V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4.918a8 8 0 0 0-.288-2.125L18.55 4.11A2 2 0 0 0 16.76 3H7.24a2 2 0 0 0-1.79 1.11ZM17 17h1m-5 0h1"
    />
  </svg>
));

HardDrive.displayName = "HardDrive";

// =============== UploadCloud SVG ================ //
export const UploadCloud = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="m16 16l-4-4l-4 4m4-4v9" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      <path d="m16 16l-4-4l-4 4" />
    </g>
  </svg>
));

UploadCloud.displayName = "UploadCloud";

// ============== Download SVG ================ //
export const Download = memo(() => (
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
      d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5l5-5m-5-7v12"
    />
  </svg>
));

Download.displayName = "Download";

// =============== MousePointerClick SVG ================ //
export const MousePointerClick = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
      <path d="m12 12l4 10l1.7-4.3L22 16Z" />
    </g>
  </svg>
));

MousePointerClick.displayName = "MousePointerClick";
