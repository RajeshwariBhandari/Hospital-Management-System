import express from 'express'
const router = express.Router()

import{registerUser,loginUser,updateUser,allUsers,editUserData,editPersonalData,editFamilyData,deletePatient,insertMedicalDataByAdmin} from "../controller/userController.js"
import authenticateUser from '../middleware/auth.js'


//USER ROUTES
router.route('/registerUser').post(registerUser)
router.route('/loginUser').post(loginUser)
router.route('/updateUser').patch(authenticateUser,updateUser)


//ADMIN ROUTES
router.route('/admin/allUsers').get(authenticateUser,allUsers)
router.route('/admin/editPersonalData/:id').patch(authenticateUser,editPersonalData)
router.route('/admin/editFamilyData/:id').patch(authenticateUser,editFamilyData)
router.route('/admin/editUserData/:id/').patch(authenticateUser,editUserData)
router.route('/admin/deletePatient/:id').delete(authenticateUser,deletePatient)

router.route('/admin/insertMedicalDataByAdmin/:userId/:doctorId').post(authenticateUser,insertMedicalDataByAdmin)



export default router