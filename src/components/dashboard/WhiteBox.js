import classNames from "classnames";


export default function WhiteBox({children, className}) {
    return (
        <div className={classNames("bg-white rounded-md pt-10 pb-8 px-6 md:px-12", (className))}>
            {children}
        </div>
    )
}
