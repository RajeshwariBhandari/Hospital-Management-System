import express from 'express'
const router = express.Router()

import authenticateUser from '../middleware/auth.js'
import {insertDoctorData,createPatientByDoctor,insertMedicalDataByDoctor,updatePMDataByDoctor,viewMedicalHistory,ScheduleAppointmentsByDoctor,viewAppointmentByDoctor,availablePatientsForAppointment} from '../controllers/doctorController.js'

router.route('/insertDoctorData').post(authenticateUser,insertDoctorData)
router.route('/createPatientByDoctor').post(authenticateUser,createPatientByDoctor)
router.route('/insertMedicalDataByDoctor').post(authenticateUser,insertMedicalDataByDoctor)

router.route('/updatePMDataByDoctor').patch(authenticateUser,updatePMDataByDoctor)
router.route('/viewMedicalHistory').get(authenticateUser,viewMedicalHistory)

router.route('/scheduleAppointmentsByDoctor').patch(authenticateUser,ScheduleAppointmentsByDoctor)
router.route('/viewAppointments').get(authenticateUser,viewAppointmentByDoctor)

router.route('/availablePatientsForAppointment').get(authenticateUser,availablePatientsForAppointment)




export default router