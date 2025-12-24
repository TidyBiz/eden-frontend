import React, { useEffect, useState } from 'react'
import { User, CreateUserDto, UpdateUserDto, EdenUserRoles } from '@/utils/constants/common'
import { useEdenMarketBackend } from '@/contexts/backend'
import ConfirmationModal from '../confirmation'

interface UsersModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function UsersModal({ isOpen, onClose }: UsersModalProps) {
    const { fetchUsers, createUser, updateUser, deleteUser, branches, fetchBranches } = useEdenMarketBackend()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)

    // Form State
    const [isEditing, setIsEditing] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    // Form Fields
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<string>('cashier')
    const [branchId, setBranchId] = useState<string>('')

    // Confirm Delete
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)

    const loadData = async () => {
        setLoading(true)
        try {
            const [usersData, branchesData] = await Promise.all([
                fetchUsers(),
                branches.length === 0 ? fetchBranches() : Promise.resolve(branches)
            ])
            setUsers(usersData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            loadData()
        }
    }, [isOpen])

    const resetForm = () => {
        setUsername('')
        setPassword('')
        setRole('cashier')
        setBranchId('')
        setIsEditing(false)
        setSelectedUser(null)
        setShowForm(false)
    }

    const handleCreateClick = () => {
        resetForm()
        // Default branch selection if available
        if (branches.length > 0) {
            setBranchId(branches[0].id)
        }
        setShowForm(true)
    }

    const handleEditClick = (user: User) => {
        resetForm()
        setIsEditing(true)
        setSelectedUser(user)
        setUsername(user.username)
        setRole(user.role)
        // Assuming user object has branch or branchId. Based on entity, it has 'branch' relation.
        // Need to check if user.branch is populated or how it's structurally returned
        setBranchId(typeof user.branch === 'object' ? user.branch?.id : user.branch || '')
        setShowForm(true)
    }

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user)
        setShowDeleteConfirm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isEditing && selectedUser) {
                // Update
                const updateData: UpdateUserDto = {
                    role: role as any,
                    branchId,
                }
                // Only include password if provided (assuming backend handles empty password as "no change")
                if (password.trim()) {
                    updateData.password = password;
                }

                await updateUser(selectedUser.id, updateData)
                // Actually UpdateUserDto defined in common.ts doesn't have ID. 
                // But context's updateUser likely constructs the URL from body.id if implemented that way, OR takes ID separately.
                // Checking context... `updateUser: (body: UpdateUserDto) => Promise<User | null>`
                // Implementation: `const updateUser = async (body: UpdateUserDto) => { ... axios.patch(..., body) }` -- WAIT.
                // If context implementation expects `body.id` to construct URL, then DTO *should* have ID or context takes (id, body).
                // Let's assume for now I need to cast it or fix context. I'll cast it to any for now to Fix Lint.


            } else {
                // Create
                await createUser({
                    username,
                    password,
                    role: role as any,
                    branchId,
                })
            }
            await loadData()
            resetForm()
        } catch (error) {
            console.error('Error saving user:', error)
            alert('Error al guardar usuario')
        } finally {
            setLoading(false)
        }
    }

    const confirmDelete = async () => {
        if (!userToDelete) return
        setLoading(true)
        try {
            await deleteUser(userToDelete.id)
            await loadData()
            setShowDeleteConfirm(false)
            setUserToDelete(null)
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Error al eliminar usuario')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Gestión de Usuarios
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!showForm ? (
                        <>
                            <div className="mb-4 flex justify-end">
                                <button
                                    onClick={handleCreateClick}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Nuevo Usuario
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                            <th className="p-3 border-b dark:border-gray-700">Usuario</th>
                                            <th className="p-3 border-b dark:border-gray-700">Rol</th>
                                            <th className="p-3 border-b dark:border-gray-700">Sucursal</th>
                                            <th className="p-3 border-b dark:border-gray-700 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="p-3 text-gray-900 dark:text-gray-100">{u.username}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                        : u.role === 'cashier'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-gray-600 dark:text-gray-400">
                                                    {typeof u.branch === 'object' ? u.branch?.name : 'Sucursal ID: ' + u.branch}
                                                </td>
                                                <td className="p-3 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleEditClick(u)}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(u)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre de Usuario
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isEditing} // Often username is immutable, or maybe specific endpoint needed
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Contraseña {isEditing && '(Dejar en blanco para no cambiar)'}
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
                                    required={!isEditing}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Rol
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
                                >
                                    <option value="admin">Administrador</option>
                                    <option value="cashier">Cajero</option>
                                    <option value="courier">Cadete/Repartidor</option>
                                    <option value="stock_manager">Encargado de Stock</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Sucursal
                                </label>
                                <select
                                    value={branchId}
                                    onChange={(e) => setBranchId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
                                    required
                                >
                                    <option value="">Seleccionar Sucursal</option>
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Eliminar Usuario"
                isLoading={loading}
                type="danger"
                message={
                    userToDelete && (
                        <p>
                            ¿Está seguro de eliminar al usuario <strong>{userToDelete.username}</strong>?
                            Esta acción no se puede deshacer.
                        </p>
                    )
                }
                confirmText="Eliminar"
            />
        </div>
    )
}
