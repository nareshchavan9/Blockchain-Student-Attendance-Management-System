const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AttendanceManagement Contract", function () {
    let AttendanceManagement, attendanceManagement;
    let admin, teacher1, teacher2, student1, student2, student3, nonParticipant; // Declared here

    const FormStatus = { Open: 0, Closed: 1 };

    beforeEach(async function () {
        const signers = await ethers.getSigners();
        console.log("Available Signers Addresses:", signers.map(s => s.address));
        if (signers.length < 7) {
            console.error(`!!! Critical: Not enough signers. Expected at least 7, got ${signers.length} !!!`);
            // You might want to throw an error here if it's critical for all tests
            // throw new Error(`Expected at least 7 signers, got ${signers.length}`);
        }
        // Assign signers even if fewer than 7, tests might fail later if specific ones are undefined
        [admin, teacher1, teacher2, student1, student2, student3, nonParticipant] = signers;

        // Log specific signers to check if they are defined
        console.log("Top-level beforeEach - admin:", admin ? admin.address : "admin is UNDEFINED");
        console.log("Top-level beforeEach - teacher1:", teacher1 ? teacher1.address : "teacher1 is UNDEFINED");
        console.log("Top-level beforeEach - student1:", student1 ? student1.address : "student1 is UNDEFINED");
        console.log("Top-level beforeEach - student2:", student2 ? student2.address : "student2 is UNDEFINED");


        AttendanceManagement = await ethers.getContractFactory("AttendanceManagement");
        // Ensure admin is used for deployment if constructor sets admin = msg.sender
        if (!admin) throw new Error("Admin signer is undefined before deploying contract.");
        attendanceManagement = await AttendanceManagement.connect(admin).deploy();
        await attendanceManagement.waitForDeployment();
        console.log("Contract deployed by admin:", admin.address, "at:", await attendanceManagement.getAddress());


        // Admin registers teacher1
        if (admin && teacher1 && teacher1.address) {
            console.log("Registering teacher1:", teacher1.address);
            await attendanceManagement.connect(admin).registerTeacher(teacher1.address);
            console.log("teacher1 registration status:", await attendanceManagement.isTeacherRegistered(teacher1.address));
        } else {
            console.error("!!! Admin or teacher1 signer is undefined before registering teacher in top-level beforeEach !!!");
            if(!admin) console.error("Admin is undefined");
            if(!teacher1) console.error("teacher1 is undefined");
            else if(!teacher1.address) console.error("teacher1.address is undefined");
            // throw new Error("Admin or teacher1 signer is undefined before registering teacher in top-level beforeEach");
        }
    });

    describe("Deployment & Admin", function () {
        it("Should set the right admin", async function () {
            if (!admin) this.skip(); // Skip test if admin is not defined from beforeEach
            expect(await attendanceManagement.admin()).to.equal(admin.address);
        });

        it("Admin should be able to register a teacher", async function () {
            if (!admin || !teacher2) this.skip();
            await attendanceManagement.connect(admin).registerTeacher(teacher2.address);
            expect(await attendanceManagement.isTeacherRegistered(teacher2.address)).to.be.true;
        });

        it("Non-admin should not be able to register a teacher", async function () {
            if (!nonParticipant || !teacher2) this.skip();
            await expect(
                attendanceManagement.connect(nonParticipant).registerTeacher(teacher2.address)
            ).to.be.revertedWith("AM:OnlyAdmin");
        });
    });

    describe("Teacher - Course Management", function () {
        it("Registered teacher should be able to add a course", async function () {
            if (!teacher1) this.skip();
            await expect(attendanceManagement.connect(teacher1).addCourse("CS101"))
                .to.emit(attendanceManagement, "CourseAdded")
                .withArgs(1, "CS101", teacher1.address); // courseId will be 1 (assuming counter starts at 0 and increments before use)

            const course = await attendanceManagement.getCourse(1);
            expect(course.name).to.equal("CS101");
            expect(course.teacher).to.equal(teacher1.address);
        });

        it("Non-teacher should not be able to add a course", async function () {
            if (!nonParticipant) this.skip();
            await expect(
                attendanceManagement.connect(nonParticipant).addCourse("Unauthorized Course")
            ).to.be.revertedWith("AM:OnlyTeacher");
        });
    });

    describe("Teacher - Attendance Form Management", function () {
        let courseId;
        beforeEach(async function() {
            if (!teacher1) this.skip(); // Skip block if teacher1 is not defined
            const tx = await attendanceManagement.connect(teacher1).addCourse("Math202");
            const receipt = await tx.wait();

            const event = receipt.logs?.find(log => log.fragment?.name === "CourseAdded");
            if (!event || !event.args) {
                console.error("Full receipt logs for CourseAdded (Form Management):", receipt.logs);
                throw new Error("CourseAdded event not found or args undefined in form management beforeEach");
            }
            courseId = event.args.courseId;
        });

        it("Course teacher should be able to create an attendance form", async function () {
            if (!teacher1 || !student1 || !student2) this.skip();
            const studentAddresses = [student1.address, student2.address];
            await expect(
                attendanceManagement.connect(teacher1).createAttendanceForm(courseId, studentAddresses, "Lecture 1")
            ).to.emit(attendanceManagement, "AttendanceFormCreated")
              // Note: event args order is formId, courseId, teacher, studentCount, description
              .withArgs(1, courseId, teacher1.address, studentAddresses.length, "Lecture 1"); // formId will be 1

            const form = await attendanceManagement.getAttendanceForm(1);
            expect(form.courseId).to.equal(courseId);
            expect(form.status).to.equal(FormStatus.Open);
            expect(form.enrolledStudentCount).to.equal(2); // Check the count returned by getAttendanceForm
        });

        it("Course teacher should be able to close an open form", async function () {
            if (!teacher1 || !student1) this.skip();
            const studentAddresses = [student1.address];
            const createFormTx = await attendanceManagement.connect(teacher1).createAttendanceForm(courseId, studentAddresses, "Lecture 2");
            const createFormReceipt = await createFormTx.wait();
            const createFormEvent = createFormReceipt.logs?.find(log => log.fragment?.name === "AttendanceFormCreated");
            if (!createFormEvent || !createFormEvent.args) throw new Error("AttendanceFormCreated event not found for closing test");
            const formIdToClose = createFormEvent.args.formId;


            // Student submits attendance
            await attendanceManagement.connect(student1).submitAttendance(formIdToClose, true);

            await expect(attendanceManagement.connect(teacher1).closeAttendanceForm(formIdToClose))
                .to.emit(attendanceManagement, "AttendanceFormClosed")
                .withArgs(formIdToClose, 1, 1); // formId, presentCount, totalEnrolled

            const form = await attendanceManagement.getAttendanceForm(formIdToClose);
            expect(form.status).to.equal(FormStatus.Closed);
        });

        it("Should not allow closing an already closed form", async function () {
            if (!teacher1 || !student1) this.skip();
            const studentAddresses = [student1.address];
            const createFormTx = await attendanceManagement.connect(teacher1).createAttendanceForm(courseId, studentAddresses, "Lecture 2");
            const createFormReceipt = await createFormTx.wait();
            const createFormEvent = createFormReceipt.logs?.find(log => log.fragment?.name === "AttendanceFormCreated");
            if (!createFormEvent || !createFormEvent.args) throw new Error("AttendanceFormCreated event not found for already closed test");
            const formIdToTest = createFormEvent.args.formId;

            await attendanceManagement.connect(teacher1).closeAttendanceForm(formIdToTest);
            await expect(
                attendanceManagement.connect(teacher1).closeAttendanceForm(formIdToTest)
            ).to.be.revertedWith("AM:FormNotOpen"); // Changed to match contract
        });
    });

    describe("Student - Attendance Submission", function () {
        let courseId_s, formId_s;

        beforeEach(async function() {
            console.log("Inside Student Submission beforeEach - teacher1:", teacher1 ? teacher1.address : "teacher1 is UNDEFINED");
            console.log("Inside Student Submission beforeEach - student1:", student1 ? student1.address : "student1 is UNDEFINED");
            console.log("Inside Student Submission beforeEach - student2:", student2 ? student2.address : "student2 is UNDEFINED");

            if (!teacher1 || !teacher1.address || !student1 || !student1.address || !student2 || !student2.address) {
                console.error("!!! A required signer (teacher1, student1, or student2) is undefined at the start of Student Submission beforeEach !!!");
                this.skip(); // Skip this block if prerequisites are not met
            }
            const studentAddresses_s = [student1.address, student2.address];

            // Teacher1 adds a course
            let tx = await attendanceManagement.connect(teacher1).addCourse("Science101");
            let receipt = await tx.wait();
            let event = receipt.logs?.find(log => log.fragment?.name === "CourseAdded");
            if (!event || !event.args) {
                console.error("Full receipt logs for CourseAdded (Student Submission):", receipt.logs);
                throw new Error("CourseAdded event not found or args undefined in student submission beforeEach");
            }
            courseId_s = event.args.courseId;

            // Teacher1 creates a form for that course
            tx = await attendanceManagement.connect(teacher1).createAttendanceForm(courseId_s, studentAddresses_s, "Lab Session 1");
            receipt = await tx.wait();
            event = receipt.logs?.find(log => log.fragment?.name === "AttendanceFormCreated");
            if (!event || !event.args) {
                console.error("Full receipt logs for AttendanceFormCreated (Student Submission):", receipt.logs);
                throw new Error("AttendanceFormCreated event not found or args undefined in student submission beforeEach");
            }
            formId_s = event.args.formId;
        });

        it("Enrolled student should be able to submit attendance (present)", async function () {
            if (!student1) this.skip();
            await expect(attendanceManagement.connect(student1).submitAttendance(formId_s, true))
                .to.emit(attendanceManagement, "AttendanceSubmitted")
                .withArgs(formId_s, student1.address, true);

            const formDetails = await attendanceManagement.getAttendanceForm(formId_s);
            expect(formDetails.presentCount).to.equal(1);
            const [hasResponded, isPresent] = await attendanceManagement.getStudentAttendanceStatusForForm(formId_s, student1.address);
            expect(hasResponded).to.be.true;
            expect(isPresent).to.be.true;
        });

        it("Enrolled student should be able to submit attendance (absent)", async function () {
            if (!student2) this.skip();
            await attendanceManagement.connect(student2).submitAttendance(formId_s, false);
            const formDetails = await attendanceManagement.getAttendanceForm(formId_s);
            expect(formDetails.presentCount).to.equal(0); // Present count should not increase
            const [hasResponded, isPresent] = await attendanceManagement.getStudentAttendanceStatusForForm(formId_s, student2.address);
            expect(hasResponded).to.be.true;
            expect(isPresent).to.be.false;
        });

        it("Student should not be able to submit attendance twice for the same form", async function () {
            if (!student1) this.skip();
            await attendanceManagement.connect(student1).submitAttendance(formId_s, true);
            await expect(
                attendanceManagement.connect(student1).submitAttendance(formId_s, true)
            ).to.be.revertedWith("AM:AlreadyResponded");
        });

        it("Non-enrolled student should not be able to submit attendance", async function () {
            if (!student3) this.skip(); // student3 not in studentAddresses_s
            await expect(
                attendanceManagement.connect(student3).submitAttendance(formId_s, true)
            ).to.be.revertedWith("AM:NotEnrolledInForm");
        });

        it("Should not allow submitting to a closed form", async function () {
            if (!teacher1 || !student1) this.skip();
            await attendanceManagement.connect(teacher1).closeAttendanceForm(formId_s);
            await expect(
                attendanceManagement.connect(student1).submitAttendance(formId_s, true)
            ).to.be.revertedWith("AM:FormNotOpen");
        });
    });

    describe("View Functions", function() {
        it("Should return correct forms for a course", async function() {
            if (!teacher1 || !student1) this.skip();

            const txCourse = await attendanceManagement.connect(teacher1).addCourse("History 101");
            const receiptCourse = await txCourse.wait();
            const eventCourse = receiptCourse.logs?.find(log => log.fragment?.name === "CourseAdded");
            if (!eventCourse || !eventCourse.args) throw new Error("CourseAdded event not found for view function test");
            const cId = eventCourse.args.courseId;

            const students = [student1.address];
            const txForm1 = await attendanceManagement.connect(teacher1).createAttendanceForm(cId, students, "Form A");
            const receiptForm1 = await txForm1.wait();
            const eventForm1 = receiptForm1.logs?.find(log => log.fragment?.name === "AttendanceFormCreated");
            if (!eventForm1 || !eventForm1.args) throw new Error("AttendanceFormCreated (Form A) event not found");
            const formId1 = eventForm1.args.formId;

            const txForm2 = await attendanceManagement.connect(teacher1).createAttendanceForm(cId, students, "Form B");
            const receiptForm2 = await txForm2.wait();
            const eventForm2 = receiptForm2.logs?.find(log => log.fragment?.name === "AttendanceFormCreated");
            if (!eventForm2 || !eventForm2.args) throw new Error("AttendanceFormCreated (Form B) event not found");
            const formId2 = eventForm2.args.formId;

            const formIdsForCourse = await attendanceManagement.getFormIdsForCourse(cId);
            expect(formIdsForCourse.length).to.equal(2);
            expect(formIdsForCourse.map(id => id.toString())).to.include.members([formId1.toString(), formId2.toString()]);
        });

        // Add more tests for:
        // - getActiveTeacherCourseIds
        // - getAttendanceForm (and verify all returned fields)
        // - getEnrolledStudentsForForm
        // - getFormsStudentIsEnrolledIn
        // - getOpenFormsForStudentInCourse
    });
});