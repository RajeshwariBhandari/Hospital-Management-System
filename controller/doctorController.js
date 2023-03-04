import jwt from 'jsonwebtoken'
import { checkIsDoctor, doctorDataByUserId, fillDoctorData } from '../models/doctorModel.js'
import { patientPersonalByUserId, insertPatientPersonalData, patientMedicalDataByUserId, insertPatientMedicalData } from '../models/patientModel.js';


//INSERTING DOCTOR DATA IF LOGGED USER IS DOCTOR
const insertDoctorData = (req, res) => {
    const { specialization, licenseNo, contactNo } = req.body;
    const token = req.headers.authorization.split(' ')[1]
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    checkIsDoctor(userIdvalue.id, function (result) {
        if (result[0].isDoctor == 1) {
            if (!specialization || !licenseNo || !contactNo) {
                return res.json({ status: "error", error: "please provide all values" })
            }
            else {
                doctorDataByUserId(userIdvalue.id, function (doctorData) {
                    if (doctorData[0]) return res.json({ error: "Doctor data is already filled" })
                    else {
                        fillDoctorData(req, userIdvalue.id, function (result) {
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
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.params

    checkIsDoctor(userIdvalue.id, function (result) {
        if (result[0].isDoctor == 1) {
            if (!mobNumber || !DOB || !weight || !height || !countryOfOrigin || !diseaseDescribe) {
                return res.json({ status: "error", error: "please provide all values" })
            }
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
        }
        else {
            return res.send("Unauthorized user")
        }
    })
}

const insertMedicalDataByDoctor = (req, res) => {
    const { medicalHistory, treatmentPlan, appointmentDateTime, reasonForAppointment } = req.body;

    const token = req.headers.authorization.split(' ')[1]
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.params //accept userid

    checkIsDoctor(userIdvalue.id, function (result) {
        if (result[0].isDoctor == 1) {
            if (!appointmentDateTime || !reasonForAppointment) {
                return res.json({ status: "error", error: "please provide all values" })
            }
            else {
                patientPersonalByUserId(id.id, function (personalData) {
                    patientMedicalDataByUserId(personalData[0].patientId, userIdvalue.id, function (result) {
                        if (result[0]) return res.json({ error: "Patient is already assigned to you." })
                        else {
                            insertPatientMedicalData(req, personalData[0].patientId, userIdvalue.id, function (result1) {
                                return res.json({ status: "success", success: "Patient is now assigned to you." })
                            })
                        }
                    })
                })
            }
        }
        else {
            return res.send("Unauthorized user")
        }
    })
}


export { insertDoctorData, createPatientByDoctor, insertMedicalDataByDoctor }