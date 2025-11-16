import config from "../../demo/js/config.js";
import '../tasklist/tasklist.js';
import '../taskbox/taskbox.js';

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
    #shadow; #msg; #list; #base; #box; #btn;

    constructor() {
        super();
        this.#shadow = this.attachShadow({mode: 'closed'});
        this.#shadow.appendChild(template.content.cloneNode(true));
        this.#msg = this.#shadow.querySelector("#message");
        this.#list = this.#shadow.querySelector("task-list");
        this.#box = this.#shadow.querySelector("task-box");
        this.#btn = this.#shadow.querySelector("#newtask button");

        this.#btn.addEventListener("click", () => this.#box.show());
    }

    connectedCallback() {
        if (this.dataset.serviceurl !== undefined && this.dataset.serviceurl !== null) {
          this.#base = this.dataset.serviceurl || base;
        }
        this.#btn.disabled = true;
        this.#init();
    }

    /**
     * Main setup: load statuses and tasks, enable button, wire callbacks
     */
    async #init() {
      console.log("TaskView init, base =", this.#base);
      this.#btn.disabled = true;

      try {
        const [stRes, tlRes] = await Promise.all([
          fetch(`${this.#base}/allstatuses`),
          fetch(`${this.#base}/tasklist`)
        ]);

        if (stRes.ok === false) {
          console.error("failed to load statuses:", stRes.status, stRes.statusText);
          return;
        }
        if (tlRes.ok === false) {
          console.error("failed to load tasks:", tlRes.status, tlRes.statusText);
          return;
        }

        const statuses = await stRes.json();
        const tasksPayload = await tlRes.json();

        const all = Array.isArray(statuses.allstatuses) ? statuses.allstatuses : [];
        this.#list.setStatuseslist(all);
        this.#box.setStatuseslist(all);

        const tasks = Array.isArray(tasksPayload.tasks) ? tasksPayload.tasks : [];
        for (const t of tasks) {
          this.#list.showTask(t);
        }
        this.#wireCallbacks();
        this.#updateCountMsg();

        console.log("Loaded statuses:", all);
        console.log("Loaded tasks:", tasks);

        this.#btn.disabled = false;
      } catch (err) {
        console.error("Init failed with an exception:", err);
      }
    }


    /**
     * Wire up callbacks from <task-list> and the New Task button
     */
    #wireCallbacks() {
        this.#list.addChangestatusCallback(async ({ id, status }) => {
            try {
                const res = await fetch(`${this.#base}/task/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status })
                });
                if (res.ok === false) {
                    const txt = await res.text().catch(() => "");
                    console.error("PUT failed:", res.status, res.statusText, `${this.#base}/task/${id}`, txt);
                    return;
                }
                const data = await res.json();
                if (data.responseStatus === false) {
                    return;
                }
                const newStatus = (data.status !== undefined && data.status !== null) ? data.status : status;
                this.#list.updateTask({ id, status: newStatus });
            } catch (err) {
                console.error("PUT threw:", err);
            }
        });

        this.#list.addDeletetaskCallback(async ({ id, title }) => {
            try {
                const r = await fetch(`${this.#base}/task/${id}`, { method: "DELETE" });
                if (r.ok === false) {
                    console.warn("DELETE not ok:", r.status, r.statusText);
                    return;
                }
                const data = await r.json();
                if (data.responseStatus === false) {
                    return;
                }
                this.#list.removeTask(id);
                this.#updateCountMsg();

                console.log(`Deleted task ${id}${title ? ` (${title})` : ""}.`);
            } catch (err) {
                console.error("DELETE threw:", err);
            }
        });

        this.#box.addNewtaskCallback(async ({ title, status }) => {
            try {
                const res = await fetch(`${this.#base}/task`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, status })
                });
                if (res.ok === false) {
                    console.warn("POST not ok:", res.status, res.statusText);
                    return;
                }
                const data = await res.json();
                const hasTask = (data.task !== undefined && data.task !== null && data.task !== false);
                if (data.responseStatus === false || hasTask === false) {
                    return;
                }
                this.#list.showTask(data.task);
                this.#updateCountMsg();

                console.log(`Created task ${data.task.id}`);
            } catch (err) {
                console.error("POST threw:", err);
            }
        });
    }

    #updateCountMsg() {
        const count = this.#list.getNumtasks();
        this.#msg.textContent = `Found ${count} tasks.`;
    }

}

customElements.define('task-view', TaskView);
