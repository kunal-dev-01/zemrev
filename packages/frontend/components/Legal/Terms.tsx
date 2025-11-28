const Terms = () => {
  return (
    <div className='w-full md:min-h-[45vw] min-h-[80vh] md:py-[2vw] rounded-xl bg-zinc-100/10 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between relative overflow-hidden'>

      {/* content wrapper */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-10 py-10 grid gap-5 md:gap-6">

        {/* heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-700 dark:text-zinc-300">Terms of Service</h1>

        {/* effective date */}
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Effective Date: January 1, 2026</p>

        {/* welcome */}
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Welcome to Zemrev (zemrev.com). By using our website, tools, or services, you agree to these Terms of Service. Please read them carefully.
        </p>

        {/* sections */}
        {[
          {
            title: "1. About Zemrev",
            text: "Zemrev is an online platform that offers fast and secure tools such as image conversion, compression, optimization, PDF utilities (coming soon), and more tools added regularly. Zemrev works on a credit-based system, where each tool request uses credits."
          },
          {
            title: "2. Eligibility",
            text: "You must be at least 13 years old, use Zemrev only for legal purposes, and provide correct information when creating an account. We can deny access to anyone who violates these terms."
          },
          {
            title: "3. Guest Users",
            text: "Guest users can use Zemrev without creating an account. Guests get 15 free credits every day, credits reset automatically every 24 hours, guests can access basic tools only, and guest credits cannot be saved or carried over."
          },
          {
            title: "4. Real Accounts & Membership",
            text: "To create a real account on Zemrev, you must select a membership plan: Basic, Pro, Elite, or Custom (pay-as-you-go credits). Real users cannot use the platform without choosing a plan, receive monthly credits depending on their plan, and can buy extra credits anytime."
          },
          {
            title: "5. Credit System",
            text: "Most tools require 1 credit per request. Some tools may use more or fewer credits. Credits are non-transferable, non-refundable once used, and may expire depending on your plan rules."
          },
          {
            title: "6. Your Responsibilities",
            text: "By using Zemrev, you agree NOT to upload harmful, illegal, or abusive files; try to bypass credit or membership limits; use bots or automated scripts to spam requests; attack, overload, or reverse-engineer the system; create multiple fake accounts to abuse free credits; or use the tools for any illegal or harmful purpose. If you break these rules, we may suspend or ban your account."
          },
          {
            title: "7. File Handling & Privacy",
            text: "Zemrev processes your files securely. Uploaded files are automatically deleted after processing, we do not store your files permanently, we do not access or view your files manually, and all processing is automatic and temporary. However, no online service is 100% risk-free. You use the platform at your own responsibility."
          },
          {
            title: "8. Payments & Billing",
            text: "For paid memberships or credits: all payments are handled securely through our payment partners, some plans may automatically renew (you can cancel anytime), refunds are not guaranteed unless required by law, chargebacks may result in account suspension, and you are responsible for any fees, taxes, or currency charges."
          },
          {
            title: "9. Cancellation & Termination",
            text: "You may cancel your membership at any time. After cancellation your plan remains active until the end of the billing period, and no refunds are given for unused time or unused credits. We may suspend or terminate your account if you violate the Terms, abuse credits, memberships, or tools, or attempt fraud, hacking, or illegal activity."
          },
          {
            title: "10. Disclaimer of Service",
            text: "Zemrev is provided \"as is\" and \"as available\". We do NOT guarantee 100% uptime, perfect accuracy, error-free processing, unlimited access, or that all tools will remain available forever. We may update, change, or remove tools at any time."
          },
          {
            title: "11. Limitation of Liability",
            text: "Zemrev is not liable for loss of data, file damage or corruption, loss of business or profits, or any indirect or accidental damages. Maximum liability is limited to the amount you paid in the last 30 days."
          },
          {
            title: "12. Changes to Terms",
            text: "We may update these Terms anytime. If we make major changes, we will update the \"Effective Date\" above. Continuing to use Zemrev means you accept the updated terms."
          },
          {
            title: "13. Contact Us",
            text: "If you have questions, complaints, or support requests email us at"
          }
        ].map((sec, idx) => (
          <section key={idx} className="grid gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-300">{sec.title}</h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {sec.text}
              {sec.title === "13. Contact Us" && (
                <>
                  {" "}
                  <a href="mailto:contact@zemrev.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    contact@zemrev.com
                  </a>
                  . We usually reply within 24 hours, but it may take up to 48 hours.
                </>
              )}
            </p>
          </section>
        ))}

      </div>
    </div>
  )
}

export default Terms