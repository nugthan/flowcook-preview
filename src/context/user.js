import {createContext, useContext, useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import {getUserAuth} from "@/lib/utils";
import {useRouter} from "next/router";
import {useStoreActions, useStoreState} from "easy-peasy";

const UserContext = createContext();


export function UserProvider({ children, props }) {
    const router = useRouter();
    const user = useStoreState((state) => state.user);
    const [loading, setLoading] = useState(true);
    const setUser = useStoreActions((actions) => actions.setUser);

    useEffect(() => {
        const token = Cookies.get('token');

        let path = router.pathname;
        getUserAuth(token,path).then((data) => {
            // if a redirect is needed, do it
            if (data && data.redirect) {
                // redirect user to /login
                router.push(data.redirect).then(() => {
                    setLoading(false)
                    return
                });
                setLoading(false)
            }
            setUser(data);
            setLoading(false);
        });

    }, []);

    return (
        <UserContext.Provider value={user}>
            {!loading && children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    return useContext(UserContext);
}
