import { createContext, useContext, useEffect, useState } from "react";
import { axiosInstance } from "../config/axios.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCustomer = async () => {
        try {
            const customerData = await axiosInstance.get("/customer/getme");
            setCustomer(customerData.data.customer);
            return customerData.data.customer;
        } catch (error) {
            setCustomer(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomer();
    }, []);

    const logout = async () => {
        try {
            await axiosInstance.post("/customer/logout");
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            setCustomer(null);
        }
    };

    return (
        <AuthContext.Provider value={{ customer, setCustomer, loading, fetchCustomer, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

