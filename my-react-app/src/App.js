import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react'; // Import useState hook if not already imported
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import BecomeAMember from './pages/BecomeAMember'
import { AuthProvider } from './utilities/AuthContext';
import DataList from './components/DataList';
import PrivateRoute from './PrivateRoute';
import Profile from './pages/Profile';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Routes>
          {/* <Route exact path="/" element={<Home />} /> */}
          <Route exact path="/signup" element={<SignUp />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path='/profile' element={<PrivateRoute/>}>
            <Route exact path='/profile' element={<Profile/>}/>
          </Route>
          <Route exact path="/BecomeAMember" element={<BecomeAMember />} />
          <Route exact path="/datalist" element={<DataList/>} />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
