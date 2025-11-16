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

        for (const row of this.#tbody.rows) {
            const select = row.querySelector('select');
            const current = row.cells[1]?.textContent ?? '';

            select.replaceChildren(new Option('<Modify>', '0', true, current === ''));

            for (const s of this.#allstatuses) {
                select.appendChild(new Option(s, s, false, s===current));
            }
            select.value = '0';
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
            this.#tbody = this.#table.tBodies[0];
        }
        const row = taskrow.content.firstElementChild.cloneNode(true);
        row.setAttribute('task-id', task.id);

        const tds = row.getElementsByTagName('td');
        const select = row.querySelector('select');

        tds[0].textContent = task.title;
        tds[1].textContent = task.status;

        select.addEventListener("change", () => {
            if (select.value === "0") {
                return;
            }
            const current = row.cells[1].textContent;
            if (select.value === current) {
                select.value = '0';
                return;
            }
            const ok = window.confirm(`Change status of "${task.title}" from "${current}" to "${select.value}"?`);
            if (ok === false) {
                select.value = '0';
                return;
            }
            if (this.#changeStatusCallback !== null) {
                this.#changeStatusCallback({ id: task.id, status: select.value });
            }
        });

        const button = row.querySelector("button");
        button.addEventListener("click", () => {
            const ok = window.confirm(`Delete "${task.title}"?`);
                if (ok === false) {
                    return;
                }

            if (this.#deleteTaskCallback !== null) {
                this.#deleteTaskCallback({ id: task.id, title: task.title });
            }
        });

        this.#allstatuses.forEach(status => {
            const opt = document.createElement("option");
            opt.value = status;
            opt.textContent = status;
            select.appendChild(opt);
        });
        select.value = '0';

        this.#tbody.prepend(row);
    }


    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
    updateTask(task) {
        console.log("updateTask called with:", task);
        let row = null;
        const rows = this.#tbody.rows;
        for (const r of rows) {
            if (Number(r.getAttribute("task-id")) === task.id) {
                row = r;
                break;
            }
        }
        if (row === null) {
            console.warn("updateTask: no row found for", task.id);
            return;
        }

        const select = row.querySelector("select");

        select.value = task.status;
        row.cells[1].textContent=task.status;
        select.value = '0'; //come back
    }

    /**
     * Remove a task from the view
     * @param {Integer} task - ID of task to remove
     */
    removeTask(id) {
        let row = null;
        const rows = this.#tbody.rows;
        for (const r of rows) {
            if (Number(r.getAttribute("task-id")) === id) {
                row = r;
                break;
            }
        }
        if (row !== null) {
            row.remove();
        }

        if (this.getNumtasks() <= 0) {
            this.#container.textContent = "";
            this.#table = null;
            this.#tbody = null;
        }
    }

    /**
     * @public
     * @return {Number} - Number of tasks on display in view
     */
    getNumtasks() {
        return this.#tbody ? this.#tbody.rows.length : 0;
    }
}

customElements.define('task-list', TaskList);