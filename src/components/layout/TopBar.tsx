import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { NavSectionId } from '../../types/commerce';

const SECTION_TITLES: Record<NavSectionId, string> = {
  dashboard: 'Overview',
  profile: 'iShowSpeed Profile',
  concepts: 'Product Concepts',
  development: 'Product Development',
  collections: 'Collections',
  campaigns: 'Campaigns',
  assets: 'Creative Assets',
  approvals: 'Approval Centre',
  'purchase-orders': 'Purchase Orders',
  fulfilment: 'Orders & Fulfilment',
  inventory: 'Inventory',
  royalties: 'Royalties',
  financials: 'Financial Reports',
  settings: 'Settings',
};

interface TopBarProps {
  onOpenMobileMenu: () => void;
  onQuickAction: () => void;
  quickActionLabel: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileMenu,
  onQuickAction,
  quickActionLabel,
}) => {
  const { activeSection, setActiveSection } = useCommerce();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-zinc-200 px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8 shrink-0">
      {/* Zone 1: Mobile trigger + Breadcrumb trail */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-2 text-zinc-600 hover:text-zinc-900 rounded"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-sm min-w-0 whitespace-nowrap">
          <button
            type="button"
            onClick={() => setActiveSection('dashboard')}
            className="font-semibold text-zinc-900 hover:text-[#BC1F2F] transition-colors shrink-0"
          >
            CAA
          </button>
          <span className="text-zinc-300" aria-hidden="true">/</span>
          <button
            type="button"
            onClick={() => setActiveSection('profile')}
            className="text-zinc-600 hover:text-zinc-900 transition-colors hidden sm:inline shrink-0"
          >
            iShowSpeed
          </button>
          <span className="text-zinc-300 hidden sm:inline" aria-hidden="true">/</span>
          <span className="font-medium text-zinc-900 truncate">{SECTION_TITLES[activeSection]}</span>
        </div>
      </div>

      {/* Zone 2: Quiet demonstration disclaimer */}
      <div className="hidden xl:flex items-center gap-2 text-xs text-zinc-500 whitespace-nowrap shrink-0">
        <span>Proposed Demonstration Environment</span>
        <span aria-hidden="true">·</span>
        <span>Illustrative Programme Data Only</span>
      </div>

      {/* Zone 3: Single primary contextual action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onQuickAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{quickActionLabel}</span>
        </button>
      </div>
    </header>
  );
};
