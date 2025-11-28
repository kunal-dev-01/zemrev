const PrivacyPolicy = () => {
  return (
    <div className='w-full md:min-h-[45vw] min-h-[80vh] md:py-[2vw] rounded-xl bg-zinc-100/10 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between relative overflow-hidden'>

      {/* content wrapper */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-10 py-10 grid gap-5 md:gap-6">

        {/* heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-700 dark:text-zinc-300">Privacy Policy</h1>

        {/* effective date */}
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Effective Date: January 1, 2026</p>

        {/* intro */}
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Your privacy is important to us. This Privacy Policy explains how Zemrev (zemrev.com) collects, uses, and protects your information when you use our tools and services. By using Zemrev, you agree to the practices described in this policy.
        </p>

        {/* sections */}
        {[
          {
            title: "1. Information We Collect",
            text: "We collect only the information that is necessary to provide our services. A. Information You Provide: Full Name (only for registered users), Email Address, Membership or plan information, Messages sent through contact forms. B. Automatically Collected Information: Basic device information, Browser type, IP address (for security & abuse prevention), Usage data (which tools you use, credit usage count). We do not track your activity across other websites."
          },
          {
            title: "2. File Upload & Processing Privacy",
            text: "Zemrev processes tools like image conversion, image compression, PDF utilities, and more. 🔒 Your files are completely safe. All uploaded files are temporary, files are deleted automatically within 24 hours, we do not permanently store, save, or keep copies, no manual human can view your files, files are processed automatically by our system, you can delete your files anytime by refreshing or closing the page, and we do not use your files for training, analytics, or AI models."
          },
          {
            title: "3. How We Use Your Information",
            text: "We use your information only for: creating and managing your Zemrev account, sending login or verification emails, managing your membership and credits, processing your tool requests, improving tool performance, preventing abuse and maintaining security, and providing customer support. We do not sell, trade, or rent your personal data."
          },
          {
            title: "4. Guest User Privacy",
            text: "Guest users can use Zemrev without creating an account. We only collect: device information, IP address (for abuse prevention), tool usage count (for daily credit limit). No personal data is required for guest usage."
          },
          {
            title: "5. Membership & Payment Information",
            text: "Payments are handled securely by third-party payment processors (like Stripe or others). Zemrev does not store your card details, all payment information is encrypted and handled by verified providers, and we only store your payment status, plan type, and credit balance."
          },
          {
            title: "6. Cookies & Tracking",
            text: "We use minimal cookies only for: login sessions, account authentication, saving user preferences. We do not use advertising trackers, third-party ads, or invasive analytics."
          },
          {
            title: "7. Data Retention",
            text: "We keep your data only as long as necessary. Uploaded files → auto-delete within 24 hours, account data → kept until you delete your account, logs → stored for short periods for security. You may request account deletion anytime."
          },
          {
            title: "8. Data Security",
            text: "We use several security layers to protect your data: encrypted communication (HTTPS), secure server infrastructure, no permanent file storage, abuse monitoring, strict access controls. No system is 100% risk-free, but we follow best practices to keep Zemrev safe."
          },
          {
            title: "9. Your Rights",
            text: "You can: request your data, correct your information, delete your account, opt-out of emails, contact support for privacy-related questions. To request data deletion, email us at:"
          },
          {
            title: "10. Children’s Privacy",
            text: "Zemrev is not intended for children under 13 years of age."
          },
          {
            title: "11. Changes to This Policy",
            text: "We may update this Privacy Policy occasionally. We will update the “Effective Date” when changes are made."
          },
          {
            title: "12. Contact Us",
            text: "If you have questions about this Privacy Policy:"
          }
        ].map((sec, idx) => (
          <section key={idx} className="grid gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-300">{sec.title}</h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {sec.text}
              {sec.title === "9. Your Rights" && (
                <>
                  {" "}
                  <a href="mailto:contact@zemrev.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    contact@zemrev.com
                  </a>
                </>
              )}
              {sec.title === "12. Contact Us" && (
                <>
                  <br />
                  <a href="mailto:contact@zemrev.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    📧 contact@zemrev.com
                  </a>
                </>
              )}
            </p>
          </section>
        ))}

      </div>
    </div>
  )
}

export default PrivacyPolicy