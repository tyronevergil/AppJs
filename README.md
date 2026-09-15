# AppJs Framework

AppJs is a small framework layer built around existing JavaScript tools rather than a ground-up rewrite. It grew out of a maintenance problem: a system already depended on several JavaScript libraries, some tied to specific versions, and the goal was to bring them under a consistent application structure without discarding what already worked.

Key ideas:

- **Interchangeable UI controls** — Declarative attributes (e.g. `app-datepicker`) decouple markup and view models from a specific widget library. Adapters translate the neutral attribute into jQuery UI, Kendo UI, or plain-input behavior, enabling progressive enhancement.
- **MVVM pattern** — Features with form state and asynchronous actions follow a `provider` → `bindingModel` → `commands` → `viewModel` structure using KnockoutJS, keeping each responsibility in its own place.
- **Controller pattern** — Simpler features (e.g. Quote of the Day) use a lightweight `controller.js` instead of the full MVVM stack.
- **Small declarative helpers** — Attributes like `app-modal`, `app-open`, `app-navigate`, and `app-controller` wire up common behaviors directly in markup.
- **Graceful degradation** — Features still function with plain inputs and fallbacks when a library or widget isn't available.
- **Module loading and widget registration** — RequireJS loads feature modules and widget adapters on demand, keeping library-specific initialization out of the view.

AppJs does not eliminate the differences between the underlying tools; it gives them common boundaries, loading rules, and lifecycle behavior. This also allows incremental evolution: components can be modernized at different times while stable implementations continue to participate in the same application structure.

These ideas are not meant to prescribe one implementation or document every part of the framework — they represent a set of architectural principles that can be adapted to different libraries, module loaders, testing tools, and application structures.
