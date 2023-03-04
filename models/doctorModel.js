import db from '../db/connect.js'

const checkIsDoctor = (id, callback) => {

    db.query("SELECT isDoctor from userData WHERE userId=?", [id], async (err, result) => {
        if (err) {
            console.log(err)
        }
        else {
            return callback(result)
        }

    })
}

const doctorDataByUserId = (id, callback) => {
    db.query('SELECT * from doctorData WHERE userId=?', [id], async (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}


const fillDoctorData = (req, id, callback) => {
   
    db.query('INSERT INTO doctorData SET ?', {
        userId: id,
        specialization: req.body.specialization,
        licenseNo: req.body.licenseNo,
        contactNo: req.body.contactNo
    }, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}

export { checkIsDoctor, doctorDataByUserId, fillDoctorData }