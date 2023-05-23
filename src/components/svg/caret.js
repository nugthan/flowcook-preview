import React from "react";
import Triangle from "./caret.svg";
import Image from "next/image";
export default function Caret() {
    return (
        <div className="caret">
            <Image src={Triangle} alt={'caret'} />
        </div>
    )
}
