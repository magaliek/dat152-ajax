import config from "../../demo/js/config.js";

const base = config.servicesPath;

const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${import.meta.url.match(/.*\//)[0]}/taskview.css"/>

    <h1>Tasks</h1>
    <div id="message"><p></p></div>
    <div id="newtask">
        <button type="button">New task</button>
    </div>
    <!-- The task list -->
    <task-list></task-list>

    <!-- The Modal -->
    <task-box></task-box>
`;

class TaskView extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this.msg = this.querySelector("#message");
        this.list = this.querySelector("task-list");
        this.base = this.getAttribute("data-serviceurl");
        this.box = this.querySelector("task-box");
    }

    connectedCallback() {
        this.list.addEventListener('countChange', e => {
            this.msg.textContent = `Found ${e.detail.count} tasks.`;
        });
        this.init();
    }

    /**
     * Main setup: load statuses and tasks, enable button, wire callbacks
     */
    async init() {
        const st = await fetch(`${this.base}/allstatuses`);
        if (!st.ok) { console.log("failed to load statuses"); return; }
        const statuses = await st.json();
        this.list.setStatuseslist(statuses.allstatuses);
        this.box.setStatuseslist(statuses.allstatuses);

        const tl = await fetch(`${this.base}/tasklist`);
        if (!tl.ok) { console.log( "failed to load tasks"); return; }
        const data = await tl.json();
        (data.tasks || []).forEach(t => this.list.showTask(t));
        this.wireCallbacks();
        console.log("Loaded statuses:", statuses);
        console.log("Loaded tasks:", data.tasks);
    }

    /**
     * Wire up callbacks from <task-list> and the New Task button
     */
    wireCallbacks() {
        this.list.addChangestatusCallback(async ({ id, status }) => {
            console.log("changeStatusCallback fired with:", id, status);
            const res = await fetch(`${this.base}/task/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });

            if (!res.ok) {
                const txt = await res.text();
                console.error("PUT failed:", res.status, res.statusText, `${this.base}/task/${id}`, txt);
                return;
            }

            const data = await res.json();
            console.log("PUT response JSON:", data);
            if (data.responseStatus) {
                this.list.updateTask({ id, status: data.status ?? status });
                console.log("Updated task in UI →", { id, status: data.status ?? status });
            } else {
                console.log("Failed to update status");
            }
        });


        this.list.addDeletetaskCallback(async ({ id, title }) => {
            const r = await fetch(`${this.base}/task/${id}`, { method: "DELETE" });
            const data = await r.json();
            if (data.responseStatus) {
                this.list.removeTask(id);
                console.log(`Deleted task ${id}${title ? ` (${title})` : ""}.`);
            } else {
                console.log(`Failed to delete task ${id}`);
            }
        });

        // Open the taskbox when the New Task button is clicked
        const btn = this.querySelector("#newtask button");
        btn.addEventListener("click", () => this.box.open());

        // When box submits, POST to backend and show the new task
        this.box.onSubmit(async ({ title, status }) => {
            const res = await fetch(`${this.base}/task`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, status })
            });

            const data = await res.json();
            if (data.responseStatus && data.task) {
                this.list.showTask(data.task);
                console.log(`Created task ${data.task.id}`);
            } else {
                console.log("Failed to create task");
            }
        });

    }

}

customElements.define('task-view', TaskView);