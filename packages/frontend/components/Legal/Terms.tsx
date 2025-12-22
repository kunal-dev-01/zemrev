const Terms = () => {
  return (
    <div
      role="main"
      className="w-full md:min-h-[45vw] min-h-[80vh] rounded-xl border border-zinc-200 dark:border-zinc-900 flex items-center justify-between relative overflow-hidden"
    >
      {/* content wrapper */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-10 py-10 grid gap-5 md:gap-6">
        {/* heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-700 dark:text-zinc-300">
          Terms of Service
        </h1>

        {/* effective date */}
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Effective Date: Last updated January 2026
        </p>

        {/* welcome */}
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Welcome to Zemrev (zemrev.com). By using our website, tools, or
          services, you agree to these Terms of Service. Please read them
          carefully.
        </p>

        {/* sections */}
        {[
          {
            title: "1. About Zemrev",
            text: "Zemrev is a free online platform offering fast and secure tools such as image conversion, compression, resizing, optimization, watermarking, cropping, and more. Additional PDF tools and utilities will be added soon. All tools are available without login, without signup, and without usage limits.",
          },
          {
            title: "2. Eligibility",
            text: "You must be at least 13 years old and use Zemrev only for legal and permitted purposes. By using Zemrev, you agree to follow all applicable laws and these Terms of Service.",
          },
          {
            title: "3. Anonymous Usage",
            text: "Zemrev does not require accounts, registration, or personal information. All users may use the full toolset anonymously and without limits. We do not create profiles, store identities, or manage user accounts.",
          },
          {
            title: "4. No Membership or Payment",
            text: "Zemrev does not offer paid plans, credits, or membership systems. All tools are free, unlimited, and accessible without any payment. No billing, subscriptions, or transactions take place on Zemrev.",
          },
          {
            title: "5. File Usage & Processing",
            text: "Files you upload are processed temporarily on our backend servers and deleted immediately after processing. We do not store files or keep backups. Files are processed automatically by our systems and are not reviewed by humans. We do not use your files for AI training or analytics. You are responsible for ensuring your uploaded files are safe and legal.",
          },
          {
            title: "6. Acceptable Use",
            text: "By using Zemrev, you agree NOT to upload harmful, illegal, copyrighted, or abusive content; attempt to overload our servers through excessive automated requests; deploy bots or scripts to attack, crawl, or abuse the platform; reverse-engineer or attempt to bypass system protections; or use Zemrev in ways that violate any laws. We may block access if harmful activity is detected.",
          },
          {
            title: "7. Temporary Technical Data",
            text: "Zemrev may collect minimal technical information such as IP address and device/browser type strictly for security, abuse prevention, and rate-limiting. No personal identity is collected or stored. No analytics tracking is used.",
          },
          {
            title: "8. Service Availability",
            text: "Zemrev is provided on an “as is” and “as available” basis. While we strive to maintain consistent uptime, we do not guarantee uninterrupted service, perfect accuracy, or that specific tools will always remain available. Tools may change, improve, or be removed without prior notice.",
          },
          {
            title: "9. Limitation of Liability",
            text: "Zemrev is not responsible for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the platform. We do not guarantee that results produced by the tools will meet your expectations or be error-free. Use Zemrev at your own risk.",
          },
          {
            title: "10. No Warranties",
            text: "We do not provide any warranties—express or implied—regarding the quality, performance, or availability of the tools. All results are generated automatically and may vary depending on file types and conditions.",
          },
          {
            title: "11. Changes to Terms",
            text: "We may update these Terms occasionally as we improve or expand Zemrev. Any major changes will be reflected in the Effective Date above. Continued use of the platform means you accept the updated terms.",
          },
          {
            title: "12. Governing Law",
            text: "These Terms shall be governed and interpreted in accordance with applicable laws, without regard to conflict of law principles.",
          },

          {
            title: "13. Contact Us",
            text: "If you have questions, feedback, or need assistance, you may contact us anytime at",
          },
        ].map((sec, idx) => (
          <section key={idx} className="grid gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
              {sec.title}
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {sec.text}
              {sec.title === "13. Contact Us" && (
                <>
                  {" "}
                  <a
                    href="mailto:contact@zemrev.com"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    contact@zemrev.com
                  </a>
                  . We usually reply within 24 hours, but it may take up to 48
                  hours.
                </>
              )}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Terms;
