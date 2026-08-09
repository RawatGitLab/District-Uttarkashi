import React, { useState } from "react";
import { Compass, User, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);

    try {
      // 1. Try server-side authentication endpoint
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onLoginSuccess();
          return;
        }
      }

      // 2. Fallback check against client environment variables if offline/direct
      const metaEnv = (import.meta as any).env || {};
      const envUser = metaEnv.VITE_AUTH_USERNAME;
      const envPass = metaEnv.VITE_AUTH_PASSWORD;

      if (username === envUser && password === envPass) {
        onLoginSuccess();
        return;
      }

      setError("Invalid username or password");
    } catch (err) {
      console.warn("API login error, trying fallback check:", err);
      // Fallback check against env vars
      const metaEnv = (import.meta as any).env || {};
      const envUser = metaEnv.VITE_AUTH_USERNAME;
      const envPass = metaEnv.VITE_AUTH_PASSWORD;

      if (username === envUser && password === envPass) {
        onLoginSuccess();
      } else {
        setError("Invalid username or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/70 animate-fade-in font-sans pointer-events-auto transition-colors duration-300">
      <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-9 shadow-2xl flex flex-col items-center transition-all duration-300 relative">
        
        {/* Top Circular Badge */}
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mt-2 mb-4 shadow-sm">
          <Compass className="w-8 h-8 stroke-[1.75] animate-pulse-slow" />
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight text-center">
          Uttarkashi Geoportal
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center max-w-[280px] mt-2 mb-6 leading-relaxed">
          Authorized Access Only. Please sign in to explore interactive district maps &amp; planners.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col">
          {/* Username Field */}
          <label className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-1.5 self-start">
            USERNAME
          </label>
          <div className="w-full relative flex items-center bg-slate-100/90 dark:bg-slate-800/70 focus-within:bg-white dark:focus-within:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 rounded-xl px-3.5 py-3 transition-all shadow-inner">
            <User className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2.5 shrink-0" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="bg-transparent text-sm text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none w-full"
              autoComplete="username"
              required
            />
          </div>

          {/* Password Field */}
          <label className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-1.5 mt-4 self-start">
            PASSWORD
          </label>
          <div className="w-full relative flex items-center bg-slate-100/90 dark:bg-slate-800/70 focus-within:bg-white dark:focus-within:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 rounded-xl px-3.5 py-3 transition-all shadow-inner">
            <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2.5 shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="bg-transparent text-sm text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none w-full pr-8"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-1"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full mt-3.5 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs text-center font-semibold animate-shake">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Explore Geoportal</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-800 my-6" />

        {/* Footer Text */}
        <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-slate-400 dark:text-slate-500" />
          <span>UTTARKASHI • GEOPORTAL</span>
        </div>

      </div>
    </div>
  );
}
