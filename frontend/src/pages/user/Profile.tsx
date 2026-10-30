import React, { useState } from 'react';
import { User, Mail, Save, CheckCircle2 } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { apiPatch } from '@/services/api';

export const Profile: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'USD');
  const [travelStyle, setTravelStyle] = useState(user?.preferences?.travelStyle || 'mid-range');
  const [accommodation, setAccommodation] = useState(user?.preferences?.accommodation || 'mid-range-hotel');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);

    try {
      await apiPatch('/users/profile', {
        name,
        preferences: {
          currency,
          travelStyle,
          accommodation,
        },
      });

      updateUser({
        name,
        preferences: {
          ...(user?.preferences as any),
          currency,
          travelStyle: travelStyle as any,
          accommodation: accommodation as any,
        },
      });

      setSuccessMsg('Your profile and travel defaults have been updated.');
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Traveler Profile</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Personal preferences configured here automatically tailor your AI generation runs.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-8 sm:p-10 rounded-3xl glass-card border border-white/10 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent-500 to-amber-400 text-white font-serif font-bold text-2xl flex items-center justify-center shadow-lg shadow-accent-500/20">
              {name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{name || 'Your Name'}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-accent-400" /> Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-navy-900/60 border-white/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> Email (Account ID)
              </label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-navy-950/40 border-white/5 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-white/10 text-white text-xs font-medium focus:border-accent-400 focus:outline-none"
              >
                {['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'SGD'].map((c) => (
                  <option key={c} value={c} className="bg-navy-950 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Default Travel Style
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-white/10 text-white text-xs font-medium focus:border-accent-400 focus:outline-none"
              >
                <option value="budget" className="bg-navy-950 text-white">Budget / Backpacker</option>
                <option value="mid-range" className="bg-navy-950 text-white">Balanced Comfort</option>
                <option value="luxury" className="bg-navy-950 text-white">Luxury & High-End</option>
                <option value="adventure" className="bg-navy-950 text-white">Adventure & Wilderness</option>
                <option value="cultural" className="bg-navy-950 text-white">Cultural Immersion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Default Stay Style
              </label>
              <select
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-white/10 text-white text-xs font-medium focus:border-accent-400 focus:outline-none"
              >
                <option value="hostel" className="bg-navy-950 text-white">Hostel / Dorm</option>
                <option value="budget-hotel" className="bg-navy-950 text-white">Budget Hotel</option>
                <option value="mid-range-hotel" className="bg-navy-950 text-white">Standard 3-4★ Hotel</option>
                <option value="luxury-hotel" className="bg-navy-950 text-white">5★ Luxury Hotel</option>
                <option value="resort" className="bg-navy-950 text-white">Resort & Spa</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              className="text-xs font-semibold shadow-lg shadow-accent-500/20"
            >
              <Save className="w-4 h-4 mr-1.5" /> Save Preferences
            </Button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default Profile;
