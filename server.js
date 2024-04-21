'This is the server.js file that will create a web server and listen for requests from the client. It will also handle the requests and send back the appropriate response.'

var HTTP_PORT = process.env.PORT || 8080; //http://localhost:8080/
const express = require("express");
const exphbs = require('express-handlebars');
const app = express();
const collegeData = require('./modules/collegeData');

//Set up the server to use the "public" and "views" directory to serve static files:
app.use(express.static('public'));
app.use(express.static('views'));

//Add body parser to the server:
app.use(express.urlencoded({ extended: true }));

//Set up the server to use handlebars:
app.engine(".hbs", exphbs.engine({ 
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options){
            return '<li' +((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +'><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine', '.hbs');

//Add the property "activeRoute" to "app.locals" whenever the route changes, ie: if our route is "/students/add", the app.locals.activeRoute value will be "/students/add".
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});


//Initialize the data:
collegeData.initialize()
    .then(function(dataCollection) {
        //http://localhost:8080/students will return all students
        //http://localhost:8080/students?course=2 will return students by course:
        app.get('/students', (req, res) => {
            const course = req.query.course;
            if(course){
                collegeData.getStudentsByCourse(dataCollection, course)
                .then((students) => {
                    // res.json(students);
                    res.render('students',{students: students});
                })
                .catch(() => {
                    res.render('students', {message: "No results"})
                });
            } else {
                collegeData.getAllStudents(dataCollection)
                .then((students) => {
                    // res.json(students);
                    res.render('students',{students: students});
                })
                .catch(() => {
                    res.render('students', {message: "No results"})
                });
            }
        });

        //http://localhost:8080/tas will return all students is also TA:
        // app.get('/tas', (req, res) => {
        //     collegeData.getTAs(dataCollection)
        //     .then((tas) => {
        //         res.json(tas);
        //     })
        //     .catch((err) => {
        //         res.send(err);
        //     });
        // });

        //http://localhost:8080/courses will return all courses:
        app.get('/courses', (req, res) => {
            collegeData.getCourses(dataCollection)
            .then((courses) => {
                // res.json(courses);
                res.render("courses", {courses: courses});
            })
            .catch(() => {
                res.render("courses", {message: "no results"});
            });
        });

        //http://localhost:8080/student/1 will return student with id 1:
        app.get('/student/:num', (req, res) => {
            const num = req.params.num;
            collegeData.getStudentByNum(dataCollection, num)
            .then((student) => {
                res.render("student", { student: student });
            })
            .catch((err) => {
                res.send(err);
            });
        });

        // http://localhost:8080/course/1 will return course with id 1:
        app.get('/course/:id', (req, res) => {
            const id = req.params.id;
            collegeData.getCourseById(dataCollection, id)
            .then((course) => {
                res.render("course", { course: course });
            })
            .catch((err) => {
                res.send(err);
            });
        });

        //http://localhost:8080/
        app.get('/', (req, res) => {
            res.render('home');
        });

        //http://localhost:8080/about
        app.get('/about', (req, res) => {
            res.render('about');
        });

        //http://localhost:8080/htmlDemo
        app.get('/htmlDemo', (req, res) => {
            res.render('htmlDemo');
        });

        //http://localhost:8080/students/add
        app.get('/students/add', (req, res) => {
            // res.sendFile(__dirname + '/views/addStudent.html');
            res.render('addStudent');
        });
        
        // POST route to handle adding a new student
        app.post('/students/add', (req, res) => {
            const newStudentData = req.body;
            collegeData.addStudent(newStudentData, dataCollection)
                .then(() => {
                    res.redirect('/students'); // Redirect to the students route after successfully adding the student
                })
                .catch((err) => {
                    res.status(500).send(err); // Handle errors if adding the student fails
                });
        });

        //http://localhost:8080/student/update
        app.post('/student/update', (req, res) => {
            collegeData.updateStudent(req.body, dataCollection)
                .then(() => {
                    res.redirect('/students');
                })
                .catch((err) => {
                    res.status(500).send(err);
                });
        });


        //If the user enters a route that is not matched with anything, return the custom message "Page Not Found":
        app.use((req, res) => {
            res.status(404).send('Page Not Found');
        });

        //Start the server:
        app.listen(HTTP_PORT, () => {
            console.log(`Listening on port ${HTTP_PORT}`);
        });
    })
    

    
    //If the data cannot be initialized, log the error:
    .catch(function(error) {
        console.error(`Failed to initialize data ${error}`);
    });
