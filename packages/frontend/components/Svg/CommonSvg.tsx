import { memo } from "react";

// ================ Check SVG ================ //
export const CheckSvg = memo(
  ({ className = "w-5 h-5 text-emerald-400" }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  )
);

CheckSvg.displayName = "CheckSvg";

// ================ Cancel SVG ================ //
export const CancelSvg = memo(({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="m5 19l7-7m0 0l7-7m-7 7L5 5m7 7l7 7"
    />
  </svg>
));

CancelSvg.displayName = "CancelSvg";

// ================ Download SVG ================ //
export const DownloadSvg = memo(({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    className={className}
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

DownloadSvg.displayName = "DownloadSvg";

// ================ Error SVG ================ //
export const ErrorSvg = memo(({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M8 14.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13ZM8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm1-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0Zm-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z"
      clipRule="evenodd"
    />
  </svg>
));

ErrorSvg.displayName = "ErrorSvg";

// =============== Email SVG =============== //
export const EmailSvg = memo(() => (
  <svg
    width="100%"
    height="100%"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
));

EmailSvg.displayName = "EmailSvg";

// =============== Bolt SVG =============== //
export const BoltSvg = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="100%"
    height="100%"
  >
    <path
      fillRule="evenodd"
      d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
      clipRule="evenodd"
    />
  </svg>
));

BoltSvg.displayName = "BoltSvg";

// ================= Trash SVG ================= //
export const TrashSvg = memo(({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"
    />
  </svg>
));

TrashSvg.displayName = "TrashSvg";

// ================= Folder Open SVG ================= //
export const FolderOpenSvg = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 20 20"
  >
    <path
      fill="currentColor"
      d="M2.282 3.828c-.35.063-.566.189-.691.374a1.33 1.33 0 0 0-.225.841v11.718L.002 15.82V5.072A2.6 2.6 0 0 1 .45 3.474c.357-.53.929-.85 1.666-.966l.108-.008h3.56c.742.038 1.355.35 1.783.917c.387.51.472.91.484 1.639c.002.088.003.15.006.201c.046 0 .109-.003.193-.01h5.636l.101.008a2.6 2.6 0 0 1 1.489.724c.435.431.632 1.028.614 1.734v1.799h-1.364V7.698c.01-.39-.073-.639-.224-.789a1.21 1.21 0 0 0-.671-.333l-5.516-.003c-.854.08-1.504-.252-1.601-1.018a3.953 3.953 0 0 1-.027-.478c-.008-.475-.043-.642-.218-.873a.908.908 0 0 0-.72-.376H2.281Zm15.772 5.504c.831.014 1.46.304 1.77.908c.294.574.21 1.226-.18 1.91l-.054.08l-2.843 3.626c-.34.448-.73.818-1.172 1.106c-.483.316-1.088.49-1.851.538H2.016c-.633 0-1.13-.141-1.472-.477c-.42-.414-.589-.85-.531-1.394c.035-.338.169-.668.415-1.022l3.445-3.833c.538-.558 1.02-.94 1.465-1.147c.404-.187.888-.282 1.444-.294h11.272ZM7.012 10.66c-.476-.009-.839.051-1.088.166c-.265.123-.624.409-1.013.807l-3.376 3.749a.858.858 0 0 0-.165.383c-.015.139.003.186.143.323c.04.039.2.084.503.084l11.663.002c.494-.032.87-.14 1.136-.314c.308-.201.585-.464.84-.801l2.82-3.594c.17-.311.191-.508.128-.631c-.05-.098-.202-.168-.56-.174H7.012Z"
    />
  </svg>
));

FolderOpenSvg.displayName = "FolderOpenSvg";

// ================= Plus SVG ================= //
export const PlusSvg = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 448 512"
  >
    <path
      fill="currentColor"
      d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32v144H48c-17.7 0-32 14.3-32 32s14.3 32 32 32h144v144c0 17.7 14.3 32 32 32s32-14.3 32-32V288h144c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
    />
  </svg>
));

PlusSvg.displayName = "PlusSvg";

// ================= ChevronDownIcon SVG ================= //
export const ChevronDownSvg = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
));

ChevronDownSvg.displayName = "ChevronDownSvg";

// ================= QualityIcon SVG ================= //
export const QualitySvg = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
));

QualitySvg.displayName = "QualitySvg";

// ================= CopyIcon SVG ================= //
export const CopySvg = memo(({ className= "w-5 h-5 text-zinc-600 dark:text-zinc-400" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      <path d="M16.75 5.75a3 3 0 0 0-3-3h-6.5a3 3 0 0 0-3 3v9.5a3 3 0 0 0 3 3h6.5a3 3 0 0 0 3-3z" />
      <path d="M19.75 6.75v8.5a6 6 0 0 1-6 6h-5.5" />
    </g>
  </svg>
));

CopySvg.displayName = "CopySvg";
