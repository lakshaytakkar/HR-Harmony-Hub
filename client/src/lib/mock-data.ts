import type {
  Employee,
  Candidate,
  Department,
  JobPosting,
  LeaveRequest,
  AttendanceRecord,
  HRDocument,
} from "@shared/schema";

export const employees: Employee[] = [
  { id: "1", employeeId: "EMP-001", firstName: "Arjun", lastName: "Mehta", email: "arjun.mehta@lumin.com", phone: "+91 98765 43210", department: "Engineering", position: "Senior Software Engineer", status: "Active", joinDate: "2023-01-15", salary: 1800000 },
  { id: "2", employeeId: "EMP-002", firstName: "Priya", lastName: "Sharma", email: "priya.sharma@lumin.com", phone: "+91 98765 43211", department: "Design", position: "Lead Product Designer", status: "Active", joinDate: "2022-06-20", salary: 1600000 },
  { id: "3", employeeId: "EMP-003", firstName: "Rahul", lastName: "Kumar", email: "rahul.kumar@lumin.com", phone: "+91 98765 43212", department: "Engineering", position: "Frontend Developer", status: "Active", joinDate: "2023-03-10", salary: 1200000 },
  { id: "4", employeeId: "EMP-004", firstName: "Sneha", lastName: "Patel", email: "sneha.patel@lumin.com", phone: "+91 98765 43213", department: "HR", position: "HR Manager", status: "Active", joinDate: "2021-09-01", salary: 1500000 },
  { id: "5", employeeId: "EMP-005", firstName: "Vikram", lastName: "Singh", email: "vikram.singh@lumin.com", phone: "+91 98765 43214", department: "Marketing", position: "Marketing Lead", status: "Active", joinDate: "2022-11-05", salary: 1400000 },
  { id: "6", employeeId: "EMP-006", firstName: "Ananya", lastName: "Reddy", email: "ananya.reddy@lumin.com", phone: "+91 98765 43215", department: "Engineering", position: "Backend Developer", status: "On Leave", joinDate: "2023-07-12", salary: 1100000 },
  { id: "7", employeeId: "EMP-007", firstName: "Karan", lastName: "Gupta", email: "karan.gupta@lumin.com", phone: "+91 98765 43216", department: "Sales", position: "Sales Executive", status: "Active", joinDate: "2024-01-08", salary: 900000 },
  { id: "8", employeeId: "EMP-008", firstName: "Meera", lastName: "Nair", email: "meera.nair@lumin.com", phone: "+91 98765 43217", department: "Design", position: "UI Designer", status: "Active", joinDate: "2023-09-22", salary: 1000000 },
  { id: "9", employeeId: "EMP-009", firstName: "Rohan", lastName: "Joshi", email: "rohan.joshi@lumin.com", phone: "+91 98765 43218", department: "Engineering", position: "DevOps Engineer", status: "Active", joinDate: "2022-04-15", salary: 1500000 },
  { id: "10", employeeId: "EMP-010", firstName: "Divya", lastName: "Iyer", email: "divya.iyer@lumin.com", phone: "+91 98765 43219", department: "Finance", position: "Finance Analyst", status: "Inactive", joinDate: "2021-12-01", salary: 1100000 },
  { id: "11", employeeId: "EMP-011", firstName: "Aditya", lastName: "Verma", email: "aditya.verma@lumin.com", phone: "+91 98765 43220", department: "Engineering", position: "QA Engineer", status: "Active", joinDate: "2023-05-18", salary: 950000 },
  { id: "12", employeeId: "EMP-012", firstName: "Nisha", lastName: "Choudhary", email: "nisha.choudhary@lumin.com", phone: "+91 98765 43221", department: "HR", position: "Recruiter", status: "Active", joinDate: "2024-02-10", salary: 800000 },
  { id: "13", employeeId: "EMP-013", firstName: "Siddharth", lastName: "Rao", email: "siddharth.rao@lumin.com", phone: "+91 98765 43222", department: "Product", position: "Product Manager", status: "Active", joinDate: "2022-08-14", salary: 1700000 },
  { id: "14", employeeId: "EMP-014", firstName: "Pooja", lastName: "Bhat", email: "pooja.bhat@lumin.com", phone: "+91 98765 43223", department: "Marketing", position: "Content Writer", status: "Active", joinDate: "2023-11-03", salary: 700000 },
  { id: "15", employeeId: "EMP-015", firstName: "Amit", lastName: "Desai", email: "amit.desai@lumin.com", phone: "+91 98765 43224", department: "Engineering", position: "Tech Lead", status: "Active", joinDate: "2021-03-20", salary: 2200000 },
];

