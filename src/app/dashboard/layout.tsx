import type { ReactNode } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Navbar from '@/components/layout/Navbar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 bg-background">
          {children}
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} J-INvest. Todos los derechos reservados.
        </footer>
      </div>
    </AuthGuard>
  );
}
