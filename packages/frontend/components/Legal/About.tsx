const AboutUs = () => {
  return (
    <div role="main" className="w-full md:min-h-[45vw] min-h-[80vh] rounded-xl border border-zinc-200 dark:border-zinc-900 flex items-center justify-between relative overflow-hidden">
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-10 py-10 grid gap-5 md:gap-6">
        {/* heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-700 dark:text-zinc-300">
          About Zemrev
        </h1>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Used by thousands of users worldwide for quick image and PDF
          processing.
        </p>

        {/* intro */}
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          We built this platform to give you fast, simple, and unlimited tools
          for images and documents. No login, no limits—just open a tool, upload
          your file, get the result instantly, and move on.
        </p>

        {/* mission */}
        <section className="grid gap-3">
          <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
            Our Mission
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            To make powerful image and PDF tools accessible to everyone, without
            any restrictions or paywalls.
          </p>
        </section>

        {/* what we offer */}
        <section className="grid gap-3">
          <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
            What We Offer
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Explore our{" "}
            <a
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Image Tools
            </a>{" "}
            and{" "}
            <a
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              PDF Tools
            </a>
            .
          </p>

          <ul className="list-disc pl-5 text-zinc-700 dark:text-zinc-300 space-y-1">
            <li>Convert, resize, compress, optimize and edit images & PDFs</li>
            <li>Simple, clean and extremely fast workflow</li>
            <li>No limits — use tools as much as you want</li>
            <li>More image & PDF tools coming soon</li>
          </ul>
        </section>

        {/* privacy */}
        <section className="grid gap-3">
          <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
            Privacy First
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            We never store your files. Every file is processed temporarily on
            our backend and deleted automatically right after delivering your
            result.
          </p>
        </section>

        {/* closing */}
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Have a feature request or need a specific image or PDF tool?
          <br />
          <a
            href="/legal?page=contact"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Tell us here
          </a>{" "}
          — we&apos;re always building.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
