import 'dotenv/config';
import app from '../app';
import supertest from 'supertest';

process.env.NODE_ENV = 'test';
import db from '../config/database.config';

const request = supertest(app);
// jest.setTimeout(100000);
beforeAll(async () => {
  await db.sync({ force: true }).then(() => {
    // eslint-disable-next-line no-console
    console.log('Database connected successfully to test');
  });
});

describe('it should test our user apis', () => {
  it('should create a user and verify a user', async () => {
    const response = await request.post('/users/register').send({
      firstName: 'Temitope',
      lastName: 'Adejolu',
      username: 'Topmost',
      email: 'Tadejolu@gmail.com',
      phoneNumber: '08161564659',
      password: '1111',
      confirmPassword: '1111',
    });
    const token = response.body.token;
    const response2 = await request.get(`/users/verify/${token}`);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
    expect(response.body).toHaveProperty('record');
    expect(response2.status).toBe(302);
  });

  // Login with email
  it('should login a user', async () => {
    const response = await request.post('/users/login').send({
      userInfo: 'Tadejolu@gmail.com',
      password: '1111',
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('User');
  });

  it('should get all users', async () => {
    const response = await request.get('/users/getAllUsers');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Successfully fetched all users');
    expect(response.body).toHaveProperty('users');
  });

  it('should get a single user', async () => {
    const response = await request.post('/users/login').send({
      userInfo: 'Tadejolu@gmail.com',
      password: '1111',
    });
    const id = response.body.User.id;
    const response2 = await request.get(`/users/single-user/${id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response2.status).toBe(200);
    expect(response2.body).toHaveProperty('user');
  });

  it('should create an admin', async () => {
    const response = await request.post('/users/login').send({
      userInfo: 'Tadejolu@gmail.com',
      password: '1111',
    });

    const response2 = await request
      .post('/users/createAdmin')
      .set('authorization', `Bearer ${response.body.token}`)
      .send({
        firstName: 'Samuel',
        lastName: 'Adewunmi',
        username: 'Sam',
        email: 'ppatsamuel@gmail.com',
        phoneNumber: '09093215047',
        password: '1111',
        confirmPassword: '1111',
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response2.status).toBe(201);
    expect(response2.body.message).toBe('Admin created successfully');
    expect(response2.body).toHaveProperty('record');
    expect(response2.body).toHaveProperty('token');
  });

  it('should send verification link for forgot password', async () => {
    const response = await request.post('/users/forgotpassword').send({
      email: 'Tadejolu@gmail.com',
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Check email for the verification link');
  });

  it('should change user password', async () => {
    const response = await request.post('/users/login').send({
      userInfo: 'Tadejolu@gmail.com',
      password: '1111',
    });

    const { id } = response.body.User;
    const response2 = await request.patch(`/users/change-password/${id}`).send({
      password: '12345',
      confirmPassword: '12345',
    });

    expect(response2.status).toBe(200);
    expect(response2.body.message).toBe('Password Successfully Changed');
  });

  it('update user profile', async () => {
    const user = await request.post('/users/login').send({
      userInfo: 'Tadejolu@gmail.com',
      password: '12345',
    });
    const response = await request
      .patch(`/users/update/${user.body.User.id}`)
      .set('authorization', `Bearer ${user.body.token}`)
      .send({
        firstName: 'Ade',
        lastName: 'Timi',
        phoneNumber: '08123456789',
        avatar:
          'https://static.vecteezy.com/system/resources/thumbnails/005/129/844/small/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg',
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Update Successful');
    expect(response.body).toHaveProperty('record');
  });

  it('it should send otp to admin', async () => {
    const response = await request.post('/users/login').send({
      userInfo: 'Tadejolu@gmail.com',
      password: '12345',
    });
    const response2 = await request.patch('/users/getOTP').set('authorization', `Bearer ${response.body.token}`);

    expect(response2.status).toBe(200);
    expect(response2.body.message).toBe('OTP sent to your email');
  });

  // it('should credit user wallet', async () => {
  //   const response = await request.post('/users/login').send({
  //     userInfo: 'imeu@gmail.com',
  //     password: '12345',
  //   });
  //   const response2 = await request
  //     .patch('/users/creditWallet')
  //     .set('authorization', `Bearer ${response.body.token}`)
  //     .send({
  //       amountTransferred: 1000,
  //       email: 'imeu@gmail.com',
  //     });
  // });
});
