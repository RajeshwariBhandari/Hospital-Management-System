import connectDB from "../db/connect.js"
import jwt from 'jsonwebtoken'


//INSERTING PERSONAL DETAILS FOR LOGGED USER
const addPersonalData = (req, res) => {
    const { mob_number, DOB, weight, height, countryOrigin, diabetic, cardiac, BP, disease_describe } = req.body;

    var age = new Date().getFullYear() - new Date(DOB).getFullYear()
    var h = height.split("-")
    var BMI = (weight / (h[0] * 0.3048 + h[1] * 0.0254) ** 2).toFixed(2)

    const token = req.headers.authorization.split(' ')[1]
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)

    if (!mob_number || !DOB || !weight || !height || !countryOrigin || !disease_describe) {
        return res.json({ status: "error", error: "please provide all values" })
    }
    else {
        connectDB.query('SELECT * FROM patient_PersonalData WHERE userID = ?', [userIdvalue.id], async (err, result) => {

            if (err) throw err;
            if (result[0]) return res.json({ error: "This user is already registered as patient" })
            else {

                connectDB.query('INSERT INTO patient_PersonalData SET ?', {
                    userID: userIdvalue.id,
                    mob_number: mob_number,
                    DOB: DOB,
                    age: age,
                    weight: weight,
                    height: height,
                    BMI: BMI,
                    countryOrigin: countryOrigin,
                    diabetic: diabetic,
                    cardiac: cardiac,
                    BP: BP,
                    disease_describe: disease_describe,
                }, (error, result) => {
                    if (error) throw error;

                    return res.json({ status: "success", success: "Patient created Successfully" })
                })
            }
        })
    }
}

//INSERTING FAMILY DETAILS FOR LOGGED USER
const addFamilyData = (req, res) => {
    const { father_name, father_age, father_countryOrigin, mother_name, mother_age, mother_countryOrigin, diabetic, cardiac, BP } = req.body;

    const token = req.headers.authorization.split(' ')[1]
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)

    if (!father_name || !father_age || !father_countryOrigin || !mother_name || !mother_age || !mother_countryOrigin) {
        return res.json({ status: "error", error: "please provide all values" })
    }
    else {
        connectDB.query('SELECT patientID from patient_PersonalData WHERE userID = ?', [userIdvalue.id], async (err, ID) => {
            if (err) throw err
            else {
                connectDB.query('SELECT * FROM patient_FamilyData WHERE patientID = ?', [ID.patientID], async (err, result) => {
                    if (err) throw err;
                    if (result[0]) return res.json({ error: "This patient deatils are alreay filled" })
                    else {

                        connectDB.query('INSERT INTO patient_FamilyData SET ?', {
                            patientID: ID[0].patientID,
                            father_name: father_name,
                            father_age: father_age,
                            father_countryOrigin: father_countryOrigin,
                            mother_name: mother_name,
                            mother_age: mother_age,
                            mother_countryOrigin: mother_countryOrigin,
                            parent_diabetic: diabetic,
                            parent_cardiac: cardiac,
                            parent_BP: BP
                        }, (error, result) => {
                            if (error) throw error;
                            return res.json({ status: "success", success: "Patient family details inserted successfully" })
                        })
                    }
                })
            }
        })
    }
}

const addDocumentData = (req, res) => {

}

//UPDATE PERONAL DATA OF LOGGED USER
const updatePersonalData = async (req, res, next) => {

    const { height, weight, DOB } = req.body
    const token = req.headers.authorization.split(' ')[1];
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    var BMI, age;

    connectDB.query('SELECT height ,weight,DOB,age,BMI from patient_PersonalData WHERE userID=?', [userIdvalue.id], async (err, hwValue) => {
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

        connectDB.query("UPDATE patient_personalData SET ?,age=?, BMI =? WHERE userID=?", [req.body, age, BMI, userIdvalue.id], async (err, user) => {
            if (err) throw err
            else {
                //console.log(user)
                return res.send("Data updated successfully")
            }
        })
    })

}
//UPDATED LOGGED PATIENTS FAMILY DETAILS
const updateFamilyData = async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    connectDB.query('SELECT patientID from patient_PersonalData WHERE userID=?', [userIdvalue.id], async (err, patientId) => {
        if (err) throw err;
        else {
            console.log(patientId[0].patientID)
            connectDB.query("UPDATE patient_FamilyData SET ? WHERE patientID=?", [req.body, patientId[0].patientID], async (err, user) => {
                if (err) throw err
                else {
                    return res.send("Data updated successfully")
                }
            })
        }
    })
}


//DELETED LOGGED USERS DETAILS
const deleteInfo = (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userIdvalue = jwt.verify(token, process.env.JWT_SECRET)
    connectDB.query("SELECT patientID from patient_PersonalData WHERE userID=?", [userIdvalue.id], async (err, patientId) => {
        if (err) throw err
        else {
            if (!patientId[0]) {
                connectDB.query("DELETE FROM userData WHERE userID=?", [userIdvalue.id], async (err, useridval) => {
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
                                connectDB.query("DELETE FROM userData WHERE userID=?", [userIdvalue.id], async (err, result3) => {
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



export { addPersonalData, addFamilyData, addDocumentData, updatePersonalData, updateFamilyData, deleteInfo }
