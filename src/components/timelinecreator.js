import React, {Fragment, useEffect, useState} from 'react';
import classNames from "classnames";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import styles from "@/styles/components/timelinecreator.module.scss"
import {Popover, Transition} from '@headlessui/react'
import Plus from "../../public/images/plus.svg";
import Minus from "../../public/images/minus.svg";
import Image from "next/image";

import {Responsive, WidthProvider} from "react-grid-layout";
import {v4 as uuidv4} from "uuid";
import Modal from "@/components/modal";
import OptionMenu from "@/components/optionmenu";
import DragHandle from "@/components/draghandle";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function TimelineCreator({recipe, units, addedItems, setAddedItems}) {
    const [dragging, setDragging] = useState(null);
    const [modal, setModal] = useState(false);
    const [columns, setColumns] = useState(9);
    const [scale, setScale] = useState(1);

    const initialPopulate = () => {
        if (recipe && recipe.timeline_data) {
            let items = []
            recipe.timeline_data.forEach(ingredient => {
                items.push(ingredient);
            })
            setAddedItems(items);
        }
    }
    useEffect(() => {
        initialPopulate();
    }, [recipe])

    // remove any ingredients in addedItems that are not in use in the recipe
    useEffect(() => {
        addedItems.forEach((item, id) => {
            // if item is ingredient
            if (!item.type) {
                let refItem = recipe.ingredients.find(i => i.i === item.i)
                // if not found in recipe, remove from addedItems
                if (!refItem) {
                    let newItems = addedItems.filter(i => i.i !== item.i)
                    setAddedItems(newItems)
                }
            }
        })
    }, [recipe])

    function closeModal() {
        setModal(null)
    }
    function openModal(data) {
        setModal(data)
    }
    const updateColumns = (e) => {
        if (e === 'add') {
            setColumns(columns + 1)
        }
        if (e === 'remove') {
            setColumns(columns - 1)
        }
    }
    const onDrag = (ingredient) => {
        setDragging(ingredient);
    }
    const addIngredient = (e) => {
        let element = e.find(item => item.i === "__dropping-elem__")
        let newIngredient = {
            i: dragging.i,
            x: element.x,
            y: element.y,
            w: 2,
            h: 1,
            maxW: 2,
            maxH: 1,
            minW: 2,
            minH: 1,
            static: false,
            isResizable: false,
        }
        setAddedItems([...addedItems, newIngredient])
    }
    const updateItem = (e) => {
        let newItems = [];
        e.forEach(get => {
            let refItem = addedItems.find(item => item.i === get.i)
            if (refItem) {
                refItem.x = get.x;
                refItem.y = get.y;
                refItem.w = get.w;
                refItem.h = get.h;
                if (refItem.h > 1) {
                    refItem.span = true;
                } else {
                    refItem.span = false;
                }
                newItems.push(refItem)
            }
        })
        setAddedItems(newItems)
    }
    const removeItem = (data) => {
        let newItems = addedItems.filter(item => item.i !== data.i)
        setAddedItems(newItems)
    }
    const addStep = (item) => {
        let uuid = uuidv4().toString();
        let newItem = {
            i: uuid,
            x: item.x + (item.type === 'step' ? 1 : 2),
            y: item.y,
            w: 1,
            h: 1,
            static: false,
            parent: item.i,
            text: 'New step',
            type: 'step',
            isResizable: true,
        }
        setAddedItems([...addedItems, newItem])
    }
    const scaleModifier = (e) => {
        setScale(e.target.value)
    }


    return (
        <div className={styles.timeline}>
            <div className={styles.ingredients}>
                {recipe && recipe.ingredients && recipe.ingredients.map(ingredient => {
                    // find if ingredient is already in the addedItems array
                    let added = addedItems.find(item => item.i === ingredient.i)
                    if (ingredient.name && ingredient.amount && ingredient.unit && !ingredient.divider) {
                        return (
                            <div
                                className={classNames(styles.ingredient, (added ? styles.added : ''))}
                                key={ingredient.i}
                                draggable
                                onDragStart={() => onDrag(ingredient)}
                                onDragEndCapture={() => setDragging(null)}
                            >
                                <div className={styles.iteminner}>
                                    <p>{ingredient.amount}{units.find(u => u.id === ingredient.unit).symbol} {ingredient.name}</p>
                                </div>
                            </div>
                        )
                    }
                })}
            </div>
            <div className={styles.timelineoptions}>
                <div className={styles.columns}>
                    <Popover>
                        <Popover.Button>Columns: {columns}</Popover.Button>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Popover.Panel className={styles.dropdown}>
                                <div className={styles.controls}>
                                    <div onClick={() => updateColumns('remove')}>
                                        <Image src={Minus} alt={'minus'} width={16} className={styles.button}></Image>
                                    </div>
                                    <p className={styles.value}>{columns}</p>
                                    <div onClick={() => updateColumns('add')} className={styles.button}>
                                        <Image src={Plus} alt={'plus'} width={16}></Image>
                                    </div>
                                </div>
                            </Popover.Panel>
                        </Transition>
                    </Popover>
                </div>
            </div>
            <ResponsiveGridLayout
                className={classNames('layout', styles.timelinearea)}
                breakpoints={{lg: 1200}}
                cols={{ lg: columns}}
                rowHeight={48}
                autoSize={true}
                isDroppable={true}
                transformScale={1}
                onDrop={e => addIngredient(e)}
                onDragStop={e => updateItem(e)}
                onResizeStop={e => updateItem(e)}
                compactType={null}
                useCSSTransforms={false}
                draggableHandle={'.handle'}
            >

                {addedItems.map((item, id) => {
                    let data = null
                    if (!item.type) {
                        data = recipe.ingredients.find(ingredient => ingredient.i === item.i)
                    }
                    return (
                        <div
                            key={item.i}
                            data-grid={item}
                        >
                            <div
                                id={item.i}
                                className={classNames((item.type === 'step' ? styles.step : styles.ingredient), (item.span ? styles.span : ''))}
                            >
                                {item.type === 'step' &&
                                    <div className={styles.iteminner}>
                                        <p>{item.text}</p>
                                        <OptionMenu options={[
                                    {
                                        name: 'Rename',
                                        icon: 'edit',
                                        action: () => setModal(item),
                                    },
                                    {
                                        name: 'Add step',
                                        icon: 'plus',
                                        action: () => addStep(item),
                                    },
                                    {
                                        name: 'Delete',
                                        className: 'delete',
                                        icon: 'trash',
                                        action: () => removeItem(item),
                                    },
                                        ]}></OptionMenu>
                                    </div>
                                }
                                {!item.type &&
                                    <div className={styles.iteminner}>
                                        <DragHandle></DragHandle>
                                    <p>{data.quantity}{units.find(u => u.id === data.unit).symbol} {data.name}</p>
                                        <OptionMenu options={[
                                            {
                                                name: 'Add step',
                                                icon: 'plus',
                                                action: () => addStep(item),
                                            },
                                            {
                                                name: 'Delete',
                                                className: 'delete',
                                                icon: 'trash',
                                                action: () => removeItem(item),
                                            },
                                        ]}></OptionMenu>
                                    </div>
                                }
                            </div>
                        </div>
                    )
                })}

            </ResponsiveGridLayout>

            <Modal modal={modal} openModal={openModal} closeModal={closeModal} addedItems={addedItems} setAddedItems={setAddedItems}></Modal>
        </div>
    )
}
