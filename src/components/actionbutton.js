import React, {useContext, useEffect, useRef, useState} from "react";
import classNames from "classnames";
import styles from "@/styles/components/actionbutton.module.scss";
import Lottie from "lottie-react";
import cart from "@/components/animations/cart2.json";
import Image from "next/image";
import {GlobalContext} from "@/context/GlobalState";
import Cross from '/public/images/cross.svg';
import Check from '/public/images/check.svg'


export default function ActionButton({shoppingList, recipe}) {
    const { removeItemFromList } = useContext(GlobalContext);
    const { addItemToList } = useContext(GlobalContext);

    const [loading, setLoading] = useState(false); // no double-clicking!
    const [toggleRemove, setToggleRemove] = useState(false);

    // set toggleRemove to true if item is on the list
    useEffect(() => {
        if (shoppingList.find(item => item.parent_id === recipe.id)) {
            setToggleRemove(true)
        }
    }, []);

    function addItem() {
        if (!loading) {
            // check item is not already on the list
            if (shoppingList.find(item => item.parent_id === recipe.id)) {
                let recipeitems = shoppingList.filter(item => item.parent_id === recipe.id)
                recipeitems.forEach(item => {
                    removeItemFromList({id: recipe.id, parent_id: item.parent_id})
                })
                setToggleRemove(false)
            } else {
                setLoading(true)
                // fetch ingredients list for the recipe
                fetch('/api/author/' + recipe.username + '/' + recipe.url)
                    .then(res => res.json())
                    .then(data => {
                        let recipe = data.data;
                        // get ingredients from recipe
                        let ingredients = recipe.ingredients.map(ingredient => {
                            return {
                                parent_id: recipe.id,
                                id: ingredient.id,
                                amount: ingredient.amount,
                                name: ingredient.name,
                                unit_name: ingredient.uni_name,
                                unit_symbol: ingredient.unit_symbol,
                            }
                        })
                        ingredients.forEach(ingredient => {
                            addItemToList(ingredient);
                        })
                        setLoading(false)
                    })
            }
        }
    }
    const cartRef = useRef();
    function startAnim() {
        cartRef.current.play();

    }
    function resetAnim() {
        cartRef.current.stop();
        if (shoppingList.find(item => item.parent_id === recipe.id)) {
            setToggleRemove(true)
        }
    }


    return (
        <div className={classNames(styles.actionbutton, (shoppingList.find((item) => item.parent_id === recipe.id) ? styles.clicked: ''), (toggleRemove ? styles.toggleremove : ''))} onMouseEnter={startAnim} onMouseLeave={resetAnim} onClick={addItem} id={'actionbutton'}>
            <p>{(shoppingList.find((item) => item.parent_id === recipe.id) ? 'Remove from': 'Add to')} list</p>
            <button>
                <div className={styles.inside}>
                    <div className={styles.icon}>
                        <Lottie lottieRef={cartRef} animationData={cart} className={styles.cart} autoplay={false} loop={false}></Lottie>
                        <div className={styles.checkmark}>
                            <Image src={Check} alt={'tick'} width={14} height={14}></Image>
                        </div>
                        <div className={styles.cross}>
                            <Image src={Cross} alt={'cross'} width={14} height={14}></Image>
                        </div>
                        <svg width="14px" height="12px" viewBox="0 0 14 12" version="1.1" className={styles.arrow}>
                            <g id="home" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <g id="Extra-Large" transform="translate(-1326.000000, -856.000000)" fill="#FFFFFF" fillRule="nonzero">
                                    <g id="recipe" transform="translate(579.000000, 836.000000)">
                                        <g id="arrow-right" transform="translate(747.000000, 20.000000)">
                                            <path d="M7.91496063,11.9989872 C7.41046102,11.9787326 7.01804903,11.5576749 7.03852165,11.0585475 C7.04701176,10.8512654 7.12727649,10.6531871 7.26582797,10.4974947 L11.8370334,6.02018209 L7.26585808,1.54289928 C6.91138064,1.19011154 6.91138064,0.620331325 7.26585808,0.267543577 C7.62141936,-0.087120701 8.20028275,-0.0894738107 8.5587945,0.262301206 C8.5605708,0.264028806 8.5623471,0.265786192 8.56409329,0.267543577 L13.7295768,5.37802141 C14.0880584,5.72979643 14.0904368,6.30249569 13.7348756,6.65718975 C13.7331294,6.65894714 13.7313531,6.66070452 13.7295768,6.66243212 L8.56406319,11.7728802 C8.38574063,11.9290194 8.15283444,12.0101272 7.91496063,11.9989872 Z" id="Path"></path>
                                            <path d="M13.124991,7 L0.875009005,7 C0.391761531,7 0,6.55227714 0,6 C0,5.44772286 0.391761531,5 0.875009005,5 L13.124991,5 C13.6082385,5 14,5.44772286 14,6 C14,6.55227714 13.6082385,7 13.124991,7 Z" id="Path"></path>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>
                    </div>
                </div>
            </button>
        </div>
    )
}
