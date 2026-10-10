export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-vino/25 text-vino shadow-sm focus:ring-vino ' +
                className
            }
        />
    );
}
