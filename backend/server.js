const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Pharmaceutical API running' }));

app.use('/api/auth',              require('./routes/auth'));
app.use('/api/drugs',             require('./routes/drugs'));
app.use('/api/interactions',      require('./routes/interactions'));
app.use('/api/ingredients',       require('./routes/ingredients'));
app.use('/api/sideeffects',       require('./routes/sideEffects'));
app.use('/api/classes',           require('./routes/classes'));
app.use('/api/dashboard',         require('./routes/dashboard'));
app.use('/api/compounds',         require('./routes/compounds'));
app.use('/api/contraindications', require('./routes/contraindications'));
app.use('/api/auditlog',          require('./routes/auditlog'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));