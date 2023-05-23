import Link from "next/link";
import Logo from "@/components/svg/logo";
import NewButton from "@/components/NewButton";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import classNames from "classnames";


export default function ForgotPassword() {

    const [error, setError] = useState(null);
    const [check, setCheck] = useState(false);
    const router = useRouter();
    const {token} = router.query;

    useEffect(() => {
        if (token) {
            fetch('/api/auth/reset-password/verify', {
                method: 'POST',
                body: JSON.stringify({token: token}),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        // redirect user to login
                        router.push('/login')
                        return
                    }
                    setCheck(true)
                })
                .catch((err) => {
                    router.push('/login')
                })
        }
    }, [token])

    const newPassword = () => {
        setError(null)
        let password = document.getElementById('password').value;

        if (password.length < 1) {
            setError('Please enter a password')
            return
        }

        fetch('/api/auth/reset-password', {
            method: 'PUT',
            body: JSON.stringify({token: token, password: password}),
        }).then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error)
                } else {
                    router.push('/login?message=WW91ciBwYXNzd29yZCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgcmVzZXQuIFlvdSBjYW4gbm93IGxvZyBpbiBhZ2Fpbg==')
                }
            })
    }

    return (
        <div>
            {check &&
            <div className={'max-w-md mx-auto relative flex flex-col justify-center lg:block bg-white p-8 mt-24 rounded-md'}>
                <Link href={'/'}>
                    <Logo></Logo>
                </Link>

                <h1 className={'text-titlem md:text-title mb-12 mt-3'}>Create a new password</h1>
                    <>
                        <label>New Password</label>
                        <input type={'password'} id={'password'} className={classNames(error && 'border-error')}/>
                        <NewButton className={'flex justify-center w-full bg-black text-white mt-4'} onClick={() => newPassword()}>Update my password</NewButton>
                        {error && <p className={'text-error mt-2 mb-4'}>{error}</p>}
                        <Link href={'/login'}>
                            <p className={'mt-6 underline font-[600]'}>Nevermind, I&apos;ve remembered it now</p>
                        </Link>
                    </>
            </div>
            }
        </div>
    )
}
