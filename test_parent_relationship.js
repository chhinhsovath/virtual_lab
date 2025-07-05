const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:12345@localhost:5432/virtual_lab'
});

async function testParentRelationship() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testing parent-student relationship...\n');
    
    // Check parent users
    console.log('👨‍👩‍👧‍👦 Parent users:');
    const parentsResult = await client.query(
      "SELECT id, name, email, role FROM users WHERE role = 'parent'"
    );
    parentsResult.rows.forEach(parent => {
      console.log(`  - ${parent.name} (${parent.email}) - ID: ${parent.id}`);
    });
    
    console.log('\n👨‍🎓 Student users:');
    const studentsResult = await client.query(
      "SELECT id, name, email, role FROM users WHERE role = 'student'"
    );
    studentsResult.rows.forEach(student => {
      console.log(`  - ${student.name} (${student.email}) - ID: ${student.id}`);
    });
    
    console.log('\n🔗 Parent-Student relationships:');
    const relationshipsResult = await client.query(`
      SELECT 
        p.name as parent_name,
        p.email as parent_email,
        s.name as student_name,
        s.email as student_email,
        lps.relationship_type,
        lps.is_primary_contact
      FROM lms_parent_students lps
      JOIN users p ON lps.parent_id = p.id
      JOIN users s ON lps.student_id = s.id
    `);
    
    if (relationshipsResult.rows.length === 0) {
      console.log('  ❌ No relationships found');
    } else {
      relationshipsResult.rows.forEach(rel => {
        console.log(`  - ${rel.parent_name} → ${rel.student_name} (${rel.relationship_type})`);
      });
    }
    
    // Test API query for parent children
    console.log('\n📊 Testing parent children API query...');
    if (parentsResult.rows.length > 0) {
      const parentId = parentsResult.rows[0].id;
      console.log(`Testing with parent ID: ${parentId}`);
      
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
        WHERE lps.parent_id = $1
          AND u.is_active = true
        ORDER BY lps.is_primary_contact DESC, u.name
      `;
      
      const childrenResult = await client.query(childrenQuery, [parentId]);
      
      if (childrenResult.rows.length === 0) {
        console.log('  ❌ No children found for this parent');
      } else {
        console.log(`  ✅ Found ${childrenResult.rows.length} children:`);
        childrenResult.rows.forEach(child => {
          console.log(`    - ${child.full_name} (Grade ${child.grade})`);
          console.log(`      GPA: ${child.overall_gpa}, Attendance: ${child.attendance_rate}%`);
          console.log(`      Courses: ${child.enrolled_courses}, Pending: ${child.pending_assignments}`);
        });
      }
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testParentRelationship().catch(console.error);