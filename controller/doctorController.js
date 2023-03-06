import jwt from 'jsonwebtoken'
import { checkIsDoctor, doctorDataByUserId, fillDoctorData } from '../models/doctorModel.js'
import { patientPersonalByUserId, insertPatientPersonalData, patientMedicalDataByUserId, insertPatientMedicalData, updatePatientMedicalData, viewMedicalHistoryByDoctor, ScheduleAppointments, viewAppointments } from '../models/patientModel.js';
import { userDataByUserId } from '../models/usersModel.js'

//INSERTING DOCTOR DATA IF LOGGED USER IS DOCTOR
const insertDoctorData = (req, res) => {
    const { specialization, licenseNo, contactNo } = req.body;
    const token = req.headers.authorization.split(' ')[1]
    const userIdValue = jwt.verify(token, process.env.JWT_SECRET)
    checkIsDoctor(userIdValue.id, function (result) {
        if (result[0].isDoctor == 1) {
            if (!specialization || !licenseNo || !contactNo) {
                return res.json({ status: "error", error: "please provide all values" })
            }
            else {
                doctorDataByUserId(userIdValue.id, function (doctorData) {
                    if (doctorData[0]) return res.json({ error: "Doctor data is already filled" })
                    else {
                        fillDoctorData(req, userIdValue.id, function (result) {
                            return res.json({ status: "success", success: "Doctor data is filled." })
                        })
                    }
                })
            }
        }
        else {
            return res.send('Unauthorized user')
        }
    })
}


//INSERTING PERSONAL DETAILS FOR LOGGED USER
const createPatientByDoctor = (req, res) => {
    const { mobNumber, DOB, weight, height, countryOfOrigin, diabetic, cardiac, BP, diseaseDescribe } = req.body;

    var age = new Date().getFullYear() - new Date(DOB).getFullYear()
    var h = height.split("-")
    var BMI = (weight / (h[0] * 0.3048 + h[1] * 0.0254) ** 2).toFixed(2)

    const token = req.headers.authorization.split(' ')[1]
    const userIdValue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.params  //accept userId

    checkIsDoctor(userIdValue.id, function (result) {
        if (result[0].isDoctor == 1) {
            if (!mobNumber || !DOB || !weight || !height || !countryOfOrigin || !diseaseDescribe) {
                return res.json({ status: "error", error: "please provide all values" })
            }
            else {
                userDataByUserId(id.id, function (userData) {
                    if (!userData[0]) return res.json({ error: "User is not registered." })
                    else {
                        patientPersonalByUserId(id.id, function (result) {
                            if (result[0]) return res.json({ error: "Personal data is already filled" })
                            else {
                                insertPatientPersonalData(req, id.id, age, BMI, function (result1) {
                                    return res.json({ status: "success", success: "Personal data is filled." })
                                })
                            }
                        })
                    }
                })
            }
        }
        else {
            return res.send("Unauthorized user")
        }
    })
}
const insertMedicalDataByDoctor = (req, res) => {
    const { medicalHistory, treatmentPlan, appointmentDateTime, reasonForAppointment } = req.body;

    const token = req.headers.authorization.split(' ')[1]
    const userIdValue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.params //accept userid

    checkIsDoctor(userIdValue.id, function (result) {
        if (result[0].isDoctor == 1) {
            if (!appointmentDateTime || !reasonForAppointment) {
                return res.json({ status: "error", error: "please provide all values" })
            }
            else {
                doctorDataByUserId(userIdValue.id, function (doctorData) {
                    if (!doctorData[0]) {
                        return res.send("Fill doctor details first")
                    }
                    else {
                        patientPersonalByUserId(id.id, function (personalData) {
                            if (!personalData[0]) return res.json({ error: "Fill the patient's personal details first" })
                            else {
                                patientMedicalDataByUserId(personalData[0].patientId, doctorData[0].doctorId, function (result) {
                                    if (result[0]) return res.json({ error: "Patient is already assigned to you." })
                                    else {
                                        insertPatientMedicalData(req, personalData[0].patientId, doctorData[0].doctorId, function (result1) {
                                            return res.json({ status: "success", success: "Patient is now assigned to you." })
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
            return res.send("Unauthorized user")
        }
    })
}

const updatePMDataByDoctor = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdValue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.params  //accept userId

    checkIsDoctor(userIdValue.id, function (result) {
        if (result[0].isDoctor == 1) {
            doctorDataByUserId(userIdValue.id, function (doctorData) {
                if (!doctorData[0]) {
                    return res.send("Fill doctor details first")
                }
                else {
                    patientPersonalByUserId(id.id, function (personalData) {
                        if (!personalData[0]) {
                            return res.send("No such patient exist")
                        }
                        else {
                            patientMedicalDataByUserId(personalData[0].patientId, doctorData[0].doctorId, function (patientData) {
                                if (!patientData[0]) {
                                    return res.send("Can't Update!! This patient is not assigned you.")
                                }
                                else {
                                    updatePatientMedicalData(req, doctorData[0].doctorId, personalData[0].patientId, function (results) {
                                        return res.send("Medical Data updated successfully")
                                    })
                                }
                            })
                        }
                    })
                }

            })
        }
        else {
            return res.send("Unauthorized user")
        }
    })
}

const viewMedicalHistory = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdValue = jwt.verify(token, process.env.JWT_SECRET)
    checkIsDoctor(userIdValue.id, function (result) {
        if (result[0].isDoctor == 1) {
            doctorDataByUserId(userIdValue.id, function (doctorData) {
                if (!doctorData[0]) {
                    return res.send("Fill doctor details first")
                }
                else {
                    viewMedicalHistoryByDoctor(doctorData[0].doctorId, function (result) {
                        return res.json({ result })
                    })
                }
            })
        }
        else {
            return res.send("Unauthorized user")
        }
    })
}


const ScheduleAppointmentsByDoctor = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdValue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.params  //accept userId

    checkIsDoctor(userIdValue.id, function (result) {
        if (result[0].isDoctor == 1) {
            doctorDataByUserId(userIdValue.id, function (doctorData) {
                if (!doctorData[0]) {
                    return res.send("Fill doctor details first")
                }
                else {
                    patientPersonalByUserId(id.id, function (personalData) {
                        if (!personalData[0]) {
                            return res.send("No such patient exist")
                        }
                        else {
                            patientMedicalDataByUserId(personalData[0].patientId, doctorData[0].doctorId, function (patientData) {
                                if (!patientData[0]) {
                                    return res.send("Can't Update!! This patient is not assigned you.")
                                }
                                else {
                                    ScheduleAppointments(req, doctorData[0].doctorId, personalData[0].patientId, function (results) {
                                        return res.send("Medical Data updated successfully")
                                    })
                                }
                            })
                        }
                    })
                }

            })
        }
        else {
            return res.send("Unauthorized user")
        }
    })
}


const viewAppointmentByDoctor = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdValue = jwt.verify(token, process.env.JWT_SECRET)
    checkIsDoctor(userIdValue.id, function (result) {
        if (result[0].isDoctor == 1) {
            doctorDataByUserId(userIdValue.id, function (doctorData) {
                if (!doctorData[0]) {
                    return res.send("Fill doctor details first")
                }
                else {
                    viewAppointments(doctorData[0].doctorId, function (result) {
                        return res.json({ result })
                    })
                }
            })
        }
        else {
            return res.send("Unauthorized user")
        }
    })
}

export { insertDoctorData, createPatientByDoctor, insertMedicalDataByDoctor, updatePMDataByDoctor, viewMedicalHistory, ScheduleAppointmentsByDoctor, viewAppointmentByDoctor }