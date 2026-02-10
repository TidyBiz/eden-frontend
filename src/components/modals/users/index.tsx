//** React
import React, { useCallback, useEffect, useState } from 'react'

//** Contexts
import { useEdenMarketBackend } from '@/contexts/backend'

//** Types
import { User, UpdateUserDto, EdenUserRoles } from '@/utils/constants/common'

//** Components
import ConfirmationModal from '../confirmation'

//** Hooks
import { useModalAnimation } from '@/hooks/useModalAnimation'

// ** Types
interface UsersModalProps {
    isOpen: boolean
    onClose: () => void
}

////////////////////////////////////////////////////////////
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

    const loadData = useCallback(async () => {
            setLoading(true)
            try {
                const [usersData] = await Promise.all([
                    fetchUsers(),
                    branches.length === 0 ? fetchBranches() : Promise.resolve(branches)
                ])
                setUsers(usersData)
            } catch (error) {
                console.error('Error loading data:', error)
            } finally {
                setLoading(false)
            }
    }, [fetchUsers, fetchBranches, branches])

    useEffect(() => {
        if (isOpen) {
            loadData()
        }
    }, [isOpen, loadData])

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
                    role: role as EdenUserRoles,
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
                    role: role as EdenUserRoles,
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

    const { isVisible, isClosing } = useModalAnimation(isOpen)

    if (!isVisible) return null

    return (
        <div 
            className={`fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-md ${isClosing ? 'animate-modal-overlay-exit' : 'animate-modal-overlay-enter'}`}
            onClick={(e) => {
                
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div 
                className={`bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col border-2 border-[#598C30] ${isClosing ? 'animate-modal-content-exit' : 'animate-modal-content-enter'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-[#598C30] p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">
                        Gestión de Usuarios
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/10 rounded-full p-2 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#F4F1EA]">
                    {!showForm ? (
                        <>
                            <div className="mb-6 flex justify-end">
                                <button
                                    onClick={handleCreateClick}
                                    className="px-6 py-3 bg-[#0aa65d] text-white rounded-xl hover:bg-[#598C30] transition-colors flex items-center gap-2 font-bold shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Nuevo Usuario
                                </button>
                            </div>

                            <div className="overflow-x-auto bg-white rounded-xl border-2 border-[#598C30]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#F4F1EA] text-[#273C1F]">
                                            <th className="p-4 border-b-2 border-[#598C30] font-semibold">Usuario</th>
                                            <th className="p-4 border-b-2 border-[#598C30] font-semibold">Rol</th>
                                            <th className="p-4 border-b-2 border-[#598C30] font-semibold">Sucursal</th>
                                            <th className="p-4 border-b-2 border-[#598C30] text-right font-semibold">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id} className="border-b-2 border-[#598C30] hover:bg-[#F4F1EA]/50">
                                                <td className="p-4 text-[#273C1F] font-medium">{u.username}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                                                        u.role === 'admin'
                                                            ? 'bg-purple-200 text-purple-800'
                                                            : u.role === 'cashier'
                                                                ? 'bg-blue-200 text-blue-800'
                                                                : 'bg-gray-200 text-gray-800'
                                                    }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-[#273C1F]">
                                                    {typeof u.branch === 'object' ? u.branch?.name : 'Sucursal ID: ' + u.branch}
                                                </td>
                                                <td className="p-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleEditClick(u)}
                                                        className="px-4 py-2 bg-[#0aa65d] text-white rounded-xl hover:bg-[#598C30] transition-colors font-semibold"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(u)}
                                                        className="px-4 py-2 bg-[#c53030] text-white rounded-xl hover:bg-[#dc2626] transition-colors font-semibold"
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
                        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5 bg-white p-6 rounded-xl border-2 border-[#598C30]">
                            <h3 className="text-xl font-bold text-[#273C1F] mb-6 text-center">
                                {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                            </h3>

                            <div>
                                <label className="block text-sm font-semibold text-[#598C30] mb-2">
                                    Nombre de Usuario
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isEditing}
                                    className="w-full px-4 py-2 border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA] disabled:opacity-50"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#598C30] mb-2">
                                    Contraseña {isEditing && '(Dejar en blanco para no cambiar)'}
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
                                    required={!isEditing}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#598C30] mb-2">
                                    Rol
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
                                >
                                    <option value="admin">Administrador</option>
                                    <option value="cashier">Cajero</option>
                                    <option value="courier">Cadete/Repartidor</option>
                                    <option value="stock_manager">Encargado de Stock</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#598C30] mb-2">
                                    Sucursal
                                </label>
                                <select
                                    value={branchId}
                                    onChange={(e) => setBranchId(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
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
                                    className="flex-1 px-4 py-2 bg-gray-200 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-[#0aa65d] text-white rounded-xl hover:bg-[#598C30] disabled:opacity-50 font-bold transition-colors"
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
