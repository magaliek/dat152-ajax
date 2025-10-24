// TaskBox: simple modal-ish input for new tasks.
// - Enter submits (if both fields filled)
// - Esc closes and resets
// - Parent calls: box.setStatuseslist([...]); box.onSubmit(cb); box.open();

const template = document.createElement("template");
template.innerHTML = `
  <link rel="stylesheet" type="text/css" href="${import.meta.url.match(/.*\//)[0]}/taskbox.css"/>
  <div class="taskbox" hidden>
    <label>
      Title:
      <input type="text" name="title" autocomplete="off">
    </label>
    <label>
      Status:
      <select name="status">
        <!-- inject options here -->
      </select>
    </label>
  </div>
`;

class TaskBox extends HTMLElement {
    constructor() {
        super();

        // Mount template
        this.appendChild(template.content.cloneNode(true));

        // Cache refs
        this.$root   = this.querySelector(".taskbox");
        this.$title  = this.$root.querySelector('input[name="title"]');
        this.$status = this.$root.querySelector('select[name="status"]');

        // External submit callback (set via onSubmit)
        this.submitCallback = null;

        // Keyboard UX: Enter = submit, Esc = close
        this._onKeyDown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                this.close();
            } else if (e.key === "Enter") {
                // only submit when we're inside the box
                if (this.$root.contains(e.target)) {
                    e.preventDefault();
                    this._submit();
                }
            }
        };
        this.$root.addEventListener("keydown", this._onKeyDown);

        // Optional: submit when the status select changes (if title is already filled)
        this.$status.addEventListener("change", () => {
            if (this.$title.value.trim() && this.$status.value) {
                this._submit();
            }
        });
    }

    /**
     * Fill the status dropdown
     * @param {Array<string>} allstatuses
     */
    setStatuseslist(allstatuses) {
        // Clear existing <option>s
        this.$status.replaceChildren();

        // Placeholder option (forces user to pick)
        const ph = document.createElement("option");
        ph.value = "";
        ph.textContent = "<Choose status>";
        ph.disabled = true;
        ph.selected = true;
        this.$status.appendChild(ph);

        // Add statuses
        for (const s of allstatuses) {
            const opt = document.createElement("option");
            opt.value = s;
            opt.textContent = s;
            this.$status.appendChild(opt);
        }
    }

    /** Show the box and focus title */
    open() {
        this.$root.hidden = false;
        // Move focus after rendering tick
        queueMicrotask(() => {
            this.$title.focus();
            this.$title.select();
        });
    }

    /** Hide the box and reset fields */
    close() {
        this.$root.hidden = true;
        this.$title.value = "";
        // Reset to placeholder if present
        if (this.$status.options.length) {
            this.$status.selectedIndex = 0;
        }
    }

    /**
     * Let parent register a submit callback
     * @param {(payload:{title:string,status:string})=>void} cb
     */
    onSubmit(cb) {
        this.submitCallback = cb;
    }

    // Internal: gather values, validate, emit to parent, close
    _submit() {
        const title  = this.$title.value.trim();
        const status = this.$status.value;

        // Minimal validation
        if (!title || !status) {
            // You can style invalid state here if you want
            return;
        }

        if (typeof this.submitCallback === "function") {
            this.submitCallback({ title, status });
        }
        this.close();
    }
}

customElements.define("task-box", TaskBox);
