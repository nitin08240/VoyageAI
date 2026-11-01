import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { apiPost } from '@/services/api';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Please enter your name (at least 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!formData.message.trim() || formData.message.trim().length < 15) {
      errs.message = 'Please provide a message of at least 15 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await apiPost('/users/contact', formData);
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: '',
      });
      setErrors({});
    } catch (err: any) {
      console.error('Contact form submission error:', err);
      setServerError(
        err.response?.data?.message ||
          'Failed to send message. Please verify your connection or write directly to support@voyageai.com.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-medium tracking-wide">
          <Mail className="w-3.5 h-3.5" />
          <span>Contact & Support</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
          We Would Love to{' '}
          <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-amber-300 to-orange-400">
            Hear From You
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-light">
          Have feedback, a destination inquiry, a bug report, or want to collaborate? Send our team a note below.
        </p>
      </section>

      {/* ─── Main Content ────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-6">
              <h3 className="text-xl font-serif font-bold text-white">
                Contact Information
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
                Whether you are encountering an itinerary discrepancy or want to suggest new regional destinations, our team reads every message.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                      Support & General Inquiries
                    </span>
                    <a
                      href="mailto:support@voyageai.com"
                      className="text-xs sm:text-sm text-white hover:text-accent-400 transition-colors font-medium"
                    >
                      support@voyageai.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                      Response SLA
                    </span>
                    <span className="text-xs sm:text-sm text-slate-200">
                      Within 24–48 business hours
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                      Instant Help
                    </span>
                    <span className="text-xs sm:text-sm text-slate-200">
                      Chat with the VoyageAI Assistant directly via the bottom-right widget
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-10 rounded-3xl bg-navy-900/80 border border-slate-800 shadow-xl">
              {isSuccess ? (
                <div className="text-center py-10 space-y-4 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white">
                    Message Sent Successfully
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto font-light leading-relaxed">
                    Thank you for reaching out. We have received your inquiry and our team will get back to you shortly.
                  </p>
                  <Button
                    size="md"
                    variant="secondary"
                    onClick={() => setIsSuccess(false)}
                    className="text-xs font-semibold px-6"
                  >
                    Send Another Note
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-serif font-bold text-white mb-2">
                    Send Us a Message
                  </h3>

                  {serverError && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Name <span className="text-accent-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Alex Sharma"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                        errors.name
                          ? 'border-red-500/60 focus:border-red-500'
                          : 'border-slate-800 focus:border-accent-500'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Email Address <span className="text-accent-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="alex@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                        errors.email
                          ? 'border-red-500/60 focus:border-red-500'
                          : 'border-slate-800 focus:border-accent-500'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Topic selection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Topic / Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-accent-500 transition-colors"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Itinerary Feedback">Itinerary Feedback & Suggestions</option>
                      <option value="Bug Report">Technical Bug Report</option>
                      <option value="Partnership">Partnership or Collaboration</option>
                      <option value="Careers">Engineering / Career Inquiry</option>
                    </select>
                  </div>

                  {/* Message field */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Message <span className="text-accent-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Describe your inquiry, feedback, or suggestion in detail..."
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors resize-none ${
                        errors.message
                          ? 'border-red-500/60 focus:border-red-500'
                          : 'border-slate-800 focus:border-accent-500'
                      }`}
                    />
                    {errors.message && (
                      <p className="text-[11px] text-red-400 mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="md"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full shadow-lg shadow-accent-500/20 text-xs sm:text-sm font-semibold py-3 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Contact;
