import { useEffect, useRef, useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";

export const InlineResults = ({ chat, user, token, ws, inlineResults }: any) => {
    const wrapperRef = useRef(null);
    const [show, setShow] = useState(false);
    useClickOutside(wrapperRef, () => {
        setShow(false);
    });

    useEffect(() => {
        if (inlineResults) {
            setShow(true);
        }
    }, [inlineResults])

    const selectItem = (item: any) => () => {

        const msg = {
            receiverId: !chat.communityId ? (chat.receiverId == user.id ? chat.userId : chat.receiverId) : null,
            groupId: chat.groupId,
            communityId: chat.communityId,
            channelId: chat.channelId,
            userId: user.id,
            message: item.inputMessage?.messageText + item.articleUrl,
            inline_markup: item.replyMarkup,
            viaBotId: inlineResults.message.bot.id,
        }
        ws.send('/app/message/send', msg);
        setShow(false);
        console.log(`Sending inline result: ${JSON.stringify(msg)}`)
    }

    return (
        (inlineResults && inlineResults.message.results ? <div className={`inline-results ${show ? "show" : "hidden"}`} ref={wrapperRef}>
            {inlineResults.message.results.map((r: any) => {
                return <div className='result' onClick={selectItem(r)} key={r.id}>
                    {r.thumbUrl ? <div className='result-image'>
                        <img src={r.thumbUrl} width={r.thumbWidth} />
                    </div> : null}
                    <div className="details">
                        <div className='result-title' dangerouslySetInnerHTML={{ __html: r.title }}></div>
                        <div className='result-description'><a href={r.articleUrl} target="_blank">{r.articleUrl}</a></div>
                    </div>
                </div>
            })}
        </div> : null)
    )
}