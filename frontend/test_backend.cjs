const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  let citizenToken, officerToken, complaintId;
  
  const timestamp = Date.now();
  const citizenEmail = `citizen${timestamp}@test.com`;
  const officerEmail = `officer${timestamp}@test.com`;

  try {
    console.log('--- 1. Citizen Signup ---');
    const citizenRes = await axios.post(`${API_URL}/auth/signup`, {
      name: 'John Citizen',
      email: citizenEmail,
      password: 'password123',
      role: 'citizen'
    });
    citizenToken = citizenRes.data.token;
    console.log('Citizen Signup Success:', citizenRes.data.user);

    console.log('\n--- 2. Officer Signup ---');
    const officerRes = await axios.post(`${API_URL}/auth/signup`, {
      name: 'Jane Officer',
      email: officerEmail,
      password: 'password123',
      role: 'officer'
    });
    officerToken = officerRes.data.token;
    console.log('Officer Signup Success:', officerRes.data.user);

    console.log('\n--- 3. Create Complaint ---');
    const compRes = await axios.post(`${API_URL}/complaints`, {
      title: 'Pothole on Main St',
      category: 'Road',
      area: 'Downtown',
      description: 'Huge pothole damaging cars.'
    }, { headers: { Authorization: `Bearer ${citizenToken}` }});
    complaintId = compRes.data.complaint._id;
    console.log('Complaint Created:', compRes.data.complaint.title);

    console.log('\n--- 4. Duplicate Detection ---');
    try {
      await axios.post(`${API_URL}/complaints`, {
        title: 'Another Pothole',
        category: 'Road',
        area: 'Downtown',
        description: 'Pothole here too.'
      }, { headers: { Authorization: `Bearer ${citizenToken}` }});
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.log('Duplicate Detection Success:', err.response.data.message);
      } else {
        throw err;
      }
    }

    console.log('\n--- 5. Upvote Complaint ---');
    const upvoteRes = await axios.put(`${API_URL}/complaints/${complaintId}/upvote`, {}, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log('Upvoted. Score now:', upvoteRes.data.complaint.upvotes, upvoteRes.data.complaint.priorityScore);

    console.log('\n--- 6. Get Public Feed ---');
    const feedRes = await axios.get(`${API_URL}/complaints`);
    console.log('Feed count:', feedRes.data.complaints.length);

    console.log('\n--- 7. Get My Complaints ---');
    const myRes = await axios.get(`${API_URL}/complaints/my`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log('My Complaints count:', myRes.data.complaints.length);

    console.log('\n--- 8. AI Briefing (Officer) ---');
    const aiRes = await axios.get(`${API_URL}/ai/officer-summary`, {
      headers: { Authorization: `Bearer ${officerToken}` }
    });
    console.log('AI Briefing Stats:', aiRes.data.data.stats);

    console.log('\n--- 9. Officer Status Update ---');
    const statusRes = await axios.put(`${API_URL}/complaints/${complaintId}/status`, {
      status: 'Resolved',
      officerRemark: 'Fixed the pothole with fresh asphalt.'
    }, {
      headers: { Authorization: `Bearer ${officerToken}` }
    });
    console.log('Status updated:', statusRes.data.complaint.status, 'Remark:', statusRes.data.complaint.officerRemark, 'FeedbackPending:', statusRes.data.complaint.feedbackPending);

    console.log('\n--- 10. Citizen Feedback ---');
    const feedbackRes = await axios.put(`${API_URL}/complaints/${complaintId}/feedback`, {
      feedbackRating: 5,
      feedbackComment: 'Great fast job!'
    }, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log('Feedback Added:', feedbackRes.data.complaint.feedbackGiven);

    console.log('\n--- 11. CSV Export ---');
    const csvRes = await axios.get(`${API_URL}/complaints/export`, {
      headers: { Authorization: `Bearer ${officerToken}` }
    });
    console.log('CSV Export Length:', csvRes.data.length);

    console.log('\nALL API TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('ERROR:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

runTests();
