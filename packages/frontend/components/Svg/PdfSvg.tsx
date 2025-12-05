import { memo } from "react";

// ===================== PDFCompressSVG ===================== //
export const PDFCompressSvg = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M8 22a1 1 0 0 1-1-1v-4H3a1 1 0 0 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1zM8 9H3a1 1 0 0 1 0-2h4V3a1 1 0 0 1 2 0v5a1 1 0 0 1-1 1zm13 0h-5a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v4h4a1 1 0 0 1 0 2zm-5 13a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h5a1 1 0 0 1 0 2h-4v4a1 1 0 0 1-1 1z"
    />
  </svg>
));

PDFCompressSvg.displayName = "PDFCompressSvg";

// ===================== PDFMergerSVG ===================== //
export const PDFMergerSvg = memo(() => (
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
      strokeWidth="4"
    >
      <rect
        width="20"
        height="22"
        x="4"
        y="24"
        rx="2"
        transform="rotate(-45 4 24)"
      />
      <rect
        width="20"
        height="20"
        x="16"
        y="24"
        rx="2"
        transform="rotate(-45 16 24)"
      />
    </g>
  </svg>
));
PDFMergerSvg.displayName = "PDFMergerSvg";

// ===================== PDFSplitterSVG ===================== //
export const PDFSplitterSvg = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M19 11a2.991 2.991 0 0 0-2.815 1.997c-2.995-.014-5.26-.129-6.726-.886a6.205 6.205 0 0 1-3.358-4.326A3.008 3.008 0 1 0 4 7.816v9.368a3 3 0 1 0 2 0v-5.257a8.579 8.579 0 0 0 2.541 1.962c1.847.952 4.36 1.092 7.642 1.108A2.995 2.995 0 1 0 19 11ZM5 21a1 1 0 1 1 1-1a1 1 0 0 1-1 1ZM5 6a1 1 0 1 1 1-1a1 1 0 0 1-1 1Zm14 9a1 1 0 1 1 1-1a1 1 0 0 1-1 1Z"
    />
  </svg>
));
PDFSplitterSvg.displayName = "PDFSplitterSvg";

// ===================== PDFToImageSVG ===================== //
export const PDFToImageSVg = memo(() => (
  <svg
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M.448 15.3c-1.12-1.36.071-2.98 1.29-3.67c.677-.381 1.52-.646 2.43-.896a16 16 0 0 1-.895 1.5a7 7 0 0 0-.781.371c-.642.362-1.5.995-.973 1.79c.513.774 1.34-.077 1.73-.526c.498-.508 1.06-1.31 1.56-2.19c.529-.93 1.01-1.98 1.47-3.09c.415-1 .784-2.03 1.06-2.99V5.6c.28-.96.469-1.85.539-2.6c.057-.623.03-1.54-.79-1.42s-.81 1.08-.615 1.83q.086.335.216.695q-.092.431-.223.91q-.11.396-.24.811a11 11 0 0 1-.833-2.16c-.35-1.35-.365-3.23 1.45-3.62s2.27 1.67 2.15 2.99c-.1 1.07-.397 2.38-.847 3.73c.288.477.602.955.935 1.42c.35.491.81.993 1.19 1.43c1.34-.1 2.66-.034 3.65.153c1.36.257 2.59 1.11 1.87 2.74c-.721 1.63-2.5 1.39-3.68.631a9.9 9.9 0 0 1-2.55-2.38h-.003a37 37 0 0 1-2.05-3.47c-.296.893-.73 2.09-1.1 2.89c.473-.11.97-.2 1.46-.275c.201.338.393.668.59.988q-.235.035-.49.078q-.923.157-1.81.376q-.224.43-.434.848c-.499.988-.959 1.9-1.53 2.55c-.913 1.04-2.62 1.89-3.74.53zm10.5-4.68c.599.612 1.16 1.08 1.71 1.44c.668.43 1.44.681 1.8-.07c.367-.753-.311-1.13-1.02-1.27c-.699-.133-1.53-.139-2.5-.104z"
      clipRule="evenodd"
    />
  </svg>
));
PDFToImageSVg.displayName = "PDFToImageSVg";

