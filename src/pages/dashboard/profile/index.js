import Layout from "@/components/layouts/dashboard";
import React from "react";
import Container from "@/components/dashboard/Container"
import styles from "@/styles/pages/dashboard/settings.module.scss"
import WhiteBox from "@/components/dashboard/WhiteBox";
import {useStoreActions, useStoreState} from "easy-peasy";
import Image from 'next/image'
import Avatar from "@/components/Avatar";
import NewButton from "@/components/NewButton";
import LoadingIcon from "@/components/svg/Loading";
import classNames from "classnames";
import {InformationCircleIcon} from "@heroicons/react/24/outline";
import {ExclamationCircleIcon} from "@heroicons/react/20/solid";
import HelpPopup from "@/components/HelpPopup";

export default function Settings () {
    const user = useStoreState(state => state.user);
    const setUser = useStoreActions(actions => actions.setUser);
    const [refresh, setRefresh] = React.useState('https://s3.eu-west-2.amazonaws.com/cdn.flowcook.com/avatar/' + (user ? user.id +'.jpg' + '?v='+Date.now() : 'default.jpg'));
    const [avatarStatus, setAvatarStatus] = React.useState(null);
    const [save, setSave] = React.useState(null);
    const [newData, setNewData] = React.useState({
        display_name: user.display_name ? user.display_name : user.username,
    })
    const [errors, setErrors] = React.useState([])

    const uploadRef = React.useRef(null);
    const handleAvatarClick = () => {
        if (avatarStatus === null) {
            uploadRef.current.click();
        }
    }
    const avatarUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'avatar')
            setAvatarStatus(1)

            try {
                fetch('/api/dashboard/upload', {
                    method: 'POST',
                    body: formData
                }).then(res => res.json())
                    .then(data => {

                        if (data.error) {
                            setAvatarStatus(2)
                            setTimeout(() => {
                                setAvatarStatus(null)
                            }, 2000)
                            return
                        }

                        setRefresh('https://s3.eu-west-2.amazonaws.com/cdn.flowcook.com/avatar/' + user.id +'.jpg?v='+Date.now())
                        setAvatarStatus(3)
                        setTimeout(() => {
                            setAvatarStatus(null)
                        }, 2000)
                    })
                    .catch(err => {
                        setAvatarStatus(2)
                        setTimeout(() => {
                            setAvatarStatus(null)
                        }, 2000)
                    })

            } catch (err) {
                console.log(err)
                setAvatarStatus(2)
                setTimeout(() => {
                    setAvatarStatus(null)
                }, 2000)
            }
        }
    }
    const deleteAvatar = () => {
        try {
            fetch('/api/dashboard/delete', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'avatar'
                })
            })
            setRefresh('https://s3.eu-west-2.amazonaws.com/cdn.flowcook.com/avatar/default.jpg?v='+Date.now())

        } catch (err) {
            console.log(err)
        }
    }
    const updateData = (e) => {
        setNewData({
            ...newData,
            [e.target.name]: e.target.value
        })
    }
    const saveProfile = () => {
        setSave(1)
        setErrors([])
        fetch('/api/dashboard/settings/profile', {
            method: 'POST',
            body: JSON.stringify(newData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                setSave(2)
                setErrors(data.errors)
                setTimeout(() => {
                    setSave(null)
                }, 3000)
                return
            }

            setSave(3)
            setUser({
                ...user,
                display_name: newData.display_name
            })
            setTimeout(() => {
                setSave(null)
            }, 3000)
        })
        .catch(err => {
            setSave(2)
            setTimeout(() => {
                setSave(null)
            }, 3000)
        })
    }

    return (
        <>
            {user && newData &&
            <div className={styles.dashboard}>
                <Container>
                    <WhiteBox className={'dashboard-w-full'}>
                        <div className={'flex flex-col h-full'}>
                            <div className={'flex'}>
                                <h1 className="text-subtitlem lg:text-subtitle flex-grow">Your Profile</h1>
                                <NewButton status={save} className={classNames('text-white', save === null && 'bg-black')} onClick={saveProfile}>
                                    {save === null && 'Save profile'}
                                    {save === 1 && 'Saving'}
                                    {save === 2 && 'Error saving'}
                                    {save === 3 && 'Profile saved'}
                                </NewButton>
                            </div>
                            <div className={'mt-12 flex-grow'}>
                                <label>Profile picture</label>
                                <div className={'flex items-center'}>
                                    <Avatar width={128} height={128} className={'rounded-full mr-6 cursor-pointer'} onClick={() => handleAvatarClick()} url={refresh}></Avatar>
                                    <input type={'file'} hidden className={'hidden'} ref={uploadRef} onChange={avatarUpload}/>
                                    <div className={'flex items-center'}>
                                        <NewButton
                                            status={avatarStatus}
                                            className={classNames('text-white mr-4', avatarStatus === null && 'bg-black')}
                                            onClick={() => handleAvatarClick()}
                                            loadingIcon={<LoadingIcon width={24} fill={'white'} className={'animate-spin'}/>}
                                        >
                                            {avatarStatus === null && 'Upload image'}
                                            {avatarStatus === 1 && 'Uploading'}
                                            {avatarStatus === 2 && 'Error uploading'}
                                            {avatarStatus === 3 && 'Image saved'}
                                        </NewButton>
                                        <NewButton className={'border-faded text-black border hover:bg-[#f5f5f5]'} onClick={() => deleteAvatar()}>Delete</NewButton>
                                    </div>
                                </div>
                                <div className={'mt-6 gap-6 max-w-xl'}>
                                    <div>
                                        <div className={'flex'}>
                                            <label>Display name</label>
                                            <HelpPopup>This is the name that is shown on your recipes</HelpPopup>
                                        </div>
                                        <div className={'relative'}>
                                            <input type={'text'} value={newData.display_name} onInput={updateData} name={'display_name'} className={(errors.find(e => e.input === 'display_name') ? styles.errorinput : '')}/>
                                            {(errors.find(e => e.input === 'display_name')) &&
                                                <div className={styles.errorcircle}>
                                                    <ExclamationCircleIcon className="h-5 w-5 text-error" aria-hidden="true" />
                                                </div>
                                            }
                                        </div>
                                        {(errors.find(e => e.input === 'display_name')) &&
                                            <div className={'text-error'}>
                                                {errors.find(e => e.input === 'display_name').message}
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className={'mt-12 max-w-xl'}>
                                    <p className={'text-subtitlem'}>Update password</p>
                                    <div className={'mt-6'}>
                                        <label>Current password</label>
                                        <input type={'password'} name={'current_password'} onInput={updateData} />
                                        {(errors.find(e => e.input === 'current_password')) &&
                                            <div className={'text-error'}>
                                                {errors.find(e => e.input === 'current_password').message}
                                            </div>
                                        }
                                    </div>
                                    <div className={'mt-3'}>
                                        <label>New password</label>
                                        <input name={'new_password'} type={'password'} onInput={updateData} />
                                    </div>
                                </div>
                            </div>
                            <div className={'flex mt-6 justify-end'}>
                                <NewButton status={save} className={classNames('text-white', save === null && 'bg-black')} onClick={saveProfile}>
                                    {save === null && 'Save profile'}
                                    {save === 1 && 'Saving'}
                                    {save === 2 && 'Error saving'}
                                    {save === 3 && 'Profile saved'}
                                </NewButton>
                            </div>
                        </div>
                    </WhiteBox>
                </Container>
            </div>
            }
        </>
    )
}

Settings.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    );
};
