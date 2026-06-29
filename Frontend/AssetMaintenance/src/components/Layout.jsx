import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

function Layout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                <Outlet />
            </main>
        </div>
    )
}

export default Layout

