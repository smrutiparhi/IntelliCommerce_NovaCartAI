export type Role = 'ROLE_CUSTOMER' | 'ROLE_SELLER' | 'ROLE_ADMIN'

export interface User {
  id: string
  email: string
  fullName: string
  roles: Role[]
}
