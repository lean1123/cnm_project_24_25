import { useSelector } from 'react-redux';
import { Route, Routes } from 'react-router';
import './App.css';
import AdminPage from './components/admin/AdminPage';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import HomePage from './components/home/HomePage';

function App() {
  // Example of using useSelector to get data from Redux store
  const { user } = useSelector((state) => state.persistedReducer.userInfo);
  const role = user?.role === 'CUSTOMER' ? 'customer' : 'admin';

  return (
    <>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/profile" />
          <Route path="/updateProfile" />
          <Route path="/address" />
          <Route path="/">
            <Route index element={<HomePage />} />
          </Route>
          <Route path="*" element={<h1>404 Not Found</h1>} />
          {role === 'admin' && <Route path="admin/*" element={<AdminPage />} />}
        </Routes>
      </div>
    </>
  );
}

export default App;
