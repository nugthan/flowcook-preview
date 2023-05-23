import React, {useEffect} from "react";
import Layout from "@/components/layouts/dashboard";
import styles from '@/styles/pages/dashboard/index.module.scss'
import Image from "next/image";
import Plus from '/public/images/plus-white.svg'
import Kebab from '/public/images/kebab.svg'
import {useRouter} from "next/router";
import { DateTime } from 'luxon'
import Container from "@/components/dashboard/Container"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import WhiteBox from "@/components/dashboard/WhiteBox";
import {getNumberSuffix} from "@/lib/utils";
import {useUserContext} from "@/context/user";
import Link from "next/link";
import OptionMenu from "@/components/optionmenu";
import {useStoreActions, useStoreState} from "easy-peasy";

export default function Dashboard(props) {
    const [recipes, setRecipes] = React.useState(null);
    const [bookmarks, setBookmarks] = React.useState(null);
    const router = useRouter();
    const user = useStoreState(state => state.user);
    const setUser = useStoreActions(actions => actions.setUser);
    const [newRecipeLoading, setNewRecipeLoading] = React.useState(false);

    useEffect(() => {
        fetch('/api/dashboard/recipes?limit=1&stats=true&nodrafts=true', {
            method: 'GET',
        })
            .then(res => res.json())
            .then(data => {
                setRecipes(data.data)
            })
        fetch('/api/user/bookmarks', {
            method: 'GET',
        })
            .then(res => res.json())
            .then(data => {
                setBookmarks(data.data)
            })
    }, [])


    const newRecipe = () => {
        setNewRecipeLoading(true)
        if (!newRecipeLoading) {
            fetch('/api/dashboard/recipes', {
                method: 'POST',
            })
                .then(res => res.json())
                .then(data => {
                    router.push(`/dashboard/recipes/${data.data.id}`)
            })
        }
    }

    const removeBookmark = (id) => {
        fetch('/api/user/bookmarks', {
            method: 'POST',
            body: JSON.stringify({
                recipe_id: id
            })
        })
            .then(res => res.json())
            .then(data => {
                setBookmarks(data.data)
                setUser({
                    ...user,
                    bookmarks: data.data
                })
            })
    }

    return (
        <>
                <div className={styles.dashboard}>
                    <Container>
                        <WhiteBox className="col-span-2">
                            <div>
                                <div className="flex items-top">
                                    <div className="flex flex-grow flex-col">
                                        <p className="text-subtitlem lg:text-subtitle mb-1">Your latest recipe</p>
                                        {!recipes &&
                                            <Skeleton width={100}/>
                                        }
                                        {recipes && recipes.length > 0 &&
                                            <p className="text-sm text-faded">
                                                {DateTime.fromISO(recipes[0].created_at).toFormat('LLLL')} {DateTime.fromISO(recipes[0].created_at).toFormat('d')}{getNumberSuffix(DateTime.fromISO(recipes[0].created_at).toFormat('d'))}, {DateTime.fromISO(recipes[0].created_at).toFormat('kkkk')}
                                            </p>
                                        }
                                    </div>
                                    <div>
                                        <button onClick={() => newRecipe()} className={styles.addrecipe}>
                                            <Image src={Plus} className={styles.plus} alt={'add'}></Image>
                                        </button>
                                    </div>
                                </div>
                                {recipes && recipes.length === 0 &&
                                    <p className="text-sm text-faded mt-12">You don&apos;t have any recipes yet! Create your first one to get started</p>
                                }
                                <div>
                                    {!recipes &&
                                        <div className="mt-12">
                                        <Skeleton count={2} className="text-titlem lg:text-title"/>
                                        </div>
                                    }
                                    {recipes && recipes.length > 0 &&
                                        <div className="mt-12">
                                            <p className="text-titlem lg:text-title">{recipes[0].title}</p>
                                        </div>
                                    }
                                </div>
                                <div>
                                    {!recipes &&
                                        <div className="mt-12 flex">
                                            <div className="flex flex-1 flex-col">
                                                <p className="text-sm text-faded mb-4">Views</p>
                                                <Skeleton width={100} height={26}/>
                                            </div>
                                            <div className="flex flex-1 flex-col">
                                                <p className="text-sm text-faded mb-4">Bookmarks</p>
                                                <Skeleton width={100} height={26}/>
                                            </div>
                                            <div className="flex flex-1 flex-col">
                                                <p className="text-sm text-faded mb-4">Shares</p>
                                                <Skeleton width={100} height={26}/>
                                            </div>
                                        </div>
                                    }
                                    {recipes && recipes.length > 0 &&
                                        <div className="mt-12 flex">
                                            <div className="flex flex-1 flex-col">
                                                <p className="text-sm text-faded mb-4">Views</p>
                                                <p className="text-subtitlem lg:text-subtitle">{recipes[0].views}</p>
                                            </div>
                                            <div className="flex flex-1 flex-col">
                                                <p className="text-sm text-faded mb-4">Bookmarks</p>
                                                <p className="text-subtitlem lg:text-subtitle">{recipes[0].bookmarks}</p>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className={styles.boxes}>
                                <div></div>
                                <div>
                                    <div></div>
                                    <div></div>
                                </div>
                            </div>
                        </WhiteBox>
                        <div className="col-span-2 lg:pt-10 pt-6 flex flex-col">
                            <div className="flex-grow">
                                <div className="flex items-end mb-3">
                                    <p className="text-subtitlem lg:text-subtitle flex-grow">Saved recipes</p>
                                    <p className="text-faded">{bookmarks && bookmarks.length > 3 && 'View all'}</p>
                                </div>
                                <div>
                                    {!bookmarks &&
                                        <div>
                                            <Skeleton count={3} height={64} className="text-titlem lg:text-title mb-3"/>
                                        </div>
                                    }
                                    {bookmarks && bookmarks.length === 0 &&
                                        <p className="text-sm text-faded">You don&apos;t have any saved recipes yet</p>
                                    }
                                    {bookmarks && bookmarks.length > 0 && bookmarks.map((bookmark, index) => {
                                        return (
                                            <div key={index} className={styles.recipe}>
                                                <Link href={'/recipes/' + bookmark.username + '/' + bookmark.url} className={'flex-grow py-4'}>
                                                    <div key={index} className={'w-full'}>
                                                        <div className={styles.itemtitle}>
                                                            <p className={styles.title}>
                                                                {bookmark.title}
                                                            </p>
                                                            <p>By {bookmark.display_name || bookmark.username}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <OptionMenu options={[{name: 'Delete', icon: 'delete', className: 'delete', action: () => removeBookmark(bookmark.id)}]}></OptionMenu>
                                            </div>
                                        )})

                                    }
                                </div>
                            </div>

                            <div className="flex flex-col justify-end w-full mb-9 mt-12 lg:mt-24">
                                <div className="w-full">
                                    <p className="text-subtitlem lg:text-subtitle mb-1">Learning Centre</p>
                                    <p className="text-faded">Get the most out of FoodMood</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6 mt-8 lg:mt-12">
                                    <div className={styles.item}>
                                        <div className={styles.icon}>
                                            <svg width="36px" height="36px" viewBox="0 0 36 36" version="1.1">
                                                <g id="home" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                                    <g id="Dashboard-home" transform="translate(-1028.000000, -834.000000)"
                                                       fillRule="nonzero">
                                                        <g id="dashboard" transform="translate(1028.000000, 834.000000)">
                                                            <path
                                                                d="M32.9612308,36 L23.0387692,36 C21.3636923,36 20,34.5226667 20,32.708 L20,19.292 C20,17.4773333 21.3636923,16 23.0387692,16 L32.9612308,16 C34.6363077,16 36,17.4773333 36,19.292 L36,32.708 C36,34.5226667 34.6363077,36 32.9612308,36 Z"
                                                                id="Shape"></path>
                                                            <path
                                                                d="M32.9612308,14 L23.0387692,14 C21.3636923,14 20,12.5898182 20,10.8576364 L20,3.14236364 C20,1.41018182 21.3636923,0 23.0387692,0 L32.9612308,0 C34.6363077,0 36,1.41018182 36,3.14236364 L36,10.8576364 C36,12.5898182 34.6363077,14 32.9612308,14 Z"
                                                                id="Shape"></path>
                                                            <path
                                                                d="M12.9612308,20 L3.03876923,20 C1.36369231,20 0,18.5226667 0,16.708 L0,3.292 C0,1.47733333 1.36369231,0 3.03876923,0 L12.9612308,0 C14.6363077,0 16,1.47733333 16,3.292 L16,16.708 C16,18.5226667 14.6363077,20 12.9612308,20 Z"
                                                                id="Shape"></path>
                                                            <path
                                                                d="M12.9612308,36 L3.03876923,36 C1.36369231,36 0,34.5898182 0,32.8576364 L0,25.1423636 C0,23.4101818 1.36369231,22 3.03876923,22 L12.9612308,22 C14.6363077,22 16,23.4101818 16,25.1423636 L16,32.8576364 C16,34.5898182 14.6363077,36 12.9612308,36 Z"
                                                                id="Shape"></path>
                                                        </g>
                                                    </g>
                                                </g>
                                            </svg>
                                        </div>
                                        <div className={styles.description}>
                                            <p className={styles.descriptiontitle}>Timeline Layout</p>
                                            <p>Tips and tricks for your timeline</p>
                                        </div>
                                    </div>
                                    <div className={styles.item}>
                                        <div className={styles.icon}>
                                            <svg width="36px" height="36px" viewBox="0 0 36 36" version="1.1">
                                                <g id="home" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                                    <g id="Dashboard-home" transform="translate(-1028.000000, -834.000000)"
                                                       fillRule="nonzero">
                                                        <g id="dashboard" transform="translate(1028.000000, 834.000000)">
                                                            <path
                                                                d="M32.9612308,36 L23.0387692,36 C21.3636923,36 20,34.5226667 20,32.708 L20,19.292 C20,17.4773333 21.3636923,16 23.0387692,16 L32.9612308,16 C34.6363077,16 36,17.4773333 36,19.292 L36,32.708 C36,34.5226667 34.6363077,36 32.9612308,36 Z"
                                                                id="Shape"></path>
                                                            <path
                                                                d="M32.9612308,14 L23.0387692,14 C21.3636923,14 20,12.5898182 20,10.8576364 L20,3.14236364 C20,1.41018182 21.3636923,0 23.0387692,0 L32.9612308,0 C34.6363077,0 36,1.41018182 36,3.14236364 L36,10.8576364 C36,12.5898182 34.6363077,14 32.9612308,14 Z"
                                                                id="Shape"></path>
                                                            <path
                                                                d="M12.9612308,20 L3.03876923,20 C1.36369231,20 0,18.5226667 0,16.708 L0,3.292 C0,1.47733333 1.36369231,0 3.03876923,0 L12.9612308,0 C14.6363077,0 16,1.47733333 16,3.292 L16,16.708 C16,18.5226667 14.6363077,20 12.9612308,20 Z"
                                                                id="Shape"></path>
                                                            <path
                                                                d="M12.9612308,36 L3.03876923,36 C1.36369231,36 0,34.5898182 0,32.8576364 L0,25.1423636 C0,23.4101818 1.36369231,22 3.03876923,22 L12.9612308,22 C14.6363077,22 16,23.4101818 16,25.1423636 L16,32.8576364 C16,34.5898182 14.6363077,36 12.9612308,36 Z"
                                                                id="Shape"></path>
                                                        </g>
                                                    </g>
                                                </g>
                                            </svg>
                                        </div>
                                        <div className={styles.description}>
                                            <p className={styles.descriptiontitle}>Timeline Layout</p>
                                            <p>Tips and tricks for your timeline</p>
                                        </div>
                                    </div>
                                    <div className={styles.item}>
                                        <div className={styles.icon}>
                                            <svg width="36px" height="36px" viewBox="0 0 36 36" version="1.1">
                                                <g id="home" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                                    <g id="Dashboard-home" transform="translate(-1028.000000, -834.000000)"
                                                       fillRule="nonzero">
                                                        <g id="dashboard" transform="translate(1028.000000, 834.000000)">
                                                            <path
                                                                d="M32.9612308,36 L23.0387692,36 C21.3636923,36 20,34.5226667 20,32.708 L20,19.292 C20,17.4773333 21.3636923,16 23.0387692,16 L32.9612308,16 C34.6363077,16 36,17.4773333 36,19.292 L36,32.708 C36,34.5226667 34.6363077,36 32.9612308,36 Z"
                                                                id="Shape"></path>
                                                            <path
                                                                d="M32.9612308,14 L23.0387692,14 C21.3636923,14 20,12.5898182 20,10.8576364 L20,3.14236364 C20,1.41018182 21.3636923,0 23.0387692,0 L32.9612308,0 C34.6363077,0 36,1.41018182 36,3.14236364 L36,10.8576364 C36,12.5898182 34.6363077,14 32.9612308,14 Z"
                                                                id="Shape"></path>
                                                            <path
                                                                d="M12.9612308,20 L3.03876923,20 C1.36369231,20 0,18.5226667 0,16.708 L0,3.292 C0,1.47733333 1.36369231,0 3.03876923,0 L12.9612308,0 C14.6363077,0 16,1.47733333 16,3.292 L16,16.708 C16,18.5226667 14.6363077,20 12.9612308,20 Z"
                                                                id="Shape"></path>
                                                            <path
                                                                d="M12.9612308,36 L3.03876923,36 C1.36369231,36 0,34.5898182 0,32.8576364 L0,25.1423636 C0,23.4101818 1.36369231,22 3.03876923,22 L12.9612308,22 C14.6363077,22 16,23.4101818 16,25.1423636 L16,32.8576364 C16,34.5898182 14.6363077,36 12.9612308,36 Z"
                                                                id="Shape"></path>
                                                        </g>
                                                    </g>
                                                </g>
                                            </svg>
                                        </div>
                                        <div className={styles.description}>
                                            <p className={styles.descriptiontitle}>Timeline Layout</p>
                                            <p>Tips and tricks for your timeline</p>
                                        </div>
                                    </div>
                                    <div className={styles.item}>
                                        <div className={styles.icon}>
                                            <svg width="36px" height="36px" viewBox="0 0 36 36" version="1.1">
                                                <g id="home" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                                    <g id="Dashboard-home" transform="translate(-1028.000000, -834.000000)"
                                                       fillRule="nonzero">
                                                        <g id="dashboard" transform="translate(1028.000000, 834.000000)">
                                                            <path
                                                                d="M32.9612308,36 L23.0387692,36 C21.3636923,36 20,34.5226667 20,32.708 L20,19.292 C20,17.4773333 21.3636923,16 23.0387692,16 L32.9612308,16 C34.6363077,16 36,17.4773333 36,19.292 L36,32.708 C36,34.5226667 34.6363077,36 32.9612308,36 Z"
                                                                id="Shape"></path>
                                                            <path
                                                                d="M32.9612308,14 L23.0387692,14 C21.3636923,14 20,12.5898182 20,10.8576364 L20,3.14236364 C20,1.41018182 21.3636923,0 23.0387692,0 L32.9612308,0 C34.6363077,0 36,1.41018182 36,3.14236364 L36,10.8576364 C36,12.5898182 34.6363077,14 32.9612308,14 Z"
                                                                id="Shape"></path>
                                                            <path
                                                                d="M12.9612308,20 L3.03876923,20 C1.36369231,20 0,18.5226667 0,16.708 L0,3.292 C0,1.47733333 1.36369231,0 3.03876923,0 L12.9612308,0 C14.6363077,0 16,1.47733333 16,3.292 L16,16.708 C16,18.5226667 14.6363077,20 12.9612308,20 Z"
                                                                id="Shape"></path>
                                                            <path
                                                                d="M12.9612308,36 L3.03876923,36 C1.36369231,36 0,34.5898182 0,32.8576364 L0,25.1423636 C0,23.4101818 1.36369231,22 3.03876923,22 L12.9612308,22 C14.6363077,22 16,23.4101818 16,25.1423636 L16,32.8576364 C16,34.5898182 14.6363077,36 12.9612308,36 Z"
                                                                id="Shape"></path>
                                                        </g>
                                                    </g>
                                                </g>
                                            </svg>
                                        </div>
                                        <div className={styles.description}>
                                            <p className={styles.descriptiontitle}>Timeline Layout</p>
                                            <p>Tips and tricks for your timeline</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Container>
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
