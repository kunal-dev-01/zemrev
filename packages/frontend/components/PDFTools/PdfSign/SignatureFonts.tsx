// ============================================================================
// FILE: src/components/PdfTools/SignPdf/SignatureFonts.tsx
// ============================================================================

"use client";

/**
 * Loads signature fonts only when this component is mounted.
 * Prevents global loading in layout.tsx to keep website fast.
 */
export const SignatureFonts = () => {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Allura&family=Dancing+Script:wght@400..700&family=Great+Vibes&family=Homemade+Apple&family=Sacramento&display=swap');
        
        /* Pre-define font classes to ensure availability */
        .font-dancing { font-family: 'Dancing Script', cursive; }
        .font-great-vibes { font-family: 'Great Vibes', cursive; }
        .font-sacramento { font-family: 'Sacramento', cursive; }
        .font-allura { font-family: 'Allura', cursive; }
        .font-homemade { font-family: 'Homemade Apple', cursive; }
        .font-caveat { font-family: 'Caveat', cursive; }
        .font-reenie { font-family: 'Reenie Beanie', cursive; }
      `}</style>
    </>
  );
};