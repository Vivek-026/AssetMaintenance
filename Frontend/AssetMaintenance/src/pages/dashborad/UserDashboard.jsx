import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext.jsx"
import { useState, useEffect } from "react"
import axios from "axios"
import { BASE_URL } from "../../axiosConfig.js"
import TaskTable from "../../components/tasks/TaskTable.jsx"
import Button from "../../components/common/Button.jsx"
import Card from "../../components/common/Card.jsx"
import PageHeader from "../../components/common/PageHeader.jsx"
import { PageLoading } from "../../components/common/LoadingSpinner.jsx"

function UserDashboard() {
    const navigate = useNavigate()
    const { user, token } = useAuth()
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) return
        fetchMyTasks()
    }, [token])

    const fetchMyTasks = async () => {
        try {
            const response = await axios.get(BASE_URL + 'tasks/my-reported', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const sortedTasks = response.data.sort((a, b) =>
                new Date(b.reportedAt) - new Date(a.reportedAt)
            )
            setTasks(sortedTasks)
        } catch (error) {
            console.error('Failed to fetch tasks:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <PageLoading message="Loading dashboard..." />

    return (
        <div>
            <PageHeader
                title="Dashboard"
                subtitle={`Welcome back, ${user?.name}!`}
            />

            {/* Quick Actions */}
            <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <Button onClick={() => navigate('/tasks/create')}>
                        + Report New Task
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/my-tasks')}>
                        View All My Tasks
                    </Button>
                </div>
            </Card>

            {/* Recent Tasks */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">My Reported Tasks</h3>
                    {tasks.length > 5 && (
                        <Button variant="ghost" size="sm" onClick={() => navigate('/my-tasks')}>
                            View All
                        </Button>
                    )}
                </div>
                <TaskTable tasks={tasks.slice(0, 5)} />
            </Card>
        </div>
    )
}

export default UserDashboard


