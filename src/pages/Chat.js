import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { Container, Stack } from 'react-bootstrap';
import UserChat from "../components/chat/UserChat";
import PotentialChats from "../components/chat/PotentialChats";
import ChatBox from "../components/chat/ChatBox";

const Chat = () => {
    const { userChats, isUserChatsLoading, updateCurrentChat } = useContext(ChatContext);
    
    const {user} = useContext(AuthContext);
    return(

        <>
         <Container>
          <PotentialChats />
           {
             userChats?.length < 1 ? null : 
             <Stack direction="horizontal" className="align-items-start gap-4">
                <Stack className="flex-grow-0 messages-box gap-3 pe-3">
                  {/* {
                    isUserChatsLoading && <p>Loading chat...</p>
                  } */}
                  {
                    userChats &&
                    userChats.map((chat, index) => {
                      console.log('chat', chat)
                        return (
                        <div key={index} onClick={() => updateCurrentChat(chat)}>
                          
                          
                          <UserChat chat={chat} user={user} />
                        </div>
                        );
                    })
                  } 
                </Stack>

                <ChatBox />
             </Stack>} 
         </Container>
        </>
    )    
}
export default Chat;