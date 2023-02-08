import { faDownload, faCloudDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'



function getClass(message: any, user?: any) {
    if (message.status == '1' && message.mediaLink) {
        return 'image-message'
    } else if (message.status == '2' && message.mediaLink) {
        return 'video-message'
    } else if (message.status == '3' && message.mediaLink) {
        return 'audio-message'
    }
    return 'text-message'
}


function getVideoCover(message: any) {
    // return message.status == '2' && message.mediaLink ? JSON.parse(message.mediaLink)[0] : null
}

function getVideoSource(message: any) {
    // return message.status == '2' && message.mediaLink ? JSON.parse(message.mediaLink)[1] : null
    try {
        const mediaLink = JSON.parse(message.mediaLink)
        if (Array.isArray(mediaLink)) {
            if (mediaLink.length < 2) {
                return mediaLink[0]
            }
            return mediaLink[1]
        }
        return message.mediaLink
    } catch (error) {
        return message.mediaLink
    }
}

function getDownloadUrl(message: any) {
    // return message.status == '2' && message.mediaLink ? JSON.parse(message.mediaLink)[1] : null
    try {
        const mediaLink = JSON.parse(message.mediaLink)
        if (Array.isArray(mediaLink)) {
            return mediaLink[1]
        }
        return message.mediaLink
    } catch (error) {
        return message.mediaLink
    }
}

function getAudioSource(message: any) {
    try {
        const mediaLink = JSON.parse(message.mediaLink)
        if (Array.isArray(mediaLink)) {
            return mediaLink[2]
        }
        return message.mediaLink
    } catch (error) {
        return message.mediaLink
    }
    return message.status == '3' && message.mediaLink ? JSON.parse(message.mediaLink)[2] : null
}

function getImageSource(message: any) {
    try {
        const mediaLink = JSON.parse(message.mediaLink)
        if (Array.isArray(mediaLink)) {
            return mediaLink[1]
        }
        return message.mediaLink
    } catch (error) {
        return message.mediaLink
    }
    //return message.status == '1' && message.mediaLink ? JSON.parse(message.mediaLink)[0] : null
}

export const ChatMessage = ({ message, user, sendCallback, className }: any) => {
    return (
        <div key={message.id + Math.random()} className={`chat-message ${getClass(message)} ${className}`} title={JSON.stringify(message)}>

            <div className='message-content'>
                {message.repliedMessage ? <div className='replied-message'>
                    <div className='replied-message-content'>
                        <span className="username">{message.repliedMessage.senderInfo.name ?? message.repliedMessage.senderInfo.username}</span>
                        <span className="text"><pre>{message.repliedMessage.message}</pre></span>
                    </div>

                </div> : null}

                {message.status == 1 && message.mediaLink ? <div className='message-media-image' style={{
                    backgroundImage: `url(${getImageSource(message)})`,
                }}>

                </div> : null}

                {message.status == 2 && message.mediaLink ? <div className='message-media-video' style={{
                    backgroundImage: `url(${getVideoCover(message)})`,
                }}>
                    <video width="100%" height="auto" controls>
                        <source src={getVideoSource(message)} />
                    </video>
                </div> : null}

                {message.status == 3 && message.mediaLink ? <div className='message-media-audio' style={{
                    backgroundImage: `url(${getVideoCover(message)})`,
                }}>
                    <audio controls >
                        <source src={getAudioSource(message)} />
                    </audio>
                </div> : null}

                {message.status == 7 && message.mediaLink ? <div className='message-media-file' style={{
                    backgroundImage: `url(${getVideoCover(message)})`,
                }}>
                    <a href={getDownloadUrl(message)} target="_blank" download>
                        <div className='file-icon'>
                            <FontAwesomeIcon icon={faCloudDownload} />
                        </div>

                    </a>
                </div> : null}

                <span className="text" dangerouslySetInnerHTML={{ __html: message.message }}></span>
                <span className="time">{message.sentDate}</span>
            </div>
            {message.inline_markup && message.inline_markup.inlineKeyboard ? <div className='inline-markup'>
                {/* {JSON.stringify(message.inline_markup.inlineKeyboard)} */}
                {message.inline_markup.inlineKeyboard.map((o: any, index: number) => {
                    return <div className='row' key={`row-${index}`}>
                        {o.map((o: any, index: number) => {
                            return <button key={`button-${index}`} className='action-button btn' onClick={sendCallback(message, o.callbackData, o.url)}>
                                <span>{o.text}</span>
                            </button>
                        })}
                    </div>
                })}
            </div> : null}
        </div>
    )
}