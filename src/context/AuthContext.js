import { createContext, useCallback, useState } from "react";
import { baseUrl } from "../utils/Services";
import { postRequest } from "../utils/Services";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [registerError, setRegisterError] = useState('');
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [registerInfo, setRegisterInfo] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: ""
  });
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setLoginLoading] = useState(false);

  const updateRegisterInfo = useCallback((info) => {
    setRegisterInfo(info);
  }, []);

  const updateLoginInfo = useCallback((info) => {
    setLoginInfo(info);
  }, []);

  const registerUser = useCallback(async (e) => {
    e.preventDefault();
    setIsRegisterLoading(true);
    setRegisterError('');
    
    try {
      const response = await postRequest(`${baseUrl}/users/register`, registerInfo);
      setIsRegisterLoading(false);
    
      if (response.error) {
        setRegisterError(response.message || 'An error occurred during registration!');
      }
    } catch (error) {
      setRegisterError('An error occurred during registration!');
    }
  }, [registerInfo]);

  const loginUser = useCallback(async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    
    try {
      const response = await postRequest(`${baseUrl}/users/login`, loginInfo);
      console.log(response)
      setLoginLoading(false);        
      if (response.error) {
        setLoginError(response.message || 'An error occurred during login!');
      } else {
        localStorage.setItem('User', JSON.stringify(response));
        setUser(response);
      }
    } catch (error) {
      setLoginError('An error occurred during login!');
    }
  }, [loginInfo]);

  const logoutUser = useCallback(() => {
    localStorage.removeItem("User");
    setUser(null);
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        registerInfo,
        updateRegisterInfo,
        registerUser,
        registerError,
        isRegisterLoading,
        logoutUser,
        loginInfo,
        updateLoginInfo,
        loginUser,
        loginError,
        isLoginLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
