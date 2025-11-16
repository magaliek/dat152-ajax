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
attempt 1:

No need to use defer with script tag if type="module".

Use mode "closed" with attachShadow. If open, the inside of the component is accessible from other components through the shadowRoot property.

Be careful with innerHTML and insertAdjacentHTML. You are using innerHTML or insertAdjacentHTML on data the originates elsewhere. Only use innerHTML on data that you control yourself, or the application becomes vulnerable to XSS attacs.

The HTML Living standard recommends that the constructor should be used to set up the
initial state and default values, and to set up event listeners and possibly a shadow root.

For everything else, use the "connectedCallback".

Properties like table.tBodies[0].rows are faster than using querySelector/querySelectorAll.

There is no need to act on a key click on Escape, as this managed internally by the HTML DIALOG element.

You are using public fields and methods that should have been private.
There should be no public fields in any of the component classes.
The only public methods of TaskList should be showTask, updateTask, removeTask, setStatuseslist, addChangestatusCallback, addDeletetaskCallback and getNumtasks.
All methods of TaskView should be private.
The only public methods of TaskBox should be show, setStatuseslist, addNewtaskCallback and close.

Use operators in a boolean context to avoid problems.
Example on what to avoid:
    if (this.querySelector("table")) { ... }
Rather, use:
    if (this.querySelector("table") !== null) { ... }

In a boolean context, undefined, 0, Null, an empty text will all
evaluate to false. Without an operator, a misprint in the expression
can therefore be difficult to find, and can give unexpected results.

Use "===" and "!==", not "==" and "!=". These operators will check both value and type.

Setting the task status to the status that the element already has should be ignored by the client.

You have problems with synchronization in your solution.
The list of initial tasks can be added to the View before the list of all
possible statuses have been received from the server. As a consequence,
the list of statuses for the SELECT elements can be empty in TaskList.


attempt 2:

ou were supposed to deliver in groups of three to five.

There should be only a single script tag in the file index.html The modules should manage the dependecies themselves using import. That is, only taskview.js should be loaded by index.html.

No need to use defer with script tag if type="module".

Why do you load the JavaScript file "taskbox.js" from the index file? The only JavaScript file to load should be the module for TaskView.

Why do you load the JavaScript file "tasklist.js" from the index file? The only JavaScript file to load should be the module for TaskView.

The "dataset" property can be an easier to use alternative to the "getAttribute"
method for accessing the "data-" attributes.

You are using innerHTML to insert pure text. Use e.g. innerText to insert pure text.

The HTML Living standard recommends that the constructor should be used to set up the
initial state and default values, and to set up event listeners and possibly a shadow root.

For everything else, use the "connectedCallback".

Missing public method "addNewtaskCallback" in TaskBox.

If you have named the method differently, you must rename the method or my testing tools will not see the method.

You are using public fields and methods that should have been private.
There should be no public fields in any of the component classes.
The only public methods of TaskList should be showTask, updateTask, removeTask, setStatuseslist, addChangestatusCallback, addDeletetaskCallback and getNumtasks.
All methods of TaskView should be private.
The only public methods of TaskBox should be show, setStatuseslist, addNewtaskCallback and close.

Use operators in a boolean context to avoid problems.
Example on what to avoid:
    if (this.querySelector("table")) { ... }
Rather, use:
    if (this.querySelector("table") !== null) { ... }

In a boolean context, undefined, 0, Null, an empty text will all
evaluate to false. Without an operator, a misprint in the expression
can therefore be difficult to find, and can give unexpected results.

The TaskBox dialog window does not close when clicking on the close symbol.

No confirmation window when deleting task.

No confirmation window when updating task status.

Setting the task status to the status that the element already has should be ignored by the client.

You have problems with synchronization in your solution.
A task can be removed from the view even if the back end does not respond to the ajax calls.

There exist no DOM event named "countChange".

You have modified the HTML template for TaskBox. You must use the provided template.


attempt 3:
You were supposed to deliver in groups of three to five.

You are using innerHTML to insert pure text. Use e.g. innerText to insert pure text.

Properties like table.tBodies[0].rows are faster than using querySelector/querySelectorAll.

The HTML Living standard recommends that the constructor should be used to set up the
initial state and default values, and to set up event listeners and possibly a shadow root.

For everything else, use the "connectedCallback".

With your solution, every time the component is connected to the DOM, new callbacks are added in addition to the existing ones already listening for the same events.

If no connection with the database, the button "New task" should remain disabled. In your application, the button is enabled also if the back end does not respond to the ajax calls.

Strange message in confirmation window to modify task status.

You are doing the update of the task count to complicated. You create a custom event that bubbles from TaskList. The task list count belongs to TaskView. Therefore, let TaskView do the update after its call to "removeTask" and "showTask" of TaskList. There is no need for a custom event.

In TaskBox, why the check if inside the box? The listener is on the "dialog" element. The event then only fires if inside the dialog element.

Adding a new task does not work if trying first a task with no title.

A new task is added to early, when selecting the status of the new task. The task should not be added before the button "add task" is clicked

You must correct the problems with the application before the oral demonstration.
