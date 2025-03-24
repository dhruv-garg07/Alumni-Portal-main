import React, { useState, useEffect } from "react";
import { 
    auth, 
    db, 
    onAuthStateChanged, 
    collection, 
    addDoc, 
    doc, 
    getDocs, 
    orderBy, 
    onSnapshot,
    query,
    where
  } from "../firebase";  
  

const MessagesPage = () => {
  const [activeTab, setActiveTab] = useState("chats");
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editedUser, setEditedUser] = useState(null); // Store complete user object

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Current User:", user);

            // Query Firestore for user with matching UID
            const usersCollectionRef = collection(db, "Users");
            const q = query(usersCollectionRef, where("uid", "==", user.uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data(); // Get the first matching document
                console.log("User Data from Firestore:", userData);
                setEditedUser(userData); // Store full user object
            } else {
                console.log("User not found in Firestore, using basic info");

                // If user is not in Firestore, use basic Auth details
                setEditedUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email.split("@")[0],
                    photoURL: user.photoURL || "", // Default empty if not available
                });
            }
        } else {
            setEditedUser(null); // No user logged in
        }
    });

    return () => unsubscribe();
}, []);


  const chats = [
    { id: "chat_1", name: "John Doe", type: "chat" },
    { id: "chat_2", name: "Alice Smith", type: "chat" },
  ];

  const groups = [
    { id: "group_1", name: "Project Team", type: "group" },
    { id: "group_2", name: "Alumni Group", type: "group" },
  ];

  useEffect(() => {
    if (!selectedChat) return;
    const q = query(collection(db, `chats/${selectedChat.id}/messages`), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    console.log(editedUser);
    await addDoc(collection(db, `chats/${selectedChat.id}/messages`), {
      text: newMessage,
      createdAt: new Date(),
      sender: editedUser.name, // Use the user's name instead of email
    });
    setNewMessage("");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-100 p-4 border-r">
        <div className="flex justify-between mb-4">
          <button
            className={`p-2 ${activeTab === "chats" ? "font-bold" : ""}`}
            onClick={() => setActiveTab("chats")}
          >
            Chats
          </button>
          <button
            className={`p-2 ${activeTab === "groups" ? "font-bold" : ""}`}
            onClick={() => setActiveTab("groups")}
          >
            Groups
          </button>
        
        </div>

        <div>
          {(activeTab === "chats" ? chats : groups).map((chat) => (
            <div
              key={chat.id}
              className="p-3 border-b cursor-pointer hover:bg-gray-200"
              onClick={() => handleSelectChat(chat)}
            >
              <p className="font-semibold">{chat.name}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Chat Window */}
      <div className="w-2/3 flex flex-col h-[calc(100vh-4rem)]">
        {selectedChat ? (
          <div className="flex flex-col h-full">
            <div className="p-4 bg-gray-200 font-bold border-b">{selectedChat.name}</div>
            <div className="flex-grow p-4 overflow-auto">
              {messages.map((msg) => (
                <div key={msg.id} className="mb-2">
                  <span className="font-bold">{msg.sender}:</span> {msg.text}
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-grow p-2 border rounded"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white p-2 rounded">
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
