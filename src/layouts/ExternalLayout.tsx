import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ExternalLayout = () => {
    const { user }: any = useAuth();
    if (user) {
        return <Navigate to="/" />;
    }

    return (
        <Outlet />
    )
};