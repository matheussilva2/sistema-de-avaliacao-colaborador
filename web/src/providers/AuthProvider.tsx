import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "../types/User"

const USERS_MOCK: User[] = [
    {
        nome: "Admin",
        sobrenome: "de Teste",
        email: "admin@teste.com",
        password: "senha123",
        foto_perfil: "https://github.com/matheussilva2.png",
        cargo: "ADMIN",
        permissoes: ["manage_trainings", "manage_users"]
    },
    {
        nome: "Aluno",
        sobrenome: "de Teste",
        email: "aluno@teste.com",
        password: "senha123",
        foto_perfil: "",
        cargo: "ALUNO",
        permissoes: []
    }
];

type AuthContextData = {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({children} : {children: React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('capacitanees@user');

        if(storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async({email, pass} : { email: string, pass: string}) => {
        setLoading(true);

        const result = USERS_MOCK.find(item => item.email === email && item.password === pass);

        if(result) {
            const data = { password, ...result};
            setUser(data);
            
            localStorage.setItem('capacitanees@user', JSON.stringify(data));
        } else {
            throw new Error('Credenciais inválidas');
        }

        setLoading(false);
    }

    const logout = () => {
        localStorage.removeItem('capacitanees@user');
        setUser(null);
    }

    return <AuthContext.Provider user={user} loading={loading} login={login} logout={logout} >
        {children}
    </AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext);

    return context;
}