import { generateGradient } from "../../utils/gradient"

export const ChatCard = ({ message, active, selectChat, ws }: any) => {
    if (!message || !message.username) {
        return null
    }
    message.avatarBackgroundGradient = message.avatarBackgroundGradient ?? generateGradient()
    return (
        <div className={`chat-card ${active && active.id === message.id ? 'active' : null}`} onClick={() => selectChat(message)} title={JSON.stringify(message)}>
            <div className='chat-avatar'>

                <div className='avatar default' style={{
                    backgroundImage: message.avatarBackgroundGradient,
                }}>
                    <span>{message.username[0]}</span>
                </div>
                <div className='avatar'
                    style={{
                        backgroundImage: `url(${message.imageUrl})`,

                    }}
                ></div>
                <div className='status'></div>

            </div>
            <div className='chat-info'>
                <span className='username'>{message.username}</span>  <span className='message'>{message.message}</span>
            </div>
        </div>
    )
}