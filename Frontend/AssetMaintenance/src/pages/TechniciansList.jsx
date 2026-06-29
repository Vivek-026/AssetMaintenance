import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { BASE_URL } from '../axiosConfig'
import toast from 'react-hot-toast'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import PageHeader from '../components/common/PageHeader'
import { PageLoading } from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import SearchBar from '../components/common/SearchBar'

// Technicians List with Search Functionality
function TechniciansList() {
    const [technicians, setTechnicians] = useState([])
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
        fetchTechnicians()
    }, [token])

    const fetchTechnicians = async () => {
        try {
            const response = await axios.get(BASE_URL + 'users/role/TECHNICIAN', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setTechnicians(response.data)
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error('Session expired')
                navigate('/login')
            } else {
                toast.error('Failed to load technicians')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            toast.error('Please enter a search keyword')
            return
        }

        try {
            setIsSearching(true)
            const response = await axios.get(BASE_URL + `users/search?keyword=${encodeURIComponent(searchKeyword)}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            // Filter to show only TECHNICIAN role
            const filteredTechnicians = response.data.filter(user => user.role === 'TECHNICIAN')
            setTechnicians(filteredTechnicians)
            if (filteredTechnicians.length === 0) {
                toast.info('No technicians found matching your search')
            }
        } catch (error) {
            toast.error('Search failed. Please try again.')
        } finally {
            setIsSearching(false)
        }
    }

    const handleClearSearch = () => {
        setSearchKeyword('')
        fetchTechnicians()
    }

    if (loading) return <PageLoading message="Loading technicians..." />

    return (
        <div>
            <PageHeader
                title={`Technicians (${technicians.length})`}
                subtitle="List of all technicians in the system"
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
                placeholder="Search technicians by name, email, or department..."
            />

            {isSearching && (
                <div className="text-center py-4">
                    <p className="text-gray-600">Searching...</p>
                </div>
            )}

            <Card>
                {technicians.length === 0 ? (
                    <EmptyState
                        title="No technicians found"
                        description="There are no technicians registered in the system."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Department
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {technicians.map((t, index) => (
                                    <tr key={t.userId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {t.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {t.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {t.department}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default TechniciansList

