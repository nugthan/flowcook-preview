import React, {Fragment} from "react";
import {Menu, Transition} from "@headlessui/react";
import styles from "@/styles/components/optionmenu.module.scss";
import Image from "next/image";
import Kebab from "../../public/images/kebab.svg";
import classNames from "classnames";

export default function OptionMenu({options, className}) {
    return (
        <div className={styles.menu}>
            <Menu>
                <Menu.Button className={classNames(className)}>
                    <div className={styles.icon}>
                        <Image src={Kebab} width={16} height={16} className={styles.kebab} alt={'options'}></Image>
                    </div>
                </Menu.Button>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className={styles.dropdown}>
                        {options && options.map((option, index) => (
                            <Menu.Item key={index} className={classNames(styles.item, styles[option.className])}>
                                <div onClick={option.action}>
                                    <span>{option.name}</span>
                                </div>
                            </Menu.Item>
                        ))}
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    )
}
