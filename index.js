const PORT = process.env.PORT || 3005

require('./server')({
    port:PORT,
    cb: () => console.log(`Your Server is running on ${PORT}`),
});