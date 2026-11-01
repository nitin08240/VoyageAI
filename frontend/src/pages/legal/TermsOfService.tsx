import React from 'react';
import { FileText, ShieldAlert, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';

export const TermsOfService: React.FC = () => {
  return (
    <PageWrapper>
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-mono">
            <Scale className="w-3.5 h-3.5" />
            <span>Platform Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs font-mono text-slate-500">
            Last Updated: November 2026 • VoyageAI Platform
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-8 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-400 shrink-0" />
              <span>1. Acceptance of Terms</span>
            </h2>
            <p>
              By accessing or using VoyageAI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree with any portion of these terms, please discontinue use of the platform.
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-accent-400 shrink-0" />
              <span>2. Informational & Planning Guidance Disclaimer</span>
            </h2>
            <p>
              VoyageAI is an intelligent planning assistant designed to help travelers brainstorm, sequence, and organize itineraries. While we verify locations and routes against geospatial databases and live weather services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                Estimated travel durations, driving routes, ticket costs, and opening hours are indicative guidance and may fluctuate due to seasonal mountain closures, strikes, or weather events.
              </li>
              <li>
                Travelers remain personally responsible for validating official visa requirements, permits (such as Rohtang Pass or Inner Line permits), local laws, and weather advisories prior to travel.
              </li>
              <li>
                VoyageAI is not a licensed travel agency or transport operator; booking reservations and ticket purchases remain between you and third-party vendors.
              </li>
            </ul>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent-400 shrink-0" />
              <span>3. User Accounts & Security</span>
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to suspend accounts engaged in abusive scraping, denial of service, or platform disruption.
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-accent-400 shrink-0" />
              <span>4. Intellectual Property & Exported Content</span>
            </h2>
            <p>
              You own all rights to your saved itineraries and custom trip notes. You are free to print, download, and share your PDF travel dossiers for personal or non-commercial group travel. The VoyageAI software, brand, algorithms, and interface design remain the intellectual property of VoyageAI.
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-accent-400 shrink-0" />
              <span>5. Limitation of Liability</span>
            </h2>
            <p>
              To the fullest extent permitted by law, VoyageAI shall not be liable for any indirect, incidental, or consequential damages resulting from your travel plans, weather disruptions, road closures, or reliance on generated estimates.
            </p>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default TermsOfService;

