export interface Commune {
  id: string
  name: string
  creator: string
  collateralRequired: boolean
  collateralAmount: string
}

export interface CommuneStatistics extends Commune {
  memberCount: string
  choreCount: string
  expenseCount: string
}

export interface Member {
  address: string
  collateral: string
  isCurrentUser: boolean
}

export interface ChoreInstance {
  scheduleId: string
  title: string
  frequency: number
  periodNumber: string
  periodStart: number
  periodEnd: number
  assignedTo: string
  completed: boolean
  isAssignedToUser: boolean
}
