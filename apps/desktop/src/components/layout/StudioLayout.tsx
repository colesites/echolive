import React from 'react';
import { TopControls } from './TopControls';
import { Sidebar } from './Sidebar';

export function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopControls />
        <main className="flex-1 flex overflow-hidden p-4 gap-4">
          {children}
        </main>
      </div>
    </div>
  );
}
