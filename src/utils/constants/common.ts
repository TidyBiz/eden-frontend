export type CreateUserDto = {
  username: string
  role: EdenUserRoles
}

export type UpdateUserDto = {
  username: string
  role: EdenUserRoles
}

export type CreateTransactionDto = {
  branchId: string
  cashierId: string
  items: CreateTransactionItemDto[]
}

export type CreateTransactionItemDto = {
  productId: string
  quantity: number
  discount?: number
}

export type EdenUserRoles = 'admin' | 'user'

export type User = {
  id: string
  username: string
  role: EdenUserRoles
  branchId: string
}

export type Product = {
  id: string;
  PLU: number;
  name: string;
  price: number;
  altPrice: number;
  isSoldByWeight: boolean;
  description: string;
  isActive: boolean;
  stock: Stock[];
}

export type ProductForm = {
  PLU: number;
  name: string;
  price: number;
  altPrice: number;
  isSoldByWeight: boolean;
  branchId: string;
  description: string;
  isActive: boolean;
  stockNumber: number;
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
  id: string;
  branch: Branch;
  cashier: User;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt: Date;
}

export type TransactionItem = {
  id: string;
  transaction: Transaction;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
}
