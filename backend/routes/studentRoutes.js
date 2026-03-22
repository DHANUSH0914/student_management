import express from 'express';
import Student from '../models/Student.js';

const router = express.Router();

// GET /api/students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find({});
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET /api/students/search
router.get('/search', async (req, res) => {
    try {
        const keyword = req.query.name;
        const students = await Student.find({
            name: { $regex: keyword, $options: 'i' }
        });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET /api/students/count
router.get('/count', async (req, res) => {
    try {
        const total = await Student.countDocuments({});
        res.json({ total });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET /api/students/:id
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: `Student not found with id: ${req.params.id}` });
        }
    } catch (error) {
        // Handle invalid ObjectId format as not found
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: `Student not found with id: ${req.params.id}` });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// POST /api/students
router.post('/', async (req, res) => {
    try {
        const { name, email, course, department } = req.body;
        
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: `Failed to add student: Email already in use` });
        }

        const student = new Student({
            name, email, course, department
        });

        const createdStudent = await student.save();
        res.status(201).json(createdStudent);
    } catch (error) {
        res.status(400).json({ message: `Failed to add student: ${error.message}` });
    }
});

// PUT /api/students/:id
router.put('/:id', async (req, res) => {
    try {
        const { name, email, course, department } = req.body;

        const student = await Student.findById(req.params.id);
        
        if (student) {
            student.name = name || student.name;
            student.email = email || student.email;
            student.course = course || student.course;
            student.department = department || student.department;

            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } else {
            res.status(404).json({ message: "Student not found" });
        }
    } catch (error) {
        res.status(400).json({ message: `Failed to update student: ${error.message}` });
    }
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        
        if (student) {
            await student.deleteOne();
            res.json({ message: "Student deleted successfully" });
        } else {
            res.status(404).json({ message: "Student not found" });
        }
    } catch (error) {
        // Handle invalid ObjectId format as not found
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;
