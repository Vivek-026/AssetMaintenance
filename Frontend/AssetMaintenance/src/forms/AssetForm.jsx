import { useState, useEffect } from 'react'
import Button from '../components/common/Button'
import { Input, Select, Textarea } from '../components/common/Input'
import Card from '../components/common/Card'

const assetTypes = [
    'CNC_MACHINE', 'PRESS_MACHINE', 'CONVEYOR', 'PUMP', 'COMPRESSOR',
    'GENERATOR', 'WELDING_MACHINE', 'PACKAGING_MACHINE', 'OTHER'
]

const assetStatuses = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE']

function AssetForm({ initialData, onSubmit, onCancel, isEditing }) {
    const [formData, setFormData] = useState({
        assetName: '',
        assetType: 'CNC_MACHINE',
        location: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        description: '',
        purchaseDate: '',
        installationDate: '',
        status: 'ACTIVE'
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                assetName: initialData.assetName || '',
                assetType: initialData.assetType || 'CNC_MACHINE',
                location: initialData.location || '',
                manufacturer: initialData.manufacturer || '',
                model: initialData.model || '',
                serialNumber: initialData.serialNumber || '',
                description: initialData.description || '',
                purchaseDate: initialData.purchaseDate || '',
                installationDate: initialData.installationDate || '',
                status: initialData.status || 'ACTIVE'
            })
        }
    }, [initialData])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {isEditing ? 'Edit Asset' : 'Create New Asset'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Asset Name"
                        name="assetName"
                        value={formData.assetName}
                        onChange={handleChange}
                        required
                    />

                    <Select
                        label="Asset Type"
                        name="assetType"
                        value={formData.assetType}
                        onChange={handleChange}
                        required
                    >
                        {assetTypes.map(type => (
                            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                        ))}
                    </Select>

                    <Input
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Manufacturer"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleChange}
                    />

                    <Input
                        label="Model"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                    />

                    <Input
                        label="Serial Number"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleChange}
                    />

                    <Input
                        type="date"
                        label="Purchase Date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleChange}
                    />

                    <Input
                        type="date"
                        label="Installation Date"
                        name="installationDate"
                        value={formData.installationDate}
                        onChange={handleChange}
                    />

                    <Select
                        label="Status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                    >
                        {assetStatuses.map(status => (
                            <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                        ))}
                    </Select>
                </div>

                <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                />

                <div className="flex gap-3 pt-4">
                    <Button type="submit">
                        {isEditing ? 'Update Asset' : 'Save Asset'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Card>
    )
}

export default AssetForm

