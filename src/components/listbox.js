import React, {Fragment} from "react";
import classNames from "classnames";
import {Listbox, Transition} from "@headlessui/react";
import styles from "@/styles/components/listbox.module.scss"

export default function ListBox({ingredient, units, setUnit}) {
    return (
        <Listbox value={ingredient.unit} onChange={(e) => setUnit(e, ingredient)}>
            {({ open }) => (
                <div className={styles.selectcontainer}>
                    <Listbox.Button className={styles.select} placeholder={'unit'}>
                      <span className="inline-flex w-full ">
                          {ingredient.unit &&
                            <span className={classNames(styles.selectvalue, 'mr-2')}>
                                {units.find(u => u.id === ingredient.unit).name}s
                            </span>
                          }
                          {!ingredient.unit &&
                            <span className={classNames(styles.selectplaceholder, 'mr-2')}>
                                Unit
                            </span>
                          }
                      </span>
                        <span className={styles.selecticon}>
                            <svg id="uuid-e62a5d97-6036-4036-944d-9bd824f5c8aa" viewBox="0 0 256 426.67" width={8}>
                                <path d="m128,426.67c-6.4,0-10.67-2.13-14.93-6.4L6.4,313.6c-8.53-8.53-8.53-21.33,0-29.87s21.33-8.53,29.87,0l91.73,91.73,91.73-91.73c8.53-8.53,21.33-8.53,29.87,0s8.53,21.33,0,29.87l-106.67,106.67c-4.27,4.27-8.53,6.4-14.93,6.4h0Z"/>
                                <path d="m21.33,149.33c-6.4,0-10.67-2.13-14.93-6.4-8.53-8.53-8.53-21.33,0-29.87L113.07,6.4c8.53-8.53,21.33-8.53,29.87,0l106.67,106.67c8.53,8.53,8.53,21.33,0,29.87s-21.33,8.53-29.87,0l-91.73-91.73-91.73,91.73c-4.27,4.27-8.53,6.4-14.93,6.4h0Z"/>
                            </svg>
                      </span>
                    </Listbox.Button>
                    <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className={styles.selectoptions}>
                            {units.map((unit) => (
                                <Listbox.Option key={unit.id} value={unit} className={styles.selectoption}>
                                    {unit.name}s
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            )}
        </Listbox>
    )
}
