import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext.jsx"
import { useEffect, useState } from "react"
import axios from "axios"
import { BASE_URL } from "../../axiosConfig.js"
import TaskTable from "../../components/tasks/TaskTable.jsx"
import MaterialRequestTable from "../../components/materials/MaterialRequestTable.jsx"
import Button from "../../components/common/Button.jsx"
import Card from "../../components/common/Card.jsx"
import PageHeader from "../../components/common/PageHeader.jsx"
import { PageLoading } from "../../components/common/LoadingSpinner.jsx"

function AdminDashboard() {
    const navigate = useNavigate()
    const { user, token } = useAuth()
    const [tasks, setTasks] = useState([])
    const [materialRequests, setMaterialRequests] = useState([])
    const [stats, setStats] = useState({
        totalAssets: 0,
        activeAssets: 0,
        underMaintenance: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) return
        fetchData()
    }, [token])

    const fetchData = async () => {
        try {
            const [tasksRes, materialsRes, assetsRes] = await Promise.all([
                axios.get(BASE_URL + 'tasks', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(BASE_URL + 'material-requests', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(BASE_URL + 'asset', { headers: { Authorization: `Bearer ${token}` } })
            ])

            setTasks(tasksRes.data)
            setMaterialRequests(materialsRes.data)

            const assets = assetsRes.data
            setStats({
                totalAssets: assets.length,
                activeAssets: assets.filter(a => a.status === 'ACTIVE').length,
                underMaintenance: assets.filter(a => a.status === 'UNDER_MAINTENANCE').length
            })
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <PageLoading message="Loading dashboard..." />

    return (
        <div>
            <PageHeader
                title="Admin Dashboard"
                subtitle={`Welcome back, ${user?.name}!`}
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Tasks</p>
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
                            <p className="text-sm font-medium text-gray-600">Total Assets</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAssets}</p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Assets</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeAssets}</p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            </div>

            {/* Quick Actions */}
            <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <Button onClick={() => navigate('/tasks/all')}>All Tasks</Button>
                    <Button variant="outline" onClick={() => navigate('/assets/manage')}>Manage Assets</Button>
                    <Button variant="outline" onClick={() => navigate('/material-requests')}>Material Requests</Button>
                    <Button variant="outline" onClick={() => navigate('/managers')}>View Managers</Button>
                    <Button variant="outline" onClick={() => navigate('/technicians')}>View Technicians</Button>
                </div>
            </Card>

            {/* Recent Tasks */}
            <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
                    {tasks.length > 5 && (
                        <Button variant="ghost" size="sm" onClick={() => navigate('/tasks/all')}>
                            View All
                        </Button>
                    )}
                </div>
                <TaskTable tasks={tasks.slice(0, 5)} />
            </Card>

            {/* Recent Material Requests */}
            <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Material Requests</h3>
                    {materialRequests.length > 5 && (
                        <Button variant="ghost" size="sm" onClick={() => navigate('/material-requests')}>
                            View All
                        </Button>
                    )}
                </div>
                <MaterialRequestTable requests={materialRequests.slice(0, 5)} />
            </Card>
        </div>
    )
}

export default AdminDashboard
