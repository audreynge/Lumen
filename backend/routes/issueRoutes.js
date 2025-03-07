import express from 'express';
import Issue from '../models/Issue.js';

const router = express.Router();

// get all issues
router.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (err) { 
    res.status(500).json({ error: err.message });
  }
})

// create new issue
router.post('/issue', async (req, res) => {
  try {
    const newIssue = new Issue(req.body);
    await newIssue.save();
    res.status(201).json(newIssue);
  } catch {
    res.status(400).json({ error: err.message });
  }
});

export default router;