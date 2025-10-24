const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${import.meta.url.match(/.*\//)[0]}/tasklist.css"/>

    <div id="tasklist"></div>`;

const tasktable = document.createElement("template");
tasktable.innerHTML = `
    <table>
        <thead><tr><th>Task</th><th>Status</th></tr></thead>
        <tbody></tbody>
    </table>`;

const taskrow = document.createElement("template");
taskrow.innerHTML = `
    <tr>
        <td></td>
        <td></td>
        <td>
            <select>
                <option value="0" selected>&lt;Modify&gt;</option>
            </select>
        </td>
        <td><button type="button">Remove</button></td>
    </tr>`;

/**
  * TaskList
  * Manage view with list of tasks
  */
class TaskList extends HTMLElement {

    constructor() {
        super();

          this.appendChild(template.content.cloneNode(true));
          this.container = this.querySelector("#tasklist");
          this.allstatuses = [];
          this.changeStatusCallback = null;
          this.deleteTaskCallback = null;
    }

    /**
     * @public
     * @param {Array} list with all possible task statuses
     */
    setStatuseslist(allstatuses) {
        this.allstatuses = allstatuses;
    }

    /**
     * Add callback to run on change of status of a task, i.e. on change in the SELECT element
     * @public
     * @param {function} callback
     */
    addChangestatusCallback(callback) {
        this.changeStatusCallback = callback;
    }

    /**
     * Add callback to run on click on delete button of a task
     * @public
     * @param {function} callback
     */
    addDeletetaskCallback(callback) {
        this.deleteTaskCallback = callback;
    }

    /**
     * Add task at top in list of tasks in the view
     * @public
     * @param {Object} task - Object representing a task
     */
    showTask(task) {
        if (!this.table) {
            this.container.appendChild(tasktable.content.cloneNode(true));
            this.table = this.container.querySelector("table");
            this.tbody = this.table.querySelector("tbody");
        }
        const rowFrag = taskrow.content.cloneNode(true);
        const row = rowFrag.querySelector("tr");
        const tds = row.getElementsByTagName('td');
        const select = row.querySelector('select');
        row.setAttribute("task-id", task.id);

        select.addEventListener("change", () => {
            console.log("select changed →", task.id, "new value:", select.value);
            if (select.value === "0") return;
            if (this.changeStatusCallback) {
                this.changeStatusCallback({id: task.id, status: select.value});
            }
        });

        const button = row.querySelector("button");
        button.addEventListener("click", () => {
            if (this.deleteTaskCallback) {
                this.deleteTaskCallback({ id: task.id, title: task.title });
            }
        });

        tds[0].textContent = task.title;
        tds[1].textContent = task.status;

        this.allstatuses.forEach(status => {
            const opt = document.createElement("option");
            opt.value = status;
            opt.textContent = status;
            if (task.status === status) opt.selected = true;
            select.appendChild(opt);
        });

        this.tbody.prepend(row);
        this.updateCount();
    }


    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
    updateTask(task) {
        console.log("updateTask called with:", task);
        const row = this.container.querySelector(`tr[task-id="${task.id}"]`);
        if (!row) {
            console.warn("updateTask: no row found for", task.id);
            return;
        }

        const select = row.querySelector("select");

        select.value = task.status;
        row.querySelectorAll("td")[1].textContent=task.status;
    }

    /**
     * Remove a task from the view
     * @param {Integer} task - ID of task to remove
     */
    removeTask(id) {
        const row = this.container.querySelector(`tr[task-id="${id}"]`);
        if (row) {
            row.remove();
        }

        if (this.getNumtasks() <= 0) {
            this.container.innerHTML = "";
            this.table = null;
            this.tbody = null;
        }
        this.updateCount();
    }

    updateCount() {
        const count = this.getNumtasks();
        this.dispatchEvent(new CustomEvent('countChange', {
            detail: {count},
            bubbles: true
        }));
    }

    /**
     * @public
     * @return {Number} - Number of tasks on display in view
     */
    getNumtasks() {
        return this.container.querySelectorAll("tr[task-id]").length;
    }
}
customElements.define('task-list', TaskList);
