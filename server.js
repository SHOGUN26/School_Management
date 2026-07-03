import express from 'express';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import absenceRoutes from './routes/absenceRoutes.js';
import gradeRoutes from './routes/gradeRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teacherClasseRoutes from './routes/teacherClasseRoutes.js';





const app = express();

app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teacher-classes', teacherClasseRoutes);



app.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});
