import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react'; // Import useState hook if not already imported
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import BecomeAMember from './pages/BecomeAMember'
import BecomeAProfessor from './pages/BecomeAProfessor'
import { AuthProvider } from './utilities/AuthContext';
import DataList from './components/DataList';
import PrivateRoute from './PrivateRoute';
import Profile from './pages/Profile';
import HomePage from './pages/HomePage';
import Messages from './pages/Messages';
import Connections from './pages/Connections'

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Routes>
          <Route exact path="/signup" element={<SignUp />} />
          <Route exact path="/login" element={<Login />} />
          {/* <Route exact path='/profile' element={<PrivateRoute/>}>
            <Route exact path='/profile' element={<Profile/>}/>
          </Route> */}
          <Route path='/profile/:userName' element={<Profile/>}/>
          <Route exact path='/' element={<PrivateRoute/>}>
            <Route exact path="/" element={<Messages />} />
          </Route>
          <Route exact path="/becomeamember" element={<BecomeAMember />} />
          <Route exact path="/becomeaprofessor" element={<BecomeAProfessor />} />
          <Route exact path="/datalist" element={<DataList/>} />
          <Route exact path="/connections" element={<Connections/>}/>
          {/* <Route path="/home" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/home" />}/> */}
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
