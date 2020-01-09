var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const bcrypt = require("bcryptjs");

var userSchema = new Schema({
  methods: {
    type: [String],
    required: true
  },
  local: {
    email: {
      type: String,
      lowecase: true
    },
    password: {
      type: String
    }
  },
  google: {
    id: {
      type: String
    },
    email: {
      type: String,
      lowercase: true
    }
  },
  facebook: {
    id: {
      type: String
    },
    email: {
      type: String,
      lowercase: true
    }
  },
  linkedIn: {
    id: {
      type: String
    },
    email: {
      type: String,
      lowercase: true
    }
  }
});

//Hash the password before saving it to the database
userSchema.pre("save", async function(next) {
  try {
    //If the user is not using a local email account to sign up
    if (!this.methods.includes("local")) {
      next();
    }
    //Generate Salt
    const salt = await bcrypt.genSalt(10);
    //Hash Password
    const hashPassword = await bcrypt.hash(this.local.password, salt);
    // Reassign hashed version over the original
    this.local.password = hashPassword;
    next();
  } catch (error) {
    next(error);
  }
});

//Create a method to validate password before signing in
userSchema.methods.isValidPassword = async function(newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.local.password);
  } catch (error) {
    throw new Error(error);
  }
};

const User = mongoose.model("user", userSchema);

module.exports = User;
