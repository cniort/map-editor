import { create } from 'zustand'

interface UiState {
  eyedropperActive: boolean
  lastPickedColor: string | null
  showFormatOverlay: boolean
  toggleEyedropper: () => void
  setPickedColor: (color: string) => void
  toggleFormatOverlay: () => void
}

export const useUiStore = create<UiState>()((set, get) => ({
  eyedropperActive: false,
  lastPickedColor: null,
  showFormatOverlay: true,

  toggleEyedropper: () => set({ eyedropperActive: !get().eyedropperActive }),
  setPickedColor: (color) => set({ lastPickedColor: color, eyedropperActive: false }),
  toggleFormatOverlay: () => set({ showFormatOverlay: !get().showFormatOverlay }),
}))
