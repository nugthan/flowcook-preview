import React from 'react'
import classNames from "classnames";
import styles from "@/styles/components/alertbanner.module.scss"
import Image from "next/image";
import Cross from "../../public/images/cross.svg";

export default function AlertBanner({message, bannerOpen, setBannerOpen, bannerError}) {
    return (
        <>
            {message && (
                <div className={classNames(styles.topbanner, (bannerError ? 'bg-error' : 'bg-success'), (bannerOpen ? styles.banneropen : ''))}>
                    <p>{message}</p>
                    <div className={styles.cross} onClick={() => setBannerOpen(false)}>
                        <Image src={Cross} alt={'close button'}></Image>
                    </div>
                </div>
            )}
        </>
    )
}
