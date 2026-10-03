const prisma = require("../config/prisma");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("../utils/authUtils");

/**
 * Register a new user
 */
const register = async ({ name, email, password, role = "CUSTOMER" }) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409; // 409 Conflict
    throw error;
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user record
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role === "ADMIN" ? "ADMIN" : "CUSTOMER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate JWT
  const token = generateToken(user);

  return { user, token };
};

/**
 * Login existing user
 */
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401; // 401 Unauthorized
    throw error;
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const userSafe = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = generateToken(userSafe);

  return { user: userSafe, token };
};

module.exports = {
  register,
  login,
};
