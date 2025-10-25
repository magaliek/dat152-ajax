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
    #shadow;
    #container;
    #table = null;
    #tbody = null;
    #allstatuses;
    #changeStatusCallback;
    #deleteTaskCallback;

    constructor() {
        super();

        this.#shadow = this.attachShadow({mode: "closed"});

        this.#shadow.appendChild(template.content.cloneNode(true));
        this.#container = this.#shadow.querySelector("#tasklist");
        this.#allstatuses = [];
        this.#changeStatusCallback = null;
        this.#deleteTaskCallback = null;
    }

    /**
     * @public
     * @param {Array} list with all possible task statuses
     */
    setStatuseslist(allstatuses) {
        this.#allstatuses = Array.isArray(allstatuses) ? allstatuses : [];
        if(this.#tbody === null) return;

        for (const row in this.#tbody.querySelectorAll("tr[task-id]")) {
            const select = row.querySelector('select');
            const current = row.querySelectorAll('td')[1]?.textContent ?? '';

            select.replaceChildren(new Option('<Modify>', '0', true, current === ''));

            for (const s of this.#allstatuses) {
                select.appendChild(new Option(s, s, false, s===current));
            }
        }
    }

    /**
     * Add callback to run on change of status of a task, i.e. on change in the SELECT element
     * @public
     * @param {function} callback
     */
    addChangestatusCallback(callback) {
        this.#changeStatusCallback = callback;
    }

    /**
     * Add callback to run on click on delete button of a task
     * @public
     * @param {function} callback
     */
    addDeletetaskCallback(callback) {
        this.#deleteTaskCallback = callback;
    }

    /**
     * Add task at top in list of tasks in the view
     * @public
     * @param {Object} task - Object representing a task
     */
    showTask(task) {
        if (this.#table === null) {
            this.#container.appendChild(tasktable.content.cloneNode(true));
            this.#table = this.#container.querySelector("table");
            this.#tbody = this.#table.querySelector("tbody");
        }
        const row = taskrow.content.firstElementChild.cloneNode(true);
        row.setAttribute('task-id', task.id);

        const tds = row.getElementsByTagName('td'); //not using row.cells because i wanna skip table headers if any
        const select = row.querySelector('select');

        tds[0].textContent = task.title;
        tds[1].textContent = task.status;

        let oldStatus = task.status;
        select.addEventListener("change", () => {
            console.log("select changed →", task.id, "new value:", select.value);
            if (select.value === "0") {
                console.log('value='+select.value);
                return
            };

            if (this.#changeStatusCallback !== null) {
                this.#changeStatusCallback({id: task.id, status: select.value});
            }
            oldStatus = select.value;
        });

        const button = row.querySelector("button");
        button.addEventListener("click", () => {
            if (this.#deleteTaskCallback !== null) {
                this.#deleteTaskCallback({ id: task.id, title: task.title });
            }
        });

        this.#allstatuses.forEach(status => {
            const opt = document.createElement("option");
            opt.value = status;
            opt.textContent = status;
            if (task.status === status) opt.selected = true;
            select.appendChild(opt);
        });

        this.#tbody.prepend(row);
        this.#updateCount();
    }


    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
    updateTask(task) {
        console.log("updateTask called with:", task);
        const row = this.#container.querySelector(`tr[task-id="${task.id}"]`);
        if (row === null) {
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
        const row = this.#container.querySelector(`tr[task-id="${id}"]`);
        if (row !== null) {
            row.remove();
        }

        if (this.getNumtasks() <= 0) {
            this.#container.innerHTML = "";
            this.#table = null;
            this.#tbody = null;
        }
        this.#updateCount();
    }

    #updateCount() {
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
        return this.#container.querySelectorAll("tr[task-id]").length;
    }
}
customElements.define('task-list', TaskList);
