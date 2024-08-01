import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const PotentialChats = () => {
  const { user } = useContext(AuthContext);
  const { potentialChats, createChat, onlineUsers } = useContext(ChatContext);

  if (potentialChats === null) {
    // Render a placeholder or loading state while potentialChat is being fetched
    return <div>Loading...</div>;
  }

  return (
    <div className="all-users">
      {potentialChats.length > 0 ? (
        potentialChats.map((u, index) => (
          <div
            key={index}
            className="single-user"
            onClick={() => {
              if (user?._id && u?._id) {
                createChat(user._id, u._id);
              }
            }}
          >
            {u?.name}
            <span className={onlineUsers.some((onlineUser) => onlineUser?.userId === u?._id) ? "user-online" : ""}></span>
          </div>
        ))
      ) : (
        <div>No potential chats available</div>
      )}
    </div>
  );
};

export default PotentialChats;
