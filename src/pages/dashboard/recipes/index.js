import React, {Fragment, useEffect} from 'react';
import Layout from "@/components/layouts/dashboard";
import styles from "@/styles/pages/dashboard/recipes.module.scss";

import GridLayout, {WidthProvider, Responsive} from "react-grid-layout";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
const ResponsiveGridLayout = WidthProvider(Responsive);

import {useRouter} from "next/router";

import Link from "next/link";

import {AnimatePresence, motion} from "framer-motion";
import {debounce} from "lodash";

import {useUserContext} from "@/context/user";

import OptionMenu from "@/components/optionmenu";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'

import Container from "@/components/dashboard/Container"
import WhiteBox from "@/components/dashboard/WhiteBox";
import NewButton from "@/components/NewButton";
import { PlusIcon } from '@heroicons/react/20/solid'
import {Menu, Transition} from "@headlessui/react";
import Image from "next/image";
import Kebab from "../../../../public/images/kebab.svg";
import classNames from "classnames";
import {useStoreActions, useStoreState} from "easy-peasy";


export default function NewRecipe(props) {
    const router = useRouter();
    const user = useStoreState(state => state.user);
    const setUser = useStoreActions(actions => actions.setUser);


    const [navOpen, setNavOpen] = React.useState(false);
    const [recipes, setRecipes] = React.useState(null);
    const [search, setSearch] = React.useState('');
    const [filteredRecipes, setFilteredRecipes] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    // get recipes from api
    useEffect(() => {
        fetch('/api/dashboard/recipes', {
            method: 'GET',
        })
            .then(res => res.json())
            .then(data => {
                setRecipes(data.data)
                setFilteredRecipes(data.data);
                setLoading(false);
            })
    }, [])

    useEffect(() => {
        if (!loading) {
            setFilteredRecipes(
                recipes.filter(recipe => {
                    return recipe.title.toLowerCase().includes(search.toLowerCase());
                })
            );
        }
    }, [search]);

    const onSearch = debounce((e) => {
        setSearch(e.target.value)
    }, 500);

    const newRecipe = () => {
        fetch('/api/dashboard/recipes', {
            method: 'POST',
        })
            .then(res => res.json())
            .then(data => {
                router.push(`/dashboard/recipes/${data.data.id}`)
            })
    }

    const deleteRecipe = (recipe) => {
        fetch('/api/dashboard/recipes/', {
            method: 'DELETE',
            body : JSON.stringify({
                id: recipe.id
            })
        })
            .then(res => res.json())
            .then(data => {
                setRecipes(recipes.filter(r => r.id !== recipe.id))
                setFilteredRecipes(recipes.filter(r => r.id !== recipe.id))
                setUser( {
                    ...user,
                    recipes: user.recipes.filter(r => r.id !== recipe.id)})

                //TODO: handle error
            })
    }


    return (
        <div className={styles.dashboard}>

            <Container>
                <div className="dashboard-w-full">
                    <WhiteBox className="h-full">
                        <div className="flex items-top mb-12">
                            <h1 className="text-subtitlem lg:text-subtitle flex-grow">Your recipes</h1>
                            <div>
                                <NewButton onClick={() => newRecipe()} className={'bg-black text-white'} icon={<PlusIcon width={24} />}>New Recipe</NewButton>
                            </div>
                        </div>
                        <div className={classNames(styles.recipecontainer, 'relative w-full')}>
                                    {filteredRecipes && filteredRecipes.length > 0 && filteredRecipes.map((recipe) => (
                                        <div className={styles.draggable} key={recipe.id}>
                                                <Link href={'/dashboard/recipes/' + recipe.id}>
                                                    <div className={styles.recipe}>
                                                        <div className={styles.checkbox}>
                                                            <input type={"checkbox"}></input>
                                                        </div>
                                                        <div className={styles.content}>
                                                            <div>
                                                                <p className={styles.title}>{recipe.title}</p>
                                                            </div>
                                                            <div>
                                                                {recipe.servings && <p>Serves {recipe.servings}</p>}
                                                                {!recipe.servings && <p>-</p>}
                                                            </div>
                                                            <div>
                                                                {recipe.description &&
                                                                    <p>{recipe.description}</p>
                                                                }
                                                                {!recipe.description &&
                                                                    <p>-</p>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <OptionMenu options={[
                                                    {
                                                    name: 'Delete',
                                                    className: 'delete',
                                                    icon: 'trash',
                                                    action: () => deleteRecipe(recipe),
                                                }]}></OptionMenu>
                                        </div>
                                    ))}
                        </div>
                        {!filteredRecipes && loading &&
                            <div>
                                <Skeleton height={48} count={4}></Skeleton>
                            </div>
                        }
                        {!loading && filteredRecipes.length === 0 &&
                            <p className={styles.norecipes}>You don&apos;t have any recipes yet! Create your first one to get started</p>
                        }
                    </WhiteBox>
                </div>
            </Container>

        </div>
    );
}
NewRecipe.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    );
};
