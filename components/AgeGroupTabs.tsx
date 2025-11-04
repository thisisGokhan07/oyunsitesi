'use client';

import { useState } from 'react';
import { AgeGroup } from '@/types';
import { getAgeGroupLabel } from '@/lib/mock-data';

interface AgeGroupTabsProps {
  onSelectAgeGroup: (ageGroup: AgeGroup | 'all') => void;
}

export function AgeGroupTabs({ onSelectAgeGroup }: AgeGroupTabsProps) {
  const [activeTab, setActiveTab] = useState<AgeGroup | 'all'>('all');

  const tabs: Array<{ value: AgeGroup | 'all'; label: string }> = [
    { value: 'all', label: '🌟 Tümü' },
    { value: 'baby', label: '👶 Bebekler' },
    { value: 'child', label: '🧒 Çocuklar' },
    { value: 'adult', label: '🧠 Yetişkinler' },
    { value: 'family', label: '👨‍👩‍👧‍👦 Aile' },
  ];

  const handleTabClick = (value: AgeGroup | 'all') => {
    setActiveTab(value);
    onSelectAgeGroup(value);
  };

  return (
    <div className="sticky top-16 lg:top-20 z-40 bg-background/95 backdrop-blur-md border-b border-border py-2">
      <div className="container">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              className={`px-4 py-2 rounded-full font-semibold text-xs md:text-sm whitespace-nowrap transition-all duration-300 min-h-[48px] md:min-h-0 ${
                activeTab === tab.value
                  ? 'bg-primary text-white shadow-lg scale-105'
                  : 'bg-card text-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
