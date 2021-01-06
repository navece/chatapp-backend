const bcrypt = require("bcrypt");

const isEmail = (email) => {
  email = email.trim();
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

exports.registerValidation = async (
  userByEmail,
  userByUsername,
  email,
  username,
  password,
  confirmPassword
) => {
  let errors = {};
  // TODO: Validate input data
  if (!isEmail(email)) errors.email = "Please Enter a valid email";
  if (username.trim() === "") errors.username = "Username must not be empty";
  if (password.trim() === "") errors.password = "Password must not be empty";
  if (password.trim().length < 6)
    errors.password = "Password must be atleast 6 character long";
  if (password !== confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (userByUsername) errors.username = "Username is taken";
  if (userByEmail) errors.email = "Email is used";
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.loginValidation = async (user, password) => {
  let errors = {};
  //TODO: check if user exists
  if (!user) errors.username = "User not found";
  //TODO: check if password is correct
  else {
    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) errors.password = "Incorrect password";
  }
  return {
    user,
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};
