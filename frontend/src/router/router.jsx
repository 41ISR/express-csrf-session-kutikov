import { createBrowserRouter } from "react-router-dom"
import Index from "../pages/Index"
import SignIn from "../pages/SignIn"
import SignUp from "../pages/SignUp"
import Logout from "../pages/Logout"
import AuthProvider from "../components/AuthProvider"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <AuthProvider />,
        children: [{
            index: true,
            element: <Index />
        }]
    },
        {
        path: "/logout",
        element: <Logout />
    }, 
    {
        path: "/signin",
        element: <SignIn />
    }, {
        path: "/signup",
        element: <SignUp />
    },
])