export const candidates: Candidate[] = [
  { id: "1", name: "Ravi Shankar", email: "ravi.shankar@gmail.com", phone: "+91 99876 54321", position: "Senior Frontend Developer", department: "Engineering", stage: "Interview", appliedDate: "2025-02-10", source: "LinkedIn", rating: 4 },
  { id: "2", name: "Kavitha Menon", email: "kavitha.m@gmail.com", phone: "+91 99876 54322", position: "Product Designer", department: "Design", stage: "Screening", appliedDate: "2025-02-15", source: "Referral", rating: 3 },
  { id: "3", name: "Deepak Tiwari", email: "deepak.t@outlook.com", phone: "+91 99876 54323", position: "Backend Developer", department: "Engineering", stage: "Applied", appliedDate: "2025-02-18", source: "Indeed", rating: 3 },
  { id: "4", name: "Swati Kapoor", email: "swati.k@gmail.com", phone: "+91 99876 54324", position: "HR Coordinator", department: "HR", stage: "Offer", appliedDate: "2025-01-25", source: "LinkedIn", rating: 5 },
  { id: "5", name: "Nikhil Agarwal", email: "nikhil.a@yahoo.com", phone: "+91 99876 54325", position: "Data Analyst", department: "Finance", stage: "Interview", appliedDate: "2025-02-05", source: "Naukri", rating: 4 },
  { id: "6", name: "Anjali Das", email: "anjali.d@gmail.com", phone: "+91 99876 54326", position: "Marketing Executive", department: "Marketing", stage: "Hired", appliedDate: "2025-01-10", source: "Referral", rating: 5 },
  { id: "7", name: "Manish Pandey", email: "manish.p@outlook.com", phone: "+91 99876 54327", position: "DevOps Engineer", department: "Engineering", stage: "Rejected", appliedDate: "2025-01-20", source: "LinkedIn", rating: 2 },
  { id: "8", name: "Shruti Mishra", email: "shruti.m@gmail.com", phone: "+91 99876 54328", position: "UX Researcher", department: "Design", stage: "Screening", appliedDate: "2025-02-20", source: "Glassdoor", rating: 4 },
  { id: "9", name: "Varun Saxena", email: "varun.s@gmail.com", phone: "+91 99876 54329", position: "Sales Manager", department: "Sales", stage: "Applied", appliedDate: "2025-02-22", source: "Indeed", rating: 3 },
  { id: "10", name: "Pallavi Jain", email: "pallavi.j@gmail.com", phone: "+91 99876 54330", position: "Content Strategist", department: "Marketing", stage: "Interview", appliedDate: "2025-02-08", source: "LinkedIn", rating: 4 },
];

export const departments: Department[] = [
  { id: "1", name: "Engineering", head: "Amit Desai", employeeCount: 6, description: "Software development and technical infrastructure", status: "Active" },
  { id: "2", name: "Design", head: "Priya Sharma", employeeCount: 2, description: "Product design, UI/UX, and brand identity", status: "Active" },
  { id: "3", name: "HR", head: "Sneha Patel", employeeCount: 2, description: "Human resources, recruitment, and employee relations", status: "Active" },
  { id: "4", name: "Marketing", head: "Vikram Singh", employeeCount: 2, description: "Brand marketing, content, and growth", status: "Active" },
  { id: "5", name: "Sales", head: "Karan Gupta", employeeCount: 1, description: "Sales operations and business development", status: "Active" },
  { id: "6", name: "Finance", head: "Divya Iyer", employeeCount: 1, description: "Financial planning, accounting, and compliance", status: "Active" },
  { id: "7", name: "Product", head: "Siddharth Rao", employeeCount: 1, description: "Product strategy and roadmap management", status: "Active" },
];

