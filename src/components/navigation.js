import React from 'react';
import styles from '../styles/components/navigation.module.scss';
import classNames from "classnames";
import Link from 'next/link'
import Logo from "../components/svg/logo";
import Caret from "../components/svg/caret";
import Button from "../components/button";
import {getAppCookies, verifyToken} from "@/lib/utils";
import NewButton from "@/components/NewButton";
import {useStoreActions, useStoreState} from "easy-peasy";

export const Navigation = () => {
    const user = useStoreState(state => state.user);


    const links = [
        {
            name: 'Explore',
            href: '/',
        },
        {
            name: 'Origins',
            href: '/',
            dropdown: [],
        },
        {
            name: 'Flavours',
            href: '/',
            dropdown: [],
        }
    ]

    return (
        <>
            <nav className={styles.nav}>
                <div className={classNames('container', styles.navcontainer)}>
                    <div className={styles.logo}>
                        <Link href="/">
                            <Logo />
                        </Link>
                    </div>
                    <div className={styles.links}>
                        {links.map((link, index) => (
                            <div className={styles.link} key={index}>
                                <Link key={index} href={link.href}>
                                    <p>{link.name}</p>
                                    {link.dropdown && (
                                     <div className={styles.caret}>
                                         <Caret/>
                                     </div>
                                    )}
                                </Link>
                            </div>
                        ))}
                    </div>
                    {user && (
                        <div className={styles.user}>
                            <Link href={'/dashboard'} className={styles.login}>
                                <NewButton className={'bg-white'}>{user.display_name || user.username}</NewButton>
                            </Link>
                        </div>
                    )}
                    {!user && (
                        <div className={styles.user}>
                            <Link href={'/login'} className={styles.login}><p>Login</p></Link>
                            <Link href={'/sign-up'}>
                                <NewButton className={'bg-white ml-3'}>Sign up</NewButton>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </>
    )
};
export default Navigation;
