import classNames from "classnames";
import styles from "@/styles/pages/dashboard/recipepage.module.scss";
import {ExclamationCircleIcon} from "@heroicons/react/20/solid";
import React from "react";
import Skeleton from "react-loading-skeleton";

export default function Description ({recipe, errors, onChange}) {
    return (
        <div>
            <label>Description</label>
            {recipe ?
                <div className={styles.titleinput}>

                    <textarea className={classNames((errors.find(e => e.input === 'description') ? styles.errorinput : ''), styles.description)} placeholder="Description" value={recipe.description ? recipe.description : ''} name={'description'} onChange={onChange}></textarea>
                    {(errors.find(e => e.input === 'description')) &&
                        <div className={styles.errorcircle}>
                            <ExclamationCircleIcon className="h-5 w-5 text-error" aria-hidden="true" />
                        </div>
                    }
                </div>
                :
                <Skeleton height={200}></Skeleton>
            }
            {(errors.find(e => e.input === 'description')) && <p className={styles.errortext}>{errors.find(e => e.input === 'description').message}</p>}
        </div>
    )
}
