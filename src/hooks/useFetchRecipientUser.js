import { useState, useEffect } from "react";
import { baseUrl, getRequest } from "../utils/Services";

export const UseFetchRecipientUser = (chat, user) => {
  const [recipientUser, setRecipientUser] = useState(null);
 
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const recipientId = chat?.members?.find((id) => id !== user?._id);

  useEffect(() => {
    const getUser = async () => {
      if (!recipientId) {
        setIsLoading(false);
        return;
      }
      const response = await getRequest(`${baseUrl}/users/${recipientId}`);
      if (response.error) {
        setError(response.error);
      } else {
        setRecipientUser(response);
      }
      setIsLoading(false);
    };
    getUser();
  }, [recipientId]);

  return {
    recipientUser,
    error,
    isLoading
  };
};
