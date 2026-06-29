import { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { BASE_URL } from "../axiosConfig.js"
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from "react-router-dom"
import Button from '../components/common/Button'
import { Input, Select } from '../components/common/Input'
import Card from '../components/common/Card'

function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [role, setRole] = useState('USER')
    const [department, setDepartment] = useState('IT')
    const [isLoading, setIsLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()

        if (!name || !email || !password || !confirmPassword || !role || !department) {
            toast.error('Please fill in all fields')
            return
        }

        if (!email.includes('@')) {
            toast.error('Please enter a valid email address')
            return
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        setIsLoading(true)

        try {
            const response = await axios.post(BASE_URL + 'auth/register', {
                name,
                email,
                password,
                role,
                department
            })

            if (response.data.token) {
                const userData = {
                    userId: response.data.userId,
                    name: response.data.name,
                    email: response.data.email,
                    role: response.data.role,
                    department: response.data.department
                }
                login(response.data.token, userData)

                toast.success('Registration successful!')
                navigate('/dashboard')
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Register for Asset Maintenance System</p>
                </div>

                <Card>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <Input
                            type="text"
                            label="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />

                        <Input
                            type="email"
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />

                        <Input
                            type="password"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />

                        <Input
                            type="password"
                            label="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />

                        <Select
                            label="Role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="USER">User</option>
                            <option value="TECHNICIAN">Technician</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                        </Select>

                        <Select
                            label="Department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            required
                        >
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                            <option value="FINANCE">Finance</option>
                            <option value="OPERATIONS">Operations</option>
                            <option value="SALES">Sales</option>
                            <option value="MANAGEMENT">Management</option>
                            <option value="MAINTENANCE">Maintenance</option>
                        </Select>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Creating Account...' : 'Register'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                            >
                                Login
                            </button>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default RegisterPage
