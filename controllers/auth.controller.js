const bcrypt = require("bcrypt");
const User = require("../models/user");
const STATUS_CODE = require("../utils/status_code");
const logger = require("../utils/logger");
const sendgrid = require("@sendgrid/mail");
const crypto = require("crypto");
const { Op } = require("sequelize");

sendgrid.setApiKey(process.env.SENDGRID_API);

exports.getRegister = (req, res, next) => {
  return res.status(STATUS_CODE.OK).render("auth/register");
};

exports.postRegister = (req, res, next) => {
  const { username, email, password } = req.body;

  User.findOne({ where: { email: email } }).then((result) => {
    if (result) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        message: "This email is used before",
      });
    }

    bcrypt.hash(password, 12).then((hashedPassword) => {
      User.create({
        username: username,
        email: email,
        password: hashedPassword,
      }).then((user) => {
        logger.info(`New user registered email : ${email}`);
        return res.status(STATUS_CODE.CREATED).json({
          message: "You are registered now, login!",
        });
      });
    });
  });
};

exports.getLogin = (req, res, next) => {
  let success = undefined;
  if (req.query.reset) {
    success =
      "success=Password has been reset successfully. You can now login with your new password.";
  }
  return res.status(STATUS_CODE.OK).render("auth/login", {
    pageTitle: "IMDB Clone - login",
    login: true,
    success: success,
  });
};

exports.postLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  const { email, password } = req.body;

  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        console.log("Email is found");
        return res.status(STATUS_CODE.UNAUTHORIZED).json({
          message: "Invalid email or password",
        });
      }
      bcrypt.compare(password, user.password).then((doMatch) => {
        if (!doMatch) {
          return res.status(STATUS_CODE.UNAUTHORIZED).json({
            message: "Invalid email or password",
          });
        }

        req.session.isLoggedIn = true;
        req.session.user = user;
        logger.info(`User logged in: ${email}`);
        return res.status(STATUS_CODE.OK).json({
          message: "Login successful",
        });
      });
    })
    .catch((err) => {
      logger.error("Some error happened " + err);
      next(err);
    });
};

exports.getForgetPassword = (req, res, next) => {
  return res.status(STATUS_CODE.OK).render("auth/login", {
    pageTitle: "IMDB Clone - reset password",
    login: false,
  });
};

exports.postForgetPassword = (req, res, next) => {
  const { email } = req.body;

  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        return res.status(STATUS_CODE.BAD_REQUEST).render("auth/login", {
          pageTitle: "IMDB Clone - reset password",
          login: false,
          error: "Unregistered email",
        });
      }

      crypto.randomBytes(32, (err, buff) => {
        if (err) {
          return next(err);
        }

        const token = buff.toString("hex");

        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000;

        return user
          .save()
          .then((result) => {
            return sendgrid.send({
              to: email,
              from: "bakr29420@gmail.com",
              subject: "Reset Password",
              html: `
                <p>You have requested to reset your password,</p>
                <p>Click this <a href = "http://localhost:3000/reset/${token}">link</a> to reset your password</p>
                <p>This link will expire in 1 hour.</p>
            `,
            });
          })
          .then(() => {
            return res.status(STATUS_CODE.OK).render("auth/login", {
              pageTitle: "IMDB Clone - reset password",
              login: false,
              success: "Password reset email sent. Please check your inbox.",
            });
          });
      });
    })
    .catch((err) => {
      logger.error("Error in postForgetPassword: " + err);
      next(err);
    });
};

exports.getResetPassword = (req, res, next) => {
  const { token } = req.params;

  User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        [Op.gt]: Date.now(),
      },
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(STATUS_CODE.BAD_REQUEST).render("auth/reset", {
          pageTitle: "IMDB Clone - Reset Password",
          token: token,
          error:
            "Invalid or expired reset token. Please request a new password reset.",
          valid: false,
        });
      }

      return res.status(STATUS_CODE.OK).render("auth/reset", {
        pageTitle: "IMDB Clone - Reset Password",
        token: token,
        valid: true,
      });
    })
    .catch((err) => {
      logger.error("Error in getResetPassword: " + err);
      next(err);
    });
};

exports.postResetPassword = (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(STATUS_CODE.BAD_REQUEST).render("auth/reset", {
      pageTitle: "IMDB Clone - Reset Password",
      token: token,
      valid: true,
      error: "Passwords do not match",
    });
  }

  User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        [Op.gt]: Date.now(),
      },
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(STATUS_CODE.BAD_REQUEST).render("auth/reset", {
          pageTitle: "IMDB Clone - Reset Password",
          token: token,
          valid: false,
          error:
            "Invalid or expired reset token. Please request a new password reset.",
        });
      }

      return bcrypt.hash(password, 12).then((hashedPassword) => {
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;

        return user.save().then((result) => {
          logger.info(`Password reset successful for user: ${user.email}`);
          return res.redirect("/login?reset=true");
        });
      });
    })
    .catch((err) => {
      logger.error("Error in postResetPassword: " + err);
      next(err);
    });
};
