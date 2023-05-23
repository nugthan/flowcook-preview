import React, {useContext, useEffect, useRef, useState} from "react";
import classNames from "classnames";
import styles from "../styles/components/recipe.module.scss";
import Image from "next/image";
import Lottie from "lottie-react";
import cart from "../components/animations/cart2.json"
import {GlobalContext} from "../context/GlobalState";
import { v4 as uuidv4 } from 'uuid';
import {useCookies} from 'react-cookie';
import Link from "next/link";
import ActionButton from "@/components/actionbutton";



export default function recipe(props) {
    let recipe = props.data;
    // import shopping list state control
    const { shoppingList } = useContext(GlobalContext);
    // const to control active state of the remove button
    const [toggleRemove, setToggleRemove] = useState(false);
    const [cookies, setCookie] = useCookies(['shoppinglist']);
    const [loading, setLoading] = useState(false); // no double-clicking!

    return (
            <div className={classNames(styles.recipe)}>
                <Link href={'/recipes/' + recipe.username + '/' + recipe.url} style={{height: '100%'}}>
                    <div className={styles.image}>
                            <Image src={'/images/food.jpg'} alt={'recipe image'} fill></Image>
                    </div>
                    <div className={styles.content}>
                        <p className={styles.title}>{recipe.title} </p>
                        <p className={styles.username}>By {recipe.display_name ? recipe.display_name : recipe.username}</p>
                        <p className={styles.description}>{recipe.description}</p>
                        <div className={styles.tags}>
                            <div>
                                <p>Serving</p>
                                <p>{recipe.servings ? recipe.servings : '-'}</p>
                            </div>
                            <div>
                                <p>Prep Time</p>
                                <p>{recipe.prepTime ? recipe.PrepTime : '-'} mins</p>
                            </div>
                            <div>
                                <p>Ingredients</p>
                                <p>{recipe.ingredients ? recipe.ingredients.length : '-'}</p>
                            </div>
                        </div>
                    </div>
                </Link>
                <ActionButton recipe={recipe} shoppingList={shoppingList}></ActionButton>
            </div>
    )
}
