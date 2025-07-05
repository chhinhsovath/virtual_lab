// Internationalization utility for VirtualLab LMS
// Supports English (en) and Khmer (km) languages

export type Language = 'en' | 'km';

export interface Translation {
  en: string;
  km: string;
}

// Common translations used throughout the application
export const translations: Record<string, Translation> = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', km: 'ទំព័រដើម' },
  'nav.courses': { en: 'Courses', km: 'វគ្គសិក្សា' },
  'nav.assignments': { en: 'Assignments', km: 'កិច្ចការ' },
  'nav.labs': { en: 'Labs', km: 'ឯកសារពិសោធន៍' },
  'nav.reports': { en: 'Reports', km: 'របាយការណ៍' },
  'nav.users': { en: 'Users', km: 'អ្នកប្រើប្រាស់' },
  'nav.settings': { en: 'Settings', km: 'ការកំណត់' },
  'nav.messages': { en: 'Messages', km: 'សារ' },
  'nav.announcements': { en: 'Announcements', km: 'សេចក្តីប្រកាស' },

  // Common actions
  'action.create': { en: 'Create', km: 'បង្កើត' },
  'action.edit': { en: 'Edit', km: 'កែប្រែ' },
  'action.delete': { en: 'Delete', km: 'លុប' },
  'action.save': { en: 'Save', km: 'រក្សាទុក' },
  'action.cancel': { en: 'Cancel', km: 'បោះបង់' },
  'action.submit': { en: 'Submit', km: 'ប្រគល់' },
  'action.view': { en: 'View', km: 'មើល' },
  'action.download': { en: 'Download', km: 'ទាញយក' },
  'action.upload': { en: 'Upload', km: 'ផ្ទុកឡើង' },
  'action.search': { en: 'Search', km: 'ស្វែងរក' },
  'action.filter': { en: 'Filter', km: 'ត្រង' },
  'action.refresh': { en: 'Refresh', km: 'ធ្វើឲ្យស្រស់' },

  // Status
  'status.active': { en: 'Active', km: 'សកម្ម' },
  'status.inactive': { en: 'Inactive', km: 'អសកម្ម' },
  'status.pending': { en: 'Pending', km: 'កំពុងរង់ចាំ' },
  'status.completed': { en: 'Completed', km: 'បានបញ្ចប់' },
  'status.in_progress': { en: 'In Progress', km: 'កំពុងដំណើរការ' },
  'status.submitted': { en: 'Submitted', km: 'បានប្រគល់' },
  'status.graded': { en: 'Graded', km: 'បានដាក់ពិន្ទុ' },
  'status.overdue': { en: 'Overdue', km: 'ហួសកំណត់' },
  'status.draft': { en: 'Draft', km: 'សេចក្តីព្រាង' },
  'status.published': { en: 'Published', km: 'បានបោះពុម្ពផ្សាយ' },

  // Roles
  'role.super_admin': { en: 'Super Admin', km: 'អ្នកគ្រប់គ្រងកំពូល' },
  'role.admin': { en: 'Admin', km: 'អ្នកគ្រប់គ្រង' },
  'role.teacher': { en: 'Teacher', km: 'គ្រូ' },
  'role.student': { en: 'Student', km: 'សិស្ស' },
  'role.parent': { en: 'Parent', km: 'ឪពុកម្តាយ' },
  'role.guardian': { en: 'Guardian', km: 'អាណាព្យាបាល' },
  'role.director': { en: 'Director', km: 'នាយក' },
  'role.partner': { en: 'Partner', km: 'ដៃគូ' },
  'role.mentor': { en: 'Mentor', km: 'អ្នកណែនាំ' },
  'role.collector': { en: 'Collector', km: 'អ្នកប្រមូលទិន្នន័យ' },
  'role.observer': { en: 'Observer', km: 'អ្នកសង្កេតការណ៍' },
  'role.qa': { en: 'Quality Assurance', km: 'ការធានាគុណភាព' },

  // Course related
  'course.title': { en: 'Course Title', km: 'ចំណងជើងវគ្គសិក្សា' },
  'course.code': { en: 'Course Code', km: 'លេខកូដវគ្គសិក្សា' },
  'course.description': { en: 'Description', km: 'ការពិពណ៌នា' },
  'course.instructor': { en: 'Instructor', km: 'គ្រូបង្រៀន' },
  'course.students': { en: 'Students', km: 'សិស្សនិស្សិត' },
  'course.duration': { en: 'Duration', km: 'រយៈពេល' },
  'course.start_date': { en: 'Start Date', km: 'កាលបរិច្ឆេទចាប់ផ្តើម' },
  'course.end_date': { en: 'End Date', km: 'កាលបរិច្ឆេទបញ្ចប់' },
  'course.enrollment': { en: 'Enrollment', km: 'ការចុះឈ្មោះ' },

  // Assignment related
  'assignment.title': { en: 'Assignment Title', km: 'ចំណងជើងកិច្ចការ' },
  'assignment.instructions': { en: 'Instructions', km: 'សេចក្តីណែនាំ' },
  'assignment.due_date': { en: 'Due Date', km: 'កាលបរិច្ឆេទកំណត់' },
  'assignment.points': { en: 'Points', km: 'ពិន្ទុ' },
  'assignment.type': { en: 'Type', km: 'ប្រភេទ' },
  'assignment.submission': { en: 'Submission', km: 'ការប្រគល់' },

  // Lab related
  'lab.title': { en: 'Lab Title', km: 'ចំណងជើងមន្ទីរពិសោធន៍' },
  'lab.simulation': { en: 'Simulation', km: 'ការក្លែងធ្វើ' },
  'lab.worksheet': { en: 'Worksheet', km: 'សន្លឹកការងារ' },
  'lab.manual': { en: 'Manual', km: 'សៀវភៅណែនាំ' },
  'lab.resources': { en: 'Resources', km: 'ធនធាន' },
  'lab.duration': { en: 'Duration', km: 'រយៈពេល' },
  'lab.attempts': { en: 'Attempts', km: 'ការព្យាយាម' },

  // Form labels
  'form.name': { en: 'Name', km: 'ឈ្មោះ' },
  'form.email': { en: 'Email', km: 'អីមែល' },
  'form.password': { en: 'Password', km: 'ពាក្យសម្ងាត់' },
  'form.phone': { en: 'Phone', km: 'ទូរស័ព្ទ' },
  'form.address': { en: 'Address', km: 'អាសយដ្ឋាន' },
  'form.date_of_birth': { en: 'Date of Birth', km: 'ថ្ងៃខែឆ្នាំកំណើត' },
  'form.language': { en: 'Language', km: 'ភាសា' },

  // Messages
  'message.success': { en: 'Success', km: 'ជោគជ័យ' },
  'message.error': { en: 'Error', km: 'កំហុស' },
  'message.warning': { en: 'Warning', km: 'ការព្រមាន' },
  'message.info': { en: 'Information', km: 'ព័ត៌មាន' },
  'message.loading': { en: 'Loading...', km: 'កំពុងដំណើរការ...' },
  'message.no_data': { en: 'No data available', km: 'មិនមានទិន្នន័យ' },
  'message.unauthorized': { en: 'Unauthorized access', km: 'ការចូលដំណើរការមិនបានអនុញ្ញាត' },

  // Time and dates
  'time.minute': { en: 'minute', km: 'នាទី' },
  'time.minutes': { en: 'minutes', km: 'នាទី' },
  'time.hour': { en: 'hour', km: 'ម៉ោង' },
  'time.hours': { en: 'hours', km: 'ម៉ោង' },
  'time.day': { en: 'day', km: 'ថ្ងៃ' },
  'time.days': { en: 'days', km: 'ថ្ងៃ' },
  'time.week': { en: 'week', km: 'សប្តាហ៍' },
  'time.weeks': { en: 'weeks', km: 'សប្តាហ៍' },
  'time.month': { en: 'month', km: 'ខែ' },
  'time.months': { en: 'months', km: 'ខែ' },

  // Dashboard
  'dashboard.welcome': { en: 'Welcome back', km: 'សូមស្វាគមន៍' },
  'dashboard.overview': { en: 'Overview', km: 'ទិដ្ឋភាពទូទៅ' },
  'dashboard.recent_activity': { en: 'Recent Activity', km: 'សកម្មភាពថ្មីៗ' },
  'dashboard.quick_actions': { en: 'Quick Actions', km: 'សកម្មភាពរហ័ស' },
  'dashboard.statistics': { en: 'Statistics', km: 'ស្ថិតិ' },
  'dashboard.progress': { en: 'Progress', km: 'វឌ្ឍនភាព' },
  'dashboard.today': { en: "Here's what's happening with Cambodia Virtual Lab STEM today", km: 'នេះជាអ្វីដែលកំពុងកើតឡើងជាមួយ Cambodia Virtual Lab STEM ថ្ងៃនេះ' },
  'dashboard.title': { en: 'Cambodia Virtual Lab STEM Dashboard', km: 'ទំព័រគ្រប់គ្រង Cambodia Virtual Lab STEM' },
  'dashboard.subtitle': { en: 'Virtual Science, Technology, Engineering & Mathematics', km: 'វិទ្យាសាស្ត្រ បច្ចេកវិទ្យា វិស្វកម្ម និងគណិតវិទ្យានិម្មិត' },
  'dashboard.loading': { en: 'Loading Cambodia Virtual Lab STEM Dashboard', km: 'កំពុងផ្ទុក Cambodia Virtual Lab STEM Dashboard' },
  'dashboard.system_name': { en: 'Cambodia Virtual Lab', km: 'មន្ទីរពិសោធន៍និម្មិតកម្ពុជា' },
  
  // Stats Cards
  'stats.total_students': { en: 'Total Students', km: 'សិស្សសរុប' },
  'stats.active_learners': { en: 'Active learners in the system', km: 'អ្នកសិក្សាសកម្មក្នុងប្រព័ន្ធ' },
  'stats.schools': { en: 'Schools', km: 'សាលារៀន' },
  'stats.participating_schools': { en: 'Participating schools', km: 'សាលារៀនចូលរួម' },
  'stats.teachers': { en: 'Teachers', km: 'គ្រូបង្រៀន' },
  'stats.certified_educators': { en: 'Certified educators', km: 'អ្នកអប់រំបានទទួលសញ្ញាបត្រ' },
  'stats.assessment_rate': { en: 'Assessment Rate', km: 'អត្រាវាយតម្លៃ' },
  'stats.monthly_completion': { en: 'Monthly completion rate', km: 'អត្រាបញ្ចប់ប្រចាំខែ' },
  'stats.enrolled_program': { en: 'Enrolled in Cambodia Virtual Lab STEM', km: 'ចុះឈ្មោះក្នុងកម្មវិធី Cambodia Virtual Lab STEM' },
  'stats.stem_trained': { en: 'STEM methodology trained', km: 'បានបង្រៀនវិធីសាស្ត្រ STEM' },
  
  // Learning Levels
  'learning.levels': { en: 'Student Learning Levels', km: 'កម្រិតសិក្សារបស់សិស្ស' },
  'learning.distribution': { en: 'Distribution across Cambodia Virtual Lab STEM assessment categories', km: 'ការចែកចាយតាមប្រភេទវាយតម្លៃ Cambodia Virtual Lab STEM' },
  'learning.view_details': { en: 'View Details', km: 'មើលលម្អិត' },
  'learning.beginner': { en: 'Beginner', km: 'កម្រិតដំបូង' },
  'learning.letter': { en: 'Letter', km: 'អក្សរ' },
  'learning.word': { en: 'Word', km: 'ពាក្យ' },
  'learning.paragraph': { en: 'Paragraph', km: 'កថាខណ្ឌ' },
  'learning.story': { en: 'Story', km: 'រឿង' },
  
  // Activities
  'activity.new_assessment': { en: 'New assessment completed', km: 'បានបញ្ចប់ការវាយតម្លៃថ្មី' },
  'activity.teacher_training': { en: 'Teacher training session', km: 'វគ្គបណ្តុះបណ្តាលគ្រូ' },
  'activity.student_progress': { en: 'Student progress report', km: 'របាយការណ៍វឌ្ឍនភាពសិស្ស' },
  'activity.new_school': { en: 'New school onboarded', km: 'សាលារៀនថ្មីបានចូលរួម' },
  'activity.battambang_primary': { en: 'Battambang Primary School', km: 'សាលាបឋមសិក្សាបាត់ដំបង' },
  'activity.kampong_cham': { en: 'Kampong Cham District', km: 'ស្រុកកំពង់ចាម' },
  'activity.siem_reap': { en: 'Siem Reap School #12', km: 'សាលាសៀមរាប លេខ ១២' },
  'activity.prey_veng': { en: 'Prey Veng Secondary', km: 'មធ្យមសិក្សាព្រៃវែង' },
  
  // Quick Actions
  'action.new_assessment': { en: 'New Assessment', km: 'ការវាយតម្លៃថ្មី' },
  'action.view_students': { en: 'View Students', km: 'មើលសិស្ស' },
  'action.analytics': { en: 'Analytics', km: 'ការវិភាគទិន្នន័យ' },
  'action.teachers': { en: 'Teachers', km: 'គ្រូបង្រៀន' },
  
  // Student Portal
  'student.welcome': { en: 'Welcome', km: 'ស្វាគមន៍' },
  'student.portal_subtitle': { en: 'Discover Science Through Play', km: 'ស្វែងរកវិទ្យាសាស្ត្រតាមរយៈការលេង' },
  'student.vlab_cambodia': { en: 'Virtual Lab Cambodia', km: 'មន្ទីរពិសោធន៍និម្មិតកម្ពុជា' },
  'student.stem_student': { en: 'STEM Student', km: 'សិស្ស STEM' },
  'student.avg_score': { en: 'Avg Score', km: 'ពិន្ទុមធ្យម' },
  'student.learned': { en: 'min learned', km: 'នាទីបានសិក្សា' },
  'student.points': { en: 'points', km: 'ពិន្ទុ' },
  'student.simulations': { en: 'Simulations', km: 'ការក្លែងធ្វើ' },
  'student.average_score': { en: 'Average Score', km: 'ពិន្ទុមធ្យម' },
  'student.learning_time': { en: 'Learning Time', km: 'ពេលវេលាសិក្សា' },
  'student.achievements': { en: 'Achievements', km: 'សមិទ្ធផល' },
  'student.loading_journey': { en: 'Loading your STEM journey...', km: 'កំពុងផ្ទុកដំណើរ STEM របស់អ្នក...' },
  
  // Student Portal Tabs
  'tab.dashboard': { en: 'Dashboard', km: 'ទំព័រដើម' },
  'tab.my_simulations': { en: 'My Simulations', km: 'ការក្លែងធ្វើរបស់ខ្ញុំ' },
  'tab.assignments': { en: 'Assignments', km: 'កិច្ចការ' },
  'tab.achievements': { en: 'Achievements', km: 'សមិទ្ធផល' },
  'tab.subjects': { en: 'Subjects', km: 'មុខវិជ្ជា' },
  
  // Assignments
  'assignment.current': { en: 'Current Assignments', km: 'កិច្ចការបច្ចុប្បន្ន' },
  'assignment.simulation_assignments': { en: 'Simulation Assignments', km: 'កិច្ចការក្លែងធ្វើ' },
  'assignment.complete_master': { en: 'Complete these assignments to master STEM concepts', km: 'បំពេញកិច្ចការទាំងនេះដើម្បីធ្វើអ្នកជំនាញ STEM' },
  'assignment.due': { en: 'Due', km: 'កំណត់ពេល' },
  'assignment.not_submitted': { en: 'Not submitted', km: 'មិនទាន់ប្រគល់' },
  'assignment.view_details': { en: 'View Details', km: 'មើលលម្អិត' },
  'assignment.start': { en: 'Start', km: 'ចាប់ផ្តើម' },
  'assignment.continue': { en: 'Continue', km: 'បន្ត' },
  'assignment.score': { en: 'Score', km: 'ពិន្ទុ' },
  
  // Achievements
  'achievement.your_achievements': { en: 'Your Achievements', km: 'សមិទ្ធផលរបស់អ្នក' },
  'achievement.unlock_badges': { en: 'Unlock badges as you explore and master STEM concepts', km: 'ដោះសោសញ្ញាបត្រនៅពេលអ្នករុករក និងធ្វើជាអ្នកជំនាញគោលគំនិត STEM' },
  
  // Subjects
  'subject.physics': { en: 'Physics', km: 'រូបវិទ្យា' },
  'subject.chemistry': { en: 'Chemistry', km: 'គីមីវិទ្យា' },
  'subject.biology': { en: 'Biology', km: 'ជីវវិទ្យា' },
  'subject.mathematics': { en: 'Mathematics', km: 'គណិតវិទ្យា' },
  'subject.completed': { en: 'Simulations Completed', km: 'ការក្លែងធ្វើបានបញ្ចប់' },
  'subject.explore': { en: 'Explore', km: 'រុករក' },
  
  // Simulation States
  'simulation.completed': { en: 'Completed', km: 'បានបញ្ចប់' },
  'simulation.review': { en: 'Review', km: 'ពិនិត្យ' },
  'simulation.continue': { en: 'Continue', km: 'បន្ត' },
  'simulation.beginner': { en: 'Beginner', km: 'កម្រិតដំបូង' },
  'simulation.intermediate': { en: 'Intermediate', km: 'កម្រិតមធ្យម' },
  'simulation.advanced': { en: 'Advanced', km: 'កម្រិតខ្ពស់' },
  
  // Common UI
  'ui.today': { en: 'Today', km: 'ថ្ងៃនេះ' },
  'ui.logout': { en: 'Logout', km: 'ចាកចេញ' },
  'ui.loading_dashboard': { en: 'Loading dashboard...', km: 'កំពុងផ្ទុកទំព័រគ្រប់គ្រង...' },
  'ui.loading_student_portal': { en: 'Loading student portal...', km: 'កំពុងផ្ទុកវិបផតសិស្ស...' },
  'ui.login': { en: 'Login', km: 'ចូលប្រើ' },
  'ui.language': { en: 'Language', km: 'ភាសា' },
  'ui.loading_simulations': { en: 'Loading simulations...', km: 'កំពុងផ្ទុកការក្លែងធ្វើ...' },
  
  // Homepage
  'home.title': { en: 'Virtual Lab Cambodia', km: 'មន្ទីរពិសោធន៍និម្មិតកម្ពុជា' },
  'home.subtitle': { en: 'Interactive STEM Simulations', km: 'ការក្លែងធ្វើ STEM អន្តរកម្ម' },
  'home.inspired_by': { en: 'Inspired by PhET Interactive Simulations', km: 'ជំរុញដោយ PhET Interactive Simulations' },
  'home.hero_title': { en: 'Discover Science Through Play', km: 'ស្វែងរកវិទ្យាសាស្ត្រតាមរយៈការលេង' },
  'home.hero_description': { en: 'Interactive simulations that make complex concepts simple, engaging, and accessible to every Cambodian student.', km: 'ការក្លែងធ្វើអន្តរកម្មដែលធ្វើឱ្យគោលគំនិតស្មុគស្មាញមានភាពសាមញ្ញ ទាក់ទាញ និងអាចចូលប្រើបានសម្រាប់សិស្សកម្ពុជាគ្រប់គ្នា។' },
  'home.start_exploring': { en: 'Start Exploring', km: 'ចាប់ផ្តើមស្វែងរក' },
  'home.view_simulations': { en: 'View Simulations', km: 'មើលការក្លែងធ្វើ' },
  'home.explore_subjects': { en: 'Explore STEM Subjects', km: 'ស្វែងរកមុខវិជ្ជា STEM' },
  'home.subjects_description': { en: 'Interactive simulations across physics, chemistry, biology, and mathematics—all designed for curious minds', km: 'ការក្លែងធ្វើអន្តរកម្មនៅក្នុងរូបវិទ្យា គីមីវិទ្យា ជីវវិទ្យា និងគណិតវិទ្យា—ត្រូវបានរចនាឡើងសម្រាប់ចិត្តដែលចង់ដឹង' },
  'home.learning_philosophy': { en: 'Learning Through Discovery', km: 'រៀនតាមរយៈការរកឃើញ' },
  'home.philosophy_description': { en: 'Our approach mirrors how real scientists work—by asking questions, forming hypotheses, and testing ideas', km: 'វិធីសាស្ត្ររបស់យើងស្រដៀងនឹងរបៀបដែលអ្នកវិទ្យាសាស្ត្រពិតប្រាកដធ្វើការ—ដោយការសួរសំណួរ បង្កើតសម្មតិកម្ម និងសាកល្បងគំនិត' },
  'home.explore': { en: 'Explore', km: 'ស្វែងរក' },
  'home.investigate': { en: 'Investigate', km: 'ស្រាវជ្រាវ' },
  'home.apply': { en: 'Apply', km: 'អនុវត្ត' },
  'home.explore_description': { en: 'Free play mode to build intuition and spark curiosity about scientific phenomena', km: 'របៀបលេងសេរីដើម្បីបង្កើនវិចារណញាណ និងបំផុសការចង់ដឹងអំពីបាតុភូតវិទ្យាសាស្ត្រ' },
  'home.investigate_description': { en: 'Guided activities with specific learning goals and structured discovery paths', km: 'សកម្មភាពដឹកនាំជាមួយនឹងគោលដៅសិក្សាជាក់លាក់ និងផ្លូវការរកឃើញដែលមានរចនាសម្ព័ន្ធ' },
  'home.apply_description': { en: 'Real-world problem solving that connects science to everyday Cambodian life', km: 'ការដោះស្រាយបញ្ហាពិតប្រាកដដែលភ្ជាប់វិទ្យាសាស្ត្រទៅនឹងជីវិតប្រចាំថ្ងៃរបស់កម្ពុជា' },
  'home.for_educators': { en: 'Designed for Cambodian Educators', km: 'រចនាសម្រាប់គ្រូបង្រៀនកម្ពុជា' },
  'home.educators_description': { en: 'Every simulation includes comprehensive teaching materials, assessment tools, and professional development resources—all culturally relevant and aligned with national curriculum standards.', km: 'ការក្លែងធ្វើនីមួយៗរួមបញ្ចូលឧបករណ៍បង្រៀនទូលំទូលាយ ឧបករណ៍វាយតម្លៃ និងធនធានអភិវឌ្ឍន៍វិជ្ជាជីវៈ—ទាំងអស់សមស្របនឹងវប្បធម៌ និងតម្រឹមទៅនឹងស្តង់ដារកម្មវិធីសិក្សាជាតិ។' },
  'home.ready_transform': { en: 'Ready to Transform STEM Education?', km: 'ត្រៀមខ្លួនបំប្លែងការអប់រំ STEM?' },
  'home.transform_description': { en: 'Join thousands of students and teachers already discovering science through interactive simulations', km: 'ចូលរួមជាមួយសិស្ស និងគ្រូបង្រៀនរាប់ពាន់នាក់ដែលកំពុងស្វែងរកវិទ្យាសាស្ត្រតាមរយៈការក្លែងធ្វើអន្តរកម្ម' },
  'home.start_learning': { en: 'Start Learning Today', km: 'ចាប់ផ្តើមរៀនថ្ងៃនេះ' },
  'home.request_demo': { en: 'Request School Demo', km: 'ស្នើសុំការបង្ហាញសាលារៀន' },
  'home.try_now': { en: 'Try Now', km: 'សាកល្បងឥឡូវ' },
  'home.simulations_count': { en: 'Simulations', km: 'ការក្លែងធ្វើ' },
  'home.loading': { en: 'Loading...', km: 'កំពុងផ្ទុក...' },
  'home.explore_button': { en: 'Explore', km: 'ស្វែងរក' },
  'home.simulation_preview': { en: 'Interactive Simulation Preview', km: 'បង្ហាញការក្លែងធ្វើអន្តរកម្ម' },
  'home.cta_title': { en: 'Ready to Transform STEM Education?', km: 'ត្រៀមខ្លួនបំប្លែងការអប់រំ STEM?' },
  'home.cta_description': { en: 'Join thousands of students and teachers already discovering science through interactive simulations', km: 'ចូលរួមជាមួយសិស្ស និងគ្រូបង្រៀនរាប់ពាន់នាក់ដែលកំពុងស្វែងរកវិទ្យាសាស្ត្រតាមរយៈការក្លែងធ្វើអន្តរកម្ម' },
  'home.hero_subtitle': { en: 'Through Play', km: 'តាមរយៈការលេង' },
  'home.feature_lesson_plans': { en: 'Lesson plans with learning objectives', km: 'ផែនការបង្រៀនជាមួយគោលដៅសិក្សា' },
  'home.feature_progress_tracking': { en: 'Real-time student progress tracking', km: 'តាមដានវឌ្ឍនភាពសិស្សក្នុងពេលវេលាជាក់ស្តែង' },
  'home.feature_bilingual': { en: 'Bilingual content and instructions', km: 'មាតិកា និងការណែនាំពីរភាសា' },
  'home.feature_development': { en: 'Professional development workshops', km: 'កិច្ចប្រជុំអភិវឌ្ឍន៍វិជ្ជាជីវៈ' },
  'home.ready_to_start': { en: 'Ready to Get Started?', km: 'ត្រៀមចាប់ផ្តើម?' },
  'home.join_community': { en: 'Join our community of innovative educators transforming STEM education in Cambodia', km: 'ចូលរួមជាមួយសហគមន៍អ្នកអប់រំប្រកបដោយភាពច្នៃប្រឌិតរបស់យើងដែលកំពុងបំប្លែងការអប់រំ STEM នៅកម្ពុជា' },
  'home.teacher_resources': { en: 'Teacher Resources', km: 'ធនធានគ្រូបង្រៀន' },
  'home.footer_description': { en: 'Inspiring the next generation of Cambodian scientists, engineers, and innovators through world-class interactive simulations.', km: 'បំផុសទឹកចិត្តជំនាន់ក្រោយនៃអ្នកវិទ្យាសាស្ត្រ វិស្វករ និងអ្នកច្នៃប្រឌិតកម្ពុជាតាមរយៈការក្លែងធ្វើអន្តរកម្មកម្រិតពិភពលោក។' },
  'home.proudly_serving': { en: '🇰🇭 Proudly serving Cambodia\'s future', km: '🇰🇭 បំរើអនាគតកម្ពុជាដោយមោទនភាព' },

  // Footer
  'footer.quick_links': { en: 'Quick Links', km: 'តំណរហ័ស' },
  'footer.physics_sims': { en: 'Physics Simulations', km: 'ការក្លែងធ្វើរូបវិទ្យា' },
  'footer.chemistry_labs': { en: 'Chemistry Labs', km: 'មន្ទីរពិសោធន៍គីមីវិទ្យា' },
  'footer.biology_experiments': { en: 'Biology Experiments', km: 'ការពិសោធន៍ជីវវិទ្យា' },
  'footer.math_visualizations': { en: 'Math Visualizations', km: 'ការបង្ហាញគណិតវិទ្យា' },
  'footer.for_educators': { en: 'For Educators', km: 'សម្រាប់អ្នកអប់រំ' },
  'footer.teacher_resources': { en: 'Teacher Resources', km: 'ធនធានគ្រូបង្រៀន' },
  'footer.professional_development': { en: 'Professional Development', km: 'ការអភិវឌ្ឍន៍វិជ្ជាជីវៈ' },
  'footer.curriculum_alignment': { en: 'Curriculum Alignment', km: 'ការតម្រឹមកម្មវិធីសិក្សា' },
  'footer.assessment_tools': { en: 'Assessment Tools', km: 'ឧបករណ៍វាយតម្លៃ' },
  'footer.copyright': { en: '© 2024 Virtual Lab Cambodia. Empowering STEM education with interactive simulations.', km: '© 2024 មន្ទីរពិសោធន៍និម្មិតកម្ពុជា។ ពង្រឹងការអប់រំ STEM ជាមួយការក្លែងធ្វើអន្តរកម្ម។' },
  'footer.built_with_love': { en: 'Built with ❤️ for Cambodia\'s future scientists', km: 'បង្កើតដោយ ❤️ សម្រាប់អ្នកវិទ្យាសាស្ត្រអនាគតកម្ពុជា' },

  // UI Common
  'ui.loading': { en: 'Loading...', km: 'កំពុងផ្ទុក...' },
  'ui.explore': { en: 'Explore', km: 'ស្វែងរក' },
  'ui.simulations': { en: 'Simulations', km: 'ការក្លែងធ្វើ' },

  // Subjects
  'subjects.physics': { en: 'Physics', km: 'រូបវិទ្យា' },
  'subjects.chemistry': { en: 'Chemistry', km: 'គីមីវិទ្យា' },
  'subjects.biology': { en: 'Biology', km: 'ជីវវិទ្យា' },
  'subjects.mathematics': { en: 'Mathematics', km: 'គណិតវិទ្យា' },

  // File types
  'file.document': { en: 'Document', km: 'ឯកសារ' },
  'file.image': { en: 'Image', km: 'រូបភាព' },
  'file.video': { en: 'Video', km: 'វីដេអូ' },
  'file.audio': { en: 'Audio', km: 'សំឡេង' },
  'file.simulation': { en: 'Simulation', km: 'ការក្លែងធ្វើ' },
  'file.worksheet': { en: 'Worksheet', km: 'សន្លឹកការងារ' },
  'file.rubric': { en: 'Rubric', km: 'លក្ខណៈវិនិច្ឆ័យ' },
  'file.manual': { en: 'Manual', km: 'សៀវភៅណែនាំ' }
};

