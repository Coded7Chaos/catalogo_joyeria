export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-full border border-transparent bg-vino px-7 py-3 text-[15px] font-medium text-white transition duration-150 ease-in-out hover:bg-vino-deep focus:bg-vino-deep focus:outline-none focus:ring-2 focus:ring-vino focus:ring-offset-2 active:bg-vino-deep ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
