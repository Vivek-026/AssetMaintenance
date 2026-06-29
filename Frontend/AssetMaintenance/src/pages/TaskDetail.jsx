import { useEffect, useState } from "react"
import { BASE_URL } from "../axiosConfig.js"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate, useParams } from "react-router-dom"
import Button from "../components/common/Button.jsx"
import Card from "../components/common/Card.jsx"
import PageHeader from "../components/common/PageHeader.jsx"
import StatusBadge from "../components/common/StatusBadge.jsx"
import { PageLoading } from "../components/common/LoadingSpinner.jsx"
import { Input, Select, Textarea } from "../components/common/Input.jsx"

function TaskDetail() {
    const [task, setTask] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [remarks, setRemarks] = useState('')
    const [showRemarksFor, setShowRemarksFor] = useState(null)
    const [technicians, setTechnicians] = useState([])
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('')
    const [materialForm, setMaterialForm] = useState(false)
    const [materialData, setMaterialData] = useState({ materialName: '', quantity: 1, reason: '' })
    const [taskMaterialRequests, setTaskMaterialRequests] = useState([])

    const { token, user } = useAuth()
    const navigate = useNavigate()
    const { taskId } = useParams()

    const fetchTaskDetail = async () => {
        try {
            const response = await axios.get(BASE_URL + `tasks/${taskId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setTask(response.data)
        } catch (error) {
            if (error.response?.status === 403 || error.response?.status === 401) {
                toast.error('Session expired. Please login again.')
                navigate('/login')
            } else if (error.response?.status === 404) {
                toast.error('Task not found')
                navigate(-1)
            } else {
                toast.error('Failed to load task details')
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!token) {
            toast.error('Please login to access this page')
            navigate('/login')
            return
        }
        fetchTaskDetail()
        fetchTaskMaterialRequests()
    }, [taskId, token, navigate])

    const fetchTaskMaterialRequests = async () => {
        try {
            const response = await axios.get(BASE_URL + `material-requests/task/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setTaskMaterialRequests(response.data)
        } catch (error) {
            console.log('Could not fetch material requests for task')
        }
    }

    const fetchTechnicians = async () => {
        try {
            const response = await axios.get(BASE_URL + 'users/role/TECHNICIAN', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setTechnicians(response.data)
        } catch (error) {
            toast.error('Could not load technicians')
        }
    }

    const handleStart = async () => {
        try {
            await axios.put(BASE_URL + `tasks/${taskId}/start`, '', {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' }
            })
            toast.success('Task started!')
            fetchTaskDetail()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to start task')
        }
    }

    const handleComplete = async () => {
        try {
            await axios.put(BASE_URL + `tasks/${taskId}/complete`, remarks, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' }
            })
            toast.success('Task marked as completed!')
            setShowRemarksFor(null)
            setRemarks('')
            fetchTaskDetail()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete task')
        }
    }

    const handleMaterialRequest = async () => {
        if (!materialData.materialName || !materialData.quantity) {
            toast.error('Please fill material name and quantity')
            return
        }
        try {
            await axios.post(BASE_URL + `material-requests?taskId=${taskId}`, materialData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            })
            toast.success('Material requested!')
            setMaterialForm(false)
            setMaterialData({ materialName: '', quantity: 1, reason: '' })
            fetchTaskDetail()
            fetchTaskMaterialRequests()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to request material')
        }
    }

    const handleAssign = async () => {
        if (!selectedTechnicianId) {
            toast.error('Please select a technician')
            return
        }
        try {
            await axios.put(
                BASE_URL + `tasks/${taskId}/assign?technicianId=${selectedTechnicianId}`,
                remarks || '',
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' } }
            )
            toast.success('Task assigned!')
            setShowRemarksFor(null)
            setRemarks('')
            setSelectedTechnicianId('')
            fetchTaskDetail()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign task')
        }
    }

    const handleConfirm = async () => {
        try {
            await axios.put(BASE_URL + `tasks/${taskId}/confirm`, remarks, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' }
            })
            toast.success('Task confirmed as completed!')
            setShowRemarksFor(null)
            setRemarks('')
            fetchTaskDetail()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to confirm task')
        }
    }

    const handleReject = async () => {
        try {
            await axios.put(BASE_URL + `tasks/${taskId}/reject`, remarks, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' }
            })
            toast.success('Task rejected!')
            setShowRemarksFor(null)
            setRemarks('')
            fetchTaskDetail()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject task')
        }
    }

    const handleReassign = async () => {
        if (!selectedTechnicianId) {
            toast.error('Please select a technician to reassign')
            return
        }
        try {
            await axios.put(
                BASE_URL + `tasks/${taskId}/reassign?technicianId=${selectedTechnicianId}`,
                remarks || '',
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' } }
            )
            toast.success('Task reassigned successfully!')
            setShowRemarksFor(null)
            setRemarks('')
            setSelectedTechnicianId('')
            fetchTaskDetail()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reassign task')
        }
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }

    if (isLoading) return <PageLoading message="Loading task details..." />
    if (!task) return (
        <div className="text-center py-12">
            <p className="text-gray-600">Task not found</p>
            <Button className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
    )

    const isTechnician = user?.role === 'TECHNICIAN'
    const isManager = user?.role === 'MANAGER'

    return (
        <div>
            <div className="mb-6">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    ← Back
                </Button>
            </div>

            {/* Header Card */}
            <Card className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
                        <p className="text-sm text-gray-500 mb-3">{task.taskCode}</p>
                        <div className="flex flex-wrap gap-3">
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">Status</span>
                                <StatusBadge status={task.status} />
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">Priority</span>
                                <StatusBadge status={task.priority} />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* ACTION BUTTONS SECTION */}
            <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="flex flex-wrap gap-3">
                    {/* TECHNICIAN: Start Task */}
                    {isTechnician && task.status === 'ASSIGNED' && (
                        <Button onClick={handleStart}>Start Task</Button>
                    )}

                    {/* TECHNICIAN: Mark Complete */}
                    {isTechnician && (task.status === 'IN_PROGRESS' || task.status === 'MATERIAL_APPROVED') && (
                        <Button variant="success" onClick={() => setShowRemarksFor('complete')}>
                            Mark Complete
                        </Button>
                    )}

                    {/* TECHNICIAN: Request Material */}
                    {isTechnician && (task.status === 'IN_PROGRESS' || task.status === 'MATERIAL_APPROVED') && (
                        <Button variant="warning" onClick={() => setMaterialForm(true)}>
                            Request Material
                        </Button>
                    )}

                    {/* MANAGER: Assign or Reject Task when REPORTED */}
                    {isManager && task.status === 'REPORTED' && (
                        <>
                            <Button onClick={() => { setShowRemarksFor('assign'); fetchTechnicians() }}>
                                Assign Task
                            </Button>
                            <Button variant="danger" onClick={() => setShowRemarksFor('reject')}>
                                Reject Task
                            </Button>
                        </>
                    )}

                    {/* MANAGER: Reassign from ASSIGNED or IN_PROGRESS */}
                    {isManager && (task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS') && (
                        <Button variant="warning" onClick={() => { setShowRemarksFor('reassign'); fetchTechnicians() }}>
                            Reassign Task
                        </Button>
                    )}

                    {/* MANAGER: Reassign from REJECTED */}
                    {isManager && task.status === 'REJECTED' && (
                        <Button variant="warning" onClick={() => { setShowRemarksFor('reassign'); fetchTechnicians() }}>
                            Reassign Task
                        </Button>
                    )}

                    {/* MANAGER: Confirm Completion, Reject, or Reassign */}
                    {isManager && task.status === 'COMPLETED_BY_TECHNICIAN' && (
                        <>
                            <Button variant="success" onClick={() => setShowRemarksFor('confirm')}>
                                Confirm Completion
                            </Button>
                            <Button variant="danger" onClick={() => setShowRemarksFor('reject')}>
                                Reject Task
                            </Button>
                            <Button variant="warning" onClick={() => { setShowRemarksFor('reassign'); fetchTechnicians() }}>
                                Reassign Task
                            </Button>
                        </>
                    )}

                    {/* No actions available */}
                    {!showRemarksFor && !materialForm && (
                        (() => {
                            const hasAction = (isTechnician && (task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || task.status === 'MATERIAL_APPROVED'))
                                || (isManager && (task.status === 'REPORTED' || task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || task.status === 'REJECTED' || task.status === 'COMPLETED_BY_TECHNICIAN'))
                            if (!hasAction) return <p className="text-gray-500 italic">No actions available for this task status. {task.status === 'CONFIRMED_COMPLETED' && 'Task is fully completed and cannot be reassigned.'}</p>
                            return null
                        })()
                    )}
                </div>

                {/* ASSIGN FORM */}
                {showRemarksFor === 'assign' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-base font-semibold text-gray-900 mb-4">Assign to Technician</h4>
                        <div className="space-y-4">
                            <Select
                                label="Select Technician"
                                value={selectedTechnicianId}
                                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                                required
                            >
                                <option value="">-- Select Technician --</option>
                                {technicians.map(tech => (
                                    <option key={tech.userId} value={tech.userId}>{tech.name} ({tech.department})</option>
                                ))}
                            </Select>
                            <Textarea
                                label="Remarks (optional)"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows="2"
                                placeholder="Manager remarks..."
                            />
                            <div className="flex gap-3">
                                <Button onClick={handleAssign}>Confirm Assign</Button>
                                <Button variant="outline" onClick={() => { setShowRemarksFor(null); setRemarks(''); setSelectedTechnicianId('') }}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* COMPLETE FORM */}
                {showRemarksFor === 'complete' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-base font-semibold text-gray-900 mb-4">Complete Task</h4>
                        <div className="space-y-4">
                            <Textarea
                                label="Technician Remarks (optional)"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows="2"
                                placeholder="What was done to fix the issue..."
                            />
                            <div className="flex gap-3">
                                <Button variant="success" onClick={handleComplete}>Confirm Complete</Button>
                                <Button variant="outline" onClick={() => { setShowRemarksFor(null); setRemarks('') }}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONFIRM FORM */}
                {showRemarksFor === 'confirm' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-base font-semibold text-gray-900 mb-4">Confirm Completion</h4>
                        <div className="space-y-4">
                            <Textarea
                                label="Manager Remarks (optional)"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows="2"
                                placeholder="Confirmation remarks..."
                            />
                            <div className="flex gap-3">
                                <Button variant="success" onClick={handleConfirm}>Confirm Completion</Button>
                                <Button variant="outline" onClick={() => { setShowRemarksFor(null); setRemarks('') }}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* REJECT FORM */}
                {showRemarksFor === 'reject' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-base font-semibold text-gray-900 mb-4">Reject Task</h4>
                        <div className="space-y-4">
                            <Textarea
                                label="Rejection Reason (optional)"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows="2"
                                placeholder="Why is the task being rejected..."
                            />
                            <div className="flex gap-3">
                                <Button variant="danger" onClick={handleReject}>Confirm Reject</Button>
                                <Button variant="outline" onClick={() => { setShowRemarksFor(null); setRemarks('') }}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* REASSIGN FORM */}
                {showRemarksFor === 'reassign' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-base font-semibold text-gray-900 mb-4">Reassign Task</h4>
                        <div className="space-y-4">
                            <Select
                                label="Select Technician"
                                value={selectedTechnicianId}
                                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                                required
                            >
                                <option value="">-- Select Technician --</option>
                                {technicians.map(tech => (
                                    <option 
                                        key={tech.userId} 
                                        value={tech.userId}
                                    >
                                        {tech.name} ({tech.department})
                                    </option>
                                ))}
                            </Select>
                            <Textarea
                                label="Remarks (optional)"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows="2"
                                placeholder="Reason for reassignment..."
                            />
                            <div className="flex gap-3">
                                <Button variant="warning" onClick={handleReassign}>
                                    Confirm Reassign
                                </Button>
                                <Button variant="outline" onClick={() => { setShowRemarksFor(null); setRemarks(''); setSelectedTechnicianId('') }}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MATERIAL REQUEST FORM */}
                {materialForm && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-base font-semibold text-gray-900 mb-4">Request Material</h4>
                        <div className="space-y-4">
                            <Input
                                label="Material Name"
                                type="text"
                                placeholder="e.g. Seal Kit, Bearing, Oil Filter"
                                value={materialData.materialName}
                                onChange={(e) => setMaterialData(prev => ({ ...prev, materialName: e.target.value }))}
                                required
                            />
                            <Input
                                label="Quantity"
                                type="number"
                                value={materialData.quantity}
                                onChange={(e) => setMaterialData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                min="1"
                                required
                            />
                            <Textarea
                                label="Reason (optional)"
                                placeholder="Why do you need this material?"
                                value={materialData.reason}
                                onChange={(e) => setMaterialData(prev => ({ ...prev, reason: e.target.value }))}
                                rows="2"
                            />
                            <div className="flex gap-3">
                                <Button variant="warning" onClick={handleMaterialRequest}>Submit Request</Button>
                                <Button variant="outline" onClick={() => { setMaterialForm(false); setMaterialData({ materialName: '', quantity: 1, reason: '' }) }}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* MAIN CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <Card>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                        <p className="text-gray-700">{task.description}</p>
                    </Card>

                    {/* Asset Information */}
                    <Card>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Asset Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Asset Name</p>
                                <p className="font-medium text-gray-900">{task.asset?.assetName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Asset Code</p>
                                <p className="font-medium text-gray-900">{task.asset?.assetCode}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Type</p>
                                <p className="font-medium text-gray-900">{task.asset?.assetType}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Location</p>
                                <p className="font-medium text-gray-900">{task.asset?.location}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <StatusBadge status={task.asset?.status} />
                            </div>
                        </div>
                    </Card>

                    {/* Remarks */}
                    {(task.managerRemarks || task.technicianRemarks) && (
                        <Card>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Remarks</h2>
                            {task.managerRemarks && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm font-medium text-blue-900">Manager</p>
                                    <p className="text-sm text-blue-800 mt-1">{task.managerRemarks}</p>
                                </div>
                            )}
                            {task.technicianRemarks && (
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm font-medium text-green-900">Technician</p>
                                    <p className="text-sm text-green-800 mt-1">{task.technicianRemarks}</p>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Material Requests */}
                    {taskMaterialRequests.length > 0 && (
                        <Card>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                Material Requests ({taskMaterialRequests.length})
                            </h2>
                            <div className="space-y-3">
                                {taskMaterialRequests.map(req => (
                                    <div key={req.mrId} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-gray-900">{req.materialName}</p>
                                            <StatusBadge status={req.status} />
                                        </div>
                                        <p className="text-sm text-gray-600">Quantity: {req.quantity}</p>
                                        {req.reason && <p className="text-sm text-gray-600 mt-1">Reason: {req.reason}</p>}
                                        <p className="text-xs text-gray-500 mt-2">
                                            Requested by: {req.requestedBy?.name} | {formatDateTime(req.requestedAt)}
                                        </p>
                                        {req.managerRemarks && (
                                            <p className="text-sm text-gray-700 mt-2 italic">
                                                Manager remarks: {req.managerRemarks}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    {/* People Involved */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">People Involved</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Reported By</p>
                                <p className="font-medium text-gray-900">{task.reportedBy?.name}</p>
                                <p className="text-xs text-gray-500">{task.reportedBy?.role}</p>
                            </div>
                            <hr />
                            <div>
                                <p className="text-sm text-gray-500">Assigned To</p>
                                {task.assignedTo ? (
                                    <>
                                        <p className="font-medium text-gray-900">{task.assignedTo?.name}</p>
                                        <p className="text-xs text-gray-500">{task.assignedTo?.role}</p>
                                    </>
                                ) : (
                                    <p className="italic text-gray-400">Not assigned yet</p>
                                )}
                            </div>
                            {task.assignedBy && (
                                <>
                                    <hr />
                                    <div>
                                        <p className="text-sm text-gray-500">Assigned By</p>
                                        <p className="font-medium text-gray-900">{task.assignedBy?.name}</p>
                                        <p className="text-xs text-gray-500">{task.assignedBy?.role}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Reported</p>
                                <p className="text-sm font-medium text-gray-900">{formatDateTime(task.reportedAt)}</p>
                            </div>
                            {task.assignedAt && (
                                <div>
                                    <p className="text-sm text-gray-500">Assigned</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDateTime(task.assignedAt)}</p>
                                </div>
                            )}
                            {task.startedAt && (
                                <div>
                                    <p className="text-sm text-gray-500">Started</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDateTime(task.startedAt)}</p>
                                </div>
                            )}
                            {task.completedAt && (
                                <div>
                                    <p className="text-sm text-gray-500">Completed</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDateTime(task.completedAt)}</p>
                                </div>
                            )}
                            {task.confirmedAt && (
                                <div>
                                    <p className="text-sm text-gray-500">Confirmed</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDateTime(task.confirmedAt)}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default TaskDetail

