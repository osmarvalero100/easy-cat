'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, User, Eye, EyeOff, Loader2, Check, ArrowRight, BookOpen } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check if already authenticated on mount
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data?.authenticated) {
            router.replace(redirectPath);
          }
        }
      } catch {
        // Not logged in, stay on page
      }
    }
    checkExistingSession();
  }, [redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login'
        ? { email: email.trim(), password }
        : { email: email.trim(), password, name: name.trim() };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Ocurrió un error. Por favor intenta nuevamente.');
        setIsLoading(false);
        return;
      }

      setSuccessMsg(
        mode === 'login'
          ? `¡Bienvenido de nuevo, ${data.user?.name || data.user?.email}!`
          : '¡Cuenta creada con éxito! Redirigiendo a tus proyectos...'
      );

      setTimeout(() => {
        router.push(redirectPath);
        router.refresh();
      }, 500);
    } catch (err) {
      console.error('Auth submit error:', err);
      setErrorMsg('No se pudo conectar con el servidor. Revisa tu conexión.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200/90 p-8 sm:p-10 backdrop-blur-md">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-900 text-amber-50 mx-auto flex items-center justify-center p-3 shadow-md mb-3">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
          Easy Cat
        </h1>
        <p className="text-xs uppercase tracking-widest text-amber-800 font-semibold mt-1">
          Generador Editorial de Catálogos
        </p>
        <p className="text-xs text-stone-500 mt-2">
          Gestiona múltiples marcas, colecciones de temporada y catálogos listos para imprimir o compartir
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-6">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMsg(null);
          }}
          className={`flex-1 pb-3 text-sm font-medium transition-all text-center relative ${
            mode === 'login'
              ? 'text-stone-900 font-semibold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          Iniciar Sesión
          {mode === 'login' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800 rounded-full" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setErrorMsg(null);
          }}
          className={`flex-1 pb-3 text-sm font-medium transition-all text-center relative ${
            mode === 'register'
              ? 'text-stone-900 font-semibold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          Crear Cuenta
          {mode === 'register' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800 rounded-full" />
          )}
        </button>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
          <span className="font-bold flex-shrink-0">✕</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start space-x-2">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Tu Nombre / Emprendedor
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Ana Gómez"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800 transition"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 mt-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>{mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...'}</span>
            </>
          ) : (
            <>
              <span>{mode === 'login' ? 'Entrar a Easy Cat' : 'Crear Cuenta y Comenzar'}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <Suspense fallback={<div className="text-stone-500 text-sm">Cargando...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
