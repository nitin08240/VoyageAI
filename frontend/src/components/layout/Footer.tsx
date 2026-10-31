import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Twitter, Instagram, Github, Linkedin, Send } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Explore', href: '/explore' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Refund Policy', href: '/refund' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-800 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 w-fit group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-accent">
                <Plane size={18} className="text-white rotate-45" />
              </div>
              <span className="font-display font-bold text-2xl text-white">
                Voyage<span className="gradient-text">AI</span>
              </span>
            </Link>
            <p className="text-warm-200/50 text-sm leading-relaxed max-w-xs">
              Your Journey. Your Budget. Your Perfect Plan.
              <br /><br />
              AI-powered travel planning that creates personalized, day-wise itineraries tailored to your unique preferences and budget.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-warm-200/40 hover:text-warm-200 hover:bg-white/10 transition-all"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-2">
              <p className="text-xs font-semibold text-warm-200/50 uppercase tracking-wider mb-3">
                Stay in the loop
              </p>
              <div className="flex gap-2">
                <input
                  id="newsletter-email"
                  name="newsletterEmail"
                  type="email"
                  aria-label="Enter your email for the newsletter"
                  placeholder="Enter your email"
                  className="flex-1 h-10 px-4 text-sm input-glass rounded-xl"
                />
                <button
                  type="button"
                  aria-label="Subscribe to newsletter"
                  className="w-10 h-10 btn-accent rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-bold text-warm-200 uppercase tracking-wider mb-5">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-warm-200/50 hover:text-warm-200 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-warm-200/30">
            © {new Date().getFullYear()} VoyageAI. All rights reserved.
          </p>
          <p className="text-xs text-warm-200/25">
            Built with ♥ for travelers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};
