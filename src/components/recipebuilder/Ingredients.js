import styles from "@/styles/pages/dashboard/recipepage.module.scss";
import DragHandle from "@/components/draghandle";
import classNames from "classnames";
import OptionMenu from "@/components/optionmenu";
import ListBox from "@/components/listbox";
import ComboBox from "@/components/combobox";
import Skeleton from "react-loading-skeleton";
import React from "react";

import GridLayout, {WidthProvider, Responsive} from "react-grid-layout";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
const ResponsiveGridLayout = WidthProvider(Responsive);

import Select from 'react-select'
import makeAnimated from 'react-select/animated';
import AsyncCreatableSelect from 'react-select/async-creatable';

const dropdownStyle = {
    control: ({ isDisabled, isFocused }) =>
        classNames(
            'border border-faded rounded-md px-2 py-1 h-[42px] w-full',
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

export default function Ingredients ({recipe, setRecipe, units}) {
    const animatedComponents = makeAnimated();

    const quantityUpdate = (e, ingredient, index) => {
        let ingredients = recipe.ingredients
        let refIngredient = ingredients.find(i => i.i === ingredient.i)
        refIngredient.quantity = e.target.value

        ingredients[index] = refIngredient
        setRecipe({ ...recipe, ingredients: ingredients });
    }


    const moveIngredient = (e) => {
            let newIngredients = []
            recipe.ingredients.forEach(ing => {
                let refItem = e.find(item => item.i === ing.i)
                if (refItem) {
                    ing.x = refItem.x
                    ing.y = refItem.y
                    ing.w = refItem.w
                    ing.h = refItem.h
                }
                newIngredients.push(ing)
            })
            setRecipe({ ...recipe, ingredients: newIngredients });
    }
    const deleteItem = (item) => {
            let newIngredients = recipe.ingredients.filter(i => i.i !== item.i)
            setRecipe({ ...recipe, ingredients: newIngredients });

    }
    const unitUpdate = (e, ingredient, index) => {
        let ingredients = recipe.ingredients
        let refIngredient = ingredients.find(i => i.i === ingredient.i)
        refIngredient.unit.id = e.id
        refIngredient.unit.label = e.label
        refIngredient.unit.value = e.value
        refIngredient.unit.symbol = e.symbol
        ingredients[index] = refIngredient
        setRecipe({ ...recipe, ingredients: ingredients });
    }

    async function doIngredientsSearch(e) {
        let ingredients = await fetch(`/api/dashboard/recipes/ingredients?search=${e}`)
        ingredients = await ingredients.json()
        return ingredients.data
    };
    const ingredientsSearch = (e) =>
        new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(doIngredientsSearch(e))
            }, 100)
        })

    const ingredientUpdate = (e, index) => {
        let newRecipe = recipe
        newRecipe.ingredients[index].ingredient.id = e.id
        newRecipe.ingredients[index].ingredient.value = e.value
        newRecipe.ingredients[index].ingredient.label = e.label
        setRecipe({ ...newRecipe, ingredients: newRecipe.ingredients})
    }
    const createIngredient = (e, index) => {
        fetch('/api/dashboard/recipes/ingredients', {
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
                let ingredient = data.data
                let newRecipe = recipe
                newRecipe.ingredients[index].ingredient.id = ingredient.id
                newRecipe.ingredients[index].ingredient.value = ingredient.value
                newRecipe.ingredients[index].ingredient.label = ingredient.label
                setRecipe({ ...newRecipe, ingredients: newRecipe.ingredients})
                console.log(recipe)
            })
            .catch(err => {
                console.log(err)
                return
            })
    }

    return (
        <>
            {recipe &&
                <ResponsiveGridLayout
                    isResizable={false}
                    autoSize={true}
                    breakpoints={{lg: 1200}}
                    cols={{ lg: 1}}
                    draggableHandle={'.handle123'}
                    margin={[0, 10]}
                    useCSSTransforms={false}
                >
                    {recipe.groups && recipe.groups.map((group, index) => {
                        return (
                            <div key={index} className={'flex flex-col border border-faded rounded-md p-3'}>
                                <div className={'flex items-center mb-6'}>
                                    <DragHandle></DragHandle>
                                    <div className={'ml-3'}>
                                        {group.name}
                                    </div>
                                </div>
                                <div className={'px-3'}>
                                    <ResponsiveGridLayout
                                        isResizable={false}
                                        autoSize={true}
                                        breakpoints={{lg: 1200}}
                                        cols={{ lg: 1}}
                                        rowHeight={50}
                                        draggableHandle={'.handle'}
                                        onDragStop={e => moveIngredient(e)}
                                        margin={[0, 10]}
                                        useCSSTransforms={false}
                                    >
                                        {recipe.ingredients && recipe.ingredients.filter(i => i.group_id === group.i).map((ingredient, index) => {
                                            return (
                                            <div className={styles.draggable} key={ingredient.i}
                                             data-grid={ingredient}>
                                            <div className={classNames(styles.input, styles.inputflex)}>
                                                <DragHandle></DragHandle>
                                                <input className={styles.amount} type={'text'}
                                                       placeholder={'quantity'} value={ingredient.quantity}
                                                       onChange={(e) => quantityUpdate(e, ingredient, index)}></input>
                                                <div className={styles.unit}>
                                                    <Select
                                                        className={'w-36'}
                                                        onChange={(e) => unitUpdate(e, ingredient, index)}
                                                        options={units}
                                                        unstyled
                                                        classNames={dropdownStyle}
                                                        value={ingredient.unit}
                                                    >

                                                    </Select>
                                                    {/*<ListBox ingredient={ingredient} setUnit={setUnit}*/}
                                                    {/*         units={units}></ListBox>*/}
                                                </div>
                                                <AsyncCreatableSelect
                                                    className={'w-full'}
                                                    cacheOptions
                                                    unstyled
                                                    defaultOptions
                                                    loadOptions={ingredientsSearch}
                                                    onCreateOption={(e)=> createIngredient(e, index)}
                                                    onChange={(e) => ingredientUpdate(e, index)}
                                                    classNames={dropdownStyle}
                                                    classNamePrefix={'selector'}
                                                    value={ingredient.ingredient}
                                                >

                                                </AsyncCreatableSelect>
                                                {/*<ComboBox recipe={recipe} ingredient={ingredient}*/}
                                                {/*          updateIngredient={updateIngredient}>*/}

                                                {/*</ComboBox>*/}

                                                <OptionMenu options={[{
                                                    name: 'Delete',
                                                    action: () => deleteItem(ingredient),
                                                    className: 'delete'
                                                },]}></OptionMenu>
                                            </div>
                                        </div>
                                            )
                                        })}
                                    </ResponsiveGridLayout>
                                </div>
                            </div>
                        )
                    })}
                </ResponsiveGridLayout>
            }


        {/*{recipe ?*/}
        {/*        <ResponsiveGridLayout*/}
        {/*            isResizable={false}*/}
        {/*            autoSize={true}*/}
        {/*            breakpoints={{lg: 1200}}*/}
        {/*            cols={{ lg: 1}}*/}
        {/*            rowHeight={50}*/}
        {/*            draggableHandle={'.handle'}*/}
        {/*            onDragStop={e => moveIngredient(e)}*/}
        {/*            margin={[0, 10]}*/}
        {/*            useCSSTransforms={false}*/}
        {/*        >*/}
        {/*            {recipe.ingredients && recipe.ingredients.map((ingredient, index) => {*/}
        {/*                if (!ingredient.divider) {*/}
        {/*                    return (*/}
        {/*                        <div className={styles.draggable} key={ingredient.i}*/}
        {/*                             data-grid={ingredient}>*/}
        {/*                            <div className={classNames(styles.input, styles.inputflex)}>*/}
        {/*                                <DragHandle></DragHandle>*/}
        {/*                                <input className={styles.amount} type={'text'}*/}
        {/*                                       placeholder={'quantity'} value={ingredient.quantity}*/}
        {/*                                       onChange={(e) => quantityUpdate(e, ingredient, index)}></input>*/}
        {/*                                <div className={styles.unit}>*/}
        {/*                                    <Select*/}
        {/*                                        className={'w-36'}*/}
        {/*                                        onChange={(e) => unitUpdate(e, ingredient, index)}*/}
        {/*                                        options={units}*/}
        {/*                                        unstyled*/}
        {/*                                        classNames={dropdownStyle}*/}
        {/*                                        value={ingredient.unit}*/}
        {/*                                    >*/}

        {/*                                    </Select>*/}
        {/*                                    /!*<ListBox ingredient={ingredient} setUnit={setUnit}*!/*/}
        {/*                                    /!*         units={units}></ListBox>*!/*/}
        {/*                                </div>*/}
        {/*                                <AsyncCreatableSelect*/}
        {/*                                    className={'w-full'}*/}
        {/*                                    cacheOptions*/}
        {/*                                    unstyled*/}
        {/*                                    defaultOptions*/}
        {/*                                    loadOptions={ingredientsSearch}*/}
        {/*                                    onCreateOption={(e)=> createIngredient(e, index)}*/}
        {/*                                    onChange={(e) => ingredientUpdate(e, index)}*/}
        {/*                                    classNames={dropdownStyle}*/}
        {/*                                    classNamePrefix={'selector'}*/}
        {/*                                    value={ingredient.ingredient}*/}
        {/*                                >*/}

        {/*                                </AsyncCreatableSelect>*/}
        {/*                                /!*<ComboBox recipe={recipe} ingredient={ingredient}*!/*/}
        {/*                                /!*          updateIngredient={updateIngredient}>*!/*/}

        {/*                                /!*</ComboBox>*!/*/}

        {/*                                <OptionMenu options={[{*/}
        {/*                                    name: 'Delete',*/}
        {/*                                    action: () => deleteItem(ingredient),*/}
        {/*                                    className: 'delete'*/}
        {/*                                },]}></OptionMenu>*/}
        {/*                            </div>*/}
        {/*                        </div>*/}
        {/*                    )*/}
        {/*                }*/}
        {/*            })}*/}
        {/*        </ResponsiveGridLayout>*/}
        {/*        : <Skeleton height={42} className="mb-3"></Skeleton>*/}
        {/*}*/}
        </>
    )
}
