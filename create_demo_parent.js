const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user@localhost:5432/virtual_lab'
});

async function createDemoParent() {
  const client = await pool.connect();
  
  try {
    console.log('Creating demo parent user...');
    
    // Hash the password
    const passwordHash = bcrypt.hashSync('demo123', 10);
    console.log('Password hash generated:', passwordHash);
    
    // Create demo parent user
    const userQuery = `
      INSERT INTO users (id, name, email, username, password_hash, roles, phone_number, address, date_of_birth, created_at) VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        username = EXCLUDED.username,
        password_hash = EXCLUDED.password_hash,
        roles = EXCLUDED.roles,
        phone_number = EXCLUDED.phone_number,
        address = EXCLUDED.address,
        date_of_birth = EXCLUDED.date_of_birth
      RETURNING id, name, email;
    `;
    
    const userResult = await client.query(userQuery, [
      '99999999-9999-9999-9999-999999999999',
      'Demo Parent',
      'parent@vlab.edu.kh',
      'parent@vlab.edu.kh',
      passwordHash,
      ['parent'],
      '+855 12 999 999',
      'Demo Address, Phnom Penh, Cambodia',
      '1985-06-15'
    ]);
    
    console.log('Demo parent user created/updated:', userResult.rows[0]);
    
    // Link to demo student (assuming it exists)
    const relationshipQuery = `
      INSERT INTO parent_student_relationships (parent_id, student_id, relationship_type, is_primary_contact, can_pickup, can_receive_reports, emergency_contact_priority, created_at) VALUES
      ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (parent_id, student_id) DO UPDATE SET
        relationship_type = EXCLUDED.relationship_type,
        is_primary_contact = EXCLUDED.is_primary_contact,
        can_pickup = EXCLUDED.can_pickup,
        can_receive_reports = EXCLUDED.can_receive_reports,
        emergency_contact_priority = EXCLUDED.emergency_contact_priority
      RETURNING *;
    `;
    
    const relationshipResult = await client.query(relationshipQuery, [
      '99999999-9999-9999-9999-999999999999',
      '11111111-1111-1111-1111-111111111111', // Demo student ID
      'parent',
      true,
      true, 
      true,
      1
    ]);
    
    console.log('Parent-student relationship created:', relationshipResult.rows[0]);
    
    // Test authentication
    console.log('\nTesting authentication...');
    const authQuery = `
      SELECT id, name, email, roles, password_hash
      FROM users 
      WHERE email = $1
    `;
    
    const authResult = await client.query(authQuery, ['parent@vlab.edu.kh']);
    if (authResult.rows.length > 0) {
      const user = authResult.rows[0];
      const isValid = bcrypt.compareSync('demo123', user.password_hash);
      console.log('Authentication test result:', isValid ? 'SUCCESS' : 'FAILED');
      console.log('User found:', { id: user.id, name: user.name, email: user.email, roles: user.roles });
    } else {
      console.log('Authentication test: User not found');
    }
    
    console.log('\n✅ Demo parent setup complete!');
    console.log('You can now login with:');
    console.log('Email: parent@vlab.edu.kh');
    console.log('Password: demo123');
    
  } catch (error) {
    console.error('Error creating demo parent:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createDemoParent().catch(console.error);