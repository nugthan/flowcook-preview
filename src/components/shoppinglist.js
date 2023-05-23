import React, {useContext, useEffect, useState} from "react";
import styles from '../styles/components/shoppinglist.module.scss'
import classNames from "classnames";
import {GlobalContext} from '@/context/GlobalState';
// import {useCookies} from 'react-cookie';
import {AnimatePresence, motion} from "framer-motion";
import Cookies from 'js-cookie'
export default function shoppinglist({noSticky, recipe, height}) {

    const { shoppingList } = useContext(GlobalContext);
    const { setList } = useContext(GlobalContext);
    const [oldList, setOldList] = useState(shoppingList);
    const [combinedIngredients, setCombinedIngredients] = useState(shoppingList);

    // set shoppingList to cookie data
    useEffect( () => {
        let cookie = Cookies.get('shoppinglist');
        if (cookie) {
            setList(cookie);
            setOldList(shoppingList);
        }
    },[])

    const [stickyActive, setSticky] = useState(false);

    // animate when item is added
    useEffect(() => {
        // if item was added to list
        if (oldList.length < shoppingList.length) {
            setOldList(shoppingList);
        } else if (oldList.length > shoppingList.length) {
            setOldList(shoppingList);
        }
    }, [shoppingList]);

    // update cookie
    useEffect(() => {

        Cookies.set('shoppinglist', oldList, { path: '/', expires: 7 })
    }, [oldList]);

    // sticky shopping list
    useEffect(() => {
        if (!noSticky) {
            let shoppinglist = document.getElementById('shoppinglist');
            let sticky = shoppinglist.offsetTop;
            window.onscroll = function() {
                if ((window.pageYOffset + 24) > sticky) {
                    setSticky(true)
                } else {
                    setSticky(false)
                }
            }
        }
    })


    return (
        <div className={classNames(styles.shoppinglist, styles.open, (stickyActive ? styles.stickyactive : ''), (noSticky ? styles.nosticky : ''))} id={'shoppinglist'}>
            <div className={styles.content}>
                <p className={styles.title}>Shopping List</p>
                <div className={styles.list}>
                    <AnimatePresence>
                            {oldList.map((ingredient, index) => (
                                <motion.div
                                    key={index}
                                    transition={{ duration: 0.3 }}
                                    initial={{ opacity: 0  }}
                                    animate={{ opacity: 1}}
                                    exit={{ opacity: 0, }}
                                >
                                    <div className={classNames(styles.item, (recipe ? (recipe.ingredients.find(g => g.id === ingredient.id) ? 'bg-yellow' : '') : '') )} key={index}>
                                        <div className={styles.checkbox}>
                                            <input type={"checkbox"}></input>
                                        </div>
                                        <p><span>{ingredient.amount}{ingredient.unit_symbol}</span> {ingredient.name}</p>
                                    </div>
                                </motion.div>
                            ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
