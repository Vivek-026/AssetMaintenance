import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../common/StatusBadge'
import Button from '../common/Button'
import EmptyState from '../common/EmptyState'

function TaskTable({ tasks, onAction }) {
    const navigate = useNavigate()
    const { user } = useAuth()

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (tasks.length === 0) {
        return (
            <EmptyState
                title="No tasks found"
                description="There are no tasks to display at the moment."
            />
        )
    }

    return (
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
                            Reported At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assigned To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
                        <tr key={task.taskId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {task.taskCode}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {task.title}
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
                                {formatDate(task.reportedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {task.assignedTo?.name || 'Unassigned'}
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
                                    {onAction && (
                                        <>
                                            {user?.role === 'MANAGER' && task.status === 'REPORTED' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => onAction('assign', task.taskId)}
                                                >
                                                    Assign
                                                </Button>
                                            )}
                                            {user?.role === 'TECHNICIAN' && task.status === 'ASSIGNED' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => onAction('start', task.taskId)}
                                                >
                                                    Start
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TaskTable

