# 01 Index page

## User story
As a member of the school community (staff or a family), I want to see an
overview of the school route system and the phases it will be delivered in,
so that I know what the system will let me do and what is available today.

## Business rules
- The index is public: anyone can open it without logging in.
- It is the page shown at the root of the app.
- All visible text on the page is in Spanish. The product name
  "School Route System" stays as it is.
- It introduces the system with the name "School Route System" and a short
  description.
- It lists the four phases in order, each with its number, title, a short
  description of what it lets people do, and its status:
  1. Route admins: the people who will manage the routes can be registered.
  2. Students: students can be registered.
  3. Parents and guardians: each student's parents and guardians can be
     registered. On the page, guardians are called "acudientes o tutores".
  4. Route execution: the routes run with the registered admins, students,
     and parents and guardians.
- A phase's status is one of: Planificada, En progreso, Disponible.
- Today all four phases are Planificada.
- The page no longer shows the API and database status message. The backend
  /health endpoint stays for developers and Docker.

## Out of scope
- Login or any user account.
- Links from a phase to its feature, since none exist yet.
- Editing the phase statuses from the UI. They change in the code when a
  phase ships.
- Showing live data (counts of routes, students, etc.).
- Other languages than Spanish.
- How many parents or guardians a student can have (decided in Phase 3).

## Open questions
- None
