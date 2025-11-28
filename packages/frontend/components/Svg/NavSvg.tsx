import React from "react";

// ===================== Sidebar Open SVG ===================== //
export const SidebarOpenSvg = React.memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      color="currentColor"
    >
      <path d="M22 12c0-3.75 0-5.625-.955-6.939a5 5 0 0 0-1.106-1.106C18.625 3 16.749 3 13 3h-2c-3.75 0-5.625 0-6.939.955A5 5 0 0 0 2.955 5.06C2 6.375 2 8.251 2 12s0 5.625.955 6.939a5 5 0 0 0 1.106 1.106C5.375 21 7.251 21 11 21h2c3.75 0 5.625 0 6.939-.955a5 5 0 0 0 1.106-1.106C22 17.625 22 15.749 22 12m-7.5-8.5v17M19 7h-1.5m1.5 4h-1.5" />
      <path d="m8 10l1.227 1.057c.515.445.773.667.773.943s-.258.498-.773.943L8 14" />
    </g>
  </svg>
));

SidebarOpenSvg.displayName = "SidebarOpenSvg";

// ===================== Sidebar Close SVG ===================== //
export const SidebarCloseSvg = React.memo(() => (
  <svg
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 14 14"
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M7.49 1.507A19 19 0 0 0 7 1.5c-1.045 0-2.076.094-3.103.208a2.505 2.505 0 0 0-2.2 2.205C1.588 4.933 1.5 5.96 1.5 7s.088 2.067.197 3.087a2.505 2.505 0 0 0 2.2 2.205c1.027.114 2.058.208 3.103.208q.246 0 .49-.007zM7 .25c1.115 0 2.202.1 3.24.215a3.755 3.755 0 0 1 3.306 3.315c.11 1.033.204 2.113.204 3.22s-.094 2.187-.204 3.22a3.755 3.755 0 0 1-3.305 3.314c-1.039.116-2.126.216-3.241.216s-2.202-.1-3.24-.215a3.755 3.755 0 0 1-3.306-3.316C.344 9.188.25 8.108.25 7s.094-2.187.204-3.22A3.755 3.755 0 0 1 3.759.465C4.798.35 5.885.25 7 .25m2.45 3.31h1.8a.5.5 0 0 1 0 1h-1.8a.5.5 0 0 1 0-1m1.8 2.45h-1.8a.5.5 0 0 0 0 1h1.8a.5.5 0 0 0 0-1"
      clipRule="evenodd"
    />
  </svg>
));

SidebarCloseSvg.displayName = "SidebarCloseSvg";
