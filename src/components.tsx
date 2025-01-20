import { JSX } from 'preact/jsx-runtime'

export const MobileScrollable = ({ children }: { children: JSX.Element }) => {
    return (
        <div class="scrollable">
            <div class="scroll-content">{children}</div>
        </div>
    )
}
