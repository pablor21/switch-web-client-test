import { createContext, ReactElement, useContext, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = ({ children }: { children: ReactElement }) => {
    const { user }: any = useAuth();
    if (!user) {
        // user is not authenticated
        return <Navigate to="/auth/login" />;
    }
    return children;
};
