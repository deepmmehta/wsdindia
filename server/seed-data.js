const { db } = require('./database');

const seedData = () => {
  console.log('🌱 Seeding database with sample data...');

  // Sample volunteers
  const volunteers = [
    { name: 'Priya Sharma', email: 'priya@gmail.com', phone: '+91 98765 43210' },
    { name: 'Arjun Patel', email: 'arjun.patel@yahoo.com', phone: '+91 87654 32109' },
    { name: 'Meera Singh', email: 'meera.singh@outlook.com', phone: '+91 76543 21098' },
    { name: 'Rahul Kumar', email: 'rahul.k@gmail.com', phone: null },
    { name: 'Kavya Reddy', email: null, phone: '+91 65432 10987' }
  ];

  // Insert volunteers
  const insertVolunteer = db.prepare(`
    INSERT OR IGNORE INTO volunteers (name, email, phone)
    VALUES (?, ?, ?)
  `);

  volunteers.forEach(volunteer => {
    insertVolunteer.run(volunteer.name, volunteer.email, volunteer.phone);
  });

  // Sample dogs
  const dogs = [
    {
      name: 'Buddy',
      tag_number: 'WSD001',
      gender: 'Male',
      age: 3,
      health_notes: 'Healthy, up to date with vaccinations. Slight limp on left hind leg.',
      behavior_notes: 'Very friendly and social. Good with children and other dogs.',
      assigned_volunteer_id: 1
    },
    {
      name: 'Bella',
      tag_number: 'WSD002', 
      gender: 'Female',
      age: 2,
      health_notes: 'Recently treated for tick fever. Needs monthly heartworm prevention.',
      behavior_notes: 'Shy initially but warms up quickly. Loves belly rubs.',
      assigned_volunteer_id: 2
    },
    {
      name: 'Charlie',
      tag_number: 'WSD003',
      gender: 'Male',
      age: 5,
      health_notes: 'Arthritis in joints, needs daily anti-inflammatory medication.',
      behavior_notes: 'Calm and gentle. Good therapy dog candidate.',
      assigned_volunteer_id: 1
    },
    {
      name: 'Luna',
      tag_number: 'WSD004',
      gender: 'Female',
      age: 1,
      health_notes: 'Young and healthy. Due for spaying next month.',
      behavior_notes: 'Very energetic puppy. Needs lots of exercise and training.',
      assigned_volunteer_id: 3
    },
    {
      name: 'Max',
      tag_number: 'WSD005',
      gender: 'Male',
      age: 7,
      health_notes: 'Senior dog with mild hip dysplasia. Regular vet checkups needed.',
      behavior_notes: 'Wise and calm. Good with new volunteers. Alpha personality.',
      assigned_volunteer_id: 2
    },
    {
      name: 'Daisy',
      tag_number: 'WSD006',
      gender: 'Female',
      age: 4,
      health_notes: 'Recovering from mange treatment. Skin is healing well.',
      behavior_notes: 'Sweet and gentle. Loves attention and treats.',
      assigned_volunteer_id: 4
    },
    {
      name: 'Rocky',
      tag_number: 'WSD007',
      gender: 'Male',
      age: 6,
      health_notes: 'Lost left eye in accident. Otherwise healthy and adapting well.',
      behavior_notes: 'Protective but not aggressive. Needs patient approach.',
      assigned_volunteer_id: null
    },
    {
      name: 'Ginger',
      tag_number: 'WSD008',
      gender: 'Female',
      age: 3,
      health_notes: 'Pregnant, due in 3 weeks. Needs extra nutrition and care.',
      behavior_notes: 'Very protective of her space. Keep separated from other dogs.',
      assigned_volunteer_id: 5
    }
  ];

  // Insert dogs
  const insertDog = db.prepare(`
    INSERT OR IGNORE INTO dogs (name, tag_number, gender, age, health_notes, behavior_notes, assigned_volunteer_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  dogs.forEach(dog => {
    const result = insertDog.run(
      dog.name, 
      dog.tag_number, 
      dog.gender, 
      dog.age, 
      dog.health_notes, 
      dog.behavior_notes, 
      dog.assigned_volunteer_id
    );

    // Create default tasks for each dog
    if (result.changes > 0) {
      const dogId = result.lastInsertRowid;
      createDefaultTasksForDog(dogId);
    }
  });

  console.log('✅ Sample data seeded successfully!');
  console.log(`📊 Added ${volunteers.length} volunteers and ${dogs.length} dogs`);
  console.log('🎯 Default tasks (Walk, Bath, Feeding) created for all dogs');
};

// Helper function to create default tasks
function createDefaultTasksForDog(dogId) {
  const defaultTaskQuery = `
    INSERT INTO dog_tasks (dog_id, task_type_id, frequency_type, frequency_value)
    SELECT ?, id, default_frequency_type, default_frequency_value 
    FROM task_types 
    WHERE is_active = 1 AND name IN ('Walk', 'Bath', 'Feeding')
  `;
  
  db.run(defaultTaskQuery, [dogId], (err) => {
    if (err) {
      console.error('Error creating default tasks for dog:', err);
    }
  });
}

module.exports = { seedData };

// Run seeding if this file is executed directly
if (require.main === module) {
  const { initDatabase } = require('./database');
  initDatabase();
  seedData();
}