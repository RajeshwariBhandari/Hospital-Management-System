import jwt from 'jsonwebtoken'
import { checkIsDoctor, doctorDataByUserId, fillDoctorData } from '../models/doctorModel.js'
import { patientPersonalByUserId, insertPatientPersonalData, patientMedicalDataByUserId, insertPatientMedicalData, updatePatientMedicalData, viewMedicalHistoryByDoctor, ScheduleAppointments, viewAppointments, viewPatientMedicalHistory ,availablePatients} from '../models/patientModel.js';
import { userDataByUserId } from '../models/userModel.js'

//INSERTING DOCTOR DATA IF LOGGED USER IS DOCTOR
const insertDoctorData = (req, res) => {
    const { specialization, licenseNo, contactNo } = req.body;
    const token = req.headers.authorization.split(' ')[1]
    const userIdValue = jwt.verify(token, process.env.JWT_SECRET)
    checkIsDoctor(userIdValue.id, function (result) {
        if (result[0].isDoctor == 1) {
            if (!specialization || !licenseNo || !contactNo) {
                return res.status(400).json({ status: "error", error: "please provide all values" })
            }
            else {
                doctorDataByUserId(userIdValue.id, function (doctorData) {
                    if (doctorData[0]) return res.status(409).json({ error: "Doctor data is already filled" })
                    else {
                        fillDoctorData(req, userIdValue.id, function (result) {
                            return res.status(201).json({ status: "success", success: "Doctor data is filled." })
                        })
                    }
                })
            }
        }
        else {
            return res.status(401).send('Unauthorized user')
        }
    })
}


//DOCTOR CREATE PATIENTS
const createPatientByDoctor = (req, res) => {
    const { mobNumber, DOB, weight, height, countryOfOrigin, diabetic, cardiac, BP, diseaseDescribe } = req.body;

    var age = new Date().getFullYear() - new Date(DOB).getFullYear()
    var h = height.split("-")
    var BMI = (weight / (h[0] * 0.3048 + h[1] * 0.0254) ** 2).toFixed(2)

    const token = req.headers.authorization.split(' ')[1]
    const userIdValue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.query  //accept userId

    checkIsDoctor(userIdValue.id, function (result) {
        if (result[0].isDoctor == 1) {
            if (!mobNumber || !DOB || !weight || !height || !countryOfOrigin || !diseaseDescribe) {
                return res.status(400).json({ status: "error", error: "please provide all values" })
            }
            else {
                userDataByUserId(id.id, function (userData) {
                    if (!userData[0]) return res.status(404).json({ error: "User is not registered." })
                    else {
                        patientPersonalByUserId(id.id, function (result) {
                            if (result[0]) return res.status(409).json({ error: "Personal data is already filled" })
                            else {
                                insertPatientPersonalData(req, id.id, age, BMI, function (result1) {
                                    return res.status(201).json({ status: "success", success: "Personal data is filled." })
                                })
                            }
                        })
                    }
                })
            }
        }
        else {
            return res.status(401).send("Unauthorized user")
        }
    })
}

