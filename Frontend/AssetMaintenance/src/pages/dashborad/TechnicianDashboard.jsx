import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useState, useEffect } from "react"
import axios from "axios"
import { BASE_URL } from "../../axiosConfig.js"
import TaskTable from "../../components/tasks/TaskTable"
import MaterialRequestTable from "../../components/materials/MaterialRequestTable"
import Button from "../../components/common/Button"
import Card from "../../components/common/Card"
import PageHeader from "../../components/common/PageHeader"
import { PageLoading } from "../../components/common/LoadingSpinner"

function TechnicianDashboard() {
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
                axios.get(BASE_URL + 'tasks/my-tasks', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(BASE_URL + 'material-requests/my-requests', {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => ({ data: [] }))
            ])

            // Show ALL tasks (including completed ones)
            const sortedTasks = tasksRes.data.sort((a, b) =>
                new Date(b.reportedAt) - new Date(a.reportedAt)
            )

            // Show ALL material requests (not just pending)
            const sortedMaterialRequests = materialsRes.data.sort((a, b) =>
                new Date(b.requestedAt) - new Date(a.requestedAt)
            )

            setTasks(sortedTasks)
            setMaterialRequests(sortedMaterialRequests)
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
                title="Technician Dashboard"
                subtitle={`Welcome back, ${user?.name}!`}
            />

            {/* Quick Actions */}
            <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <Button onClick={() => navigate('/tasks/assigned')}>
                        View All My Tasks
                    </Button>
                    <Button variant="warning" onClick={() => navigate('/material-requests/my')}>
                        My Material Requests
                    </Button>
                </div>
            </Card>

            {/* My Assigned Tasks */}
            <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">My Assigned Tasks</h3>
                        <p className="text-sm text-gray-500 mt-1">{tasks.length} tasks assigned to you (all statuses)</p>
                    </div>
                    {tasks.length > 5 && (
                        <Button variant="ghost" size="sm" onClick={() => navigate('/tasks/assigned')}>
                            View All
                        </Button>
                    )}
                </div>
                <TaskTable tasks={tasks.slice(0, 5)} />
            </Card>

            {/* Material Requests */}
            <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">My Material Requests</h3>
                        <p className="text-sm text-gray-500 mt-1">{materialRequests.length} material requests (all statuses)</p>
                    </div>
                    {materialRequests.length > 5 && (
                        <Button variant="ghost" size="sm" onClick={() => navigate('/material-requests/my')}>
                            View All
                        </Button>
                    )}
                </div>
                <MaterialRequestTable requests={materialRequests.slice(0, 5)} />
            </Card>
        </div>
    )
}

export default TechnicianDashboard

