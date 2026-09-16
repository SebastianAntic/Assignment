import { INITIAL_CANDIDATES, INITIAL_USERS, INITIAL_INTERVIEWS, INITIAL_FEEDBACK } from './mockData.js';

const STORAGE_KEYS = {
  USERS: 'hiring_app_users',
  CANDIDATES: 'hiring_app_candidates',
  INTERVIEWS: 'hiring_app_interviews',
  FEEDBACK: 'hiring_app_feedback',
  SESSION: 'hiring_app_session'
};

export const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CANDIDATES)) {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(INITIAL_CANDIDATES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INTERVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(INITIAL_INTERVIEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FEEDBACK)) {
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(INITIAL_FEEDBACK));
  }
};

export const authService = {
  getCurrentSession: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  loginWithIdentifier: (identifier, role) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const cleaned = identifier.trim().toLowerCase();
    const isEmail = cleaned.includes('@');
    
    // Find user by email or phone number
    let user = users.find(u => {
      if (isEmail) {
        return u.email && u.email.toLowerCase() === cleaned;
      } else {
        const userPhoneClean = (u.phone || '').replace(/[\s\-\(\)\+]/g, '');
        const inputPhoneClean = cleaned.replace(/[\s\-\(\)\+]/g, '');
        return userPhoneClean && userPhoneClean.includes(inputPhoneClean);
      }
    });

    if (!user) {
      // Create new user account with identifier
      const generatedName = isEmail ? cleaned.split('@')[0] : `User_${cleaned.slice(-4)}`;
      user = {
        id: `usr_${Date.now()}`,
        name: generatedName.charAt(0).toUpperCase() + generatedName.slice(1),
        email: isEmail ? cleaned : `${cleaned}@company.com`,
        phone: isEmail ? '+1 (555) 000-0000' : identifier,
        role: role || 'Recruiter',
        title: role === 'Recruiter' ? 'Talent Acquisition Specialist' : 'Technical Evaluator',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      };
      users.push(user);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } else if (role && user.role !== role) {
      // Update role if selected explicitly
      user.role = role;
      const index = users.findIndex(u => u.id === user.id);
      if (index !== -1) users[index] = user;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    const token = btoa(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 }));
    const session = { user, token };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    return session;
  },

  loginById: (userId) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.id === userId) || INITIAL_USERS[0];
    const token = btoa(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 }));
    const session = { user, token };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    return session;
  },

  login: (email, role) => {
    return authService.loginWithIdentifier(email, role);
  },

  signup: (name, email, role, phone) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      phone: phone || '+1 (555) 000-0000',
      role,
      title: role === 'Recruiter' ? 'Recruiting Manager' : 'Technical Evaluator',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const token = btoa(JSON.stringify({ id: newUser.id, role: newUser.role, exp: Date.now() + 86400000 }));
    const session = { user: newUser, token };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    return session;
  },

  switchRole: (newRole) => {
    const session = authService.getCurrentSession();
    if (!session) return null;

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const updatedUser = { ...session.user, role: newRole };
    
    const userIndex = users.findIndex(u => u.id === session.user.id);
    if (userIndex !== -1) {
      users[userIndex].role = newRole;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    const token = btoa(JSON.stringify({ id: updatedUser.id, role: newRole, exp: Date.now() + 86400000 }));
    const updatedSession = { user: updatedUser, token };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedSession));
    return updatedSession;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
};

export const candidateService = {
  getAll: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CANDIDATES) || '[]');
  },

  getById: (id) => {
    const candidates = candidateService.getAll();
    return candidates.find(c => c.id === id);
  },

  add: (candidateData) => {
    const candidates = candidateService.getAll();
    const newCandidate = {
      id: `cand_${Date.now()}`,
      appliedDate: new Date().toISOString().split('T')[0],
      stage: 'Applied',
      rating: null,
      notes: '',
      interviewerId: null,
      ...candidateData
    };
    candidates.unshift(newCandidate);
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
    return newCandidate;
  },

  update: (id, updates) => {
    const candidates = candidateService.getAll();
    const index = candidates.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Candidate not found');

    candidates[index] = { ...candidates[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
    return candidates[index];
  },

  updateStage: (id, newStage) => {
    return candidateService.update(id, { stage: newStage });
  },

  delete: (id) => {
    const candidates = candidateService.getAll().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
  }
};

export const interviewService = {
  getAll: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INTERVIEWS) || '[]');
  },

  getByInterviewer: (interviewerId) => {
    const interviews = interviewService.getAll();
    return interviews.filter(i => i.interviewerId === interviewerId);
  },

  getByCandidate: (candidateId) => {
    const interviews = interviewService.getAll();
    return interviews.filter(i => i.candidateId === candidateId);
  },

  schedule: (data) => {
    const interviews = interviewService.getAll();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const candidate = candidateService.getById(data.candidateId);
    const interviewer = users.find(u => u.id === data.interviewerId);

    const newInterview = {
      id: `int_${Date.now()}`,
      candidateId: data.candidateId,
      candidateName: candidate ? candidate.name : 'Unknown Candidate',
      role: candidate ? candidate.role : 'Engineer',
      interviewerId: data.interviewerId,
      interviewerName: interviewer ? interviewer.name : 'Assigned Interviewer',
      scheduledAt: data.scheduledAt,
      status: 'Scheduled',
      meetingLink: data.meetingLink || 'https://meet.google.com/new-meeting',
      type: data.type || 'Technical Interview'
    };

    interviews.unshift(newInterview);
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(interviews));

    if (candidate) {
      candidateService.update(candidate.id, { interviewerId: data.interviewerId });
    }

    return newInterview;
  },

  updateStatus: (id, status) => {
    const interviews = interviewService.getAll();
    const index = interviews.findIndex(i => i.id === id);
    if (index !== -1) {
      interviews[index].status = status;
      localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(interviews));
    }
  }
};

export const feedbackService = {
  getAll: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FEEDBACK) || '[]');
  },

  getByCandidate: (candidateId) => {
    const feedbackList = feedbackService.getAll();
    return feedbackList.filter(f => f.candidateId === candidateId);
  },

  submit: (data) => {
    const feedbackList = feedbackService.getAll();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const interviewer = users.find(u => u.id === data.interviewerId);

    const newFeedback = {
      id: `fb_${Date.now()}`,
      candidateId: data.candidateId,
      interviewId: data.interviewId || null,
      interviewerId: data.interviewerId,
      interviewerName: interviewer ? interviewer.name : 'Interviewer',
      rating: Number(data.rating),
      recommendation: data.recommendation,
      comments: data.comments,
      createdAt: new Date().toISOString().split('T')[0]
    };

    feedbackList.unshift(newFeedback);
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbackList));

    if (data.candidateId) {
      const candidateFeedback = feedbackService.getByCandidate(data.candidateId);
      const avgRating = Math.round(candidateFeedback.reduce((acc, f) => acc + f.rating, 0) / candidateFeedback.length);
      candidateService.update(data.candidateId, { rating: avgRating });
    }

    return newFeedback;
  }
};

export const userService = {
  getAll: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }
};
