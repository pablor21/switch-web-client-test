import { any } from "prop-types";
import { createContext, ReactElement, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";
const AuthContext = createContext(any);

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useLocalStorage<any>("user", null);
    const [token, setToken] = useLocalStorage<string>("token");
    const navigate = useNavigate();

    // call this function when you want to authenticate the user
    const login = async (data: any) => {
        setUser(data);
        navigate("/", { replace: true });
    };

    // call this function to sign out logged in user
    const logout = () => {
        setUser(null);
        navigate("/auth/login", { replace: true });
    };

    const value = useMemo(
        () => ({
            token,
            user,
            login,
            logout
        }),
        [token, user]
    );

    return <AuthContext.Provider value={value as any}> {children} </AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};