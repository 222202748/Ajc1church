const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Admin = require('./src/models/Admin');
const Blog = require('./src/models/Blog');
const Event = require('./src/models/Event');
const User = require('./src/models/User');
const EventRegistration = require('./src/models/eventRegistration');

const OLD_DB_URI = 'mongodb://127.0.0.1:27017/church_donations';
const NEW_DB_URI = 'mongodb+srv://mani12kandan654_db_user:ChrTsxh9Iqxie0v6@cluster3.0usidkf.mongodb.net/church_donations';

async function migrate() {
    try {
        console.log('Connecting to local database...');
        const localConn = await mongoose.createConnection(OLD_DB_URI).asPromise();
        console.log('Connected to local database.');

        console.log('Connecting to Atlas database...');
        const atlasConn = await mongoose.createConnection(NEW_DB_URI).asPromise();
        console.log('Connected to Atlas database.');

        const models = [
            { name: 'Admin', schema: Admin.schema },
            { name: 'Blog', schema: Blog.schema },
            { name: 'Event', schema: Event.schema },
            { name: 'User', schema: User.schema },
            { name: 'EventRegistration', schema: EventRegistration.schema }
        ];

        for (const { name, schema } of models) {
            console.log(`Migrating ${name}...`);
            const LocalModel = localConn.model(name, schema);
            const AtlasModel = atlasConn.model(name, schema);

            const data = await LocalModel.find({}).lean();
            console.log(`Found ${data.length} records for ${name}.`);

            if (data.length > 0) {
                // Clear existing data in Atlas for this collection to avoid duplicates if re-run
                await AtlasModel.deleteMany({});
                await AtlasModel.insertMany(data);
                console.log(`Successfully migrated ${data.length} records for ${name}.`);
            }
        }

        console.log('Migration completed successfully!');
        await localConn.close();
        await atlasConn.close();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
