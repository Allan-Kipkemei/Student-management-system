// Import required libraries and models
const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');

// Function to register a new student
const studentRegister = async (req, res) => {


    try {

        const { password  } = req.body;
        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        // Check if a student with the same roll number, school, and class already exists
        const existingStudent = await Student.findOne({
            rollNum: req.body.rollNum,
            school: req.body.adminID,
            sclassName: req.body.sclassName,
        });

        if (existingStudent) {
            // If a student with the same details exists, send a message
            res.send({ message: 'Roll Number already exists' });
        } else {
            // Create a new student, save it to the database, and send the result
            const student = new Student({
                ...req.body,
                school: req.body.adminID,
                password: hashedPass,
            });

            let result = await student.save();

            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        // Handle errors and send a 500 status with the error details
        res.status(500).json(err);
    }
};

// Function to handle student login
const studentLogIn = async (req, res) => {
    try {
        // Find the student by roll number and name
        let student = await Student.findOne({ rollNum: req.body.rollNum, name: req.body.studentName });

        if (student) {
            // If the student is found, validate the password
            const validated = await bcrypt.compare(req.body.password, student.password);

            if (validated) {
                // If the password is valid, populate certain fields and send the student data
                student = await student.populate("school", "schoolName")
                student = await student.populate("sclassName", "sclassName")
                student.password = undefined;
                student.examResult = undefined;
                student.attendance = undefined;
                res.send(student);
            } else {
                // If the password is invalid, send a message
                res.send({ message: "Invalid password" });
            }
        } else {
            // If the student is not found, send a message
            res.send({ message: "Student not found" });
        }
    } catch (err) {
        // Handle errors and send a 500 status with the error details
        res.status(500).json(err);
    }
};

// Function to get all students in a school
const getStudents = async (req, res) => {
    try {
        // Find all students in a school and populate the class name
        let students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");

        if (students.length > 0) {
            // If students are found, modify the data and send the result
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            // If no students are found, send a message
            res.send({ message: "No students found" });
        }
    } catch (err) {
        // Handle errors and send a 500 status with the error details
        res.status(500).json(err);
    }
};

// Function to get detailed information about a specific student
const getStudentDetail = async (req, res) => {
    try {
        // Find a student by ID and populate various fields for detailed information
        let student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .populate("examResult.subName", "subName")
            .populate("attendance.subName", "subName sessions");

        if (student) {
            // If the student is found, remove sensitive data and send the result
            student.password = undefined;
            res.send(student);
        } else {
            // If the student is not found, send a message
            res.send({ message: "No student found" });
        }
    } catch (err) {
        // Handle errors and send a 500 status with the error details
        res.status(500).json(err);
    }
}

// Function to delete a specific student by ID
const deleteStudent = async (req, res) => {
    try {
        // Find and delete a student by ID
        const result = await Student.findByIdAndDelete(req.params.id)
        res.send(result)
    } catch (error) {
        // Handle errors and send a 500 status with the error details
        res.status(500).json(err);
    }
}

// Function to delete all students in a school
const deleteStudents = async (req, res) => {
    try {
        // Delete all students in a school
        const result = await Student.deleteMany({ school: req.params.id })
        if (result.deletedCount === 0) {
            // If no students are found to delete, send a message
            res.send({ message: "No students found to delete" })
        } else {
            // If students are deleted, send the result
            res.send(result)
        }
    } catch (error) {
        // Handle errors and send a 500 status with the error details
        res.status(500).json(err);
    }
}

// Function to delete all students in a specific class
const deleteStudentsByClass = async (req, res) => {
    try {
        // Delete all students in a specific class
        const result = await Student.deleteMany({ sclassName: req.params.id })
        if (result.deletedCount === 0) {
            // If no students are found to delete, send a message
            res.send({ message: "No students found to delete" })
        } else {
            // If students are deleted, send the result
            res.send(result)
        }
    } catch (error) {
        // Handle errors and send a 500 status with the error details
        res.status(500).json(err);
    }
}

// Function to update student information
const updateStudent = async (req, res) => {
    try {
        // If a new password is provided, hash the password
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10)
            res.body.password = await bcrypt.hash(res.body.password, salt)
        }

        // Update the student information by ID and send the updated result
        let result = await Student.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true })

        result.password = undefined;
        res.send(result)
    } catch (error) {
        // Handle errors and send a 500 status with the error details
        res.status(500).json(error);
    }
}