// Get browser language preference
export function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'km';
  
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('en')) return 'en';
  return 'km'; // Default to Khmer for Cambodian students
}

// Get user's preferred language from localStorage
export function getUserLanguage(): Language {
  if (typeof window === 'undefined') return 'km';
  
  const stored = localStorage.getItem('preferred_language') as Language;
  return stored || getBrowserLanguage();
}

// Set user's preferred language
export function setUserLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('preferred_language', lang);
  document.documentElement.lang = lang;
  
  // Update document direction for Khmer
  document.documentElement.dir = lang === 'km' ? 'ltr' : 'ltr';
}

// Translation function
export function t(key: string, lang?: Language): string {
  const currentLang = lang || getUserLanguage();
  const translation = translations[key];
  
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  
  return translation[currentLang] || translation.km || translation.en || key;
}

// Get translated content from object with multiple language fields
export function getLocalizedContent(
  content: { [key: string]: any }, 
  baseKey: string, 
  lang?: Language
): string {
  const currentLang = lang || getUserLanguage();
  
  // Try current language first
  const localizedKey = currentLang === 'km' ? `${baseKey}_km` : baseKey;
  if (content[localizedKey]) {
    return content[localizedKey];
  }
  
  // Fallback to Khmer first, then English
  const khmerKey = `${baseKey}_km`;
  if (content[khmerKey]) {
    return content[khmerKey];
  }
  
  if (content[baseKey]) {
    return content[baseKey];
  }
  
  // If no content found, return empty string
  return '';
}

