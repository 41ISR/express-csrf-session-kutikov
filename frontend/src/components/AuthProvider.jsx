import { Outlet, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"
import { useEffect } from "react"

const AuthProvider = () => {
    const {user, checkAuth} = useAuthStore()
    const navigate = useNavigate()

    // на первом рендере компонента
    useEffect(() => {
        const init = async () => {
            // делать запрос на проверку авторизации
            await checkAuth()
        }
        init()
    }, [])

    if (!user) navigate("/signin")

    return <Outlet />
}

export default AuthProvider