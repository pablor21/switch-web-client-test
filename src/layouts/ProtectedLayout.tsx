import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";




export const ProtectedLayout = () => {
    const { user }: any = useAuth();

    const logout = (e: any) => {
        e.preventDefault()
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        window.location.reload()
    }




    if (!user) {
        return <Navigate to="/auth/login" />;
    }

    return (
        <>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                borderBottom: '1px solid #ccc'
            }}>
                Hello @{user.user_name}
                <Link to="" onClick={logout}>Logout</Link>
            </header>
            <Outlet />
        </>
    )
};