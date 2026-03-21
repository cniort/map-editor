import { create } from 'zustand'
import type { CartoCycleProject } from '@/types'
import { useMapStore, type MapState } from './mapStore'

interface ProjectState {
  projectName: string
  lastSaved: string | null
  isDirty: boolean
}

interface ProjectActions {
  setProjectName: (name: string) => void
  markDirty: () => void
  saveToFile: () => void
  loadFromFile: (file: File) => Promise<void>
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => boolean
}

const PROJECT_VERSION = '1.0.0'
const LOCAL_STORAGE_KEY = 'cartocycle-autosave'

export const useProjectStore = create<ProjectState & ProjectActions>()((set, get) => ({
  projectName: 'Nouveau projet',
  lastSaved: null,
  isDirty: false,

  setProjectName: (name) => set({ projectName: name, isDirty: true }),
  markDirty: () => set({ isDirty: true }),

  saveToFile: () => {
    const mapState = useMapStore.getState()
    const project: CartoCycleProject = {
      version: PROJECT_VERSION,
      name: get().projectName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      canvas: mapState.canvas,
      baseMap: mapState.baseMap,
      routes: mapState.routes,
      cities: mapState.cities,
      cityCategories: mapState.cityCategories,
      annotations: mapState.annotations,
      legend: mapState.legend,
    }

    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${get().projectName.replace(/\s+/g, '_')}.cartocycle`
    a.click()
    URL.revokeObjectURL(url)

    set({ lastSaved: new Date().toISOString(), isDirty: false })
  },

  loadFromFile: async (file) => {
    try {
      if (file.size > 50 * 1024 * 1024) {
        alert('Fichier projet trop volumineux (max 50 Mo)')
        return
      }
      const text = await file.text()
      const project: CartoCycleProject = JSON.parse(text)

      if (!project.canvas || !project.baseMap || !project.routes) {
        alert('Fichier projet invalide ou corrompu')
        return
      }

      const mapState: MapState = {
        canvas: project.canvas,
        baseMap: project.baseMap,
        routes: project.routes,
        cities: project.cities ?? [],
        cityCategories: project.cityCategories ?? [],
        annotations: project.annotations ?? [],
        legend: project.legend,
      }

      useMapStore.getState().loadState(mapState)
      set({ projectName: project.name, lastSaved: project.updatedAt, isDirty: false })
    } catch {
      alert('Erreur lors du chargement du projet')
    }
  },

  saveToLocalStorage: () => {
    const mapState = useMapStore.getState()
    const data = {
      version: PROJECT_VERSION,
      name: get().projectName,
      updatedAt: new Date().toISOString(),
      canvas: mapState.canvas,
      baseMap: mapState.baseMap,
      routes: mapState.routes,
      cities: mapState.cities,
      cityCategories: mapState.cityCategories,
      annotations: mapState.annotations,
      legend: mapState.legend,
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
      set({ lastSaved: data.updatedAt })
    } catch {
      // QuotaExceededError — localStorage full
    }
  },

  loadFromLocalStorage: () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!saved) return false

    try {
      const project = JSON.parse(saved) as CartoCycleProject
      const mapState: MapState = {
        canvas: project.canvas,
        baseMap: project.baseMap,
        routes: project.routes,
        cities: project.cities,
        cityCategories: project.cityCategories,
        annotations: project.annotations,
        legend: project.legend,
      }
      useMapStore.getState().loadState(mapState)
      set({ projectName: project.name, lastSaved: project.updatedAt, isDirty: false })
      return true
    } catch {
      return false
    }
  },
}))
