import request from 'supertest';
import app from '../app';

describe('POST /api/auth/register', () =>{
    test('returns 201 with valid data', async () =>{
        const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        email : 'test@test.com',
                        password: '123456'
                    });

        expect(response.status).toBe(201);
        expect(response.body.user.email).toBe('test@test.com');
        expect(response.body.user.password_hash).toBeUndefined();
    })
    test('returns 400 with duplicate email', async () =>{
        const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        email : 'test@test.com',
                        password: '123456'
                    });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Email already exists');
    })
    test('returns 400 with invalid email', async () =>{
        const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        email : 'not an email',
                        password: '123456'
                    });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
    })
    test('returns 400 with short password', async () =>{
        const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        email : 'test2@test.com',
                        password: '12345'
                    });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
    })
})



describe('POST /api/auth/login', () =>{
    //  If register test fails, this test fails too for the wrong reason
     beforeAll(async () => {
        // ensure user exists before login tests run
        await request(app)
            .post('/api/auth/register')
            .send({ email: 'login@test.com', password: '123456' });
    });
    test('returns token with valid credentials', async () =>{
        const response = await request(app)
                    .post('/api/auth/login')
                    .send({
                        email : 'login@test.com',
                        password: '123456'
                    });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    })
    test('returns 400 with wrong password', async () =>{
        const response = await request(app)
                    .post('/api/auth/login')
                    .send({
                        email : 'login@test.com',
                        password: 'wrong_password'
                    });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid credentials');
    })
})