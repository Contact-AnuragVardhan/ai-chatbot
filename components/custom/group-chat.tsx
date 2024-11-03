'use client';

import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import './css/groupChat.css'; 


const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_SERVER_URL || 'http://localhost:3001';

interface MessageData {
  room: string;
  author: string;
  message: string;
  time: string;
}

const GroupChat: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<string>('Chat Room 1');
  const [username, setUsername] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [isJoined, setIsJoined] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        autoConnect: true,
      });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    newSocket.on('reconnect', () => {
        if (isJoined) {
          newSocket.emit('join_room', { room, username });
        }
      });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isJoined, room, username]);

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (data: MessageData) => {
        setMessages((prevMessages) => [...prevMessages, data]);
        scrollToBottom();
      };
      const handleUserList = (usersInRoom: string[]) => {
        setUsers(usersInRoom);
      };

      socket.on('receive_message', handleReceiveMessage);
      socket.on('user_list', handleUserList);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
        socket.off('user_list', handleUserList);
      };
    }
  }, [socket]);

  const joinRoom = () => {
    if (socket && room.trim() !== '' && username.trim() !== '') {
      socket.emit('join_room', { room, username });
      setIsJoined(true);
    } else {
      alert('Please enter a username and room name.');
    }
  };

  const sendMessage = () => {
    if (socket && message.trim() !== '' && username.trim() !== '') {
      const messageData: MessageData = {
        room,
        author: username,
        message,
        time: new Date().toLocaleTimeString(),
      };
      socket.emit('send_message', messageData);
      setMessage('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="groupchat-container">
      {!socket ? (
        <p>Connecting...</p>
      ) : !isJoined ? (
        <div className="groupchat-loginContainer">
          <h2>Join Chat Room</h2>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="groupchat-input"
          />
          <input
            type="text"
            placeholder="Room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="groupchat-input"
          />
          <button onClick={joinRoom} className="groupchat-button">
            Join Room
          </button>
        </div>
      ) : (
        <div className="groupchat-chatContainer">
          <div className="groupchat-usersList">
            <h3>Users in Room</h3>
            <ul className='groupchat-userItem-par'>
              {users.map((user, index) => (
                <li key={index} className="groupchat-userItem">
                  {user}
                </li>
              ))}
            </ul>
          </div>
          <div className="groupchat-chatSection">
            <div className="groupchat-messages">
              {messages.map((msg, index) => (
                <div
                  key={`${msg.author}-${msg.time}-${index}`}
                  className={
                    msg.author === username ? 'groupchat-myMessage' : 'groupchat-message'
                  }
                >
                  <strong>{msg.author}</strong> [{msg.time}]: {msg.message}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="groupchat-messageInput">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                className="groupchat-input"
              />
              <button onClick={sendMessage} className="groupchat-button">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChat;