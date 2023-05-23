import styles from "@/styles/components/dashboardcontainer.module.scss";
import classNames from "classnames";
import DashNavMobile from "@/components/dashnavmobile";
import DashNav from "@/components/dashnav";
import React from "react";

export default function container({children, title}) {
    const [navOpen, setNavOpen] = React.useState(false);

    return (
        <div>
            <div className={classNames(styles.overlay, (navOpen ? styles.open : ''))}></div>
            <DashNavMobile navOpen={navOpen} setNavOpen={setNavOpen}></DashNavMobile>
            <div className="flex relative">
                <DashNav navOpen={navOpen} setNavOpen={setNavOpen}></DashNav>
                <div className="w-full">
                    {title && <h1 className="mt-16 text-subtitlem lg:text-subtitle">{title}</h1>}
                    <div className={classNames(styles.dashgrid, (title ? styles.withtitle : ''))}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