// ===================== ImageToPDFSVG ===================== //
export const ImageToPDFSvg = memo(() => (
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
      color="currentColor"
    >
      <path d="M7 18v-2.5m0 0V14c0-.471 0-.707.154-.854C7.308 13 7.555 13 8.05 13h.7c.725 0 1.313.56 1.313 1.25S9.475 15.5 8.75 15.5zM21 13h-1.312c-.825 0-1.238 0-1.494.244s-.256.637-.256 1.423v.833m0 2.5v-2.5m0 0h2.187m-4.375 0c0 1.38-1.175 2.5-2.625 2.5c-.327 0-.49 0-.613-.067c-.291-.16-.262-.485-.262-.766v-3.334c0-.281-.03-.606.262-.766c.122-.067.286-.067.613-.067c1.45 0 2.625 1.12 2.625 2.5" />
      <path d="M15 22h-4.273c-3.26 0-4.892 0-6.024-.798a4.1 4.1 0 0 1-.855-.805C3 19.331 3 17.797 3 14.727v-2.545c0-2.963 0-4.445.469-5.628c.754-1.903 2.348-3.403 4.37-4.113C9.095 2 10.668 2 13.818 2c1.798 0 2.698 0 3.416.252c1.155.406 2.066 1.263 2.497 2.35C20 5.278 20 6.125 20 7.818V10" />
      <path d="M3 12a3.333 3.333 0 0 1 3.333-3.333c.666 0 1.451.116 2.098-.057A1.67 1.67 0 0 0 9.61 7.43c.173-.647.057-1.432.057-2.098A3.333 3.333 0 0 1 13 2" />
    </g>
  </svg>
));
ImageToPDFSvg.displayName = "ImageToPDFSvg";

// ===================== PDFToWordSVG ===================== //
export const PDFToWordSvg = memo(() => (
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
      <path d="M4 21.4V2.6a.6.6 0 0 1 .6-.6h11.652a.6.6 0 0 1 .424.176l3.148 3.148A.6.6 0 0 1 20 5.75V21.4a.6.6 0 0 1-.6.6H4.6a.6.6 0 0 1-.6-.6ZM8 10h8m-8 8h8m-8-4h4" />
      <path d="M16 2v3.4a.6.6 0 0 0 .6.6H20" />
    </g>
  </svg>
));
PDFToWordSvg.displayName = "PDFToWordSvg";

// ===================== PDFToExcelSVG ===================== //
export const PDFToExcelSvg = memo(() => (
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
      <path d="M15.12 12h8.13m-8.13-5h8.13M4 9l5 6m0-6l-5 6M15.13 2.25V17h8.12" />
      <path d="M7 18v3a1 1 0 0 0 1 1h14.25a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v3" />
      <path d="M1.75 6h10s1 0 1 1v10s0 1-1 1h-10s-1 0-1-1V7s0-1 1-1" />
    </g>
  </svg>
));
PDFToExcelSvg.displayName = "PDFToExcelSvg";

// ===================== ExtractTextFromPdfSVG ===================== //
export const ExtractTextFromPdfSvg = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M18.5 20a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5v-3H4v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9.828a2 2 0 0 0-.586-1.414l-5.829-5.828a.491.491 0 0 0-.049-.04a.63.63 0 0 1-.036-.03a2.072 2.072 0 0 0-.219-.18a.652.652 0 0 0-.08-.044l-.048-.024l-.05-.029c-.054-.031-.109-.063-.166-.087a1.977 1.977 0 0 0-.624-.138a.56.56 0 0 1-.059-.007a.605.605 0 0 0-.082-.007H6a2 2 0 0 0-2 2v9h1.5V4a.5.5 0 0 1 .5-.5h6V8a2 2 0 0 0 2 2h4.5v10Zm-5-15.379L17.378 8.5H14a.5.5 0 0 1-.5-.5V4.621ZM8.75 11.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm-6 2.75a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm6 2.75a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"
    />
  </svg>
));
ExtractTextFromPdfSvg.displayName = "ExtractTextFromPdfSvg";

