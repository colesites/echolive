import React from 'react';
import { StudioLayout } from '../components/layout/StudioLayout';
import { PreviewStage } from '../components/panels/PreviewStage';
import { SceneSelector } from '../components/panels/SceneSelector';
import { SourceList } from '../components/panels/SourceList';
import { AudioMixer } from '../components/panels/AudioMixer';

export function StudioView() {
  return (
    <StudioLayout>
      {/* Left Column - Scenes & Sources */}
      <div className="w-64 flex flex-col gap-4">
        <div className="flex-1 min-h-[200px]">
          <SceneSelector />
        </div>
        <div className="flex-1 min-h-[200px]">
          <SourceList />
        </div>
      </div>

      {/* Center Column - Preview Area */}
      <div className="flex-1 flex flex-col">
        <PreviewStage />
      </div>

      {/* Right Column - Audio Mixer */}
      <div className="w-72 flex flex-col">
        <AudioMixer />
      </div>
    </StudioLayout>
  );
}
