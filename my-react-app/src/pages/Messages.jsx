import React, { useState, useEffect, useRef } from "react";
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
    where,
    updateDoc
} from "../firebase";  
import {arrayRemove, deleteDoc} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useLocation } from "react-router-dom";
import CreateGroupModal from "../components/CreateGroupModal"
import AddMembersModal from "../components/AddMembersModal"

const fullNameCache = {}; 
const getFullNameByUserName = async (userName) => {
  try {
    const collections = ["Users", "Professors", "admin"];
    
    for (const collectionName of collections) {
      const colRef = collection(db, collectionName);
      const q = query(colRef, where("userName", "==", userName));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return snapshot.docs[0].data().name; // Return the first matching document's name
      }
    }
    
    return "Unknown User"; // Return a default value if no match is found
  } catch (error) {
    console.error("Error fetching full name:", error);
    return "Unknown User";
  }
};

const FullNameDisplay = ({ userName }) => {
  // console.log("Cache:",fullNameCache);
  const [fullName, setFullName] = useState(fullNameCache[userName] || "Loading...");
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!userName || userName === "Unknown User") return;

    if (fullNameCache[userName]) {
      setFullName(fullNameCache[userName]);
      return;
    }

    getFullNameByUserName(userName).then((name) => {
      if (isMounted.current) {
        fullNameCache[userName] = name;
        setFullName(name);
      }
    });

    return () => {
      isMounted.current = false;
    };
  }, [userName]);

  return <>{fullName}</>;
};

const handleRemoveParticipant = async(selectedChat,userId) => {
  // You can later call your API here too
  console.log("Removing participant with ID:", userId);
  try {
    const chatRef = doc(db, "groups", selectedChat.id); // "chats" is the collection, and selectedChat.id is the document ID of the chat
    console.log("R", userId);
    await updateDoc(chatRef, {
      participants: arrayRemove(userId), // Removes the userId from the participants array
    });
    console.log("Removed participant with ID:", userId);
  } catch (error) {
    console.error("Error removing participant: ", error);
  }
  return;
};


const MessagesPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("chats");
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [requestedUserName, setRequestedUserName] = useState(location.state?.userName || null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [connections, setConnections] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);


  const isAdmin = localStorage.getItem("isAdmin");


  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const collections = ["Users", "Professors", "admin"];
          let currentUserData = null;

          for (const collectionName of collections) {
            const colRef = collection(db, collectionName);
            const q = query(colRef, where("uid", "==", user.uid));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
              if(collectionName == "Professors"){
                setIsProfessor(true);
              }
              currentUserData = snapshot.docs[0].data();
              break;
            }
          }

          setCurrentUser(currentUserData); //  Updates state asynchronously
          console.log("Fetched Current User Data:", currentUserData);

        } catch (error) {
          console.error("Error fetching currentUser data:", error);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log("Updated Current User:", currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;
  
    const fetchChatsAndConnections = async () => {
      try {
        const connectionRef = collection(db, "connectionRequests");
  
        //  Fetch confirmed individual connections
        const [confirmedSnapshot1, confirmedSnapshot2] = await Promise.all([
          getDocs(query(connectionRef, where("status", "==", "accepted"), where("receiver", "==", currentUser.userName))),
          getDocs(query(connectionRef, where("status", "==", "accepted"), where("sender", "==", currentUser.userName)))
        ]);
  
        //  Store all accepted individual connections
        console.log("Confirmed Connections 1:", confirmedSnapshot1.docs);
        console.log("Confirmed Connections 2:", confirmedSnapshot2.docs);
        const allConnections = [
          ...confirmedSnapshot1.docs.map(doc => ({ id: doc.id, userName: doc.data().sender })),
          ...confirmedSnapshot2.docs.map(doc => ({ id: doc.id, userName: doc.data().receiver }))
        ];
  
        //  Set individual connections state
        setConnections(allConnections);
  
        //  Fetch existing individual chats
        const chatsRef = collection(db, "chats");
        const chatQuery = query(chatsRef, where("participants", "array-contains", currentUser.userName));
        const chatSnapshot = await getDocs(chatQuery);
  
        //  Store individual chats in a Map (key: otherUserName, value: chatData)
        const chatMap = new Map();
        chatSnapshot.docs.forEach(doc => {
          const chatData = { id: doc.id, ...doc.data() };
          chatData.participants.forEach(userName => {
            if (userName !== currentUser.userName) {
              chatMap.set(userName, chatData);
            }
          });
        });
  
        //  Merge connections with existing individual chats (Create new chats if needed)
        const allChats = await Promise.all(
          allConnections.map(async (conn) => {
            let chatData = chatMap.get(conn.userName);
  
            if (!chatData) {
              //  Create new chat if not exists
              const newChatRef = await addDoc(collection(db, "chats"), {
                participants: [currentUser.userName, conn.userName],
                lastMessageAt: null,
              });
  
              chatData = {
                id: newChatRef.id,
                participants: [currentUser.userName, conn.userName],
                messages: [],
                user: conn.userName
              };
            } else {
              //  Fetch messages for existing individual chats
              const messagesRef = collection(db, "messages");
              const messagesQuery = query(messagesRef, where("chatId", "==", chatData.id), orderBy("createdAt"));
              const messagesSnapshot = await getDocs(messagesQuery);
  
              chatData.messages = messagesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
            }
  
            return chatData;
          })
        );
  
        //  Fetch existing group chats
        const groupsRef = collection(db, "groups");
        const groupQuery = query(groupsRef, where("participants", "array-contains", currentUser.userName));
        const groupSnapshot = await getDocs(groupQuery);
  
        //  Store groups and their messages
        const allGroups = await Promise.all(
          groupSnapshot.docs.map(async (doc) => {
            const groupData = { id: doc.id, ...doc.data() };
  
            //  Fetch messages for group chats from the `groupMessages` collection
            const messagesRef = collection(db, "groupMessages");
            const messagesQuery = query(messagesRef, where("groupId", "==", groupData.id), orderBy("createdAt"));
            const messagesSnapshot = await getDocs(messagesQuery);
  
            groupData.messages = messagesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
  
            return groupData;
          })
        );
  
        //  Update state for both individual chats and groups
        setChats(allChats);      // Individual chats
        setGroups(allGroups);    // Group chats
  
      } catch (error) {
        console.error("Error fetching connections, individual chats, and group chats:", error);
      }
    };
  
    //  Fetch initially & every 5 seconds
    fetchChatsAndConnections();
    const intervalId = setInterval(fetchChatsAndConnections, 1000);
  
    //  Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [currentUser]);
    
  
  // Log updated chats AFTER state update
  useEffect(() => {
    console.log("Updated Chats:", chats);
  }, [chats]);
  
  useEffect(() => {
    console.log("Updated Groups:", groups);
  }, [groups]);
  
  // useEffect(() => {
  //   if (!currentUser) return;
  
  //   //  Listen for real-time chat updates
  //   const chatsRef = collection(db, "chats");
  //   const q = query(chatsRef, where("participants", "array-contains", currentUser.uid), orderBy("lastMessageAt", "desc"));
  
  //   const unsubscribeChats = onSnapshot(q, (snapshot) => {
  //     setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  //   });
  
  //   //  Listen for real-time group updates
  //   const groupsRef = collection(db, "groups");
  //   const qGroups = query(groupsRef, where("participants", "array-contains", currentUser.uid));
  //   const unsubscribeGroups = onSnapshot(qGroups, (snapshot) => {
  //     setGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  //   });
  
  //   return () => {
  //     unsubscribeChats();
  //     unsubscribeGroups();
  //   };
  // }, [currentUser]);
  


  useEffect(() => {
    if (!selectedChat) return;
    const q = query(collection(db, `chats/${selectedChat.id}/messages`), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [selectedChat]);

  const allocateNewChatId = async (chat) => {
    try {
      const newChatRef = await addDoc(collection(db, "chats"), {
        participants: chat.participants,
        lastMessageAt: new Date(),
        messages: [],
      });
      return newChatRef.id;
    } catch (error) {
      console.error("Error allocating new chat ID:", error);
      return null;
    }
  };

  useEffect(() => {
    if (requestedUserName && currentUser) {
        handleSelectChatByUserName(requestedUserName);
        setRequestedUserName(null);
    }
  }, [requestedUserName, currentUser]);  // Trigger whenever currentUser updates



  useEffect(() => {
    if (!selectedChat || !selectedChat.id) return;
    const chatRef = doc(db, "groups", selectedChat.id);

    // Real-time listener for updates to the chat participants
    const unsubscribe = onSnapshot(chatRef, (docSnap) => {
      if (docSnap.exists()) {
        // If the document exists, update the participants
        setSelectedChat((prevChat) => ({
          ...prevChat,
          participants: docSnap.data().participants,
        }));
      }
    });

    return () => unsubscribe(); // Clean up listener when component unmounts
  }, [selectedChat?.id]);

  // Function to update participants locally
  const handleAddMembers = (newMembers) => {
    setSelectedChat((prevChat) => ({
      ...prevChat,
      participants: [...prevChat.participants, ...newMembers],
    }));
  }

  const handleSelectChat = async (chat) => {
    console.log("Current User is professor:",isProfessor);
    console.log("The handleSelectChat is being invoked:",chat);
    console.log("Current User is professor:",isProfessor);
    console.log("Participants for chat:",chat.participants);
    if (!chat || !currentUser) return;
    
    console.log("Initial Chat:", chat);
  
    let updatedChat = { ...chat };
  
    if (!updatedChat.participants.includes(currentUser.uid)) {
      updatedChat.participants.push(currentUser.uid);
    }
  
    if (!updatedChat.id) {
      updatedChat.id = await allocateNewChatId(updatedChat);
    }
  
    setSelectedChat(updatedChat);
  };
  
  
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !currentUser) return;
  
    let chatId = selectedChat.id;
  
    // If chatId does not exist, create a new chat
    if (!chatId) {
      if (!selectedChat.participants || selectedChat.participants.length < 2) {
        console.error("Error: Invalid participants", selectedChat.participants);
        return; // Prevent creating an invalid chat
      }
      console.log("Selected Chat:",selectedChat);
      try {
        // Create a new chat document in Firestore
        const newChatRef = await addDoc(collection(db, "chats"), {
          participants: selectedChat.participants, // Ensure it's a valid array
          lastMessageAt: new Date(),
        });
  
        chatId = newChatRef.id; //  Correct way to get the Firestore document ID
      } catch (error) {
        console.error("Error creating new chat:", error);
        return;
      }
    }

    console.log("Final chatId:", chatId);

    try {
      // Reference to messages collection inside the chat
      const messageRef = collection(db, `chats/${chatId}/messages`);
      console.log("Message:", newMessage);
      console.log("Created At:", new Date());
      console.log("Sender Id:", currentUser.uid);
      console.log("Sender Name:", currentUser.name);
  
      await addDoc(messageRef, {
        text: newMessage,
        createdAt: new Date(),
        senderId: currentUser.uid,
        senderName: currentUser.name,
      });
  
      // Update chat metadata (last message timestamp)
      console.log("Chat-id is:",chatId);
      console.log("Selected Chat:",selectedChat);
      console.log("Current User:",currentUser);
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, { lastMessageAt: new Date() });
  
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const handleSelectChatByUserName = async (userName) => {
    console.log("Current User is professor:",isProfessor);
    console.log("Inside handleSelectChatByUserName:", userName);
    
    if (!userName) return;

    // Wait until currentUser is available
    if (!currentUser) {
        console.log("CurrentUser is not available yet. Waiting...");
        return;  // Exit the function and retry later when `currentUser` updates
    }

    console.log("CurrentUser:", currentUser);
    console.log("Here1");

    try {
        console.log("Here2");
        console.log("Searching for existing chat with:", userName);

        // Query Firestore to check if a chat already exists with the given userName
        const chatsRef = collection(db, "chats");
        const q = query(chatsRef, where("participants", "array-contains", currentUser.userName));
        const querySnapshot = await getDocs(q);

        let existingChat = null;

        querySnapshot.forEach((doc) => {
            const chatData = doc.data();
            if (chatData.participants.includes(userName)) {
                existingChat = { id: doc.id, ...chatData };
            }
        });

        if (existingChat) {
            console.log("Chat found:", existingChat);
            handleSelectChat(existingChat); // Call existing function with chat
        } else {
            console.log("No existing chat found, creating a new one...");

            // Create a new chat if not found
            const newChat = {
                participants: [currentUser.userName, userName],
                messages: [],
                createdAt: new Date(),
            };

            const docRef = await addDoc(collection(db, "chats"), newChat);
            const newChatWithId = { id: docRef.id, ...newChat };

            console.log("New chat created:", newChatWithId);
            handleSelectChat(newChatWithId); // Call existing function with new chat
        }
    } catch (error) {
        console.error("Error selecting chat:", error);
    }
};

const handleLeaveGroup = async (group) => {
  if (!window.confirm("Are you sure you want to leave this group?")) return;

  const groupRef = doc(db, "groups", group.id);

  try {
    // Remove user from participants array
    const updatedParticipants = group.participants.filter(
      (p) => p !== currentUser.userName
    );

    // If user is the admin, optionally prevent leaving or assign a new admin
    if (group.admin === currentUser.userName) {
      if (updatedParticipants.length === 0) {
        // Delete the group if no one is left
        await deleteDoc(groupRef);
        setSelectedChat(null);
        return;
      } else {
        // Assign new admin (first participant)
        await updateDoc(groupRef, {
          participants: updatedParticipants,
          admin: updatedParticipants[0],
        });
      }
    } else {
      // Just remove from participants
      await updateDoc(groupRef, {
        participants: updatedParticipants,
      });
    }

    setSelectedChat(null); // Exit the chat view
  } catch (error) {
    console.error("Failed to leave group:", error);
  }
};


  return (
    <div className="flex h-screen">
  {/* Left Sidebar (Chats & Groups) */}
  <div className="w-1/3 bg-gray-100 p-4 border-r">
    {/* Tabs */}
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

    {/* "Create Group" button - Only shown when in "Groups" tab */}
    {isProfessor && activeTab === "groups" && (
      <div className="mb-4">
        <button 
          onClick={() => setShowCreateGroupModal(true)}
          className="p-2 bg-blue-500 text-white rounded"
        >
          + Create Group
        </button>

        {showCreateGroupModal && <CreateGroupModal connections={connections} currentUser={currentUser} onClose={() => setShowCreateGroupModal(false)} />}
      </div>
    )}

    {/* Chat List */}
    <div>
      {(activeTab === "chats"
        ? chats.filter((chat) => currentUser && chat.participants.includes(currentUser.userName))
        : groups.filter((group) => currentUser && group.participants.includes(currentUser.userName))
      ).map((chatOrGroup) => (
        <div
          key={chatOrGroup.id || chatOrGroup.participants.join("-")}
          className="p-3 border-b cursor-pointer hover:bg-gray-200"
          onClick={() => handleSelectChat(chatOrGroup)}
        >
          <p className="font-semibold">
            {activeTab === "chats" ? (
              <FullNameDisplay 
                userName={chatOrGroup.participants.find((p) => p !== currentUser?.userName) || "Unknown User"} 
              />
            ) : (
              chatOrGroup.name // Show group name instead of individual participants
            )}
          </p>
        </div>
      ))}
    </div>
  </div>

  {/* Chat Window */}
  <div className="w-2/3 flex flex-col h-[calc(100vh-4rem)]">
    {selectedChat ? (
      <div className="flex flex-col h-full">
        {/* Chat or Participants Section */}
        <div
          className="p-4 bg-gray-200 font-bold border-b cursor-pointer hover:bg-gray-300"
          onClick={() => setShowParticipants(!showParticipants)}
        >
          {selectedChat.name || "Chat"}
        </div>
        {showParticipants ? (
  // Participants List
  <div className="flex flex-col flex-grow p-8 bg-gray-50">
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Participants</h2>
        {selectedChat.admin === currentUser.userName && (
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow"
            onClick={() => setIsAddMembersOpen(true)}
          >
            + Add Members
          </button>
        )}
      </div>

      <ul className="space-y-4">
        {selectedChat.participants
          .filter((participant) => participant !== currentUser.userName) // Hide current user
          .map((participant) => (
            <li
              key={participant}
              className="flex items-center justify-between bg-gray-100 p-4 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">
                  <FullNameDisplay userName={participant} />
                </span>
                {selectedChat.admin === participant && (
                  <span className="text-green-600 text-xs font-semibold ml-2">
                    (Admin)
                  </span>
                )}
              </div>
              {selectedChat.admin === currentUser.userName && (
                <button
                  className="text-red-500 hover:text-red-700 text-sm font-semibold"
                  onClick={() =>
                    handleRemoveParticipant(selectedChat, participant)
                  }
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        {/* Current user separately */}
        <li className="flex items-center justify-between bg-gray-200 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-semibold">
              <FullNameDisplay userName={currentUser.userName} /> (You)
            </span>
            {selectedChat.admin === currentUser.userName && (
              <span className="text-green-600 text-xs font-semibold ml-2">
                (Admin)
              </span>
            )}
          </div>
        </li>
        {selectedChat.participants.includes(currentUser.userName) && (
  <div className="mt-6 text-center">
    <button
      className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow"
      onClick={() => handleLeaveGroup(selectedChat)}
    >
      Leave Group
    </button>
  </div>
)}


      </ul>
    </div>
  </div>

) : (
  // Chat Messages Section
  <div className="flex-grow p-4 overflow-auto">
    {messages.length > 0 ? (
      messages.map((msg) => (
        <div key={msg.id} className="mb-2">
          <span className="font-bold">{msg.senderName}:</span> {msg.text}
        </div>
      ))
    ) : (
      <p className="text-gray-500">No messages yet</p>
    )}
  </div>
)}

{isAddMembersOpen && (
  <AddMembersModal
    selectedChat={selectedChat}
    connections={connections}
    onAddMembers={handleAddMembers}
    onClose={() => setIsAddMembersOpen(false)}
  />
)}

{!showParticipants && (
  <div className="p-4 border-t flex">
    <input
      type="text"
      placeholder="Type a message..."
      className="flex-grow p-2 border rounded"
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          sendMessage();
          setNewMessage(""); // Clear input after sending
        }
      }}
    />
    <button
      onClick={() => {
        sendMessage();
        setNewMessage(""); // Clear input after sending
      }}
      className="ml-2 bg-blue-500 text-white p-2 rounded"
    >
      Send
    </button>
  </div>
)}

        </div>
    ) : (
      <div className="flex-grow flex items-center justify-center">
        <p className="text-gray-500">Select a chat or group to start messaging</p>
      </div>
    )}
  </div>
</div>

  );
  
};

export default MessagesPage;
