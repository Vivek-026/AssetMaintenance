function StatusBadge({ status }) {
    const getStatusStyles = (status) => {
        const styles = {
            REPORTED: 'bg-blue-100 text-blue-800',
            ASSIGNED: 'bg-indigo-100 text-indigo-800',
            IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
            COMPLETED_BY_TECHNICIAN: 'bg-green-100 text-green-800',
            CONFIRMED_COMPLETED: 'bg-green-100 text-green-800',
            COMPLETED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
            MATERIAL_REQUESTED: 'bg-orange-100 text-orange-800',
            MATERIAL_APPROVED: 'bg-blue-100 text-blue-800',
            MATERIAL_REJECTED: 'bg-red-100 text-red-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            APPROVED: 'bg-green-100 text-green-800',
            ACTIVE: 'bg-green-100 text-green-800',
            INACTIVE: 'bg-gray-100 text-gray-800',
            UNDER_MAINTENANCE: 'bg-orange-100 text-orange-800',
            LOW: 'bg-gray-100 text-gray-800',
            MEDIUM: 'bg-blue-100 text-blue-800',
            HIGH: 'bg-orange-100 text-orange-800',
            URGENT: 'bg-red-100 text-red-800',
        }
        return styles[status] || 'bg-gray-100 text-gray-800'
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(status)}`}>
            {status?.replace(/_/g, ' ')}
        </span>
    )
}

export default StatusBadge

