import classNames from "classnames";

export default function NewButton({children, bg, text, icon, onClick, className, status, loadingIcon}) {
    return (
        <div onClick={onClick}>
            <button className={classNames('px-6 py-2 rounded-md relative font-[500] flex items-center', className, (status === 1 && 'bg-black opacity-50 cursor-not-allowed'), (status === 2 && 'bg-error'), (status === 3 && 'bg-success'))}>
                {icon &&
                    <span>
                        {icon}
                    </span>
                }
                {loadingIcon && status === 1 &&
                    <span>
                        {loadingIcon}
                    </span>
                }
                <span className={classNames(icon ? 'translate-y-[2px] ml-1' : '')}>
                    {children}
                </span>
            </button>
        </div>
    )
}
