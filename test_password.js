// Test password hashing
const bcrypt = require('bcryptjs');

async function testPassword() {
    const password = 'demo123';
    
    // Generate new hash
    const newHash = await bcrypt.hash(password, 10);
    console.log('New hash for demo123:', newHash);
    
    // Test against the hash we're using
    const existingHash = '$2a$10$YnvL9y9RY0.nQqQjT7m2..XM6RXVsP5P.RvUXbR7GNKrH1qgHZf';
    const isValid = await bcrypt.compare(password, existingHash);
    console.log('Is existing hash valid for demo123?', isValid);
    
    // Test with a correct hash
    const correctHash = '$2a$10$xQqQjT6W0h2Ehq3DKrZYOuUXbR7GNKrH1qgHZfKQzH8wFkqR8QqKq';
    const isCorrect = await bcrypt.compare(password, correctHash);
    console.log('Is correct hash valid for demo123?', isCorrect);
}

testPassword();