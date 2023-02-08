import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { Link } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ChatCard } from './components/chat/ChatCard'
import { ChatListHeader } from './components/chat/ChatListHeader'
import { ChatContent } from './components/chat/ChatContent'
import { useStomp } from './hooks/useStomp'
import config from './Config'
import { AddChat } from './components/chat/AddChat'



function App() {
  const { token, user }: any = useAuth()
  const [chats, setChats] = useState([]);
  const [active, setActive] = useState();
  const [notification, setNotification] = useState();
  const [addChatOpen, setAddChatOpen] = useState(false);

  useEffect(() => {
    // React advises to declare the async function directly inside useEffect
    const fetchMessages = async (token: string, userId: string) => {
      const response = await fetch(`${config.CHAT_SERVER_URL}v1/message/recent?userId=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      })
      if (!response.ok) throw new Error(response.status as any)
      const res = (await response.json()).result
      res.map((o: any) => {
        o.otherId = o.userId == user.id ? o.receiverId : o.userId
        o.id = o.otherId
        if (o.groupId) o.id = o.groupId
        if (o.channelId) o.id = o.channelId
        o.otherId = o.userId == user.id ? o.receiverId : o.userId
      })
      setChats(res)
    }

    // const fetchMessages = async (token: string, userId: string) => {
    //   const response = await fetch(`${config.CHAT_SERVER_URL}v1/message/recent/personal?userId=${userId}`, {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${token}`,
    //     }
    //   })
    //   if (!response.ok) throw new Error(response.status as any)
    //   const x = (await response.json()).result
    //   x.map((o: any) => {
    //     o.id = o.userId + "-" + o.receiverId
    //     o.otherId = o.userId == user.id ? o.receiverId : o.userId
    //   })
    //   setMessages(x)
    // }

    // You need to restrict it at some point
    // This is just dummy code and should be replaced by actual
    if (!chats.length && token) {
      fetchMessages(token, user.id);

    }

  }, []);

  const onChatAdd = async (o: any) => {
    console.log("onChatAdd", o)
    setAddChatOpen(false)
    o.userId = user.id
    o.otherId = o.userId == user.id ? o.receiverId : o.userId
    o.id = o.otherId
    if (o.groupId) o.id = o.groupId
    if (o.channelId) o.id = o.channelId
    const index = chats.findIndex((m: any) => m.id == o.id)
    if (index !== -1) {
      setActive(chats[index])
    } else {
      const userInfoRequest = await fetch(`${config.CHAT_SERVER_URL}v1/message/user/info?userId=${o.otherId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      })
      try {
        const u = await userInfoRequest.json()
        o = { ...o, ...u }
        o.receiverId = u.id
        o.otherId = u.id
      } catch { }
      // @ts-ignore
      setChats((prev: any) => {
        return [o, ...prev]
      })
      setActive(o)
    }
  }

  const openAddChat = () => {
    setAddChatOpen((prev: boolean) => !prev)
  }

  const addMessage = (message: any) => {
    console.log("addMessage", message, chats)
  }

  let ws: any = null
  const { disconnect, subscribe, unsubscribe, subscriptions, send, isConnected } = ws =
    useStomp({
      brokerURL: `${config.CHAT_SERVER_WS_URL}v1/websocket/message/ws`,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }, () => {
      subscribe("/topic/listen." + user.id, (notification: any) => {
        console.log("received", notification);
        if (notification.type === "Message") {
          // const o = notification.message
          // o.id = o.userId + "-" + o.receiverId

          // const otherId = notification.message.userId == user.id ? notification.message.receiverId : notification.message.userId
          // notification.message.otherId = otherId
          // notification.message.id = notification.message.userId + "-" + notification.message.receiverId
          let o = notification.message
          // @ts-ignore
          setChats((messages: any[]) => {
            o.otherId = o.userId == user.id ? o.receiverId : o.userId
            o.id = o.otherId
            if (o.groupId) o.id = o.groupId
            if (o.channelId) o.id = o.channelId


            const index = messages.findIndex((m: any) => m.id == o.id)
            if (index !== -1) {
              // @ts-ignore
              const m = messages[index]
              m.message = o.message
              messages.splice(index, 1, m)
            } else {
              // @ts-ignore
              messages.push(o as any)
            }

            messages = messages.sort((a: any, b: any) => {
              if (a.timestamp > b.timestamp) return -1
              if (a.timestamp < b.timestamp) return 1
              return 0
            })

            return messages
          })

        }
        setNotification(notification)
      });
    });


  const selectChat = (message: any) => {
    setActive(message)

  }

  let i = 0;
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <div className='chat-wrapper'>
        <div className='chat-sidebar'>
          <ChatListHeader />
          <div className='chat-list-content'>
            {chats ? <ul>
              {chats.map((chat: any) => (
                <li key={chat.id} >
                  <ChatCard message={chat} active={active} selectChat={selectChat} ws={ws} />
                </li>
              ))}
            </ul> : <p>No messages</p>}
            <div className='chat-list-footer'>
              <button className='btn btn-round add-chat-btn' onClick={openAddChat}>+</button>
            </div>
          </div>

        </div>
        <ChatContent chat={active} notification={notification} send={send} ws={ws} />
        {addChatOpen ? <AddChat open={addChatOpen} addChat={onChatAdd} setOpen={setAddChatOpen} user={user} /> : null}
      </div>
    </div>
  )
}

export default App
