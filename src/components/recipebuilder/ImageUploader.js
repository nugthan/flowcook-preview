import {ArrowUpOnSquareIcon} from "@heroicons/react/20/solid";
import classNames from "classnames";
import LoadingIcon from "@/components/svg/Loading";
import React, {useState} from "react";
import NewButton from "@/components/NewButton";


export default function ImageUploader ({recipe, setRecipe}) {
    const [coverUploading, setCoverUploading] = useState(false)
    const coverUpload = React.useRef(null);
    const handleCoverClick = () => {
        coverUpload.current.click();
    }

    const uploadCoverImage = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('recipe', recipe.id)
            formData.append('type', 'recipe')

            try {
                let fallback = recipe.cover_image
                let url = URL.createObjectURL(file)
                setRecipe({ ...recipe, cover_image: url, uploading: true })
                // document.getElementById('cover_image').src = url
                setCoverUploading(true)
                fetch('/api/dashboard/upload', {
                    method: 'POST',
                    body: formData
                }).then(res => res.json())
                    .then(data => {
                        if (data.error) {
                            setCoverUploading(false)
                            setRecipe({ ...recipe, cover_image: fallback, uploading: null })
                            return
                        }
                        // document.getElementById('cover_image').src = url
                        setRecipe({ ...recipe, cover_image: data.id, uploading: null })
                        setCoverUploading(false)
                    })
            } catch(err) {
                console.log(err)
            }
        }
    }

    const deleteCoverImage = () => {
        setCoverUploading(true)
        fetch('/api/dashboard/delete', {
            method: 'POST',
            body: JSON.stringify({
                data: recipe,
                type: 'recipe'
            })
        }).then(res => res.json())
            .then(data => {
                if (data.error) {
                    return
                }
                setCoverUploading(false)
                setRecipe({ ...recipe, cover_image: null })
            })
            .catch(err => {
                setCoverUploading(false)
                console.log(err)
            })
    }


    return (
        <div>
            <label>Image</label>
            <div className={'flex items-center'}>
                {recipe && recipe.cover_image &&
                    <div
                        onClick={handleCoverClick}
                        style={{backgroundImage: 'url("' +  (recipe.uploading ? recipe.cover_image : 'https://s3.eu-west-2.amazonaws.com/cdn.flowcook.com/recipes/' + recipe.id + '/' + recipe.cover_image + '.jpg') + '")'}}
                        className={classNames('w-[200px] h-[120px] bg-cover bg-center bg-no-repeat rounded-md cursor-pointer mr-6 flex items-center justify-center', (coverUploading && 'opacity-50'))}
                    >
                        {coverUploading && <LoadingIcon className={'text-white h-5 w-5'}></LoadingIcon>}
                    </div>
                }
                {recipe && !recipe.cover_image &&
                    <div
                        onClick={handleCoverClick}
                        className={classNames('w-[200px] h-[120px] bg-extrafaded rounded-md cursor-pointer mr-6 flex items-center justify-center', (coverUploading && 'opacity-50'))}
                    >
                        {coverUploading && <LoadingIcon className={'text-white h-5 w-5'}></LoadingIcon>}
                    </div>
                }
                <input ref={coverUpload} id="file-upload" name="recipeimage" type="file" className="sr-only" onChange={(e) => uploadCoverImage(e)} />
                <NewButton onClick={handleCoverClick} className={'bg-black text-white'}>Upload Image</NewButton>
                <NewButton onClick={deleteCoverImage} className={'ml-4 border-black border text-black'}>Delete</NewButton>
            </div>


            {/*<div className={'flex'}>*/}
            {/*    <div>*/}
            {/*        {recipe && recipe.cover_image &&*/}
            {/*            <div className={'relative'}>*/}
            {/*                <div className={'mr-4'}>*/}
            {/*                    <img*/}
            {/*                        src={(recipe.uploading ? recipe.cover_image : 'https://s3.eu-west-2.amazonaws.com/cdn.flowcook.com/recipes/' + recipe.id + '/' + recipe.cover_image + '.jpg')}*/}
            {/*                        className={classNames('rounded-md w-auto max-h-[250px]', (coverUploading && 'opacity-50'))} id={'cover_image'}></img>*/}
            {/*                </div>*/}
            {/*                {coverUploading &&*/}
            {/*                    <div className={'absolute w-full h-full flex items-center justify-center top-0 left-0 right-0 bottom-0'}>*/}
            {/*                        <LoadingIcon className={'text-white h-5 w-5'}></LoadingIcon>*/}
            {/*                    </div>*/}

            {/*                }*/}
            {/*            </div>*/}
            {/*        }*/}
            {/*    </div>*/}
            {/*    <div className={'w-full h-full border-faded border-dashed border-2 rounded-md cursor-pointer h-[250px]'} onClick={handleCoverClick}>*/}
            {/*        <div className={'flex flex-col items-center justify-center py-3 h-full'}>*/}
            {/*                <ArrowUpOnSquareIcon className={'w-12 h-12 text-extrafaded mb-2'}></ArrowUpOnSquareIcon>*/}
            {/*            <div className="text-sm">*/}
            {/*                <label*/}
            {/*                    htmlFor="file-upload"*/}
            {/*                    className="relative cursor-pointer rounded-md bg-white font-medium text-success focus-within:outline-none focus-within:ring-2"*/}
            {/*                >*/}
            {/*                    <span className={'text-success'}>Upload a file</span>*/}
            {/*                    <input ref={coverUpload} id="file-upload" name="recipeimage" type="file" className="sr-only" onChange={(e) => uploadCoverImage(e)} />*/}
            {/*                </label>*/}
            {/*            </div>*/}
            {/*            <p className="text-sm text-faded">PNG, JPG, GIF up to 10MB</p>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    )
}
