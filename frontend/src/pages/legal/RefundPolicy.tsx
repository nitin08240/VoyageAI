import React from 'react';
import { RefreshCw, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';

export const RefundPolicy: React.FC = () => {
  return (
    <PageWrapper>
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Billing & Payments</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Refund Policy
          </h1>
          <p className="text-xs font-mono text-slate-500">
            Last Updated: November 2026 • VoyageAI Platform
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-8 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>1. Current Platform Status: 100% Free Access</span>
            </h2>
            <p>
              VoyageAI is currently offered as a free-to-use digital travel planning application. We do not charge subscription fees, generation credits, upfront platform memberships, or pay-per-export surcharges.
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent-400 shrink-0" />
              <span>2. Non-Applicability of Monetary Refunds</span>
            </h2>
            <p>
              Because VoyageAI does not process credit cards, collect payments, or charge user bank accounts, monetary refund requests are not applicable to the platform at this time.
            </p>
            <p className="text-slate-400">
              Any travel purchases you make outside VoyageAI (such as reserving hotels directly with booking providers, purchasing train or bus tickets, or booking tour operators) are subject entirely to the respective vendor's cancellation and refund policies.
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-accent-400 shrink-0" />
              <span>3. Future Paid Services Commitment</span>
            </h2>
            <p>
              If VoyageAI introduces optional premium paid services or collaborative team features in the future, comprehensive billing guidelines, cancellation terms, and a clear refund dispute window will be clearly documented and displayed to users prior to any payment processing.
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white">
              4. Questions or Inquiries
            </h2>
            <p>
              For any questions regarding our pricing, billing policies, or platform access, please reach out directly to our support team at <a href="mailto:support@voyageai.com" className="text-accent-400 hover:underline">support@voyageai.com</a>.
            </p>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default RefundPolicy;

