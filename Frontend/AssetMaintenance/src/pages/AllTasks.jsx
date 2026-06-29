import { useEffect, useState, Fragment } from "react"
import { BASE_URL } from "../axiosConfig.js"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Button from "../components/common/Button"
import Card from "../components/common/Card"
import PageHeader from "../components/common/PageHeader"
import StatusBadge from "../components/common/StatusBadge"
import { PageLoading } from "../components/common/LoadingSpinner"
import { Select, Textarea } from "../components/common/Input"
import EmptyState from "../components/common/EmptyState"
import SearchBar from "../components/common/SearchBar"

function AllTasks() {
    const [tasks, setTasks] = useState([])
    const [technicians, setTechnicians] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [assigningTaskId, setAssigningTaskId] = useState(null)
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('')
    const [remarks, setRemarks] = useState('')
    const [searchKeyword, setSearchKeyword] = useState('')
    const [isSearching, setIsSearching] = useState(false)

    const { token, user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) {
            toast.error('Please login to access this page')
            navigate('/login')
            return
        }

        if (user?.role !== 'MANAGER' && user?.role !== 'ADMIN') {
            toast.error('Access denied. Manager/Admin only.')
            navigate('/dashboard')
            return
        }

        fetchTasks()
        fetchTechnicians()
    }, [token, user, navigate])

    const fetchTasks = async () => {
        try {
            const response = await axios.get(BASE_URL + 'tasks', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const sortedTasks = response.data.sort((a, b) =>
                new Date(b.reportedAt) - new Date(a.reportedAt)
            )
            setTasks(sortedTasks)
        } catch (error) {
            if (error.response?.status === 403 || error.response?.status === 401) {
                toast.error('Session expired. Please login again.')
                navigate('/login')
            } else {
                toast.error('Failed to load tasks')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const fetchTechnicians = async () => {
        try {
            const response = await axios.get(BASE_URL + 'users/role/TECHNICIAN', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setTechnicians(response.data)
        } catch (error) {
            console.error('Failed to fetch technicians:', error)
        }
    }

    const handleAssignClick = (taskId) => {
        setAssigningTaskId(taskId)
        setSelectedTechnicianId('')
        setRemarks('')
    }

    const handleAssignTask = async (taskId) => {
        if (!selectedTechnicianId) {
            toast.error('Please select a technician')
            return
        }

        try {
            await axios.put(
                BASE_URL + `tasks/${taskId}/assign?technicianId=${selectedTechnicianId}`,
                remarks,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'text/plain'
                    }
                }
            )

            toast.success('Task assigned successfully!')
            setAssigningTaskId(null)
            fetchTasks()
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to assign task'
            toast.error(errorMessage)
        }
    }

    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            toast.error('Please enter a search term')
            return
        }

        setIsSearching(true)
        try {
            const response = await axios.get(
                BASE_URL + `tasks/search?keyword=${encodeURIComponent(searchKeyword)}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            )
            const sortedTasks = response.data.sort((a, b) =>
                new Date(b.reportedAt) - new Date(a.reportedAt)
            )
            setTasks(sortedTasks)
            if (response.data.length === 0) {
                toast.info('No tasks found matching your search')
            }
        } catch (error) {
            toast.error('Failed to search tasks')
            console.error('Search error:', error)
        } finally {
            setIsSearching(false)
        }
    }

    const handleClearSearch = () => {
        setSearchKeyword('')
        setIsSearching(false)
        fetchTasks()
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (isLoading) return <PageLoading message="Loading tasks..." />

    return (
        <div>
            <PageHeader
                title="All Tasks"
                subtitle={`${tasks.length} tasks in the system`}
                actions={
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                }
            />

            <SearchBar
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={handleSearch}
                onClear={handleClearSearch}
                placeholder="Search tasks by code, title, asset name, or reporter..."
            />

            {isSearching && (
                <div className="text-center py-4">
                    <p className="text-gray-600">Searching...</p>
                </div>
            )}

            <Card>
                {tasks.length === 0 ? (
                    <EmptyState
                        title="No tasks found"
                        description="There are no tasks in the system."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Task Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Asset
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reported By
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Assigned To
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reported At
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tasks.map((task) => (
                                    <Fragment key={task.taskId}>
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {task.taskCode}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="max-w-xs">
                                                    <div className="font-medium">{task.title}</div>
                                                    {task.description && (
                                                        <div className="text-gray-500 text-xs mt-1 line-clamp-2">
                                                            {task.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {task.asset?.assetName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={task.priority} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={task.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {task.reportedBy?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {task.assignedTo?.name || 'Unassigned'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(task.reportedAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => navigate(`/tasks/${task.taskId}`)}
                                                    >
                                                        View
                                                    </Button>
                                                    {(!task.assignedTo && task.status === 'REPORTED') && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAssignClick(task.taskId)}
                                                        >
                                                            Assign
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {assigningTaskId === task.taskId && (
                                            <tr>
                                                <td colSpan="9" className="px-6 py-4 bg-gray-50">
                                                    <div className="max-w-2xl">
                                                        <h4 className="text-base font-semibold text-gray-900 mb-4">
                                                            Assign Task to Technician
                                                        </h4>
                                                        <div className="space-y-4">
                                                            <Select
                                                                label="Select Technician"
                                                                value={selectedTechnicianId}
                                                                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                                                                required
                                                            >
                                                                <option value="">-- Select Technician --</option>
                                                                {technicians.map((tech) => (
                                                                    <option key={tech.userId} value={tech.userId}>
                                                                        {tech.name} ({tech.department})
                                                                    </option>
                                                                ))}
                                                            </Select>

                                                            <Textarea
                                                                label="Remarks (optional)"
                                                                value={remarks}
                                                                onChange={(e) => setRemarks(e.target.value)}
                                                                rows="2"
                                                                placeholder="Add any remarks..."
                                                            />

                                                            <div className="flex gap-3">
                                                                <Button
                                                                    variant="success"
                                                                    onClick={() => handleAssignTask(task.taskId)}
                                                                >
                                                                    Confirm Assign
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => setAssigningTaskId(null)}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default AllTasks

