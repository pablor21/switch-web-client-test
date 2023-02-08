import { MutableRefObject, useEffect, useRef, useState } from "react";
import config from "../../Config";
import { useAuth } from "../../hooks/useAuth";
import { ChatCard } from "./ChatCard"
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";

export const ChatContent = ({ chat, notification, send, ws }: any) => {

    const { token, user }: any = useAuth()
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastMessage, setLastMessage] = useState();
    const [inlineResults, setInlineResults] = useState();


    // @ts-ignore
    const bottomElement: MutableRefObject<HTMLElement> = useRef();


    useEffect(() => {
        const divElement = bottomElement.current;

        const scrollToBottom = (behavior?: ScrollBehavior) => {
            // @ts-ignore
            setTimeout(() => divElement.scrollIntoView({
                behavior: behavior || 'auto',
            }), 0);
        }

        // React advises to declare the async function directly inside useEffect
        const fetchMessages = async () => {
            try {

                const userId = user.id
                const receiverId = chat.otherId
                const groupId = chat.groupId
                const communityId = chat.communityId
                const channelId = chat.channelId

                // alert(groupId)


                let url = `${config.CHAT_SERVER_URL}v1/message/${userId}/${receiverId}?pageLimit=100&pageOffset=0`
                if (communityId) {
                    url = `${config.CHAT_SERVER_URL}v1/message/group/${userId}/${chat.groupId ?? chat.channelId}?communityId=${chat.communityId}&isChannel=${!chat.isGroup}&pageLimit=100&pageOffset=0`
                }

                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                })
                if (!response.ok) throw new Error(response.status as any)
                const messages = (await response.json())
                // messages.map((o: any) => {
                //     o.id = o.userId + "-" + o.receiverId
                // })
                const col = (messages.message ?? messages).sort((a: any, b: any) => {
                    if (a.sentDate < b.sentDate) return -1
                    if (a.sentDate > b.sentDate) return 1
                    return 0
                })
                setMessages(col)
                setLastMessage(chat)
            } catch (error) {
                setMessages([]);
                // @ts-ignore
                setLastMessage(null);
            } finally {
                setLoading(false);

                scrollToBottom('auto');
            }
        }

        // You need to restrict it at some point
        // This is just dummy code and should be replaced by actual
        if (chat && token && (!lastMessage || (lastMessage as any).id !== chat.id)) {

            setLoading(true);
            fetchMessages();

        }
        // console.log("chat changed", chat, lastMessage)
        if (notification && chat) {
            if (notification.type == "Message") {
                const newMessage = notification.message.msg

                const otherId = newMessage.userId == user.id ? newMessage.receiverId : newMessage.userId

                if (otherId == chat.otherId || (chat.groupId && chat.groupId == newMessage.groupId) || (chat.channelId && chat.channelId == newMessage.channelId)) {
                    const index = messages.findIndex((o: any) => o.id == newMessage.id)
                    if (index !== -1) {
                        console.log("update message")
                        // @ts-ignore
                        messages.splice(index, 1, newMessage)
                        setMessages([...messages])
                    } else {
                        console.log("new message")
                        // @ts-ignore
                        messages.push(newMessage as any)
                        setMessages([...messages])
                        scrollToBottom('smooth');
                    }

                }
            } else if (notification.type === "DeleteMessage") {
                const index = messages.findIndex((o: any) => o.id == notification.message.msg.id)
                console.log("index", index)
                if (index !== -1) {
                    // @ts-ignore
                    messages.splice(index, 1)
                    setMessages([...messages])
                }
            } else if (notification.type === "InlineQueryResponse") {
                setInlineResults(notification)
            }
        }

    }, [chat, notification]);


    const sendCallback = (message: any, callback: any, url: string) => async () => {
        if (url) {
            // open url
            window.open(url, '_blank');
        }
        const otherId = message.userId == user.id ? message.receiverId : message.userId
        send(`/app/callback/${otherId}`, {
            callback_data: callback,
            id: message.id,
        })
    }




    return (
        <div className='chat-content'>
            {chat && chat.username ? <div className='chat-content-header'>
                <div className={`chat-card`}>
                    <div className='chat-avatar'>

                        <div className='avatar default' style={{
                            backgroundImage: chat.avatarBackgroundGradient,
                        }}>
                            <span>{chat.username[0]}</span>
                        </div>
                        <div className='avatar'
                            style={{
                                backgroundImage: `url(${chat.imageUrl})`,

                            }}
                        ></div>
                        <div className='status'></div>

                    </div>
                    <div className='chat-info'>
                        <span className='username'>{chat.username}</span>
                    </div>
                </div>
            </div> : null}
            {chat ? <div className='chat-content-body'>
                {loading ? <div className='loading'>Loading...</div> : <div className='chat-messages'>
                    {messages.map((m: any) => {
                        return <ChatMessage key={m.id} user={user} message={m} sendCallback={sendCallback} className={`${m.userId == user.id ? 'from-me' : 'from-other'}`} />
                    })}

                </div>}
                {/* @ts-ignore*/}
                <div style={{ float: "left", clear: "both" }} id="bottom" ref={bottomElement}>
                </div>
            </div> : null}
            {loading || !chat ? null : <div className='chat-content-footer'>
                <ChatInput chat={chat} token={token} user={user} ws={ws} inlineResults={inlineResults} />
            </div>}
        </div>
    )
}