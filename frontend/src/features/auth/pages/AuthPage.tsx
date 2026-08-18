import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { useAuthStore } from '../../../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Minimal 6 karakter'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function AuthPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginForm) {
    try {
      await login(values);
      const role = useAuthStore.getState().user?.role;
      navigate(role === 'JAMAAH' ? '/jamaah/dashboard' : '/admin/dashboard', { replace: true });
    } catch {
      setError('root', { message: 'Email atau password salah' });
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-md border border-surface-muted px-3 py-2 text-sm outline-none focus:border-primary"
            {...register('email')}
          />
          {errors.email ? <p className="mt-1 text-xs text-danger">{errors.email.message}</p> : null}
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-ink">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-md border border-surface-muted px-3 py-2 text-sm outline-none focus:border-primary"
            {...register('password')}
          />
          {errors.password ? <p className="mt-1 text-xs text-danger">{errors.password.message}</p> : null}
        </div>
        {errors.root ? <p className="text-xs text-danger">{errors.root.message}</p> : null}
        <button type="submit" disabled={isSubmitting} className="cta-pill w-full disabled:opacity-60">
          {isSubmitting ? 'Masuk...' : 'Masuk'}
        </button>
      </form>
    </AuthLayout>
  );
}
