export interface Commune {
  id: string
  name: string
  creator: string
  creatorUsername?: string // Added for display purposes
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
  username?: string
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
  assignedToUsername?: string
  completed: boolean
  isAssignedToUser: boolean
}

export interface Expense {
  id: string
  communeId: string // Added communeId field to match contract structure
  amount: string
  description: string
  assignedTo: string
  assignedToUsername?: string // Added for display purposes
  dueDate: number
  paid: boolean
  disputed: boolean
  isAssignedToUser: boolean
}

export interface ExpenseDispute {
  id: string
  expenseId: string
  newAssignee: string
  votes: number
  resolved: boolean
}
