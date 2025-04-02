import React, {useState, useEffect} from 'react'
import { useNavigate  } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaBuilding } from 'react-icons/fa';
import { GiDiploma } from 'react-icons/gi';
import { db, auth } from "../firebase.js";
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import SchoolIcon from '@mui/icons-material/School';
import { IoIosBusiness } from 'react-icons/io';
import { MdEvent } from 'react-icons/md';
import { UserIcon } from '@heroicons/react/solid';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import {  AnimatePresence } from 'framer-motion';
import { MdOutlinePhone } from "react-icons/md";
import { AiOutlineLinkedin } from "react-icons/ai";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md";
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { AiOutlineNumber, AiOutlineMail, AiOutlinePhone, AiFillLinkedin, AiOutlineHome  } from 'react-icons/ai';
import { addDoc, getDoc, getDocs, collection, doc, updateDoc, query, where, serverTimestamp } from "firebase/firestore";
import {
    ref,
    uploadBytesResumable,
    getDownloadURL 
  } from "firebase/storage";
import {storage} from "../firebase.js"
import DataList from '../components/DataList.jsx';
import image from '../assets/profile_bck.png'
import { useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
};

const Section = ({ title, children }) => {

    
    const controls = useAnimation();
    const { ref, inView } = useInView();
  
    useEffect(() => {
      if (inView) {
        controls.start({ y: 0, opacity: 1 });
      } else {
        controls.start({ y: 50, opacity: 0 });
      }
    }, [controls, inView]);
  
    return (
      <motion.div
        ref={ref}
        className="ml-[230px] mt-5"
        initial={{ y: 50, opacity: 0 }}
        animate={controls}
        transition={{ duration: 0.5 }}
      >
        <p className="font-bold text-[35px]">{title}</p>
        {children}
      </motion.div>
    );
  };

