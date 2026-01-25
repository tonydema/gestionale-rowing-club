export interface Group {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  _count?: {
    members: number
  }
}

export interface GroupWithMembers extends Group {
  members: Array<{
    id: string
    firstName: string
    lastName: string
    fiscalCode: string
    phone: string | null
    isActive: boolean
  }>
}

export interface CreateGroupDto {
  name: string
}

export interface UpdateGroupDto {
  name?: string
}
