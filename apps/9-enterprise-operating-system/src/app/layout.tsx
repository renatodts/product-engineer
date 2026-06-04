import type { ReactNode } from 'react';

export const metadata = {
  title: 'Enterprise Operating System',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
