import React, {useContext, useEffect} from 'react';
import Layout from '../components/layouts/default';
import styles from '../styles/pages/index.module.scss';
import classNames from "classnames";
import Image from 'next/image';
import Button from '../components/button';
import Recipe from '../components/recipe';

import ShoppingList from '../components/shoppinglist';
import gyoza from '../../public/images/gyoza.jpg';

import { debounce } from 'lodash';
import {useUserContext} from "@/context/user";
import {AnimatePresence, motion} from "framer-motion";
import NewButton from "@/components/NewButton";

export default function Index (props) {
    const user = useUserContext();

    // get recipes
    const [recipes, setRecipes] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    // filter recipes based on search
    const [search, setSearch] = React.useState('');
    const [filteredRecipes, setFilteredRecipes] = React.useState(null);

    // get from /api/recipes
    useEffect(() => {
        fetch('/api/recipes')
            .then(res => res.json())
            .then(data => {
                setRecipes(data.data);
                setFilteredRecipes(data.data);
                setLoading(false);
            })
            .catch(err => console.log(err));
    }, []);


    const onSearch = debounce((e) => {
        setSearch(e.target.value)
    }, 500);

    return (
        <>
            <div className={classNames(styles.header, 'section')}>
                <div className={classNames('container', styles.headergrid)}>
                    <div className={styles.title}>
                        <h1>make cooking better</h1>
                        <p>make</p>
                        <p>cooking</p>
                        <p>better</p>
                    </div>
                    <div className={styles.featured}>
                        <div className={styles.star}>
                            <svg width="11px" height="11px" viewBox="0 0 11 11" version="1.1">
                                <g id="home" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                    <g id="Extra-Large" transform="translate(-747.000000, -181.000000)" fill="#FFFFFF">
                                        <polygon id="Star"
                                                 transform="translate(752.500000, 186.500000) rotate(30.000000) translate(-752.500000, -186.500000) "
                                                 points="752.5 189.25 749.267181 190.949593 749.884595 187.349797 747.269189 184.800407 750.883591 184.275203 752.5 181 754.116409 184.275203 757.730811 184.800407 755.115405 187.349797 755.732819 190.949593"></polygon>
                                    </g>
                                </g>
                            </svg>
                        </div>
                        <p>Learn how to make delicious vegan gyoza from scratch</p>
                    </div>
                    <div className={styles.image}>
                        <Image src={gyoza} alt="gyoza" width={630} height={455}/>
                    </div>
                </div>
            </div>


            <div className={classNames(styles.top, 'section')}>
                <div className={styles.title}>
                    <p>Recipes</p>
                </div>
                <div className={styles.search}>
                    <div className={styles.icon}>
                        <svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1">
                            <g id="home" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" opacity="0.33">
                                <g id="Extra-Large" transform="translate(-597.000000, -539.000000)" fill="#000000"
                                   fillRule="nonzero">
                                    <path
                                        d="M605.976825,539 C601.029802,539 597,543.028434 597,547.973794 C597,552.919118 601.029802,556.955354 605.976825,556.955354 C608.089848,556.955354 610.033177,556.215133 611.569073,554.986067 L615.30828,558.722039 C615.700766,559.098141 616.321952,559.091791 616.706663,558.707745 C617.091374,558.3237 617.098589,557.702734 616.722905,557.309859 L612.983698,553.571928 C614.214204,552.034192 614.955598,550.088539 614.955598,547.973794 C614.955598,543.028434 610.923847,539 605.976825,539 L605.976825,539 Z M606,541 C609.87892,541 613,544.119357 613,547.996108 C613,551.87286 609.87892,555 606,555 C602.12108,555 599,551.87286 599,547.996108 C599,544.119357 602.12108,541 606,541 Z"
                                        id="circle2017"></path>
                                </g>
                            </g>
                        </svg>
                    </div>
                    <input
                        type="text"
                        name="search"
                        id="search"
                        placeholder="Find your new favourites..."
                        onChange={onSearch}
                    />
                </div>
                <div className={styles.filter}>
                    <Button bg={'white'} fullwidth>Sort by:</Button>
                </div>
            </div>
            <div className={classNames(styles.content, 'container')}>
                <div className={styles.categories}>
                    <NewButton className={'border-faded border w-full'}>Main</NewButton>
                    <NewButton className={'border-faded border w-full'}>Dessert</NewButton>
                    <NewButton className={'border-faded border w-full'}>Noodle</NewButton>
                    <NewButton className={'border-faded border w-full'}>Salad</NewButton>
                </div>
                <div className={styles.recipes}>
                    <AnimatePresence>
                        {filteredRecipes && filteredRecipes.length > 0 && filteredRecipes.map((recipe) => (
                            <motion.div
                                key={recipe.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Recipe key={recipe.id} data={recipe}></Recipe>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                <div className={styles.shoppinglist}>
                    <ShoppingList></ShoppingList>
                </div>
            </div>
        </>
    );
}

// export async function getServerSideProps(context) {
//     const {req} = context;
//     const {token} = getAppCookies(req);
//     const profile = token ? await verifyToken(token.split(' ')[1]) : '';
//     return {
//         props: {
//             profile,
//         },
//     };
// }

Index.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    );
};
