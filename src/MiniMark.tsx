export const MiniMark = ({ content }: { content: string }) => {
    return (
        <p
            dangerouslySetInnerHTML={{
                __html: content
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\\n/g, '<br>')
                    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
                    .replace(/_(.*?)_/g, '<em>$1</em>'),
            }}
        />
    )
}
