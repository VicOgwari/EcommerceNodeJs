const express = require('express');
const bodyParser = require('body-parser');
const dbConnect = require('./config/dbConnect');
const dotEnv = require('dotenv').config();
const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRouter = require('./routes/authRoute');
const brandRouter = require('./routes/brandRoute');
const productRouter = require('./routes/productRoute');
const blogRouter = require('./routes/blogRoute');
const blogCatRouter = require('./routes/blogCatRoute');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const catRouter = require('./routes/prodCategoryRoute');
const couponRouter = require('./routes/couponRoute');

const app = express(); 
const PORT = process.env.PORT || 6000;

dbConnect();
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);
app.use('/api/category', catRouter);
app.use('/api/blogcategory', blogCatRouter);
app.use(notFound)
app.use(errorHandler)
app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});