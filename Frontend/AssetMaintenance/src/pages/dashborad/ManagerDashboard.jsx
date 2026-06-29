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

function ManagerDashboard() {
    const navigate = useNavigate()
    const { user, token } = useAuth()
    const [tasks, setTasks] = useState([])
    const [materialRequests, setMaterialRequests] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) return
        fetchData()
    }, [token])

    const fetchData = async () => {
        try {
            const [tasksRes, materialsRes] = await Promise.all([
                axios.get(BASE_URL + 'tasks', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(BASE_URL + 'material-requests/pending', { headers: { Authorization: `Bearer ${token}` } })
            ])

            const needsAttention = tasksRes.data.filter(t =>
                t.status === 'REPORTED' || t.status === 'COMPLETED_BY_TECHNICIAN'
            )

            const sortedTasks = needsAttention.sort((a, b) =>
                new Date(b.reportedAt) - new Date(a.reportedAt)
            )

            setTasks(sortedTasks)
            setMaterialRequests(materialsRes.data)
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
                title="Manager Dashboard"
                subtitle={`Welcome back, ${user?.name}!`}
            />

            {/* Quick Actions */}
            <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <Button onClick={() => navigate('/tasks/all')}>
                        All Tasks
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/material-requests')}>
                        Material Requests
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/assets/manage')}>
                        Manage Assets
                    </Button>
                </div>
            </Card>

            {/* Tasks Needing Attention */}
            <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Tasks Needing Attention</h3>
                        <p className="text-sm text-gray-500 mt-1">{tasks.length} tasks require your action</p>
                    </div>
                    {tasks.length > 5 && (
                        <Button variant="ghost" size="sm" onClick={() => navigate('/tasks/all')}>
                            View All
                        </Button>
                    )}
                </div>
                <TaskTable tasks={tasks.slice(0, 5)} />
            </Card>

            {/* Pending Material Requests */}
            <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Pending Material Requests</h3>
                        <p className="text-sm text-gray-500 mt-1">{materialRequests.length} pending requests</p>
                    </div>
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

export default ManagerDashboard

