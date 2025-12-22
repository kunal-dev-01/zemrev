const Disclaimer = () => {
  return (
    <div
      role="main"
      className="w-full md:min-h-[45vw] min-h-[80vh] rounded-xl border border-zinc-200 dark:border-zinc-900 flex items-center justify-between relative overflow-hidden"
    >
      {/* content wrapper */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-10 py-10 grid gap-5 md:gap-6">
        {/* heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-700 dark:text-zinc-300">
          Disclaimer
        </h1>

        {/* effective date */}
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Effective Date: Last updated January 2026
        </p>

        {/* intro */}
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          This Disclaimer applies to Zemrev ("Zemrev", "we", "our", or "us") and
          all tools available on zemrev.com. By using our website and services,
          you agree to the statements below.
        </p>

        {/* sections */}
        {[
          {
            title: "1. No File Storage",
            text: "Zemrev does not permanently store any files you upload. All images, PDFs, and documents are processed temporarily on our backend and deleted automatically after the processing is completed.",
          },
          {
            title: "2. No Warranty of Output",
            text: "All tool results are generated automatically. Zemrev does not guarantee that processed files will meet your expectations or be free from errors, compression artifacts, or quality variations.",
          },
          {
            title: "3. No Professional Advice",
            text: "The tools provided on Zemrev are for general informational and utility purposes only and do not constitute legal, financial, or professional advice.",
          },
          {
            title: "3. User Responsibility",
            text: "You are solely responsible for ensuring that any file you upload is safe, lawful, and does not violate copyright, privacy, or intellectual property rights.",
          },
          {
            title: "4. No Liability for Damages",
            text: "Zemrev is not liable for any loss of data, file corruption, accidental deletion, incorrect output, or any indirect or consequential damages resulting from the use of our tools.",
          },
          {
            title: "5. Security and Technical Limitations",
            text: "While we follow strong security practices (HTTPS, isolated processing, no storage), no online service is 100% risk-free. You use Zemrev at your own risk.",
          },
          {
            title: "6. Third-Party Use",
            text: "If you download, share, or use processed files externally, Zemrev is not responsible for how those files are used or distributed.",
          },
          {
            title: "7. Service Changes",
            text: "Zemrev may update, modify, or remove tools at any time without prior notice. The platform is provided on an “as is” and “as available” basis.",
          },
          {
            title: "8. Contact",
            text: "If you have questions about this Disclaimer or need help, contact us at:",
          },
        ].map((sec, idx) => (
          <section key={idx} className="grid gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
              {sec.title}
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {sec.text}
              {sec.title === "8. Contact" && (
                <>
                  {" "}
                  <a
                    href="mailto:contact@zemrev.com"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    contact@zemrev.com
                  </a>
                </>
              )}
            </p>
          </section>
        ))}

        <section className="grid gap-2">
          <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
            Governing Law
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            This Disclaimer shall be governed and interpreted in accordance with
            applicable laws.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Disclaimer;
