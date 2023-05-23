import {InformationCircleIcon} from "@heroicons/react/24/outline";
import React, {Fragment, useRef, useState} from "react";
import {Popover, Transition} from '@headlessui/react'
import { usePopper } from 'react-popper';


export default function HelpPopup ({children}) {
    const buttonRef = useRef(null)
    const [popperElement, setPopperElement] = useState(null);
    const { styles, attributes } = usePopper(buttonRef.current, popperElement, {
        placement: 'top',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 8],
                },
            },
            {
                name: 'computeStyles',
                options: {
                    adaptive: false,
                },
            }
        ],
    });

    const timeoutDuration = 200
    let timeout

    const onMouseEnter = (open) => {
        clearTimeout(timeout)
        if (open) return
        return buttonRef.current?.click()
    }

    const onMouseLeave = (open) => {
        if (!open) return
        timeout = setTimeout(() => closePopover(), timeoutDuration)
    }

    const closePopover = () => {
        return buttonRef.current?.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "Escape",
                bubbles: true,
                cancelable: true
            })
        )
    }


    return (
        <Popover>
            {({ open }) => (
                <div>
                    <Popover.Button ref={buttonRef}
                        onMouseEnter={onMouseEnter.bind(null, open)}
                        onMouseLeave={onMouseLeave.bind(null, open)}
                        className={'ml-2 focus:outline-none'}
                    >
                        <InformationCircleIcon width={16}></InformationCircleIcon>
                    </Popover.Button>
                    <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel ref={setPopperElement} style={styles.popper} {...attributes.popper} className={'py-2 px-6 z-10 max-w-[250px] text-center bg-green shadow-default rounded-md'}>
                            {children}
                        </Popover.Panel>
                    </Transition>
                </div>
            )}
        </Popover>

    )
}
