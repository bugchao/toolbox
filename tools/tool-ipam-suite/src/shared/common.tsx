import React from 'react'
import { RiskBadge } from '@toolbox/ui-kit'
import type { InventoryPool } from './types'

export function statusTone(status: InventoryPool['status']) {
  switch (status) {
    case 'active':
      return 'low'
    case 'planned':
      return 'info'
    case 'reserved':
      return 'medium'
    case 'deprecated':
      return 'high'
    default:
      return 'info'
  }
}

export function PoolStatusBadge({
  status,
  label,
}: {
  status: InventoryPool['status']
  label: string
}) {
  return <RiskBadge level={statusTone(status)} label={label} />
}
