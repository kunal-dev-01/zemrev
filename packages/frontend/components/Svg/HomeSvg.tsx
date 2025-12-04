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
    viewBox="0 0 32 32"
  >
    <path
      fill="currentColor"
      d="M4.719 3.281L3.28 4.72L10.562 12H5v2h9V5h-2v5.563zm22.562 0L20 10.562V5h-2v9h9v-2h-5.563l7.282-7.281zM5 18v2h5.563L3.28 27.281l1.44 1.439L12 21.437V27h2v-9zm13 0v9h2v-5.563l7.281 7.282l1.438-1.438L21.437 20H27v-2z"
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
    viewBox="0 0 32 32"
  >
    <path
      fill="currentColor"
      d="M13 3H7.5A4.5 4.5 0 0 0 3 7.5V9a1 1 0 0 0 2 0V7.5A2.5 2.5 0 0 1 7.5 5H13a1 1 0 1 0 0-2M5 24.5v-8A2.5 2.5 0 0 1 7.5 14h8a2.5 2.5 0 0 1 2.5 2.5v8a2.5 2.5 0 0 1-2.5 2.5h-8A2.5 2.5 0 0 1 5 24.5M15.5 29a4.5 4.5 0 0 0 4.5-4.5v-8a4.5 4.5 0 0 0-4.5-4.5h-8A4.5 4.5 0 0 0 3 16.5v8A4.5 4.5 0 0 0 7.5 29zm6.5-1a1 1 0 0 1 1-1h1.5a2.5 2.5 0 0 0 2.5-2.5V19a1 1 0 1 1 2 0v5.5a4.5 4.5 0 0 1-4.5 4.5H23a1 1 0 0 1-1-1m7-15V7.5A4.5 4.5 0 0 0 24.5 3H19a1 1 0 1 0 0 2h5.5A2.5 2.5 0 0 1 27 7.5V13a1 1 0 1 0 2 0"
    />
  </svg>
));

ResizeSvg.displayName = "ResizeSvg";

// ================= Crop SVG ====================== //
export const CropSvg = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 472 480"
  >
    <path
      fill="currentColor"
      d="M341 304V133H171V91h170q18 0 30.5 12.5T384 133v171h-43zm-213 43h341v42h-85v86h-43v-86H128q-18 0-30.5-12.5T85 347V133H0V91h85V5h43v342z"
    />
  </svg>
));

CropSvg.displayName = "CropSvg";

// ================= Watermark SVG ================ //
export const Watermark = memo(() => (
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
      strokeWidth="1.5"
    >
      <path d="M21 16.5a2.25 2.25 0 0 1 .843-1.756a3.76 3.76 0 0 0 1.407-2.935a3 3 0 0 0-1.285-2.462a2.25 2.25 0 0 1 .227-3.833A2 2 0 0 0 23.25 3.75a3 3 0 0 0-3-3a2 2 0 0 0-1.764 1.058a2.25 2.25 0 0 1-3.742.349A3.76 3.76 0 0 0 11.809.75a3 3 0 0 0-2.462 1.285a2.25 2.25 0 0 1-3.833-.227A2 2 0 0 0 3.75.75a3 3 0 0 0-3 3a2 2 0 0 0 1.058 1.764a2.25 2.25 0 0 1 .349 3.742A3.76 3.76 0 0 0 .75 12.191a3 3 0 0 0 1.285 2.462a2.25 2.25 0 0 1-.227 3.833A2 2 0 0 0 .75 20.25a3 3 0 0 0 3 3a2 2 0 0 0 1.764-1.058a2.25 2.25 0 0 1 3.742-.349a3.76 3.76 0 0 0 2.935 1.407a3 3 0 0 0 2.462-1.285a2.25 2.25 0 0 1 3.833.227a2 2 0 0 0 1.764 1.058a3 3 0 0 0 3-3a2 2 0 0 0-1.058-1.764A2.25 2.25 0 0 1 21 16.5" />
      <path d="M6.75 6.75h10.5v10.5H6.75z" />
    </g>
  </svg>
));

Watermark.displayName = "Watermark";

// ================= ArrowRightLeft ======================
export const ArrowRightLeft = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 48 48"
    fill="currentColor"
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
    >
      <path d="M35 7.241q1.61.08 2.838.166c2.553.177 4.536 2.099 4.743 4.65c.108 1.318.212 2.958.29 4.943M13 40.758a143 143 0 0 1-2.838-.166c-2.553-.177-4.536-2.097-4.743-4.649q-.072-.875-.14-1.944m11.829-5.049A91 91 0 0 1 14 29c-3.679 0-6.25-.192-7.9-.384c-1.467-.17-2.553-1.284-2.703-2.753C3.204 23.977 3 20.838 3 16c0-4.84.204-7.977.397-9.863c.15-1.469 1.236-2.582 2.703-2.753C7.75 3.192 10.321 3 14 3q1.71.001 3.108.05c.52.173 2.187.88 4.595 3.391c2.27 2.367 3.003 4.047 3.218 4.686c.03.867.054 1.822.067 2.873" />
      <path d="M24.928 11.423c-1.286.204-3.608.045-5.354-.128a2.806 2.806 0 0 1-2.522-2.544c-.17-1.843-.334-4.346-.128-5.706M37.108 19.05c.52.172 2.187.88 4.595 3.391c2.27 2.367 3.002 4.047 3.218 4.686C44.97 28.515 45 30.13 45 32c0 4.84-.204 7.977-.397 9.862c-.15 1.47-1.236 2.583-2.703 2.754c-1.65.191-4.221.384-7.9.384s-6.25-.193-7.9-.384c-1.467-.17-2.553-1.284-2.703-2.754C23.204 39.977 23 36.84 23 32s.204-7.977.397-9.863c.15-1.469 1.236-2.582 2.703-2.753C27.75 19.192 30.321 19 34 19q1.71.001 3.108.05" />
      <path d="M44.928 27.423c-1.286.204-3.608.045-5.354-.128a2.806 2.806 0 0 1-2.522-2.544c-.17-1.843-.334-4.347-.128-5.706m-2.079-8.497c-.063.537-.572.789-1.054.543c-.602-.306-1.529-.818-2.826-1.637c-.948-.597-1.599-1.086-2.043-1.465c-.657-.56-.657-1.417 0-1.978c.444-.38 1.095-.868 2.043-1.466c1.297-.818 2.224-1.33 2.826-1.636c.482-.246.991.006 1.054.543c.08.674.155 1.781.155 3.548s-.076 2.874-.155 3.548m-22.69 26.904c.063-.537.572-.789 1.054-.543c.602.307 1.529.818 2.826 1.636c.948.598 1.599 1.087 2.043 1.466c.657.56.657 1.417 0 1.978c-.444.38-1.095.868-2.043 1.466c-1.297.818-2.224 1.33-2.826 1.636c-.482.246-.991-.006-1.054-.543C12.075 43.874 12 42.767 12 41s.076-2.874.155-3.548" />
    </g>
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
