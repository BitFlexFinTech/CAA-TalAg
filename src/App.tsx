import React, { useState } from 'react';
import { CommerceProvider, useCommerce } from './context/CommerceContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DashboardView } from './views/DashboardView';
import { ProfileView } from './views/ProfileView';
import { ProductsView } from './views/ProductsView';
import { DevelopmentView } from './views/DevelopmentView';
import { CollectionsView } from './views/CollectionsView';
import { CampaignsView } from './views/CampaignsView';
import { AssetsView } from './views/AssetsView';
import { ApprovalsView } from './views/ApprovalsView';
import { PurchaseOrdersView } from './views/PurchaseOrdersView';
import { FulfilmentView } from './views/FulfilmentView';
import { InventoryView } from './views/InventoryView';
import { RoyaltiesView } from './views/RoyaltiesView';
import { FinancialsView } from './views/FinancialsView';
import { SettingsView } from './views/SettingsView';

const WorkspaceShell: React.FC = () => {
  const { activeSection, setActiveSection, settings } = useCommerce();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [addProductSignal, setAddProductSignal] = useState(0);
  const [addCampaignSignal, setAddCampaignSignal] = useState(0);

  const handleOpenAddProduct = () => {
    setActiveSection('concepts');
    setAddProductSignal((n) => n + 1);
  };

  const handleOpenAddCampaign = () => {
    setActiveSection('campaigns');
    setAddCampaignSignal((n) => n + 1);
  };

  const quickAction =
    activeSection === 'campaigns'
      ? { label: 'New Campaign', handler: handleOpenAddCampaign }
      : { label: 'New Product Concept', handler: handleOpenAddProduct };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenAddProduct={handleOpenAddProduct}
            onOpenAddCampaign={handleOpenAddCampaign}
          />
        );
      case 'profile':
        return <ProfileView />;
      case 'concepts':
        return <ProductsView openAddSignal={addProductSignal} />;
      case 'development':
        return <DevelopmentView />;
      case 'collections':
        return <CollectionsView />;
      case 'campaigns':
        return <CampaignsView openAddSignal={addCampaignSignal} />;
      case 'assets':
        return <AssetsView />;
      case 'approvals':
        return <ApprovalsView />;
      case 'purchase-orders':
        return <PurchaseOrdersView />;
      case 'fulfilment':
        return <FulfilmentView />;
      case 'inventory':
        return <InventoryView />;
      case 'royalties':
        return <RoyaltiesView />;
      case 'financials':
        return <FinancialsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            onOpenAddProduct={handleOpenAddProduct}
            onOpenAddCampaign={handleOpenAddCampaign}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] text-[#111111]">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          onOpenMobileMenu={() => setMobileOpen(true)}
          onQuickAction={quickAction.handler}
          quickActionLabel={quickAction.label}
        />

        {settings.showWatermarkNotice && (
          <div className="bg-zinc-900 text-zinc-200 px-4 sm:px-6 lg:px-8 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800">
            <p>
              <strong className="text-white font-semibold">
                Proposed CAA Talent Commerce Demonstration
              </strong>{' '}
              — Built exclusively around iShowSpeed (Darren Watkins Jr.). All concepts, campaigns, orders, and royalty rates are illustrative only.
            </p>
            <span className="text-zinc-400 whitespace-nowrap">
              Technology & Operations Concept by Mercenta
            </span>
          </div>
        )}

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-7 max-w-[1440px] w-full mx-auto">
          {renderSection()}
        </main>

        <footer className="border-t border-zinc-200 bg-white px-4 sm:px-6 lg:px-8 py-4 text-xs text-zinc-500 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900">CAA</span>
            <span aria-hidden="true">·</span>
            <span>iShowSpeed Talent Commerce Proof of Concept</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Powered by Mercenta</span>
            <span aria-hidden="true">·</span>
            <span>Illustrative Demonstration Workspace</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <CommerceProvider>
      <WorkspaceShell />
    </CommerceProvider>
  );
}