// Function to update or add exam results for a student
const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;

    try {
        // Find the student by ID
        const student = await Student.findById(req.params.id);

        if (!student) {
            // If the student is not found, send a message
            return res.send({ message: 'Student not found' });
        }

        // Check if the student already has a result for the given subject
        const existingResult = student.examResult.find(
            (result) => result.subName.toString() === subName
        );

        if (existingResult) {
            // If a result exists, update the marks obtained
            existingResult.marksObtained = marksObtained;
        } else {
            // If no result exists, add a new result
            student.examResult.push({ subName, marksObtained });
        }

        // Save the updated or new result and send the result
        const result = await student.save();
        return res.send(result);
    } catch (error) {
        // Handle errors and send a 500 status with the error details
        res.status(500).json(error);
    }
};

// Function to update or add attendance for a student
const studentAttendance = async (req, res) => {
    const { subName, status, date } = req.body;

    try {
        // Find the student by ID
        const student = await Student.findById(req.params.id);

        if (!student) {
            // If the student is not found, send a message
            return res.send({ message: 'Student not found' });
        }

        // Find the subject by ID
        const subject = await Subject.findById(subName);

        // Check if the student already has attendance for the given date and subject
        const existingAttendance = student.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString() &&
                a.subName.toString() === subName
        );

        if (existingAttendance) {
            // If attendance exists, update the status
            existingAttendance.status = status;
        } else {
            // If no attendance exists, check if the student has reached the maximum sessions
            const attendedSessions = student.attendance.filter(
                (a) => a.subName.toString() === subName
            ).length;

            if (attendedSessions >= subject.sessions) {
                // If the maximum sessions are reached, send a message
                return res.send({ message: 'Maximum attendance limit reached' });
            }

            // Add new attendance entry
            student.attendance.push({ date, status, subName });
        }

        // Save the updated or new attendance and send the result
        const result = await student.save();
        return res.send(result);
    } catch (error) {
        // Handle errors and send a 500 status with the error details
        res.status(500).json(error);
    }
};

// Function to clear all students' attendance for a specific subject
const clearAllStudentsAttendanceBySubject = async (req, res) => {
    const subName = req.params.id;

    try {
        // Update all students to remove attendance entries for the given subject
        const result = await Student.updateMany(
            { 'attendance.subName': subName },
            { $pull: { attendance: { subName } } }
        );
        return res.send(result);
    } catch (error) {
        // Handle errors and send a 500 status with the error details
        res.status(500).json(error);
    }
};

// Function to clear all students' attendance for all subjects
const clearAllStudentsAttendance = async (req, res) => {
    const schoolId = req.params.id;

    try {
        // Update all students in a school to remove all attendance entries
        const result = await Student.updateMany(
            { school: schoolId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        // Handle errors and send a 500 status with the error details
        res.status(500).json(error);
    }
};

// Function to remove attendance for a specific subject for a student
const removeStudentAttendanceBySubject = async (req, res) => {
    const studentId = req.params.id;
    const subName = req.body.subId;

    try {
        // Update a specific student to remove attendance entries for the given subject
        const result = await Student.updateOne(
            { _id: studentId },
            { $pull: { attendance: { subName: subName } } }
        );

        return res.send(result);
    } catch (error) {
        // Handle errors and send a 500 status with the error details
        res.status(500).json(error);
    }
};

// Function to remove all attendance entries for a specific student
const removeStudentAttendance = async (req, res) => {
    const studentId = req.params.id;

    try {
        // Update a specific student to remove all attendance entries
        const result = await Student.updateOne(
            { _id: studentId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        // Handle errors and send a 500 status with the error details
        res.status(500).json(error);
    }
};

// Export all functions as part of the module
module.exports = {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,

    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
};
