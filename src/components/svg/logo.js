import React from "react";
import Image from "next/image";
import LogoBlack from "./logo.svg";

export default function Logo() {
    return (
        <div className="logo cursor-pointer">
            <Image src={LogoBlack} alt="Logo" width={140} />
        </div>
    )
}
