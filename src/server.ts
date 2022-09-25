import app from './app'

const port = process.env.PORT || 6002;
app.listen(port, () => console.log(`Running on port ${port} on environment ${process.env.NODE_ENV}`))