//INSERT MEDICAL DATA OF PATIENTS BY PASSING THEIR USERID VIA DOCTOR
const insertMedicalDataByDoctor = (req, res) => {
    const { medicalHistory, treatmentPlan, appointmentDateTime, reasonForAppointment } = req.body;

    const token = req.headers.authorization.split(' ')[1]
    const userIdValue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.query //accept userid

    checkIsDoctor(userIdValue.id, function (result) {
        if (result[0].isDoctor == 1) {
            if (!appointmentDateTime || !reasonForAppointment) {
                return res.status(400).json({ status: "error", error: "please provide all values" })
            }
            else {
                doctorDataByUserId(userIdValue.id, function (doctorData) {
                    if (!doctorData[0]) {
                        return res.status(404).send("Fill doctor details first")
                    }
                    else {
                        patientPersonalByUserId(id.id, function (personalData) {
                            //  console.log(personalData)
                            if (!personalData[0]) return res.status(404).json({ error: "Fill the patient's personal details first" })
                            else {
                                patientMedicalDataByUserId(personalData[0].patientId, doctorData[0].doctorId, function (result) {
                                    if (result[0]) return res.status(409).json({ error: "Patient is already assigned to you." })
                                    else {
                                        insertPatientMedicalData(req, personalData[0].patientId, doctorData[0].doctorId, function (result1) {
                                            return res.status(201).json({ status: "success", success: "Patient is now assigned to you." })
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
        else {
            return res.status(401).send("Unauthorized user")
        }
    })
}

//UPDATE PATIENTS MEDICAL DATA BY DOCTOR
const updatePMDataByDoctor = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdValue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.query  //accept userId

    checkIsDoctor(userIdValue.id, function (result) {
        if (result[0].isDoctor == 1) {
            doctorDataByUserId(userIdValue.id, function (doctorData) {
                if (!doctorData[0]) {
                    return res.status(404).send("Fill doctor details first")
                }
                else {
                    patientPersonalByUserId(id.id, function (personalData) {
                        if (!personalData[0]) {
                            return res.status(404).send("No such patient exist")
                        }
                        else {
                            patientMedicalDataByUserId(personalData[0].patientId, doctorData[0].doctorId, function (patientData) {
                                if (!patientData[0]) {
                                    return res.status(403).send("Can't Update!! This patient is not assigned you.")
                                }
                                else {
                                    viewPatientMedicalHistory(doctorData[0].doctorId, personalData[0].patientId, function (medicalHistory) {
                                        updatePatientMedicalData(req, medicalHistory[0].medicalHistory, doctorData[0].doctorId, personalData[0].patientId, function (results) {
                                            return res.status(200).send("Medical Data updated successfully")
                                        })
                                    })
                                }
                            })
                        }
                    })
                }

            })
        }
        else {
            return res.status(401).send("Unauthorized user")
        }
    })
}

//GET MEDICAL HISTORY AND TREATEMENT PLAN FOR PATIENTS WHICH  ARE ASSIGNED TO LOGGED DOCTOR
const viewMedicalHistory = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdValue = jwt.verify(token, process.env.JWT_SECRET)
    checkIsDoctor(userIdValue.id, function (result) {
        if (result[0].isDoctor == 1) {
            doctorDataByUserId(userIdValue.id, function (doctorData) {
                if (!doctorData[0]) {
                    return res.status(404).send("Fill doctor details first")
                }
                else {
                    viewMedicalHistoryByDoctor(doctorData[0].doctorId, function (result) {
                        return res.status(200).json({ result })
                    })
                }
            })
        }
        else {
            return res.status(401).send("Unauthorized user")
        }
    })
}

//SCHEDULE APPOINTMENTS FOR EACH PATIENTS WHICH ARE ASSIGNED TO THEM BY PASSING THEIR USERID
const ScheduleAppointmentsByDoctor = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdValue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.query  //accept userId

    checkIsDoctor(userIdValue.id, function (result) {
        if (result[0].isDoctor == 1) {
            doctorDataByUserId(userIdValue.id, function (doctorData) {
                if (!doctorData[0]) {
                    return res.status(404).send("Fill doctor details first")
                }
                else {
                    patientPersonalByUserId(id.id, function (personalData) {
                        if (!personalData[0]) {
                            return res.status(404).send("No such patient exist")
                        }
                        else {
                            patientMedicalDataByUserId(personalData[0].patientId, doctorData[0].doctorId, function (patientData) {
                                if (!patientData[0]) {
                                    return res.status(403).send("Can't Update!! This patient is not assigned you.")
                                }
                                else {
                                    ScheduleAppointments(req, doctorData[0].doctorId, personalData[0].patientId, function (results) {
                                        return res.status(200).send("Medical Data updated successfully")
                                    })
                                }
                            })
                        }
                    })
                }

            })
        }
        else {
            return res.status(401).send("Unauthorized user")
        }
    })
}

//GET UPCOMING APPOINTMENTS WITH PATIENTS FOR LOGGED DOCTOR
const viewAppointmentByDoctor = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdValue = jwt.verify(token, process.env.JWT_SECRET)
    checkIsDoctor(userIdValue.id, function (result) {
        if (result[0].isDoctor == 1) {
            doctorDataByUserId(userIdValue.id, function (doctorData) {
                if (!doctorData[0]) {
                    return res.status(404).send("Fill doctor details first")
                }
                else {
                    viewAppointments(doctorData[0].doctorId, function (result) {
                        return res.status(200).json({ result })
                    })
                }
            })
        }
        else {
            return res.status(401).send("Unauthorized user")
        }
    })
}

const availablePatientsForAppointment = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdValue = jwt.verify(token, process.env.JWT_SECRET)
    checkIsDoctor(userIdValue.id, function (result) {
        if (result[0].isDoctor == 1) {

            availablePatients(function (result) {
                return res.status(200).json({ result })
            })

            }
        else {
            return res.status(401).send("Unauthorized user")
        }
    })
}

export { insertDoctorData, createPatientByDoctor, insertMedicalDataByDoctor, updatePMDataByDoctor, viewMedicalHistory, ScheduleAppointmentsByDoctor, viewAppointmentByDoctor,availablePatientsForAppointment }