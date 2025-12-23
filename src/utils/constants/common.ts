export type CreateUserDto = {
  username: string
  password?: string
  role: EdenUserRoles
  branchId: string
}

export type UpdateUserDto = {
  username?: string
  password?: string
  role?: EdenUserRoles
  branchId?: string
}

// User role type needs to be flexible enough for our application
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  CASHIER = 'cashier',
  COURIER = 'courier',
  STOCK_MANAGER = 'stock_manager'
}

export type CreateTransactionDto = {
  branchId: string
  cashierId: string
  items: CreateTransactionItemDto[]
  paymentMethod?: 'cash' | 'transfer' | 'credit'
  creditCustomer?: {
    id?: string
    name: string
    dni: string
  }
}

export type CreateTransactionItemDto = {
  productId: string
  quantity: number
  discount?: number
}

export type EdenUserRoles = 'admin' | 'user' | 'cashier' | 'courier' | 'stock_manager'

export type User = {
  id: number
  username: string
  role: EdenUserRoles
  branchId?: string
  branch?: Branch
}

export type Product = {
  id: string
  PLU: number
  name: string
  price: number
  altPrice: number
  isSoldByWeight: boolean
  description: string
  isActive: boolean
  stock: Stock[]
}

export type ProductForm = {
  PLU: number
  name: string
  price: number
  altPrice: number
  isSoldByWeight: boolean
  branchId: string
  description: string
  isActive: boolean
  stockNumber: number
}

export type Branch = {
  id: string
  name: string
  stock: Stock[]
}

export type Stock = {
  id: string
  quantity: number
  product: Product
  branch: Branch
}

export type Transaction = {
  id: string
  branch: Branch
  cashier: User
  items: TransactionItem[]
  subtotal: number
  tax: number
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: Date
  completedAt: Date
}

export type TransactionItem = {
  id: string
  transaction: Transaction
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
  discount?: number
}

export type BranchColor = {
  name: string
  textColor: string
  bgColor: string
}

export const BRANCH_COLORS: BranchColor[] = [
  { name: 'blue', textColor: 'text-blue-300', bgColor: 'bg-blue-900/30' },
  { name: 'green', textColor: 'text-green-300', bgColor: 'bg-green-900/30' },
  { name: 'purple', textColor: 'text-purple-300', bgColor: 'bg-purple-900/30' },
  { name: 'orange', textColor: 'text-orange-300', bgColor: 'bg-orange-900/30' },
  { name: 'pink', textColor: 'text-pink-300', bgColor: 'bg-pink-900/30' },
  { name: 'cyan', textColor: 'text-cyan-300', bgColor: 'bg-cyan-900/30' },
  { name: 'yellow', textColor: 'text-yellow-300', bgColor: 'bg-yellow-900/30' },
  { name: 'red', textColor: 'text-red-300', bgColor: 'bg-red-900/30' },
  { name: 'indigo', textColor: 'text-indigo-300', bgColor: 'bg-indigo-900/30' },
  {
    name: 'emerald',
    textColor: 'text-emerald-300',
    bgColor: 'bg-emerald-900/30',
  },
]

export type ClientCredit = {
  id: string
  name: string
  dni: string
  amount: number
  updatedAt: string
}
