const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Get all task types
router.get('/types', (req, res) => {
  const query = 'SELECT * FROM task_types WHERE is_active = 1 ORDER BY name';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get tasks for a specific dog
router.get('/dog/:dogId', (req, res) => {
  const query = `
    SELECT dt.*, tt.name as task_name, tt.description,
           (SELECT MAX(completed_at) FROM task_completions tc WHERE tc.dog_task_id = dt.id) as last_completed
    FROM dog_tasks dt
    JOIN task_types tt ON dt.task_type_id = tt.id
    WHERE dt.dog_id = ? AND dt.is_active = 1
    ORDER BY tt.name
  `;
  
  db.all(query, [req.params.dogId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Calculate task status for each task
    const tasksWithStatus = rows.map(task => {
      const status = calculateTaskStatus(task);
      return { ...task, status };
    });
    
    res.json(tasksWithStatus);
  });
});

// Get dashboard data (all dogs with their task statuses)
router.get('/dashboard', (req, res) => {
  const { volunteer_id, task_filter } = req.query;
  
  let dogFilter = 'WHERE d.is_active = 1';
  const params = [];
  
  if (volunteer_id) {
    dogFilter += ' AND d.assigned_volunteer_id = ?';
    params.push(volunteer_id);
  }
  
  const query = `
    SELECT d.id, d.name, d.tag_number, d.assigned_volunteer_id,
           v.name as volunteer_name,
           dt.id as task_id, dt.frequency_type, dt.frequency_value, dt.due_date,
           tt.name as task_name, tt.id as task_type_id,
           (SELECT MAX(completed_at) FROM task_completions tc WHERE tc.dog_task_id = dt.id) as last_completed
    FROM dogs d
    LEFT JOIN volunteers v ON d.assigned_volunteer_id = v.id
    LEFT JOIN dog_tasks dt ON d.id = dt.dog_id AND dt.is_active = 1
    LEFT JOIN task_types tt ON dt.task_type_id = tt.id AND tt.is_active = 1
    ${dogFilter}
    ORDER BY d.name, tt.name
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Group by dog and calculate task statuses
    const dogsMap = new Map();
    
    rows.forEach(row => {
      if (!dogsMap.has(row.id)) {
        dogsMap.set(row.id, {
          id: row.id,
          name: row.name,
          tag_number: row.tag_number,
          assigned_volunteer_id: row.assigned_volunteer_id,
          volunteer_name: row.volunteer_name,
          tasks: []
        });
      }
      
      if (row.task_id) {
        const task = {
          id: row.task_id,
          task_type_id: row.task_type_id,
          task_name: row.task_name,
          frequency_type: row.frequency_type,
          frequency_value: row.frequency_value,
          due_date: row.due_date,
          last_completed: row.last_completed
        };
        
        task.status = calculateTaskStatus(task);
        dogsMap.get(row.id).tasks.push(task);
      }
    });
    
    let dogs = Array.from(dogsMap.values());
    
    // Apply task filter if specified
    if (task_filter) {
      dogs = dogs.filter(dog => 
        dog.tasks.some(task => task.status === task_filter)
      );
    }
    
    res.json(dogs);
  });
});

// Create task for a dog
router.post('/dog/:dogId', (req, res) => {
  const { task_type_id, frequency_type, frequency_value, due_date } = req.body;
  
  const query = `
    INSERT INTO dog_tasks (dog_id, task_type_id, frequency_type, frequency_value, due_date)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const params = [
    req.params.dogId, task_type_id, frequency_type, 
    frequency_value || null, due_date || null
  ];
  
  db.run(query, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.status(201).json({ id: this.lastID, message: 'Task created successfully' });
  });
});

// Complete a task
router.post('/:taskId/complete', (req, res) => {
  const { volunteer_id, notes } = req.body;
  
  const query = `
    INSERT INTO task_completions (dog_task_id, completed_by_volunteer_id, notes)
    VALUES (?, ?, ?)
  `;
  
  db.run(query, [req.params.taskId, volunteer_id || null, notes || null], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.status(201).json({ id: this.lastID, message: 'Task completed successfully' });
  });
});

// Get task completion history
router.get('/:taskId/completions', (req, res) => {
  const query = `
    SELECT tc.*, v.name as volunteer_name
    FROM task_completions tc
    LEFT JOIN volunteers v ON tc.completed_by_volunteer_id = v.id
    WHERE tc.dog_task_id = ?
    ORDER BY tc.completed_at DESC
    LIMIT 10
  `;
  
  db.all(query, [req.params.taskId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Update task
router.put('/:taskId', (req, res) => {
  const { frequency_type, frequency_value, due_date } = req.body;
  
  const query = `
    UPDATE dog_tasks 
    SET frequency_type = ?, frequency_value = ?, due_date = ?
    WHERE id = ?
  `;
  
  db.run(query, [frequency_type, frequency_value || null, due_date || null, req.params.taskId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    res.json({ message: 'Task updated successfully' });
  });
});

// Delete task
router.delete('/:taskId', (req, res) => {
  const query = 'UPDATE dog_tasks SET is_active = 0 WHERE id = ?';
  
  db.run(query, [req.params.taskId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    res.json({ message: 'Task deleted successfully' });
  });
});

// Helper function to calculate task status
function calculateTaskStatus(task) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // If it's a fixed date task
  if (task.frequency_type === 'fixed_date' && task.due_date) {
    const dueDate = new Date(task.due_date);
    if (dueDate < today) {
      return 'overdue';
    } else if (dueDate.getTime() === today.getTime()) {
      return task.last_completed && 
             new Date(task.last_completed).toDateString() === today.toDateString() 
             ? 'done' : 'due';
    } else {
      return 'not_due';
    }
  }
  
  // For recurring tasks
  if (!task.last_completed) {
    return 'overdue'; // Never been done
  }
  
  const lastCompleted = new Date(task.last_completed);
  const daysSinceLastCompletion = Math.floor((today - lastCompleted) / (1000 * 60 * 60 * 24));
  
  // Check if completed today
  if (lastCompleted.toDateString() === today.toDateString()) {
    return 'done';
  }
  
  let frequencyDays;
  switch (task.frequency_type) {
    case 'daily':
      frequencyDays = 1;
      break;
    case 'weekly':
      frequencyDays = 7;
      break;
    case 'custom_days':
      frequencyDays = task.frequency_value || 1;
      break;
    default:
      frequencyDays = 1;
  }
  
  if (daysSinceLastCompletion >= frequencyDays) {
    return 'overdue';
  } else {
    return 'not_due';
  }
}

module.exports = router;