# SUN Lab Access System

This project is a web-based application for managing access to the SUN Lab. The system logs access records, allows administrators to manage user statuses, and provides a GUI for authorized personnel to view the access history.

## To run app as an admin

-you must enter password 12134 to fetch data as an Admin


## Project Requirements

### Technologies Used

- **Firebase**: Firestore is used as the database for storing access records.
- **Frontend**: HTML, CSS, and vanilla JavaScript.
- **Backend**: Firebase functions as the backend with the Firestore database.
- **Node.js**: Used for backend API handling.
- **WebStorm IDE**: Development environment.
  
### Functional Requirements

1. **Record Access**
   - Students swipe their ID card at the door.
   - The system saves their student ID and a timestamp in the database.
   - The student ID must be exactly 9 digits and start with the number 9.

2. **View Access History**
   - Admins can view access records filtered by student ID, date, and time range.
   - Admins can view specific student access history based on search criteria.

3. **User Status Management**
   - Admins can activate, suspend, or reactivate student accounts.

4. **Roles Supported**
   - Multiple roles including students, faculty, staff, and janitors.
   - Admin users have elevated privileges for viewing records and managing user statuses.

### Project File Structure

- `index.html`: Main frontend file.
- `style.css`: Stylesheet for frontend design.
- `index.js`: Backend logic (Node.js).
- `firebaseConfig.js`: Firebase configuration for database and services.
  
## Database Requirements

### Firebase Setup

- **Firestore Database**: Used to store access logs and user information.
  
#### Required Collections:

1. **`accessRecords`**
   - Stores each lab access entry with the following fields:
     - `studentId`: The ID of the student accessing the lab.
     - `role`: Role of the user (student, faculty, staff, other).
     - `timestamp`: The time of the access (Firestore `Timestamp`).



