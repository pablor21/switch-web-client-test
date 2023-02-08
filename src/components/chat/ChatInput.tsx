import EmojiPicker, { Theme } from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperclip, faClose } from '@fortawesome/free-solid-svg-icons'

import config from "../../Config";
import { InlineResults } from "./InlineResults";

const BotMentionRegex = /@(?<bot>[a-zA-z0-9]{1,32})( )+((?<query>.{1,})?)?/gi;
let queryid = "";

export const ChatInput = ({ chat, user, token, ws, inlineResults }: any) => {
    const input = useRef(null)
    const [value, setValue] = useState('Hello World');
    const handleChange = (e: any) => setValue(e.target.value);
    const [selectedFile, setSelectedFile] = useState();
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [results, setResults] = useState(inlineResults);
    const [sending, setSending] = useState(false);
    const [mediaInfo, setMediaInfo] = useState({
        caption: "",
        description: "",
    });

    const [query, setQuery] = useState("");

    useEffect(() => {
        const timeOutId = setTimeout(() => sendTyping(query), 500);
        return () => clearTimeout(timeOutId);
    }, [query]);

    useEffect(() => {
        setResults(inlineResults);
    }, [inlineResults])


    const filePickerChange = (event: any) => {
        console.log(event.target.files[0]);
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setIsFilePicked(true);
        }
        event.target.value = null;
        event.target.files = null;
    };

    const sendTyping = async (q: string) => {
        setResults(null);

        if (q.match(BotMentionRegex)) {
            // if (!queryid) {
            //     queryid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            // }

            // generate different query id for each change
            queryid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const { groups: { bot, query } }: any = BotMentionRegex.exec(q)!;
            console.log(bot, query);

            const msg = {
                id: queryid,
                botName: bot,
                query: query,
                receiverId: !chat.communityId ? (chat.receiverId == user.id ? chat.userId : chat.receiverId) : null,
                groupId: chat.groupId,
                communityId: chat.communityId,
                channelId: chat.channelId,
                userId: user.id,
            }


            console.log(`Sending inline query: ${JSON.stringify(msg)}`)
            ws.send('/app/message/inline', msg);
        } else {
            queryid = "";
        }
    }

    const handleMediaInfoChange = (e: any) => {
        const { name, value } = e.target;
        setMediaInfo({
            ...mediaInfo,
            [name]: value,
        });
    }


    const sendMessage = async (e: any) => {
        e.preventDefault()
        if (sending) {
            return
        }
        // @ts-ignore
        const text = input.current.value
        // @ts-ignore
        input.current.value = ""


        const msg = {
            message: text,
            receiverId: !chat.communityId ? (chat.receiverId == user.id ? chat.userId : chat.receiverId) : null,
            groupId: chat.groupId,
            communityId: chat.communityId,
            channelId: chat.channelId,
            userId: user.id,
        }


        // check if file is picked
        if (isFilePicked) {
            console.log("file is picked");
            const formData = new FormData();
            for (var key in msg) {
                // @ts-ignore
                if (msg[key] !== null && msg[key] !== undefined) {
                    // @ts-ignore
                    formData.append(key, msg[key]);
                }
            }

            //@ts-ignore
            formData.append('uploadMediaRequest.file', selectedFile);
            formData.append('uploadMediaRequest.caption', mediaInfo.caption);
            formData.append('uploadMediaRequest.description', mediaInfo.description);
            try {
                setSending(true);
                const response = await fetch(`${config.CHAT_SERVER_URL}v1/message/create-with-media`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData
                })
            } catch (ex) {
                console.error(ex)
                // @ts-ignore
                input.current.value = text
            } finally {
                setSelectedFile(undefined);
                setIsFilePicked(false);
                setMediaInfo({
                    caption: "",
                    description: "",
                });
                setSending(false);
            }
        } else {
            if (text === "") return
            try {
                setSending(true);
                // const response = await fetch(`${config.CHAT_SERVER_URL}v1/message/create`, {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //         'Authorization': `Bearer ${token}`,
                //     },
                //     body: JSON.stringify(msg)
                // })
                ws.send('/app/message/send', msg);
            } catch (ex) {
                console.error(ex)
                // @ts-ignore
                input.current.value = text
            } finally {
                setSending(false);
            }

        }

    }

    let mediaDisplay = null;
    if (isFilePicked) {
        const type = (selectedFile as any).type;
        if (type.startsWith("image")) {
            mediaDisplay = <img src={URL.createObjectURL(selectedFile as any)} alt="preview" className="image-preview file-preview" />
        } else if (type.startsWith("video")) {
            mediaDisplay = <video controls className="video-preview file-preview" autoPlay muted><source src={URL.createObjectURL(selectedFile as any)} type={(selectedFile as any)!.type} /></video>
        } else if (type.startsWith("audio")) {
            mediaDisplay = <audio controls className="audio-preview file-preview">
                <source src={URL.createObjectURL(selectedFile as any)} type={(selectedFile as any)!.type} />
            </audio>
        } else {
            mediaDisplay = <p>File</p>
        }
    }

    return (
        <form className='chat-input' onSubmit={sendMessage}>
            <div className='chat-input-actions'>
                {mediaDisplay ? <div className="file-picker-preview">
                    <div className="file-picker-preview-container">
                        {mediaDisplay}
                        <div className="file-details">
                            <p>Filename: {(selectedFile as any).name}</p>
                            <p>Filetype: {(selectedFile as any).type}</p>
                            <p>Size in bytes: {(selectedFile as any).size}</p>
                        </div>
                        <a href="#" className="file-picker-cancel" onClick={(e) => { e.preventDefault(); setSelectedFile(undefined); setIsFilePicked(false) }}>
                            <FontAwesomeIcon icon={faClose} />
                        </a>
                    </div>
                    <div className="file-picker-info">
                        <input type="text" name="caption" onKeyUp={handleMediaInfoChange} className="file-picker-info-input" placeholder="Add a caption" />
                        <textarea name="description" onKeyUp={handleMediaInfoChange} className="file-picker-info-input" placeholder="Add a description"></textarea>
                    </div>
                </div> : null}


            </div>

            <div className='emoji-picker-container'>
                <div className='emoji-picker'>
                    <EmojiPicker onEmojiClick={(emoji) => {
                        // setValue(value + emoji.emoji)
                        // @ts-ignore
                        input.current.value = input.current.value + emoji.emoji
                    }}
                        height={500} width={400} theme={Theme.DARK} />

                </div>
                <button type="button" className="emoji-picker-button" ></button>

            </div>
            <div className="file-picker">

                <label>
                    <FontAwesomeIcon icon={faPaperclip} />
                    <input type="file" name="file" className="file-picker-input" onChange={filePickerChange} />
                </label>


            </div>

            <InlineResults inlineResults={results} chat={chat} ws={ws} token={token} user={user} sendMessage={sendMessage} />

            <input type='text' placeholder='Type a message...' ref={input} disabled={sending} onKeyUp={(event: any) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    event.stopPropagation();
                    sendMessage(event)
                } else {
                    setQuery(event.target.value)
                }
            }} />
        </form>
    )
}