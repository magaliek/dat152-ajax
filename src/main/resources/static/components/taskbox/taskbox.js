const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css"
        href="${import.meta.url.match(/.*\//)[0]}/taskbox.css"/>
    <dialog>
       <!-- Modal content -->
        <span>&times;</span>
        <div>
            <div>Title:</div>
            <div>
                <input type="text" size="25" maxlength="80"
                    placeholder="Task title" autofocus/>
            </div>
            <div>Status:</div><div><select></select></div>
        </div>
        <p><button type="submit">Add task</button></p>
    </dialog>
`;


class TaskBox extends HTMLElement {
    #root;
    #title;
    #status;
    #submitCallback;
    #onKeyDown;
    #shadow;
    #btn;

    constructor() {
        super();

        // Mount template
        this.#shadow = this.attachShadow({mode: 'closed'});
        this.#shadow.appendChild(template.content.cloneNode(true));

        // Cache refs
        this.#root   = this.#shadow.querySelector("dialog");
        this.#title  = this.#root.querySelector('input[type="text"]');
        this.#status = this.#root.querySelector('select');
        this.#btn = this.#root.querySelector("button[type='submit']");

        this.#submitCallback = null;

        this.#btn.addEventListener("click", () => this.#submit());

        this.#onKeyDown = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.#submit();
            }
        };
        this.#root.addEventListener("keydown", this.#onKeyDown);

        this.#shadow.querySelector("span").addEventListener("click", () => {
            this.close();
        });
    }

    /**
     * Fill the status dropdown
     * @param {Array<string>} allstatuses
     */
    setStatuseslist(allstatuses) {
        // Clear existing <option>s
        this.#status.replaceChildren();

        // Placeholder option (forces user to pick)
        const ph = document.createElement("option");
        ph.value = "";
        ph.textContent = "<Choose status>";
        ph.disabled = true;
        ph.selected = true;
        this.#status.appendChild(ph);

        // Add statuses
        for (const s of allstatuses) {
            const opt = document.createElement("option");
            opt.value = s;
            opt.textContent = s;
            this.#status.appendChild(opt);
        }
    }

    /** Show the box and focus title */
    show() {
        this.#root.showModal();
        // Move focus after rendering tick
        queueMicrotask(() => {
            this.#title.focus();
            this.#title.select();
        });
    }

    /** Hide the box and reset fields */
    close() {
        this.#root.close();
        this.#title.value = "";
        // Reset to placeholder if present
        if (this.#status.options.length > 0) {
            this.#status.selectedIndex = 0;
        }
    }

    /**
     * Let parent register a submit callback
     * @param {(payload:{title:string,status:string})=>void} cb
     */
    addNewtaskCallback(cb) {
        this.#submitCallback = cb;
    }


    // Internal: gather values, validate, emit to parent, close
    #submit() {
        const title  = this.#title.value.trim();
        const status = this.#status.value;

        // Minimal validation
        if (title.length === 0 || status.length === 0) {
            return;
        }

        if (typeof this.#submitCallback === "function") {
            this.#submitCallback({ title, status });
        }
        this.close();
    }
}

customElements.define("task-box", TaskBox);