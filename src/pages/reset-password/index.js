import Link from "next/link";
import Logo from "@/components/svg/logo";
import NewButton from "@/components/NewButton";
import {useState} from "react";


export default function Index() {

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const resetPassword = () => {
        setError(null);
        const email = document.getElementById('email').value;
        if (email === '') {
            setError('Please enter an email address to continue')
        } else {
            fetch('/api/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({email: email}),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        setError(data.error)
                    } else {
                        setSuccess(true)
                    }
                })
                .catch((err) => {
                    setError('Something went wrong, please try again later')
                })
        }
    }

    return (
        <div>
            <div className={'max-w-md mx-auto relative flex flex-col justify-center lg:block bg-white p-8 mt-24 rounded-md'}>
                <Link href={'/'}>
                    <Logo></Logo>
                </Link>
                <h1 className={'text-titlem md:text-title mb-12 mt-3'}>Reset your password</h1>
                {!success &&
                    <>
                    <label>Email address</label>
                    <input type={'email'} id={'email'}/>
                    <NewButton className={'flex justify-center w-full bg-black text-white mt-4'} onClick={() => resetPassword()}>Help me! Reset my password</NewButton>
                {error && <p className={'text-error mt-2 mb-4'}>{error}</p>}
                    <Link href={'/login'}>
                    <p className={'mt-6 underline font-[600]'}>Nevermind, I&apos;ve remembered it now</p>
                    </Link>
                    </>
                }
                {success &&
                    <>
                        <p>If an account with this email address exists, you&apos;ll receive an email shortly.</p>
                        <Link href={'/login'}>
                            <p className={'mt-6 underline font-[600]'}>Back to login</p>
                        </Link>
                    </>
                }
            </div>
        </div>
    )
}
