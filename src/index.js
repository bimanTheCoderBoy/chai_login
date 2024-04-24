import 'dotenv/config'
import { dbConnect } from './db/index.js'
import app from './app.js';
const PORT = process.env.PORT || 5000;

dbConnect().then(() => {
    app.listen(PORT, () => { console.log(`Server listening on http://localhost:${PORT}`) })
}).catch((error) => {
    console.error('Error connecting to database' + error);
    process.exit(1);
})