export const jobPostings: JobPosting[] = [
  { id: "1", title: "Senior Frontend Developer", department: "Engineering", location: "Bangalore", type: "Full-time", status: "Open", postedDate: "2025-02-01", closingDate: "2025-03-15", applicants: 24, description: "Looking for an experienced frontend developer with expertise in React and TypeScript", salaryRange: "15-22 LPA", experience: "4-6 years" },
  { id: "2", title: "Product Designer", department: "Design", location: "Mumbai", type: "Full-time", status: "Open", postedDate: "2025-02-05", closingDate: "2025-03-20", applicants: 18, description: "Join our design team to create exceptional user experiences", salaryRange: "12-18 LPA", experience: "3-5 years" },
  { id: "3", title: "Backend Developer", department: "Engineering", location: "Bangalore", type: "Full-time", status: "Open", postedDate: "2025-02-10", closingDate: "2025-03-25", applicants: 32, description: "Build scalable backend services using Node.js and PostgreSQL", salaryRange: "14-20 LPA", experience: "3-5 years" },
  { id: "4", title: "HR Coordinator", department: "HR", location: "Delhi", type: "Full-time", status: "Closed", postedDate: "2025-01-15", closingDate: "2025-02-15", applicants: 45, description: "Support HR operations including recruitment coordination and onboarding", salaryRange: "6-9 LPA", experience: "1-3 years" },
  { id: "5", title: "Marketing Intern", department: "Marketing", location: "Remote", type: "Internship", status: "Open", postedDate: "2025-02-15", closingDate: "2025-03-30", applicants: 56, description: "Assist with digital marketing campaigns and social media management", salaryRange: "25K/month", experience: "0-1 years" },
  { id: "6", title: "Data Analyst", department: "Finance", location: "Bangalore", type: "Full-time", status: "Draft", postedDate: "2025-02-20", applicants: 0, description: "Analyze financial data and create reports for leadership team", salaryRange: "10-15 LPA", experience: "2-4 years" },
  { id: "7", title: "DevOps Engineer", department: "Engineering", location: "Hyderabad", type: "Full-time", status: "Open", postedDate: "2025-02-12", closingDate: "2025-03-28", applicants: 15, description: "Manage CI/CD pipelines, cloud infrastructure, and monitoring", salaryRange: "16-24 LPA", experience: "3-6 years" },
  { id: "8", title: "Content Writer", department: "Marketing", location: "Remote", type: "Contract", status: "Open", postedDate: "2025-02-18", closingDate: "2025-04-01", applicants: 28, description: "Create compelling content for blog, social media, and marketing materials", salaryRange: "6-10 LPA", experience: "2-4 years" },
];

export const leaveRequests: LeaveRequest[] = [
  { id: "1", employeeId: "6", employeeName: "Ananya Reddy", type: "Annual", startDate: "2025-02-25", endDate: "2025-03-01", status: "Approved", reason: "Family vacation", days: 5 },
  { id: "2", employeeId: "3", employeeName: "Rahul Kumar", type: "Sick", startDate: "2025-02-20", endDate: "2025-02-21", status: "Approved", reason: "Feeling unwell", days: 2 },
  { id: "3", employeeId: "5", employeeName: "Vikram Singh", type: "Personal", startDate: "2025-03-05", endDate: "2025-03-06", status: "Pending", reason: "Personal errand", days: 2 },
  { id: "4", employeeId: "8", employeeName: "Meera Nair", type: "Annual", startDate: "2025-03-10", endDate: "2025-03-14", status: "Pending", reason: "Travel plans", days: 5 },
  { id: "5", employeeId: "1", employeeName: "Arjun Mehta", type: "Sick", startDate: "2025-02-18", endDate: "2025-02-18", status: "Approved", reason: "Doctor appointment", days: 1 },
  { id: "6", employeeId: "11", employeeName: "Aditya Verma", type: "Personal", startDate: "2025-03-01", endDate: "2025-03-02", status: "Rejected", reason: "House shifting", days: 2 },
  { id: "7", employeeId: "14", employeeName: "Pooja Bhat", type: "Annual", startDate: "2025-03-15", endDate: "2025-03-22", status: "Pending", reason: "Hometown visit", days: 6 },
  { id: "8", employeeId: "9", employeeName: "Rohan Joshi", type: "Sick", startDate: "2025-02-24", endDate: "2025-02-25", status: "Approved", reason: "Flu", days: 2 },
];

