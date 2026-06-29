import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"
import toast from "react-hot-toast"
import UserDashboard from "./dashborad/UserDashboard.jsx"
import TechnicianDashboard from "./dashborad/TechnicianDashboard.jsx"
import ManagerDashboard from "./dashborad/ManagerDashboard.jsx"
import AdminDashboard from "./dashborad/AdminDashboard.jsx"

function Dashboard() {
    const { token, user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) {
            toast.error('Please login to access dashboard')
            navigate('/login')
        }
    }, [token, navigate])

    if (!user) {
        return <div style={{ padding: '20px' }}>Loading...</div>
    }

    switch (user.role) {
        case 'TECHNICIAN':
            return <TechnicianDashboard />
        case 'MANAGER':
            return <ManagerDashboard />
        case 'ADMIN':
            return <AdminDashboard />
        case 'USER':
        default:
            return <UserDashboard />
    }
}

export default Dashboard

