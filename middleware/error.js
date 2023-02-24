const error = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.status = err.status || 500;
  if (err.code === 11000) {
    err.message = `Duplicate ${Object.keys(err.keyValue)} not allowed`;
    err.status = 400;
  }
  if (err.name === "CastError") {
    err.message = `Invalid ${err.path}`;
    err.status = 400;
  }
console.log(err);
  res.status(err.status).json({ success: false, message: err });
};
export default error;