// ===================== ExtractImagesFromPdfSVG ===================== //
export const ExtractImagesFromPdfSvg = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 512 512"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="32"
      d="M432 112V96a48.14 48.14 0 0 0-48-48H64a48.14 48.14 0 0 0-48 48v256a48.14 48.14 0 0 0 48 48h16"
    />
    <rect
      width="400"
      height="336"
      x="96"
      y="128"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="32"
      rx="45.99"
      ry="45.99"
    />
    <ellipse
      cx="372.92"
      cy="219.64"
      fill="none"
      stroke="currentColor"
      strokeMiterlimit="10"
      strokeWidth="32"
      rx="30.77"
      ry="30.55"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
      d="M342.15 372.17L255 285.78a30.93 30.93 0 0 0-42.18-1.21L96 387.64M265.23 464l118.59-117.73a31 31 0 0 1 41.46-1.87L496 402.91"
    />
  </svg>
));
ExtractImagesFromPdfSvg.displayName = "ExtractImagesFromPdfSvg";

// ===================== PDFWatermarkSVG ===================== //
export const PDFWatermarkSvg = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 2048 2048"
  >
    <path
      fill="currentColor"
      d="M1193 1611L489 907l283-283l704 704l-283 283zm102-283L772 805L670 907l523 523l102-102zm369 592v-640h128v768H128V0h922L922 128H256v1792h1408zm305-1481l-215 87l245 245l-268 268l-72-73l-89 86l-582-582l89-86l-70-69l268-268l241 242l91-212l74-74l362 362l-74 74zm-275-242l-98 168l79 82l172-97l-153-153zm124 574l-543-543l-110 121l543 543l110-121z"
    />
  </svg>
));
PDFWatermarkSvg.displayName = "PDFWatermarkSvg";

// ===================== RotateImageSVG ===================== //
export const RotateImageSvg = memo(() => (
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
      <path d="M16.466 7.5C15.643 4.237 13.952 2 12 2C9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2m2.194-8.093l3.814 1.86l-1.86 3.814" />
      <path d="M19 15.57c-1.804.885-4.274 1.43-7 1.43c-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4" />
    </g>
  </svg>
));
RotateImageSvg.displayName = "RotateImageSvg";

// ===================== SecurePdfSVG ===================== //
export const SecurePdfSvg = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16"><path fill="currentColor" d="M6 1a2 2 0 0 0-2 2v2.401a2.98 2.98 0 0 1 1-.36V3a1 1 0 0 1 1-1h3v2.5A1.5 1.5 0 0 0 10.5 6H13v7a1 1 0 0 1-1 1h-2c0 .364-.097.706-.268 1H12a2 2 0 0 0 2-2V5.414a1.5 1.5 0 0 0-.44-1.06l-2.914-2.915A1.5 1.5 0 0 0 9.586 1H6Zm6.793 4H10.5a.5.5 0 0 1-.5-.5V2.207L12.793 5ZM3.5 8v1H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-.5V8a2 2 0 1 0-4 0Zm1 1V8a1 1 0 0 1 2 0v1h-2Zm1 2.25a.75.75 0 1 1 0 1.5a.75.75 0 0 1 0-1.5Z"/></svg>
))
SecurePdfSvg.displayName = "SecurePdfSvg";

// ===================== UnlockPdfSVG ===================== //
export const UnlockPdfSvg = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16"><path fill="currentColor" d="M5.5 4v2h7A1.5 1.5 0 0 1 14 7.5v6a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5v-6A1.5 1.5 0 0 1 3.499 6H4V4a4 4 0 0 1 7.371-2.154a.75.75 0 0 1-1.264.808A2.5 2.5 0 0 0 5.5 4Zm-2 3.5v6h9v-6h-9Z"/></svg>
))
UnlockPdfSvg.displayName = "UnlockPdfSvg";

// ===================== PDFOptimizerSVG ===================== //
export const PDFOptimizerSvg = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 48 48" fill="currentColor"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"><path d="M5.185 31.954C6.529 26.914 10.638 23 15.854 23c4.895 0 8.164 4.425 8.056 9.32l-.057 2.569a7 7 0 0 0 2.097 5.154l1.106 1.086c1.586 1.557.66 4.224-1.555 4.408c-2.866.237-6.41.463-9.501.463c-3.982 0-7.963-.375-10.45-.666c-1.472-.172-2.558-1.428-2.417-2.902c.32-3.363 1.174-7.188 2.052-10.478"/><path d="M20 24.018c1.68-6.23 3.462-12.468 4.853-18.773c.219-.993-.048-2.01-1-2.365a8 8 0 0 0-.717-.226a8 8 0 0 0-.734-.162c-1.002-.17-1.742.578-2.048 1.547c-1.96 6.191-3.542 12.522-5.213 18.792M45 45H35m7-8H32m7-8H29m-18.951 8.75c-.167 1.5 0 5.2 2 8m5-7.75s0 5 2.951 7.5"/></g></svg>
))
PDFOptimizerSvg.displayName = "PDFOptimizerSvg";

