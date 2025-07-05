const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:12345@localhost:5432/virtual_lab'
});

async function createDemoLabData() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Creating demo lab data...\n');
    
    // Get the demo student ID
    const studentResult = await client.query(
      "SELECT id, name FROM users WHERE email = 'student@vlab.edu.kh'"
    );
    
    if (studentResult.rows.length === 0) {
      console.log('❌ Demo student not found');
      return;
    }
    
    const studentId = studentResult.rows[0].id;
    const studentName = studentResult.rows[0].name;
    console.log(`👨‍🎓 Creating lab data for: ${studentName} (${studentId})`);
    
    // Create demo labs if they don't exist
    const labsData = [
      {
        id: '11111111-2222-3333-4444-555555555551',
        title: 'Physics: Motion and Forces',
        title_km: 'រូបវិទ្យា៖ ចលនា និង កម្លាំង',
        subject: 'Physics',
        description: 'Interactive lab exploring motion and forces',
        difficulty: 'intermediate'
      },
      {
        id: '11111111-2222-3333-4444-555555555552',
        title: 'Chemistry: Molecular Structures',
        title_km: 'គីមីវិទ្យា៖ រចនាសម្ព័ន្ធម៉ូលេគុល',
        subject: 'Chemistry',
        description: 'Explore molecular structures and bonds',
        difficulty: 'beginner'
      },
      {
        id: '11111111-2222-3333-4444-555555555553',
        title: 'Biology: Cell Division',
        title_km: 'ជីវវិទ្យា៖ ការបែងចែកកោសិកា',
        subject: 'Biology',
        description: 'Study mitosis and meiosis processes',
        difficulty: 'intermediate'
      },
      {
        id: '11111111-2222-3333-4444-555555555554',
        title: 'Mathematics: Geometry Proofs',
        title_km: 'គណិតវិទ្យា៖ ការបង្ហាញធរណីមាត្រ',
        subject: 'Mathematics',
        description: 'Interactive geometry proofs and theorems',
        difficulty: 'advanced'
      }
    ];
    
    console.log('\n📚 Creating demo labs...');
    for (const lab of labsData) {
      try {
        await client.query(`
          INSERT INTO lms_labs (id, title, subject, description, status, created_at)
          VALUES ($1, $2, $3, $4, 'published', NOW())
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            subject = EXCLUDED.subject,
            description = EXCLUDED.description,
            status = EXCLUDED.status
        `, [lab.id, lab.title, lab.subject, lab.description]);
        
        console.log(`  ✅ ${lab.title}`);
      } catch (error) {
        console.log(`  ⚠️  ${lab.title} - ${error.message}`);
      }
    }
    
    // Create lab sessions for the student
    console.log('\n🔬 Creating lab sessions...');
    const sessionsData = [
      {
        lab_id: '11111111-2222-3333-4444-555555555551',
        status: 'completed',
        duration: 45,
        daysAgo: 7
      },
      {
        lab_id: '11111111-2222-3333-4444-555555555552',
        status: 'completed',
        duration: 38,
        daysAgo: 5
      },
      {
        lab_id: '11111111-2222-3333-4444-555555555553',
        status: 'in_progress',
        duration: 22,
        daysAgo: 2
      },
      {
        lab_id: '11111111-2222-3333-4444-555555555554',
        status: 'in_progress',
        duration: 15,
        daysAgo: 1
      }
    ];
    
    for (const session of sessionsData) {
      try {
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - session.daysAgo);
        
        const endTime = session.status === 'completed' ? 
          new Date(startTime.getTime() + session.duration * 60000) : null;
        
        const sessionResult = await client.query(`
          INSERT INTO lab_sessions (lab_id, student_id, start_time, end_time, duration_minutes, status)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [session.lab_id, studentId, startTime, endTime, session.duration, session.status]);
        
        const sessionId = sessionResult.rows[0].id;
        
        // Create scores for completed sessions
        if (session.status === 'completed') {
          const score = 7 + Math.random() * 3; // Random score between 7-10
          
          await client.query(`
            INSERT INTO lab_scores (student_id, lab_id, auto_score, graded_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (student_id, lab_id) DO UPDATE SET
              auto_score = EXCLUDED.auto_score,
              graded_at = EXCLUDED.graded_at
          `, [studentId, session.lab_id, score, new Date()]);
          
          console.log(`  ✅ Session: ${labsData.find(l => l.id === session.lab_id)?.title} - Score: ${score.toFixed(1)}/10`);
        } else {
          console.log(`  🔄 Session: ${labsData.find(l => l.id === session.lab_id)?.title} - In Progress`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error creating session: ${error.message}`);
      }
    }
    
    // Test the updated query
    console.log('\n📊 Testing updated parent API query...');
    const childrenQuery = `
      SELECT 
        u.id,
        u.name as full_name,
        SPLIT_PART(u.name, ' ', 1) as first_name,
        SPLIT_PART(u.name, ' ', -1) as last_name,
        COALESCE(u.username, u.email) as username,
        u.profile_image as profile_picture_url,
        COALESCE(u.is_active::text, 'active') as academic_status,
        u.created_at as enrollment_date,
        lps.relationship_type,
        lps.is_primary_contact,
        COALESCE(u.grade_level::text, '5') as grade,
        COALESCE(
          (SELECT AVG(final_score) 
           FROM lab_scores 
           WHERE student_id = u.id AND final_score IS NOT NULL), 
          3.5
        ) as overall_gpa,
        85 + (RANDOM() * 15)::INTEGER as attendance_rate,
        (SELECT COUNT(DISTINCT lab_id) 
         FROM lab_sessions 
         WHERE student_id = u.id) as enrolled_courses,
        (SELECT COUNT(*) 
         FROM lab_sessions 
         WHERE student_id = u.id AND status IN ('in_progress', 'pending')) as pending_assignments
      FROM lms_parent_students lps
      JOIN users u ON lps.student_id = u.id
      WHERE lps.parent_id = (SELECT id FROM users WHERE email = 'parent@vlab.edu.kh')
        AND u.is_active = true
      ORDER BY lps.is_primary_contact DESC, u.name
    `;
    
    const result = await client.query(childrenQuery);
    
    if (result.rows.length > 0) {
      const child = result.rows[0];
      console.log(`\n✅ Updated child data for ${child.full_name}:`);
      console.log(`   Grade: ${child.grade}`);
      console.log(`   GPA: ${child.overall_gpa}`);
      console.log(`   Enrolled Labs: ${child.enrolled_courses}`);
      console.log(`   Pending Work: ${child.pending_assignments}`);
      console.log(`   Attendance: ${child.attendance_rate}%`);
    }
    
    console.log('\n🎉 Demo lab data created successfully!');
    console.log('\nYou can now login as parent@vlab.edu.kh (password: demo123) to see the lab progress!');
    
  } catch (error) {
    console.error('❌ Error creating demo lab data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createDemoLabData().catch(console.error);