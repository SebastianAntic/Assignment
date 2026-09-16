export const STAGES = [
  'Applied',
  'Screening',
  'Technical Interview',
  'HR Interview',
  'Offered',
  'Rejected',
  'Hired'
];

export const INITIAL_USERS = [
  {
    id: 'usr_recruiter_1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@company.com',
    phone: '+1 (555) 987-6543',
    role: 'Recruiter',
    title: 'Lead Talent Acquisition Partner'
  },
  {
    id: 'usr_interviewer_1',
    name: 'Alex Chen',
    email: 'alex.chen@company.com',
    phone: '+1 (555) 876-5432',
    role: 'Interviewer',
    title: 'Staff Frontend Engineer'
  },
  {
    id: 'usr_interviewer_2',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@company.com',
    phone: '+1 (555) 765-4321',
    role: 'Interviewer',
    title: 'Engineering Director'
  }
];

export const INITIAL_CANDIDATES = [
  {
    id: 'cand_1',
    name: 'David Miller',
    email: 'david.miller@example.com',
    phone: '+1 (555) 234-5678',
    role: 'Senior Full Stack Engineer',
    stage: 'Technical Interview',
    experience: '5+ years',
    location: 'San Francisco, CA',
    appliedDate: '2026-09-01',
    notes: 'Demonstrated strong proficiency in React architecture, TypeScript, and microservice design during preliminary review.',
    interviewerId: 'usr_interviewer_1',
    rating: 4
  },
  {
    id: 'cand_2',
    name: 'Emily Watson',
    email: 'emily.watson@example.com',
    phone: '+1 (555) 345-6789',
    role: 'Staff Frontend Engineer',
    stage: 'HR Interview',
    experience: '7+ years',
    location: 'New York, NY',
    appliedDate: '2026-08-28',
    notes: 'Exceptional background leading design system migrations and web performance initiatives.',
    interviewerId: 'usr_interviewer_2',
    rating: 5
  },
  {
    id: 'cand_3',
    name: 'Marcus Johnson',
    email: 'marcus.johnson@example.com',
    phone: '+1 (555) 456-7890',
    role: 'Backend Systems Engineer',
    stage: 'Screening',
    experience: '4 years',
    location: 'Austin, TX',
    appliedDate: '2026-09-08',
    notes: 'Specializes in Go, distributed queuing systems, and PostgreSQL query tuning.',
    interviewerId: 'usr_interviewer_1',
    rating: 3
  },
  {
    id: 'cand_4',
    name: 'Sophia Patel',
    email: 'sophia.patel@example.com',
    phone: '+1 (555) 567-8901',
    role: 'Lead Product Designer',
    stage: 'Offered',
    experience: '6+ years',
    location: 'Seattle, WA',
    appliedDate: '2026-08-15',
    notes: 'Formal offer extended on September 12th following unanimous recommendation.',
    interviewerId: 'usr_interviewer_2',
    rating: 5
  },
  {
    id: 'cand_5',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    phone: '+1 (555) 678-9012',
    role: 'Infrastructure & DevOps Lead',
    stage: 'Applied',
    experience: '8+ years',
    location: 'Remote',
    appliedDate: '2026-09-14',
    notes: 'Deep expertise in Kubernetes cluster management, Terraform infrastructure code, and multi-region AWS setup.',
    interviewerId: null,
    rating: null
  },
  {
    id: 'cand_6',
    name: 'Chloe Kim',
    email: 'chloe.kim@example.com',
    phone: '+1 (555) 789-0123',
    role: 'Senior Full Stack Engineer',
    stage: 'Hired',
    experience: '5 years',
    location: 'Chicago, IL',
    appliedDate: '2026-08-01',
    notes: 'Offer signed. Onboarding scheduled for October 1st.',
    interviewerId: 'usr_interviewer_1',
    rating: 5
  },
  {
    id: 'cand_7',
    name: 'Brian Taylor',
    email: 'brian.taylor@example.com',
    phone: '+1 (555) 890-1234',
    role: 'QA Automation Lead',
    stage: 'Rejected',
    experience: '3 years',
    location: 'Denver, CO',
    appliedDate: '2026-08-20',
    notes: 'Application closed due to mismatch in required team leadership experience.',
    interviewerId: 'usr_interviewer_2',
    rating: 2
  }
];

export const INITIAL_INTERVIEWS = [
  {
    id: 'int_1',
    candidateId: 'cand_1',
    candidateName: 'David Miller',
    role: 'Senior Full Stack Engineer',
    interviewerId: 'usr_interviewer_1',
    interviewerName: 'Alex Chen',
    scheduledAt: '2026-09-16T14:00',
    status: 'Scheduled',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    type: 'System Architecture & Technical'
  },
  {
    id: 'int_2',
    candidateId: 'cand_2',
    candidateName: 'Emily Watson',
    role: 'Staff Frontend Engineer',
    interviewerId: 'usr_interviewer_2',
    interviewerName: 'Maria Rodriguez',
    scheduledAt: '2026-09-17T11:00',
    status: 'Scheduled',
    meetingLink: 'https://meet.google.com/xyz-uvwx-rst',
    type: 'Executive & Culture Alignment'
  },
  {
    id: 'int_3',
    candidateId: 'cand_3',
    candidateName: 'Marcus Johnson',
    role: 'Backend Systems Engineer',
    interviewerId: 'usr_interviewer_1',
    interviewerName: 'Alex Chen',
    scheduledAt: '2026-09-18T16:30',
    status: 'Scheduled',
    meetingLink: 'https://meet.google.com/mno-pqrs-tuv',
    type: 'Technical Screening'
  }
];

export const INITIAL_FEEDBACK = [
  {
    id: 'fb_1',
    candidateId: 'cand_2',
    interviewId: 'int_past_1',
    interviewerId: 'usr_interviewer_1',
    interviewerName: 'Alex Chen',
    rating: 5,
    recommendation: 'Strong Hire',
    comments: 'Demonstrated outstanding systems design thinking and frontend performance optimization skills. Recommended without reservation.',
    createdAt: '2026-09-10'
  },
  {
    id: 'fb_2',
    candidateId: 'cand_1',
    interviewId: 'int_past_2',
    interviewerId: 'usr_interviewer_2',
    interviewerName: 'Maria Rodriguez',
    rating: 4,
    recommendation: 'Hire',
    comments: 'Solid technical background and clear communication under pressure. Strong problem-solving methodology.',
    createdAt: '2026-09-12'
  }
];
