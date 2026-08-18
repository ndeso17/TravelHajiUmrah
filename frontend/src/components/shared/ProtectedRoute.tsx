import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { Role } from '../../api/types';
import { useAuthStore } from '../../store/authStore';

export type ProtectedRouteProps = {
  readonly roles?: readonly Role[];
  readonly children: ReactNode;
};

export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
