import React, { useEffect, useState, useRef } from "react";
import "./App.css";

const Chat = ({ socket, room, userName }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);

  const receiveMessageHandler = (data) => {
    console.log('Received message:', data);
    if(data.author !== userName){
      setMessageList((list) => [...list, data]);
    }
  };

  const activeUsersHandler = (users) => {
    console.log('Active users:', users);
    setActiveUsers(users);
  };

  const allMessagesHandler = (messages) => {
    console.log('All messages:', messages);
    setMessageList(messages);
  };

  useEffect(() => {

    console.log('useEffect is running with socket, room, userName:', socket, room, userName);
    socket.on('receive_message', receiveMessageHandler);
    socket.on('active_users', activeUsersHandler);
    socket.on('all_messages', allMessagesHandler);
    socket.emit('join_room', { room, userName });

    return () => {
      console.log('Component is unmounting, leaving room:', room, userName);
      socket.emit('leave_room', { room, userName });
      socket.off('receive_message', receiveMessageHandler);
      socket.off('active_users', activeUsersHandler);
      socket.off('all_messages', allMessagesHandler);
    };
  },[socket, room, userName]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: userName,
        message: currentMessage,
        time: new Date().toLocaleString()
      };

      console.log('Sending message:', messageData);
      await socket.emit('send_message', messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage('');
    }
  };

  const messagesEndRef = useRef(null); 
  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }; 
  
  useEffect(() => { 
    scrollToBottom() 
  }, [messageList]);

  return (
    <>
      <div>
        <p className='room-name'>Hi {userName}, You are in room: {room}</p>
        <div className="active-users"> 
          <p className='active-users-title'>Active Users:</p>
          <div className='active-users-list'>
            {activeUsers.map((user, index) => <button key={index}>{user}</button>)}
          </div>
        </div>
      </div>
      <div className='chat-container'>
          {messageList.map((messageContent, index) => 
          <div className='message' id={userName === messageContent.author ? 'user-message' : 'other-message'} key={index}>
            
            <p className='author'>{messageContent.author}</p>
            
            <div className="message-content">
              <p className='message-text'>{messageContent.message}</p>
              <p className='time'>{messageContent.time}</p>
            </div>
          </div>  
        )}
       
       <div ref={messagesEndRef} />
       
        <div className='message-input'>
          <input type="text" value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} 
            onKeyDown={(e) => {e.key === 'Enter' && sendMessage();}} 
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>     
    </>
  );
};

export default Chat;
