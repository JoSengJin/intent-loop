import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '~/styles/globals.css';
import '~/styles/revision.css';
import '~/styles/workbench.css';

export const metadata: Metadata = { title: 'Intent Loop · 의도를 결과로', description: 'Intent 기반 에이전트 작업 프로토타입' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ko"><body>{children}</body></html>;
}
