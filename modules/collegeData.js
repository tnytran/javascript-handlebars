const { Sign } = require('node:crypto');
const fs = require('node:fs');


//Create a constructor class:
class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}


function initialize() {
    'This function will read the contents of the json files and assign them to the variable dataCollection.'

    return new Promise(
        function(resolve, reject){

            //Read the contents of the "./data/students.json" file:
            // fs.readFile('./data/students.json', 'utf8', (err1, data1) => {
            fs.readFile('./data/students.json', 'utf8', (err1, data1) => {
                if (err1) {
                    reject(`Error: ${err1}`);
                    return;
                }

                // Convert the JSON from the file into an array of objects:
                let studentDataFromFile = JSON.parse(data1); 

                //Continue to read the contents of the "./data/courses.json" file:
                fs.readFile('./data/courses.json', 'utf8', (err2, data2) => {
                    if (err2) {
                        reject(`Error: ${err2}`);
                        return;
                    }

                    // Convert the JSON from the file into an array of objects:
                    let courseDataFromFile = JSON.parse(data2); 

                    //Declare a variable that holds an instance of the "Data" class once its created:
                    var dataCollection = new Data(studentDataFromFile, courseDataFromFile);

                    //Invoke the resolve method for the promise to communicate back to a2.js that the operation was a success:
                    resolve(dataCollection);
                });
            });
        }
    )
}


function getAllStudents(dataCollection){
    'This function will provide the full array of "student" objects using the resolve method of the returned promise.'

    return new Promise(
        function(resolve, reject){
            //If the array of students is 0, display error message. Else return the full array of students:
            if(dataCollection.students.length == 0){
                reject("Error: No results returned");
            } else {
                resolve(dataCollection.students)
            }
        }
    )
}


// function getTAs(dataCollection){
//    'This function will provide an array of "student" objects whose TA property is true using the resolve method of the returned promise.'

//     return new Promise(
//         function(resolve, reject){
//             const needTA = [];

//             //Add any student with TA property is true to the needTA list above:
//             for (const student of dataCollection.students) {
//                 if(student.TA == true){
//                     needTA.push(student);
//                 }
//             }
            
//             //If there is no student needed TA:
//             if(needTA.length == 0){
//                 reject("No results returned");
//             } else {
//                 resolve(needTA);
//             }
//         }
//     )
// }


function getCourses(dataCollection){
    'This function will provide the full array of "course" objects using the resolve method of the returned promise.'

    return new Promise(
        function(resolve, reject){
            //If the array of courses is 0, display error message. Else return the full array of courses:
            if(dataCollection.courses.length == 0){
                reject("Error: No results returned");
            } else {
                resolve(dataCollection.courses)
            }
        }
    )
}


function getStudentsByCourse(dataCollection,course){
    'This function will provide an array of "student" objects whose course property matches the input using the resolve method of the returned promise. If the course does not exist, display error message.'

    return new Promise(
        function(resolve, reject){

            //Check if the course exists in the dataCollection. This is to cover for the case where the course does not exist:
            let foundCourse = false;
            for (const singleCourse of dataCollection.courses) {
                if(singleCourse.courseId == course){
                    foundCourse = true;
                    break;
                }
            }

            //If the course exists, find the students who are taking the course:
            if (foundCourse){
                matchedCourses = [];
                for (const student of dataCollection.students) {
                    if(student.course == course){
                        matchedCourses.push(student);
                    }
                };

                //If the array of students is 0, display error message. Else return the matched array of students:
                if(matchedCourses.length == 0){
                    reject("Error: No student studied this course.");
                } else {
                    resolve(matchedCourses)
                }
            } 

            //If the course does not exist, display error message:
            else {
                reject("Error: No results returned.");
            }
        }
    )
};


function getStudentByNum(dataCollection,num){
    'This function will provide the "student" object whose student number matches the input using the resolve method of the returned promise. If the student number does not exist, display error message.'

    return new Promise(
        function(resolve, reject){
            //Find the student with the student number matching the input:
            for (const singleStudent of dataCollection.students) {
                if(singleStudent.studentNum == num){
                    resolve(singleStudent);
                }
            }
            reject("Error: No results returned");
        }
    )
};


function addStudent(studentData, dataCollection){
    'This function will add a new student to the dataCollection and write the updated data to the students.json file. The function will return a promise that resolves to the updated dataCollection.'

    return new Promise (
        function(resolve, reject){
            if(studentData.TA == undefined){
                studentData.TA = false;
            } else {
                studentData.TA = true;
            }

            //Read the contents of the "./data/students.json" file to get the current student number:
            fs.readFile('./data/students.json', 'utf8', (err1, data1) => {
                if (err1) {
                    reject(`Error: ${err1}`);
                    return;
                }

                // Convert the JSON from the file into an array of objects:
                let studentDataFromStudentsFile = JSON.parse(data1);
               
                // Assign the new student number:
                studentData.studentNum = studentDataFromStudentsFile.length + 1;

                dataCollection.students.push(studentData);

                fs.writeFile('./data/students.json', JSON.stringify(dataCollection.students), (err) => {
                    if (err) {
                        reject(`Error: ${err}`);
                        return;
                    }
                    resolve(dataCollection);
                });
            });
        }
    )
};


function getCourseById(dataCollection, id){
    'This function will provide the "course" object whose course id matches the input using the resolve method of the returned promise. If the course id does not exist, display error message.'

    return new Promise(
        function(resolve, reject){
            // Find the course with the course id matching the input:
            for (const singleCourse of dataCollection.courses) {
                if(singleCourse.courseId == id){
                    resolve(singleCourse);
                }
            }
            reject("Error: No results returned");
        }
    )
};


function updateStudent(studentData, dataCollection){
    'This function will update the student with the student number matching the input and write the updated data to the students.json file. The function will return a promise that resolves to the updated dataCollection.'
    
    return new Promise (
        function(resolve, reject){
            if(studentData.TA == undefined){
                studentData.TA = false;
            } else {
                studentData.TA = true;
            }

            for (const singleStudent of dataCollection.students) {
                if(singleStudent.studentNum == studentData.studentNum){
                    singleStudent.studentNum = studentData.studentNum;
                    singleStudent.firstName = studentData.firstName;
                    singleStudent.lastName = studentData.lastName;
                    singleStudent.email = studentData.email;
                    singleStudent.addressStreet = studentData.addressStreet;
                    singleStudent.addressCity = studentData.addressCity;
                    singleStudent.addressProvince = studentData.addressProvince;
                    singleStudent.TA = studentData.TA;
                    singleStudent.course = studentData.course;
                    singleStudent.status = studentData.status;
                    break;
                }
            }

            fs.writeFile('./data/students.json', JSON.stringify(dataCollection.students), (err) => {
                if (err) {
                    reject(`Error: ${err}`);
                    return;
                }
                resolve();
            });
        }
    )
};

//Export the following functions so that they can be called in a2.js:
module.exports = { initialize, getAllStudents, getCourses, getStudentsByCourse, getStudentByNum, addStudent, getCourseById, updateStudent };