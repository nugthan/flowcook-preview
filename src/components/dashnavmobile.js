import React, {useEffect, useState} from "react";
import styles from "@/styles/components/dashnavmobile.module.scss";
import Image from "next/image";
import Hamburger from "../../public/images/hamburger.svg";
import classNames from "classnames";

export default function dashNavMobile({navOpen, setNavOpen}) {
    // on scroll up, apply class to nav
    const [scroll, setScroll] = useState(false);

    useEffect(() => {
            let t = window.scrollY,
                s = !1;
            window.addEventListener('scroll', function() {
                var e;
                s || (0 < (e = window.scrollY - t) && setScroll(false),
                e < 0 && setScroll(true),
                    s = setTimeout(() => {
                        s = !1, t = window.scrollY
                    }, 500))

                // if at top of page, set to false
                if (window.scrollY === 0) {
                    setScroll(false)
                }
            })
    });


  return (
      <div className={classNames(styles.mobilenav, (scroll ? styles.stick : ''))}>
          <div className={styles.toggle} onClick={() => setNavOpen(!navOpen)}>
              <Image src={Hamburger} className={styles.icon} alt={'menu'}></Image>
          </div>
      </div>
  );
}
