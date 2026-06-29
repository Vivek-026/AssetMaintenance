import { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { BASE_URL } from "../axiosConfig.js"
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from "react-router-dom"
import Button from '../components/common/Button'
import { Input } from '../components/common/Input'
import Card from '../components/common/Card'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()

        if (!email || !password) {
            toast.error('Please fill in all fields')
            return
        }

        if (!email.includes('@')) {
            toast.error('Please enter a valid email address')
            return
        }

        setIsLoading(true)

        try {
            const response = await axios.post(BASE_URL + 'auth/login', {
                email,
                password,
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

                toast.success('Login successful!')
                navigate('/dashboard')
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.'
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Asset Maintenance</h1>
                    <p className="text-gray-600">Sign in to your account</p>
                </div>

                <Card>
                    <form onSubmit={handleLogin} className="space-y-4">
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

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default LoginPage

