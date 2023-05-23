import React from "react";
import styles from "@/styles/components/draghandle.module.scss"
import classNames from "classnames";

export default function DragHandle({className}) {
  return (
      <div className={classNames(styles.move, 'handle', className)}>

          <svg id="uuid-278f6ec1-b076-4ae6-8023-511c0f7b87ad"
               viewBox="0 0 16 18.51" width={16}>
              <path
                  d="m11.31,3.93L8.29.14c-.15-.18-.45-.18-.6,0l-3.07,3.86c-.09.12-.11.27-.05.41.06.13.2.22.35.22h6.16c.21,0,.38-.17.38-.39,0-.13-.06-.24-.15-.31Z"/>
              <path
                  d="m11.41,14.1c-.06-.13-.2-.22-.35-.22h-6.15c-.15,0-.28.08-.35.22-.06.13-.05.29.05.41l3.07,3.86c.07.09.18.15.3.15s.23-.05.3-.15l3.07-3.86c.09-.12.11-.27.05-.41Z"/>
              <rect x="0" y="8.28" width="16" height="1.95" rx=".97"
                    ry=".97"/>
          </svg>

      </div>
  );
}
