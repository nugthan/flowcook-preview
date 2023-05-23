import React, {useContext, useEffect, useState} from "react";
import styles from '../styles/components/advert.module.scss'
import classNames from "classnames";
import {GlobalContext} from '../context/GlobalState';
import {useCookies} from 'react-cookie';
import {AnimatePresence, motion} from "framer-motion";

export default function shoppingList() {

    return (
        <div className={classNames(styles.shoppinglist, styles.open)} id={'shoppinglist'}>
            <div className={styles.content}>
                    Really cool dwadwadwadwa
            </div>
        </div>
    )
}
