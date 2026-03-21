import { create } from 'zustand'

interface UiState {
  eyedropperActive: boolean
  lastPickedColor: string | null
  toggleEyedropper: () => void
  setPickedColor: (color: string) => void
}

export const useUiStore = create<UiState>()((set, get) => ({
  eyedropperActive: false,
  lastPickedColor: null,

  toggleEyedropper: () => set({ eyedropperActive: !get().eyedropperActive }),
  setPickedColor: (color) => set({ lastPickedColor: color, eyedropperActive: false }),
}))
