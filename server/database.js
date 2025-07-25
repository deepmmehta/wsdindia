const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'wsd_database.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initDatabase = () => {
  db.serialize(() => {
    // Volunteers table
    db.run(`
      CREATE TABLE IF NOT EXISTS volunteers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Dogs table
    db.run(`
      CREATE TABLE IF NOT EXISTS dogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        photo TEXT,
        tag_number TEXT UNIQUE,
        gender TEXT CHECK(gender IN ('Male', 'Female', 'Unknown')),
        age INTEGER,
        date_of_birth DATE,
        health_notes TEXT,
        behavior_notes TEXT,
        assigned_volunteer_id INTEGER,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_volunteer_id) REFERENCES volunteers (id)
      )
    `);

    // Task types table
    db.run(`
      CREATE TABLE IF NOT EXISTS task_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        default_frequency_type TEXT CHECK(default_frequency_type IN ('daily', 'weekly', 'custom_days', 'fixed_date')),
        default_frequency_value INTEGER,
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Dog tasks table (specific task assignments for dogs)
    db.run(`
      CREATE TABLE IF NOT EXISTS dog_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dog_id INTEGER NOT NULL,
        task_type_id INTEGER NOT NULL,
        frequency_type TEXT CHECK(frequency_type IN ('daily', 'weekly', 'custom_days', 'fixed_date')),
        frequency_value INTEGER,
        due_date DATE,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dog_id) REFERENCES dogs (id),
        FOREIGN KEY (task_type_id) REFERENCES task_types (id)
      )
    `);

    // Task completions table
    db.run(`
      CREATE TABLE IF NOT EXISTS task_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dog_task_id INTEGER NOT NULL,
        completed_by_volunteer_id INTEGER,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (dog_task_id) REFERENCES dog_tasks (id),
        FOREIGN KEY (completed_by_volunteer_id) REFERENCES volunteers (id)
      )
    `);

    // Insert default task types
    const defaultTasks = [
      { name: 'Walk', frequency_type: 'daily', frequency_value: 1, description: 'Daily walking exercise' },
      { name: 'Bath', frequency_type: 'custom_days', frequency_value: 14, description: 'Bathing every 2 weeks' },
      { name: 'Vaccination', frequency_type: 'fixed_date', frequency_value: null, description: 'Scheduled vaccinations' },
      { name: 'Feeding', frequency_type: 'daily', frequency_value: 1, description: 'Daily feeding' },
      { name: 'Medication', frequency_type: 'daily', frequency_value: 1, description: 'Daily medication administration' },
      { name: 'Vet Visit', frequency_type: 'fixed_date', frequency_value: null, description: 'Veterinary checkups' }
    ];

    const insertTask = db.prepare(`
      INSERT OR IGNORE INTO task_types (name, default_frequency_type, default_frequency_value, description)
      VALUES (?, ?, ?, ?)
    `);

    defaultTasks.forEach(task => {
      insertTask.run(task.name, task.frequency_type, task.frequency_value, task.description);
    });

    insertTask.finalize();

    // Insert default volunteer (Admin)
    db.run(`
      INSERT OR IGNORE INTO volunteers (name, email)
      VALUES ('Admin', 'admin@wsd-mumbai.org')
    `);

    console.log('Database initialized successfully');
  });
};

module.exports = { db, initDatabase };