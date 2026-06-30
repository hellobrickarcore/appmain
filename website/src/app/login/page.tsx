"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AlertCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let authError;

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      authError = error;
      if (!error) {
        // Automatically sign them in after sign up if email confirmation isn't required by default
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        authError = signInErr;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      authError = error;
    }

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      {/* Left side branding */}
      <div className="hidden md:flex flex-1 bg-[#FFCE4A] p-12 flex-col justify-between relative overflow-hidden">
         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 10px 10px, rgba(0,0,0,0.1) 4px, transparent 0)", backgroundSize: "40px 40px" }} />
         
         <div className="relative z-10">
           <a href="/" className="flex items-center gap-3 w-fit">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 shadow-sm">
                <div className="w-full h-full bg-[#FF7A30] rounded-xl flex items-center justify-center gap-1.5">
                  <div className="w-2 h-2 bg-black/20 rounded-full" />
                  <div className="w-2 h-2 bg-black/20 rounded-full" />
                </div>
              </div>
              <span className="font-display font-bold text-3xl tracking-tighter text-[#050A18]">HelloBrick</span>
           </a>
         </div>

         <div className="relative z-10 max-w-md">
            <h1 className="font-display text-5xl font-bold leading-[1.1] mb-6 text-[#050A18]">
              Your collection, beautifully organized.
            </h1>
            <p className="text-gray-800 text-lg font-medium">
              Join thousands of builders tracking their inventory, discovering new builds, and connecting with the community.
            </p>
         </div>

         {/* Decorative graphic */}
         <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#FF7A30] rounded-full blur-3xl opacity-50" />
      </div>

      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative">
        <a href="/" className="md:hidden flex items-center gap-2 mb-12 absolute top-6 left-6">
           <div className="w-8 h-8 bg-[#FFCE4A] rounded-lg flex items-center justify-center p-1">
             <div className="w-full h-full bg-[#FF7A30] rounded-md flex items-center justify-center gap-1">
               <div className="w-1 h-1 bg-black/20 rounded-full" />
               <div className="w-1 h-1 bg-black/20 rounded-full" />
             </div>
           </div>
           <span className="font-display font-bold text-xl tracking-tighter text-[#050A18]">HelloBrick</span>
        </a>

        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h2 className="font-display text-4xl font-bold text-[#050A18] mb-3">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-gray-500">
              {isSignUp ? "Start organizing your LEGO collection today." : "Log in to view your live portfolio and dashboard."}
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm mb-6"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm font-medium text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 mb-6"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF7A30] focus:bg-white transition-all font-medium text-gray-900"
                placeholder="builder@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF7A30] focus:bg-white transition-all font-medium text-gray-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF7A30] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#E66620] transition-colors shadow-lg shadow-[#FF7A30]/20 disabled:opacity-50 mt-4"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
          
          <p className="text-center text-sm font-medium text-gray-500 mt-8">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-[#FF7A30] hover:text-[#E66620] transition-colors"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
