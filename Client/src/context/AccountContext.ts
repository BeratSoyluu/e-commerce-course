import { createContext } from "react";
import type { User } from "../model/IUser";

export interface AccountContextValue {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
}

export const AccountContext = createContext<AccountContextValue | undefined>(undefined);
