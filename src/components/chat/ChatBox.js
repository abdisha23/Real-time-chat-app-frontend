import { useState, useContext, useEffect, useRef } from 'react';
import { Stack } from 'react-bootstrap';
import InputEmoji from 'react-input-emoji';
import moment from 'moment';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import { UseFetchRecipientUser } from '../../hooks/useFetchRecipientUser';

const ChatBox = () => {
  const { user } = useContext(AuthContext);
  const { currentChat, messages, isMessagesLoading, sendTextMessage } = useContext(ChatContext);
  const { recipientUser, isLoading: isRecipientUserLoading, error: recipientError } = UseFetchRecipientUser(currentChat, user);
  const [textMessage, setTextMessage] = useState('');

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      scrollToBottom();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage(textMessage, user, currentChat?._id, setTextMessage);
    }
  };

  if (isRecipientUserLoading) {
    return <p style={{ textAlign: 'center', width: '100%' }}>Loading recipient user...</p>;
  }

  if (!currentChat) {
    return <p style={{ textAlign: 'center', width: '100%' }}>No conversation selected yet!</p>;
  }

  if (isMessagesLoading) {
    return <p style={{ textAlign: 'center', width: '100%' }}>Loading chat...</p>;
  }

  if (recipientError) {
    return <p style={{ textAlign: 'center', width: '100%' }}>Error loading recipient: {recipientError}</p>;
  }

  return (
    <Stack gap={3} className="chat-box">
      <div>
        <strong>{recipientUser?.name}</strong>
      </div>
      <Stack gap={3} className="messages" style={{ maxHeight: '400px', overflowY: 'auto' }} ref={chatContainerRef}>
        {messages && messages.map((message, index) => (
          <Stack key={index} className={`${message?.senderId === user?._id ? 'message self align-self-end flex-grow-0' : 'message align-self-start flex-grow-0'}`}>
            <span>{message.text}</span>
            <span className='message-footer'>{moment(message.createdAt).calendar()}</span>
          </Stack>
        ))}
        <div ref={messagesEndRef} />
      </Stack>
      <Stack direction='horizontal' gap={3} className='chat-input flex-grow-0'>
        <InputEmoji
          value={textMessage}
          onChange={setTextMessage}
          fontFamily='nunito'
          borderColor='rgb(72, 112, 223, 0.2)'
          onKeyDown={handleKeyPress}
        />
        <button className='send-btn' onClick={() => sendTextMessage(textMessage, user, currentChat?._id, setTextMessage)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16">
            <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/>
          </svg>
        </button>
      </Stack>
    </Stack>
  );
};

export default ChatBox;
