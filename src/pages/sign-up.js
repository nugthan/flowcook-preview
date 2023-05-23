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
import Input from "@/components/Input";

import Logo from "@/components/svg/logo";
import NewButton from "@/components/NewButton";
import { z } from "zod";
import PasswordStrengthBar from 'react-password-strength-bar';

export default function Login() {

    const router = useRouter();
    const {message} = router.query;
    const [error, setError] = React.useState([]);
    const [passwordInput, setPasswordInput] = React.useState('');
    const [score, setScore] = React.useState(0);
    const [globalError, setGlobalError] = React.useState(null);

    const onInputFunction = (e) => {
            setPasswordInput(e.target.value)
    }

    async function register() {
        setError([])
        let errors = []
        let email = document.getElementById('email').value;
        let password = document.getElementById('password').value;
        let username = document.getElementById('username').value;

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
        if (!username) {
            errors.push({
                input: 'username',
                message: 'Username is required'
            })
        }
        // check email is correct
        try {
            let check = z.string().email().parse(email)
        } catch (e) {
            errors.push({
                input: 'email',
                message: 'Email is not in correct format'
            })
        }
        // check password length
        if (password.length < 6) {
            errors.push({
                input: 'password',
                message: 'Password must be at least 6 characters'
            })
        }
        if (score < 2) {
            errors.push({
                input: 'password',
                message: 'Password is too weak'
            })
        }
        // stop if errors
        if (errors.length > 0) {
            setError(errors)
            return
        }

        fetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                password: password,
                username: username
            })
        })
            .then(res => res.json())
            .then(result => {
                if (result.error) {
                    if (result.errors) {
                        setError(result.errors)
                        return
                    }
                    setGlobalError(result.message)
                    return
                }
                router.push('/login?message=QWNjb3VudCBjcmVhdGVkISBQbGVhc2UgY2hlY2sgeW91ciBlbWFpbCBhbmQgY29uZmlybSB5b3VyIGFjY291bnQgYmVmb3JlIGNvbnRpbnVpbmcu')
            })
            .catch(e => {
                setError(e)
            })
    }

    return (
        <div className={styles.login}>
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
                    <p className={styles.title}>Create a new account</p>
                    <Link href={'/login'} className={'inline-block'}>
                        <p>Or <span className={'font-[600] underline cursor-pointer'}>sign in instead</span></p>
                    </Link>
                    <div className={styles.inputs}>
                        <Input label={'Email address'} type={'email'} id={'email'} errors={error}></Input>
                        <Input label={'Username'} type={'text'} id={'username'} errors={error} className={'lowercase'}></Input>
                        <Input label={'Password'} type={'password'} id={'password'} errors={error} onInput={onInputFunction}></Input>
                        <PasswordStrengthBar barColors={['#AAAAAA', '#D55454', '#f59c73', '#6FA567', '#6FA567']} minLength={6} password={passwordInput} className={classNames(styles.passwordbar, (passwordInput.length === 0 ? styles.hide : ''))} onChangeScore={(score) => setScore(score)}></PasswordStrengthBar>
                        <div onClick={() => register()}>
                            <NewButton className={'text-white bg-success w-full flex justify-center'}>Register</NewButton>
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
