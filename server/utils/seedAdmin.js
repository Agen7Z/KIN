import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

const seedAdmin = async () => {
    const { ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_USERNAME || !ADMIN_PASSWORD) return;
    const exists = await User.findOne({ email: ADMIN_EMAIL });
    if (exists) return;
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({ username: ADMIN_USERNAME, email: ADMIN_EMAIL, password: hashed, role: "admin" });
    console.log("Seeded admin user:", ADMIN_EMAIL);
};

export default seedAdmin;


