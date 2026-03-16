export interface CidrInfo {
  cidr: string
  ip: string
  prefix: number
  mask: string
  network: string
  broadcast: string
  firstUsable: string
  lastUsable: string
  total: number
  usable: number
  startInt: number
  endInt: number
}

export interface InventoryPool {
  id: string
  name: string
  cidr: string
  site: string
  purpose: string
  status: 'planned' | 'active' | 'reserved' | 'deprecated'
  allocated: number
  reserved: number
  notes: string
  createdAt: number
  updatedAt: number
}

export interface PlanRequest {
  id: string
  name: string
  hosts: number
}

export interface PlannedSubnet {
  requestId: string
  name: string
  requestedHosts: number
  capacity: number
  cidr: string
  network: string
  firstUsable: string
  lastUsable: string
  prefix: number
}

export interface ConflictInputRow {
  id: string
  label: string
  cidr: string
  source?: 'inventory' | 'manual'
}

export interface ConflictResult {
  left: ConflictInputRow
  right: ConflictInputRow
  relation: 'overlap' | 'contains' | 'contained'
}

export interface AllocationSimulation {
  cidr: string
  requested: number
  allocations: string[]
  skipped: string[]
  exhausted: boolean
  nextAvailable: string | null
  availableCount: number
}