const Profile = () => {
    const { userName } = useParams();
    
    const [isEditing, setIsEditing] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [profilePicture, setProfilePicture] = useState(null);
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    let dp = "/images/profile.jpeg";
    const [profileURL, setProfileURL] = useState(dp);
    const [urlIsProfessor, setUrlIsProfessor] = useState(false);
    const [urlIsAdmin, setUrlIsAdmin] = useState(false);  
    const [editedUser, setEditedUser] = useState({
        name: '',
        phone: '',
        userName: '',
        contrycode: '',
        college: '',
        country: '',
        hostel: '',
        linkedin: '',
        degree: '',
        department: '',
        passingYear: '',
        joiningYear: '',
        work_exp: [{}], 
        higherEducation: [{}],// Store work experience as an array
        others: '',
        profileURL: '',
        email: '',
        approved:false,
        primaryemail:"",
        additional_degree:"",
        por:"",
        placeofposting:"",
        additionalProfiles: "",
        suggestions:""
  
    });
    
    useEffect(() => {
        console.log("Inside authUser finding");
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
          if (authUser) {
            console.log("Inside authUser:",authUser);
            try {
              const collections = ["Users", "Professors", "admin"];
              let userData = null;
      
              for (const collectionName of collections) {
                const colRef = collection(db, collectionName);
                const q = query(colRef, where("uid", "==", authUser.uid));
                const snapshot = await getDocs(q);
      
                if (!snapshot.empty) {
                  userData = snapshot.docs[0].data();
                  break; // Stop checking once a match is found
                }
              }
      
              setUser(userData || authUser); // Fallback to auth user if not found in DB
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          } else {
            setUser(null);
          }
        });
        return () => unsubscribe();
      }, []);
    
      

    const navigate = useNavigate(); 
    const isAdmin = localStorage.getItem("isAdmin");
    const isProfessor = localStorage.getItem("isProfessor");
    console.log("Admin:",isAdmin);
    console.log("Professor:",isProfessor);
    useEffect(() => {
        console.log('Updated currentUser:', currentUser);
        renderProfileDetailsProfessor();
    }, [currentUser]);

    useEffect(() => {
        const fetchcurrentUser = async () => {
            try {
                console.log("Trying to fetch user data...");
    
                let foundUser = false;
    
                // First, check in Users collection
                const userColRef = collection(db, "Users");
                const userQuery = query(userColRef, where("userName", "==", userName));
    
                const userSnapshot = await getDocs(userQuery);
    
                if (!userSnapshot.empty) {
                    userSnapshot.forEach((doc) => {
                        console.log("User found in Users collection:", doc.data());
                        setCurrentUser(doc.data());
                        setProfileURL(doc.data().profileURL || "/images/profile.jpeg");
                        setUrlIsProfessor(false); 
                        setUrlIsAdmin(false);      
                    });
                    foundUser = true;
                }
    
                // If not found in Users, check Professors collection
                if (!foundUser) {
                    console.log("User not found in Users collection. Checking Professors...");
    
                    const profColRef = collection(db, "Professors");
                    const profQuery = query(profColRef, where("userName", "==", userName));
    
                    const profSnapshot = await getDocs(profQuery);
    
                    if (!profSnapshot.empty) {
                        profSnapshot.forEach((doc) => {
                            console.log("User found in Professors collection:", doc.data());
                            setCurrentUser(doc.data());
                            setProfileURL(doc.data().profileURL || "/images/profile.jpeg");
                            console.log("Marking url as a professor");
                            setUrlIsProfessor(true);   // ✅ Mark as Professor
                            setUrlIsAdmin(false);      // ✅ Not an admin
                        });
                        foundUser = true;
                    }
                }
    
                // If not found in Users or Professors, check Admins collection
                if (!foundUser) {
                    console.log("User not found in Professors collection. Checking Admins...");
    
                    const adminColRef = collection(db, "Admins");
                    const adminQuery = query(adminColRef, where("userName", "==", userName));
    
                    const adminSnapshot = await getDocs(adminQuery);
    
                    if (!adminSnapshot.empty) {
                        console.log("User found in Admins collection.");
                        setUrlIsAdmin(true);  // ✅ Mark as Admin
                    } else {
                        console.log("User not found in Admins collection either.");
                    }
                }
    
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
    
        fetchcurrentUser();
    }, [userName]); // ✅ Runs when userName changes
    
    useEffect(() => {
        console.log("Updated user:", user);
      }, [user]);
      
      useEffect(() => {
        console.log("Updated currentUser:", currentUser);
      }, [currentUser]);
      
    
    

    const handleEditClick = () => {
        setIsEditing(!isEditing);

        // Initialize editedUser with the fetched user data when entering edit mode
        setEditedUser({
            name: currentUser?.name || '',
            userName: currentUser?.userName || '',
            email: currentUser?.email || '',
            phone: currentUser?.phone || '',
            institute: currentUser?.institute || '',
            college: currentUser?.college || '',
            linkedin: currentUser?.linkedin || '',
            degree: currentUser?.degree || '',
            department: currentUser?.department || '',
            passingYear: currentUser?.passingYear || '',
            work_exp: currentUser?.work_exp || [{}],
            higherEducation: currentUser?.higherEducation || [{}],
            profilepic: currentUser?.profilePicture || '',
            profileURL: currentUser?.profileURL || '',
            primaryemail: currentUser?.primaryemail || '',
            additional_degree: currentUser?.additional_degree || '',
            por: currentUser?.por || '',
            placeofposting: currentUser?.placeofposting || '',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser({
            ...editedUser,
            [name]: value,
        });
    };

    const handleInputChangeWorkExp = (e, index) => {
        const { name, value } = e.target;
        const updatedWorkExp = [...editedUser.work_exp];
        updatedWorkExp[index] = { ...updatedWorkExp[index], [name]: value };
        setEditedUser({ ...editedUser, work_exp: updatedWorkExp });
    };
    
    const handleInputChangeHigherEdu = (e, index) => {
        const { name, value } = e.target;
        const updatedHigherEdu = [...editedUser.higherEducation];
        updatedHigherEdu[index] = { ...updatedHigherEdu[index], [name]: value };
        setEditedUser({ 
            ...editedUser, 
            higherEducation: updatedHigherEdu 
        });
    };

    const handleRemoveWorkExp = (index) => {
        // Remove the work experience at the specified index
        const updatedWorkExp = [...editedUser.work_exp];
        updatedWorkExp.splice(index, 1);
        setEditedUser({
            ...editedUser,
            work_exp: updatedWorkExp
        });
    };

    const handleAddWorkExp = () => {
        // Add an empty work experience object to the array
        setEditedUser({
            ...editedUser,
            work_exp: [...editedUser.work_exp, {}]
        });
    };

    const handleRemoveHighEdu = (index) => {
        // Remove the work experience at the specified index
        const updatedHighEdu = [...editedUser.higherEducation];
        updatedHighEdu.splice(index, 1);
        setEditedUser({
            ...editedUser,
            higherEducation: updatedHighEdu
        });
    };

    const handleAddHighEdu = () => {
        // Add an empty work experience object to the array
        setEditedUser({
            ...editedUser,
            higherEducation: [...editedUser.higherEducation, {}]
        });
    };

    const handleProfilePictureChange = (e) => {
        setProfilePicture(e.target.files[0]);
        console.log(profilePicture);
    };

    const handleSaveChanges = async () => {
        try {
            const userId = currentUser.userName;
            const userDocRef = doc(db, 'users', userId);
            const colRef = collection(db, 'Users');
            const q = query(colRef, where('userName', '==', userId));

            const querySnapshot = await getDocs(q);

            // Check if any documents match the query
            if (querySnapshot.size > 0) {
                // Get the reference to the first matching document
                const docRef = doc(db, 'Users', querySnapshot.docs[0].id);
                
                if (profilePicture) {
                    const storageRef = ref(storage,`/files/${currentUser.college}`)
                    console.log("stor ref: ",storageRef);
                    const uploadTask = uploadBytesResumable(storageRef, profilePicture);
                
                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {},
                        (err) => console.log(err),
                        async () => {
                            console.log("innnn");
                            const url = await getDownloadURL(uploadTask.snapshot.ref);
                            console.log("URL: ", url);
                            
                            // Update the profileURL in the editedUser object
                            const updatedEditedUser = { ...editedUser, profileURL: url };

                            // Update the document with the updatedEditedUser data
                            await updateDoc(docRef, updatedEditedUser);
                            setCurrentUser(updatedEditedUser);
                        }
                    ); 
                    console.log(profileURL);
                }
                else{
                    console.log("no photo");
                    console.log(editedUser);
                    await updateDoc(docRef, editedUser);
                    setCurrentUser(editedUser);
                }

            console.log('Document successfully updated!');
            } else {
            console.log('No documents found for the given query.');
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Error saving changes:', error);
        }
    };

    const renderYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear; year >= currentYear - 50; year--) {
            years.push(
                <option key={year} value={year}>
                    {year}
                </option>
            );
        }
        return years;
    };

    const handleSendConnectionRequest = async () => {
        if (!user || !currentUser || !currentUser.userName) {
            console.error("User not logged in");
            toast.error("Please login first",toastOptions);
            return;
        }
    
        try {
            const connectionRequestRef = collection(db, "connectionRequests"); // Reference to connectionRequests collection
            const querySnapshot = await getDocs(
                query(connectionRequestRef, 
                    where("sender", "==", user.userName),
                    where("receiver", "==", userName)
                )
            );
    
            // Check if a request already exists
            if (!querySnapshot.empty) {
                console.log("Connection request already sent!");
                toast.success("Connection request already sent!",toastOptions);
                return;
            }
    
            // If no duplicate request exists, add a new request
            await addDoc(connectionRequestRef, {
                sender: user.userName,
                receiver: userName,
                status: "pending", // Mark request as pending
                timestamp: serverTimestamp() // Store request time
            });
    
            console.log("Connection request sent successfully!");
            toast.success("Connection request sent successfully!",toastOptions);
        } catch (error) {
            console.error("Error sending connection request:", error);
            toast.error("Failed to send connection request.",toastOptions);
        }
    };
    
    

    // Define arrays for course and specialization options
    const courseOptions = ["B.Tech", "M.tech", "Ph.D.", "BSc", "MSc", "Dual Degree"];
    const specializationOptions = ["Computer Science", "Electrical", "Mechanical", "Chemical", "Civil", "Metallurgy and Materials", "Mathematics and Computing", "Engineering Physics", "AI", "Data Sience", "Bio-Medical", "Mathematics", "Humanaties", "Chemistry", "Physics"];

    // Array of country code options
    const countryCodeOptions = [
        { value: '+1', label: '+1 (USA)' },
        { value: '+44', label: '+44 (UK)' },
        { value: '+91', label: '+91 (India)' },
        // Add more options as needed
    ];

         

    function stringToColor(string) {
        let hash = 0;
        let i;
      
        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
          hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
      
        let color = '#';
      
        for (i = 0; i < 3; i += 1) {
          const value = (hash >> (i * 8)) & 0xff;
          color += `00${value.toString(16)}`.slice(-2);
        }
        /* eslint-enable no-bitwise */
      
        return color;
      }
      
      function stringAvatar(name) {
        return {
          sx: {
            bgcolor: stringToColor(name),
          },
          children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
        };
      }
      

    const renderProfileDetails = () => {
        // console.log("Here is currentUser",currentUser);
        // console.log("Here is current Username:",currentUser.userName);
        // console.log("Here is userName:",userName);
        console.log("Inside alumini view");
        return (
            <div>
                {currentUser ? (
                    <>
                      <div className='relative w-full h-[300px] mt-0'>
                      <div
                          className='absolute inset-0 bg-cover bg-center'
                          style={{ backgroundImage: `url(${image})` }}
                      ></div>
                      <div className='absolute w-[200px] h-[200px] bg-white rounded-full border-4 border-white top-[300px] left-[300px] transform -translate-x-1/2 -translate-y-1/2'></div>
                      <div className='absolute w-[180px] h-[180px] bg-gray-300 rounded-full top-[300px] left-[300px] transform -translate-x-1/2 -translate-y-1/2 overflow-hidden border border-black'>
                          <img
                         src={profileURL}
                          alt='Photo'
                          className='object-cover w-full h-full'
                          />
                      </div>
                      </div>

                      <div className='flex flex-col gap-2 mt-[100px] ml-[230px]'>
                      <p className='font-bold text-[28px]'>
                            {currentUser.name || "Unknown"} {currentUser.userName && `(${currentUser.userName})`}
                        </p>
                        <div className='flex flex-row gap-[35px]'>
                        <p className='font-semibold text-[20px] flex flex-row gap-2'><MdOutlineEmail className='mt-1.5'/>{currentUser.email}</p>
                        <p className='font-semibold text-[20px] flex flex-row gap-2'><MdOutlinePhone className='mt-1.5'/>{currentUser.phone}</p>
                        </div>
                        <div className='flex flex-row gap-[35px]'>
                        <p className='font-semibold text-[20px] flex flex-row gap-2'><AiOutlineLinkedin className='mt-1.5'/>{currentUser.linkedin}</p>
                        <p className='font-semibold text-[20px] flex flex-row gap-2'><IoLocationOutline className='mt-1.5'/>{currentUser.placeofposting}</p>
                        </div>
                      </div>

                      <div className='flex items-center justify-center border-2 border-gray-200 w-[1300px] h-0 ml-[120px] mt-8'></div>
                      

    <Section title="Basic Details">
        <div className="flex flex-row gap-[160px]">
          <div className="flex flex-row gap-2 text-[21px] ml-[0px]">
            <p className="font-semibold">College:</p>
            <p className="font-normal">{currentUser.college}</p>
          </div>
          <div className="flex flex-row gap-2 text-[21px] ml-[30px]">
            <p className="font-semibold">Degree:</p>
            <p className="font-normal">{currentUser.degree}</p>
          </div>
        </div>
        <div className="flex flex-row gap-[160px]">
          <div className="flex flex-row gap-2 text-[21px] ml-[0px]">
            <p className="font-semibold">Department:</p>
            <p className="font-normal">{currentUser.department}</p>
          </div>
          <div className="flex flex-row gap-2 text-[21px] ml-[30px]">
            <p className="font-semibold">Passing Year:</p>
            <p className="font-normal">{currentUser.passingYear}</p>
          </div>
        </div>
      </Section>

      <div className="flex items-center justify-center border-2 border-gray-200 w-[1300px] h-0 ml-[120px] mt-8"></div>

      <Section title="Higher Education">
        {Array.isArray(currentUser.higherEducation) && currentUser.higherEducation.length > 0 ? (
          <ul className="list-disc pl-4">
            {currentUser.higherEducation.map((highEdu, index) => (
              <li
                key={index}
                className="mb-6 border border-gray-200 rounded-md p-4 flex flex-row justify-between mr-[170px]"
              >
                <div>
                  <h3 className="text-lg font-semibold">{highEdu.degree}</h3>
                  <h4 className="text-sm text-gray-500">{highEdu.department}</h4>
                  <p className="text-sm text-gray-500">{highEdu.institute}</p>
                </div>
                <div className="flex flex-row justify-center items-center">
                  <h5>
                    {highEdu.startYear}-{highEdu.endYear}
                  </h5>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No higher Education available</p>
        )}
      </Section>

      <div className="flex items-center justify-center border-2 border-gray-200 w-[1300px] h-0 ml-[120px] mt-8"></div>

      <Section title="Work Experience">
        {Array.isArray(currentUser.work_exp) && currentUser.work_exp.length > 0 ? (
          <ul className="list-disc pl-4">
            {currentUser.work_exp.map((workExp, index) => (
              <li
                key={index}
                className="mb-6 border border-gray-200 rounded-md p-4 flex flex-row justify-between mr-[170px]"
              >
                <div>
                  <h4 className="text-lg font-semibold">{workExp.job_title}</h4>
                  <p className="text-sm text-gray-500">{workExp.company}</p>
                </div>
                <div className="flex flex-col justify-center items-end">
                  <p className="text-sm text-gray-500">{workExp.duration}</p>
                </div>
                <div className="flex flex-row justify-center items-center">
                  <h5>
                    {workExp.startYear}-{workExp.endYear}
                  </h5>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No work experience available</p>
        )}
      </Section>
                    </>
                ): (
                            <p>Loading user data...</p>
                        )}
              

            </div>
        );
    };

    const renderProfileDetailsProfessor = () => {
        
        // console.log("Here is currentUser",currentUser);
        // console.log("Here is current Username:",currentUser.userName);
        // console.log("Here is userName:",userName);
        console.log("Inside Professors view");
        console.log("Here is userName:",userName);
        console.log("Here is current Username:",currentUser);
        console.log("Here is the user:",user);
        return (
            <div>
                {currentUser && user? (
                    <>
                      <div className='relative w-full h-[300px] mt-0'>
                      <div
                          className='absolute inset-0 bg-cover bg-center'
                          style={{ backgroundImage: `url(${image})` }}
                      ></div>
                      <div className='absolute w-[200px] h-[200px] bg-white rounded-full border-4 border-white top-[300px] left-[300px] transform -translate-x-1/2 -translate-y-1/2'></div>
                      <div className='absolute w-[180px] h-[180px] bg-gray-300 rounded-full top-[300px] left-[300px] transform -translate-x-1/2 -translate-y-1/2 overflow-hidden border border-black'>
                          <img
                         src={profileURL}
                          alt='Photo'
                          className='object-cover w-full h-full'
                          />
                      </div>
                      </div>

                      <div className='flex flex-col gap-2 mt-[100px] ml-[230px]'>
                      <p className='font-bold text-[28px]'>
                            {currentUser.name || "Unknown"} {currentUser.userName && `(${currentUser.userName})`}
                        </p>
                        <div className='flex flex-row gap-[35px]'>
                        <p className='font-semibold text-[20px] flex flex-row gap-2'><MdOutlineEmail className='mt-1.5'/>{currentUser.email}</p>
                        <p className='font-semibold text-[20px] flex flex-row gap-2'><MdOutlinePhone className='mt-1.5'/>{currentUser.phone}</p>
                        </div>
                        <div className='flex flex-row gap-[35px]'>
                        <p className='font-semibold text-[20px] flex flex-row gap-2'><AiOutlineLinkedin className='mt-1.5'/>{currentUser.linkedin}</p>
                        <p className='font-semibold text-[20px] flex flex-row gap-2'><IoLocationOutline className='mt-1.5'/>{currentUser.placeofposting}</p>
                        </div>
                        <div className='flex flex-row gap-[35px]'>
                        {user?.userName !== userName && (
                        <div className="mt-1.5">  
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded-md text-lg font-semibold hover:bg-blue-700 transition-all"
                                onClick={handleSendConnectionRequest}
                            >
                                Request Connection
                            </button>
                        </div>
                    )}

                        </div>
                      </div>

                      <div className='flex items-center justify-center border-2 border-gray-200 w-[1300px] h-0 ml-[120px] mt-8'></div>
                      

                    <Section title="Basic Details">
                        <div className="flex flex-row gap-[160px]">
                        <div className="flex flex-row gap-2 text-[21px] ml-[0px]">
                            <p className="font-semibold">College:</p>
                            <p className="font-normal">{currentUser.college}</p>
                        </div>
                        <div className="flex flex-row gap-2 text-[21px] ml-[30px]">
                            <p className="font-semibold">Department:</p>
                            <p className="font-normal">{currentUser.department}</p>
                        </div>
                        </div>
                    </Section>

                    <div className="flex items-center justify-center border-2 border-gray-200 w-[1300px] h-0 ml-[120px] mt-8"></div>

                    
                                </>
                            ): (
                                        <p>Loading user data...</p>
                                    )}
                            

                        </div>
                            );
                    };

    const renderEditProfileForm = () => {
        
        return (
            <>
                <div className='w-full mt-0 h-[50px] bg-gray-200 flex flex-row items-center justify-center text-[25px] font-bold'>
                    Edit Profile
                </div>

                
                    
                    <div className='flex flex-col flex-grow mb-8 md:w-1/3 '>
                    
                    <div className='shadow-xl w-[1250px] ml-[140px] mt-[30px] flex flex-col items-center bg-slate-300 rounded-3xl'>
                        <div className="flex flex-row items-center  justify-center mb-2 mt-5 w-[220px] h-[50px] rounded-full bg-indigo-900 text-white">
                            <h3 className="text-3xl font-bold ">Basic Details</h3>
                        </div>

                        <div className='  flex flex-row mt-4 '>
                            <form>
                                <h2 className='ml-[20px]'>Upload Profile Photo</h2>
                                <input 
                                    name= "profilepic" 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleProfilePictureChange} 
                                    className='border border-gray-500 ml-[20px] w-[400px] bg-slate-100'
                                />
                            </form>
                            <div className="mb-1">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={editedUser.name}
                                    onChange={handleInputChange}
                                    className="w-[450px] px-4 py-2 mb-4 text-[20px] font-normal border border-gray-500 bg-slate-100 rounded-md focus:outline-none focus:border-indigo-500 ml-[200px] mt-5"
                                />
                            </div>
                        </div>
                        
                        <div className='  flex flex-row '>
                        <div className="mb-1">
                            <input
                                type="text"
                                name="college"
                                placeholder="College"
                                value={editedUser}
                                onChange={handleInputChange}
                                className="w-[400px] ml-[20px] px-4 py-2 mb-4 border border-gray-500 rounded-md focus:outline-none focus:border-indigo-500 font-normal text-[20px] bg-slate-100"
                            />
                        </div>

                        <div className="mb-1">
                            <input
                                type="text"
                                name="degree"
                                placeholder="Degree"
                                value={editedUser.degree}
                                onChange={handleInputChange}
                                className="w-[450px] ml-[200px] px-4 py-2 mb-4 border border-gray-500 rounded-md focus:outline-none focus:border-indigo-500 overflow-y-auto font-normal text-[20px] bg-slate-100"
                            />
                        </div>
                        </div>

                        <div className='  flex flex-row '>
                        <div className="mb-1">
                            <input
                                type="text"
                                name="department"
                                placeholder="Department"
                                value={editedUser.department}
                                onChange={handleInputChange}
                                className="w-[400px] ml-[20px] px-4 py-2 mb-4 border border-gray-500 rounded-md focus:outline-none focus:border-indigo-500 overflow-y-auto font-normal text-[20px] bg-slate-100"
                            />
                        </div>

                        <div className="mb-1">
                            <select
                                type="year"
                                name="passingYear"
                                value={editedUser.passingYear}
                                onChange={handleInputChange}
                                className="w-[450px] ml-[200px] px-4 py-2 mb-4 border border-gray-500 rounded-md focus:outline-none focus:border-indigo-500 font-normal text-[20px] bg-slate-100"
                            >
                                <option value="">Select Year of Passing</option>
                                {renderYearOptions()}
                            </select>
                        </div>
                        </div>

                        <div className="mb-1">
                            <input
                                type="url"
                                name="linkedin"
                                placeholder="LinkedIN URL"
                                value={editedUser.linkedin}
                                onChange={handleInputChange}
                                className="w-[400px] px-4 py-2 mb-4 border border-gray-500 rounded-md focus:outline-none focus:border-indigo-500 overflow-y-auto font-normal text-[20px] bg-slate-100 "
                            />
                        </div>
                    </div>
                  
       
                    <div className='shadow-xl w-[950px] ml-[290px] mt-[30px] flex flex-col items-center bg-slate-300 rounded-3xl'>
                        <div className="flex flex-row items-center  justify-center mb-2 mt-5 w-[320px] h-[50px] rounded-full bg-indigo-900 text-white">
                            <h3 className="text-3xl font-bold ">Contact Information</h3>
                        </div>
                        <div className="flex flex-row mb-1 ">
                            <select
                                name="countryCode"
                                value={editedUser.countryCode}
                                onChange={handleInputChange}
                                className="w-1/1.5 px-4 py-2 mr-2 border border-gray-500 bg-slate-100 rounded-md focus:outline-none focus:border-indigo-500"
                            >
                                <option value="">Country Code</option>
                                {countryCodeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone No."
                                value={editedUser.phone}
                                onChange={handleInputChange}
                                className="w-[400px] px-4 bg-slate-100 py-2 border border-gray-500 font-normal text-[20px] rounded-md focus:outline-none focus:border-indigo-500 "
                            />
                        </div>

                        <div className="mb-1 mt-3 ">
                            <input
                                type="text"
                                name="address"
                                placeholder="Address"
                                value={editedUser.address}
                                onChange={handleInputChange}
                                className="w-[700px] h-[100px] px-4 py-2 mb-4 border border-gray-500 rounded-md focus:outline-none focus:border-indigo-500 font-normal text-[15px] bg-slate-100 "
                            />
                        </div>
                   </div>
                  

                    </div>
                    
                    
                        <div className='flex flex-row'>
                        <div className='flex flex-col flex-grow'>
                        <div className='shadow-xl w-[600px] ml-[140px] mt-[30px] flex flex-col items-center bg-slate-300 rounded-3xl'>
                        <div className="flex flex-row items-center  justify-center mb-2 mt-5 w-[320px] h-[50px] rounded-full bg-indigo-900 text-white">
                            <h3 className="text-3xl font-bold ">Higher Education</h3>
                        </div>
                            {editedUser.higherEducation.map((highEdu, index) => (
                                <div key={index} className="mb-4   bg-opacity-0.8 rounded-md p-4 mr-[50px]">
                                    
                                    <input
                                        type="text"
                                        name="institute"
                                        placeholder="Name of Institute"
                                        value={highEdu.institute || ''}
                                        onChange={(e) => handleInputChangeHigherEdu(e, index)}
                                        className="w-[400px] ml-[100px] px-4 py-2 mb-2 border bg-slate-100 border-gray-500 rounded-md focus:outline-none focus:border-indigo-500"
                                    />
                                    <div className="flex flex-row mb-2 space-x-4 mt-3">
                                        <input
                                            type="text"
                                            name="startYear"
                                            placeholder='Start Year'
                                            value={highEdu.startYear || ''}
                                            onChange={(e) => handleInputChangeHigherEdu(e, index)}
                                            className="w-[200px] ml-[100px] px-4 py-2 mb-2 border bg-slate-100 border-gray-500 rounded-md focus:outline-none focus:border-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            name="endYear"
                                            placeholder='End Year'
                                            value={highEdu.endYear || ''}
                                            onChange={(e) => handleInputChangeHigherEdu(e, index)}
                                            className="w-[200px] px-4 py-2 mb-2 border border-gray-500 bg-slate-100 rounded-md focus:outline-none focus:border-indigo-500 ml-[100px]"
                                        />
                                    </div>
                                

                                    <div className='flex flex-row space-x-1 ml-[100px]'>
                                        <select
                                            name="degree"
                                            value={highEdu.degree || ''}
                                            onChange={(e) => handleInputChangeHigherEdu(e, index)}
                                            className="w-1/1.5 px-4 py-2 mb-2 border border-gray-500 bg-slate-100 rounded-md focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="">Course</option>
                                            {courseOptions.map((option, i) => (
                                                <option key={i} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            name="department"
                                            value={highEdu.department || ''}
                                            onChange={(e) => handleInputChangeHigherEdu(e, index)}
                                            className="w-[350px] px-4 py-2 mb-2 border border-gray-500 bg-slate-100 rounded-md focus:outline-none focus:border-indigo-500 "
                                        >
                                            <option value="">Department</option>
                                            {specializationOptions.map((option, i) => (
                                                <option key={i} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <button
                                        onClick={() => handleRemoveHighEdu(index)}
                                        className="px-4 py-2  mt-3 hover:bg-slate-300 text-slate-700 rounded-md focus:outline-none border-4 border-indigo-900 transition duration-200 hover:rounded-full ml-[100px]"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}

                            <div className='flex flex-row justify-center'>
                                
                                <button 
                                    onClick={handleAddHighEdu}
                                    className="px-4 py-2 mb-[30px] ml-[35px] border-4 border-indigo-900  text-slate-700 rounded-md focus:outline-none  transition duration-200 hover:rounded-full hover:bg-slate-300"
                                >
                                    Add Higher Education
                                </button>
                            </div>

                        </div>
                        </div>

                        <div className='shadow-xl w-[600px] mr-[120px] mt-[30px] flex flex-col items-center bg-slate-300 rounded-3xl'>
                            <div className='flex flex-col  '>
                            <div className="flex flex-row items-center ml-[150px]  justify-center mt-5 w-[320px] h-[50px] rounded-full bg-indigo-900 text-white">
                            <h3 className="text-3xl font-bold ">Work Experience</h3>
                        </div>
                                {editedUser.work_exp.map((workExp, index) => (
                                    <div key={index} className=" ml-[70px] bg-opacity-0.8 rounded-md p-4">
                                        <input
                                            type="text"
                                            name="job_title"
                                            placeholder="Job Title"
                                            value={workExp.job_title || ''}
                                            onChange={(e) => handleInputChangeWorkExp(e, index)}
                                            className="w-[450px] border-gray-500 bg-slate-100 px-4 py-2 mb-2 border rounded-md focus:outline-none focus:border-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            name="company"
                                            placeholder="Company"
                                            value={workExp.company || ''}
                                            onChange={(e) => handleInputChangeWorkExp(e, index)}
                                            className="w-[450px] border-gray-500 bg-slate-100 px-4 py-2 mb-2 border rounded-md focus:outline-none focus:border-indigo-500 mt-3"
                                        />
                                        <div className="flex flex-row mb-2 space-x-4 mt-3">
                                            <input
                                                type="text"
                                                name="startYear"
                                                placeholder='Start Year'
                                                value={workExp.startYear || ''}
                                                onChange={(e) => handleInputChangeWorkExp(e, index)}
                                                className="w-[200px]  border-gray-500 bg-slate-100 px-4 py-2 mb-2 border rounded-md focus:outline-none focus:border-indigo-500"
                                            />
                                            <input
                                                type="text"
                                                name="endYear"
                                                placeholder='Start Year'
                                                value={workExp.endYear || ''}
                                                onChange={(e) => handleInputChangeWorkExp(e, index)}
                                                className="w-[200px] border-gray-500  bg-slate-100 px-4 py-2 mb-2 border rounded-md focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleRemoveWorkExp(index)}
                                            className="px-4 py-2 hover:bg-slate-300 text-slate-700 rounded-md focus:outline-none   hover:rounded-full transition duration-200 mt-3 border-4 border-indigo-900"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <div className='flex flex-row justify-center'>
                                   
                                    <button 
                                        onClick={handleAddWorkExp}
                                        className="px-4 py-2 mb-[30px] ml-[35px] border-4 border-indigo-900  text-slate-700 rounded-md focus:outline-none  transition duration-200 hover:rounded-full hover:bg-slate-300"
                                    >
                                        Add Work Experience
                                    </button>
                                </div>
                            </div>
                        </div>
                        </div>
                        

                    
                    <div className="mb-4 p-1 flex justify-center mt-10">
                        <button
                            className="bg-slate-100 text-slate-700 px-6 py-3 border-4 border-indigo-900 rounded-lg hover:rounded-full hover:bg-indigo-950 text-lg font-semibold hover:text-white"
                            onClick={handleSaveChanges}
                        >
                            Save Changes
                        </button>
                    </div>
                
            </>
            
        );
    };

    const renderEditProfileFormProfessor = () => {
        
        return (
            <>
                <div className='w-full mt-0 h-[50px] bg-gray-200 flex flex-row items-center justify-center text-[25px] font-bold'>
                    Edit Profile
                </div>

                
                    
                    <div className='flex flex-col flex-grow mb-8 md:w-1/3 '>
                    
                    <div className='shadow-xl w-[1250px] ml-[140px] mt-[30px] flex flex-col items-center bg-slate-300 rounded-3xl'>
                        <div className="flex flex-row items-center  justify-center mb-2 mt-5 w-[220px] h-[50px] rounded-full bg-indigo-900 text-white">
                            <h3 className="text-3xl font-bold ">Basic Details</h3>
                        </div>

                        <div className='  flex flex-row mt-4 '>
                            <form>
                                <h2 className='ml-[20px]'>Upload Profile Photo</h2>
                                <input 
                                    name= "profilepic" 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleProfilePictureChange} 
                                    className='border border-gray-500 ml-[20px] w-[400px] bg-slate-100'
                                />
                            </form>
                            <div className="mb-1">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={editedUser.name}
                                    onChange={handleInputChange}
                                    className="w-[450px] px-4 py-2 mb-4 text-[20px] font-normal border border-gray-500 bg-slate-100 rounded-md focus:outline-none focus:border-indigo-500 ml-[200px] mt-5"
                                />
                            </div>
                        </div>
                        
                        <div className='  flex flex-row '>
                        <div className="mb-1">
                            <input
                                type="text"
                                name="college"
                                placeholder="College"
                                value={editedUser}
                                onChange={handleInputChange}
                                className="w-[400px] ml-[20px] px-4 py-2 mb-4 border border-gray-500 rounded-md focus:outline-none focus:border-indigo-500 font-normal text-[20px] bg-slate-100"
                            />
                        </div>

                        <div className="mb-1">
                            <input
                                type="text"
                                name="degree"
                                placeholder="Degree"
                                value={editedUser.degree}
                                onChange={handleInputChange}
                                className="w-[450px] ml-[200px] px-4 py-2 mb-4 border border-gray-500 rounded-md focus:outline-none focus:border-indigo-500 overflow-y-auto font-normal text-[20px] bg-slate-100"
                            />
                        </div>
                        </div>

                        <div className='  flex flex-row '>
                        <div className="mb-1">
                            <input
                                type="text"
                                name="department"
                                placeholder="Department"
                                value={editedUser.department}
                                onChange={handleInputChange}
                                className="w-[400px] ml-[20px] px-4 py-2 mb-4 border border-gray-500 rounded-md focus:outline-none focus:border-indigo-500 overflow-y-auto font-normal text-[20px] bg-slate-100"
                            />
                        </div>

                        <div className="mb-1">
                            <select
                                type="year"
                                name="passingYear"
                                value={editedUser.passingYear}
                                onChange={handleInputChange}
                                className="w-[450px] ml-[200px] px-4 py-2 mb-4 border border-gray-500 rounded-md focus:outline-none focus:border-indigo-500 font-normal text-[20px] bg-slate-100"
                            >
                                <option value="">Select Year of Passing</option>
                                {renderYearOptions()}
                            </select>
                        </div>
                        </div>

                        <div className="mb-1">
                            <input
                                type="url"
                                name="linkedin"
                                placeholder="LinkedIN URL"
                                value={editedUser.linkedin}
                                onChange={handleInputChange}
                                className="w-[400px] px-4 py-2 mb-4 border border-gray-500 rounded-md focus:outline-none focus:border-indigo-500 overflow-y-auto font-normal text-[20px] bg-slate-100 "
                            />
                        </div>
                    </div>
                  
       
                    <div className='shadow-xl w-[950px] ml-[290px] mt-[30px] flex flex-col items-center bg-slate-300 rounded-3xl'>
                        <div className="flex flex-row items-center  justify-center mb-2 mt-5 w-[320px] h-[50px] rounded-full bg-indigo-900 text-white">
                            <h3 className="text-3xl font-bold ">Contact Information</h3>
                        </div>
                        <div className="flex flex-row mb-1 ">
                            <select
                                name="countryCode"
                                value={editedUser.countryCode}
                                onChange={handleInputChange}
                                className="w-1/1.5 px-4 py-2 mr-2 border border-gray-500 bg-slate-100 rounded-md focus:outline-none focus:border-indigo-500"
                            >
                                <option value="">Country Code</option>
                                {countryCodeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone No."
                                value={editedUser.phone}
                                onChange={handleInputChange}
                                className="w-[400px] px-4 bg-slate-100 py-2 border border-gray-500 font-normal text-[20px] rounded-md focus:outline-none focus:border-indigo-500 "
                            />
                        </div>

                        <div className="mb-1 mt-3 ">
                            <input
                                type="text"
                                name="address"
                                placeholder="Address"
                                value={editedUser.address}
                                onChange={handleInputChange}
                                className="w-[700px] h-[100px] px-4 py-2 mb-4 border border-gray-500 rounded-md focus:outline-none focus:border-indigo-500 font-normal text-[15px] bg-slate-100 "
                            />
                        </div>
                   </div>
                  

                    </div>
                    
                    
                        <div className='flex flex-row'>
                        <div className='flex flex-col flex-grow'>
                        <div className='shadow-xl w-[600px] ml-[140px] mt-[30px] flex flex-col items-center bg-slate-300 rounded-3xl'>
                        <div className="flex flex-row items-center  justify-center mb-2 mt-5 w-[320px] h-[50px] rounded-full bg-indigo-900 text-white">
                            <h3 className="text-3xl font-bold ">Higher Education</h3>
                        </div>
                            {editedUser.higherEducation.map((highEdu, index) => (
                                <div key={index} className="mb-4   bg-opacity-0.8 rounded-md p-4 mr-[50px]">
                                    
                                    <input
                                        type="text"
                                        name="institute"
                                        placeholder="Name of Institute"
                                        value={highEdu.institute || ''}
                                        onChange={(e) => handleInputChangeHigherEdu(e, index)}
                                        className="w-[400px] ml-[100px] px-4 py-2 mb-2 border bg-slate-100 border-gray-500 rounded-md focus:outline-none focus:border-indigo-500"
                                    />
                                    <div className="flex flex-row mb-2 space-x-4 mt-3">
                                        <input
                                            type="text"
                                            name="startYear"
                                            placeholder='Start Year'
                                            value={highEdu.startYear || ''}
                                            onChange={(e) => handleInputChangeHigherEdu(e, index)}
                                            className="w-[200px] ml-[100px] px-4 py-2 mb-2 border bg-slate-100 border-gray-500 rounded-md focus:outline-none focus:border-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            name="endYear"
                                            placeholder='End Year'
                                            value={highEdu.endYear || ''}
                                            onChange={(e) => handleInputChangeHigherEdu(e, index)}
                                            className="w-[200px] px-4 py-2 mb-2 border border-gray-500 bg-slate-100 rounded-md focus:outline-none focus:border-indigo-500 ml-[100px]"
                                        />
                                    </div>
                                

                                    <div className='flex flex-row space-x-1 ml-[100px]'>
                                        <select
                                            name="degree"
                                            value={highEdu.degree || ''}
                                            onChange={(e) => handleInputChangeHigherEdu(e, index)}
                                            className="w-1/1.5 px-4 py-2 mb-2 border border-gray-500 bg-slate-100 rounded-md focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="">Course</option>
                                            {courseOptions.map((option, i) => (
                                                <option key={i} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            name="department"
                                            value={highEdu.department || ''}
                                            onChange={(e) => handleInputChangeHigherEdu(e, index)}
                                            className="w-[350px] px-4 py-2 mb-2 border border-gray-500 bg-slate-100 rounded-md focus:outline-none focus:border-indigo-500 "
                                        >
                                            <option value="">Department</option>
                                            {specializationOptions.map((option, i) => (
                                                <option key={i} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <button
                                        onClick={() => handleRemoveHighEdu(index)}
                                        className="px-4 py-2  mt-3 hover:bg-slate-300 text-slate-700 rounded-md focus:outline-none border-4 border-indigo-900 transition duration-200 hover:rounded-full ml-[100px]"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}

                            <div className='flex flex-row justify-center'>
                                
                                <button 
                                    onClick={handleAddHighEdu}
                                    className="px-4 py-2 mb-[30px] ml-[35px] border-4 border-indigo-900  text-slate-700 rounded-md focus:outline-none  transition duration-200 hover:rounded-full hover:bg-slate-300"
                                >
                                    Add Higher Education
                                </button>
                            </div>

                        </div>
                        </div>

                        <div className='shadow-xl w-[600px] mr-[120px] mt-[30px] flex flex-col items-center bg-slate-300 rounded-3xl'>
                            <div className='flex flex-col  '>
                            <div className="flex flex-row items-center ml-[150px]  justify-center mt-5 w-[320px] h-[50px] rounded-full bg-indigo-900 text-white">
                            <h3 className="text-3xl font-bold ">Work Experience</h3>
                        </div>
                                {editedUser.work_exp.map((workExp, index) => (
                                    <div key={index} className=" ml-[70px] bg-opacity-0.8 rounded-md p-4">
                                        <input
                                            type="text"
                                            name="job_title"
                                            placeholder="Job Title"
                                            value={workExp.job_title || ''}
                                            onChange={(e) => handleInputChangeWorkExp(e, index)}
                                            className="w-[450px] border-gray-500 bg-slate-100 px-4 py-2 mb-2 border rounded-md focus:outline-none focus:border-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            name="company"
                                            placeholder="Company"
                                            value={workExp.company || ''}
                                            onChange={(e) => handleInputChangeWorkExp(e, index)}
                                            className="w-[450px] border-gray-500 bg-slate-100 px-4 py-2 mb-2 border rounded-md focus:outline-none focus:border-indigo-500 mt-3"
                                        />
                                        <div className="flex flex-row mb-2 space-x-4 mt-3">
                                            <input
                                                type="text"
                                                name="startYear"
                                                placeholder='Start Year'
                                                value={workExp.startYear || ''}
                                                onChange={(e) => handleInputChangeWorkExp(e, index)}
                                                className="w-[200px]  border-gray-500 bg-slate-100 px-4 py-2 mb-2 border rounded-md focus:outline-none focus:border-indigo-500"
                                            />
                                            <input
                                                type="text"
                                                name="endYear"
                                                placeholder='Start Year'
                                                value={workExp.endYear || ''}
                                                onChange={(e) => handleInputChangeWorkExp(e, index)}
                                                className="w-[200px] border-gray-500  bg-slate-100 px-4 py-2 mb-2 border rounded-md focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleRemoveWorkExp(index)}
                                            className="px-4 py-2 hover:bg-slate-300 text-slate-700 rounded-md focus:outline-none   hover:rounded-full transition duration-200 mt-3 border-4 border-indigo-900"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <div className='flex flex-row justify-center'>
                                   
                                    <button 
                                        onClick={handleAddWorkExp}
                                        className="px-4 py-2 mb-[30px] ml-[35px] border-4 border-indigo-900  text-slate-700 rounded-md focus:outline-none  transition duration-200 hover:rounded-full hover:bg-slate-300"
                                    >
                                        Add Work Experience
                                    </button>
                                </div>
                            </div>
                        </div>
                        </div>
                        

                    
                    <div className="mb-4 p-1 flex justify-center mt-10">
                        <button
                            className="bg-slate-100 text-slate-700 px-6 py-3 border-4 border-indigo-900 rounded-lg hover:rounded-full hover:bg-indigo-950 text-lg font-semibold hover:text-white"
                            onClick={handleSaveChanges}
                        >
                            Save Changes
                        </button>
                    </div>
                
            </>
            
        );
    };

    const [selectedOption, setSelectedOption] = useState('Home');

    return (
        
        <div>
        <ToastContainer />
        {/* Admin View */}
        {urlIsAdmin === true ? (
            <>
                {/* <h2 className="text-xl font-bold text-center">Admin Panel</h2> */}
                {isEditing ? renderEditProfileForm() : renderProfileDetails()}
                {!isEditing && currentUser !== null && currentUser.userName === userName && (
                    <div className="p-2 flex justify-center">
                        <button
                            className="bg-blue-900 text-white px-6 py-3 rounded-lg text-lg font-semibold mr-10"
                            onClick={handleEditClick}
                            disabled={isEditing}
                        >
                            Edit Profile
                        </button>
                    </div>
                )}
            </>
        ) : urlIsProfessor === true ? (
            <>
                {/* <h2 className="text-xl font-bold text-center">Professor Profile</h2> */}
                {isEditing ? renderEditProfileFormProfessor() : renderProfileDetailsProfessor()}
                {!isEditing && currentUser && user && user.userName === currentUser.userName && (
                    <div className="p-2 flex justify-center">
                        <button
                            className="bg-blue-900 text-white px-6 py-3 rounded-lg text-lg font-semibold mr-10"
                            onClick={handleEditClick}
                            disabled={isEditing}
                        >
                            Edit Profile
                        </button>
                    </div>
                )}
            </>
        ) : (
            <>
                {/* User Profile View */}
                {/* <h2 className="text-xl font-bold text-center">User Profile</h2> */}
                {isEditing ? renderEditProfileForm() : renderProfileDetails()}
                {console.log("Inside edit Profile user:", user) || console.log("Inside edit Profile currentUser:", currentUser) || 
                !isEditing && user !== null && currentUser !== null && user.userName === currentUser.userName && (
                <div className="p-2 flex justify-center">
                    <button
                    className="bg-blue-900 text-white px-6 py-3 rounded-lg text-lg font-semibold mr-10"
                    onClick={handleEditClick}
                    disabled={isEditing}
                    >
                    Edit Profile
                    </button>
                </div>
                )}

            </>
        )}
    </div>
    
             
    );
}

export default Profile