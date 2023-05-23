import styles from "@/styles/pages/dashboard/recipepage.module.scss";
import {ExclamationCircleIcon} from "@heroicons/react/20/solid";
import React from "react";
import classNames from "classnames";
import {EyeIcon} from "@heroicons/react/24/outline";
import {EyeIcon as EyeSolid} from "@heroicons/react/24/solid";


export default function Input ({type, placeholder, label, id, errors, className, onInput, value, name}) {
    const [showPassword, setShowPassword] = React.useState(false)

    const toggleInput = () => {
        setShowPassword(!showPassword)
    }
    // on input function
    const onInputFunction = (e) => {
        if (onInput) {
            onInput(e)
        }
    }

    return (
        <div className={'mb-4'}>
            <label className={'text-sm text-faded'}>{label}</label>
            <div className={'relative'}>
                <input type={type === 'password' ? (showPassword ? 'text' : 'password') : type} name={name} value={value} placeholder={placeholder} id={id} className={classNames(errors && (errors.find(e => e.input === id)) && 'border-error', className)} onInput={onInput ? onInputFunction : null}></input>
                {(type === 'password') &&
                    <div onClick={toggleInput} className={classNames('absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer z-[1000]', (errors && errors.find(e => e.input === id)) && 'mr-6')}>
                        {showPassword ?
                            <EyeSolid className="h-5 w-5 cursor-pointer" aria-hidden="true"/>
                        :
                            <EyeIcon className="h-5 w-5 cursor-pointer" aria-hidden="true"/>
                        }
                    </div>
                }
                {errors && (errors.find(e => e.input === id)) &&
                    <div className={'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'}>
                        <ExclamationCircleIcon className="h-5 w-5 text-error" aria-hidden="true" />
                    </div>
                }
            </div>
            {errors && (errors.find(e => e.input === id)) && <p className={'text-error'}>{errors.find(e => e.input === id).message}</p>}
        </div>
    )
}
