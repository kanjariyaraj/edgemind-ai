import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import type { Memory, SearchResult, SyncQueueEntry, Conflict } from '../types'

export function useMemories() {
  return useQuery({
    queryKey: ['memories'],
    queryFn: async () => {
      const response = await api.memory.list()
      return response.memories || []
    },
  })
}

export function useMemory(id: string) {
  return useQuery({
    queryKey: ['memory', id],
    queryFn: () => api.memory.get(id),
    enabled: !!id,
  })
}

export function useCreateMemory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Memory>) => api.memory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] })
    },
  })
}

export function useSearch() {
  return useMutation({
    mutationFn: (data: { query: string; top_k?: number }) => api.search.search(data),
  })
}

export function useDecisions() {
  return useQuery({
    queryKey: ['decisions'],
    queryFn: () => api.decisions.list(),
    refetchInterval: 5000,
  })
}

export function useSyncQueue() {
  return useQuery({
    queryKey: ['syncQueue'],
    queryFn: () => api.sync.queue(),
    refetchInterval: 5000,
  })
}

export function useSyncStatus() {
  return useQuery({
    queryKey: ['syncStatus'],
    queryFn: () => api.sync.status(),
    refetchInterval: 10000,
  })
}

export function useRetrySync() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (operationId: string) => api.sync.retry(operationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syncQueue'] })
      queryClient.invalidateQueries({ queryKey: ['syncStatus'] })
    },
  })
}

export function useConflicts() {
  return useQuery({
    queryKey: ['conflicts'],
    queryFn: () => api.conflicts.list(),
    refetchInterval: 10000,
  })
}

export function useResolveConflict() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, resolution }: { id: number; resolution: string }) => 
      api.conflicts.resolve(id, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conflicts'] })
      queryClient.invalidateQueries({ queryKey: ['syncQueue'] })
    },
  })
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: () => api.dashboard.metrics(),
    refetchInterval: 5000,
  })
}

export function useSystemStatus() {
  return useQuery({
    queryKey: ['systemStatus'],
    queryFn: () => api.system.getStatus(),
    refetchInterval: 10000,
  })
}