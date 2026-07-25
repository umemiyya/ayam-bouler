'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, User as UserIcon, LockKeyhole } from 'lucide-react';

import { Eye, EyeOff } from "lucide-react";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginAction } from '@/app/actions/auth';
import { loginSchema, type LoginInput } from '@/validators/auth';
import type { UserRole } from '@/types/auth';

export default function LoginPage() {
  const [submittingRole, setSubmittingRole] = useState<UserRole | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const isSubmitting = submittingRole !== null;

  const onSubmit = async (data: LoginInput, role: UserRole) => {
    setSubmittingRole(role);
    try {
      const result = await loginAction({ ...data, role });
      // Jika berhasil, server action akan redirect sehingga baris di bawah tidak tercapai.
      if (result && !result.success) {
        toast.error(result.error || 'Gagal masuk. Silakan coba lagi.');
      }
    } catch (err: any) {
      // Next.js redirect() melempar error khusus (NEXT_REDIRECT) — abaikan itu.
      if (err?.digest?.startsWith?.('NEXT_REDIRECT')) throw err;
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmittingRole(null);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* ================= LEFT: animated detection panel ================= */}
      <div className="relative hidden w-1/2 overflow-hidden bg-surface-2 lg:flex">
        <DetectionAnimation />
      </div>

      {/* ================= RIGHT: login form ================= */}
      <div className="flex w-full items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-accent-soft">
              <LockKeyhole className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Masuk ke akun Anda</h1>
            <p className="text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface p-6 shadow-sm">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="username_anda"
                    autoComplete="username"
                    aria-invalid={!!errors.username}
                    {...register('username')}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username.message}</p>
                  )}
                </div>

<div className="space-y-1.5">
  <Label htmlFor="password">Kata Sandi</Label>

  <div className="relative">
    <Input
      id="password"
      type={showPassword ? "text" : "password"}
      placeholder="••••••••"
      autoComplete="current-password"
      aria-invalid={!!errors.password}
      className="pr-10"
      {...register("password")}
    />

    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
      onClick={() => setShowPassword((prev) => !prev)}
      aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
    >
      {showPassword ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </Button>
  </div>

  {errors.password && (
    <p className="text-sm text-destructive">
      {errors.password.message}
    </p>
  )}
</div>
              </div>

              <div className="space-y-3 pt-1">
                <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-2">
                  Masuk sebagai
                </p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={handleSubmit((data) => onSubmit(data, 'user'))}
                    disabled={isSubmitting}
                  >
                    {submittingRole === 'user' ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    ) : (
                      <UserIcon className="h-4 w-4 shrink-0" />
                    )}
                    <span>User</span>
                  </Button>
                  <Button
                    type="button"
                    className="gap-2"
                    onClick={handleSubmit((data) => onSubmit(data, 'admin'))}
                    disabled={isSubmitting}
                  >
                    {submittingRole === 'admin' ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                    )}
                    <span>Admin</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DetectionAnimation
 * Visual bertema "deteksi & hitung" — kotak viewfinder muncul di titik-titik
 * acak, garis scan bergerak turun berulang, dan counter di tengah berjalan
 * naik. Semua murni CSS keyframes + satu interval kecil untuk counter.
 */
function DetectionAnimation() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => (c >= 128 ? 0 : c + 1));
    }, 90);
    return () => clearInterval(id);
  }, []);

  const boxes = [
    { top: '18%', left: '22%', size: 56, delay: '0s' },
    { top: '62%', left: '14%', size: 44, delay: '0.6s' },
    { top: '32%', left: '68%', size: 60, delay: '1.2s' },
    { top: '70%', left: '60%', size: 48, delay: '1.8s' },
    { top: '48%', left: '42%', size: 40, delay: '2.4s' },
    { top: '12%', left: '78%', size: 46, delay: '3s' },
  ];

  return (
    <div className="scan-grid relative flex h-full w-full items-center justify-center">
      {/* garis scan bergerak turun */}
      <div className="scan-line pointer-events-none absolute inset-x-0 top-0 h-24" />

      {/* kotak-kotak deteksi */}
      {boxes.map((b, i) => (
        <div
          key={i}
          className="detection-box absolute rounded-md border-2 border-accent"
          style={{
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            animationDelay: b.delay,
          }}
        >
          <span className="detection-tag absolute -top-5 left-0 rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-mono font-medium text-accent-foreground">
            ayam
          </span>
        </div>
      ))}

      {/* counter besar di tengah */}
      <div className="relative hidden z-10 flex flex-col items-center gap-2 rounded-2xl border border-border-subtle bg-surface/70 px-10 py-8 backdrop-blur-sm">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-2">
          Total terdeteksi
        </span>
        <span className="font-display text-6xl font-bold tabular-nums text-foreground">
          {count}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-confirmed">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-confirmed" />
          live scanning
        </span>
      </div>

      <style>{`
        .scan-line {
          background: linear-gradient(
            to bottom,
            var(--accent-soft) 0%,
            transparent 100%
          );
          animation: scan-move 4s ease-in-out infinite;
        }

        @keyframes scan-move {
          0% {
            transform: translateY(-6rem);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }

        .detection-box {
          opacity: 0;
          animation: box-appear 4.5s ease-in-out infinite;
        }

        @keyframes box-appear {
          0% {
            opacity: 0;
            transform: scale(0.85);
          }
          8% {
            opacity: 1;
            transform: scale(1);
          }
          35% {
            opacity: 1;
            transform: scale(1);
          }
          45% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 0;
            transform: scale(0.9);
          }
        }

        .detection-tag {
          opacity: inherit;
        }

        @media (prefers-reduced-motion: reduce) {
          .scan-line,
          .detection-box {
            animation: none;
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}