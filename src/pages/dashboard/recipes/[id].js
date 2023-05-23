import React, {Fragment, useCallback, useEffect, useState} from 'react';


import Layout from "@/components/layouts/dashboard";
import styles from "@/styles/pages/dashboard/recipepage.module.scss";
import classNames from "classnames";
import { v4 as uuidv4 } from 'uuid';
import LoadingIcon from '@/components/svg/Loading'
import Select from 'react-select'
import makeAnimated from 'react-select/animated';
import AsyncCreatableSelect from 'react-select/async-creatable';


import {useRouter} from "next/router";

// components

import TimelineCreator from "@/components/timelinecreator";

import {debounce} from "lodash";
import { ExclamationCircleIcon } from '@heroicons/react/20/solid'

import {Listbox, Transition} from "@headlessui/react";
import WhiteBox from "@/components/dashboard/WhiteBox";
import Container from "@/components/dashboard/Container";
import NewButton from "@/components/NewButton";
import { PlusIcon } from '@heroicons/react/20/solid'
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'


import Input from "@/components/Input";
import ImageUploader from "@/components/recipebuilder/ImageUploader";
import Description from "@/components/recipebuilder/Description";
import Ingredients from "@/components/recipebuilder/Ingredients";
import Instructions from "@/components/recipebuilder/Instructions";


