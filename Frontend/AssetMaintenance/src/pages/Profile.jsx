import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Button from "../components/common/Button"
import Card from "../components/common/Card"
import PageHeader from "../components/common/PageHeader"

function Profile() {
    const { user } = useAuth()
    const navigate = useNavigate()

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Loading profile...</p>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title="My Profile"
                subtitle="View and manage your account information"
                actions={
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Profile Info */}
                <div className="lg:col-span-2">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Full Name
                                    </label>
                                    <p className="text-base font-medium text-gray-900">
                                        {user.name}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Email Address
                                    </label>
                                    <p className="text-base font-medium text-gray-900">
                                        {user.email}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Role
                                    </label>
                                    <p className="text-base font-medium text-gray-900">
                                        {user.role}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Department
                                    </label>
                                    <p className="text-base font-medium text-gray-900">
                                        {user.department}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        User ID
                                    </label>
                                    <p className="text-base font-medium text-gray-900">
                                        {user.userId}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            {user.role === 'USER' && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate('/tasks/create')}
                                    >
                                        Report New Task
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate('/my-tasks')}
                                    >
                                        View My Tasks
                                    </Button>
                                </>
                            )}

                            {user.role === 'TECHNICIAN' && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate('/tasks/assigned')}
                                    >
                                        My Assigned Tasks
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate('/material-requests/my')}
                                    >
                                        My Material Requests
                                    </Button>
                                </>
                            )}

                            {(user.role === 'MANAGER' || user.role === 'ADMIN') && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate('/tasks/all')}
                                    >
                                        All Tasks
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate('/assets/manage')}
                                    >
                                        Manage Assets
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate('/material-requests')}
                                    >
                                        Material Requests
                                    </Button>
                                </>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Description</h3>
                        <div className="text-sm text-gray-600">
                            {user.role === 'USER' && (
                                <p>As a User, you can report maintenance issues and track the status of your reported tasks.</p>
                            )}
                            {user.role === 'TECHNICIAN' && (
                                <p>As a Technician, you can work on assigned tasks, request materials, and update task status.</p>
                            )}
                            {user.role === 'MANAGER' && (
                                <p>As a Manager, you can assign tasks to technicians, approve material requests, and oversee task completion.</p>
                            )}
                            {user.role === 'ADMIN' && (
                                <p>As an Admin, you have full access to all system features including user management and system oversight.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Profile

