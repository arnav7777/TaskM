import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import path from 'path';

dotenv.config();

const app = express();
const port = 5000;
const __dirname = path.resolve();

process.env.TZ = 'Asia/Kolkata';

app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

connection.connect();
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Validation schemas
const userSchema = Joi.object({
    firstname: Joi.string().alphanum().min(3).max(30).required(),
    lastname: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
        .required()
        .messages({
            'string.pattern.base': 'Password must be atleast 8 characters long and include atleast one letter, one number, and one special character.'
        }),
    confirmPassword: Joi.string()
        .min(8)
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords must match',
            'string.min': 'Confirm password must be at least 8 characters long'
        })
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
});

const googleLoginSchema = Joi.object({
    email: Joi.string().email().required()
});

const taskSchema = Joi.object({
    taskname: Joi.string().required(),
    description: Joi.string().required(),
    createdAt: Joi.date().required(),
    status: Joi.string().required()
});

const updateTaskSchema = Joi.object({
    id: Joi.number().optional(),    
    taskname: Joi.string().optional(),
    description: Joi.string().optional(),
    createdAt: Joi.date().optional(),
    status: Joi.string().optional()
});

// Register User API
app.post('/register', async (req, res) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { firstname, lastname, email, password } = req.body;

    try {
        connection.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) return res.status(500).json({ error: 'Database error' });
            if (results.length > 0) return res.status(400).json({ error: 'Email already registered' });

            const hashedPassword = await bcrypt.hash(password, 10);

            connection.query('INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)',
                [firstname, lastname, email, hashedPassword],
                (error, results) => {
                    if (error) return res.status(500).json({ error: 'Database error' });

                    res.status(201).json({ message: 'User registered successfully' });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login User API
app.post('/login', (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    try {
        connection.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) return res.status(500).json({ error: 'Database error' });
            if (results.length === 0) return res.status(400).json({ error: 'Email not registered' });

            const user = results[0];

            if (!user.password) {
                return res.status(400).json({ error: 'Invalid password' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Invalid password' });
            }

            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ message: 'Login successful', token });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Google Login User API
app.post('/google-login', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ message: 'Database error' });
            }

            if (results.length > 0) {
                const user = results[0];
                if (user.password) {
                    // Password is not null, meaning user is registered via form
                    return res.json({ message: 'Email already registered via form. Please use email/password login.' });
                } else {
                    // User exists but has no password, login with Google
                    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
                    return res.json({ exists: true, token, message: 'Login successful with Google' });
                }
            } else {
                // User does not exist, insert user details and create token
                connection.query(
                    'INSERT INTO users (email, firstname, lastname) VALUES (?, ?, ?)',
                    [email, email, email], // Assuming email used as firstname and lastname as placeholder
                    (error, results) => {
                        if (error) {
                            console.error('Database error:', error);
                            return res.status(500).json({ message: 'Database error' });
                        }
                        const token = jwt.sign({ id: results.insertId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
                        return res.json({ exists: false, token, message: 'User created and logged in with Google' });
                    }
                );
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Update Avatar API
app.post('/update-avatar', (req, res) => {
    const { email, avatar } = req.body;

    const query = 'UPDATE users SET avatar = ? WHERE email = ?';
    connection.query(query, [avatar, email], (err, results) => {
        if (err) {
            console.error('Error updating avatar:', err);
            res.status(500).json({ message: 'Error updating avatar' });
        } else {
            res.status(200).json({ message: 'Avatar updated successfully' });
        }
    });
});

// Get all tasks
app.get('/tasks', (req, res) => {
    connection.query('SELECT * FROM tasks', (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
    });
});

// Add a task
app.post('/tasks', (req, res) => {
    const { error } = taskSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { taskname, description, createdAt, status } = req.body;
    const formattedCreatedAt = new Date(createdAt).toISOString().slice(0, 19).replace('T', ' ');

    const sql = 'INSERT INTO tasks (taskname, description, createdAt, status) VALUES (?, ?, ?, ?)';
    connection.query(sql, [taskname, description, formattedCreatedAt, status], (err, results) => {
        if (err) {
            console.error('Error adding task:', err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.status(201).json({ id: results.insertId, taskname, description, createdAt: formattedCreatedAt, status });
    });
});

// Update a task
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { error } = updateTaskSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { taskname, description, createdAt, status } = req.body;
    const updateFields = [];
    const sqlParams = [];

    if (taskname !== undefined) {
        updateFields.push('taskname = ?');
        sqlParams.push(taskname);
    }
    if (description !== undefined) {
        updateFields.push('description = ?');
        sqlParams.push(description);
    }
    if (createdAt !== undefined) {
        const formattedCreatedAt = new Date(createdAt).toISOString().slice(0, 19).replace('T', ' ');
        updateFields.push('createdAt = ?');
        sqlParams.push(formattedCreatedAt);
    }
    if (status !== undefined) {
        updateFields.push('status = ?');
        sqlParams.push(status);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    const sql = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`;
    sqlParams.push(id);

    connection.query(sql, sqlParams, (err) => {
        if (err) {
            console.error('Error updating task:', err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.status(200).json({ id, taskname, description, createdAt: createdAt ? new Date(createdAt).toISOString().slice(0, 19).replace('T', ' ') : undefined, status });
    });
});

// Delete Task API
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    console.log('Received request data:', req.body);

    const sql = 'DELETE FROM tasks WHERE id = ?';
    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error deleting task:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    });
});

// Get user details
app.get('/admindetails', (req, res) => {
    const { username } = req.query;

    if (username) {
        connection.query('SELECT * FROM users WHERE email = ?', [username], (error, results) => {
            if (error) {
                console.error('Error fetching admin details:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(results);
        });
    } else {
        connection.query('SELECT * FROM users', (error, results) => {
            if (error) {
                console.error('Error fetching users:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(results);
        });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
  });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
