import { useEffect, useState } from "react"
import { BASE_URL } from "../axiosConfig.js"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import SearchBar from "../components/common/SearchBar"

function MaterialRequests() {
    const [materialRequests, setMaterialRequests] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [actioningRequestId, setActioningRequestId] = useState(null)
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

        fetchMaterialRequests()
    }, [token, user, navigate])

    const fetchMaterialRequests = async () => {
        try {
            if (user?.role === 'ADMIN') {
                // Admin sees ALL material requests
                const response = await axios.get(BASE_URL + 'material-requests', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                setMaterialRequests(response.data)
            } else {
                // Manager sees handled-by-me + pending
                const [handledRes, pendingRes] = await Promise.all([
                    axios.get(BASE_URL + 'material-requests/handled-by-me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get(BASE_URL + 'material-requests/pending', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ])

                // Merge: handled-by-me + pending (avoid duplicates)
                const handledIds = new Set(handledRes.data.map(r => r.mrId))
                const merged = [
                    ...handledRes.data,
                    ...pendingRes.data.filter(r => !handledIds.has(r.mrId))
                ]
                setMaterialRequests(merged)
            }
        } catch (error) {
            if (error.response?.status === 403 || error.response?.status === 401) {
                toast.error('Session expired. Please login again.')
                navigate('/login')
            } else {
                toast.error('Failed to load material requests')
            }
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleApproveClick = (requestId) => {
        setActioningRequestId(requestId)
        setRemarks('')
    }

    const handleApprove = async (requestId) => {
        try {
            await axios.put(
                BASE_URL + `material-requests/${requestId}/approve`,
                remarks, // Send remarks as raw string
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'text/plain'
                    }
                }
            )

            toast.success('Material request approved!')
            setActioningRequestId(null)
            fetchMaterialRequests() // Refresh list
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to approve request'
            toast.error(errorMessage)
            console.error(error)
        }
    }

    const handleRejectClick = (requestId) => {
        setActioningRequestId(requestId)
        setRemarks('')
    }

    const handleReject = async (requestId) => {
        if (!remarks.trim()) {
            toast.error('Please provide a reason for rejection')
            return
        }

        try {
            await axios.put(
                BASE_URL + `material-requests/${requestId}/reject`,
                remarks, // Send remarks as raw string
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'text/plain'
                    }
                }
            )

            toast.success('Material request rejected')
            setActioningRequestId(null)
            fetchMaterialRequests() // Refresh list
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to reject request'
            toast.error(errorMessage)
            console.error(error)
        }
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            toast.error('Please enter a search keyword')
            return
        }

        try {
            setIsSearching(true)
            const response = await axios.get(BASE_URL + `material-requests/search?keyword=${encodeURIComponent(searchKeyword)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setMaterialRequests(response.data)
            if (response.data.length === 0) {
                toast.info('No material requests found matching your search')
            }
        } catch (error) {
            toast.error('Search failed. Please try again.')
        } finally {
            setIsSearching(false)
        }
    }

    const handleClearSearch = () => {
        setSearchKeyword('')
        fetchMaterialRequests()
    }

    if (isLoading) {
        return <div style={{ padding: '20px' }}>Loading material requests...</div>
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h1>Material Requests</h1>
                        <p>Total requests: {materialRequests.length}</p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px' }}>
                        Back to Dashboard
                    </button>
                </div>
                <hr />

                <div style={{ marginBottom: '20px' }}>
                    <SearchBar
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onSearch={handleSearch}
                        onClear={handleClearSearch}
                        placeholder="Search by material name, task code, or requester..."
                    />
                </div>

                {isSearching && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <p>Searching...</p>
                    </div>
                )}

                {materialRequests.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', border: '1px solid #ddd', marginTop: '20px' }}>
                        <p>No material requests found</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
                        {materialRequests.map((request) => (
                            <div key={request.mrId} style={{ border: '1px solid #ddd', padding: '15px' }}>
                                <div style={{ marginBottom: '10px' }}>
                                    <h3 style={{ margin: '0 0 5px 0' }}>{request.materialName}</h3>
                                    <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>
                                        Request ID: {request.mrId}
                                    </p>
                                </div>

                                <div
                                    onClick={() => navigate(`/tasks/${request.task?.taskId}`)}
                                    style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f5f5f5', cursor: 'pointer' }}
                                >
                                    <strong>Task:</strong> {request.task?.title}
                                    <br />
                                    <small>{request.task?.taskCode}</small>
                                    <br />
                                    <small style={{ color: '#3b82f6' }}>Click to view task →</small>
                                </div>

                                <div style={{ fontSize: '14px', margin: '5px 0' }}>
                                    <strong>Quantity:</strong> {request.quantity}
                                </div>

                                <div style={{ fontSize: '14px', margin: '5px 0' }}>
                                    <strong>Reason:</strong>
                                    <p style={{ margin: '5px 0', fontSize: '13px' }}>{request.reason}</p>
                                </div>

                                <div style={{ fontSize: '14px', margin: '5px 0' }}>
                                    <strong>Status:</strong> {request.status}
                                </div>

                                <div style={{ fontSize: '14px', margin: '5px 0' }}>
                                    <strong>Requested by:</strong> {request.requestedBy?.name}
                                </div>

                                <div style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
                                    <strong>Requested at:</strong> {formatDateTime(request.requestedAt)}
                                </div>

                                {request.approvedBy && (
                                    <>
                                        <div style={{ fontSize: '14px', margin: '5px 0' }}>
                                            <strong>Approved by:</strong> {request.approvedBy.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
                                            <strong>Approved at:</strong> {formatDateTime(request.approvedAt)}
                                        </div>
                                    </>
                                )}

                                {request.managerRemarks && (
                                    <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
                                        <strong>Manager Remarks:</strong>
                                        <p style={{ margin: '5px 0', fontSize: '13px' }}>{request.managerRemarks}</p>
                                    </div>
                                )}

                                {/* Action Section */}
                                {request.status === 'PENDING' && (
                                    <>
                                        {actioningRequestId === request.mrId ? (
                                            <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #999', backgroundColor: '#f9f9f9' }}>
                                                <h4 style={{ margin: '0 0 10px 0' }}>Action on Request</h4>

                                                <div style={{ marginBottom: '10px' }}>
                                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                                                        Remarks:
                                                    </label>
                                                    <textarea
                                                        value={remarks}
                                                        onChange={(e) => setRemarks(e.target.value)}
                                                        rows="2"
                                                        style={{ width: '100%', padding: '5px' }}
                                                        placeholder="Add remarks (required for rejection)..."
                                                    />
                                                </div>

                                                <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                                    <button
                                                        onClick={() => handleApprove(request.mrId)}
                                                        style={{ flex: 1, padding: '8px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(request.mrId)}
                                                        style={{ flex: 1, padding: '8px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => setActioningRequestId(null)}
                                                    style={{ width: '100%', padding: '8px' }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ marginTop: '15px' }}>
                                                <button
                                                    onClick={() => handleApproveClick(request.mrId)}
                                                    style={{ width: '100%', padding: '8px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                                                >
                                                    Take Action
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {request.status !== 'PENDING' && (
                                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: request.status === 'APPROVED' ? '#d4edda' : '#f8d7da', border: '1px solid', borderColor: request.status === 'APPROVED' ? '#c3e6cb' : '#f5c6cb' }}>
                                        <strong>{request.status === 'APPROVED' ? '✓ Approved' : '✗ Rejected'}</strong>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MaterialRequests

