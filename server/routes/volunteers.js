const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Get all volunteers
router.get('/', (req, res) => {
  const query = 'SELECT * FROM volunteers ORDER BY name';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single volunteer by ID
router.get('/:id', (req, res) => {
  const query = 'SELECT * FROM volunteers WHERE id = ?';
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Volunteer not found' });
      return;
    }
    res.json(row);
  });
});

// Create new volunteer
router.post('/', (req, res) => {
  const { name, email, phone } = req.body;
  
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  
  const query = 'INSERT INTO volunteers (name, email, phone) VALUES (?, ?, ?)';
  
  db.run(query, [name, email || null, phone || null], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }
    
    res.status(201).json({ id: this.lastID, message: 'Volunteer created successfully' });
  });
});

// Update volunteer
router.put('/:id', (req, res) => {
  const { name, email, phone } = req.body;
  
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  
  const query = 'UPDATE volunteers SET name = ?, email = ?, phone = ? WHERE id = ?';
  
  db.run(query, [name, email || null, phone || null, req.params.id], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Volunteer not found' });
      return;
    }
    
    res.json({ message: 'Volunteer updated successfully' });
  });
});

// Delete volunteer
router.delete('/:id', (req, res) => {
  // Check if volunteer has assigned dogs
  const checkQuery = 'SELECT COUNT(*) as count FROM dogs WHERE assigned_volunteer_id = ? AND is_active = 1';
  
  db.get(checkQuery, [req.params.id], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (result.count > 0) {
      res.status(400).json({ 
        error: 'Cannot delete volunteer with assigned dogs. Please reassign dogs first.' 
      });
      return;
    }
    
    // Proceed with deletion
    const deleteQuery = 'DELETE FROM volunteers WHERE id = ?';
    
    db.run(deleteQuery, [req.params.id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Volunteer not found' });
        return;
      }
      
      res.json({ message: 'Volunteer deleted successfully' });
    });
  });
});

// Get volunteer's assigned dogs
router.get('/:id/dogs', (req, res) => {
  const query = `
    SELECT d.*, 
           COUNT(dt.id) as total_tasks,
           SUM(CASE WHEN tc.completed_at IS NOT NULL AND date(tc.completed_at) = date('now') THEN 1 ELSE 0 END) as completed_today
    FROM dogs d
    LEFT JOIN dog_tasks dt ON d.id = dt.dog_id AND dt.is_active = 1
    LEFT JOIN task_completions tc ON dt.id = tc.dog_task_id
    WHERE d.assigned_volunteer_id = ? AND d.is_active = 1
    GROUP BY d.id
    ORDER BY d.name
  `;
  
  db.all(query, [req.params.id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;