import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";

export type User = { id: string; name: string };

const UserContext = createContext<User | null>(null);

export function useUser(): User {
	const ctx = useContext(UserContext);
	if (!ctx) throw new Error("UserProvider missing");
	return ctx;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	useEffect(() => {
		const stored = localStorage.getItem("demo_user");
		if (stored) {
			setUser(JSON.parse(stored));
			return;
		}
		const id = nanoid(10);
		const name = `User-${id.slice(0, 4)}`;
		const u = { id, name };
		localStorage.setItem("demo_user", JSON.stringify(u));
		setUser(u);
	}, []);

	if (!user) return null as any;
	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

