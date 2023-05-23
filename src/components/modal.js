import React, {Fragment, useEffect} from "react";
import {Dialog, Transition} from "@headlessui/react";
import Button from "@/components/button";
import styles from '@/styles/components/modal.module.scss'


export default function Modal({modal, openModal, closeModal, addedItems, setAddedItems}) {
    const [open, setOpen] = React.useState(false)
    const [text, setText] = React.useState("")
    useEffect(() => {
        if (modal) {
            setOpen(true)
        } else {
            setOpen(false)
        }
    }, [modal])

    const inputChange = (e) => {
        setText(e.target.value)
        modal.text = e.target.value
    }

    const saveModal = () => {
        let newItems = []
        addedItems.forEach(item => {
            if (item.i === modal.i) {
                item.text = modal.text
            }
            newItems.push(item);
        })
        setAddedItems(newItems)
        closeModal()
    }
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            saveModal()
        }
    }

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative" onClose={closeModal}>
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
                                    as="h3"
                                    className={styles.title}
                                >
                                    Rename step
                                </Dialog.Title>
                                <div>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-md p-2 mt-4"
                                        placeholder="Enter new name"
                                        value={modal?.text}
                                        onKeyDown={handleKeyDown}
                                        onChange={(e) => inputChange(e)}
                                    />
                                    <div className={styles.confirmbutton} onClick={saveModal}>
                                        <Button
                                            bg={'#6FA567'}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
