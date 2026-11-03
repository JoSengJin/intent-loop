import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '~/styles/theme.css';
import '~/styles/globals.css';
import '~/styles/revision.css';
import '~/styles/workbench.css';
import { themeInitScript } from '~/modules/intent-loop/lib/theme-init';

export const metadata: Metadata = { title: 'Intent Loop · 의도를 결과로', description: 'Intent 기반 에이전트 작업 프로토타입' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
