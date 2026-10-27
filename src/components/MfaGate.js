import { useCallback, useEffect, useState } from 'react';
import { Copy, KeyRound, LogOut, ShieldCheck, Smartphone } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ADMIN_FACTOR_NAME = 'HidayahMY Admin';

function cleanCode(value) {
  return value.replace(/\D/g, '').slice(0, 6);
}

export default function MfaGate({ onVerified, onLogout }) {
  const [mode, setMode] = useState('checking');
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const prepareMfa = useCallback(async () => {
    setError('');

    const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance.error) throw assurance.error;

    if (assurance.data.currentLevel === 'aal2') {
      onVerified();
      return;
    }

    const factors = await supabase.auth.mfa.listFactors();
    if (factors.error) throw factors.error;

    const verifiedFactor = factors.data.totp?.find((factor) => factor.status === 'verified');
    if (verifiedFactor) {
      setFactorId(verifiedFactor.id);
      setMode('challenge');
      return;
    }

    // Remove abandoned setup attempts before creating a fresh QR code. This
    // avoids accumulating unusable unverified factors after a closed tab.
    const unverifiedTotp = factors.data.all.filter(
      (factor) => factor.factor_type === 'totp' && factor.status === 'unverified'
    );
    const cleanupResults = await Promise.all(
      unverifiedTotp.map((factor) => supabase.auth.mfa.unenroll({ factorId: factor.id }))
    );
    const cleanupError = cleanupResults.find((result) => result.error)?.error;
    if (cleanupError) throw cleanupError;

    const enrollment = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: ADMIN_FACTOR_NAME,
    });
    if (enrollment.error) throw enrollment.error;

    setFactorId(enrollment.data.id);
    setQrCode(enrollment.data.totp.qr_code);
    setSecret(enrollment.data.totp.secret);
    setMode('enroll');
  }, [onVerified]);

  useEffect(() => {
    prepareMfa().catch((setupError) => {
      setError(setupError.message || 'Unable to prepare two-step verification.');
      setMode('error');
    });
  }, [prepareMfa]);

  const verify = async (event) => {
    event.preventDefault();
    if (code.length !== 6 || !factorId || submitting) return;

    setSubmitting(true);
    setError('');
    try {
      const result = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
      if (result.error) throw result.error;

      const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assurance.error || assurance.data.currentLevel !== 'aal2') {
        throw assurance.error || new Error('Two-step verification was not completed.');
      }

      onVerified();
    } catch (verifyError) {
      setCode('');
      setError(
        verifyError.code === 'mfa_verification_failed'
          ? 'That code is incorrect or has expired. Enter the latest code and try again.'
          : verifyError.message || 'Verification failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Could not copy automatically. Select and copy the key manually.');
    }
  };

  if (mode === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/60">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <ShieldCheck size={26} strokeWidth={2} />
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          {mode === 'enroll' ? 'Secure your admin account' : 'Two-step verification'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {mode === 'enroll'
            ? 'Scan this QR code with Google Authenticator, then enter the 6-digit code to finish setup.'
            : 'Enter the current 6-digit code from Google Authenticator to continue to the dashboard.'}
        </p>

        {mode === 'enroll' && qrCode && (
          <div className="mt-6">
            <div className="mx-auto w-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <img src={qrCode} alt="Google Authenticator setup QR code" className="h-48 w-48" />
            </div>
            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Smartphone size={14} /> Manual setup key
              </div>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 break-all text-sm font-semibold tracking-wider text-slate-800">
                  {secret}
                </code>
                <button
                  type="button"
                  onClick={copySecret}
                  className="shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-blue-700"
                  aria-label="Copy setup key"
                >
                  <Copy size={16} />
                </button>
              </div>
              {copied && <p className="mt-1 text-xs font-medium text-emerald-600">Setup key copied.</p>}
            </div>
          </div>
        )}

        {mode !== 'error' && (
          <form onSubmit={verify} className="mt-6">
            <label htmlFor="mfa-code" className="block text-xs font-semibold text-slate-600">
              Authentication code
            </label>
            <div className="relative mt-2">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                value={code}
                onChange={(event) => setCode(cleanCode(event.target.value))}
                placeholder="000000"
                autoFocus={mode === 'challenge'}
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-center text-xl font-semibold tracking-[0.4em] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {error && (
              <div role="alert" className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={code.length !== 6 || submitting}
              className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {submitting ? 'Verifying...' : mode === 'enroll' ? 'Enable & continue' : 'Verify & continue'}
            </button>
          </form>
        )}

        {mode === 'error' && (
          <div className="mt-6">
            <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
            <button
              type="button"
              onClick={() => {
                setMode('checking');
                prepareMfa().catch((retryError) => {
                  setError(retryError.message || 'Unable to prepare two-step verification.');
                  setMode('error');
                });
              }}
              className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Try again
            </button>
          </div>
        )}

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          MFA is required for every HidayahMY admin account.
        </p>
      </div>
    </div>
  );
}
