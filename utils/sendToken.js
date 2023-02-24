const sendToken = (user, res, message, status) => {
  const token = user.generateJWTToken();
  res
    .status(status)
    .cookie("token", token, {
      expires: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    })
    .json({ success: true, message, token });
};
export default sendToken;
