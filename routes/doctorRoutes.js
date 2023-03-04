import express from 'express'
const router = express.Router()

import authenticateUser from '../middleware/auth.js'
import {insertDoctorData,createPatientByDoctor,insertMedicalDataByDoctor} from '../controller/doctorController.js'

router.route('/insertDoctorData').post(authenticateUser,insertDoctorData)
router.route('/createPatientByDoctor/:id').post(authenticateUser,createPatientByDoctor)
router.route('/insertMedicalDataByDoctor/:id').post(authenticateUser,insertMedicalDataByDoctor)


export default router