import { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc,deleteDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { toast } from "react-toastify";
import { CheckCircleIcon, XCircleIcon, EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const Connections = () => {
  const [user, setUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isProfessor, setIsProfessor] = useState(false);
  const navigate = useNavigate();

  const handleMessageClick = (userName) => {
    console.log("Got username:",userName);
    navigate("/", { state: { userName } });
};

  useEffect(() => {
    const checkIfProfessor = async () => {
      const q = query(collection(db, "Professors"), where("userName", "==", user.userName));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        setIsProfessor(true); // User is a professor
      }
    };
  
    if (user?.userName) {
      checkIfProfessor();
    }
  }, [user?.userName]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const collections = ["Users", "Professors", "admin"];
          let userData = null;

          for (const collectionName of collections) {
            const colRef = collection(db, collectionName);
            const q = query(colRef, where("uid", "==", currentUser.uid));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
              userData = snapshot.docs[0].data();
              break;
            }
          }

          setUser(userData || currentUser);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setPendingRequests([]);
        setConnections([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log("Inside fetch connections:", user);
    if (!user || !user.userName) return;

    const fetchConnectionsAndRequests = async () => {
        try {
            const connectionRef = collection(db, "connectionRequests");

            // Queries for accepted connections
            const confirmedQuery1 = query(
                connectionRef,
                where("status", "==", "accepted"),
                where("receiver", "==", user.userName)
            );

            const confirmedQuery2 = query(
                connectionRef,
                where("status", "==", "accepted"),
                where("sender", "==", user.userName)
            );

            // Query for pending connection requests (where the user is the receiver)
            const pendingQuery = query(
                connectionRef,
                where("status", "==", "pending"),
                where("receiver", "==", user.userName)
            );

            // Fetch data concurrently
            const [confirmedSnapshot1, confirmedSnapshot2, pendingSnapshot] = await Promise.all([
                getDocs(confirmedQuery1),
                getDocs(confirmedQuery2),
                getDocs(pendingQuery)
            ]);

            // Extract accepted connections
            const allConnections = [
                ...confirmedSnapshot1.docs.map(doc => ({
                    id: doc.id,
                    connectionName: doc.data().sender,
                    uid: doc.data().senderUid
                })),
                ...confirmedSnapshot2.docs.map(doc => ({
                    id: doc.id,
                    connectionName: doc.data().receiver,
                    uid: doc.data().receiverUid
                }))
            ];

            // Extract pending requests
            const allPendingRequests = pendingSnapshot.docs.map(doc => ({
                id: doc.id,
                sender: doc.data().sender,
                senderUid: doc.data().senderUid
            }));

            // Fetch college info for both connections and pending requests
            const fetchCollegeInfo = async (userNameParam) => {
                const collections = ["Users", "Professors", "admin"];
                console.log("Fetching college for:", userNameParam);
                for (const collectionName of collections) {
                    const colRef = collection(db, collectionName);
                    const q = query(colRef, where("userName", "==", userNameParam));
                    const snapshot = await getDocs(q);
                    if (!snapshot.empty) return snapshot.docs[0].data().college;
                }
                return "Unknown College";
            };

            // Fetch colleges in parallel
            const connectionsWithColleges = await Promise.all(
                allConnections.map(async (conn) => ({
                    ...conn,
                    college: await fetchCollegeInfo(conn.connectionName)
                }))
            );

            const pendingRequestsWithColleges = await Promise.all(
                allPendingRequests.map(async (req) => ({
                    ...req,
                    college: await fetchCollegeInfo(req.sender)
                }))
            );

            // Update state
            setConnections(connectionsWithColleges);
            setPendingRequests(pendingRequestsWithColleges);

        } catch (error) {
            console.error("Error fetching connections and pending requests:", error);
        }
    };

    fetchConnectionsAndRequests();
    const interval = setInterval(fetchConnectionsAndRequests, 10000);
    return () => clearInterval(interval);
}, [user]);


  const handleAcceptRequest = async (id) => {
    try {
      const requestRef = doc(db, "connectionRequests", id);
      await updateDoc(requestRef, { status: "accepted" });
  
      setPendingRequests((prev) => prev.filter((req) => req.id !== id));
      setConnections((prev) => [...prev, { id, sender: user.userName }]);
  
      toast.success("Connection accepted");
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast.error("Failed to accept connection");
    }
  };
  
  const handleIgnoreRequest = async (id) => {
    try {
      const requestRef = doc(db, "connectionRequests", id);
      await updateDoc(requestRef, { status: "ignored" });
  
      setPendingRequests((prev) => prev.filter((req) => req.id !== id));
      toast.info("Connection request ignored");
    } catch (error) {
      console.error("Error ignoring connection:", error);
      toast.error("Failed to ignore connection");
    }
  };
  

  const handleRemoveConnection = async (id) => {
    try {
      const requestRef = doc(db, "connectionRequests", id);
      await deleteDoc(requestRef); // Delete the document from Firestore
      setConnections((prev) => prev.filter((conn) => conn.id !== id));
      toast.info("Connection removed");
    } catch (error) {
      console.error("Error removing connection:", error);
      toast.error("Failed to remove connection");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 w-full">
      {!user ? (
        <p className="text-center text-gray-500">Please log in to view your connections</p>
      ) : (
        <>
          {/* Pending Requests */}
          {isProfessor && (
            <>
                <h2 className="text-2xl font-bold mb-4">Pending Requests</h2>
                {pendingRequests.length === 0 ? (
                <p className="text-gray-500">No pending requests</p>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingRequests.map((req) => (
                    <div key={req.id} className="flex items-center bg-white shadow-md rounded-lg p-4 w-full">
                        <img
                        src={req.profilePic || "/images.png"}
                        alt="Profile"
                        className="w-12 h-12 rounded-full mr-4"
                        />
                        <div className="flex-1">
                        <h3 className="text-lg font-semibold">{req.sender}</h3>
                        <p className="text-sm text-gray-600">{req.college || "Unknown College"}</p>
                        <p className="text-sm text-gray-500">{req.bio || "No bio available"}</p>
                        </div>
                        <div className="flex gap-2">
                        <button onClick={() => handleAcceptRequest(req.id)}>
                            <CheckCircleIcon className="w-6 h-6 text-green-600 hover:text-green-800" />
                        </button>
                        <button onClick={() => handleIgnoreRequest(req.id)}>
                            <XCircleIcon className="w-6 h-6 text-red-600 hover:text-red-800" />
                        </button>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </>
            )}

          

          {/* Connections List */}
          <h2 className="text-2xl font-bold mt-6 mb-4">Your Connections</h2>
          {connections.length === 0 ? (
            <p className="text-gray-500">No connections yet</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 w-full">
            {connections.map((conn) => (
                <div key={conn.id} className="flex items-center bg-white shadow-md rounded-lg p-4 w-full relative">
                <img
                    src={conn.profilePic || "/images.png"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full mr-4"
                />
                <div className="flex-1">
                    <h3 className="text-lg font-semibold">{conn.connectionName}</h3>
                    <p className="text-sm text-gray-600">{conn.college || "Unknown College"}</p>
                </div>

                {/* Message Button */}
                <button
                    onClick={() => handleMessageClick(conn.connectionName)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
                >
                    Message
                </button>

                {/* Three Dots for Dropdown */}
                <div className="relative ml-4">
                    <button onClick={() => setDropdownOpen(dropdownOpen === conn.id ? null : conn.id)}>
                    <EllipsisVerticalIcon className="w-6 h-6 text-gray-600 hover:text-gray-800" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {dropdownOpen === conn.id && (
                    <div className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-lg w-48">
                        <button
                        onClick={() => handleRemoveConnection(conn.id)}
                        className="block w-full text-left px-4 py-2 text-black hover:bg-gray-100"
                        >
                        Remove Connection
                        </button>
                    </div>
                    )}
                </div>
                </div>
            ))}
            </div>

          )}
        </>
      )}
    </div>
  );
};

export default Connections;
