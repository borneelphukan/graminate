const fs = require("fs");
const path = require("path");

const BRUNO_DIR = path.resolve(__dirname, "../bruno");

const endpoints = [
  // ── App ──
  {
    folder: "00-Health",
    name: "Health Check",
    method: "get",
    path: "/api/",
    auth: false,
  },

  // ── Admin ──
  {
    folder: "01-Auth/Admin",
    name: "Admin Register",
    method: "post",
    path: "/api/admin/register",
    auth: false,
    body: {
      first_name: "John",
      last_name: "Doe",
      email: "admin@example.com",
      password: "password123",
    },
  },
  {
    folder: "01-Auth/Admin",
    name: "Admin Login",
    method: "post",
    path: "/api/admin/login",
    auth: false,
    body: { email: "admin@example.com", password: "password123" },
  },
  {
    folder: "01-Auth/Admin",
    name: "Admin Me",
    method: "get",
    path: "/api/admin/me",
    auth: true,
  },
  {
    folder: "01-Auth/Admin",
    name: "Admin - All Users",
    method: "get",
    path: "/api/admin/all-users",
    auth: true,
  },
  {
    folder: "01-Auth/Admin",
    name: "Admin - User Count",
    method: "get",
    path: "/api/admin/user-count",
    auth: true,
  },
  {
    folder: "01-Auth/Admin",
    name: "Admin - Get User",
    method: "get",
    path: "/api/admin/users/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "01-Auth/Admin",
    name: "Admin - User Login History",
    method: "get",
    path: "/api/admin/users/:id/login-history",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "01-Auth/Admin",
    name: "Admin - Update User",
    method: "post",
    path: "/api/admin/users/:id",
    auth: true,
    params: { id: "1" },
    body: { darkMode: false, admin_reason: "string", admin_action: "string" },
  },
  {
    folder: "01-Auth/Admin",
    name: "Admin - Delete User",
    method: "delete",
    path: "/api/admin/users/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "01-Auth/Admin",
    name: "Admin - User Billing History",
    method: "get",
    path: "/api/admin/users/:id/billing-history",
    auth: true,
    params: { id: "1" },
  },

  // ── User ──
  {
    folder: "01-Auth/User",
    name: "User Register",
    method: "post",
    path: "/api/user/register",
    auth: false,
    body: { email: "user@example.com", password: "password123" },
  },
  {
    folder: "01-Auth/User",
    name: "User Check Exists",
    method: "post",
    path: "/api/user/check-exists",
    auth: false,
    body: { email: "user@example.com", phone_number: "+1234567890" },
  },
  {
    folder: "01-Auth/User",
    name: "User Login",
    method: "post",
    path: "/api/user/login",
    auth: false,
    body: { email: "user@example.com", password: "password123" },
  },
  {
    folder: "01-Auth/User",
    name: "User Logout",
    method: "post",
    path: "/api/user/logout",
    auth: true,
    body: { loginId: "1" },
  },
  {
    folder: "01-Auth/User",
    name: "User - Get Profile",
    method: "get",
    path: "/api/user/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "01-Auth/User",
    name: "User - Update Profile",
    method: "put",
    path: "/api/user/:id",
    auth: true,
    params: { id: "1" },
    body: { darkMode: false, widgets: "string" },
  },
  {
    folder: "01-Auth/User",
    name: "User - Available Sub Types",
    method: "get",
    path: "/api/user/:id/available-sub-types",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "01-Auth/User",
    name: "User - Delete",
    method: "delete",
    path: "/api/user/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "01-Auth/User",
    name: "User - Verify Password",
    method: "post",
    path: "/api/user/verify-password/:id",
    auth: true,
    params: { id: "1" },
    body: { password: "password123" },
  },
  {
    folder: "01-Auth/User",
    name: "User - Schedule Downgrade",
    method: "post",
    path: "/api/user/:id/schedule-downgrade",
    auth: true,
    params: { id: "1" },
    body: { plan: "free" },
  },
  {
    folder: "01-Auth/User",
    name: "User - Billing History",
    method: "get",
    path: "/api/user/:id/billing-history",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "01-Auth/User",
    name: "User - Get Notifications",
    method: "get",
    path: "/api/user/:id/notifications",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "01-Auth/User",
    name: "User - Mark Notification Read",
    method: "put",
    path: "/api/user/:id/notifications/read",
    auth: true,
    params: { id: "1" },
    body: { notificationId: "1" },
  },
  {
    folder: "01-Auth/User",
    name: "User - Delete Notification",
    method: "delete",
    path: "/api/user/:id/notifications/:notificationId",
    auth: true,
    params: { id: "1", notificationId: "1" },
  },
  {
    folder: "01-Auth/User",
    name: "User - Clear All Notifications",
    method: "delete",
    path: "/api/user/:id/notifications",
    auth: true,
    params: { id: "1" },
  },

  // ── Email Verification ──
  {
    folder: "01-Auth/Email Verification",
    name: "Verify Email",
    method: "get",
    path: "/api/auth/verify-email?token={{token}}",
    auth: false,
  },
  {
    folder: "01-Auth/Email Verification",
    name: "Resend Verification",
    method: "post",
    path: "/api/auth/resend-verification",
    auth: false,
    body: { email: "user@example.com" },
  },

  // ── OTP ──
  {
    folder: "01-Auth/OTP",
    name: "Send OTP",
    method: "post",
    path: "/api/otp/send-otp",
    auth: false,
    body: { email: "user@example.com" },
  },
  {
    folder: "01-Auth/OTP",
    name: "Verify OTP",
    method: "post",
    path: "/api/otp/verify-otp",
    auth: false,
    body: { email: "user@example.com", otp: "123456" },
  },

  // ── Password ──
  {
    folder: "01-Auth/Password",
    name: "Forgot Password",
    method: "post",
    path: "/api/password/forgot",
    auth: false,
    body: { email: "user@example.com" },
  },
  {
    folder: "01-Auth/Password",
    name: "Reset Password",
    method: "post",
    path: "/api/password/reset",
    auth: false,
    body: {
      email: "user@example.com",
      token: "string",
      newPassword: "newpassword123",
    },
  },

  // ── Waitlist ──
  {
    folder: "02-Waitlist",
    name: "Join Waitlist",
    method: "post",
    path: "/api/waitlist",
    auth: false,
    body: {
      first_name: "John",
      last_name: "Doe",
      email: "user@example.com",
      phone: "+1234567890",
      role: "farmer",
    },
  },
  {
    folder: "02-Waitlist",
    name: "Get Waitlist (Admin)",
    method: "get",
    path: "/api/waitlist",
    auth: true,
  },

  // ── Payment ──
  {
    folder: "03-Payment",
    name: "Create Order",
    method: "post",
    path: "/api/payment/create-order",
    auth: true,
    body: { amount: 100, currency: "INR" },
  },
  {
    folder: "03-Payment",
    name: "Verify Payment",
    method: "post",
    path: "/api/payment/verify",
    auth: true,
    body: {
      razorpay_order_id: "order_xxx",
      razorpay_payment_id: "pay_xxx",
      razorpay_signature: "signature_xxx",
    },
  },

  // ── LLM ──
  {
    folder: "04-LLM",
    name: "Send LLM Prompt",
    method: "post",
    path: "/api/llm",
    auth: true,
    body: { prompt: "Hello, how can you help me?" },
  },

  // ── Floriculture ──
  {
    folder: "05-Floriculture",
    name: "Add Flower",
    method: "post",
    path: "/api/floriculture/add",
    auth: true,
    body: { name: "Rose", species: "Rosa", userId: 1 },
  },
  {
    folder: "05-Floriculture",
    name: "Get Flowers By User",
    method: "get",
    path: "/api/floriculture/user/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "05-Floriculture",
    name: "Get Flower",
    method: "get",
    path: "/api/floriculture/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "05-Floriculture",
    name: "Update Flower",
    method: "put",
    path: "/api/floriculture/update/:id",
    auth: true,
    params: { id: "1" },
    body: { name: "Rose Updated" },
  },
  {
    folder: "05-Floriculture",
    name: "Delete Flower",
    method: "delete",
    path: "/api/floriculture/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "05-Floriculture",
    name: "Delete Multiple Flowers",
    method: "post",
    path: "/api/floriculture/delete-multiple",
    auth: true,
    body: { ids: [1, 2, 3] },
  },
  {
    folder: "05-Floriculture",
    name: "Reset Service",
    method: "post",
    path: "/api/floriculture/reset-service",
    auth: true,
  },
  {
    folder: "05-Floriculture",
    name: "Get Watering Schedule",
    method: "get",
    path: "/api/floriculture/watering/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "05-Floriculture",
    name: "Get Watering By Date",
    method: "get",
    path: "/api/floriculture/watering/:userId/:date",
    auth: true,
    params: { userId: "1", date: "2024-01-01" },
  },
  {
    folder: "05-Floriculture",
    name: "Set Watering",
    method: "post",
    path: "/api/floriculture/watering",
    auth: true,
    body: { userId: 1, flowerId: 1, date: "2024-01-01", watered: true },
  },
  {
    folder: "05-Floriculture",
    name: "Send Notification",
    method: "post",
    path: "/api/floriculture/notifications/user/:id",
    auth: true,
    params: { id: "1" },
    body: { title: "Reminder", message: "Water your plants", type: "reminder" },
  },

  // ── Apiculture ──
  {
    folder: "06-Bee-Keeping/Apiculture",
    name: "Add Apiary",
    method: "post",
    path: "/api/apiculture/add",
    auth: true,
    body: { name: "Main Apiary", location: "Farm A", userId: 1 },
  },
  {
    folder: "06-Bee-Keeping/Apiculture",
    name: "Get Apiaries By User",
    method: "get",
    path: "/api/apiculture/user/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "06-Bee-Keeping/Apiculture",
    name: "Get Apiary",
    method: "get",
    path: "/api/apiculture/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "06-Bee-Keeping/Apiculture",
    name: "Update Apiary",
    method: "put",
    path: "/api/apiculture/update/:id",
    auth: true,
    params: { id: "1" },
    body: { name: "Updated Apiary" },
  },
  {
    folder: "06-Bee-Keeping/Apiculture",
    name: "Delete Apiary",
    method: "delete",
    path: "/api/apiculture/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "06-Bee-Keeping/Apiculture",
    name: "Reset Apiary Service",
    method: "post",
    path: "/api/apiculture/reset-service",
    auth: true,
  },
  {
    folder: "06-Bee-Keeping/Apiculture",
    name: "Reset Apiary",
    method: "post",
    path: "/api/apiculture/reset",
    auth: true,
  },

  // ── Bee Hives ──
  {
    folder: "06-Bee-Keeping/Bee Hives",
    name: "Add Hive",
    method: "post",
    path: "/api/bee-hives/add",
    auth: true,
    body: { name: "Hive 1", apiaryId: 1, userId: 1 },
  },
  {
    folder: "06-Bee-Keeping/Bee Hives",
    name: "Get Hives By Apiary",
    method: "get",
    path: "/api/bee-hives/apiary/:apiaryId",
    auth: true,
    params: { apiaryId: "1" },
  },
  {
    folder: "06-Bee-Keeping/Bee Hives",
    name: "Get Hive",
    method: "get",
    path: "/api/bee-hives/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "06-Bee-Keeping/Bee Hives",
    name: "Update Hive",
    method: "put",
    path: "/api/bee-hives/update/:id",
    auth: true,
    params: { id: "1" },
    body: { name: "Hive Updated" },
  },
  {
    folder: "06-Bee-Keeping/Bee Hives",
    name: "Delete Hive",
    method: "delete",
    path: "/api/bee-hives/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "06-Bee-Keeping/Bee Hives",
    name: "Reset Hives",
    method: "post",
    path: "/api/bee-hives/reset",
    auth: true,
  },

  // ── Honey Production ──
  {
    folder: "06-Bee-Keeping/Honey Production",
    name: "Add Honey Production",
    method: "post",
    path: "/api/honey-production/add",
    auth: true,
    body: { hiveId: 1, quantity: 5.5, date: "2024-01-01" },
  },
  {
    folder: "06-Bee-Keeping/Honey Production",
    name: "Get Production By Hive",
    method: "get",
    path: "/api/honey-production/hive/:hiveId",
    auth: true,
    params: { hiveId: "1" },
  },
  {
    folder: "06-Bee-Keeping/Honey Production",
    name: "Get Honey Production",
    method: "get",
    path: "/api/honey-production/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "06-Bee-Keeping/Honey Production",
    name: "Update Honey Production",
    method: "put",
    path: "/api/honey-production/update/:id",
    auth: true,
    params: { id: "1" },
    body: { quantity: 6.0 },
  },
  {
    folder: "06-Bee-Keeping/Honey Production",
    name: "Delete Honey Production",
    method: "delete",
    path: "/api/honey-production/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "06-Bee-Keeping/Honey Production",
    name: "Reset Honey Production",
    method: "post",
    path: "/api/honey-production/reset",
    auth: true,
  },

  // ── Hive Inspections ──
  {
    folder: "06-Bee-Keeping/Hive Inspections",
    name: "Add Inspection",
    method: "post",
    path: "/api/hive-inspections/add",
    auth: true,
    body: { hiveId: 1, notes: "Looks healthy", date: "2024-01-01" },
  },
  {
    folder: "06-Bee-Keeping/Hive Inspections",
    name: "Get Inspections By Hive",
    method: "get",
    path: "/api/hive-inspections/hive/:hiveId",
    auth: true,
    params: { hiveId: "1" },
  },
  {
    folder: "06-Bee-Keeping/Hive Inspections",
    name: "Get Inspection",
    method: "get",
    path: "/api/hive-inspections/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "06-Bee-Keeping/Hive Inspections",
    name: "Update Inspection",
    method: "put",
    path: "/api/hive-inspections/update/:id",
    auth: true,
    params: { id: "1" },
    body: { notes: "Updated notes" },
  },
  {
    folder: "06-Bee-Keeping/Hive Inspections",
    name: "Delete Inspection",
    method: "delete",
    path: "/api/hive-inspections/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "06-Bee-Keeping/Hive Inspections",
    name: "Reset Inspections",
    method: "post",
    path: "/api/hive-inspections/reset",
    auth: true,
  },

  // ── Cattle Rearing ──
  {
    folder: "07-Cattle/Cattle Rearing",
    name: "Add Cattle",
    method: "post",
    path: "/api/cattle-rearing/add",
    auth: true,
    body: { name: "Bessie", breed: "Jersey", userId: 1 },
  },
  {
    folder: "07-Cattle/Cattle Rearing",
    name: "Get Cattle By User",
    method: "get",
    path: "/api/cattle-rearing/user/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "07-Cattle/Cattle Rearing",
    name: "Get Cattle",
    method: "get",
    path: "/api/cattle-rearing/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "07-Cattle/Cattle Rearing",
    name: "Update Cattle",
    method: "put",
    path: "/api/cattle-rearing/update/:id",
    auth: true,
    params: { id: "1" },
    body: { name: "Bessie Updated" },
  },
  {
    folder: "07-Cattle/Cattle Rearing",
    name: "Delete Cattle",
    method: "delete",
    path: "/api/cattle-rearing/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "07-Cattle/Cattle Rearing",
    name: "Reset Cattle Service",
    method: "post",
    path: "/api/cattle-rearing/reset-service",
    auth: true,
    body: { userId: 1 },
  },
  {
    folder: "07-Cattle/Cattle Rearing",
    name: "Reset Cattle",
    method: "post",
    path: "/api/cattle-rearing/reset",
    auth: true,
  },

  // ── Cattle Milk ──
  {
    folder: "07-Cattle/Cattle Milk",
    name: "Add Milk Record",
    method: "post",
    path: "/api/cattle-milk/add",
    auth: true,
    body: { cattleId: 1, quantity: 10, date: "2024-01-01" },
  },
  {
    folder: "07-Cattle/Cattle Milk",
    name: "Get Milk By User",
    method: "get",
    path: "/api/cattle-milk/user/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "07-Cattle/Cattle Milk",
    name: "Get Milk By Cattle",
    method: "get",
    path: "/api/cattle-milk/cattle/:cattleId",
    auth: true,
    params: { cattleId: "1" },
  },
  {
    folder: "07-Cattle/Cattle Milk",
    name: "Get Milk Record",
    method: "get",
    path: "/api/cattle-milk/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "07-Cattle/Cattle Milk",
    name: "Update Milk Record",
    method: "put",
    path: "/api/cattle-milk/update/:id",
    auth: true,
    params: { id: "1" },
    body: { quantity: 12 },
  },
  {
    folder: "07-Cattle/Cattle Milk",
    name: "Delete Milk Record",
    method: "delete",
    path: "/api/cattle-milk/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "07-Cattle/Cattle Milk",
    name: "Get Animal Names",
    method: "get",
    path: "/api/cattle-milk/animal-names/:cattleId",
    auth: true,
    params: { cattleId: "1" },
  },
  {
    folder: "07-Cattle/Cattle Milk",
    name: "Reset Milk Records",
    method: "post",
    path: "/api/cattle-milk/reset",
    auth: true,
  },

  // ── Poultry Flock ──
  {
    folder: "08-Poultry/Flock",
    name: "Add Flock",
    method: "post",
    path: "/api/flock/add",
    auth: true,
    body: { name: "Layer Flock 1", breed: "Leghorn", count: 100, userId: 1 },
  },
  {
    folder: "08-Poultry/Flock",
    name: "Get Flocks By User",
    method: "get",
    path: "/api/flock/user/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "08-Poultry/Flock",
    name: "Get Flock",
    method: "get",
    path: "/api/flock/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "08-Poultry/Flock",
    name: "Update Flock",
    method: "put",
    path: "/api/flock/update/:id",
    auth: true,
    params: { id: "1" },
    body: { count: 120 },
  },
  {
    folder: "08-Poultry/Flock",
    name: "Delete Flock",
    method: "delete",
    path: "/api/flock/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "08-Poultry/Flock",
    name: "Reset Flock Service",
    method: "post",
    path: "/api/flock/reset-service",
    auth: true,
    body: { userId: 1 },
  },

  // ── Poultry Feeds ──
  {
    folder: "08-Poultry/Poultry Feeds",
    name: "Add Feed Record",
    method: "post",
    path: "/api/poultry-feeds/add",
    auth: true,
    body: { flockId: 1, feedType: "corn", quantity: 50, date: "2024-01-01" },
  },
  {
    folder: "08-Poultry/Poultry Feeds",
    name: "Get Feeds By User",
    method: "get",
    path: "/api/poultry-feeds/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "08-Poultry/Poultry Feeds",
    name: "Get Feed Record",
    method: "get",
    path: "/api/poultry-feeds/record/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "08-Poultry/Poultry Feeds",
    name: "Update Feed Record",
    method: "put",
    path: "/api/poultry-feeds/update/:id",
    auth: true,
    params: { id: "1" },
    body: { quantity: 60 },
  },
  {
    folder: "08-Poultry/Poultry Feeds",
    name: "Delete Feed Record",
    method: "delete",
    path: "/api/poultry-feeds/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "08-Poultry/Poultry Feeds",
    name: "Reset Feeds",
    method: "post",
    path: "/api/poultry-feeds/reset",
    auth: true,
  },

  // ── Poultry Eggs ──
  {
    folder: "08-Poultry/Poultry Eggs",
    name: "Add Egg Record",
    method: "post",
    path: "/api/poultry-eggs/add",
    auth: true,
    body: { flockId: 1, count: 85, date: "2024-01-01" },
  },
  {
    folder: "08-Poultry/Poultry Eggs",
    name: "Get Eggs By User",
    method: "get",
    path: "/api/poultry-eggs/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "08-Poultry/Poultry Eggs",
    name: "Get Egg Record",
    method: "get",
    path: "/api/poultry-eggs/record/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "08-Poultry/Poultry Eggs",
    name: "Update Egg Record",
    method: "put",
    path: "/api/poultry-eggs/update/:id",
    auth: true,
    params: { id: "1" },
    body: { count: 90 },
  },
  {
    folder: "08-Poultry/Poultry Eggs",
    name: "Delete Egg Record",
    method: "delete",
    path: "/api/poultry-eggs/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "08-Poultry/Poultry Eggs",
    name: "Reset Eggs",
    method: "post",
    path: "/api/poultry-eggs/reset",
    auth: true,
  },

  // ── Poultry Health ──
  {
    folder: "08-Poultry/Poultry Health",
    name: "Add Health Record",
    method: "post",
    path: "/api/poultry-health/add",
    auth: true,
    body: {
      flockId: 1,
      issue: "Mild cold",
      treatment: "Antibiotics",
      date: "2024-01-01",
    },
  },
  {
    folder: "08-Poultry/Poultry Health",
    name: "Get Health By User",
    method: "get",
    path: "/api/poultry-health/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "08-Poultry/Poultry Health",
    name: "Get Health Record",
    method: "get",
    path: "/api/poultry-health/record/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "08-Poultry/Poultry Health",
    name: "Update Health Record",
    method: "put",
    path: "/api/poultry-health/update/:id",
    auth: true,
    params: { id: "1" },
    body: { treatment: "Updated treatment" },
  },
  {
    folder: "08-Poultry/Poultry Health",
    name: "Delete Health Record",
    method: "delete",
    path: "/api/poultry-health/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "08-Poultry/Poultry Health",
    name: "Reset Health",
    method: "post",
    path: "/api/poultry-health/reset",
    auth: true,
  },

  // ── Expenses ──
  {
    folder: "09-Finance/Expenses",
    name: "Add Expense",
    method: "post",
    path: "/api/expenses/add",
    auth: true,
    body: {
      userId: 1,
      amount: 500,
      category: "feed",
      description: "Chicken feed",
      date: "2024-01-01",
    },
  },
  {
    folder: "09-Finance/Expenses",
    name: "Get Expenses By User",
    method: "get",
    path: "/api/expenses/user/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "09-Finance/Expenses",
    name: "Get Expense",
    method: "get",
    path: "/api/expenses/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "09-Finance/Expenses",
    name: "Update Expense",
    method: "put",
    path: "/api/expenses/update/:id",
    auth: true,
    params: { id: "1" },
    body: { amount: 600 },
  },
  {
    folder: "09-Finance/Expenses",
    name: "Delete Expense",
    method: "delete",
    path: "/api/expenses/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "09-Finance/Expenses",
    name: "Reset Expenses",
    method: "post",
    path: "/api/expenses/reset",
    auth: true,
  },
  {
    folder: "09-Finance/Expenses",
    name: "Delete Expenses By Occupation",
    method: "post",
    path: "/api/expenses/delete-by-occupation",
    auth: true,
    body: { occupation: "poultry" },
  },

  // ── Sales ──
  {
    folder: "09-Finance/Sales",
    name: "Add Sale",
    method: "post",
    path: "/api/sales/add",
    auth: true,
    body: {
      userId: 1,
      amount: 1000,
      item: "Eggs",
      quantity: 100,
      date: "2024-01-01",
    },
  },
  {
    folder: "09-Finance/Sales",
    name: "Get Sales By User",
    method: "get",
    path: "/api/sales/user/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "09-Finance/Sales",
    name: "Get Sale",
    method: "get",
    path: "/api/sales/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "09-Finance/Sales",
    name: "Update Sale",
    method: "put",
    path: "/api/sales/update/:id",
    auth: true,
    params: { id: "1" },
    body: { amount: 1200 },
  },
  {
    folder: "09-Finance/Sales",
    name: "Delete Sale",
    method: "delete",
    path: "/api/sales/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "09-Finance/Sales",
    name: "Reset Sales",
    method: "post",
    path: "/api/sales/reset",
    auth: true,
  },
  {
    folder: "09-Finance/Sales",
    name: "Delete Sales By Occupation",
    method: "post",
    path: "/api/sales/delete-by-occupation",
    auth: true,
    body: { occupation: "poultry" },
  },

  // ── Loans ──
  {
    folder: "09-Finance/Loans",
    name: "Add Loan",
    method: "post",
    path: "/api/loans",
    auth: true,
    body: { userId: 1, amount: 50000, interestRate: 8.5, tenure: 12 },
  },
  {
    folder: "09-Finance/Loans",
    name: "Get Loans By User",
    method: "get",
    path: "/api/loans/user/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "09-Finance/Loans",
    name: "Get Loan",
    method: "get",
    path: "/api/loans/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "09-Finance/Loans",
    name: "Update Loan",
    method: "patch",
    path: "/api/loans/:id",
    auth: true,
    params: { id: "1" },
    body: { amount: 60000 },
  },
  {
    folder: "09-Finance/Loans",
    name: "Delete Loan",
    method: "delete",
    path: "/api/loans/:id",
    auth: true,
    params: { id: "1" },
  },

  // ── Labour ──
  {
    folder: "10-Employees/Labour",
    name: "Add Labour",
    method: "post",
    path: "/api/labour/add",
    auth: true,
    body: { name: "Worker 1", role: "general", userId: 1 },
  },
  {
    folder: "10-Employees/Labour",
    name: "Get Labour",
    method: "get",
    path: "/api/labour/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "10-Employees/Labour",
    name: "Update Labour",
    method: "put",
    path: "/api/labour/update",
    auth: true,
    body: { labour_id: 1, name: "Worker 1 Updated" },
  },
  {
    folder: "10-Employees/Labour",
    name: "Delete Labour",
    method: "delete",
    path: "/api/labour/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "10-Employees/Labour",
    name: "Reset Labour",
    method: "post",
    path: "/api/labour/reset",
    auth: true,
  },

  // ── Labour Payment ──
  {
    folder: "10-Employees/Labour Payment",
    name: "Add Labour Payment",
    method: "post",
    path: "/api/labour_payment/add",
    auth: true,
    body: {
      labour_id: 1,
      payment_date: "2024-01-01",
      salary_paid: 15000,
      bonus: 0,
      overtime_pay: 0,
      housing_allowance: 0,
      travel_allowance: 0,
      meal_allowance: 0,
      payment_status: "paid",
    },
  },
  {
    folder: "10-Employees/Labour Payment",
    name: "Get Payments By Labour",
    method: "get",
    path: "/api/labour_payment/:labourId",
    auth: true,
    params: { labourId: "1" },
  },
  {
    folder: "10-Employees/Labour Payment",
    name: "Update Labour Payment",
    method: "put",
    path: "/api/labour_payment/update",
    auth: true,
    body: { payment_id: 1, salary_paid: 16000 },
  },
  {
    folder: "10-Employees/Labour Payment",
    name: "Delete Labour Payment",
    method: "delete",
    path: "/api/labour_payment/delete/:id",
    auth: true,
    params: { id: "1" },
  },

  // ── Warehouse ──
  {
    folder: "11-Warehouses/Warehouse",
    name: "Add Warehouse",
    method: "post",
    path: "/api/warehouse/add",
    auth: true,
    body: { name: "Main Warehouse", location: "Farm HQ", userId: 1 },
  },
  {
    folder: "11-Warehouses/Warehouse",
    name: "Get Warehouses By User",
    method: "get",
    path: "/api/warehouse/user/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "11-Warehouses/Warehouse",
    name: "Update Warehouse",
    method: "put",
    path: "/api/warehouse/update/:id",
    auth: true,
    params: { id: "1" },
    body: { name: "Updated Warehouse" },
  },
  {
    folder: "11-Warehouses/Warehouse",
    name: "Delete Warehouse",
    method: "delete",
    path: "/api/warehouse/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "11-Warehouses/Warehouse",
    name: "Reset Warehouses",
    method: "post",
    path: "/api/warehouse/reset",
    auth: true,
  },
  {
    folder: "11-Warehouses/Warehouse",
    name: "Delete By Category",
    method: "delete",
    path: "/api/warehouse/delete-by-category/:category",
    auth: true,
    params: { category: "feed" },
  },

  // ── Inventory ──
  {
    folder: "11-Warehouses/Inventory",
    name: "Add Inventory Item",
    method: "post",
    path: "/api/inventory/add",
    auth: true,
    body: {
      name: "Corn Feed",
      quantity: 500,
      unit: "kg",
      warehouseId: 1,
      userId: 1,
    },
  },
  {
    folder: "11-Warehouses/Inventory",
    name: "Get Inventory By User",
    method: "get",
    path: "/api/inventory/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "11-Warehouses/Inventory",
    name: "Update Inventory",
    method: "put",
    path: "/api/inventory/update/:id",
    auth: true,
    params: { id: "1" },
    body: { quantity: 600 },
  },
  {
    folder: "11-Warehouses/Inventory",
    name: "Delete Inventory Item",
    method: "delete",
    path: "/api/inventory/delete/:id",
    auth: true,
    params: { id: "1" },
  },

  // ── CRM Companies ──
  {
    folder: "12-CRM/Companies",
    name: "Add Company",
    method: "post",
    path: "/api/companies/add",
    auth: true,
    body: { name: "Acme Corp", industry: "Agriculture", userId: 1 },
  },
  {
    folder: "12-CRM/Companies",
    name: "Get Companies",
    method: "get",
    path: "/api/companies",
    auth: true,
  },
  {
    folder: "12-CRM/Companies",
    name: "Get Company",
    method: "get",
    path: "/api/companies/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "12-CRM/Companies",
    name: "Update Company",
    method: "put",
    path: "/api/companies/update",
    auth: true,
    body: { company_id: 1, name: "Acme Corp Updated" },
  },
  {
    folder: "12-CRM/Companies",
    name: "Delete Company",
    method: "delete",
    path: "/api/companies/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "12-CRM/Companies",
    name: "Reset Companies",
    method: "post",
    path: "/api/companies/reset",
    auth: true,
  },

  // ── CRM Contacts ──
  {
    folder: "12-CRM/Contacts",
    name: "Add Contact",
    method: "post",
    path: "/api/contacts/add",
    auth: true,
    body: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567890",
      userId: 1,
    },
  },
  {
    folder: "12-CRM/Contacts",
    name: "Get Contacts",
    method: "get",
    path: "/api/contacts",
    auth: true,
  },
  {
    folder: "12-CRM/Contacts",
    name: "Get Contact",
    method: "get",
    path: "/api/contacts/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "12-CRM/Contacts",
    name: "Update Contact",
    method: "put",
    path: "/api/contacts/update",
    auth: true,
    body: { contact_id: 1, name: "Jane Smith Updated" },
  },
  {
    folder: "12-CRM/Contacts",
    name: "Delete Contact",
    method: "delete",
    path: "/api/contacts/delete/:id",
    auth: true,
    params: { id: "1" },
  },

  // ── CRM Contracts ──
  {
    folder: "12-CRM/Contracts",
    name: "Add Contract",
    method: "post",
    path: "/api/contracts/add",
    auth: true,
    body: {
      title: "Supply Agreement",
      value: 50000,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      userId: 1,
    },
  },
  {
    folder: "12-CRM/Contracts",
    name: "Get Contracts By User",
    method: "get",
    path: "/api/contracts/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "12-CRM/Contracts",
    name: "Get All Contracts",
    method: "get",
    path: "/api/contracts",
    auth: true,
  },
  {
    folder: "12-CRM/Contracts",
    name: "Update Contract",
    method: "put",
    path: "/api/contracts/update",
    auth: true,
    body: { contract_id: 1, title: "Updated Agreement" },
  },
  {
    folder: "12-CRM/Contracts",
    name: "Delete Contract",
    method: "delete",
    path: "/api/contracts/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "12-CRM/Contracts",
    name: "Reset Contracts",
    method: "post",
    path: "/api/contracts/reset",
    auth: true,
  },

  // ── CRM Tasks ──
  {
    folder: "12-CRM/Tasks",
    name: "Add Task",
    method: "post",
    path: "/api/tasks/add",
    auth: true,
    body: {
      title: "Check inventory",
      description: "Verify stock levels",
      project: "operations",
      deadlineDate: "2024-01-15",
      userId: 1,
    },
  },
  {
    folder: "12-CRM/Tasks",
    name: "Get Tasks By User",
    method: "get",
    path: "/api/tasks/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "12-CRM/Tasks",
    name: "Update Task",
    method: "put",
    path: "/api/tasks/update/:id",
    auth: true,
    params: { id: "1" },
    body: { title: "Task Updated" },
  },
  {
    folder: "12-CRM/Tasks",
    name: "Delete Task",
    method: "delete",
    path: "/api/tasks/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "12-CRM/Tasks",
    name: "Reset Tasks",
    method: "post",
    path: "/api/tasks/reset",
    auth: true,
  },
  {
    folder: "12-CRM/Tasks",
    name: "Get Kanban Columns",
    method: "get",
    path: "/api/tasks/columns/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "12-CRM/Tasks",
    name: "Add Kanban Column",
    method: "post",
    path: "/api/tasks/column/add",
    auth: true,
    body: { project: "operations", title: "In Progress", position: 1 },
  },
  {
    folder: "12-CRM/Tasks",
    name: "Update Kanban Column",
    method: "put",
    path: "/api/tasks/column/update/:id",
    auth: true,
    params: { id: "1" },
    body: { title: "Done", position: 2 },
  },
  {
    folder: "12-CRM/Tasks",
    name: "Delete Kanban Column",
    method: "delete",
    path: "/api/tasks/column/delete/:id",
    auth: true,
    params: { id: "1" },
  },

  // ── CRM Receipts ──
  {
    folder: "12-CRM/Receipts",
    name: "Add Receipt",
    method: "post",
    path: "/api/receipts/add",
    auth: true,
    body: {
      invoiceNumber: "INV-001",
      amount: 5000,
      date: "2024-01-01",
      userId: 1,
    },
  },
  {
    folder: "12-CRM/Receipts",
    name: "Get Receipt",
    method: "get",
    path: "/api/receipts/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "12-CRM/Receipts",
    name: "Update Receipt",
    method: "put",
    path: "/api/receipts/update",
    auth: true,
    body: { receipt_id: 1, amount: 6000 },
  },
  {
    folder: "12-CRM/Receipts",
    name: "Delete Receipt",
    method: "delete",
    path: "/api/receipts/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "12-CRM/Receipts",
    name: "Reset Receipts",
    method: "post",
    path: "/api/receipts/reset",
    auth: true,
  },

  // ── Marketplace ──
  {
    folder: "13-Marketplace/Products",
    name: "Get Products",
    method: "get",
    path: "/api/marketplace/products",
    auth: true,
  },
  {
    folder: "13-Marketplace/Products",
    name: "Get Products By User",
    method: "get",
    path: "/api/marketplace/products/user/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "13-Marketplace/Products",
    name: "Get Product",
    method: "get",
    path: "/api/marketplace/products/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "13-Marketplace/Products",
    name: "Add Product",
    method: "post",
    path: "/api/marketplace/products/add",
    auth: true,
    body: {
      name: "Organic Eggs",
      description: "Farm fresh eggs",
      price: 120,
      category: "poultry",
      userId: 1,
    },
  },
  {
    folder: "13-Marketplace/Products",
    name: "Update Product",
    method: "put",
    path: "/api/marketplace/products/update/:id",
    auth: true,
    params: { id: "1" },
    body: { price: 150 },
  },
  {
    folder: "13-Marketplace/Products",
    name: "Publish Product",
    method: "post",
    path: "/api/marketplace/products/publish/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "13-Marketplace/Products",
    name: "Unpublish Product",
    method: "post",
    path: "/api/marketplace/products/unpublish/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "13-Marketplace/Products",
    name: "Delete Product",
    method: "delete",
    path: "/api/marketplace/products/delete/:id",
    auth: true,
    params: { id: "1" },
  },
  {
    folder: "13-Marketplace/Interactions",
    name: "Toggle Favorite",
    method: "post",
    path: "/api/marketplace/favorites/toggle",
    auth: true,
    body: { userId: 1, productId: 1 },
  },
  {
    folder: "13-Marketplace/Interactions",
    name: "Toggle Wishlist",
    method: "post",
    path: "/api/marketplace/wishlist/toggle",
    auth: true,
    body: { userId: 1, productId: 1 },
  },
  {
    folder: "13-Marketplace/Interactions",
    name: "Get Favorites",
    method: "get",
    path: "/api/marketplace/favorites/user/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "13-Marketplace/Interactions",
    name: "Get Wishlist",
    method: "get",
    path: "/api/marketplace/wishlist/user/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "13-Marketplace/Interactions",
    name: "Get Interactions",
    method: "get",
    path: "/api/marketplace/interactions/user/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "13-Marketplace/Cart",
    name: "Get Cart",
    method: "get",
    path: "/api/marketplace/cart/user/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "13-Marketplace/Cart",
    name: "Add To Cart",
    method: "post",
    path: "/api/marketplace/cart/add",
    auth: true,
    body: { userId: 1, productId: 1, quantity: 2 },
  },
  {
    folder: "13-Marketplace/Cart",
    name: "Update Cart Item",
    method: "put",
    path: "/api/marketplace/cart/update/:cartId",
    auth: true,
    params: { cartId: "1" },
    body: { quantity: 3 },
  },
  {
    folder: "13-Marketplace/Cart",
    name: "Remove From Cart",
    method: "delete",
    path: "/api/marketplace/cart/remove/:cartId",
    auth: true,
    params: { cartId: "1" },
  },
  {
    folder: "13-Marketplace/Bank",
    name: "Get Bank Details",
    method: "get",
    path: "/api/marketplace/bank/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "13-Marketplace/Bank",
    name: "Save Bank Details",
    method: "post",
    path: "/api/marketplace/bank/save",
    auth: true,
    body: {
      userId: 1,
      accountNumber: "1234567890",
      ifscCode: "SBIN0001234",
      bankName: "SBI",
    },
  },
  {
    folder: "13-Marketplace/Bank",
    name: "Delete Bank Details",
    method: "delete",
    path: "/api/marketplace/bank/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "13-Marketplace/Checkout",
    name: "Create Checkout Order",
    method: "post",
    path: "/api/marketplace/checkout/create-order",
    auth: true,
    body: { userId: 1, cartIds: [1, 2] },
  },
  {
    folder: "13-Marketplace/Checkout",
    name: "Verify Checkout Payment",
    method: "post",
    path: "/api/marketplace/checkout/verify-payment",
    auth: true,
    body: {
      razorpay_order_id: "order_xxx",
      razorpay_payment_id: "pay_xxx",
      razorpay_signature: "sig_xxx",
    },
  },
  {
    folder: "13-Marketplace/Orders",
    name: "Get All Orders",
    method: "get",
    path: "/api/marketplace/orders",
    auth: true,
  },
  {
    folder: "13-Marketplace/Orders",
    name: "Get Orders By User",
    method: "get",
    path: "/api/marketplace/orders/user/:userId",
    auth: true,
    params: { userId: "1" },
  },
  {
    folder: "13-Marketplace/Orders",
    name: "Get Order",
    method: "get",
    path: "/api/marketplace/orders/:orderId",
    auth: true,
    params: { orderId: "1" },
  },
  {
    folder: "13-Marketplace/Orders",
    name: "Update Order Status",
    method: "post",
    path: "/api/marketplace/orders/:orderId/update-status",
    auth: true,
    params: { orderId: "1" },
    body: { status: "shipped" },
  },
  {
    folder: "13-Marketplace/Orders",
    name: "Release Order",
    method: "post",
    path: "/api/marketplace/orders/:orderId/release",
    auth: true,
    params: { orderId: "1" },
  },
];

