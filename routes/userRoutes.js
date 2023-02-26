import express from 'express'
const router = express.Router()

import{createUser,loginUser,updateUser,allUsers,editUserData,editPersonalData,editFamilyData,deletePatient} from "../controller/userController.js"
import authenticateUser from '../middleware/auth.js'


//USER ROUTES
router.route('/createUser').post(createUser)
router.route('/loginUser').post(loginUser)
router.route('/updateUser').patch(authenticateUser,updateUser)

//ADMIN ROUTES
router.route('/admin/allUsers').get(authenticateUser,allUsers)
router.route('/admin/allUsers/:id').patch(authenticateUser,editPersonalData).delete(authenticateUser,deletePatient)
router.route('/admin/editFamilyData/:id').patch(authenticateUser,editFamilyData)
router.route('/admin/editUserData/:id').patch(authenticateUser,editUserData)


export default router