const Complaint = require('../models/Complaint');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// @desc    Get AI daily briefing based on real data
// @route   GET /api/ai/officer-summary
// @access  Private (Officer)
const getAIBriefing = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const totalComplaints = await Complaint.countDocuments();
    const newToday = await Complaint.countDocuments({ createdAt: { $gte: today } });
    const resolvedThisWeek = await Complaint.countDocuments({ status: 'Resolved', updatedAt: { $gte: weekAgo } });
    const criticalComplaints = await Complaint.countDocuments({ priority: 'CRITICAL', status: { $ne: 'Resolved' } });
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    
    // Calculate average satisfaction score
    const feedbacks = await Complaint.find({ status: 'Resolved', feedbackGiven: true });
    let averageSatisfaction = null;
    let totalFeedback = 0;
    if (feedbacks.length > 0) {
      const sum = feedbacks.reduce((acc, curr) => acc + curr.feedbackRating, 0);
      averageSatisfaction = (sum / feedbacks.length).toFixed(1);
      totalFeedback = feedbacks.length;
    }

    let analysis = '';

    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const prompt = `You are a concise government operations assistant. Summarize these civic complaint statistics in 3-5 plain English sentences for an officer's daily briefing dashboard. Focus on what needs immediate attention. Do not use markdown. Statistics: Total Complaints: ${totalComplaints}, New Today: ${newToday}, Critical Unresolved: ${criticalComplaints}, Pending Review: ${pending}, In Progress: ${inProgress}, Resolved Past 7 Days: ${resolvedThisWeek}.`;
        
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
          const result = await model.generateContent(prompt);
          analysis = result.response.text().trim();
        } catch(e) {
          if (e.status === 503 || String(e).includes('503')) {
            console.log("gemini-flash-latest overloaded, trying gemini-2.5-flash fallback...");
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await fallbackModel.generateContent(prompt);
            analysis = result.response.text().trim();
          } else {
            throw e; // rethrow to outer catch
          }
        }
      } catch(e) {
        console.error("Gemini API Error:", e);
        analysis = "AI briefing is currently unavailable due to a service error. Details: " + (e.message || String(e));
      }
    } else {
      analysis = "AI briefing is currently unavailable. (Missing GEMINI_API_KEY)";
    }

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalComplaints,
          newToday,
          resolvedThisWeek,
          criticalComplaints,
          pending,
          inProgress,
          averageSatisfaction,
          totalFeedback
        },
        aiSummary: analysis
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAIBriefing };
