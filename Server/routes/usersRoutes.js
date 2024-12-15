const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for managing users
 */


/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with role Admin, Uploader, or Student
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: No users found
 *       500:
 *         description: Error fetching users
 */
router.get("/users", authMiddleware, userController.getUsers);

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get the currently logged-in user's details
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isSuperAdmin:
 *                       type: boolean
 *                     isAdmin:
 *                       type: boolean
 *                     isStudent:
 *                       type: boolean
 *       404:
 *         description: User not found
 *       500:
 *         description: Error fetching user details
 */
router.get("/me", authMiddleware, userController.getCurrentUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user's details
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: User not found
 *       500:
 *         description: Error updating user
 */
router.put("/users/:id", authMiddleware, userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: User not found
 *       500:
 *         description: Error deleting user
 */
router.delete("/users/:id", authMiddleware, userController.deleteUser);

/**
 * @swagger
 * /api/users/{id}/regulation:
 *   get:
 *     summary: Get a user's regulation by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User regulation fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 regulation:
 *                   type: object
 *                   description: The regulation details of the user
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Error fetching user regulation
 */
router.get("/users/:id/regulation", authMiddleware, userController.getUserRegulation);





module.exports = router;
