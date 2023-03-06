import db from "../db/connect.js";

export const userDataByEmail = (req, callback) => {
    db.query('SELECT * FROM userData WHERE emailId = ?', [req.body.emailId], (err, result) => {
        if (err) {
            console.log(err)
        }
        else {
            return callback(result)

        }
    })
}

export const insertUserData = (req, password, callback) => {
    db.query('INSERT INTO userData SET ?', {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        emailId: req.body.emailId,
        userPassword: password,
        isAdmin: false,
        isDoctor: false
    }, (err, result) => {
        if (err) {
            console.log(err)
        }
        else {
            return callback(result)
        }
    })
}

export const checkIsAdmin = (id, callback) => {

    db.query("SELECT isAdmin from userData WHERE userId=?", [id], async (err, result) => {
        if (err) {
            console.log(err)
        }
        else {
            return callback(result)
        }

    })
}

export const allUserData = (callback) => {
    db.query("SELECT userId,firstName,lastName,emailId,isAdmin,isDoctor FROM userData", async (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}

export const updateUserData = (req, id, callback) => {
    db.query("UPDATE userData SET ? WHERE userId=?", [req.body, id], async (err, result) => {
        if (err) {
            console.log(err)
        } else {

            return callback(result)
        }
    })
}

export const deleteUserData = (req, id, callback) => {
    db.query("DELETE FROM userData WHERE userId=?", [id], async (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return callback(result)
        }
    })
}

export const userDataByUserId = (id, callback) => {
    db.query('SELECT * from userData WHERE userId=?', [id], async (err, result) => {
        if (err){
            console.log(err);
        }
        return callback(result)
    })
}