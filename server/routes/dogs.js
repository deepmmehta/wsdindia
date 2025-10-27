const express = require('express');
const { db } = require('../database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'dog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all dogs with optional filters
router.get('/', (req, res) => {
  const { search, volunteer_id, active_only = 'true' } = req.query;
  
  let query = `
    SELECT d.*, v.name as volunteer_name 
    FROM dogs d 
    LEFT JOIN volunteers v ON d.assigned_volunteer_id = v.id
  `;
  
  const conditions = [];
  const params = [];
  
  if (active_only === 'true') {
    conditions.push('d.is_active = 1');
  }
  
  if (search) {
    conditions.push('(d.name LIKE ? OR d.tag_number LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (volunteer_id) {
    conditions.push('d.assigned_volunteer_id = ?');
    params.push(volunteer_id);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY d.name';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single dog by ID
router.get('/:id', (req, res) => {
  const query = `
    SELECT d.*, v.name as volunteer_name 
    FROM dogs d 
    LEFT JOIN volunteers v ON d.assigned_volunteer_id = v.id
    WHERE d.id = ?
  `;
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Dog not found' });
      return;
    }
    res.json(row);
  });
});

// Create new dog
router.post('/', upload.single('photo'), (req, res) => {
  const {
    name, tag_number, gender, age, date_of_birth,
    health_notes, behavior_notes, assigned_volunteer_id
  } = req.body;
  
  const photo = req.file ? `/uploads/${req.file.filename}` : null;
  
  const query = `
    INSERT INTO dogs (name, photo, tag_number, gender, age, date_of_birth, 
                     health_notes, behavior_notes, assigned_volunteer_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    name, photo, tag_number, gender, age || null, date_of_birth || null,
    health_notes || null, behavior_notes || null, assigned_volunteer_id || null
  ];
  
  db.run(query, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Create default tasks for the new dog
    const dogId = this.lastID;
    createDefaultTasksForDog(dogId);
    
    res.status(201).json({ id: dogId, message: 'Dog created successfully' });
  });
});

// Update dog
router.put('/:id', upload.single('photo'), (req, res) => {
  const {
    name, tag_number, gender, age, date_of_birth,
    health_notes, behavior_notes, assigned_volunteer_id
  } = req.body;
  
  // Get current dog data to preserve existing photo if no new one uploaded
  db.get('SELECT photo FROM dogs WHERE id = ?', [req.params.id], (err, currentDog) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const photo = req.file ? `/uploads/${req.file.filename}` : currentDog?.photo;
    
    const query = `
      UPDATE dogs 
      SET name = ?, photo = ?, tag_number = ?, gender = ?, age = ?, 
          date_of_birth = ?, health_notes = ?, behavior_notes = ?, 
          assigned_volunteer_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const params = [
      name, photo, tag_number, gender, age || null, date_of_birth || null,
      health_notes || null, behavior_notes || null, assigned_volunteer_id || null,
      req.params.id
    ];
    
    db.run(query, params, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Dog not found' });
        return;
      }
      
      res.json({ message: 'Dog updated successfully' });
    });
  });
});

// Deactivate dog (soft delete)
router.patch('/:id/deactivate', (req, res) => {
  const query = 'UPDATE dogs SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  
  db.run(query, [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Dog not found' });
      return;
    }
    
    res.json({ message: 'Dog deactivated successfully' });
  });
});

// Reactivate dog
router.patch('/:id/reactivate', (req, res) => {
  const query = 'UPDATE dogs SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  
  db.run(query, [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Dog not found' });
      return;
    }
    
    res.json({ message: 'Dog reactivated successfully' });
  });
});

// Helper function to create default tasks for a new dog
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

module.exports = router;