import React from 'react';
import PropTypes from 'prop-types';
import styles from '@/styles/layouts/dashboard.module.scss'
import {useUserContext} from "@/context/user";



export default function Layout({ children }) {

    return (
        <div className={styles.dashcontainer}>
            <main>{children}</main>
        </div>
    );
}

Layout.propTypes = {
    children: PropTypes.any,
};
