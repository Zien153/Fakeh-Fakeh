import { useState, useCallback } from 'react';

export interface PaymentState {
  activeOutputTab: 'resume' | 'cover-letter' | 'ats-review';
  isPromptModalOpen: boolean;
  isComparisonSidebarOpen: boolean;
  isHeatmapModalOpen: boolean;
  isExportingPdf: boolean;
}

export interface PaymentActions {
  setActiveOutputTab: (tab: 'resume' | 'cover-letter' | 'ats-review') => void;
  openPromptModal: () => void;
  closePromptModal: () => void;
  openComparisonSidebar: () => void;
  closeComparisonSidebar: () => void;
  openHeatmapModal: () => void;
  closeHeatmapModal: () => void;
  setExportingPdf: (value: boolean) => void;
}

const DEFAULT_PAYMENT_STATE: PaymentState = {
  activeOutputTab: 'resume',
  isPromptModalOpen: false,
  isComparisonSidebarOpen: false,
  isHeatmapModalOpen: false,
  isExportingPdf: false,
};

/**
 * Custom hook for managing UI navigation and modal states
 * Replaces 8+ useState calls in App.tsx
 */
export function useUIState(): [PaymentState, PaymentActions] {
  const [state, setState] = useState<PaymentState>(DEFAULT_PAYMENT_STATE);

  const setActiveOutputTab = useCallback(
    (tab: 'resume' | 'cover-letter' | 'ats-review') =>
      setState((prev) => ({ ...prev, activeOutputTab: tab })),
    []
  );

  const openPromptModal = useCallback(
    () => setState((prev) => ({ ...prev, isPromptModalOpen: true })),
    []
  );

  const closePromptModal = useCallback(
    () => setState((prev) => ({ ...prev, isPromptModalOpen: false })),
    []
  );

  const openComparisonSidebar = useCallback(
    () => setState((prev) => ({ ...prev, isComparisonSidebarOpen: true })),
    []
  );

  const closeComparisonSidebar = useCallback(
    () => setState((prev) => ({ ...prev, isComparisonSidebarOpen: false })),
    []
  );

  const openHeatmapModal = useCallback(
    () => setState((prev) => ({ ...prev, isHeatmapModalOpen: true })),
    []
  );

  const closeHeatmapModal = useCallback(
    () => setState((prev) => ({ ...prev, isHeatmapModalOpen: false })),
    []
  );

  const setExportingPdf = useCallback(
    (value: boolean) => setState((prev) => ({ ...prev, isExportingPdf: value })),
    []
  );

  const actions: PaymentActions = {
    setActiveOutputTab,
    openPromptModal,
    closePromptModal,
    openComparisonSidebar,
    closeComparisonSidebar,
    openHeatmapModal,
    closeHeatmapModal,
    setExportingPdf,
  };

  return [state, actions];
}
