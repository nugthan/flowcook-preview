import React, {useContext, useEffect, useRef} from 'react';
import Layout from '@/components/layouts/default';
import {useRouter} from "next/router";
import classNames from "classnames";
import styles from '@/styles/pages/recipe.module.scss'
import { DateTime } from 'luxon'
import Image from "next/image";
import ShoppingList from '@/components/shoppinglist';
import ActionButton from '@/components/actionbutton';
import {GlobalContext} from "@/context/GlobalState";
import Button from '@/components/button';
import Advert from '@/components/advert';
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import {getNumberSuffix} from "@/lib/utils";
import {BookmarkIcon as BookmarkOutline} from "@heroicons/react/24/outline";
import {BookmarkIcon as BookmarkSolid} from "@heroicons/react/24/solid";
import {useUserContext} from "@/context/user";
import ModalContainer from "@/components/ModalContainer"
import NewButton from "@/components/NewButton";
import Cookies from "js-cookie";
import Link from "next/link";
import Avatar from "@/components/Avatar";

export default function Recipe () {
    const user = useUserContext()
    const router = useRouter()
    const {author_name, recipe_url} = router.query
    const [recipe, setRecipe] = React.useState(null);
    const fetchData = () => {
        if (author_name && recipe_url) {
            fetch(`/api/author/${author_name}/${recipe_url}`, {
                method: 'GET',
            })
                .then(res => res.json())
                .then(data => {
                    setRecipe(data.data)
                })
                .catch(err => console.log(err));
        }
    }
    // fetch recipe from api
    useEffect(() => {
        fetchData();
    }, []);



    const [fakeUpdate, setFakeUpdate] = React.useState(null)
    const [bookmarkRed, setBookmarkRed] = React.useState(true)
    useEffect(() => {
        setFakeUpdate(user)
    },[user])



    const [loginModal, setLoginModal] = React.useState(false)
    const closeState = () => {
        setLoginModal(false)
    }

    let pushBookmark = false

    const bookmark = () => {
        if (!pushBookmark) {
            if (!user) {
                setLoginModal(true)
                return
            }
            // bookmark recipe
            pushBookmark = true
            fetch('/api/user/bookmarks', {
                method: 'POST',
                body: JSON.stringify({
                    recipe_id: recipe.id
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        return
                    }
                    setBookmarkRed(false)
                    pushBookmark = false
                    // update bookmarks in fakeUpdate
                    setFakeUpdate({
                        ...fakeUpdate,
                        bookmarks: data.data
                    })
                })
        }
    }
    const [error, setError] = React.useState(null);
    async function login() {
        let email = document.getElementById('email').value;
        let password = document.getElementById('password').value;

        try {
            const login = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
            const result = await login.json()
            if (result.error) {
                setError(result.message)
                return
            }
            if (result.token) {
                await Cookies.set('token', result.token, {
                    expires: 7,
                    path: '/',
                })
                // refresh page
                window.location.reload()
            }
        } catch (e) {
            setError(e)
        }
    }

    // fun maths for scaling ingredient

    return (
        <>
            <div className={'container'}>
                <div className={'grid grid-cols-2 gap-6 mt-8'}>
                    <div>
                        <div className={'flex items-center mb-8'}>
                            {recipe ?
                                <Avatar width={48} height={48} url={'https://s3.eu-west-2.amazonaws.com/cdn.flowcook.com/avatar/' + recipe.user_id +'.jpg'}></Avatar>
                                :
                                <Skeleton width={48} height={48} className={''} circle/>
                            }

                            <div className={'flex-grow'}>
                                {recipe ?
                                    <div className={'ml-3'}>
                                        <p className={'leading-[16px]'}>{recipe.display_name ? recipe.display_name : recipe.username}</p>
                                        <p className={'text-sm text-faded'}>{DateTime.fromISO(recipe.created_at).toFormat('LLLL')} {DateTime.fromISO(recipe.created_at).toFormat('d')}{getNumberSuffix(DateTime.fromISO(recipe.created_at).toFormat('d'))}, {DateTime.fromISO(recipe.created_at).toFormat('kkkk')}</p>
                                    </div>
                                    :
                                    <Skeleton width={100} height={16} count={2} className={'ml-3'}/>
                                }
                            </div>
                            <div onClick={() => bookmark()} onMouseLeave={() =>setBookmarkRed(true)} className={classNames('cursor-pointer rounded-full w-[48px] h-[48px] border flex items-center justify-center transition-all duration-200', (fakeUpdate && recipe && (fakeUpdate.bookmarks.find(s => s.recipe_id === recipe.id) ? 'text-success border-success' + (bookmarkRed && ' hover:text-error hover:border-error') : 'text-faded hover:text-black border-faded hover:border-black')))}>
                                {fakeUpdate && recipe && fakeUpdate.bookmarks.find(s => s.recipe_id === recipe.id) ?
                                    <BookmarkSolid width={24} className={''}></BookmarkSolid> :
                                    <BookmarkOutline width={24} className={''}></BookmarkOutline>
                                }
                            </div>
                        </div>
                        <div>
                            {recipe ?
                                <h1 className={'text-titlem lg:text-title mb-3'}>{recipe.title}</h1> :
                                <Skeleton height={48} className={'mb-3'}/>
                            }
                            {recipe ?
                                <p className={'max-w-[480px]'}>{recipe.description}</p> :
                                <Skeleton height={16} count={3} />
                            }
                        </div>
                        <div className={'flex w-full mt-8'}>
                            <div className={'flex-grow pr-6 border-r border-extrafaded'}>
                                <p>Serving</p>
                                {recipe ?
                                    <p className={'text-subtitlem lg:text-subtitle'}>{recipe.servings || '-'}</p> :
                                    <Skeleton width={32} height={24} />
                                }
                            </div>
                            <div className={'flex-grow px-6 border-r border-extrafaded'}>
                                <p>Prep Time</p>
                                {recipe ?
                                    <p className={'text-subtitlem lg:text-subtitle'}>{recipe.prepTime || '-'}</p> :
                                    <Skeleton width={32} height={24} />
                                }
                            </div>
                            <div className={'flex-grow pl-6'}>
                                <p>Ingredients</p>
                                {recipe ?
                                    <p className={'text-subtitlem lg:text-subtitle'}>{recipe.ingredients ? recipe.ingredients.length : '-'}</p> :
                                    <Skeleton width={32} height={24} />
                                }
                            </div>
                        </div>
                    </div>
                    <div className={'relative'}>
                        <Image src={'/images/food.jpg'} alt={'recipe image'} fill className={'object-cover rounded-md'}></Image>
                    </div>
                </div>

            </div>
            {/*{recipe &&*/}
            {/*    <div>*/}
            {/*        <div className={classNames(styles.header, 'section')}>*/}
            {/*            <div>*/}
            {/*                <div className={styles.user}>*/}
            {/*                    <div className={styles.profile}></div>*/}
            {/*                    <div className={styles.details}>*/}
            {/*                        <p className={styles.username}>{recipe.display_name ? recipe.display_name : recipe.username}</p>*/}
            {/*                        <p className={styles.date}>{DateTime.fromISO(recipe.created_at).toFormat('LLL y')}</p>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*                <div>*/}
            {/*                    <h1 className={styles.title}>{recipe.title}</h1>*/}
            {/*                </div>*/}
            {/*                <div>*/}
            {/*                    <p className={styles.description}>{recipe.description}</p>*/}
            {/*                    <div className={styles.tags}>*/}
            {/*                        <div>*/}
            {/*                            <p>Serving</p>*/}
            {/*                            <p>{recipe.servings}</p>*/}
            {/*                        </div>*/}
            {/*                        <div>*/}
            {/*                            <p>Prep Time</p>*/}
            {/*                            <p>{recipe.prepTime} mins</p>*/}
            {/*                        </div>*/}
            {/*                        <div>*/}
            {/*                            <p>Ingredients</p>*/}
            {/*                            <p>{recipe.ingredients.length}</p>*/}
            {/*                        </div>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*            <div className={styles.image}>*/}
            {/*                <Image src={'/images/food.jpg'} alt={'recipe image'} fill></Image>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*        <div className={classNames(styles.ingredients, 'section')}>*/}
            {/*            <div className={styles.ingredientscontainer}>*/}
            {/*                <h2 className={styles.title}>Ingredients</h2>*/}
            {/*                <div className={styles.servings}>*/}
            {/*                    <p>Adjust servings</p>*/}
            {/*                    <input type="number" value={servings} onChange={updateServings}></input>*/}
            {/*                </div>*/}
            {/*                <div className={styles.ingredientsgrid}>*/}

            {/*                    {scaledIngredients.map((ingredient, index) => (*/}
            {/*                        <div key={index} className={classNames(styles.ingredient, (shoppingList.find((item) => item.id === ingredient.id) ? styles.onlist: ''))}>*/}
            {/*                            <div className={styles.inc}>*/}
            {/*                                <div className={styles.checkbox}>*/}
            {/*                                    <input type={"checkbox"} name={index} min={1}></input>*/}
            {/*                                </div>*/}
            {/*                                <div className={styles.label}>*/}
            {/*                                    <p><span>{ingredient.amount}{ingredient.unit_symbol}</span> {ingredient.name}</p>*/}
            {/*                                </div>*/}
            {/*                            </div>*/}
            {/*                            <div className={styles.onlistnotification}>*/}
            {/*                                <p>On your shopping list</p>*/}
            {/*                            </div>*/}
            {/*                        </div>*/}
            {/*                    ))}*/}
            {/*                </div>*/}
            {/*                <ActionButton recipe={recipe} shoppingList={shoppingList}></ActionButton>*/}
            {/*            </div>*/}
            {/*            <div className={styles.shoppinglist}>*/}
            {/*                <ShoppingList noSticky recipe={recipe}></ShoppingList>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*        <div className={classNames(styles.recipe, '')}>*/}
            {/*            <div className={styles.content}>*/}
            {/*                <h3 className={styles.title}>Recipe</h3>*/}
            {/*                {recipe.steps.map((step, index) => (*/}
            {/*                    <div className={styles.step} key={index}>*/}
            {/*                        <div className={styles.top}>*/}
            {/*                            <div className={styles.stepnumber}>*/}
            {/*                                <p>{index + 1}</p>*/}
            {/*                            </div>*/}
            {/*                            <p className={styles.steptitle}>{step.title}</p>*/}
            {/*                        </div>*/}
            {/*                        <p className={styles.stepdescription}>{step.description}</p>*/}
            {/*                    </div>*/}
            {/*                ))}*/}

            {/*            </div>*/}
            {/*            <div className={styles.ads}>*/}
            {/*                <Advert></Advert>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*}*/}
            <ModalContainer openState={loginModal} closeState={closeState} title={'Login to continue'}>
                <p className={''}>Join our amazing community of home cooks and industry professionals and save, share and create your favourite recipes</p>
                <div className={'mt-6'}>
                    <div>
                        <label>Email Address</label>
                        <input type={"email"} name={'email'} id={'email'} tabIndex={0}></input>
                    </div>
                    <div className={'my-3'}>
                        <label>Password</label>
                        <input type={"password"} name={'password'} id={'password'}></input>
                    </div>
                </div>
                <div>
                    <NewButton className={'bg-black text-white w-full flex justify-center'} onClick={login}>Login</NewButton>
                </div>
                <Link href={'/login?signup=true'}><p className={'mt-3 text-center underline'}>Sign up for an account instead</p></Link>
                {error &&
                    <div className='text-error'>
                        <p>Error: {error}. Please contact support if the issue persists.</p>
                    </div>
                }
            </ModalContainer>
        </>
    );
}

Recipe.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    );
};
