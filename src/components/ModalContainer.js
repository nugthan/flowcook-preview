import React, {Fragment, useEffect} from "react";
import {Dialog, Transition} from "@headlessui/react";
import Button from "@/components/button";
import styles from '@/styles/components/modal.module.scss'


export default function Modal({openState, closeState, title, children}) {

    return (
        <Transition appear show={openState} as={Fragment}>
            <Dialog as="div" className="relative" onClose={closeState}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className={styles.overlay} />
                </Transition.Child>

                <div className={styles.modalcontainer}>
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className={styles.panel}>
                                <Dialog.Title
                                    as="p"
                                    className="text-subtitlem lg:text-subtitle mb-3"
                                >
                                    {title}
                                </Dialog.Title>
                                <div>
                                    {children}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
