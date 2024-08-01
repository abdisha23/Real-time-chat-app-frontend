import { useEffect,useContext} from "react";
import moment from 'moment';
import { UseFetchRecipientUser } from "../../hooks/useFetchRecipientUser";
import { useFetchLatestMessage} from "../../hooks/useFetchLatestMessage";
import { Stack } from 'react-bootstrap';
import { ChatContext } from "../../context/ChatContext";
import { unreadNotificationFunc } from "../../utils/unreadNotification";
const UserChat = ({chat, user}) => {
  const { recipientUser } = UseFetchRecipientUser(chat, user);
  
const {onlineUsers, notifications, markThisUserNotificationAsRead} = useContext(ChatContext);
const {latestMessage} = useFetchLatestMessage(chat);
const unreadNotifications = unreadNotificationFunc(notifications);
const thisUserNotifications = unreadNotifications.filter(n => n.senderId === recipientUser._id);

const isUserOnline = onlineUsers?.some((user) => user?.userId === recipientUser?._id);

const truncateText = (text) => {
  let shortText = text.substring(0,20);
  if(text.length > 20) {
    shortText = shortText + '...';
  }
  return shortText;
};
  return (
    <Stack direction="horizontal" gap={3} className="user-card align-items-center p-2 justify-content-between" role='button' onClick={() => {if(thisUserNotifications.length !== 0) {
      markThisUserNotificationAsRead(thisUserNotifications, notifications)}}}>
      <div className="d-flex">
        <div className="me-2">
          A
        </div>
        <div className="text-content">
          <div className="name"> {recipientUser?.name} </div>
          <div className="text"> {latestMessage?.text && (
            <span>{truncateText(latestMessage?.text)}</span>
          )} </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-end">
        <div className="date"> {moment(latestMessage?.createdAt).calendar()}</div>
        <div className={thisUserNotifications?.length > 0 ? "this-user-notifications" : ''}>{thisUserNotifications?.length > 0 ? thisUserNotifications?.length : ''}</div>
        <span className={isUserOnline ? "user-online" : ''}></span>
      </div>
    </Stack>
  );
};

export default UserChat;