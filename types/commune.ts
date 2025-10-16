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
  taskCount: string
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

export interface Task {
  id: string
  communeId: string
  budget: string
  description: string
  assignedTo: string
  assignedToUsername?: string
  dueDate: number
  done: boolean
  disputed: boolean
  isAssignedToUser: boolean
}

export interface TaskDispute {
  id: string
  taskId: string
  newAssignee: string
  votes: number
  resolved: boolean
}