export const attendanceRecords: AttendanceRecord[] = [
  { id: "1", employeeId: "1", employeeName: "Arjun Mehta", date: "2025-02-27", checkIn: "09:02", checkOut: "18:15", status: "Present", department: "Engineering", workHours: "9h 13m" },
  { id: "2", employeeId: "2", employeeName: "Priya Sharma", date: "2025-02-27", checkIn: "09:30", checkOut: "18:00", status: "Present", department: "Design", workHours: "8h 30m" },
  { id: "3", employeeId: "3", employeeName: "Rahul Kumar", date: "2025-02-27", checkIn: "09:45", checkOut: "18:30", status: "Late", department: "Engineering", workHours: "8h 45m" },
  { id: "4", employeeId: "4", employeeName: "Sneha Patel", date: "2025-02-27", checkIn: "08:55", checkOut: "17:30", status: "Present", department: "HR", workHours: "8h 35m" },
  { id: "5", employeeId: "5", employeeName: "Vikram Singh", date: "2025-02-27", checkIn: "10:15", checkOut: "19:00", status: "Late", department: "Marketing", workHours: "8h 45m" },
  { id: "6", employeeId: "6", employeeName: "Ananya Reddy", date: "2025-02-27", checkIn: "--:--", checkOut: "--:--", status: "Absent", department: "Engineering", workHours: "0h 0m" },
  { id: "7", employeeId: "7", employeeName: "Karan Gupta", date: "2025-02-27", checkIn: "09:00", checkOut: "18:10", status: "Present", department: "Sales", workHours: "9h 10m" },
  { id: "8", employeeId: "8", employeeName: "Meera Nair", date: "2025-02-27", checkIn: "09:10", checkOut: "18:20", status: "Present", department: "Design", workHours: "9h 10m" },
  { id: "9", employeeId: "9", employeeName: "Rohan Joshi", date: "2025-02-27", checkIn: "08:45", checkOut: "17:45", status: "Present", department: "Engineering", workHours: "9h 0m" },
  { id: "10", employeeId: "11", employeeName: "Aditya Verma", date: "2025-02-27", checkIn: "09:05", checkOut: "13:00", status: "Half Day", department: "Engineering", workHours: "3h 55m" },
  { id: "11", employeeId: "12", employeeName: "Nisha Choudhary", date: "2025-02-27", checkIn: "09:00", checkOut: "18:00", status: "Present", department: "HR", workHours: "9h 0m" },
  { id: "12", employeeId: "13", employeeName: "Siddharth Rao", date: "2025-02-27", checkIn: "09:20", checkOut: "18:45", status: "Present", department: "Product", workHours: "9h 25m" },
  { id: "13", employeeId: "14", employeeName: "Pooja Bhat", date: "2025-02-27", checkIn: "09:30", checkOut: "18:30", status: "Late", department: "Marketing", workHours: "9h 0m" },
  { id: "14", employeeId: "15", employeeName: "Amit Desai", date: "2025-02-27", checkIn: "08:30", checkOut: "19:00", status: "Present", department: "Engineering", workHours: "10h 30m" },
];

