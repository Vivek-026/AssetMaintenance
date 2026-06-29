import { useEffect, useState } from "react"
import { BASE_URL } from "../axiosConfig.js"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from "react-router-dom"
import Button from "../components/common/Button.jsx"
import { Input, Select, Textarea } from "../components/common/Input.jsx"
import Card from "../components/common/Card.jsx"
import PageHeader from "../components/common/PageHeader.jsx"
import { PageLoading } from "../components/common/LoadingSpinner.jsx"

function TaskForm() {
    const [assets, setAssets] = useState([])
    const [selectedAssetId, setSelectedAssetId] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState('MEDIUM')
    const [isLoading, setIsLoading] = useState(false)
    const [loadingAssets, setLoadingAssets] = useState(true)

    const { token, user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) {
            toast.error('Please login to access this page')
            navigate('/login')
            return
        }
        
        // Prevent technicians from creating tasks
        if (user?.role === 'TECHNICIAN') {
            toast.error('Technicians cannot report tasks')
            navigate('/dashboard')
        }
    }, [token, user, navigate])

    useEffect(() => {
        if (!token) return

        const fetchAssets = async () => {
            try {
                const response = await axios.get(BASE_URL + 'asset', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                setAssets(response.data)
            } catch (error) {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    toast.error('Session expired. Please login again.')
                    navigate('/login')
                } else {
                    toast.error('Failed to load assets')
                }
            } finally {
                setLoadingAssets(false)
            }
        }

        fetchAssets()
    }, [token, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedAssetId || !title || !description || !priority) {
            toast.error('Please fill in all fields')
            return
        }

        setIsLoading(true)

        try {
            await axios.post(
                BASE_URL + `tasks?assetId=${selectedAssetId}`,
                { title, description, priority },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            toast.success('Task reported successfully!')
            setTitle('')
            setDescription('')
            setPriority('MEDIUM')
            setSelectedAssetId('')
            navigate('/my-tasks')

        } catch (error) {
            if (error.response?.status === 403 || error.response?.status === 401) {
                toast.error('Session expired. Please login again.')
                navigate('/login')
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to create task'
                toast.error(errorMessage)
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (loadingAssets) return <PageLoading message="Loading assets..." />

    return (
        <div>
            <PageHeader
                title="Report Maintenance Task"
                subtitle="Report an issue or request maintenance for an asset"
            />

            <Card className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Select
                        label="Select Asset"
                        value={selectedAssetId}
                        onChange={(e) => setSelectedAssetId(e.target.value)}
                        required
                    >
                        <option value="">-- Select an Asset --</option>
                        {assets.map((asset) => (
                            <option key={asset.assetId} value={asset.assetId}>
                                {asset.assetCode} - {asset.assetName} ({asset.assetType?.replace(/_/g, ' ')})
                            </option>
                        ))}
                    </Select>
                    {assets.length === 0 && (
                        <p className="text-sm text-gray-500">No assets available. Please contact an administrator.</p>
                    )}

                    <Input
                        type="text"
                        label="Task Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Fix pump leak"
                        required
                    />

                    <Textarea
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                        placeholder="Describe the issue in detail..."
                        required
                    />

                    <Select
                        label="Priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        required
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </Select>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={isLoading || assets.length === 0}
                            className="flex-1"
                        >
                            {isLoading ? 'Submitting...' : 'Report Task'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}

export default TaskForm
