import Link from "next/link";

const footerLinks = {
  company: [
    { name: "About Us", href: "/about-us" },
    { name: "Contact Us", href: "/contact-us" },
    { name: "Careers", href: "/careers" },
  ],
  legal: [
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Cookie Policy", href: "/cookies-policy" },
  ],
  resources: [
    { name: "Image Converter", href: "/blog" },
    { name: "Image Optimizer", href: "/help" },
    { name: "Image Resizer", href: "/docs" },
  ],
  social: [
    { name: "Twitter", href: "#" },
    { name: "LinkedIn", href: "#" },
    { name: "GitHub", href: "#" },
  ],
};

type FooterLink = { name: string; href: string };
type FooterSectionProps = { title: string; links: FooterLink[] };

const FooterSection = ({ title, links }: FooterSectionProps) => (
  <div>
    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
      {title}
    </h3>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.name}>
          <Link
            href={link.href}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full p-6 md:p-8 rounded-xl border-2 border-zinc-100/80 dark:border-zinc-900/50 bg-zinc-100/10 dark:bg-zinc-900/10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6">
        <FooterSection title="Company" links={footerLinks.company} />
        <FooterSection title="Legal" links={footerLinks.legal} />
        <FooterSection title="Tools" links={footerLinks.resources} />
        <FooterSection title="Follow Us" links={footerLinks.social} />
      </div>

      <div className="border-t-2 border-zinc-100/80 dark:border-zinc-900/50 pt-6">
        <p className="text-center md:text-start text-sm text-zinc-600 dark:text-zinc-400">
          	&#169; {currentYear} Zemops. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;