export default function NewRecipe(props) {

    const [recipe, setRecipe] = React.useState(null);
    const [allowUpdate, setAllowUpdate] = React.useState(false);
    const [units, setUnits] = React.useState([])
    const [addedItems, setAddedItems] = useState([]);

    const [saving, setSaving] = useState(null);
    const [addingStep, setAddingStep] = useState(null);
    const [addingIngredient, setAddingIngredient] = useState(null);
    const [errors, setErrors] = useState([]);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [cookingMethods, setCookingMethods] = useState([])

    const animatedComponents = makeAnimated();

    const dropdownStyle = {
        control: ({ isDisabled, isFocused }) =>
            classNames(
                'border border-faded rounded-md px-2 py-1 h-[42px]',
                !isDisabled && isFocused && 'border-faded',
                isFocused && 'shadow-[0_0_0_1px] shadow-purple-800',
                isFocused && 'hover:border-purple-800'
            ),
        option: ({ isDisabled, isFocused, isSelected }) =>
            classNames(
                'py-1.5 px-3 hover:bg-green'
            ),
        menu: ({ isDisabled }) =>
            classNames(
                'border border-extrafaded rounded-md bg-white mt-1 shadow-default py-1',
                !isDisabled && 'border-extrafaded',
                isDisabled && 'border-extrafaded',
            ),
        multiValue: ({ isDisabled }) =>
            classNames(
                'bg-green rounded-sm text-sm py-1 px-2 mr-2',
            ),
        multiValueLabel: ({ isDisabled }) =>
            classNames(
                'mr-2',
            ),
        multiValueRemove: () =>
            classNames(
                'hover:text-error',
            ),
        clearIndicator: () =>
            classNames(
                'text-extrafaded',
            ),
        dropdownIndicator: () =>
            classNames(
                'text-extrafaded',
            ),
    }


    const router = useRouter()
    const uuid = router.query.id

    // fetch recipe data
    const fetchData = () => {
        fetch(`/api/dashboard/recipes/${uuid}`)
            .then(res => res.json())
            .then(data => {
                setRecipe(data.data)
                setAllowUpdate(true)
            })
            .catch(err => {
                // TODO: handle error
            });
        // get units
        fetch(`/api/dashboard/recipes/units`)
            .then(res => res.json())
            .then(data => {
                setUnits(data.data)
            })
            .catch(err => {
                // TODO: handle error
            })
        // get cooking methods
        fetch(`/api/dashboard/recipes/cooking-methods`)
            .then(res => res.json())
            .then(data => {
                // convert to correct format
                let methods = []
                data.data.forEach((method) => {
                    methods.push({value: method.name, label: method.name, id: method.id})
                    // TODO: make this backend
                })
                setCookingMethods(methods)
            })
            .catch(err => {
              // TODO: handle error
            })
    }
    useEffect(() => {
        if (uuid) {
            fetchData();
        }
    }, [uuid])

    const startSave = () => {
        if (saving === null) {
            setSaving(1)
            updateDB(recipe)
        }
    }
    const updateDB = useCallback(debounce(pushUpdate, 100), []);

    const deleteRecipe = () => {
        setDeleteLoading(1)
        fetch('/api/dashboard/recipes/', {
            method: 'DELETE',
            body : JSON.stringify({
                id: recipe.id
            })
        })
        .then(res => res.json())
        .then(data => {
            router.push('/dashboard/recipes')
        })
    }

    async function pushUpdate(recipe) {
        setErrors([])
        setSaving(1)
        fetch(`/api/dashboard/recipes/${uuid}`, {
            method: 'PUT',
            body: JSON.stringify(recipe)
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setSaving(2)
                    setErrors(data.errors)
                    setTimeout(() => {
                        setSaving(null)
                    }, 3000)
                    return
                }

                setSaving(3)
                setTimeout(() => {
                    setSaving(null)
                }, 3000)
            })
            .catch(err => {
                setSaving(2)
                setTimeout(() => {
                    setSaving(null)
                }, 3000)
            })
    }
    useEffect(() => {
        if (allowUpdate && recipe && uuid) {
            let newRecipe = recipe
            newRecipe.timeline_data = addedItems
            setRecipe(newRecipe)
        }
    }, [recipe, addedItems])

    // handle data changes on inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRecipe({ ...recipe, [name]: value });
    }

    // ingredients
    const addIngredient = () => {
        setAddingIngredient(1)
        let y = (recipe.ingredients ? recipe.ingredients.length : 0)
        fetch('/api/dashboard/recipes/recipe-ingredients', {
            method: 'POST',
            body: JSON.stringify({
                recipe_id: recipe.id,
                y: y,
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setAddingIngredient(2)
                    setTimeout(() => {
                        setAddingIngredient(null)
                    }, 2000)
                    console.log(data.error)
                    return
                }
                let ingredient = data.ingredient
                if (recipe.ingredients && recipe.ingredients.length > 0) {
                    setRecipe({ ...recipe, ingredients: [...recipe.ingredients, ingredient] });
                } else {
                    setRecipe({ ...recipe, ingredients: [ingredient] });
                }
                setAddingIngredient(null)
            })
            .catch(err => {
                console.log(err)
                return
            })
    }
    const addIngredientDivider = () => {
        let uuid = uuidv4();
        let y = (recipe.ingredients ? recipe.ingredients.length : 0)
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            setRecipe({ ...recipe, ingredients: [...recipe.ingredients, {i: uuid, name:"", x:0, y:y, w:1, h:1, divider: true}] });
        } else {
            setRecipe({ ...recipe, ingredients: [{i: uuid, name:"", unit:"", x:0, y:y, w:1, h:1, divider: true}] });
        }
    }


    // recipe steps
    const addStep = () => {
        setAddingStep(1)
        let y = (recipe.steps ? recipe.steps.length : 0)
        fetch('/api/dashboard/recipes/recipe-steps', {
            method: 'POST',
            body: JSON.stringify({
                recipe_id: recipe.id,
                y: y,
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setAddingStep(2)
                    setTimeout(() => {
                        setAddingStep(null)
                    }, 2000)
                    console.log(data.error)
                    return
                }
                let step = data.step
                if (recipe.steps && recipe.steps.length > 0) {
                    setRecipe({ ...recipe, steps: [...recipe.steps, step] });
                } else {
                    setRecipe({ ...recipe, steps: [step] });
                }
                setAddingStep(null)
            })
            .catch(err => {
                console.log(err)
                return
            })
    }

     const setRecipeStatus = (status) => {
        setRecipe({ ...recipe, status: status })
     }

    const cookingMethodUpdate = (e) => {
        let newRecipe = recipe
        newRecipe.cooking_methods = e
        setRecipe(newRecipe)
    }
    const tagUpdate = (e) => {
        let newRecipe = recipe
        newRecipe.tags = e
        setRecipe({ ...newRecipe, tags: [...newRecipe.tags]})
    }


    async function doTagSearch (e) {
        let tags = await fetch(`/api/dashboard/recipes/tags?search=${e}`)
        tags = await tags.json()
        return tags.data
    }

    const tagSearch = (e) =>
        new Promise((resolve, reject) => {
            setTimeout(() => {
            resolve(doTagSearch(e))
            }, 100)
        })

    const createTag = (e) => {
        fetch('/api/dashboard/recipes/tags', {
            method: 'POST',
            body: JSON.stringify({
                name: e
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.log(data.error)
                return
            }
            let tag = data.data
            let newRecipe = recipe
            setRecipe({ ...newRecipe, tags: [...newRecipe.tags, tag]})
        })
        .catch(err => {
            console.log(err)
            return
        })
    }

    return (
        <div className={styles.dashboard}>
                <Container>
                    <div className={'col-span-4 lg:col-span-3 xl:col-span-4 flex flex-col h-full'}>
                        <WhiteBox>
                            <div>
                                <div className={styles.titlearea}>
                                    <div className="flex-grow">
                                    <p className={styles.recipetitle}>Recipe Details</p>
                                    </div>
                                    <NewButton
                                        className={classNames('text-white bg-black')}
                                        onClick={() => startSave()}
                                        loadingIcon={<LoadingIcon width={24} fill={'white'} className={'animate-spin'}/>}
                                        status={saving}
                                    >
                                        {saving === null && 'Save recipe'}
                                        {saving === 1 && 'Saving recipe'}
                                        {saving === 2 && 'Error saving'}
                                        {saving === 3 && 'Recipe saved!'}
                                    </NewButton>
                                </div>

                                <div className={styles.section}>
                                    {recipe ?
                                        <Input
                                            label={'Title'}
                                            errors={errors}
                                            name={'title'}
                                            id={'title'}
                                            type={'text'}
                                            placeholder="Recipe title"
                                            value={recipe.title}
                                            onInput={handleInputChange}
                                        />
                                        :
                                        <Skeleton height={42} className={'mb-4'}></Skeleton>
                                    }
                                    <div className={styles.input}>
                                        <ImageUploader recipe={recipe} setRecipe={setRecipe}/>
                                    </div>
                                    <div className={styles.input}>
                                        <Description recipe={recipe} onChange={(e) => handleInputChange(e)} errors={errors}></Description>
                                    </div>
                                    <div className={styles.input}>
                                        <label>Tags</label>
                                        {recipe ?
                                        <AsyncCreatableSelect
                                            classNames={dropdownStyle}

                                            classNamePrefix={'selector'}
                                            unstyled
                                            onCreateOption={(e)=> createTag(e)}
                                            isMulti
                                            components={animatedComponents}
                                            onChange={(e) => tagUpdate(e)}
                                            loadOptions={(e) =>tagSearch(e)}
                                            value={recipe.tags}
                                            defaultOptions>
                                        </AsyncCreatableSelect>
                                            :
                                            <Skeleton height={42} className={'mb-4'}></Skeleton>
                                        }
                                    </div>
                                    <div className={styles.input}>
                                        <label>Cooking Methods</label>
                                        {recipe ?
                                            <Select unstyled
                                                    classNames={dropdownStyle}
                                                    classNamePrefix={'selector'}
                                                    onChange={(e) =>cookingMethodUpdate(e)}
                                                    defaultValue={recipe.cooking_methods}
                                                    options={cookingMethods}
                                                    isMulti
                                                    components={animatedComponents}>
                                            </Select>
                                            :
                                            <Skeleton height={42} className={'mb-4'}></Skeleton>
                                        }
                                    </div>
                                </div>
                            </div>
                        </WhiteBox>
                        <WhiteBox className={'mt-12'}>
                            <div>
                                <div className={styles.titlearea}>
                                    <div className="flex-grow">
                                        <p className={styles.recipetitle}>Ingredients</p>
                                    </div>
                                </div>
                                <div className={styles.section}>
                                    <Ingredients recipe={recipe} setRecipe={setRecipe} units={units}/>
                                    <div className="flex items-center">
                                        <NewButton onClick={addIngredient} status={addingIngredient} className={'text-white bg-black mr-4'} icon={addingIngredient === 1 ? <LoadingIcon /> : <PlusIcon width={24}/>}>Add Ingredient</NewButton>
                                        <NewButton onClick={addIngredientDivider} className={'text-white bg-black'} icon={<PlusIcon width={24}/>}>Add Group</NewButton>
                                    </div>
                                </div>
                            </div>
                        </WhiteBox>
                        <WhiteBox className={'mt-12'}>
                            <div>
                                <div className={styles.titlearea}>
                                    <div className={'relative flex'}>
                                    <div className="flex-grow">
                                        <p className={classNames(styles.sectiontitle, (errors.find(e => e.input === 'steps') ? 'text-error' : ''))}>Instructions
                                        </p>
                                        {(errors.find(e => e.input === 'steps')) && <p className={styles.errortext}>{errors.find(e => e.input === 'steps').message}</p>}
                                    </div>
                                    {(errors.find(e => e.input === 'steps')) &&
                                        <div className={styles.errorcircle}>
                                            <ExclamationCircleIcon className="h-5 w-5 text-error" aria-hidden="true" />
                                        </div>
                                    }
                                    </div>
                                </div>
                                <div className={styles.section}>
                                    <Instructions recipe={recipe} setRecipe={setRecipe}/>
                                    <div className={'flex'}>
                                        <NewButton onClick={addStep} status={addingStep} className={'text-white bg-black'} icon={addingStep === 1 ? <LoadingIcon /> : <PlusIcon width={24}/>}>Add Instruction</NewButton>
                                    </div>

                                </div>
                            </div>
                        </WhiteBox>
                        <WhiteBox className={'mt-12'}>
                            <div>
                                <div className={styles.titlearea}>
                                    <div className={'relative flex'}>
                                        <div className="flex-grow">
                                            <p className={classNames(styles.sectiontitle, (errors.find(e => e.input === 'timeline') ? 'text-error' : ''))}>Timeline
                                            </p>
                                            {(errors.find(e => e.input === 'timeline')) && <p className={styles.errortext}>{errors.find(e => e.input === 'steps').message}</p>}
                                        </div>
                                        {(errors.find(e => e.input === 'timeline')) &&
                                            <div className={styles.errorcircle}>
                                                <ExclamationCircleIcon className="h-5 w-5 text-error" aria-hidden="true" />
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className={styles.section}>
                                    {/*{recipe ?*/}
                                    {/*    <TimelineCreator recipe={recipe} units={units} addedItems={addedItems} setAddedItems={setAddedItems}></TimelineCreator>*/}
                                    {/*    :*/}
                                    {/*    <Skeleton height={200}></Skeleton>*/}
                                    {/*}*/}

                                </div>
                            </div>
                        </WhiteBox>
                        <WhiteBox className={'mt-12'}>
                            <div>
                                <div className={styles.titlearea}>
                                    <p className={'text-subtitlem md:text-subtitle text-error'}>Danger zone</p>
                                </div>
                                <div className={styles.section}>
                                    <NewButton className={'bg-error text-white'} onClick={deleteRecipe} status={deleteLoading} loadingIcon={<LoadingIcon width={24} fill={'white'} className={'animate-spin'}/>}>Delete recipe</NewButton>
                                </div>
                            </div>
                        </WhiteBox>
                    </div>
                        <div className={styles.settings}>
                            <p className={styles.sectiontitle}>Recipe Settings</p>
                            <p className="mt-6">Post status</p>
                            {recipe ?
                                <Listbox value={recipe.status} onChange={(e) => setRecipeStatus(e)}>
                                    {({ open }) => (
                                        <div className={styles.selectcontainer}>
                                            <Listbox.Button className={styles.select}>
                              <span className="inline-flex w-full">
                                  <p>{recipe.status}</p>
                              </span>
                                                <span className={styles.selecticon}>
                                    <svg id="uuid-e62a5d97-6036-4036-944d-9bd824f5c8aa" viewBox="0 0 256 426.67" width={8}>
                                        <path d="m128,426.67c-6.4,0-10.67-2.13-14.93-6.4L6.4,313.6c-8.53-8.53-8.53-21.33,0-29.87s21.33-8.53,29.87,0l91.73,91.73,91.73-91.73c8.53-8.53,21.33-8.53,29.87,0s8.53,21.33,0,29.87l-106.67,106.67c-4.27,4.27-8.53,6.4-14.93,6.4h0Z"/>
                                        <path d="m21.33,149.33c-6.4,0-10.67-2.13-14.93-6.4-8.53-8.53-8.53-21.33,0-29.87L113.07,6.4c8.53-8.53,21.33-8.53,29.87,0l106.67,106.67c8.53,8.53,8.53,21.33,0,29.87s-21.33,8.53-29.87,0l-91.73-91.73-91.73,91.73c-4.27,4.27-8.53,6.4-14.93,6.4h0Z"/>
                                    </svg>
                              </span>
                                            </Listbox.Button>
                                            <Transition
                                                show={open}
                                                as={Fragment}
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <Listbox.Options className={styles.selectoptions}>
                                                    <Listbox.Option value={'draft'} className={styles.selectoption}>
                                                        Draft
                                                    </Listbox.Option>
                                                    <Listbox.Option value={'private'} className={styles.selectoption}>
                                                        Private
                                                    </Listbox.Option>
                                                    <Listbox.Option value={'public'} className={styles.selectoption}>
                                                        Public
                                                    </Listbox.Option>
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    )}
                                </Listbox> :
                                <Skeleton height={42} className="mb-3"></Skeleton>
                            }

                            <p className={styles.statusexp}>
                                {recipe && recipe.status === 'draft' && 'Your recipe will not be available to other users'}
                                {recipe && recipe.status === 'private' && 'Your recipe will not be publically listed, but you can invite friends to view it'}
                                {recipe && recipe.status === 'public' && 'Your recipe will be publically listed and available to all users after moderator approval'}

                            </p>
                            {recipe && recipe.status === 'public' &&
                                <div>
                                    <p className="mt-12">Moderation</p>
                                    <div className={styles.moderation}>
                                        <div className={classNames(styles.indicator, (recipe.mod_status === 'approved' ? styles.approved : ''), (recipe.mod_status === 'unchecked' ? styles.unchecked : ''),(recipe.mod_status === 'unapproved' ? styles.error : ''))}></div>
                                        {recipe.mod_status === 'approved' && 'Approved'}
                                        {recipe.mod_status === 'unchecked' && 'Unchecked'}
                                        {recipe.mod_status === 'unapproved' && 'Unapproved'}
                                    </div>
                                    <p className={styles.statusexp}>
                                        {recipe.mod_status === 'approved' && 'Your recipe has been approved and is publically listed'}
                                        {recipe.mod_status === 'unchecked' && 'Your recipe has not been checked by a moderator yet'}
                                        {recipe.mod_status === 'unapproved' && 'Your recipe has not been approved to be listed publically'}
                                    </p>
                                </div>
                            }
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
