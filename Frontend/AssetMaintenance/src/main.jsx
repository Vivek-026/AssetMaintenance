import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";
import Layout from "./components/Layout.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TaskForm from "./forms/TaskForm.jsx";
import MyTasks from "./pages/MyTasks.jsx";
import TaskDetail from "./pages/TaskDetail.jsx";
import AllTasks from "./pages/AllTasks.jsx";
import MaterialRequests from "./pages/MaterialRequests.jsx";
import ManageAssets from "./pages/ManageAssets.jsx";
import MyAssignedTasks from "./pages/MyAssignedTasks.jsx";
import MyMaterialRequests from "./pages/MyMaterialRequests.jsx";
import ManagersList from "./pages/ManagersList.jsx";
import TechniciansList from "./pages/TechniciansList.jsx";
import Profile from "./pages/Profile.jsx";

const router = createBrowserRouter([
    // Public routes (redirect to dashboard if logged in)
    {
        path: "/login",
        element: <PublicRoute><LoginPage /></PublicRoute>
    },
    {
        path: "/register",
        element: <PublicRoute><RegisterPage /></PublicRoute>
    },

    {
        path: "/",
        element: <ProtectedRoute><Layout /></ProtectedRoute>,
        errorElement: <div>404 Not Found</div>,
        children: [
            { index: true, element: <Dashboard /> },
            { path: "dashboard", element: <Dashboard /> },
            { path: "tasks/all", element: <AllTasks /> },
            { path: "tasks/create", element: <TaskForm /> },
            { path: "tasks/assigned", element: <MyAssignedTasks /> },
            { path: "tasks/:taskId", element: <TaskDetail /> },
            { path: "my-tasks", element: <MyTasks /> },
            { path: "material-requests", element: <MaterialRequests /> },
            { path: "material-requests/my", element: <MyMaterialRequests /> },
            { path: "assets/manage", element: <ManageAssets /> },
            { path: "managers", element: <ManagersList /> },
            { path: "technicians", element: <TechniciansList /> },
            { path: "createtask", element: <TaskForm /> },
            { path: "profile", element: <Profile /> },
        ]
    }
]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
            <Toaster position="top-center" />
        </AuthProvider>
    </StrictMode>,
)