// ===================== PDFToHTMLSVG ===================== //
export const PDFToHTMLSvg = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 256 256"><path fill="currentColor" d="M128 152a8 8 0 0 1-8 8h-8v48a8 8 0 0 1-16 0v-48h-8a8 8 0 0 1 0-16h32a8 8 0 0 1 8 8Zm-64-8a8 8 0 0 0-8 8v20H40v-20a8 8 0 0 0-16 0v56a8 8 0 0 0 16 0v-20h16v20a8 8 0 0 0 16 0v-56a8 8 0 0 0-8-8Zm176 56h-12v-48a8 8 0 0 0-16 0v56a8 8 0 0 0 8 8h20a8 8 0 0 0 0-16Zm-45.86-55.71a8 8 0 0 0-9 3.59L168 176.45l-17.14-28.57A8 8 0 0 0 136 152v56a8 8 0 0 0 16 0v-27.12l9.14 15.24a8 8 0 0 0 13.72 0l9.14-15.24V208a8 8 0 0 0 16 0v-56a8 8 0 0 0-5.86-7.71ZM208 120a8 8 0 0 1-8-8V96h-48a8 8 0 0 1-8-8V40H56v72a8 8 0 0 1-16 0V40a16 16 0 0 1 16-16h96a8 8 0 0 1 5.66 2.34l56 56A8 8 0 0 1 216 88v24a8 8 0 0 1-8 8Zm-19.31-40L160 51.31V80Z"/></svg>
))
PDFToHTMLSvg.displayName = "PDFToHTMLSvg";

// ===================== PDFToTextSVG ===================== //
export const PDFToTextSvg = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M2.75 2a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5zm0 7a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5zm2 3.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5zM4 6.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 6.25" clipRule="evenodd"/></svg>
))
PDFToTextSvg.displayName = "PDFToTextSvg";

// ===================== PDFToEPUB ===================== //
export const PDFToEPUB = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="1.5" d="M3 20.4V3.6a.6.6 0 0 1 .6-.6h16.8a.6.6 0 0 1 .6.6v16.8a.6.6 0 0 1-.6.6H3.6a.6.6 0 0 1-.6-.6Zm0-3.9h18M3 12h18m0-4.5H3M12 21V3"/></svg>
))
PDFToEPUB.displayName = "PDFToEPUB";

// ===================== PDFToCSV ===================== //
export const PDFToCSV = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" color="currentColor"><path d="M3.5 13v-.804c0-2.967 0-4.45.469-5.636c.754-1.905 2.348-3.407 4.37-4.118C9.595 2 11.168 2 14.318 2c1.798 0 2.698 0 3.416.253c1.155.406 2.066 1.264 2.497 2.353c.268.677.268 1.525.268 3.22V13"/><path d="M3.5 12a3.333 3.333 0 0 1 3.333-3.333c.666 0 1.451.116 2.098-.057a1.67 1.67 0 0 0 1.179-1.18c.173-.647.057-1.432.057-2.098A3.333 3.333 0 0 1 13.5 2m-6 15.22C7.445 16.03 6.622 16 5.505 16c-1.72 0-2.005.406-2.005 2v2c0 1.594.285 2 2.005 2c1.117 0 1.94-.03 1.995-1.22m13-4.78l-1.777 4.695c-.33.87-.494 1.305-.755 1.305c-.26 0-.426-.435-.755-1.305L15.436 16m-2.56 0h-1.18c-.473 0-.709 0-.895.076c-.634.26-.625.869-.625 1.424s-.009 1.165.625 1.424c.186.076.422.076.894.076s.708 0 .894.076c.634.26.625.869.625 1.424s.009 1.165-.625 1.424c-.186.076-.422.076-.894.076H10.41"/></g></svg>
))
PDFToCSV.displayName = "PDFToCSV";