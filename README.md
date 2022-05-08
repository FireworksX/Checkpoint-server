# Checkpoint-server

### Features

- Full typescript coverage
- Mongoose connection
- Request validation
- JWT authorization

### Bootstrap
Development

1. Create `.env.local` with
```
JWT_SECRET=yourSecretOfJwt
JWT_EXPIRATION_MINUTES=15
MONGO_URI=mongodb://localhost:27017/checkpoint
MONGO_URI_TESTS=mongodb://localhost:27017/checkpoint
```
2. Run `yarn`
3. For run project with development mode run `yarn dev`
4. For *production* mode run `yarn build` and after that command start serving server `yarn start`
