import request from 'supertest';
import app from '../expressApp';
import mongoose from 'mongoose';
import { log } from 'console';

process.env.SECRET = 'test-secret-key-for-testing';

beforeAll(async () => {
  const dbUri = process.env.MONGODB_URI || 'mongodb+srv://MM1000:MM10052025!@cluster0.uzkder9.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0';
  log('Connecting to MongoDB at:', dbUri);
  await mongoose.connect(dbUri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('CRUD operations', () => {
  test('Create a note without logging', async () => {
    const response = await request(app).post('/notes').send({
      title: "Test Note",
      author: { name: 'Test', email: 'test@example.com' },
      content: 'This is a test note'
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('token missing or invalid');});

  test('Get all notes', async () => {
    const response = await request(app).get('/notes');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('Sign up a new user', async () => {
    const response = await request(app).post('/users').send({
      username: 'wqqwwqqwwq' + Math.random().toString(36).substring(2, 15), // Unique username
      name: 'Test User',
      password: '12345',
      email: 'test@yahoo.com'
    });
    expect(response.status).toBe(201);
  });
  test('Sign up with an existing username', async () => {
    const response = await request(app).post('/users').send({
      username: 'test',
      name: 'Test User',
      password: 'test',
      email: 'sddx@gmail.com'}
    );
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Username already exists');  
  }
  );
  test('Login with the user', async () => {
    const response = await request(app).post('/login').send({
      username: 'test',
      password: 'test'
    });
    console.log('Login response:', response.body);
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.id).toBeDefined();
  }
  );
});
