import React from 'react';
import { ShieldCheck, Lock, Eye, Database, Globe, UserCheck } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';

export const PrivacyPolicy: React.FC = () => {
  return (
    <PageWrapper>
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs font-mono text-slate-500">
            Last Updated: November 2026 • VoyageAI Platform
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-8 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-accent-400 shrink-0" />
              <span>1. Overview & Commitment</span>
            </h2>
            <p>
              VoyageAI values your privacy. This policy explains what information we collect when you use our website, trip planner, and AI travel assistant, and how that information is used, secured, and stored. We do not sell your personal data or broker it to advertising networks.
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-accent-400 shrink-0" />
              <span>2. Data We Collect</span>
            </h2>
            <p>We collect only the information necessary to provide and personalize our travel planning services:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                <strong className="text-slate-200">Account Information:</strong> When you register, we store your name, email address, and a securely hashed password (via bcryptjs).
              </li>
              <li>
                <strong className="text-slate-200">Trip Preferences:</strong> Destinations, start and end dates, party composition, budget limits, dietary notes, and pacing preferences that you submit to generate itineraries.
              </li>
              <li>
                <strong className="text-slate-200">Chat History:</strong> Conversational questions and tool results sent to the VoyageAI Assistant, stored to preserve your session history.
              </li>
              <li>
                <strong className="text-slate-200">Session Identifiers:</strong> Authentication JSON Web Tokens (JWT) stored in your browser's local storage or secure HTTP-only cookies.
              </li>
            </ul>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent-400 shrink-0" />
              <span>3. Third-Party Integrations</span>
            </h2>
            <p>
              To provide real-time atmospheric forecasts, verified photos, and geospatial routing, VoyageAI interacts with third-party service providers:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                <strong className="text-slate-200">OpenWeather:</strong> Destination coordinates are queried to retrieve 5-day weather conditions. No personal account data is shared.
              </li>
              <li>
                <strong className="text-slate-200">Unsplash:</strong> Destination names are used to query photography.
              </li>
              <li>
                <strong className="text-slate-200">OpenStreetMap / Nominatim:</strong> Used for map tile rendering, reverse geocoding, and OSRM routing calculations.
              </li>
              <li>
                <strong className="text-slate-200">MongoDB Atlas:</strong> Encrypted cloud database infrastructure where accounts, trips, and itineraries reside.
              </li>
            </ul>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent-400 shrink-0" />
              <span>4. Data Security & Storage</span>
            </h2>
            <p>
              All traffic between your browser and our servers is encrypted in transit using industry-standard TLS/HTTPS. Passwords are never stored in plain text. Backend endpoints enforce strict ownership validation ensuring that users cannot view or modify itineraries belonging to other accounts.
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-accent-400 shrink-0" />
              <span>5. Your Rights & Data Control</span>
            </h2>
            <p>
              You maintain full ownership of your travel data. You can delete individual itineraries, clear chat conversations, or request complete account deletion at any time by contacting our support team at <a href="mailto:support@voyageai.com" className="text-accent-400 hover:underline">support@voyageai.com</a>.
            </p>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default PrivacyPolicy;