export const documents: HRDocument[] = [
  { id: "1", title: "Employee Handbook 2025", category: "Policy", uploadedBy: "Sneha Patel", uploadDate: "2025-01-05", fileSize: "2.4 MB", fileType: "PDF", status: "Active" },
  { id: "2", title: "Leave Policy", category: "Policy", uploadedBy: "Sneha Patel", uploadDate: "2025-01-10", fileSize: "856 KB", fileType: "PDF", status: "Active" },
  { id: "3", title: "NDA Template", category: "Contract", uploadedBy: "Sneha Patel", uploadDate: "2024-11-20", fileSize: "128 KB", fileType: "DOCX", status: "Active" },
  { id: "4", title: "Offer Letter Template", category: "Contract", uploadedBy: "Nisha Choudhary", uploadDate: "2024-12-15", fileSize: "95 KB", fileType: "DOCX", status: "Active" },
  { id: "5", title: "Q4 2024 HR Report", category: "Report", uploadedBy: "Sneha Patel", uploadDate: "2025-01-20", fileSize: "1.8 MB", fileType: "PDF", status: "Active" },
  { id: "6", title: "Remote Work Policy", category: "Policy", uploadedBy: "Sneha Patel", uploadDate: "2024-08-10", fileSize: "420 KB", fileType: "PDF", status: "Active" },
  { id: "7", title: "Performance Review Template", category: "Other", uploadedBy: "Sneha Patel", uploadDate: "2025-02-01", fileSize: "156 KB", fileType: "XLSX", status: "Active" },
  { id: "8", title: "Onboarding Checklist", category: "Other", uploadedBy: "Nisha Choudhary", uploadDate: "2025-01-25", fileSize: "78 KB", fileType: "PDF", status: "Active" },
  { id: "9", title: "Travel Reimbursement Policy", category: "Policy", uploadedBy: "Divya Iyer", uploadDate: "2024-09-15", fileSize: "310 KB", fileType: "PDF", status: "Archived" },
  { id: "10", title: "Code of Conduct", category: "Policy", uploadedBy: "Sneha Patel", uploadDate: "2024-06-01", fileSize: "540 KB", fileType: "PDF", status: "Active" },
];

export interface DocumentPreview {
  type: "policy" | "contract" | "spreadsheet" | "certificate";
  sections?: { heading: string; content: string }[];
  tableData?: { headers: string[]; rows: string[][] };
  certificateTitle?: string;
  certificateRecipient?: string;
  certificateBody?: string;
  certificateDate?: string;
  certificateIssuer?: string;
}

