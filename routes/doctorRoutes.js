import express from 'express'
const router = express.Router()

import authenticateUser from '../middleware/auth.js'
import {insertDoctorData,createPatientByDoctor,insertMedicalDataByDoctor,updatePMDataByDoctor,viewMedicalHistory,ScheduleAppointmentsByDoctor,viewAppointmentByDoctor} from '../controller/doctorController.js'

router.route('/insertDoctorData').post(authenticateUser,insertDoctorData)
router.route('/createPatientByDoctor/:id').post(authenticateUser,createPatientByDoctor)
router.route('/insertMedicalDataByDoctor/:id').post(authenticateUser,insertMedicalDataByDoctor)

router.route('/updatePMDataByDoctor/:id').patch(authenticateUser,updatePMDataByDoctor)
router.route('/viewMedicalHistory').get(authenticateUser,viewMedicalHistory)

router.route('/scheduleAppointmentsByDoctor/:id').patch(authenticateUser,ScheduleAppointmentsByDoctor)
router.route('/viewAppointments').get(authenticateUser,viewAppointmentByDoctor)



export default router