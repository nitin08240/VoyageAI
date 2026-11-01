import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Twitter, Instagram, Github, Linkedin, Send, CheckCircle2 } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'How It Works', href: '/how-it-works' },
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
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
    { label: 'Refund Policy', href: '/refund-policy' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-navy-950 border-t border-slate-800/80 text-slate-300 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 w-fit group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-md shadow-accent-500/20 group-hover:scale-105 transition-transform">
                <Plane size={18} className="text-white rotate-45" />
              </div>
              <span className="font-display font-bold text-2xl text-white">
                Voyage<span className="gradient-text">AI</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm font-light">
              Your Journey. Your Budget. Your Perfect Plan.
              <br /><br />
              Autonomous, AI-powered travel planning that crafts customized, geographically cluster-aware day-wise itineraries tailored to your unique party dynamics and budget constraints.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-1">
              {socialLinks.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg bg-navy-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-accent-400 hover:border-accent-500/40 hover:bg-navy-850 transition-all"
                >
                  <social.icon size={15} />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Stay in the loop with travel guides
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 rounded-xl">
                  <CheckCircle2 size={16} />
                  <span>Thank you for subscribing to VoyageAI travel updates!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    id="newsletter-email"
                    name="newsletterEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-label="Enter your email for the newsletter"
                    placeholder="Enter your email"
                    className="flex-1 h-9 px-3.5 text-xs bg-navy-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-500 transition-colors"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to newsletter"
                    className="h-9 px-3.5 bg-accent-500 hover:bg-accent-600 active:scale-95 text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-accent-500/20"
                  >
                    <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-xs sm:text-sm text-slate-400 hover:text-accent-400 transition-colors inline-block"
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
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} VoyageAI. All rights reserved.
          </p>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            Built with <span className="text-accent-400">♥</span> for travelers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
