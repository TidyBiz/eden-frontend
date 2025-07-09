export type CreateUserDto = {
  username: string
  role: EdenUserRoles
}

export type UpdateUserDto = {
  username: string
  role: EdenUserRoles
}

export type EdenUserRoles = 'admin' | 'user'

export type User = {
  id: string
  username: string
  role: EdenUserRoles
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
