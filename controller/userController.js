import connectDB from "../db/connect.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Randomstring from "randomstring"
import sendMail from '../helpers/sendMail.js'


//USER CREATION FUNCTION
const createUser = async (req, res) => {

    const { firstName, lastName, email, password } = req.body

    if (!firstName || !lastName || !email || !password) {
        return res.json({ status: "error", error: "please provide all values" })
    }
    else {
        connectDB.query('SELECT * FROM userData WHERE email = ?', [email], async (err, result) => {
            // console.log(result)
            if (err) throw err;
            if (result[0]) return res.json({ error: "Email has already been registered" })
            else {
                const Npassword = await bcrypt.hash(password, 10);

                connectDB.query('INSERT INTO userData SET ?', {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    user_password: Npassword,
                    isAdmin: false
                }, (error, result) => {
                    if (error) throw error;

                    let mailSubject = 'Mail Verification';
                    const randomToken = Randomstring.generate();
                    let content = '<p>Hii ' + req.body.firstName + ', Please <a href = "http://localhost:3000/mail-verification?token=' + randomToken + '"> verify</a>'

                    sendMail(req.body.email, mailSubject, content)

                    return res.json({ status: "success", success: "User created Successfully" })
                })
            }
        })
    }
}


//USER LOGIN 
const loginUser = async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) return res.json({ status: "error", error: "please enter your email and password" })
    else {
        connectDB.query('SELECT * FROM userData WHERE email = ?', [email], async (err, result) => {

            if (err) throw err;
            if (!result[0] || !await bcrypt.compare(password, result[0].user_password)) {
                return res.json({ status: "error", error: "Incorrect email or password" })
            }
            else {
                const token = jwt.sign({ id: result[0].userID }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_LIFETIME
                })
                req.userID = result[0].userID;

                return res.json({ status: "success", success: `${result[0].firstName} login Successfully`, token, isAdmin: result[0].isAdmin, created_userID: result[0].userID })
                //next()
            }
        })
    }
}


//ADMIN FUNCTION TO SHOW ALL USERS IN DATABASE
const allUsers = async (req, res) => {

    const token = req.headers.authorization.split(' ')[1];
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)

    connectDB.query("SELECT isAdmin from userData WHERE userID=?", [userIdvalue.id], async (err, isadmin) => {
        if (err) throw err;
        else {
            if (isadmin[0].isAdmin == 1) {
                connectDB.query("SELECT userID,firstName,lastName,email,isAdmin FROM userData", async (err, result) => {
                    if (err) throw err
                    else {
                        return res.json({ result })
                    }
                })
            }
            else {
                return res.send("You don't have access to see detail of users")
            }
        }
    })
}

const editPersonalData = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.params
    connectDB.query("SELECT isAdmin from userData WHERE userID=?", [userIdvalue.id], async (err, isadmin) => {
        if (err) throw err;
        else {
            if (isadmin[0].isAdmin == 1) {
                const { height, weight, DOB } = req.body
                var BMI, age;

                connectDB.query('SELECT height ,weight,DOB,age,BMI from patient_PersonalData WHERE userID=?', [id.id], async (err, hwValue) => {
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
                        //console.log(BMI)
                    }
                    else if (!height && weight) {
                        BMI = (weight / (hwValue[0].height[0] * 0.3048 + hwValue[0].height[2] * 0.0254) ** 2).toFixed(2)
                        // console.log(BMI)
                    }
                    else {
                        BMI = hwValue[0].BMI
                    }

                    connectDB.query("UPDATE patient_personalData SET ?,age=?, BMI =? WHERE userID=?", [req.body, age, BMI, id.id], async (err, user) => {
                        if (err) throw err
                        else {
                            //console.log(user)
                            return res.send("Data updated successfully")
                        }
                    })
                })
            }
            else {
                return res.send("you don't have access")
            }
        }

    })

}

const editFamilyData = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.params
    connectDB.query("SELECT isAdmin from userData WHERE userID=?", [userIdvalue.id], async (err, isadmin) => {
        if (err) throw err;
        else {
            if (isadmin[0].isAdmin == 1) {
                connectDB.query('SELECT patientID from patient_PersonalData WHERE userID=?', [id.id], async (err, patientId) => {
                    if (err) throw err;
                    else {
                       // console.log(patientId[0].patientID)
                        connectDB.query("UPDATE patient_FamilyData SET ? WHERE patientID=?", [req.body, patientId[0].patientID], async (err, user) => {
                            if (err) throw err
                            else {
                                return res.send("Data updated successfully")
                            }
                        })
                    }
                })
            }
            else {
                return res.send("you don't have access")
            }
        }
    })
}

const editUserData = async(req,res)=>{
    const token = req.headers.authorization.split(' ')[1];
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.params
    connectDB.query("SELECT isAdmin from userData WHERE userID=?", [userIdvalue.id], async (err, isadmin) => {
        if (err) throw err;
        else {
            if (isadmin[0].isAdmin == 1) {
                connectDB.query("UPDATE userData SET ? WHERE userID=?", [req.body, id.id], async (err, user) => {
                    if (err) throw err
                    else {
                        return res.send("Data updated successfully")
                    }
                })
            }
            else {
                return res.send("you don't have access")
            }
        }
    })
}

const deletePatient = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    const id = req.params
    // console.log(id.id)
    connectDB.query("SELECT isAdmin from userData WHERE userID=?", [userIdvalue.id], async (err, isadmin) => {
        if (err) throw err;
        else {
            if (isadmin[0].isAdmin == 1) {
                connectDB.query("SELECT patientID from patient_PersonalData WHERE userID=?", [id.id], async (err, patientId) => {
                    if (err) throw err
                    else {
                        if (!patientId[0]) {
                            connectDB.query("DELETE FROM userData WHERE userID=?", [id.id], async (err, useridval) => {
                                if (err) throw err;
                                else {
                                    return res.send("Record deleted Successfully")
                                }
                            })
                        }
                        else {
                            connectDB.query("DELETE FROM patient_FamilyData WHERE patientID =?", [patientId[0].patientID], async (err, result) => {
                                if (err) throw err;
                                else {
                                    connectDB.query("DELETE FROM patient_PersonalData WHERE patientID=?", [patientId[0].patientID], async (err, result2) => {
                                        if (err) throw err;
                                        else {
                                            connectDB.query("DELETE FROM userData WHERE userID=?", [id.id], async (err, result3) => {
                                                if (err) throw err;
                                                else {
                                                    return res.send("Record deleted successfully")
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    }
                })

            }
            else {
                return res.send("you don't have access")
            }
        }

    })
}

//PERSONAL PROFILE/ USERDATA ONLY UPDATE
const updateUser = async (req, res) => {

    const token = req.headers.authorization.split(' ')[1];
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)

    connectDB.query("UPDATE userData SET ? WHERE userID=?", [req.body, userIdvalue.id], async (err, user) => {
        if (err) throw err
        else {
            return res.send("Data updated successfully")
        }
    })
}


export { createUser, loginUser, updateUser, allUsers,editUserData, editPersonalData, editFamilyData, deletePatient }