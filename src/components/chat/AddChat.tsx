import { useState } from "react"

export const AddChat = ({ user, addChat }: any) => {

    const [receiverId, setReceiverId] = useState('')
    const [communityId, setCommunityId] = useState('')
    const [groupId, setGroupId] = useState('')
    const [channelId, setChannelId] = useState('')

    const submit = (e: any) => {
        e.preventDefault()
        addChat({
            receiverId: receiverId,
            communityId: communityId,
            groupId: groupId,
            channelId: channelId,
            userId: user.id,
        })
        e.target.reset()
        setChannelId('')
        setGroupId('')
        setCommunityId('')
        setReceiverId('')

    }

    return (
        <div className='add-chat'>
            <div className='chat-list-header'>
                <h3>Add Chat</h3>
            </div>
            <div className='add-chat-content'>
                <div className='add-chat-form'>
                    <form onSubmit={submit}>
                        <label className="form-label">
                            <b>Receiver id</b>
                            <input type="text" placeholder='Receiver id' name="receiverId" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} />
                        </label>
                        <label className="form-label">
                            <b>Community id</b>
                            <input type="text" placeholder='Community id' name="communityId" value={communityId} onChange={(e) => setCommunityId(e.target.value)} />
                        </label>
                        <label className="form-label">
                            <b>Group id</b>
                            <input type="text" placeholder='Group id' name="groupId" value={groupId} onChange={(e) => setGroupId(e.target.value)} />
                        </label>
                        <label className="form-label">
                            <b>Channel id</b>
                            <input type="text" placeholder='Channel id' name="channelId" value={channelId} onChange={(e) => setChannelId(e.target.value)} />
                        </label>
                        <button type="submit" className="btn btn-block">Add Chat</button>
                    </form>

                </div>
            </div>
        </div>
    )
}