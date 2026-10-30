import { create } from 'zustand';

type ModalType = 'delete-trip' | 'share-trip' | 'regenerate' | 'change-password' | 'delete-account' | null;

interface UIStore {
  activeModal: ModalType;
  modalData: Record<string, unknown>;
  sidebarOpen: boolean;
  currentWizardStep: number;
  isMobileMenuOpen: boolean;

  openModal: (modal: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setWizardStep: (step: number) => void;
  nextWizardStep: () => void;
  prevWizardStep: () => void;
  resetWizardStep: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeModal: null,
  modalData: {},
  sidebarOpen: false,
  currentWizardStep: 1,
  isMobileMenuOpen: false,

  openModal: (modal, data = {}) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: {} }),

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setWizardStep: (step) => set({ currentWizardStep: step }),
  nextWizardStep: () => set(state => ({ currentWizardStep: state.currentWizardStep + 1 })),
  prevWizardStep: () => set(state => ({ currentWizardStep: Math.max(1, state.currentWizardStep - 1) })),
  resetWizardStep: () => set({ currentWizardStep: 1 }),

  toggleMobileMenu: () => set(state => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));