export const documentPreviews: Record<string, DocumentPreview> = {
  "1": {
    type: "policy",
    sections: [
      { heading: "1. Introduction", content: "Welcome to TeamSync. This Employee Handbook outlines the policies, procedures, and guidelines that govern your employment with us. All employees are expected to read and comply with the standards described herein." },
      { heading: "2. Employment Policies", content: "TeamSync is an equal opportunity employer. We do not discriminate based on race, gender, religion, age, disability, or any other protected characteristic. All hiring and promotion decisions are based on qualifications and merit." },
      { heading: "3. Work Hours & Attendance", content: "Standard work hours are 9:00 AM to 6:00 PM, Monday through Friday. Employees are expected to maintain regular attendance and punctuality. Flexible work arrangements may be available with managerial approval." },
      { heading: "4. Compensation & Benefits", content: "Compensation is reviewed annually and is based on performance, market conditions, and company financials. Benefits include health insurance, provident fund contributions, and paid time off as described in the benefits section." },
      { heading: "5. Code of Conduct", content: "All employees must maintain professional conduct at all times. Harassment, discrimination, and unethical behavior are strictly prohibited and may result in disciplinary action up to and including termination." },
    ],
  },
  "2": {
    type: "policy",
    sections: [
      { heading: "1. Leave Entitlement", content: "Full-time employees are entitled to 24 days of annual leave, 12 days of sick leave, and 5 days of personal leave per calendar year. Leave balances are prorated for employees joining mid-year." },
      { heading: "2. Leave Application Process", content: "All leave requests must be submitted through the TeamSync HR portal at least 3 working days in advance for planned leave. Sick leave may be applied retroactively with a medical certificate for absences exceeding 2 consecutive days." },
      { heading: "3. Leave Approval", content: "Leave requests are subject to approval by the reporting manager. Approval depends on team workload, project deadlines, and adequate team coverage. Managers should respond to leave requests within 2 business days." },
      { heading: "4. Carry Forward & Encashment", content: "A maximum of 10 unused annual leave days may be carried forward to the next calendar year. Any leave beyond this limit will lapse. Leave encashment is available for up to 5 unused annual leave days at the end of the year." },
    ],
  },
  "3": {
    type: "contract",
    sections: [
      { heading: "NON-DISCLOSURE AGREEMENT", content: "This Non-Disclosure Agreement (the \"Agreement\") is entered into as of [Effective Date] by and between TeamSync Technologies Pvt. Ltd. (the \"Company\") and [Employee Name] (the \"Employee\")." },
      { heading: "1. Confidential Information", content: "The Employee agrees to hold in confidence and not disclose any proprietary information, trade secrets, client data, financial records, technical specifications, or business strategies of the Company without prior written consent." },
      { heading: "2. Obligations", content: "The Employee shall: (a) use Confidential Information solely for the purpose of performing their duties; (b) not copy or reproduce any Confidential Information except as necessary; (c) return all materials upon termination of employment." },
      { heading: "3. Term", content: "This Agreement shall remain in effect during the Employee's tenure and for a period of [Duration] years following the termination of employment, regardless of the reason for termination." },
      { heading: "4. Signatures", content: "IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.\n\nCompany Representative: [Authorized Signatory]\nEmployee: [Employee Name]\nDate: [Signing Date]" },
    ],
  },
  "4": {
    type: "contract",
    sections: [
      { heading: "OFFER OF EMPLOYMENT", content: "Dear [Candidate Name],\n\nWe are pleased to offer you the position of [Job Title] at TeamSync Technologies Pvt. Ltd., reporting to [Manager Name]. Your start date will be [Start Date]." },
      { heading: "Compensation", content: "Your annual compensation will be [Salary Amount] (CTC), payable monthly. This includes basic salary, HRA, special allowances, and employer PF contributions as detailed in the attached compensation structure." },
      { heading: "Benefits", content: "You will be eligible for the following benefits: Group Health Insurance (self + spouse + 2 children), 24 days annual leave, performance bonus up to [Bonus Percentage]% of base salary, and professional development allowance." },
      { heading: "Terms & Conditions", content: "This offer is contingent upon successful completion of background verification and submission of required documents. The notice period for resignation is [Notice Period] days. This offer is valid until [Expiry Date]." },
      { heading: "Acceptance", content: "Please sign and return this letter by [Response Date] to confirm your acceptance.\n\nWarm regards,\n[HR Manager Name]\nHead of Human Resources\nTeamSync Technologies Pvt. Ltd." },
    ],
  },
  "5": {
    type: "policy",
    sections: [
      { heading: "Q4 2024 HR Summary", content: "This report provides an overview of key HR metrics and activities during Q4 2024 (October - December). The quarter saw significant growth in headcount and improvements in employee engagement scores." },
      { heading: "Headcount", content: "Total headcount increased from 42 to 56 employees (33% growth). Engineering remained the largest department with 18 members. Three new departments were established: Data Science, Customer Success, and Legal." },
      { heading: "Recruitment", content: "32 positions were opened during Q4, with 14 successfully filled. Average time-to-hire was 28 days, down from 35 days in Q3. The top sourcing channels were LinkedIn (45%), employee referrals (30%), and job boards (25%)." },
      { heading: "Attrition", content: "Voluntary attrition rate was 4.2% for the quarter, well below the industry average of 8.5%. Exit interview feedback indicated that the primary reasons for departure were relocation (40%) and higher education (35%)." },
      { heading: "Engagement", content: "Employee engagement score improved to 4.2 out of 5.0, up from 3.8 in Q3. Key drivers included improved work-life balance initiatives, the new mentorship program, and enhanced learning opportunities." },
    ],
  },
  "6": {
    type: "policy",
    sections: [
      { heading: "1. Purpose", content: "This policy establishes guidelines for employees working remotely. It applies to all full-time employees who have been approved for remote work arrangements by their department head." },
      { heading: "2. Eligibility", content: "Employees who have completed their probation period and have a satisfactory performance rating are eligible to apply for remote work. Certain roles requiring physical presence may not be eligible." },
      { heading: "3. Work Environment", content: "Remote employees must maintain a dedicated, quiet workspace with reliable internet connectivity (minimum 50 Mbps). The company will provide a one-time work-from-home setup allowance of INR 15,000." },
      { heading: "4. Communication", content: "Remote employees must be available during core hours (10:00 AM - 4:00 PM IST). All team meetings should be attended via video call. Response time for messages should not exceed 30 minutes during work hours." },
      { heading: "5. Data Security", content: "All company data must be accessed through VPN. Personal devices must comply with the company's security policy. Employees must not use public Wi-Fi for accessing company systems without VPN protection." },
    ],
  },
  "7": {
    type: "spreadsheet",
    tableData: {
      headers: ["Employee", "Department", "Goals Met", "Rating", "Manager Assessment", "Recommended Action"],
      rows: [
        ["Arjun Mehta", "Engineering", "5/5", "Exceeds Expectations", "Outstanding contributor", "Promotion"],
        ["Priya Sharma", "Design", "4/5", "Exceeds Expectations", "Strong design leadership", "Salary Increase"],
        ["Rahul Kumar", "Engineering", "4/5", "Meets Expectations", "Solid performer", "Skill Development"],
        ["Sneha Patel", "HR", "5/5", "Exceeds Expectations", "Excellent HR operations", "Bonus"],
        ["Vikram Singh", "Marketing", "3/5", "Meets Expectations", "Good campaign results", "Mentoring"],
        ["Karan Gupta", "Sales", "4/5", "Meets Expectations", "Consistent sales numbers", "Target Revision"],
        ["Meera Nair", "Design", "4/5", "Meets Expectations", "Creative and reliable", "Skill Development"],
        ["Rohan Joshi", "Engineering", "5/5", "Exceeds Expectations", "Infrastructure excellence", "Promotion"],
      ],
    },
  },
  "8": {
    type: "policy",
    sections: [
      { heading: "Pre-Joining", content: "Send welcome email with joining date, document checklist, and office address. Prepare workstation, access cards, and system accounts. Assign a buddy from the same department." },
      { heading: "Day 1", content: "Welcome session with HR overview. Office tour and team introductions. IT setup: laptop, email, Slack, and tool access. Complete joining documentation and ID verification." },
      { heading: "Week 1", content: "Department orientation with team lead. Review of role expectations and 90-day goals. Introduction to company tools and workflows. Schedule 1:1 meetings with key stakeholders." },
      { heading: "Month 1", content: "Complete mandatory compliance training. First performance check-in with manager. Buddy catch-up sessions (weekly). Submit feedback on onboarding experience." },
      { heading: "Month 3", content: "Probation review meeting with HR and manager. Finalize role-specific training completion. Set quarterly OKRs. Provide comprehensive onboarding feedback survey." },
    ],
  },
  "9": {
    type: "policy",
    sections: [
      { heading: "1. Scope", content: "This policy covers all business travel and related expenses incurred by employees of TeamSync Technologies. It applies to domestic and international travel undertaken for official company purposes." },
      { heading: "2. Travel Booking", content: "All travel must be booked through the company travel portal. Flights should be economy class for domestic travel and premium economy for international flights exceeding 6 hours. Train travel is encouraged for distances under 500 km." },
      { heading: "3. Accommodation", content: "Hotel stays should not exceed INR 5,000 per night for domestic travel and USD 150 per night for international travel. Employees must submit receipts within 7 days of return." },
      { heading: "4. Daily Allowance", content: "A daily food and incidental allowance of INR 1,500 (domestic) or USD 50 (international) will be provided. This covers meals, local transport, and minor expenses. Receipts are not required for amounts within the daily limit." },
      { heading: "5. Reimbursement Process", content: "Submit all expense claims through the HR portal within 14 days of trip completion. Attach original receipts or scanned copies. Reimbursements are processed within 10 business days of approval." },
    ],
  },
  "10": {
    type: "policy",
    sections: [
      { heading: "1. Professional Conduct", content: "All employees are expected to conduct themselves professionally and ethically at all times. This includes interactions with colleagues, clients, vendors, and the public. Respectful communication is fundamental to our culture." },
      { heading: "2. Anti-Harassment", content: "TeamSync maintains a zero-tolerance policy towards harassment of any kind, including sexual harassment, bullying, intimidation, and discriminatory behavior. All complaints will be investigated promptly and confidentially." },
      { heading: "3. Conflict of Interest", content: "Employees must disclose any situation that may create a conflict of interest with their responsibilities at TeamSync. This includes outside employment, financial interests in competitors, and personal relationships that could influence business decisions." },
      { heading: "4. Use of Company Resources", content: "Company resources including equipment, software, and facilities should be used primarily for business purposes. Limited personal use is acceptable provided it does not interfere with work duties or violate any policies." },
      { heading: "5. Reporting Violations", content: "Employees are encouraged to report any violations of this Code of Conduct through the anonymous reporting channel or directly to HR. Retaliation against anyone reporting a violation in good faith is strictly prohibited." },
    ],
  },
};
