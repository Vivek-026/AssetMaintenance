import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { BASE_URL } from '../axiosConfig'
import toast from 'react-hot-toast'
import MaterialRequestTable from '../components/materials/MaterialRequestTable'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import PageHeader from '../components/common/PageHeader'
import { PageLoading } from '../components/common/LoadingSpinner'
import SearchBar from '../components/common/SearchBar'

function MyMaterialRequests() {
    const [requests, setRequests] = useState([])
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
        fetchMyRequests()
    }, [token])

    const fetchMyRequests = async () => {
        try {
            setLoading(true)
            const response = await axios.get(BASE_URL + 'material-requests/my-requests', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const sortedRequests = response.data.sort((a, b) =>
                new Date(b.requestedAt) - new Date(a.requestedAt)
            )
            setRequests(sortedRequests)
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error('Session expired')
                navigate('/login')
            } else {
                toast.error('Failed to load material requests')
            }
        } finally {
            setLoading(false)
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
                BASE_URL + `material-requests/my-requests/search?keyword=${encodeURIComponent(searchKeyword)}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
            const sortedRequests = response.data.sort((a, b) =>
                new Date(b.requestedAt) - new Date(a.requestedAt)
            )
            setRequests(sortedRequests)
            if (response.data.length === 0) {
                toast.info('No requests found matching your search')
            }
        } catch (error) {
            // Fallback to client-side search if backend fails
            if (error.response?.status === 500) {
                console.log('Backend search unavailable, using client-side filtering')
                try {
                    const response = await axios.get(BASE_URL + 'material-requests/my-requests', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    const keyword = searchKeyword.toLowerCase()
                    const filtered = response.data.filter(req =>
                        req.materialName?.toLowerCase().includes(keyword) ||
                        req.task?.taskCode?.toLowerCase().includes(keyword) ||
                        req.task?.title?.toLowerCase().includes(keyword) ||
                        req.reason?.toLowerCase().includes(keyword)
                    )
                    const sortedRequests = filtered.sort((a, b) =>
                        new Date(b.requestedAt) - new Date(a.requestedAt)
                    )
                    setRequests(sortedRequests)
                    if (filtered.length === 0) {
                        toast.info('No requests found matching your search')
                    }
                } catch (fallbackError) {
                    toast.error('Failed to search material requests')
                    console.error('Fallback search error:', fallbackError)
                }
            } else {
                toast.error('Failed to search material requests')
                console.error('Search error:', error)
            }
        } finally {
            setIsSearching(false)
        }
    }

    const handleClearSearch = () => {
        setSearchKeyword('')
        setIsSearching(false)
        fetchMyRequests()
    }

    if (loading) return <PageLoading message="Loading material requests..." />

    return (
        <div>
            <PageHeader
                title="My Material Requests"
                subtitle={`${requests.length} material requests (all statuses)`}
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
                placeholder="Search your requests by material name or task code..."
            />

            {isSearching && (
                <div className="text-center py-4">
                    <p className="text-gray-600">Searching...</p>
                </div>
            )}

            <Card>
                <MaterialRequestTable requests={requests} />
            </Card>
        </div>
    )
}

export default MyMaterialRequests

