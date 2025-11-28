const AboutUs = () => {
  return (
    <div className="w-full md:min-h-[45vw] min-h-[80vh] md:py-[2vw] rounded-xl bg-zinc-100/10 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between relative overflow-hidden">
      {/* content wrapper */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-10 py-10 grid gap-5 md:gap-6">
        {/* heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-700 dark:text-zinc-300">
          About Us
        </h1>

        {/* intro */}
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          We built this site to give you quick&#44; safe&#44; and low-cost tools
          for pictures&#44; PDFs&#44; and other daily tasks&#46; No
          installs&#44; no clutter&#8212;just open the site and get things
          done&#46;
        </p>

        {/* mission */}
        <section className="grid gap-3">
          <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
            Our Mission
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Fast&#44; cheap&#44; and private tools for everyone&#44; every
            day&#46;
          </p>
        </section>

        {/* what we offer */}
        <section className="grid gap-3">
          <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
            What We Offer
          </h2>
          <ul className="list-disc pl-5 text-zinc-700 dark:text-zinc-300 space-y-1">
            <li>
              Compress&#44; resize&#44; convert&#44; crop&#44; rotate&#44;
              filter&#44; and more image tools
            </li>
            <li>PDF tools &#40;more coming soon&#41;</li>
            <li>New helpers added every month</li>
          </ul>
        </section>

        {/* credit system */}
        <section className="grid gap-3">
          <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
            Credits That Fit Your Pocket
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Use tools first and pay only for what you use, or grab a custom
            credit bundle anytime—no expiry, no hidden fees.
          </p>
        </section>

        {/* guest & member perks */}
        <section className="grid gap-3">
          <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
            Free or Pro&#8212;You Choose
          </h2>
          <ul className="list-disc pl-5 text-zinc-700 dark:text-zinc-300 space-y-1">
            <li>Guests&#58; 15 free credits daily&#44; no sign-up</li>
            <li>
              Members&#58; monthly credits&#44; faster queues&#44; and extra
              tools
            </li>
          </ul>
        </section>

        {/* closing */}
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          We never store your files&#59; they vanish after each task&#46; Have
          an idea for a new tool&#63; <br />
          <a
            href="/contact-us"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Tell us here
          </a>
          &#8212;we&#39;d love to hear it&#46;
        </p>
      </div>
    </div>
  );
};

export default AboutUs;