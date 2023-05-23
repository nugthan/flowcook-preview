import {action, createStore} from "easy-peasy";
import {getUserAuth} from "@/lib/utils";
import Cookies from 'js-cookie';
import {useRouter} from "next/router";

const store = createStore({
    user: null,
    setUser: action((state, payload) => {
        state.user = (payload);
    }),
    logout: action((state) => {
        state.user = null;
    }),
});

export default store;