// Format date according to language
export function formatDate(date: Date | string, lang?: Language): string {
  const currentLang = lang || getUserLanguage();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (currentLang === 'km') {
    // Khmer date format
    return dateObj.toLocaleDateString('km-KH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else {
    // English date format
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

// Format time according to language
export function formatTime(date: Date | string, lang?: Language): string {
  const currentLang = lang || getUserLanguage();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString(currentLang === 'km' ? 'km-KH' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format number according to language
export function formatNumber(num: number, lang?: Language): string {
  const currentLang = lang || getUserLanguage();
  
  return num.toLocaleString(currentLang === 'km' ? 'km-KH' : 'en-US');
}

// Pluralization helper
export function pluralize(
  count: number, 
  singular: string, 
  plural?: string, 
  lang?: Language
): string {
  const currentLang = lang || getUserLanguage();
  
  if (currentLang === 'km') {
    // Khmer doesn't have plural forms like English
    return t(singular, lang);
  } else {
    return count === 1 ? t(singular, lang) : t(plural || `${singular}s`, lang);
  }
}

// Language selector options (Khmer first as primary language for Cambodian students)
export const languageOptions = [
  { value: 'km', label: 'Khmer', nativeLabel: 'ខ្មែរ' },
  { value: 'en', label: 'English', nativeLabel: 'English' }
];

// Check if language is RTL (not applicable for supported languages, but kept for extensibility)
export function isRTL(lang?: Language): boolean {
  const currentLang = lang || getUserLanguage();
  return false; // Neither English nor Khmer are RTL
}

// Get font class for language
export function getFontClass(lang?: Language): string {
  const currentLang = lang || getUserLanguage();
  return currentLang === 'km' ? 'font-hanuman' : 'font-sans';
}

// Create a React hook for translations (if using React)
export function useTranslation(initialLang?: Language) {
  const [language, setLanguage] = React.useState(
    initialLang || getUserLanguage()
  );
  
  const changeLanguage = (newLang: Language) => {
    setUserLanguage(newLang);
    setLanguage(newLang);
  };
  
  const translate = (key: string) => t(key, language);
  
  return {
    language,
    changeLanguage,
    t: translate,
    formatDate: (date: Date | string) => formatDate(date, language),
    formatTime: (date: Date | string) => formatTime(date, language),
    formatNumber: (num: number) => formatNumber(num, language),
    getLocalizedContent: (content: any, baseKey: string) => 
      getLocalizedContent(content, baseKey, language)
  };
}

// Export React import for the hook
const React = typeof window !== 'undefined' ? require('react') : { useState: () => {} };