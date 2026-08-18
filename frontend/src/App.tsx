import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { ScrollManager } from './components/shared/ScrollManager';
import { AuthPage } from './features/auth/pages/AuthPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { DokumenListPage } from './features/dokumen/pages/DokumenListPage';
import { JamaahDetailPage } from './features/jamaah/pages/JamaahDetailPage';
import { JamaahFormPage } from './features/jamaah/pages/JamaahFormPage';
import { JamaahListPage } from './features/jamaah/pages/JamaahListPage';
import { LaporanPage } from './features/laporan/pages/LaporanPage';
import { ManifestDetailPage } from './features/manifest/pages/ManifestDetailPage';
import { ManifestListPage } from './features/manifest/pages/ManifestListPage';
import { NotifikasiPage } from './features/notifikasi/pages/NotifikasiPage';
import { PaketFormPage } from './features/paket/pages/PaketFormPage';
import { PaketListPage } from './features/paket/pages/PaketListPage';
import { PembayaranDetailPage } from './features/pembayaran/pages/PembayaranDetailPage';
import { PembayaranListPage } from './features/pembayaran/pages/PembayaranListPage';
import { UserManagementPage } from './features/users/pages/UserManagementPage';
import { PortalDashboardPage } from './features/portal/pages/PortalDashboardPage';
import { PortalDokumenPage } from './features/portal/pages/PortalDokumenPage';
import { PortalPembayaranPage } from './features/portal/pages/PortalPembayaranPage';
import { PortalProfilPage } from './features/portal/pages/PortalProfilPage';
import { PublicShell } from './features/public/components/PublicShell';
import { LandingPage } from './features/public/pages/LandingPage';
import { PublicPackagesPage } from './features/public/pages/PublicPackagesPage';
import { PublicPackageDetailPage } from './features/public/pages/PublicPackageDetailPage';
import { RegisterJamaahPage } from './features/public/pages/RegisterJamaahPage';
import { AdminLayout } from './layouts/AdminLayout';
import { JamaahLayout } from './layouts/JamaahLayout';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'STAFF'] as const;

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
      <Route path="/login" element={<AuthPage />} />

      <Route element={<PublicShell />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/daftar" element={<PublicPackagesPage />} />
        <Route path="/paket/:id" element={<PublicPackageDetailPage />} />
        <Route path="/daftar/:paketId" element={<RegisterJamaahPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/paket" element={<PaketListPage />} />
        <Route path="/admin/paket/baru" element={<PaketFormPage />} />
        <Route path="/admin/paket/:id/edit" element={<PaketFormPage />} />
        <Route path="/admin/jamaah" element={<JamaahListPage />} />
        <Route path="/admin/jamaah/baru" element={<JamaahFormPage />} />
        <Route path="/admin/jamaah/:id" element={<JamaahDetailPage />} />
        <Route path="/admin/manifest" element={<ManifestListPage />} />
        <Route path="/admin/manifest/:kloter" element={<ManifestDetailPage />} />
        <Route path="/admin/pembayaran" element={<PembayaranListPage />} />
        <Route path="/admin/pembayaran/:id" element={<PembayaranDetailPage />} />
        <Route path="/admin/dokumen" element={<DokumenListPage />} />
        <Route path="/admin/laporan" element={<LaporanPage />} />
        <Route path="/admin/notifikasi" element={<NotifikasiPage />} />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        element={
          <ProtectedRoute roles={['JAMAAH']}>
            <JamaahLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/jamaah/dashboard" element={<PortalDashboardPage />} />
        <Route path="/jamaah/dokumen" element={<PortalDokumenPage />} />
        <Route path="/jamaah/pembayaran" element={<PortalPembayaranPage />} />
        <Route path="/jamaah/profil" element={<PortalProfilPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
