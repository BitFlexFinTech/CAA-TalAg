import React from 'react';
import {
  BarChart3,
  Boxes,
  CheckSquare,
  ClipboardList,
  FolderKanban,
  Image,
  Layers,
  LayoutDashboard,
  Megaphone,
  Package,
  PoundSterling,
  Settings,
  Truck,
  UserCheck,
  X,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { NavSectionId } from '../../types/commerce';

interface NavGroup {
  label: string;
  items: {
    id: NavSectionId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[];
}

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeSection, setActiveSection, metrics } = useCommerce();

  const navGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'profile', label: 'iShowSpeed Profile', icon: UserCheck },
      ],
    },
    {
      label: 'Merchandise',
      items: [
        { id: 'concepts', label: 'Product Concepts', icon: Package },
        { id: 'development', label: 'Product Development', icon: FolderKanban },
        { id: 'collections', label: 'Collections', icon: Layers },
      ],
    },
    {
      label: 'Brand & Approvals',
      items: [
        { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
        { id: 'assets', label: 'Creative Assets', icon: Image },
        {
          id: 'approvals',
          label: 'Approvals',
          icon: CheckSquare,
          badge: metrics.outstandingApprovals,
        },
      ],
    },
    {
      label: 'Operations & Finance',
      items: [
        { id: 'purchase-orders', label: 'Purchase Orders', icon: ClipboardList },
        { id: 'fulfilment', label: 'Orders & Fulfilment', icon: Truck },
        { id: 'inventory', label: 'Inventory', icon: Boxes },
        { id: 'royalties', label: 'Royalties', icon: PoundSterling },
        { id: 'financials', label: 'Financial Reports', icon: BarChart3 },
      ],
    },
    {
      label: 'Workspace',
      items: [{ id: 'settings', label: 'Settings', icon: Settings }],
    },
  ];

  const handleSelect = (id: NavSectionId) => {
    setActiveSection(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="w-[260px] h-full bg-[#111111] text-zinc-300 flex flex-col border-r border-zinc-800 select-none">
      {/* Primary CAA Brand Header */}
      <div className="px-5 py-5 border-b border-zinc-800/90 flex items-center justify-between gap-3 shrink-0">
        <button
          type="button"
          onClick={() => handleSelect('dashboard')}
          className="text-left group focus:outline-none"
        >
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-extrabold tracking-[-0.04em] text-white">
              CAA
            </span>
            <span className="h-3.5 w-[2px] bg-[#BC1F2F] inline-block translate-y-[1px]" aria-hidden="true" />
            <span className="text-xs font-medium text-zinc-400 tracking-wide whitespace-nowrap">
              Talent Commerce
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 truncate">
            iShowSpeed · Proposed PoC
          </p>
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded"
          aria-label="Close navigation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Dedicated Single-Talent Context Strip */}
      <div className="px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/60 shrink-0">
        <button
          type="button"
          onClick={() => handleSelect('profile')}
          className="w-full flex items-center gap-3 text-left hover:bg-zinc-900/80 p-1.5 -m-1.5 rounded transition-colors"
        >
          <img
            src="/images/talent/speed-chinatown-01.jpg"
            alt="iShowSpeed (Darren Watkins Jr.)"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded object-cover border border-zinc-700 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">iShowSpeed</p>
            <p className="text-[11px] text-zinc-400 truncate">Darren Watkins Jr.</p>
          </div>
        </button>
      </div>

      {/* 14-Item Persistent Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Main navigation">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2.5 mb-1.5 text-[11px] font-medium text-zinc-500 tracking-wide">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded text-[13px] transition-colors ${
                        isActive
                          ? 'bg-[#BC1F2F] text-white font-medium'
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-800/70'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-white' : 'text-zinc-400'
                          }`}
                        />
                        <span className="truncate whitespace-nowrap">{item.label}</span>
                      </span>
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span
                          className={`font-mono-tabular text-[11px] px-1.5 py-0.5 rounded shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Subtle Powered by Mercenta Attribution */}
      <div className="px-5 py-3.5 border-t border-zinc-800/90 bg-zinc-950/70 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="text-zinc-400 shrink-0"
            >
              <path
                d="M3 19V5L9.5 13L16 5V19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              />
              <path
                d="M19.5 19V11"
                stroke="#BC1F2F"
                strokeWidth="2"
                strokeLinecap="square"
              />
            </svg>
            <div className="min-w-0">
              <p className="text-[11px] text-zinc-400 truncate">
                Powered by <span className="text-zinc-200 font-medium">Mercenta</span>
              </p>
              <p className="text-[10px] text-zinc-500 truncate">Proposed Operations Layer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0">{sidebarContent}</aside>

      {/* Mobile slide-over sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 h-full">{sidebarContent}</aside>
        </div>
      )}
    </>
  );
};
