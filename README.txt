URL to application:
http://127.0.0.1:8080/TaskList/
Observe that currently there is no content in the component. You must
create the code of the component.

URL to demo:
http://127.0.0.1:8080/TaskList/demo/index.html

URL to the in-memory database of the application:
http://localhost:8080/TaskList/h2-console



 ####################

Checklist:

The solution must work according to the requirements.
For attachShadow use mode closed.
You must solve all synchronization problems.
Use of setTimeout or setInterval to solve synchronization problems will not be approved.
The index file should only include a single script tag, loading taskview.js.
The modules should manage their own dependencies.
The application must not depend on a reload of the page see the modifications of the task list.
The only functionality of addChangestatusCallback, addDeletetaskCallback and addNewtaskCallback is to register a callback method, and nothing more.
If no connection with the database, the button "New task" should remain disabled.
A new added task must be shown at the top of the list.
A task without a title or status must not be added to the database, nor shown in the list.
The counter for number of tasks must show the correct number of tasks in the list.
Setting the task status in the SELECT element to <Modify> should not trigger a status change. Status <Modify> should mean that no status is selected by the user.
The status shown on the SELECT must be <Modify>, and should be reset to <Modify> after the user has updated the state.
