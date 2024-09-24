import express from 'express';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import path from 'path';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import cors from 'cors';

// Create the express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase Admin SDK
const serviceAccount = await import('./serviceAccountKey.json', {
    assert: { type: 'json' }
}).then(module => module.default); // Use dynamic import for JSON file

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(path.resolve(), 'public'))); // Serve static files from public directory

// Record Access Endpoint
app.post('/api/access', async (req, res) => {
    const { studentId, role } = req.body; // Expecting role in the request body

    // Validate studentId and role
    if (!studentId || typeof studentId !== 'string' || !role || typeof role !== 'string') {
        console.error('Validation failed:', { studentId, role }); // Debug log
        return res.status(400).send({ error: 'Valid Student ID and role are required' });
    }

    try {
        const timestamp = Timestamp.now(); // Use Firestore's Timestamp to get the current timestamp
        console.log('Recording access for:', { studentId, role, timestamp: timestamp.toDate() }); // Debug log
        await db.collection('accessRecords').add({ studentId, role, timestamp });
        res.status(201).send({ message: 'Access recorded', timestamp: timestamp.toDate().toISOString() });
    } catch (error) {
        console.error('Error recording access:', error);
        res.status(500).send({ error: 'Error recording access' });
    }
});

// Fetch Access History Endpoint
app.get('/api/access', async (req, res) => {
    try {
        const snapshot = await db.collection('accessRecords').get();
        if (snapshot.empty) {
            console.log('No records found in Firestore'); // Debug log
            return res.status(404).send({ message: 'No records found' });
        }

        const records = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Fetched raw record:', data); // Debug log

            // Ensure timestamp exists and handle it safely
            let timestampString = null;
            if (data.timestamp instanceof admin.firestore.Timestamp) {
                timestampString = data.timestamp.toDate().toISOString();
            } else {
                console.error('Invalid or missing timestamp for record:', data); // Debug log
            }

            return {
                id: doc.id,
                studentId: data.studentId,
                role: data.role,
                timestamp: timestampString // Assign the converted timestamp
            };
        });

        console.log('Fetched records:', records); // Debug log for all fetched records
        res.status(200).send(records);
    } catch (error) {
        console.error('Error fetching access records:', error);
        res.status(500).send({ error: 'Error fetching access records' });
    }
});

// Update User Status Endpoint
app.post('/api/updateStatus', async (req, res) => {
    const { studentId, status } = req.body; // Status can be 'active', 'suspended', or 'reactivated'

    if (!studentId || !status || !['active', 'suspended', 'reactivated'].includes(status)) {
        console.error('Validation failed for user status:', { studentId, status }); // Debug log
        return res.status(400).send({ error: 'Valid Student ID and status are required' });
    }

    try {
        const snapshot = await db.collection('users').where('studentId', '==', studentId).get();
        if (snapshot.empty) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Update all matching users
        const updates = snapshot.docs.map(doc => doc.ref.update({ status }));
        await Promise.all(updates); // Ensure all updates are resolved

        res.status(200).send({ message: `User ID ${studentId} updated to ${status}` });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).send({ error: 'Error updating user status' });
    }
});

// Add User Endpoint
app.post('/api/addUser', async (req, res) => {
    const { studentId, role } = req.body;

    if (!studentId || typeof studentId !== 'string' || !role || typeof role !== 'string') {
        console.error('Validation failed for adding user:', { studentId, role }); // Debug log
        return res.status(400).send({ error: 'Valid Student ID and role are required' });
    }

    try {
        await db.collection('users').add({ studentId, role, status: 'active' });
        res.status(201).send({ message: 'User added successfully' });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).send({ error: 'Error adding user' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
