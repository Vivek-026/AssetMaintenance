import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { BASE_URL } from '../axiosConfig'
import toast from 'react-hot-toast'
import TaskTable from '../components/tasks/TaskTable'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import PageHeader from '../components/common/PageHeader'
import { PageLoading } from '../components/common/LoadingSpinner'
import SearchBar from '../components/common/SearchBar'

function MyAssignedTasks() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchKeyword, setSearchKeyword] = useState('')
    const [isSearching, setIsSearching] = useState(false)

    const { token } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) {
            toast.error('Please login')
            navigate('/login')
            return
        }
        fetchAssignedTasks()
    }, [token])

    const fetchAssignedTasks = async () => {
        try {
            setLoading(true)
            const response = await axios.get(BASE_URL + 'tasks/my-tasks', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const sortedTasks = response.data.sort((a, b) =>
                new Date(b.reportedAt) - new Date(a.reportedAt)
            )
            setTasks(sortedTasks)
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error('Session expired')
                navigate('/login')
            } else {
                toast.error('Failed to load tasks')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (action, taskId) => {
        if (action === 'start') {
            try {
                await axios.put(BASE_URL + `tasks/${taskId}/start`, '', {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' }
                })
                toast.success('Task started!')
                fetchAssignedTasks()
            } catch (error) {
                toast.error('Failed to start task')
            }
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
                BASE_URL + `tasks/my-tasks/search?keyword=${encodeURIComponent(searchKeyword)}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
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
            // Fallback to client-side search if backend fails
            if (error.response?.status === 500) {
                console.log('Backend search unavailable, using client-side filtering')
                try {
                    const response = await axios.get(BASE_URL + 'tasks/my-tasks', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    const keyword = searchKeyword.toLowerCase()
                    const filtered = response.data.filter(task =>
                        task.taskCode?.toLowerCase().includes(keyword) ||
                        task.title?.toLowerCase().includes(keyword) ||
                        task.description?.toLowerCase().includes(keyword) ||
                        task.asset?.assetName?.toLowerCase().includes(keyword) ||
                        task.asset?.assetCode?.toLowerCase().includes(keyword)
                    )
                    const sortedTasks = filtered.sort((a, b) =>
                        new Date(b.reportedAt) - new Date(a.reportedAt)
                    )
                    setTasks(sortedTasks)
                    if (filtered.length === 0) {
                        toast.info('No tasks found matching your search')
                    }
                } catch (fallbackError) {
                    toast.error('Failed to search tasks')
                    console.error('Fallback search error:', fallbackError)
                }
            } else {
                toast.error('Failed to search tasks')
                console.error('Search error:', error)
            }
        } finally {
            setIsSearching(false)
        }
    }

    const handleClearSearch = () => {
        setSearchKeyword('')
        setIsSearching(false)
        fetchAssignedTasks()
    }

    if (loading) return <PageLoading message="Loading assigned tasks..." />

    return (
        <div>
            <PageHeader
                title="My Assigned Tasks"
                subtitle={`${tasks.length} tasks assigned to you`}
                actions={
                    <>
                        <Button variant="primary" onClick={() => navigate('/material-requests/my')}>
                             My Material Requests
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/dashboard')}>
                            Back to Dashboard
                        </Button>
                    </>
                }
            />

            <SearchBar
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={handleSearch}
                onClear={handleClearSearch}
                placeholder="Search assigned tasks by code, title, or asset..."
            />

            {isSearching && (
                <div className="text-center py-4">
                    <p className="text-gray-600">Searching...</p>
                </div>
            )}

            <Card>
                <TaskTable tasks={tasks} onAction={handleAction} />
            </Card>
        </div>
    )
}

export default MyAssignedTasks



