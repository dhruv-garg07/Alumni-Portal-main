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

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Routes>
          {/* <Route exact path="/" element={<Home />} /> */}
          <Route exact path="/signup" element={<SignUp />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/home" element={<HomePage />} />
          <Route exact path="/messages" element={<Messages />} />
          <Route exact path='/profile' element={<PrivateRoute/>}>
            <Route exact path='/profile' element={<Profile/>}/>
          </Route>
          <Route exact path="/becomeamember" element={<BecomeAMember />} />
          <Route exact path="/becomeaprofessor" element={<BecomeAProfessor />} />
          <Route exact path="/datalist" element={<DataList/>} />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
