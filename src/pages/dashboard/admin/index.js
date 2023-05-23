import React, {useEffect} from "react";
import Layout from "@/components/layouts/dashboard";
import styles from '@/styles/pages/dashboard/admin/index.module.scss'
import classNames from "classnames";
import DashNav from "@/components/dashnav";
import DashNavMobile from "@/components/dashnavmobile";

export default function Dashboard(props) {

    const [navOpen, setNavOpen] = React.useState(false);

    return (
        <>
            <div className={styles.dashboard}>
                <div className={classNames(styles.overlay, (navOpen ? styles.open : ''))}></div>
                <DashNavMobile navOpen={navOpen} setNavOpen={setNavOpen}></DashNavMobile>
                <div className={styles.dasharea}>
                    <DashNav navOpen={navOpen} setNavOpen={setNavOpen}></DashNav>
                    <div className={styles.dashgrid}>
                        <p>Admin only page</p>
                    </div>
                </div>
            </div>
        </>
    )
}


Dashboard.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    );
};
