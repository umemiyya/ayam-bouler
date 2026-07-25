'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

import { Eye, EyeOff } from "lucide-react";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { registerAction } from '@/app/actions/auth';
import { registerSchema, type RegisterInput } from '@/validators/auth';
import { DetectionAnimation } from '@/components/auth/detection-animation';

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({
    // @ts-ignore
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'user' },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    try {
      const result = await registerAction(data);
      // Jika berhasil, server action akan redirect sehingga baris di bawah tidak tercapai.
      if (result && !result.success) {
        toast.error(result.error || 'Gagal membuat akun. Silakan coba lagi.');
      }
    } catch (err: any) {
      if (err?.digest?.startsWith?.('NEXT_REDIRECT')) throw err;
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* ================= LEFT: animated detection panel ================= */}
      <div className="relative hidden w-1/2 overflow-hidden bg-surface-2 lg:flex">
        <DetectionAnimation />
      </div>

      {/* ================= RIGHT: register form ================= */}
      <div className="flex w-full items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-accent-soft">
              <UserPlus className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Buat akun baru</h1>
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface p-6 shadow-sm">
            {/* @ts-ignore */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
      autoComplete="new-password"
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
      aria-label={
        showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"
      }
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

<div className="space-y-1.5">
  <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>

  <div className="relative">
    <Input
      id="confirmPassword"
      type={showConfirmPassword ? "text" : "password"}
      placeholder="••••••••"
      autoComplete="new-password"
      aria-invalid={!!errors.confirmPassword}
      className="pr-10"
      {...register("confirmPassword")}
    />

    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
      onClick={() => setShowConfirmPassword((prev) => !prev)}
      aria-label={
        showConfirmPassword
          ? "Sembunyikan konfirmasi kata sandi"
          : "Lihat konfirmasi kata sandi"
      }
    >
      {showConfirmPassword ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </Button>
  </div>

  {errors.confirmPassword && (
    <p className="text-sm text-destructive">
      {errors.confirmPassword.message}
    </p>
  )}
</div>

              <div className="space-y-1.5">
                <Label htmlFor="role">Daftar Sebagai</Label>
                <Controller
                  name="role"
                  control={control}
                  defaultValue="user"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message as string}</p>
                )}
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 shrink-0 animate-spin" />}
                <span>Daftar</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}