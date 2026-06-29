import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { BASE_URL } from '../axiosConfig'
import toast from 'react-hot-toast'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import PageHeader from '../components/common/PageHeader'
import { PageLoading } from '../components/common/LoadingSpinner'
import TaskTable from '../components/tasks/TaskTable'
import MaterialRequestTable from '../components/materials/MaterialRequestTable'

function UserDetail() {
    const [userDetail, setUserDetail] = useState(null)
    const [tasks, setTasks] = useState([])
    const [materialRequests, setMaterialRequests] = useState([])
    const [loading, setLoading] = useState(true)

    const { token, user } = useAuth()
    const navigate = useNavigate()
    const { userId } = useParams()

    useEffect(() => {
        if (!token) {
            toast.error('Please login')
            navigate('/login')
            return
        }

        // Only admin can view user details
        if (user?.role !== 'ADMIN') {
            toast.error('Access denied. Admin only.')
            navigate('/dashboard')
            return
        }

        fetchUserDetail()
        fetchUserTasks()
        fetchUserMaterialRequests()
    }, [userId, token])

    const fetchUserDetail = async () => {
        try {
            const response = await axios.get(BASE_URL + `users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setUserDetail(response.data)
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error('Session expired')
                navigate('/login')
            } else if (error.response?.status === 404) {
                toast.error('User not found')
                navigate(-1)
            } else {
                toast.error('Failed to load user details')
            }
        }
    }

    const fetchUserTasks = async () => {
        try {
            const response = await axios.get(BASE_URL + 'tasks', {
                headers: { Authorization: `Bearer ${token}` }
            })

            // Filter tasks managed by this user
            const userTasks = response.data.filter(task => {
                // For managers: tasks they assigned
                // For technicians: tasks assigned to them
                return task.assignedTo?.userId === parseInt(userId) ||
                       task.assignedBy?.userId === parseInt(userId)
            })

            const sortedTasks = userTasks.sort((a, b) =>
                new Date(b.reportedAt) - new Date(a.reportedAt)
            )
            setTasks(sortedTasks)
        } catch (error) {
            console.error('Failed to fetch tasks:', error)
        }
    }

    const fetchUserMaterialRequests = async () => {
        try {
            const response = await axios.get(BASE_URL + 'material-requests', {
                headers: { Authorization: `Bearer ${token}` }
            })

            // Filter material requests by this user
            const userMaterialRequests = response.data.filter(mr =>
                mr.requestedBy?.userId === parseInt(userId) ||
                mr.approvedBy?.userId === parseInt(userId)
            )

            setMaterialRequests(userMaterialRequests)
        } catch (error) {
            console.error('Failed to fetch material requests:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <PageLoading message="Loading user details..." />

    if (!userDetail) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">User not found</p>
                <Button className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    ← Back
                </Button>
            </div>

            <PageHeader
                title={userDetail.name}
                subtitle={`${userDetail.role} - ${userDetail.department} Department`}
            />

            {/* User Information Card */}
            <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-900">{userDetail.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{userDetail.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="font-medium text-gray-900">{userDetail.role}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="font-medium text-gray-900">{userDetail.department}</p>
                    </div>
                </div>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                {userDetail.role === 'TECHNICIAN' ? 'Assigned Tasks' : 'Managed Tasks'}
                            </p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{tasks.length}</p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Material Requests</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{materialRequests.length}</p>
                        </div>
                        <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {tasks.filter(t => t.status === 'CONFIRMED_COMPLETED').length}
                            </p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tasks Section */}
            <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {userDetail.role === 'TECHNICIAN' ? 'Assigned Tasks' : 'Managed Tasks'}
                </h3>
                <TaskTable tasks={tasks} />
            </Card>

            {materialRequests.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Material Requests</h3>
                    <MaterialRequestTable requests={materialRequests} />
                </Card>
            )}
        </div>
    )
}

export default UserDetail