function escapeString(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function generateBru(ep, seq) {
  const lines = [];

  lines.push("meta {");
  lines.push(`  name: "${escapeString(ep.name)}"`);
  lines.push("  type: http");
  lines.push(`  seq: ${seq}`);
  lines.push("}");

  const method = ep.method.toLowerCase();
  const hasBody = ["post", "put", "patch"].includes(method) && ep.body;

  const authMode = ep.auth ? "bearer" : "none";

  lines.push("");
  lines.push(`${method} {`);
  lines.push(`  url: {{baseUrl}}${ep.path}`);
  lines.push(`  body: ${hasBody ? "json" : "none"}`);
  lines.push(`  auth: ${authMode}`);
  lines.push("}");

  if (ep.auth) {
    lines.push("");
    lines.push("auth:bearer {");
    lines.push("  token: {{token}}");
    lines.push("}");
  }

  if (hasBody && ep.body) {
    lines.push("");
    lines.push("body:json {");
    lines.push("  {");
    const entries = Object.entries(ep.body);
    entries.forEach(([key, value], i) => {
      const isLast = i === entries.length - 1;
      const valStr =
        typeof value === "string"
          ? `"${escapeString(value)}"`
          : JSON.stringify(value);
      lines.push(`    "${key}": ${valStr}${isLast ? "" : ","}`);
    });
    lines.push("  }");
    lines.push("}");
  }

  lines.push("");
  return lines.join("\n");
}

function generateCollectionBru() {
  return `meta {
  name: "Graminate API"
  version: "1.0.0"
}

env {
  name: "Local"
  variables {
    baseUrl: "http://localhost:3000"
    token: ""
  }
}

env {
  name: "Production"
  variables {
    baseUrl: "https://api.graminate.com"
    token: ""
  }
}`;
}

function generateFolderBru(name) {
  return `meta {
  name: "${escapeString(name)}"
}`;
}

function main() {
  if (fs.existsSync(BRUNO_DIR)) {
    fs.rmSync(BRUNO_DIR, { recursive: true });
  }
  fs.mkdirSync(BRUNO_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(BRUNO_DIR, "collection.bru"),
    generateCollectionBru()
  );

  const folders = {};
  endpoints.forEach((ep) => {
    if (!folders[ep.folder]) folders[ep.folder] = [];
    folders[ep.folder].push(ep);
  });

  let globalSeq = 1;
  for (const [folderName, eps] of Object.entries(folders)) {
    const folderPath = path.join(BRUNO_DIR, folderName);
    fs.mkdirSync(folderPath, { recursive: true });

    const displayName = folderName.replace(/^\d+-/, "");
    fs.writeFileSync(
      path.join(folderPath, "folder.bru"),
      generateFolderBru(displayName)
    );

    eps.forEach((ep) => {
      const methodName = ep.method.toUpperCase();
      const fileName = `${methodName} ${ep.name}.bru`;
      const filePath = path.join(folderPath, fileName);
      fs.writeFileSync(filePath, generateBru(ep, globalSeq));
      globalSeq++;
    });
  }

  console.log(`Created ${endpoints.length} Bruno requests across ${Object.keys(folders).length} folders in bruno/`);
}

main();
