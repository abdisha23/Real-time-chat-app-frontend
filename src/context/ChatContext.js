import { useContext, createContext, useCallback, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { getRequest, postRequest, baseUrl } from "../utils/Services";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
  const [userChats, setUserChats] = useState(null);
  const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
  const [userChatsError, setUserChatsError] = useState(null);
  const [potentialChats, setPotentialChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [sendTextMessageError, setSendTextMessageError] = useState(null);
  const [newMessage, setNewMessage] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isUserChatsLoaded, setIsUserChatsLoaded] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (socket === null) return;
    socket.emit('addNewUser', user?._id);
    socket.on('getOnlineUsers', (res) => {
      setOnlineUsers(res);
    });

    return () => {
      socket.off('getOnlineUsers');
    };
  }, [socket]);

  useEffect(() => {
    if (socket === null) return;
    const recipientId = currentChat?.members?.find((id) => id !== user?._id);
    if (newMessage && recipientId) {
      socket.emit('sendMessage', { ...newMessage, recipientId });
      console.log('Sent message via socket:', { ...newMessage, recipientId });
    }
  }, [newMessage, socket, currentChat, user]);
// receive message and notifications
  useEffect(() => {
    if (socket === null) return;
    socket.on('getMessage', (res) => {
      if (currentChat?._id !== res.chatId) return;
      setMessages((prev) => [...prev, res]);
      console.log('Received message via socket:', res);
    });
    socket.on('getNotification', (res) =>{
      const isChatOpen = currentChat?.members.some(id => id === res.senderId);
      if(isChatOpen) {
        setNotifications(prev => [{...res, isRead: true}, ...prev]);
      }
      else{
        setNotifications(prev => [res,  ...prev]);
      }
    })

    return () => {
      socket.off('getMessage');
      socket.off('getNotification');
    };
  }, [socket, currentChat]);

  useEffect(() => {
    const getUserChats = async () => {
      if (user?._id) {
        setIsUserChatsLoading(true);
        setUserChatsError(null);
        const response = await getRequest(`${baseUrl}/chats/${user?._id}`);
        setIsUserChatsLoading(false);
        if (response.error) {
          return setUserChatsError(response);
        }
        setUserChats(response);
        setIsUserChatsLoaded(true); // Mark user chats as loaded
      }
    };
    getUserChats();
  }, [user, notifications]);

  useEffect(() => {
    const getMessages = async () => {
      if (currentChat?._id) {
        setIsMessagesLoading(true);
        setMessagesError(null);
        const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`);
        setIsMessagesLoading(false);
        if (response.error) {
          return setMessagesError(response);
        }
        setMessages(response);
      }
    };
    getMessages();
  }, [currentChat, user]);

  const sendTextMessage = useCallback(async (textMessage, sender, currentChatId, setTextMessage) => {
    if (!textMessage) return console.log('You must type something...');
    console.log('Sending message:', textMessage);
    const response = await postRequest(`${baseUrl}/messages`, { chatId: currentChatId, senderId: sender._id, text: textMessage });
    if (response.error) {
      console.error('Error sending message:', response);
      return setSendTextMessageError(response);
    }
    setNewMessage(response);
    setMessages((prev) => [...prev, response]);
    setTextMessage('');
  }, []);

  const updateCurrentChat = useCallback((chat) => {
    console.log('Updating current chat:', chat);
    if (!chat) {
      console.error('Invalid chat object:', chat);
      return;
    }
    setCurrentChat(chat);
  }, []);

  const createChat = useCallback(
    async (receiverId, senderId) => {
      try {
        const response = await postRequest(`${baseUrl}/chats`, { senderId, receiverId });
        if (response.error) {
          console.error('Error creating chat:', response);
          return;
        }
        setUserChats((prev) => [...prev, response]);
      } catch (error) {
        console.error('Unexpected error creating chat:', error);
      }
    },
    []
  );

  useEffect(() => {
    const getUsers = async () => {
      if (!user?._id || !isUserChatsLoaded) return; // Ensure userChats is loaded before fetching users

      const response = await getRequest(`${baseUrl}/users`);
      if (response.error) {
        return setUserChatsError(response);
      }

      const pChats = response.filter((u) => {
        if (user?._id === u?._id) return false;
        return !userChats?.some((chat) => chat.members.includes(u?._id));
      });

      setPotentialChats(pChats);
      setAllUsers(response);
    };

    getUsers();
  }, [userChats, user, isUserChatsLoaded]);
const markAllNotificationsAsRead = useCallback((notifications) => {
  const mNotifications = notifications.map(n => {return{...n, isRead: true}});
  setNotifications(mNotifications);
}, []);
const markNotificationAsRead = useCallback((n, userChats, user, notifications) => {
  const desiredChat = userChats.find(chat => {
    const chatMembers = [user._id, n.senderId];
    const isDesiredChat = chat.members.every((member) => {
      return chatMembers.includes(member);
    });
    return isDesiredChat;


  });
  const mNotifications = notifications.map(el => {
    if(n.senderId === el.senderId){
      return {...n, isRead: true};
    }
    else{
      return el;
    }
  })
  updateCurrentChat(desiredChat);
  setNotifications(mNotifications);
}, []);
const markThisUserNotificationAsRead = useCallback((thisUserNotifications, notifications) => {
  const mNotifications = notifications.map(el => {
    let notification;
    thisUserNotifications.forEach(n => {
      if(n.senderId === el.senderId){
        notification = {...n, isRead: true};
      }
      else{
        notification = el;
      }
    });
    return notification;

  });
  setNotifications(mNotifications);

}, []);
  return (
    <ChatContext.Provider
      value={{
        userChats,
        isUserChatsLoading,
        userChatsError,
        potentialChats,
        createChat,
        updateCurrentChat,
        currentChat, // Ensure currentChat is provided in the context
        messages,
        isMessagesLoading,
        messagesError,
        sendTextMessage,
        onlineUsers,
        notifications,
        allUsers,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        markThisUserNotificationAsRead

      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
