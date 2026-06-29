import { useEffect, useState } from "react"
import { BASE_URL } from "../axiosConfig.js"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import TaskTable from "../components/tasks/TaskTable"
import Button from "../components/common/Button"
import Card from "../components/common/Card"
import PageHeader from "../components/common/PageHeader"
import { PageLoading } from "../components/common/LoadingSpinner"
import SearchBar from "../components/common/SearchBar"

function MyTasks() {
    const [tasks, setTasks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchKeyword, setSearchKeyword] = useState('')
    const [isSearching, setIsSearching] = useState(false)

    const { token } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) {
            toast.error('Please login to access this page')
            navigate('/login')
            return
        }
        fetchMyTasks()
    }, [token, navigate])

    const fetchMyTasks = async () => {
        try {
            const response = await axios.get(BASE_URL + 'tasks/my-reported', {
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

    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            toast.error('Please enter a search term')
            return
        }

        setIsSearching(true)
        try {
            const response = await axios.get(
                BASE_URL + `tasks/my-reported/search?keyword=${encodeURIComponent(searchKeyword)}`,
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
            // If backend search fails (500), use client-side filtering
            if (error.response?.status === 500) {
                console.log('Backend search not available, using client-side search')
                try {
                    const response = await axios.get(BASE_URL + 'tasks/my-reported', {
                        headers: { 'Authorization': `Bearer ${token}` }
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
        fetchMyTasks()
    }

    if (isLoading) return <PageLoading message="Loading your tasks..." />

    return (
        <div>
            <PageHeader
                title="My Reported Tasks"
                subtitle={`${tasks.length} tasks reported by you`}
                actions={
                    <Button onClick={() => navigate('/tasks/create')}>
                        + Report New Task
                    </Button>
                }
            />

            <SearchBar
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={handleSearch}
                onClear={handleClearSearch}
                placeholder="Search your tasks by code, title, or asset..."
            />

            {isSearching && (
                <div className="text-center py-4">
                    <p className="text-gray-600">Searching...</p>
                </div>
            )}

            <Card>
                <TaskTable tasks={tasks} />
            </Card>
        </div>
    )
}

export default MyTasks

