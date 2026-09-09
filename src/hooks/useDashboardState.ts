import { useState, useCallback } from 'react';

/**
 * Dashboard UI state - controls tabs, modals, and visibility toggles
 */
export interface DashboardUIState {
  activeOutputTab: 'resume' | 'cover-letter' | 'ats-review';
  isPromptModalOpen: boolean;
  isComparisonSidebarOpen: boolean;
  isHeatmapModalOpen: boolean;
  isExportingPdf: boolean;
}

export interface DashboardUIActions {
  setActiveOutputTab: (tab: 'resume' | 'cover-letter' | 'ats-review') => void;
  openPromptModal: () => void;
  closePromptModal: () => void;
  openComparisonSidebar: () => void;
  closeComparisonSidebar: () => void;
  openHeatmapModal: () => void;
  closeHeatmapModal: () => void;
  setExportingPdf: (value: boolean) => void;
}

const DEFAULT_DASHBOARD_STATE: DashboardUIState = {
  activeOutputTab: 'resume',
  isPromptModalOpen: false,
  isComparisonSidebarOpen: false,
  isHeatmapModalOpen: false,
  isExportingPdf: false,
};

/**
 * Custom hook for managing dashboard UI navigation and modal states
 * Replaces 8+ useState calls in App.tsx with a single organized state management
 * 
 * @returns [state, actions] tuple for dashboard UI control
 * 
 * @example
 * const [uiState, uiActions] = useDashboardState();
 * 
 * <button onClick={() => uiActions.setActiveOutputTab('resume')}>
 *   View Resume
 * </button>
 */
export function useDashboardState(): [DashboardUIState, DashboardUIActions] {
  const [state, setState] = useState<DashboardUIState>(DEFAULT_DASHBOARD_STATE);

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

  const actions: DashboardUIActions = {
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
