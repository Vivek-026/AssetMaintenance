import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './common/Button'

function Navbar() {
    const { token, user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    if (!token) return null

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            Asset Maintenance
                        </button>
                        <div className="hidden md:flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/dashboard')}
                            >
                                Dashboard
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/my-tasks')}
                            >
                                My Tasks
                            </Button>
                            {user?.role === 'TECHNICIAN' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/material-requests/my')}
                                >
                                     Materials
                                </Button>
                            )}
                            {user?.role !== 'TECHNICIAN' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/tasks/create')}
                                >
                                    Report Task
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/profile')}
                            className="text-right hidden sm:block hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                        >
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.role}</p>
                        </button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/profile')}
                        >
                            Profile
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar

