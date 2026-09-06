"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Zap, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Please enter a valid work email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [selectedDemo, setSelectedDemo] = useState<string>("admin");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "sophia@meridianagency.com",
      password: "demo1234",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError("");
    const { error } = await login(values.email, values.password);
    if (error) setServerError(error);
  };

  const handleSelectRole = (roleKey: string, email: string) => {
    setSelectedDemo(roleKey);
    setValue("email", email, { shouldValidate: true });
    setValue("password", "demo1234", { shouldValidate: true });
    setServerError("");
  };

  const DEMO_PERSONAS = [
    {
      key: "admin",
      role: "Agency Admin",
      name: "Sophia Reyes",
      email: "sophia@meridianagency.com",
      badge: "Full Control",
    },
    {
      key: "team",
      role: "Project Manager",
      name: "Marcus Webb",
      email: "marcus@meridianagency.com",
      badge: "Operations",
    },
    {
      key: "client",
      role: "Client Executive",
      name: "Ethan Blackwell",
      email: "ethan@halcyonventures.com",
      badge: "External Portal",
    },
  ];

  return (
    <div className="w-full max-w-md">
      {/* Elevated Executive Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/60 p-7 sm:p-9 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 mb-1">
            <Zap className="w-6 h-6 fill-current text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">NexOps Enterprise</h1>
          <p className="text-sm text-slate-500 font-normal">
            B2B Client Operations & Automation Engine
          </p>
        </div>

        {/* Demo Persona Quick Select */}
        <div className="space-y-2.5 pt-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Select Demo Account
          </label>
          <div className="grid grid-cols-1 gap-2">
            {DEMO_PERSONAS.map(p => {
              const isSelected = selectedDemo === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleSelectRole(p.key, p.email)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                    isSelected
                      ? "bg-blue-50/70 border-blue-500 ring-1 ring-blue-500/30 text-blue-950 shadow-xs"
                      : "bg-slate-50/60 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300 text-slate-800"
                  )}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{p.role}</span>
                      <span className={cn(
                        "text-[11px] font-semibold px-2 py-0.5 rounded-full border",
                        isSelected
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-white text-slate-500 border-slate-200"
                      )}>
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{p.name} · {p.email}</p>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 opacity-0 group-hover:opacity-100" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200" />
          <span className="flex-shrink mx-3 text-xs uppercase font-medium text-slate-400 tracking-wider">Credentials</span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block" htmlFor="email">
              Work Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={cn("input text-sm", errors.email && "error")}
              placeholder="name@company.com"
              {...register("email")}
            />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700" htmlFor="password">
                Password
              </label>
              <span className="text-xs text-slate-400 font-mono">Demo: demo1234</span>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className={cn("input text-sm pr-10", errors.password && "error")}
                placeholder="••••••••"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          {serverError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full py-2.5 text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20"
            id="btn-login"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Authenticating session…
              </span>
            ) : (
              "Sign In to Workspace"
            )}
          </button>
        </form>

        {/* Security & Compliance Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SOC-2 Certified · 256-bit TLS · Multi-Tenant Isolation</span>
        </div>
      </div>
    </div>
  );
}
