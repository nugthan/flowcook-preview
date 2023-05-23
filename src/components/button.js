import React from "react";
import PropTypes from "prop-types";
import styles from '../styles/components/button.module.scss'
import classNames from "classnames";


export default function button({children, bg, disabled, border, fullwidth}) {
    return (

        <button className={classNames(styles.button, (border ? styles.border : ''), (disabled ? styles.disabled : ''), (fullwidth ? styles.fullwidth : ''))} disabled={disabled} style={{backgroundColor: bg, borderColor: border}}>
            <div>{children}</div>
        </button>

    )
}
