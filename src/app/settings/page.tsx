"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [defaultMode, setDefaultMode] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data.name) setName(data.name);
        if (data.age) setAge(data.age.toString());
        if (data.bio) setBio(data.bio);
        if (data.default_mode) setDefaultMode(data.default_mode);
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age: parseInt(age), bio, default_mode: defaultMode })
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Profile saved! Sathi will remember this.');
    } catch (e) {
      toast.error('Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-cream">Loading...</div>;

  return (
    <div className="min-h-screen bg-cream px-4 py-12 animate-fade-up">
      <div className="max-w-[600px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-[32px] font-bold text-ink">Settings</h1>
          <button onClick={() => router.push('/')} className="text-ink-soft hover:text-ink font-medium text-sm transition-colors">
            Back to App
          </button>
        </div>

        <div className="bg-ivory border-[1.5px] border-divider rounded-[24px] p-[32px] shadow-[0_12px_40px_rgba(30,24,16,.1)]">
          <h2 className="text-[18px] font-semibold text-ink mb-1">Personalization Memory</h2>
          <p className="text-[14px] text-ink-soft mb-6">Tell Sathi about yourself so Veer and Tara can give you better advice.</p>

          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-ink-soft uppercase tracking-wide">First Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Rahul"
                className="w-full bg-white border-[1.5px] border-divider rounded-lg px-4 py-3 font-sans text-[14px] text-ink outline-none transition-colors focus:border-gold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-ink-soft uppercase tracking-wide">Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="e.g. 24"
                className="w-full bg-white border-[1.5px] border-divider rounded-lg px-4 py-3 font-sans text-[14px] text-ink outline-none transition-colors focus:border-gold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-ink-soft uppercase tracking-wide">What are you struggling with?</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="e.g. Preparing for UPSC, feeling lonely after a breakup..."
                rows={3}
                className="w-full bg-white border-[1.5px] border-divider rounded-lg px-4 py-3 font-sans text-[14px] text-ink outline-none transition-colors focus:border-gold resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-ink-soft uppercase tracking-wide">Default Mode</label>
              <select
                value={defaultMode}
                onChange={e => setDefaultMode(e.target.value)}
                className="w-full bg-white border-[1.5px] border-divider rounded-lg px-4 py-3 font-sans text-[14px] text-ink outline-none transition-colors focus:border-gold"
              >
                <option value="general">General</option>
                <option value="student">Student</option>
                <option value="business">Business</option>
                <option value="job">Job</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-4 w-full py-[14px] border-none rounded-lg bg-gradient-to-br from-[#B8942A] to-[#D4AC3E] text-white font-sans text-[15px] font-semibold cursor-pointer transition-all shadow-[0_6px_22px_rgba(184,148,42,.35)] hover:-translate-y-1 hover:brightness-105 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
