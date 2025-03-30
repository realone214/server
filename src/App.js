
import './App.css';
import io from'socket.io-client';
import { useState } from'react';
import Chat from './Chat';

const socket = io.connect('https://messagingbackend.onrender.com');

function App() {
  const [userName, setUserName] = useState('');
  
  const [room, setRoom] = useState('');
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (userName !== '' && room!== '') {
    socket.emit('join_room', room);
    setShowChat(true);
    }
  };
 
  return (
    <div className="App"> 
      { !showChat ? (
        <div className='join_room'>
          <input 
            type='text' 
            placeholder='Enter your name' 
            value={userName} 
            onChange={(e) => {setUserName(e.target.value)}} 
          />
            
          <input 
            type='text' 
            placeholder='Enter room name' 
            value={room} 
            onChange={(e) => setRoom(e.target.value)} 
            onKeyDown={(e) => {e.key === 'Enter' && joinRoom();}}
          />

          <button onClick={joinRoom} >Join Room</button>
        </div>
      ) : (
       <Chat socket={socket} userName={userName} room={room}></Chat>
      )}
    </div>
  );
}

export default App;
