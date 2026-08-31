import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { showError } from '../utils/alert';
import { AuthContext } from './AuthContext';

export const ComplaintContext = createContext();

export const ComplaintProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/mine');
      setMyComplaints(res.data.complaints);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
    if (user && user.role === 'citizen') {
      fetchMyComplaints();
    }
  }, [user]);

  const reportComplaint = async (data) => {
    let payload;
    let config = {};
    if (data.photo) {
      payload = new FormData();
      payload.append('title', data.title);
      payload.append('description', data.description);
      payload.append('category', data.category);
      payload.append('area', data.area);
      if (data.confirmDuplicate) payload.append('confirmDuplicate', data.confirmDuplicate);
      payload.append('photo', data.photo);
      // Let the browser automatically set Content-Type with the correct boundary
    } else {
      payload = { ...data };
      delete payload.photo;
    }

    const res = await api.post('/complaints', payload, config);
    setComplaints([res.data.complaint, ...complaints]);
    if (user && user.role === 'citizen') {
      setMyComplaints([res.data.complaint, ...myComplaints]);
    }
    return res.data;
  };

  const upvoteComplaint = async (id) => {
    try {
      const res = await api.patch(`/complaints/${id}/upvote`);
      const updated = res.data.complaint;
      setComplaints(complaints.map(c => c._id === id ? updated : c));
      setMyComplaints(myComplaints.map(c => c._id === id ? updated : c));
      return updated;
    } catch (err) {
      if (err.response?.status === 400) {
        // Just visually update if they already upvoted but frontend didn't know
        console.log('Already upvoted');
      } else {
        showError(err.response?.data?.message || 'Error upvoting complaint');
      }
      throw err;
    }
  };

  const updateStatus = async (id, status, officerRemark) => {
    const res = await api.patch(`/complaints/${id}/status`, { status, officerRemark });
    const updated = res.data.complaint;
    setComplaints(complaints.map(c => c._id === id ? updated : c));
    return updated;
  };

  const addFeedback = async (id, feedbackRating, feedbackComment) => {
    const res = await api.patch(`/complaints/${id}/feedback`, { feedbackRating, feedbackComment });
    const updated = res.data.complaint;
    setComplaints(complaints.map(c => c._id === id ? updated : c));
    setMyComplaints(myComplaints.map(c => c._id === id ? updated : c));
    return updated;
  };

  return (
    <ComplaintContext.Provider value={{
      complaints,
      myComplaints,
      loading,
      fetchComplaints,
      fetchMyComplaints,
      reportComplaint,
      upvoteComplaint,
      updateStatus,
      addFeedback
    }}>
      {children}
    </ComplaintContext.Provider>
  );
};
