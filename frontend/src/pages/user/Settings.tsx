import React, { useState } from 'react';
import { Lock, Bell, LogOut, CheckCircle2 } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setStatusMsg(null);

    // Mock/Simulated password update feedback
    setTimeout(() => {
      setIsUpdating(false);
      setStatusMsg('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    }, 800);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Security & Preferences</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage your credentials, notifications, and active sessions.
          </p>
        </div>

        {statusMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Change Password Card */}
        <form onSubmit={handlePasswordChange} className="p-8 rounded-3xl glass-card border border-white/10 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-accent-400" />
            <h3 className="text-base font-bold text-white">Change Password</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Current Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="bg-navy-900/60 border-white/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                New Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-navy-900/60 border-white/10"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              isLoading={isUpdating}
              className="text-xs font-semibold"
            >
              Update Password
            </Button>
          </div>
        </form>

        {/* Notifications Card */}
        <div className="p-8 rounded-3xl glass-card border border-white/10 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-accent-400" />
            <h3 className="text-base font-bold text-white">Notification Preferences</h3>
          </div>

          <div className="space-y-3">
            <label htmlFor="settings-email-alerts" className="flex items-center justify-between p-3.5 rounded-2xl bg-navy-900/40 border border-white/5 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-white">Trip Generation Emails</div>
                <div className="text-[11px] text-slate-400">Receive downloadable PDF links when generation completes</div>
              </div>
              <input
                id="settings-email-alerts"
                name="emailAlerts"
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-white/20 text-accent-500 focus:ring-accent-500 bg-navy-950 w-4 h-4"
              />
            </label>

            <label htmlFor="settings-budget-alerts" className="flex items-center justify-between p-3.5 rounded-2xl bg-navy-900/40 border border-white/5 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-white">Budget Variance Warnings</div>
                <div className="text-[11px] text-slate-400">Get highlighted warnings if live rate estimates exceed threshold</div>
              </div>
              <input
                id="settings-budget-alerts"
                name="budgetAlerts"
                type="checkbox"
                checked={budgetAlerts}
                onChange={(e) => setBudgetAlerts(e.target.checked)}
                className="rounded border-white/20 text-accent-500 focus:ring-accent-500 bg-navy-950 w-4 h-4"
              />
            </label>
          </div>
        </div>

        {/* Session / Danger Zone */}
        <div className="p-8 rounded-3xl glass-card border border-red-500/20 bg-red-950/10 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-red-300">Active Session</h3>
            <p className="text-xs text-red-200/70 mt-0.5">End your current session across all browser windows.</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            className="text-xs font-semibold"
          >
            <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Settings;
