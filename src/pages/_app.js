import '../fonts/jeko/jeko.css'
import '../fonts/monument/monument.css'
import '../styles/global.css'
import '../styles/transition.css'


import { GlobalProvider } from '@/context/GlobalState';
import { CookiesProvider } from 'react-cookie';
import {StoreProvider} from "easy-peasy";
import store from "@/store/index";
import {UserProvider} from "@/context/user";

function App({Component, pageProps}) {
    const getLayout = Component.getLayout || ((page) => page);
    return (
        <StoreProvider store={store}>
            <UserProvider>
                <GlobalProvider>
                    <CookiesProvider>
                        {getLayout (
                            <Component {...pageProps}></Component>
                        )}
                    </CookiesProvider>
                </GlobalProvider>
            </UserProvider>
            </StoreProvider>
    );
}
export default App
