import db from "../db/connect.js";


export const patientPersonalByUserId = (id, callback) => {
    db.query('SELECT * from patientPersonalData WHERE userId=?', [id], async (err, result) => {
        if (err) {
            console.log(err)
        } else {

            return callback(result)
        }
    })
}

export const insertPatientPersonalData = (req, id, age, BMI, callback) => {

    db.query('INSERT INTO patientPersonalData SET ?', {
        userId: id,
        mobNumber: req.body.mobNumber,
        DOB: req.body.DOB,
        age: age,
        weight: req.body.weight,
        height: req.body.height,
        BMI: BMI,
        countryOfOrigin: req.body.countryOfOrigin,
        diabetic: req.body.diabetic,
        cardiac: req.body.cardiac,
        BP: req.body.BP,
        diseaseDescribe: req.body.diseaseDescribe,
    }, (err, result) => {
        if (err) {
            console.log(err)
        }
        else {
            return callback(result)
        }
    })
}

export const insertPatientFamilyData = (req, id, callback) => {
    db.query('INSERT INTO patientFamilyData SET ?', {
        patientId: id,
        fatherName: req.body.fatherName,
        fatherAge: req.body.fatherAge,
        fatherCountry: req.body.fatherCountry,
        motherName: req.body.motherName,
        motherAge: req.body.motherAge,
        motherCountry: req.body.motherCountry,
        parentsDiabetic: req.body.parentsDiabetic,
        parentsCardiac: req.body.parentsCardiac,
        parentsBP: req.body.parentsBP
    }, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}


export const insertPatientIdDocumentData = (id, callback) => {

    db.query('INSERT INTO patientDocumentData SET ?', {
        patientId: id,

    }, (err, result) => {
        if (err) {
            console.log(err)
        }
        else {
            return callback(result)
        }
    })
}

export const insertPatientDocumentData = (req, id, callback) => {
    //console.log(req)
    const url = "https://drive.google.com/file/d/"
    if (req.name == 'AadharFront.png') {
        db.query("UPDATE patientDocumentData SET aadharFront=? WHERE patientId=?", [url + req.id, id], async (err, result) => {
            if (err) {
                console.log(err)
            }
        })
    }
    else if (req.name == 'AadharBack.png') {
        db.query("UPDATE patientDocumentData SET aadharBack=? WHERE patientId=?", [url + req.id, id], async (err, result) => {
            if (err) {
                console.log(err)
            }
        })
    }
    else if (req.name == 'InsuranceFront.png') {
        db.query("UPDATE patientDocumentData SET insuranceFront=? WHERE patientId=?", [url + req.id, id], async (err, result) => {
            if (err) {
                console.log(err)
            }
        })
    }
    else if (req.name == 'InsuranceBack.png') {
        db.query("UPDATE patientDocumentData SET insuranceBack=? WHERE patientId=?", [url + req.id, id], async (err, result) => {
            if (err) {
                console.log(err)
            }
        })
    }
}


export const insertPatientMedicalData = (req, patientId, doctorId, callback) => {
    db.query('INSERT INTO patientMedicalData SET ?', {
        patientId: patientId,
        doctorId: doctorId,
        medicalHistory: req.body.medicalHistory,
        treatmentPlan: req.body.treatmentPlan,
        appointmentDateTime: req.body.appointmentDateTime,
        reasonForAppointment: req.body.reasonForAppointment
    }, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}


export const patientFamilyByPatientId = (id, callback) => {
    db.query('SELECT * from patientFamilyData WHERE patientId=?', [id], async (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}
export const patientDocumentByPatientId = (id, callback) => {
    db.query('SELECT * from patientDocumentData WHERE patientId=?', [id], async (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}

export const patientMedicalDataByUserId = (patientId, doctorId, callback) => {
    db.query('SELECT * from patientMedicalData WHERE patientId=? and doctorId=?', [patientId, doctorId], async (err, result) => {
        if (err) {
            console.log(err)
        } else {

            return callback(result)
        }
    })
}
export const updatePatientPersonalData = (req, age, BMI, id, callback) => {
    db.query("UPDATE patientPersonalData SET ?,age=?, BMI =? WHERE userId=?", [req.body, age, BMI, id], async (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}

export const updatePatientFamilyData = (req, id, callback) => {
    db.query("UPDATE patientFamilyData SET ? WHERE patientId=?", [req.body, id], async (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}

export const deletePatientDocumentData = (req, id, callback) => {
    db.query("DELETE FROM patientDocumentData WHERE patientId =?", [id], async (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}

export const deletePatientFamilyData = (req, id, callback) => {
    db.query("DELETE FROM patientFamilyData WHERE patientId =?", [id], async (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}

export const deletePatientPersonalData = (req, id, callback) => {
    db.query("DELETE FROM patientPersonalData WHERE patientId =?", [id], async (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}

export const updatePatientMedicalData = (req, doctorId, patientId, callback) => {
    db.query("UPDATE patientMedicalData SET ? WHERE doctorId=? and patientId=?", [req.body, doctorId, patientId], async (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}

export const viewMedicalHistoryByDoctor = (doctorId, callback) => {
    db.query("SELECT userData.userId,firstName,lastName,medicalHistory,treatmentPlan FROM patientMedicalData JOIN patientpersonaldata ON patientMedicalData.patientId=patientpersonaldata.patientId JOIN userdata ON userdata.userId = patientpersonaldata.userId WHERE patientmedicaldata.doctorId=?", [doctorId], async (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}



export const ScheduleAppointments = (req, doctorId, patientId, callback) => {
    db.query("UPDATE patientMedicalData SET appointmentDateTime=?,reasonForAppointment=? WHERE doctorId=? and patientId=?", [req.body.appointmentDateTime,req.body.reasonForAppointment, doctorId, patientId], async (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}

export const viewAppointments = (doctorId, callback) => {
    db.query("SELECT userData.userId,firstName,lastName,appointmentDateTime,reasonForAppointment FROM patientMedicalData JOIN patientpersonaldata ON patientMedicalData.patientId=patientpersonaldata.patientId JOIN userdata ON userdata.userId = patientpersonaldata.userId WHERE patientmedicaldata.doctorId=? AND appointmentDateTime >= now()", [doctorId], async (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}
