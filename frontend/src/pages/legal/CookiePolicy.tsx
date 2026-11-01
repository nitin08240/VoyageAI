import React from 'react';
import { Cookie, ShieldCheck, Check, Settings } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';

export const CookiePolicy: React.FC = () => {
  return (
    <PageWrapper>
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-mono">
            <Cookie className="w-3.5 h-3.5" />
            <span>Browser Storage</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-xs font-mono text-slate-500">
            Last Updated: November 2026 • VoyageAI Platform
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-8 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <Cookie className="w-4 h-4 text-accent-400 shrink-0" />
              <span>1. What Are Cookies and Local Storage?</span>
            </h2>
            <p>
              Cookies and local browser storage are small text files or key-value stores placed on your device by websites you visit. They are widely used to make websites work properly, provide a secure login state, and remember your session preferences.
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent-400 shrink-0" />
              <span>2. How VoyageAI Uses Cookies</span>
            </h2>
            <p>VoyageAI uses minimal, strictly necessary cookies and local storage tokens:</p>
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">voyage_token / voyage-auth</span>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                    Essential
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Holds your encrypted JSON Web Token (JWT) session so you remain logged in while navigating between the dashboard, itinerary builder, and chatbot without having to re-authenticate on every page load.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">UI State & Preferences</span>
                  <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">
                    Functional
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Temporarily caches step progress in the trip creation wizard so that if you accidentally refresh, your companion count and dates are preserved.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>3. No Third-Party Advertising Cookies</span>
            </h2>
            <p>
              VoyageAI does not use third-party behavioral tracking cookies, Facebook pixels, or cross-site ad retargeting networks. We respect your digital privacy.
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-accent-400 shrink-0" />
              <span>4. Managing Your Cookies</span>
            </h2>
            <p>
              You can control and clear cookies through your browser settings. However, disabling all local storage and cookies will prevent you from signing in to your account and accessing saved itineraries.
            </p>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default CookiePolicy;

