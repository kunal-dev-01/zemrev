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

// ===================== SettingsSVG ===================== //
export const SettingsSvg = memo(() => (
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
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37c1 .608 2.296.07 2.572-1.065z" />
      <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0" />
    </g>
  </svg>
));

SettingsSvg.displayName = "SettingsSvg";

// ===================== RotateSVG ===================== //
export const RotateSvg = memo(() => (
  <svg
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
  >
    <path
      d="M14.091 26.823l-.346 1.968a12.896 12.896 0 0 1-4.24-1.541l1-1.731a10.909 10.909 0 0 0 3.586 1.305z"
      fill="currentColor"
    />
    <path
      d="M7.577 23.068l-1.532 1.285a12.981 12.981 0 0 1-2.25-3.91l1.877-.684a10.98 10.98 0 0 0 1.905 3.31z"
      fill="currentColor"
    />
    <path
      d="M22.495 27.25a12.896 12.896 0 0 1-4.24 1.542l-.347-1.968a10.909 10.909 0 0 0 3.587-1.305z"
      fill="currentColor"
    />
    <path
      d="M26.327 19.759l1.878.683a12.981 12.981 0 0 1-2.25 3.911l-.311-.261l-1.22-1.024a10.982 10.982 0 0 0 1.903-3.31z"
      fill="currentColor"
    />
    <path
      d="M13.662 5.256c-.16.034-.315.08-.472.121a10.96 10.96 0 0 0-.633.183c-.164.054-.325.116-.486.178c-.193.074-.383.15-.57.235c-.161.072-.32.15-.476.23q-.268.136-.526.286c-.153.09-.305.18-.454.276c-.167.11-.33.224-.492.342c-.14.102-.281.203-.417.312c-.161.13-.315.268-.47.406c-.122.11-.248.217-.365.332c-.167.164-.322.338-.478.512A10.944 10.944 0 0 0 5 16H3a12.936 12.936 0 0 1 3.05-8.35l-.005-.004c.092-.11.197-.206.293-.312c.184-.205.367-.41.563-.603c.139-.136.286-.262.43-.391c.183-.165.366-.329.558-.482c.16-.128.325-.247.49-.367c.192-.14.385-.277.585-.406c.175-.113.353-.22.532-.324q.309-.179.626-.341c.184-.094.370-.185.560-.27c.222-.1.449-.191.678-.28c.190-.072.378-.145.571-.208c.246-.082.498-.15.750-.217c.186-.049.368-.102.556-.143c.290-.063.587-.107.884-.15c.159-.023.314-.056.475-.073A12.933 12.933 0 0 1 26 7.703V4h2v8h-8v-2h5.189A10.961 10.961 0 0 0 16 5a11.111 11.111 0 0 0-1.189.067c-.136.015-.268.042-.403.061c-.250.037-.501.075-.746.128z"
      fill="currentColor"
    />
  </svg>
));

RotateSvg.displayName = "RotateSvg";

// ===================== FreeformSVG ===================== //
export const FreeformSvg = memo(() => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <path
      d="M3 3L9 3M3 3L3 9M3 3L8 8M21 3H15M21 3V9M21 3L16 8M3 21H9M3 21V15M3 21L8 16M21 21H15M21 21V15M21 21L16 16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
));

FreeformSvg.displayName = "FreeformSvg";

// ===================== SquareSVG ===================== //
export const SquareSvg = memo(() => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
));

SquareSvg.displayName = "SquareSvg";

// ===================== LandscapeSVG ===================== //
export const LandscapeSvg = memo(() => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <rect
      x="2"
      y="6"
      width="20"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
));

LandscapeSvg.displayName = "LandscapeSvg";

// ===================== PortraitSVG ===================== //
export const PortraitSvg = memo(() => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <rect
      x="6"
      y="2"
      width="12"
      height="20"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
));

PortraitSvg.displayName = "PortraitSvg";

// ===================== GoogleDrive ===================== //
export const GoogleDrive = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 256 229"><path fill="#0066DA" d="m19.354 196.034l11.29 19.5c2.346 4.106 5.718 7.332 9.677 9.678c11.34-14.394 19.232-25.44 23.68-33.137c4.513-7.811 10.06-20.03 16.641-36.655c-17.736-2.335-31.176-3.502-40.32-3.502c-8.777 0-22.217 1.167-40.322 3.502c0 4.545 1.173 9.09 3.519 13.196l15.835 27.418Z"/><path fill="#EA4335" d="M215.681 225.212c3.96-2.346 7.332-5.572 9.677-9.677l4.692-8.064l22.434-38.855a26.566 26.566 0 0 0 3.518-13.196c-18.21-2.335-31.625-3.502-40.247-3.502c-9.266 0-22.682 1.167-40.248 3.502c6.503 16.716 11.977 28.935 16.422 36.655c4.483 7.789 12.4 18.834 23.752 33.137Z"/><path fill="#00832D" d="M128.001 73.311c13.12-15.845 22.162-28.064 27.125-36.655c3.997-6.918 8.396-17.964 13.196-33.137C164.363 1.173 159.818 0 155.126 0h-54.25C96.184 0 91.64 1.32 87.68 3.519c6.106 17.402 11.288 29.787 15.544 37.154c4.704 8.142 12.963 19.021 24.777 32.638Z"/><path fill="#2684FC" d="M175.36 155.42H80.642l-40.32 69.792c3.958 2.346 8.503 3.519 13.195 3.519h148.968c4.692 0 9.238-1.32 13.196-3.52l-40.32-69.791Z"/><path fill="#00AC47" d="M128.001 73.311L87.681 3.52c-3.96 2.346-7.332 5.571-9.678 9.677L3.519 142.224A26.567 26.567 0 0 0 0 155.42h80.642l47.36-82.109Z"/><path fill="#FFBA00" d="m215.242 77.71l-37.243-64.514c-2.345-4.106-5.718-7.331-9.677-9.677l-40.32 69.792l47.358 82.109h80.496c0-4.546-1.173-9.09-3.519-13.196L215.242 77.71Z"/></svg>
))

GoogleDrive.displayName = "GoogleDrive";

// ===================== DropBox ===================== //
export const DropBox = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 256 218"><path fill="#0061FF" d="M63.995 0L0 40.771l63.995 40.772L128 40.771zM192 0l-64 40.775l64 40.775l64.001-40.775zM0 122.321l63.995 40.772L128 122.321L63.995 81.55zM192 81.55l-64 40.775l64 40.774l64-40.774zM64 176.771l64.005 40.772L192 176.771L128.005 136z"/></svg>
))

DropBox.displayName = "DropBox";
