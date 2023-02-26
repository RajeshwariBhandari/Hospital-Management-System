import express from 'express'
const router = express.Router()

import{ addPersonalData, addFamilyData, addDocumentData ,updatePersonalData,updateFamilyData,deleteInfo} from '../controller/patientController.js'
import authenticateUser from '../middleware/auth.js'


router.route('/addPersonalData').post(authenticateUser,addPersonalData) 
router.route('/addFamilyData').post(authenticateUser,addFamilyData) 
router.route('/addDocumentData').post(authenticateUser,addDocumentData) 
router.route('/updatePersonalData').patch(authenticateUser,updatePersonalData)
router.route('/updateFamilyData').patch(authenticateUser,updateFamilyData)
router.route('/deleteInfo').delete(authenticateUser,deleteInfo)



export default router