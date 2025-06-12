// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "hardhat/console.sol"; // For debugging during development

contract AttendanceManagement {
    address public admin; // Contract deployer is the admin

    enum FormStatus { Open, Closed }


    struct Course {
        uint courseId;
        string name;
        address teacher;     // Teacher who created the course
        uint[] formIds;      // IDs of attendance forms for this course
        bool isActive;       // To allow deactivation of courses
    }

    struct AttendanceForm {
        uint formId;
        uint courseId;
        address teacher;            // Teacher who created the form
        address[] enrolledStudents; // Students expected for this session/form
        mapping(address => bool) hasResponded; // Student address => true if responded
        mapping(address => bool) isPresent;    // Student address => true if marked present
        uint presentCount;
        uint64 openTimestamp;
        uint64 closeTimestamp;      // 0 if still open
        FormStatus status;
        string description;         // e.g., "Lecture 1 - Introduction"
    }

    // --- State Variables ---
    mapping(address => bool) public isTeacherRegistered; // To check if an address is a registered teacher

    mapping(uint => Course) public courses;
    uint public courseCounter; // To generate unique course IDs (starts at 1)

    mapping(uint => AttendanceForm) public attendanceForms;
    uint public formCounter; // To generate unique form IDs (starts at 1)

    // --- Events ---
    event AdminAction(string action, address indexed account);
    event TeacherRegistered(address indexed teacherAddress, bool isRegistered);
    event CourseAdded(uint indexed courseId, string name, address indexed teacher);
    event CourseStatusUpdated(uint indexed courseId, bool isActive);
    event AttendanceFormCreated(uint indexed formId, uint indexed courseId, address indexed teacher, uint studentCount, string description);
    event AttendanceSubmitted(uint indexed formId, address indexed studentAddress, bool attended);
    event AttendanceFormClosed(uint indexed formId, uint presentCount, uint totalEnrolled);

    // --- Modifiers ---
    modifier onlyAdmin() {
        require(msg.sender == admin, "AM:OnlyAdmin"); // AM: Attendance Management prefix for errors
        _;
    }

    modifier onlyRegisteredTeacher() {
        require(isTeacherRegistered[msg.sender], "AM:OnlyTeacher");
        _;
    }

    modifier onlyCourseTeacher(uint _courseId) {
        require(courses[_courseId].courseId != 0, "AM:CourseNotFound");
        require(courses[_courseId].teacher == msg.sender, "AM:NotCourseTeacher");
        _;
    }
    
    modifier onlyFormTeacher(uint _formId) {
        require(attendanceForms[_formId].formId != 0, "AM:FormNotFound");
        require(attendanceForms[_formId].teacher == msg.sender, "AM:NotFormTeacher");
        _;
    }

    modifier onlyEnrolledStudentInForm(uint _formId) {
        bool found = false;
        // Check if student is in the enrolledStudents list for this specific form
        address[] storage studentsInForm = attendanceForms[_formId].enrolledStudents;
        for (uint i = 0; i < studentsInForm.length; i++) {
            if (studentsInForm[i] == msg.sender) {
                found = true;
                break;
            }
        }
        require(found, "AM:NotEnrolledInForm");
        _;
    }

    modifier formIsOpen(uint _formId) {
        require(attendanceForms[_formId].status == FormStatus.Open, "AM:FormNotOpen");
        _;
    }

    // --- Constructor ---
    constructor() {
        admin = msg.sender;
        courseCounter = 0; // Initialize counters
        formCounter = 0;
        emit AdminAction("ContractDeployed", msg.sender);
    }

    // --- Admin Functions ---
    function registerTeacher(address _teacherAddress) external onlyAdmin {
        require(_teacherAddress != address(0), "AM:InvalidTeacherAddress");
        isTeacherRegistered[_teacherAddress] = true;
        emit TeacherRegistered(_teacherAddress, true);
    }

    function unregisterTeacher(address _teacherAddress) external onlyAdmin { // Optional
        require(_teacherAddress != address(0), "AM:InvalidTeacherAddress");
        isTeacherRegistered[_teacherAddress] = false;
        emit TeacherRegistered(_teacherAddress, false);
        // Consider implications: What happens to courses/forms created by this teacher?
        // They would still exist but the teacher might lose privileges to manage them
        // if onlyRegisteredTeacher checks are strictly enforced on all teacher actions.
    }

    // --- Teacher Functions ---
    function addCourse(string memory _courseName) external onlyRegisteredTeacher {
        require(bytes(_courseName).length > 0, "AM:CourseNameEmpty");
        courseCounter++;
        courses[courseCounter] = Course({
            courseId: courseCounter,
            name: _courseName,
            teacher: msg.sender,
            formIds: new uint[](0), // Initialize empty array for form IDs
            isActive: true
        });
        emit CourseAdded(courseCounter, _courseName, msg.sender);
    }

    function updateCourseStatus(uint _courseId, bool _isActive) external onlyCourseTeacher(_courseId) {
        courses[_courseId].isActive = _isActive;
        emit CourseStatusUpdated(_courseId, _isActive);
    }

    function createAttendanceForm(
        uint _courseId,
        address[] memory _studentAddresses,
        string memory _description
    ) external onlyCourseTeacher(_courseId) {
        require(courses[_courseId].isActive, "AM:CourseNotActive");
        require(_studentAddresses.length > 0, "AM:StudentListEmpty");

        formCounter++;
        AttendanceForm storage newForm = attendanceForms[formCounter];
        newForm.formId = formCounter;
        newForm.courseId = _courseId;
        newForm.teacher = msg.sender;
        
        // Copy student addresses
        for(uint i = 0; i < _studentAddresses.length; i++){
            require(_studentAddresses[i] != address(0), "AM:InvalidStudentAddrInList");
            newForm.enrolledStudents.push(_studentAddresses[i]);
        }
        
        newForm.status = FormStatus.Open;
        newForm.openTimestamp = uint64(block.timestamp);
        newForm.description = _description;
        // presentCount is initialized to 0 by default

        courses[_courseId].formIds.push(formCounter);

        emit AttendanceFormCreated(formCounter, _courseId, msg.sender, _studentAddresses.length, _description);
    }

    function closeAttendanceForm(uint _formId) external onlyFormTeacher(_formId) formIsOpen(_formId) {
        // Form existence and teacher ownership are checked by modifiers
        AttendanceForm storage form = attendanceForms[_formId];
        form.status = FormStatus.Closed;
        form.closeTimestamp = uint64(block.timestamp);
        // presentCount is already tallied during submissions.
        emit AttendanceFormClosed(_formId, form.presentCount, form.enrolledStudents.length);
    }

    // --- Student Functions ---
    function submitAttendance(uint _formId, bool _attended) 
        external 
        onlyEnrolledStudentInForm(_formId) 
        formIsOpen(_formId) 
    {
        AttendanceForm storage form = attendanceForms[_formId]; // Existence & open status checked by modifiers
        require(!form.hasResponded[msg.sender], "AM:AlreadyResponded");

        form.hasResponded[msg.sender] = true;
        if (_attended) {
            form.isPresent[msg.sender] = true;
            form.presentCount++;
        } else {
            form.isPresent[msg.sender] = false; // Explicitly false, though default is false
        }
        emit AttendanceSubmitted(_formId, msg.sender, _attended);
    }

    // --- View Functions (Getters) ---
    function getCourse(uint _courseId) external view returns (Course memory) {
        require(courses[_courseId].courseId != 0, "AM:CourseNotFound");
        return courses[_courseId];
    }

    function getActiveTeacherCourseIds(address _teacher) external view returns (uint[] memory) {
        uint count = 0;
        for (uint i = 1; i <= courseCounter; i++) {
            if (courses[i].teacher == _teacher && courses[i].isActive) {
                count++;
            }
        }
        uint[] memory ids = new uint[](count);
        uint index = 0;
        for (uint i = 1; i <= courseCounter; i++) {
            if (courses[i].teacher == _teacher && courses[i].isActive) {
                ids[index] = i;
                index++;
            }
        }
        return ids;
    }

    function getAttendanceForm(uint _formId) 
        external 
        view 
        returns (
            uint formId,
            uint courseId,
            address teacher,
            uint enrolledStudentCount, // Instead of returning the whole array to save gas
            uint presentCount,
            uint64 openTimestamp,
            uint64 closeTimestamp,
            FormStatus status,
            string memory description
        )
    {
        require(attendanceForms[_formId].formId != 0, "AM:FormNotFound");
        AttendanceForm storage form = attendanceForms[_formId];
        return (
            form.formId,
            form.courseId,
            form.teacher,
            form.enrolledStudents.length,
            form.presentCount,
            form.openTimestamp,
            form.closeTimestamp,
            form.status,
            form.description
        );
    }
    
    // Get a list of student addresses for a specific form - can be gas intensive for large lists
    function getEnrolledStudentsForForm(uint _formId) external view returns (address[] memory) {
        require(attendanceForms[_formId].formId != 0, "AM:FormNotFound");
        return attendanceForms[_formId].enrolledStudents;
    }


    function getStudentAttendanceStatusForForm(uint _formId, address _student) 
        external 
        view 
        returns (bool hasResponded, bool isPresent) 
    {
        require(attendanceForms[_formId].formId != 0, "AM:FormNotFound");
        // Consider adding a check if _student is in enrolledStudents for this form for privacy
        return (
            attendanceForms[_formId].hasResponded[_student], 
            attendanceForms[_formId].isPresent[_student]
        );
    }

    function getFormIdsForCourse(uint _courseId) external view returns (uint[] memory) {
        require(courses[_courseId].courseId != 0, "AM:CourseNotFound");
        return courses[_courseId].formIds;
    }

    // This function iterates through all forms to find which ones a student is enrolled in.
    // For a large number of forms, this can be very gas-inefficient if called on-chain.
    // For UI, it's better to filter forms based on events or an off-chain database.
    // If on-chain access is strictly needed, consider a dedicated mapping:
    // mapping(address => mapping(uint => bool)) studentIsEnrolledInCourse;
    // mapping(address => uint[]) public studentFormEnrollments; // (student => formId[])
    function getFormsStudentIsEnrolledIn(address _student) external view returns (uint[] memory) {
        uint count = 0;
        for (uint i = 1; i <= formCounter; i++) {
            address[] storage studentsInForm = attendanceForms[i].enrolledStudents;
            for (uint j = 0; j < studentsInForm.length; j++) {
                if (studentsInForm[j] == _student) {
                    count++;
                    break; 
                }
            }
        }

        uint[] memory formIds = new uint[](count);
        uint index = 0;
        for (uint i = 1; i <= formCounter; i++) {
             address[] storage studentsInForm = attendanceForms[i].enrolledStudents;
            for (uint j = 0; j < studentsInForm.length; j++) {
                if (studentsInForm[j] == _student) {
                    formIds[index++] = i;
                    break;
                }
            }
        }
        return formIds;
    }

    // Helper to get open forms for a student for a specific course
    function getOpenFormsForStudentInCourse(address _student, uint _courseId) external view returns (uint[] memory) {
        require(courses[_courseId].courseId != 0, "AM:CourseNotFound");
        
        uint[] storage courseFormIds = courses[_courseId].formIds;
        uint count = 0;

        for (uint i = 0; i < courseFormIds.length; i++) {
            uint formId = courseFormIds[i];
            AttendanceForm storage form = attendanceForms[formId];
            if (form.status == FormStatus.Open) {
                for (uint j = 0; j < form.enrolledStudents.length; j++) {
                    if (form.enrolledStudents[j] == _student && !form.hasResponded[_student]) {
                        count++;
                        break;
                    }
                }
            }
        }

        uint[] memory openFormIds = new uint[](count);
        uint index = 0;
        for (uint i = 0; i < courseFormIds.length; i++) {
            uint formId = courseFormIds[i];
            AttendanceForm storage form = attendanceForms[formId];
             if (form.status == FormStatus.Open) {
                for (uint j = 0; j < form.enrolledStudents.length; j++) {
                    if (form.enrolledStudents[j] == _student && !form.hasResponded[_student]) {
                        openFormIds[index++] = formId;
                        break;
                    }
                }
            }
        }
        return openFormIds;
    }
}