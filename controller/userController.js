import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Randomstring from "randomstring"
import sendMail from '../helpers/sendMail.js'
import { checkIsAdmin, insertUserData, allUserData, userDataByEmail, updateUserData, deleteUserData, } from "../models/usersModel.js"
import { patientPersonalByUserId, updatePatientPersonalData, updatePatientFamilyData, deletePatientFamilyData, deletePatientPersonalData, deletePatientDocumentData ,patientMedicalDataByUserId,insertPatientMedicalData} from "../models/patientModel.js"


//USER CREATION FUNCTION
const registerUser = async (req, res) => {

    const { firstName, lastName, emailId, userPassword } = req.body

    if (!firstName || !lastName || !emailId || !userPassword) {
        return res.json({ status: "error", error: "please provide all values" })
    }
    else {
        userDataByEmail(req, async function (result) {
            if (result[0]) return res.json({ error: "Email Id is already registered" })
            else {
                const password = await bcrypt.hash(userPassword, 12);

                insertUserData(req, password, function (result) {
                    let mailSubject = 'Mail Verification';
                    const randomToken = Randomstring.generate();
                    let content = '<p>Hii ' + req.body.firstName + ', Please <a href = "http://localhost:3000/mail-verification?token=' + randomToken + '"> Verify your email!!</a>'

                    sendMail(req.body.emailId, mailSubject, content)

                    return res.json({ status: "success", success: "User registered Successfully!!" })
                })
            }
        })
    }
}

//USER LOGIN 
const loginUser = async (req, res, next) => {
    const { emailId, userPassword } = req.body
    if (!emailId || !userPassword) return res.json({ status: "error", error: "please provide all values" })
    else {
        userDataByEmail(req, async function (result) {

            if (!result[0] || !await bcrypt.compare(userPassword, result[0].userPassword)) {
                return res.json({ status: "error", error: "Incorrect credentials" })
            }
            else {
                const token = jwt.sign({ id: result[0].userId }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_LIFETIME
                })
                const user = { userId: result[0].userId, name: result[0].firstName + ' ' + result[0].lastName, emailId: result[0].emailId, isAdmin: result[0].isAdmin, isDoctor: result[0].isDoctor }

                return res.json({ status: "success", success: " login Successful!!", token, userDetails: user })
            }
        })
    }
}


//ADMIN FUNCTION TO SHOW ALL USERS IN DATABASE
const allUsers = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    checkIsAdmin(userIdvalue.id, function (result) {
        if (result[0].isAdmin == 1) {
            allUserData(function (result) {
                return res.json({ result })
            })
        }
        else {
            return res.send("Unauthorized user")
        }
    })
}


//PERSONAL PROFILE/ USERDATA ONLY UPDATE
const updateUser = async (req, res) => {

    const token = req.headers.authorization.split(' ')[1];
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)

    updateUserData(req, userIdvalue.id, function (result) {
        return res.send("Data updated successfully")
    })
}


const editUserData = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.params
    checkIsAdmin(userIdvalue.id, function (result) {
        if (result[0].isAdmin == 1) {
            updateUserData(req, id.id, function (result) {
                return res.send("User Data updated successfully")
            })
        }
        else {
            return res.send("Unauthorized user")
        }
    })
}

const editPersonalData = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.params
    checkIsAdmin(userIdvalue.id, function (result) {
        if (result[0].isAdmin == 1) {
            const { height, weight, DOB } = req.body
            var BMI, age;

            patientPersonalByUserId(id.id, function (hwValue) {
                if (DOB) {
                    age = new Date().getFullYear() - new Date(DOB).getFullYear()
                }
                else {
                    age = hwValue[0].age
                }

                if (height && weight) {
                    var h = height.split("-")
                    BMI = (weight / (h[0] * 0.3048 + h[1] * 0.0254) ** 2).toFixed(2)
                }
                else if (!weight && height) {
                    var h = height.split("-")
                    BMI = (hwValue[0].weight / (h[0] * 0.3048 + h[1] * 0.0254) ** 2).toFixed(2)
                }
                else if (!height && weight) {
                    BMI = (weight / (hwValue[0].height[0] * 0.3048 + hwValue[0].height[2] * 0.0254) ** 2).toFixed(2)
                }
                else {
                    BMI = hwValue[0].BMI
                }
                updatePatientPersonalData(req, age, BMI, id.id, function (result) {
                    return res.send("Personal Data updated successfully")
                })
            })
        }
        else {
            return res.send("Unauthorized user")
        }
    })
}

const editFamilyData = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.params
    checkIsAdmin(userIdvalue.id, function (result) {
        if (result[0].isAdmin == 1) {
            patientPersonalByUserId(id.id, function (personalData) {
                updatePatientFamilyData(req, personalData[0].patientId, function (results) {
                    return res.send("Family Data updated successfully")
                })
            })
        }
        else {
            return res.send("Unauthorized user")
        }
    })
}

const deletePatient = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.params
    checkIsAdmin(userIdvalue.id, function (result) {
        if (result[0].isAdmin == 1) {
            patientPersonalByUserId(id.id, function (personalData) {
                if (!personalData[0]) {
                    deleteUserData(req, id.id, function (del) {
                        return res.send("Record deleted Successfully")
                    })
                }
                else {
                    deletePatientDocumentData(req, personalData[0].patientId, function (del1) {
                        deletePatientFamilyData(req, personalData[0].patientId, function (del2) {
                            deletePatientPersonalData(req, personalData[0].patientId, function (del3) {
                                deleteUserData(req, id.id, function (del4) {
                                    return res.send("Record deleted successfully")
                                })
                            })
                        })
                    })
                }
            })
        }
        else {
            return res.send("Unauthorized user")
        }

    })
}

//Inserting patientMedicalData by Admin
const insertMedicalDataByAdmin = (req, res) => {
    const { medicalHistory, treatmentPlan, appointmentDateTime, reasonForAppointment } = req.body;

    const token = req.headers.authorization.split(' ')[1]
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    const userId = req.params.userId
    const doctorId = req.params.doctorId

    checkIsAdmin(userIdvalue.id, function (result) {
        if (result[0].isAdmin == 1) {
            if (!appointmentDateTime || !reasonForAppointment) {
                return res.json({ status: "error", error: "please provide all values" })
            }
            else {
                patientPersonalByUserId(userId, function (personalData) {
                    if(!personalData[0]){
                        return res.send("No patient exist")
                    }
                    else{
                    patientMedicalDataByUserId(personalData[0].patientId,doctorId, function (result) {
                        if (result[0]) return res.json({ error: "Patient is already assigned." })
                        else {
                            insertPatientMedicalData(req, personalData[0].patientId,doctorId, function (result1) {
                                return res.json({ status: "success", success: "Patient is now assigned." })
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


export { registerUser, loginUser, updateUser, allUsers, editUserData, editPersonalData, editFamilyData, deletePatient,insertMedicalDataByAdmin }