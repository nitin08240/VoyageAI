import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';

export const Careers: React.FC = () => {
  const navigate = useNavigate();

  const principles = [
    {
      title: 'Craftsmanship Over Hype',
      description:
        'We build software that genuinely solves logistical friction. We care deeply about latency, geospatial accuracy, zero EPERM issues, and deterministic state management.',
    },
    {
      title: 'Radical User Empathy',
      description:
        'A traveler stranded in a high mountain valley with limited connectivity needs a responsive offline PDF and clean directions—not decorative marketing copy.',
    },
    {
      title: 'Autonomous Curiosity',
      description:
        'We value engineers and product thinkers who explore problem spaces independently, design robust architectures, and take immense pride in clean, maintainable code.',
    },
    {
      title: 'Transparent Culture',
      description:
        'No hidden agendas or artificial hierarchies. We debate ideas based on engineering merit, data validity, and user experience.',
    },
  ];

  return (
    <PageWrapper>
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-medium tracking-wide">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Careers & Opportunities</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
          Help Us Build the Next Generation of{' '}
          <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-amber-300 to-orange-400">
            Travel Intelligence
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light">
          We are a focused, design-obsessed engineering team passionate about maps, routing algorithms, generative AI, and real-world travel logistics.
        </p>
      </section>

      {/* ─── Current Hiring Status ───────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-navy-900/80 border border-slate-800 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-accent-400 font-semibold">
              Current Openings Notice
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              We Are Currently Not Actively Hiring
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed pt-1">
              While we do not have specific open headcount at this moment, our engineering philosophy is simple: we always make room for exceptional frontend architects, geospatial engineers, and full-stack creators.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            If you have built ambitious maps, optimized complex rendering pipelines, or have bold ideas for travel autonomy, we would love to hear from you.
          </div>

          <div className="pt-2">
            <Button
              size="md"
              variant="primary"
              onClick={() => navigate('/contact')}
              className="shadow-xl shadow-accent-500/25 px-6 font-semibold text-xs sm:text-sm"
            >
              <Mail className="w-4 h-4 mr-2" /> Introduce Yourself to the Team
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Culture & Principles ─────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            How We Work
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-light">
            Our values shape the way we engineer software and collaborate every day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {principles.map((p, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-2xl bg-navy-900/60 border border-slate-800/80 space-y-3"
            >
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-400 shrink-0" />
                <span>{p.title}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light pl-6">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
};

export default Careers;
