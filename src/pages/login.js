import React, {useEffect, useState} from 'react'
import classNames from "classnames";
import styles from '@/styles/pages/login.module.scss'
import Image from "next/image";
import Button from "@/components/button";
import Layout from "@/components/layouts/login";
import Link from "next/link";
import {useRouter} from "next/router";
import AlertBanner from "@/components/alertBanner";
import Cookies from 'js-cookie';

import Logo from "@/components/svg/logo";
import NewButton from "@/components/NewButton";
import Input from "@/components/Input";

export default function Login() {

    const router = useRouter();
    let {message, errormessage} = router.query;
    const [bannerOpen, setBannerOpen] = React.useState(false);
    const [bannerMessage, setBannerMessage] = React.useState(null);
    const [bannerError, setBannerError] = React.useState(false);
    const [error, setError] = React.useState([]);
    const [globalError, setGlobalError] = React.useState(null);

    useEffect(() => {
        if (message) {
            // delay the banner opening so it doesn't look weird
            setTimeout(() => {
                setBannerMessage(Buffer.from(message, 'base64').toString('ascii') || null)
                setBannerOpen(true)
            }, 500)
        }
    }, [message])
    useEffect( () => {
        if (errormessage) {
            setBannerError(true)
        }
    }, [errormessage])

    async function login() {
        let email = document.getElementById('email').value;
        let password = document.getElementById('password').value;
        let remember = document.getElementById('remember').checked;
        let errors = []

        if (!email) {
            errors.push({
                input: 'email',
                message: 'Email is required'
            })
        }
        if (!password) {
            errors.push({
                input: 'password',
                message: 'Password is required'
            })
        }

        if (errors.length > 0) {
            setError(errors)
            return
        }

        fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    if (data.errors) {
                        setError(data.errors)
                        return
                    }
                    setGlobalError(data.message)
                    return
                }
                if (data.token) {
                    Cookies.set('token', data.token, {
                        expires: (remember ? 7 : null),
                        path: '/',
                    })
                    router.push('/dashboard')
                }
            })
    }

    return (
        <div className={styles.login}>
            <AlertBanner message={bannerMessage} bannerOpen={bannerOpen} setBannerOpen={setBannerOpen} bannerError={bannerError}></AlertBanner>

            <div className={styles.image}>
                <img src={'/images/login.png'} className={styles.gridimage}/>
                <div className={styles.fullimage}/>
            </div>
            <div className={styles.form}>
                <div className={styles.form_container}>
                    <div className={'mb-3'}>
                        <Link href={'/'}>
                            <Logo></Logo>
                        </Link>
                    </div>
                    <p className={styles.title}>Sign in to your account</p>
                    <Link href={'/sign-up'} className={'inline-block'}>
                        <p>Or <span className={'font-[600] underline cursor-pointer'}>create a new account</span></p>
                    </Link>
                    <div className={styles.inputs}>
                        <Input type={'email'} label={'Email address'} id={'email'} errors={error}></Input>
                        <Input type={'password'} label={'Password'} id={'password'} errors={error}></Input>
                        <div className={styles.mid}>
                            <div className={classNames( styles.remember, 'cursor-pointer')}>
                                <input type={"checkbox"} id={'remember'} name={'remember'}></input>
                                <label htmlFor={'remember'}> Remember me</label>
                            </div>
                            <div className={styles.forgot}>
                                <a href={'/reset-password'} className={'font-[600] underline'}>Forgot your password?</a>
                            </div>
                        </div>
                        <div onClick={() => login()}>
                            <NewButton className={'text-white bg-success w-full flex justify-center'}>Sign in</NewButton>
                        </div>
                        {globalError && <p className={'text-error text-center mt-4'}>{globalError}</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

Login.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    );
};
