import React from 'react';
import classNames from "classnames";
import styles from "@/styles/components/dashnav.module.scss";
import Image from "next/image";
import Cross from "../../public/images/cross.svg";
import Link from "next/link";
import Logo from "@/components/svg/logo";
import DashIcon from "../../public/images/dashboard.svg";
import RecipesIcon from "../../public/images/recipes.svg";
import SettingsIcon from "../../public/images/settings.svg";
import Logout from "../../public/images/logout.svg";
import Router, {useRouter} from "next/router";

import {
    setLogout,
} from '@/lib/utils';
import {useUserContext} from "@/context/user";
import {useStoreActions, useStoreState} from "easy-peasy";

export default function dashNav({navOpen, setNavOpen}) {

    const user = useStoreState(state => state.user);
    const setUser = useStoreActions((actions) => actions.setUser);

    const router = useRouter();
    const path = router.pathname.split('/');
    // if path is longer than 1, remove 'dashboard' from path
    if (path.length > 1) {
        path.shift();
        path.shift()
    }

    let items = [
        {
            name: 'Dashboard',
            icon: DashIcon,
            url: '/dashboard',
        },
        {
            name: 'Recipes',
            icon: RecipesIcon,
            url: '/dashboard/recipes',
        },
        {
            name: 'Profile',
            icon: SettingsIcon,
            url: '/dashboard/profile',
        },
    ]

    async function logout(e) {
        await setLogout(e, setUser);
        await Router.push('/');
    }

    return (
        <div className={classNames(styles.nav, (navOpen ? styles.open : ''))}>
            <div className={styles.close} onClick={() => setNavOpen(!navOpen)}>
                <Image src={Cross} className={styles.closeicon} alt={'close'}></Image>
            </div>
            <Link href={'/'} className={styles.logo}>
                <Logo></Logo>
            </Link>
            <div className={styles.links}>
                {items && items.map((item, index) => {
                    return (
                        // if path includes item.url, add active class
                        <Link href={item.url} className={classNames(styles.link, (path.includes((item.name.toLowerCase())) ? styles.active : ''))} key={index}>
                            <div className={styles.icon}>
                                <Image src={item.icon} alt={'icon'}></Image>
                            </div>
                            <p>
                                {item.name}
                            </p>
                        </Link>
                    )
                })}
                <div className={styles.animation}></div>
                {user && user.staff &&
                    <div className={styles.admin}>
                        <Link href={'/dashboard/admin'} className={styles.link}>
                            <p>
                                Moderation
                            </p>
                        </Link>
                    </div>
                }
            </div>
            <div className={styles.logout} onClick={(e) => logout(e)}>
                <div className={styles.icon}>
                    <Image src={Logout} alt={'logout'}></Image>
                </div>
                <p>Log out</p>
            </div>
        </div>
    )
}
