import styles from "@/styles/pages/dashboard/recipepage.module.scss";
import DragHandle from "@/components/draghandle";
import classNames from "classnames";
import {Menu, Transition} from "@headlessui/react";
import LoadingIcon from "@/components/svg/Loading";
import React, {Fragment, useState} from "react";
import OptionMenu from "@/components/optionmenu";
import Skeleton from "react-loading-skeleton";

import GridLayout, {WidthProvider, Responsive} from "react-grid-layout";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Instructions ({recipe, setRecipe}) {
    const [uploadStepID, setUploadStepID] = useState(null)
    const hiddenFileInput = React.useRef(null);
    const handleUploadClick = (step) => {
        hiddenFileInput.current.click();
        setUploadStepID(step)
    }
    const updateStep = (e, type, step) => {
        if (type === "textupdate") {
            let refStep = recipe.steps.find(s => s.i === step.i)
            refStep.title = e.target.value
            let index = recipe.steps.findIndex(s => s.i === step.i)
            let newSteps = recipe.steps
            newSteps[index] = refStep
            setRecipe({ ...recipe, steps: newSteps });
        }
        if (type === 'description') {
            let refStep = recipe.steps.find(s => s.i === step.i)
            refStep.description = e.target.value
            let index = recipe.steps.findIndex(s => s.i === step.i)
            let newSteps = recipe.steps
            newSteps[index] = refStep
            setRecipe({ ...recipe, steps: newSteps });
        }
        if (type === "move") {
            let newSteps = []
            recipe.steps.forEach(step => {
                let refItem = e.find(item => item.i === step.i)
                if (refItem) {
                    step.x = refItem.x
                    step.y = refItem.y
                    step.w = refItem.w
                    step.h = refItem.h
                }
                newSteps.push(step)
            })
            setRecipe({ ...recipe, steps: newSteps });
        }
    }
    const uploadImage = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('recipe', recipe.id)
            formData.append('type', 'step')
            formData.append('step', uploadStepID)

            try {
                // create placeholder image
                let url = URL.createObjectURL(file)

                // add placeholder image
                setRecipe({ ...recipe, images: [...recipe.images, {recipe_id: recipe.id, step_id: uploadStepID, placeholder: true, url: url}] })


                fetch('/api/dashboard/upload', {
                    method: 'POST',
                    body: formData
                }).then(res => res.json())
                    .then(data => {
                        if (data.error) {
                            return
                        }
                        // remove placeholder image
                        let newImages = recipe.images.filter(i => !i.placeholder)
                        setRecipe({ ...recipe, images: newImages })

                        // add new image to recipe
                        setRecipe({ ...recipe, images: [...recipe.images, data.row] })

                    })
            } catch (err) {
                console.log(err)
            }
        }
    }

    const deleteImage = (image) => {
        // set placeholder to true on selected image
        let refImage = recipe.images.find(i => i.image_id === image.image_id)
        refImage.delete = true
        let index = recipe.images.findIndex(i => i.image_id === image.image_id)
        let newImages = recipe.images
        newImages[index] = refImage
        setRecipe({ ...recipe, images: newImages });
        fetch('/api/dashboard/delete', {
            method: 'POST',
            body: JSON.stringify({
                data: image,
                type: 'step'
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.log(data.error)
                    return
                }
                let newImages = recipe.images.filter(i => i.image_id !== image.image_id)
                setRecipe({ ...recipe, images: newImages });
            })
    }

    const deleteItem = (item, type) => {
        if (type === 'step') {
            let newSteps = recipe.steps.filter(s => s.i !== item.i)
            setRecipe({ ...recipe, steps: newSteps });
        }
        if (type === "ingredient") {
            let newIngredients = recipe.ingredients.filter(i => i.i !== item.i)
            setRecipe({ ...recipe, ingredients: newIngredients });
        }
    }

    return (
        <>
            {recipe ?
                <ResponsiveGridLayout
                    isResizable={false}
                    autoSize={true}
                    breakpoints={{lg: 1200}}
                    cols={{ lg: 1}}
                    rowHeight={130}
                    className={styles.recipesteps}
                    draggableHandle={'.handle'}
                    onDragStop={e => updateStep(e, 'move')}
                    margin={[0, 10]}
                    useCSSTransforms={false}
                >
                    {recipe && recipe.steps && recipe.steps.map((step) => {
                        return (
                            <div className={styles.draggable} key={step.i} data-grid={step}>
                                <div className={'translate-y-3'}>
                                    <DragHandle></DragHandle>
                                </div>
                                <div className={classNames(styles.input, 'ml-3')}>
                                    <input type="text" placeholder="Step title" value={step.title} name={'title'} onChange={(e) => updateStep(e, 'textupdate', step)}></input>
                                    <textarea placeholder="Description (optional)" rows={2} className={styles.stepdescription} value={step.description} onChange={(e) => updateStep(e, 'description', step)}></textarea>
                                </div>
                                <div className={'flex items-center'}>
                                    {recipe && recipe.images.filter(i => i.step_id === step.i).map((image, id) => {
                                        if (!image.placeholder) {
                                            return (
                                                <div key={id} className={'w-10 h-10 ml-2 relative'}>
                                                    <Menu>
                                                        {({ open }) => (
                                                            <>
                                                                <Menu.Button>
                                                                    <div
                                                                        style={{backgroundImage: 'url("https://s3.eu-west-2.amazonaws.com/cdn.flowcook.com/recipes/' + recipe.id + '/' + step.i + '-' + image.image_id + '.jpg")'}}
                                                                        className={classNames(
                                                                            (image.delete && styles.delete), styles.stepimage, (open && styles.open)
                                                                        )}
                                                                    >
                                                                        {image.delete &&
                                                                            <LoadingIcon className={'text-white h-5 w-5'}></LoadingIcon>
                                                                        }

                                                                    </div>
                                                                </Menu.Button>
                                                                <Transition
                                                                    as={Fragment}
                                                                    enter="transition ease-out duration-100"
                                                                    enterFrom="transform opacity-0 scale-95"
                                                                    enterTo="transform opacity-100 scale-100"
                                                                    leave="transition ease-in duration-75"
                                                                    leaveFrom="transform opacity-100 scale-100"
                                                                    leaveTo="transform opacity-0 scale-95"
                                                                >
                                                                    <Menu.Items className={classNames( styles.popup)}>
                                                                        <Menu.Item className={styles.popupitem}>
                                                                            <p onClick={() => deleteImage(image)}>Delete Image</p>
                                                                        </Menu.Item>
                                                                    </Menu.Items>
                                                                </Transition>
                                                            </>
                                                        )}
                                                    </Menu>
                                                </div>

                                            )
                                        } else {
                                            return (
                                                <div key={id} className={'w-10 h-10 opacity-50 ml-2 rounded-md flex items-center justify-center bg-cover bg-center'}  style={{backgroundImage: 'url("' + image.url + '")'}}>
                                                    <LoadingIcon className={'text-white h-5 w-5'}></LoadingIcon>
                                                </div>
                                            )
                                        }
                                    })
                                    }


                                </div>
                                <OptionMenu options={[{name: 'Add image', action: () => handleUploadClick(step.i)}, {name: 'Delete', action: () => deleteItem(step, 'step'), className: 'delete'}]} className={'translate-y-1'}>
                                </OptionMenu>
                                <input type={'file'} ref={hiddenFileInput} hidden className={'hidden'} onChange={uploadImage}/>
                            </div>
                        )
                    })}
                </ResponsiveGridLayout>
                : <Skeleton height={42} className="mb-3"></Skeleton>}
        </>
    )
}
