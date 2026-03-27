import type { ReactNode } from "react";

export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background bg-radial-top">
      {children}
    </div>
  );
}
