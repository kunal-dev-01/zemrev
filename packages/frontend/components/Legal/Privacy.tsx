const PrivacyPolicy = () => {
  return (
    <div
      role="main"
      className="w-full md:min-h-[45vw] min-h-[80vh] rounded-xl border border-zinc-200 dark:border-zinc-900 flex items-center justify-between relative overflow-hidden"
    >
      {/* content wrapper */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-10 py-10 grid gap-5 md:gap-6">
        {/* heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-700 dark:text-zinc-300">
          Privacy Policy
        </h1>

        {/* effective date */}
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Effective Date: Last updated January 2026
        </p>

        {/* intro */}
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Zemrev ("Zemrev", "we", "our", or "us") collects, uses, and protects
          your information when you use our tools and services at zemrev.com.
        </p>

        {/* sections */}
        {[
          {
            title: "1. Information We Collect",
            text: "Zemrev does not require account creation, login, or personal details. We do not collect your name, email, or any personal identifiers.\n\nAutomatically collected (minimal): Device type, browser details, and IP address strictly for abuse prevention, rate-limiting, and security.\n\nNo tracking: We do not use analytics that track you across websites and we do not build user profiles.",
          },

          {
            title: "2. File Upload & Processing Privacy",
            text: "Zemrev provides tools like image conversion, compression, resizing, optimization, and more. Your files are processed instantly on our servers and deleted immediately after completing the task. We do not store files, keep backups, or maintain logs of uploaded content. Files are processed automatically by our systems and are not reviewed by humans. No copies are kept for later use, and we do not use your files to train AI or models. Your file exists only during the processing step and then permanently disappears.",
          },
          {
            title: "3. How We Use Your Information",
            text: "Since Zemrev does not use accounts, personal data, or login systems, our usage of information is extremely minimal. We only use basic technical data to: keep the service running, prevent abuse (such as spam or automated attacks), optimize tool speed, and maintain server health. We never sell, share, or rent data.",
          },
          {
            title: "4. Anonymous Usage",
            text: "You can use all tools on Zemrev completely anonymously. No registration, no personal info, and no identity is required. We only process the file you upload and return the result directly to your browser.",
          },
          {
            title: "5. Payment Information",
            text: "Zemrev currently does not offer any paid plans or membership features. No payment information is collected or stored.",
          },
          {
            title: "6. Cookies & Tracking",
            text: "Zemrev uses zero tracking cookies. No session cookies, no marketing cookies, no analytics cookies, and no third-party advertising scripts. Your browsing remains private.",
          },
          {
            title: "7. Third-Party Services",
            text: "Zemrev does not share uploaded files or personal data with third parties. Infrastructure providers may be used strictly to operate the service, but they do not have access to your files beyond temporary processing.",
          },
          {
            title: "8. Data Security",
            text: "We use multiple security layers including HTTPS encryption, secure processing servers, isolated temporary file handling, rate-limiting to prevent abuse, and strict no-storage rules. Even though no system can be 100% risk-free, we follow strong industry practices.",
          },
          {
            title: "9. Your Rights",
            text: "Since we do not store personal data or create accounts, there is no personal information to access, modify, or delete. If you have privacy-related questions, you may contact us at:",
          },
          {
            title: "10. Children's Privacy",
            text: "Zemrev is not intended for children under the age of 13. We do not knowingly collect personal information from minors.",
          },
          {
            title: "11. Changes to This Policy",
            text: "We may update this Privacy Policy as we add new tools or improve our systems. The Effective Date will be updated whenever changes are made.",
          },
          {
            title: "12. Contact Us",
            text: "For privacy questions, suggestions, or general support, contact us anytime:",
          },
        ].map((sec, idx) => (
          <section key={idx} className="grid gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
              {sec.title}
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {sec.text}
              {sec.title === "9. Your Rights" && (
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
              {sec.title === "12. Contact Us" && (
                <>
                  <br />
                  <a
                    href="mailto:contact@zemrev.com"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    📧 contact@zemrev.com
                  </a>
                </>
              )}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
