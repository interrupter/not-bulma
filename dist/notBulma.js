var notBulma = (function (exports) {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    /* src/elements/block/ui.block.svelte generated by Svelte v3.46.6 */

    function create_fragment$11(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr(div, "id", /*id*/ ctx[0]);
    			attr(div, "class", div_class_value = "block " + /*classes*/ ctx[1]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*id*/ 1) {
    				attr(div, "id", /*id*/ ctx[0]);
    			}

    			if (!current || dirty & /*classes*/ 2 && div_class_value !== (div_class_value = "block " + /*classes*/ ctx[1])) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$11($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { id = '' } = $$props;
    	let { classes = '' } = $$props;

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('classes' in $$props) $$invalidate(1, classes = $$props.classes);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	return [id, classes, $$scope, slots];
    }

    class Ui_block extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$11, create_fragment$11, safe_not_equal, { id: 0, classes: 1 });
    	}
    }

    /* src/elements/block/ui.box.svelte generated by Svelte v3.46.6 */

    function create_fragment$10(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr(div, "id", /*id*/ ctx[0]);
    			attr(div, "class", div_class_value = "box " + /*classes*/ ctx[1] + "");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*id*/ 1) {
    				attr(div, "id", /*id*/ ctx[0]);
    			}

    			if (!current || dirty & /*classes*/ 2 && div_class_value !== (div_class_value = "box " + /*classes*/ ctx[1] + "")) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$10($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { id = '' } = $$props;
    	let { classes = '' } = $$props;

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('classes' in $$props) $$invalidate(1, classes = $$props.classes);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	return [id, classes, $$scope, slots];
    }

    class Ui_box extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$10, create_fragment$10, safe_not_equal, { id: 0, classes: 1 });
    	}
    }

    /* src/elements/block/ui.content.svelte generated by Svelte v3.46.6 */

    function create_fragment$$(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr(div, "id", /*id*/ ctx[0]);
    			attr(div, "class", div_class_value = "content " + /*classes*/ ctx[1]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*id*/ 1) {
    				attr(div, "id", /*id*/ ctx[0]);
    			}

    			if (!current || dirty & /*classes*/ 2 && div_class_value !== (div_class_value = "content " + /*classes*/ ctx[1])) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$$($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { id = '' } = $$props;
    	let { classes = '' } = $$props;

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('classes' in $$props) $$invalidate(1, classes = $$props.classes);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	return [id, classes, $$scope, slots];
    }

    class Ui_content extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$$, create_fragment$$, safe_not_equal, { id: 0, classes: 1 });
    	}
    }

    var index$c = /*#__PURE__*/Object.freeze({
        __proto__: null,
        UIBlock: Ui_block,
        UIBox: Ui_box,
        UIContent: Ui_content
    });

    /* src/elements/various/ui.booleans.svelte generated by Svelte v3.46.6 */

    function get_each_context$h(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (10:0) {:else}
    function create_else_block$u(ctx) {
    	let span;
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(/*NO*/ ctx[1]);
    			attr(span, "class", "tag is-danger");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*NO*/ 2) set_data(t, /*NO*/ ctx[1]);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (8:0) {#if item.value }
    function create_if_block$E(ctx) {
    	let span;
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(/*YES*/ ctx[0]);
    			attr(span, "class", "tag is-success");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*YES*/ 1) set_data(t, /*YES*/ ctx[0]);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (7:0) {#each values as item }
    function create_each_block$h(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[3].value) return create_if_block$E;
    		return create_else_block$u;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$_(ctx) {
    	let each_1_anchor;
    	let each_value = /*values*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$h(get_each_context$h(ctx, each_value, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*YES, values, NO*/ 7) {
    				each_value = /*values*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$h(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$h(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    function instance$_($$self, $$props, $$invalidate) {
    	let { YES = 'Да' } = $$props;
    	let { NO = 'Нет' } = $$props;
    	let { values = [] } = $$props;

    	$$self.$$set = $$props => {
    		if ('YES' in $$props) $$invalidate(0, YES = $$props.YES);
    		if ('NO' in $$props) $$invalidate(1, NO = $$props.NO);
    		if ('values' in $$props) $$invalidate(2, values = $$props.values);
    	};

    	return [YES, NO, values];
    }

    class Ui_booleans extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$_, create_fragment$_, safe_not_equal, { YES: 0, NO: 1, values: 2 });
    	}
    }

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    function _classPrivateFieldGet(receiver, privateMap) {
      var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get");

      return _classApplyDescriptorGet(receiver, descriptor);
    }

    function _classPrivateFieldSet(receiver, privateMap, value) {
      var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");

      _classApplyDescriptorSet(receiver, descriptor, value);

      return value;
    }

    function _classExtractFieldDescriptor(receiver, privateMap, action) {
      if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to " + action + " private field on non-instance");
      }

      return privateMap.get(receiver);
    }

    function _classApplyDescriptorGet(receiver, descriptor) {
      if (descriptor.get) {
        return descriptor.get.call(receiver);
      }

      return descriptor.value;
    }

    function _classApplyDescriptorSet(receiver, descriptor, value) {
      if (descriptor.set) {
        descriptor.set.call(receiver, value);
      } else {
        if (!descriptor.writable) {
          throw new TypeError("attempted to set read only private field");
        }

        descriptor.value = value;
      }
    }

    function _classPrivateMethodGet(receiver, privateSet, fn) {
      if (!privateSet.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
      }

      return fn;
    }

    function _checkPrivateRedeclaration(obj, privateCollection) {
      if (privateCollection.has(obj)) {
        throw new TypeError("Cannot initialize the same private elements twice on an object");
      }
    }

    function _classPrivateFieldInitSpec(obj, privateMap, value) {
      _checkPrivateRedeclaration(obj, privateMap);

      privateMap.set(obj, value);
    }

    function _classPrivateMethodInitSpec(obj, privateSet) {
      _checkPrivateRedeclaration(obj, privateSet);

      privateSet.add(obj);
    }

    /*
    	:property.sub1.func().funcProp
    	 = return funcProp of function result of sub1 property of property of object
    	:{::helperVal}.sub
    	 = return sub property of object property with name retrieved from helperVal property of helpers object
    	:{::helperFunc()}.sub
    	= return sub property of object property with name retrieved from helperVal function result of helpers object.
    	if helpersFunx return 'car' then source path becomes :car.sub

    */

    const SUB_PATH_START = '{',
    	SUB_PATH_END = '}',
    	PATH_SPLIT = '.',
    	PATH_START_OBJECT = ':',
    	PATH_START_HELPERS = '::',
    	FUNCTION_MARKER = '()',
    	MAX_DEEP = 10;

    /**
     * Set of tools to use notPath property access notation
     * : is for item
     * :: is for helpers
     * {} subpath
     * . path splitter
     * () function and should be executed with params (item, helper | undefined)
     * sub-paths will be parsed and replaced by results in source path
     */
    class notPath$1 {
    	/*
    		input ':{::helperVal}.sub'
    		return ::helperVal
    	*/

    	/**
    	 * Returns first subpath in path
    	 * if subpath not closed will return it anyway
    	 * @param {string} path path in string notation
    	 * @return {string|null} subpath or null if no sub path were found
    	 */
    	static findNextSubPath(path) {
    		let subPath = '',
    			find = false;
    		for (let i = 0; i < path.length; i++) {
    			if (path[i] === SUB_PATH_START) {
    				find = true;
    				subPath = '';
    			} else {
    				if ((path[i] === SUB_PATH_END) && find) {
    					return subPath;
    				} else {
    					subPath += path[i];
    				}
    			}
    		}
    		return find ? subPath : null;
    	}

    	/**
    	 * Replace sub-path in parent path by parsed version
    	 * @param {string} path path to process
    	 * @param {string} sub sub path to replace
    	 * @param {string} parsed parsed sub path
    	 * @return {string} parsed path
    	 */

    	static replaceSubPath(path, sub, parsed) {
    		let subf = SUB_PATH_START + sub + SUB_PATH_END,
    			i = 0;
    		while ((path.indexOf(subf) > -1) && i < MAX_DEEP) {
    			path = path.replace(subf, parsed);
    			i++;
    		}
    		return path;
    	}

    	/**
    	 * Parses path while there any sub-paths
    	 * @param {string} path raw unparsed path
    	 * @param {object} item data
    	 * @param {object} helpers helpers
    	 * @return {string} parsed path
    	 */
    	static parseSubs(path, item, helpers) {
    		let subPath = this.findNextSubPath(path),
    			subPathParsed, i = 0;
    		while (subPath) {
    			subPathParsed = this.getValueByPath(subPath.indexOf(PATH_START_HELPERS) > -1 ? helpers : item, subPath, item, helpers);
    			path = this.replaceSubPath(path, subPath, subPathParsed);
    			i++;
    			if (i > MAX_DEEP) {
    				break;
    			}
    			subPath = this.findNextSubPath(path);
    		}
    		return path;
    	}

    	/**
    	 * Get property value
    	 * @param {string} path path to property
    	 * @param {object} item item object
    	 * @param {object} helpers helpers object
    	 */

    	static get(path, item, helpers) {
    		switch (path) {
    		case PATH_START_OBJECT:
    			return item;
    		case PATH_START_HELPERS:
    			return helpers;
    		}
    		path = this.parseSubs(path, item, helpers);
    		return this.getValueByPath(path.indexOf(PATH_START_HELPERS) > -1 ? helpers : item, path, item, helpers);
    	}

    	/**
    	 * Set property value
    	 * @param {string} path path to property
    	 * @param {object} item item object
    	 * @param {object} helpers helpers object
    	 * @param {any} attrValue value we want to assign
    	 */

    	static set(path, item, helpers, attrValue) {
    		if (arguments.length === 3) {
    			attrValue = helpers;
    			helpers = undefined;
    		}
    		let subPath = this.findNextSubPath(path),
    			subPathParsed,
    			i = 0;
    		while (subPath) {
    			subPathParsed = this.getValueByPath(subPath.indexOf(PATH_START_HELPERS) > -1 ? helpers : item, subPath, item, helpers);
    			path = this.replaceSubPath(path, subPath, subPathParsed);
    			if (i > MAX_DEEP) {
    				break;
    			}
    			subPath = this.findNextSubPath(path);
    			i++;
    		}
    		this.setValueByPath(item, path, attrValue);
    		if (item.isRecord && this.normilizePath(path).length > 1 && item.__isActive) {
    			item.trigger('change', item, path, attrValue);
    		}
    	}

    	/**
    	 * Set target property to null
    	 * @param {string} path path to property
    	 * @param {object} item item object
    	 * @param {object} helpers helpers object
    	 */

    	static unset(path, item, helpers) {
    		this.set(path, item, helpers, null);
    	}

    	/**
    	 * Parses step key, transforms it to end-form
    	 * @param {string} step not parsed step key
    	 * @param {object} item item object
    	 * @param {object} helper helpers object
    	 * @return {string|number} parsed step key
    	 */

    	static parsePathStep(step, item, helper) {
    		let rStep = null;
    		if (step.indexOf(PATH_START_HELPERS) === 0 && helper) {
    			rStep = step.replace(PATH_START_HELPERS, '');
    			if (rStep.indexOf(FUNCTION_MARKER) === rStep.length - 2) {
    				rStep = rStep.replace(FUNCTION_MARKER, '');
    				if (Object.prototype.hasOwnProperty.call(helper, rStep)) {
    					return helper[rStep](item, undefined);
    				}
    			} else {
    				return helper[rStep];
    			}
    		} else {
    			if (step.indexOf(PATH_START_OBJECT) === 0 && item) {
    				rStep = step.replace(PATH_START_OBJECT, '');
    				if (rStep.indexOf(FUNCTION_MARKER) === rStep.length - 2) {
    					rStep = rStep.replace(FUNCTION_MARKER, '');
    					if (Object.prototype.hasOwnProperty.call(item, rStep)) {
    						return item[rStep](item, undefined);
    					}
    				} else {
    					return item[rStep];
    				}
    			}
    		}
    		return step;
    	}

    	//::fieldName.result
    	//{}
    	//{fieldName: 'targetRecordField'}
    	////['targetRecordField', 'result']
    	/**
    	 * Transforms path with sub paths to path without
    	 * @param {string|array} path path to target property
    	 * @param {object} item item object
    	 * @param {object} helper helper object
    	 * @return {array} parsed path
    	 **/
    	static parsePath(path, item, helper) {
    		if (!Array.isArray(path)) {
    			path = path.split(PATH_SPLIT);
    		}
    		for (var i = 0; i < path.length; i++) {
    			path[i] = this.parsePathStep(path[i], item, helper);
    		}
    		return path;
    	}

    	/**
    	 * Transforms path from string notation to array of keys
    	 * @param {string|array} path  input path, if array does nothing
    	 * @return {array} path in array notation
    	 */

    	static normilizePath(path) {
    		if (Array.isArray(path)) {
    			return path;
    		} else {
    			while (path.indexOf(PATH_START_OBJECT) > -1) {
    				path = path.replace(PATH_START_OBJECT, '');
    			}
    			return path.split(PATH_SPLIT);
    		}
    	}

    	/*
    		small = ["todo"],
    		big = ["todo", "length"]
    		return true;

    	*/

    	/**
    	 * Identifies if first path includes second, compared from start,
    	 * no floating start position inside ['join', 'me'], ['me']
    	 * will result in false
    	 * @param {array} big where we will search
    	 * @param {array} small what we will search
    	 * @return {boolean} if we succeed
    	 */

    	static ifFullSubPath(big, small) {
    		if (big.length < small.length) {
    			return false;
    		}
    		for (let t = 0; t < small.length; t++) {
    			if (small[t] !== big[t]) {
    				return false;
    			}
    		}
    		return true;
    	}

    	/**
    	 * Getter through third object
    	 * Path is parsed, no event triggering for notRecord
    	 * @param {object} object object to be used as getter
    	 * @param {string|array} attrPath path to property
    	 * @param {object} item supporting data
    	 * @param {helpers} object  supporting helpers
    	 */

    	static getValueByPath(object, attrPath, item, helpers) {
    		attrPath = this.normilizePath(attrPath);
    		let attrName = attrPath.shift(),
    			isFunction = attrName.indexOf(FUNCTION_MARKER) > -1;
    		if (isFunction) {
    			attrName = attrName.replace(FUNCTION_MARKER, '');
    		}
    		if ((typeof object === 'object' && typeof object !== 'undefined' && object!== null) && typeof object[attrName] !== 'undefined' && object[attrName] !== null) {
    			let newObj = isFunction ? object[attrName]({
    				item,
    				helpers
    			}) : object[attrName];
    			if (attrPath.length > 0) {
    				return this.getValueByPath(newObj, attrPath, item, helpers);
    			} else {
    				return newObj;
    			}
    		} else {
    			return undefined;
    		}
    	}

    	/**
    	 * Setter through third object
    	 * Path is parsed, no event triggering for notRecord
    	 * @param {object} object object to be modified
    	 * @param {string|array} attrPath path to property
    	 * @param {any} attrValue  value to assign
    	 */

    	static setValueByPath(object, attrPath, attrValue) {
    		attrPath = this.normilizePath(attrPath);
    		let attrName = attrPath.shift();
    		if (attrPath.length > 0) {
    			if (!Object.prototype.hasOwnProperty.call(object, attrName)) {
    				object[attrName] = {};
    			}
    			this.setValueByPath(object[attrName], attrPath, attrValue);
    		} else {
    			object[attrName] = attrValue;
    		}
    	}

    	/**
    	* Joins passed in strings with PATH_SPLIT
    	* @param {string} arguments path to be glued
    	* @return {string} composite path
    	*/

    	static join() {
    		let args = Array.prototype.slice.call(arguments);
    		return args.join(PATH_SPLIT);
    	}
    }

    var src$1 = notPath$1;

    var notPath = src$1;

    /*
    https://github.com/TehShrike/is-mergeable-object

    Included for convinience only. All rights belongs to their authors and etc.
    start of my code marked.

    */

    let isMergeableObject = function isMergeableObject(value) {
      return isNonNullObject(value) && !isSpecial(value);
    };

    function isNonNullObject(value) {
      return !!value && typeof value === 'object';
    }

    function isSpecial(value) {
      var stringValue = Object.prototype.toString.call(value);
      return stringValue === '[object RegExp]' || stringValue === '[object Date]' || isReactElement(value);
    } // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25


    var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
    var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

    function isReactElement(value) {
      return value.$$typeof === REACT_ELEMENT_TYPE;
    }
    /*
    https://github.com/KyleAMathews/deepmerge

    The MIT License (MIT)

    Copyright (c) 2012 Nicholas Fisher

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
    */


    function emptyTarget(val) {
      return Array.isArray(val) ? [] : {};
    }

    function cloneUnlessOtherwiseSpecified(value, optionsArgument) {
      var clone = !optionsArgument || optionsArgument.clone !== false;
      return clone && isMergeableObject(value) ? deepmerge(emptyTarget(value), value, optionsArgument) : value;
    }

    function defaultArrayMerge(target, source, optionsArgument) {
      return target.concat(source).map(function (element) {
        return cloneUnlessOtherwiseSpecified(element, optionsArgument);
      });
    }

    function mergeObject(target, source, optionsArgument) {
      var destination = {};

      if (isMergeableObject(target)) {
        Object.keys(target).forEach(function (key) {
          destination[key] = cloneUnlessOtherwiseSpecified(target[key], optionsArgument);
        });
      }

      Object.keys(source).forEach(function (key) {
        if (!isMergeableObject(source[key]) || !target[key]) {
          destination[key] = cloneUnlessOtherwiseSpecified(source[key], optionsArgument);
        } else {
          destination[key] = deepmerge(target[key], source[key], optionsArgument);
        }
      });
      return destination;
    }

    function deepmerge(target, source, optionsArgument) {
      var sourceIsArray = Array.isArray(source);
      var targetIsArray = Array.isArray(target);
      var options = optionsArgument || {
        arrayMerge: defaultArrayMerge
      };
      var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

      if (!sourceAndTargetTypesMatch) {
        return cloneUnlessOtherwiseSpecified(source, optionsArgument);
      } else if (sourceIsArray) {
        var arrayMerge = options.arrayMerge || defaultArrayMerge;
        return arrayMerge(target, source, optionsArgument);
      } else {
        return mergeObject(target, source, optionsArgument);
      }
    }

    deepmerge.all = function deepmergeAll(array, optionsArgument) {
      if (!Array.isArray(array)) {
        throw new Error('first argument should be an array');
      }

      return array.reduce(function (prev, next) {
        return deepmerge(prev, next, optionsArgument);
      }, {});
    };

    class notCommon$2 {
      static isError(e) {
        return e instanceof Error || Object.prototype.hasOwnProperty.call(e, 'status') && e.status === 'error';
      }

      static mute() {
        this.ENV_TYPE = 'production';
      }

      static pad(n) {
        return n < 10 ? '0' + n : n;
      }
      /**
       *  Returns today Date object without hours, minutes, seconds
       *  @return {number}  current date with 00:00:00 in ms of unix time
       */


      static getTodayDate() {
        let t = new Date();
        return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
      }
      /**
       *  Returns true if object has field of name
       *   @param   {object}    obj    some object
       *  @param  {string}    name  field name
       *  @return {boolean}          if object contains field with name
       **/


      static objHas(obj, name) {
        return Object.prototype.hasOwnProperty.call(obj, name);
      }
      /**
      * Copies object to secure it from changes
      * @param {object}   obj     original object
      * @return {object}          copy of object
      **/


      static copyObj(obj) {
        return JSON.parse(JSON.stringify(obj));
      }
      /**
      * Copies object to secure it from changes
      * @param {object}   obj     original object
      * @return {object}          copy of object
      **/


      static partCopyObj(obj, list) {
        let partObj = Object.keys(obj).reduce(function (prev, curr) {
          if (list.includes(curr)) {
            prev[curr] = obj[curr];
          }

          return prev;
        }, {});
        return JSON.parse(JSON.stringify(partObj));
      }
      /**
      * Test argument type to be 'function'
      * @param {any}  func    possible function
      * @return {boolean}     if this is a function
      **/


      static isFunc(func) {
        return typeof func === 'function';
      }
      /**
      * Returns true if argument is Async function
      * @param {function} func  to test
      * @return {boolean}       if this function is constructed as AsyncFunction
      **/


      static isAsync(func) {
        return func.constructor.name === 'AsyncFunction';
      }
      /**
      *  Executes method of object in appropriate way inside Promise
      * @param {object}   obj     original object
      * @param {string}   name    method name to execute
      * @param {Array}     params  array of params
      * @return {Promise}          results of method execution
      **/


      static async executeObjectFunction(obj, name, params) {
        if (obj) {
          const proc = notPath.get(':' + name, obj);

          if (notCommon$2.isFunc(proc)) {
            if (notCommon$2.isAsync(proc)) {
              return await proc(...params);
            } else {
              return proc(...params);
            }
          }
        }
      }
      /**
      *  Executes method of object in apropriate way inside Promise
      * @param {Object}   from     original object
      * @param {Object}   name    method name to execute
      * @param {Array}     list  array of params
      * @return {Promise}          results of method execution
      **/


      static mapBind(from, to, list) {
        list.forEach(function (item) {
          if (typeof from[item] === 'function') {
            to[item] = from[item].bind(from);
          }
        });
      }

      static isClass(fn) {
        return /^\s*class/.test(fn.toString());
      }

      static detectType(testie) {
        if (typeof testie !== 'function') {
          return typeof testie;
        } else {
          if (this.isClass(testie)) {
            return 'class';
          } else {
            return 'function';
          }
        }
      } //Проверка является ли переменная массивом


      static isArray(data) {
        return typeof data == "object" && data instanceof Array;
      }

      static localIsoDate(date) {
        date = date || new Date();
        let localIsoString = date.getFullYear() + '-' + this.pad(date.getMonth() + 1) + '-' + this.pad(date.getDate()) + 'T' + this.pad(date.getHours()) + ':' + this.pad(date.getMinutes()) + ':' + this.pad(date.getSeconds());
        return localIsoString;
      }

      static getToday() {
        let today = new Date();
        let date = today.getFullYear() + '-' + this.pad(today.getMonth() + 1) + '-' + this.pad(today.getDate());
        return date;
      }

      static backlogAdd(msg) {
        let type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'log';

        if (this.get('backlog') === true) {
          this.backlog.push({
            msg,
            type
          });
        }
      }

      static dumpBacklog() {
        while (this.backlog.length) {
          let row = this.backlog.shift();
          window[this.LOG][row.type](...row.msg);
        }
      }

      static logMsg() {
        let now = this.localIsoDate(); // eslint-disable-next-line no-console

        window[this.LOG].log(`[${now}]: `, ...arguments);
        this.backlogAdd([`[${now}]: `, ...arguments], 'log');
      }

      static log() {
        this.logMsg(...arguments);
      }

      static createLogger(prefix) {
        return {
          log: this.genLogMsg(prefix),
          error: this.genLogError(prefix),
          debug: this.genLogDebug(prefix),
          report: this.report
        };
      } //Генерация метода вывода сообщений в консоль с указанием префикса.


      static genLogMsg(prefix) {
        return function () {
          //not arrow bc of arguments special var is not available in arrow functions
          let now = notCommon$2.localIsoDate(); // eslint-disable-next-line no-console

          window[notCommon$2.LOG].log(`[${now}]: ${prefix}::`, ...arguments);
          notCommon$2.backlogAdd([`[${now}]: ${prefix}::`, ...arguments], 'log');
        };
      }
      /**
       * Определяет является ли окружение окружением разработки
       * @returns  {boolean} true если это запущено в окружении разработки
       **/


      static isDev() {
        return this.ENV_TYPE === this.DEV_ENV;
      }

      static debug() {
        if (this.isDev()) {
          return this.logMsg(...arguments);
        } else {
          return this.NOOP;
        }
      }

      static genLogDebug(prefix) {
        if (this.isDev()) {
          return this.genLogMsg(prefix);
        } else {
          return this.NOOP;
        }
      }

      static error() {
        this.logError(...arguments);
      } //Функция вывода сообщения об ошибке


      static logError() {
        let now = this.localIsoDate(); // eslint-disable-next-line no-console

        window[this.LOG].error(`[${now}]: `, ...arguments);
        this.backlogAdd([`[${now}]: `, ...arguments], 'error');
      }

      static genLogError(prefix) {
        return function () {
          //do not change to arrow function, bc of arguments
          let now = notCommon$2.localIsoDate(); // eslint-disable-next-line no-console

          window[notCommon$2.LOG].error(`[${now}]: ${prefix}::`, ...arguments);
          notCommon$2.backlogAdd([`[${now}]: ${prefix}::`, ...arguments], 'error');
        };
      }

      static report(e) {
        if (this.getApp()) {
          let reporter = this.getApp().getService('nsErrorReporter');

          if (reporter) {
            reporter.report(e).catch(this.error.bind(this));
          }
        } else {
          if (!this.get('production')) {
            this.error(...arguments);
          }
        }
      }

      static trace() {
        if (!this.get('production')) {
          this.trace(...arguments);
        }
      }

      static trimBackslash(str) {
        if (str.indexOf('/') === 0) {
          str = str.substring(1);
        }

        if (str[str.length - 1] === '/') {
          str = str.substring(0, str.length - 1);
        }

        return str;
      }
      /**
      *  Builds URL with structure like prefix/module/model/id/action
      * If some part absent or set to false it will be excluded from result
      *
      *  @return {string}  url path
      */


      static buildURL(_ref) {
        let {
          prefix,
          module,
          model,
          id,
          action
        } = _ref;
        let url = ['/'];

        if (prefix) {
          url.push(encodeURIComponent(this.trimBackslash(prefix)));
        }

        if (module) {
          url.push(encodeURIComponent(this.trimBackslash(module)));
        }

        if (model) {
          url.push(encodeURIComponent(this.trimBackslash(model)));
        }

        if (id) {
          url.push(encodeURIComponent(this.trimBackslash(id)));
        }

        if (action) {
          url.push(encodeURIComponent(this.trimBackslash(action)));
        }

        url = url.filter(function (el) {
          return el !== '';
        });
        return url.join('/').replace(/\/\//g, '/');
      }

      static capitalizeFirstLetter(name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      }

      static lowerFirstLetter(string) {
        return string.charAt(0).toLowerCase() + string.slice(1);
      }

      static strLengthCap(str) {
        let MAX_TITLE_LENGTH = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;
        let POST_FIX = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '...';

        if (str.length > MAX_TITLE_LENGTH) {
          return str.substr(0, MAX_TITLE_LENGTH) + POST_FIX;
        } else {
          return str;
        }
      }

      static escapeHtml(unsafe) {
        return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
      }

      static startApp(starter) {
        document.addEventListener('DOMContentLoaded', starter);
      }

      static getApp() {
        return this.get('app');
      }

      static extendAppConfig(conf, conf2) {
        return this.deepMerge(conf, conf2);
      }

      static absorbModule() {
        let defaultConf,
            //app options
        mod,
            //module options
        targets = {}; //various collections

        if (arguments.length == 1) {
          targets = { ...arguments[0]
          };

          if (Object.hasOwnProperty.call(arguments[0], 'defaultConf')) {
            defaultConf = arguments[0].defaultConf;
            delete targets.defaultConf;
          }

          if (Object.hasOwnProperty.call(arguments[0], 'mod')) {
            mod = arguments[0].mod;
            delete targets.mod;
          }
        } else {
          this.log('WARNING: absorbModule format obsoleted, use object {defaultConf, mod, services, uis, wsc, etc}');
          defaultConf = arguments[0];
          mod = arguments[1];

          if (arguments.length > 2) {
            targets.services = arguments[2];
          }

          if (arguments.length > 3) {
            targets.uis = arguments[3];
          }

          if (arguments.length > 4) {
            targets.wcs = arguments[4];
          }
        }

        for (let prop in mod) {
          //add manifest to other
          if (prop === 'manifest') {
            defaultConf = this.extendAppConfig(defaultConf, mod.manifest);
            continue;
          }

          if (typeof this.get(`absorb.${prop}`) === 'function') {
            if (!Object.prototype.hasOwnProperty.call(targets, prop)) {
              targets[prop] = {};
              this.log(`WARNING: no accamulator object provided for '${prop}' collection`);
            }

            this.get(`absorb.${prop}`)(targets[prop], mod[prop]);
          } else if (prop.indexOf('nc') === 0) {
            if (!Object.prototype.hasOwnProperty.call(defaultConf, 'controllers')) {
              defaultConf.controllers = {};
            }

            defaultConf.controllers[prop] = mod[prop];
          } else {
            //in case of some other stuff presented, isolating it in special var
            if (!Object.prototype.hasOwnProperty.call(window, 'notEnv')) {
              window.notEnv = {};
            }

            window.notEnv[prop] = mod[prop];
          }
        }

        return defaultConf;
      }

      static defineIfNotExists(obj, key, defaultValue) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) {
          obj[key] = defaultValue;
        }
      }

      static register(key, val) {
        this.registry[key] = val;
      }

      static get(key) {
        return Object.prototype.hasOwnProperty.call(this.registry, key) ? this.registry[key] : null;
      }

      static moveItem(array, old_index, new_index) {
        if (new_index >= array.length) {
          var k = new_index - array.length;

          while (k-- + 1) {
            array.push(undefined);
          }
        }

        array.splice(new_index, 0, array.splice(old_index, 1)[0]);
      }

      static stripProxy(obj) {
        if (typeof obj !== 'undefined' && obj !== null) {
          if (obj.isProxy) {
            if (Array.isArray(obj)) {
              obj = Array.from(obj);
            } else {
              obj = Object.assign({}, obj);
            }

            for (let t in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, t)) {
                obj[t] = this.stripProxy(obj[t]);
              }
            }
          }
        }

        return obj;
      }

      static pipe(data
      /* feed data */
      , funcs
      /* functions array */
      ) {
        let result;

        for (let func of funcs) {
          result = func(result || data);
        }

        return result;
      }

      static getAPI(type) {
        return this.getManager() ? this.getManager().getAPI(type) : null;
      }

      static setManager(v) {
        this.MANAGER = v;
      }

      static getManager() {
        return this.MANAGER;
      }

      static getJSON(url) {
        return fetch(url).then(function (response) {
          return response.json();
        });
      }

      static wait(sec) {
        return new Promise(function (res) {
          setTimeout(res, sec * 1000);
        });
      }

      static registerWidgetEvents(events) {
        var _this = this;

        if (this.getApp()) {
          Object.keys(events).forEach(function (eventName) {
            _this.getApp().on(eventName, events[eventName]);
          });
        }
      }

    }

    _defineProperty(notCommon$2, "MANAGER", null);

    _defineProperty(notCommon$2, "LOG", 'console');

    _defineProperty(notCommon$2, "deepMerge", deepmerge);

    _defineProperty(notCommon$2, "TZ_OFFSET", new Date().getTimezoneOffset() / 60 * -1);

    _defineProperty(notCommon$2, "DEV_ENV", 'production');

    _defineProperty(notCommon$2, "ENV_TYPE", window.NOT_ENV_TYPE ? window.NOT_ENV_TYPE : notCommon$2.DEV_ENV);

    _defineProperty(notCommon$2, "NOOP", function () {});

    _defineProperty(notCommon$2, "backlog", []);

    _defineProperty(notCommon$2, "registry", {});

    function absorbServices(target, src) {
      if (target) {
        for (let serv in src) {
          if (Object.prototype.hasOwnProperty.call(target, serv)) {
            notCommon$2.logError(`services property duplication ${serv}`);
          }

          target[serv] = src[serv];
        }
      }
    }

    function extendWSClient(wcs, wscName, wscOptions) {
      if (!Object.prototype.hasOwnProperty.call(wcs, wscName)) {
        wcs[wscName] = {
          connection: {},
          router: {
            routes: {}
          },
          messenger: {}
        };
      }

      let target = wcs[wscName];

      if (Object.prototype.hasOwnProperty.call(wscOptions, 'router')) {
        if (Object.prototype.hasOwnProperty.call(wscOptions.router, 'routes')) {
          for (let routeType in wscOptions.router.routes) {
            if (!Object.prototype.hasOwnProperty.call(target.router.routes, routeType)) {
              target.router.routes[routeType] = {};
            }

            Object.assign(target.router.routes[routeType], { ...wscOptions.router.routes[routeType]
            });
          }
        }
      }

      if (Object.prototype.hasOwnProperty.call(wscOptions, 'messenger')) {
        Object.assign(target.messenger, { ...wscOptions.messenger
        });
      }

      if (Object.prototype.hasOwnProperty.call(wscOptions, 'connection')) {
        Object.assign(target.connection, { ...wscOptions.connection
        });
      }

      for (let t of ['name', 'getToken', 'logger', 'identity', 'credentials']) {
        if (Object.prototype.hasOwnProperty.call(wscOptions, t)) {
          target[t] = wscOptions[t];
        }
      }
    }

    function absorbWSC(target, src) {
      if (target) {
        for (let wsClientName in src) {
          extendWSClient(target, wsClientName, src[wsClientName]);
        }
      }
    }

    function absorbUIs(target, src) {
      if (target) {
        for (let ui in src) {
          if (Object.prototype.hasOwnProperty.call(target, ui)) {
            notCommon$2.logError(`uis property duplication ${ui}`);
          }

          target[ui] = src[ui];
        }
      }
    }

    function absorbFields(target, src) {
      if (target) {
        for (let ui in src) {
          if (Object.prototype.hasOwnProperty.call(target, ui)) {
            notCommon$2.logError(`fields property duplication ${ui}`);
          }

          target[ui] = src[ui];
        }
      }
    }

    notCommon$2.register('absorb.wsc', absorbWSC);
    notCommon$2.register('absorb.services', absorbServices);
    notCommon$2.register('absorb.uis', absorbUIs);
    notCommon$2.register('absorb.uis', absorbFields);

    /* src/elements/various/ui.indicator.svelte generated by Svelte v3.46.6 */

    function create_fragment$Z(ctx) {
    	let span;
    	let t_value = /*labels*/ ctx[2][/*state*/ ctx[0]] + "";
    	let t;
    	let span_class_value;

    	return {
    		c() {
    			span = element("span");
    			t = text(t_value);

    			attr(span, "class", span_class_value = "tag is-" + /*size*/ ctx[1] + " " + (/*bold*/ ctx[5] ? 'has-text-weight-bold' : '') + " " + (/*padding*/ ctx[4] !== 'normal'
    			? `is-padded-${/*padding*/ ctx[4]}`
    			: '') + " " + (/*sided*/ ctx[10] ? 'is-sided' : '') + " " + (/*right*/ ctx[6] ? 'is-sided-right' : '') + " " + (/*left*/ ctx[7] ? 'is-sided-left' : '') + " " + (/*top*/ ctx[8] ? 'is-sided-top' : '') + " " + (/*bottom*/ ctx[9] ? 'is-sided-bottom' : '') + " is-" + /*state*/ ctx[0] + " " + /*classes*/ ctx[3] + "");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*labels, state*/ 5 && t_value !== (t_value = /*labels*/ ctx[2][/*state*/ ctx[0]] + "")) set_data(t, t_value);

    			if (dirty & /*size, bold, padding, sided, right, left, top, bottom, state, classes*/ 2043 && span_class_value !== (span_class_value = "tag is-" + /*size*/ ctx[1] + " " + (/*bold*/ ctx[5] ? 'has-text-weight-bold' : '') + " " + (/*padding*/ ctx[4] !== 'normal'
    			? `is-padded-${/*padding*/ ctx[4]}`
    			: '') + " " + (/*sided*/ ctx[10] ? 'is-sided' : '') + " " + (/*right*/ ctx[6] ? 'is-sided-right' : '') + " " + (/*left*/ ctx[7] ? 'is-sided-left' : '') + " " + (/*top*/ ctx[8] ? 'is-sided-top' : '') + " " + (/*bottom*/ ctx[9] ? 'is-sided-bottom' : '') + " is-" + /*state*/ ctx[0] + " " + /*classes*/ ctx[3] + "")) {
    				attr(span, "class", span_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function instance$Z($$self, $$props, $$invalidate) {
    	let { id = 'tagId' } = $$props;
    	let { state = 'light' } = $$props;
    	let { size = 'normal' } = $$props;

    	let { labels = {
    		black: 'black',
    		dark: 'dark',
    		light: 'light',
    		white: 'white',
    		primary: 'primary',
    		link: 'link',
    		info: 'info',
    		success: 'success',
    		warning: 'warning',
    		danger: 'danger'
    	} } = $$props;

    	let { classes = 'mx-1' } = $$props;
    	let { padding = 'normal' } = $$props;
    	let { bold = false } = $$props;
    	let { right = false } = $$props;
    	let { left = false } = $$props;
    	let { top = false } = $$props;
    	let { bottom = false } = $$props;
    	let sided = false;
    	let { events = {} } = $$props;
    	let { register = notCommon$2.registerWidgetEvents.bind(notCommon$2) } = $$props;

    	let { onUpdate = data => {
    		if (Object.prototype.hasOwnProperty.call(data, 'state')) {
    			$$invalidate(0, state = data.state);
    		}
    	} } = $$props;

    	function getStandartUpdateEventName() {
    		return `indicator-${id}:update`;
    	}

    	onMount(() => {
    		if (!Object.prototype.hasOwnProperty.call(events, getStandartUpdateEventName())) {
    			$$invalidate(11, events[getStandartUpdateEventName()] = onUpdate, events);
    		}

    		register(events);
    	});

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(12, id = $$props.id);
    		if ('state' in $$props) $$invalidate(0, state = $$props.state);
    		if ('size' in $$props) $$invalidate(1, size = $$props.size);
    		if ('labels' in $$props) $$invalidate(2, labels = $$props.labels);
    		if ('classes' in $$props) $$invalidate(3, classes = $$props.classes);
    		if ('padding' in $$props) $$invalidate(4, padding = $$props.padding);
    		if ('bold' in $$props) $$invalidate(5, bold = $$props.bold);
    		if ('right' in $$props) $$invalidate(6, right = $$props.right);
    		if ('left' in $$props) $$invalidate(7, left = $$props.left);
    		if ('top' in $$props) $$invalidate(8, top = $$props.top);
    		if ('bottom' in $$props) $$invalidate(9, bottom = $$props.bottom);
    		if ('events' in $$props) $$invalidate(11, events = $$props.events);
    		if ('register' in $$props) $$invalidate(13, register = $$props.register);
    		if ('onUpdate' in $$props) $$invalidate(14, onUpdate = $$props.onUpdate);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*right, left, top, bottom*/ 960) {
    			$$invalidate(10, sided = right || left || top || bottom);
    		}
    	};

    	return [
    		state,
    		size,
    		labels,
    		classes,
    		padding,
    		bold,
    		right,
    		left,
    		top,
    		bottom,
    		sided,
    		events,
    		id,
    		register,
    		onUpdate
    	];
    }

    class Ui_indicator extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$Z, create_fragment$Z, safe_not_equal, {
    			id: 12,
    			state: 0,
    			size: 1,
    			labels: 2,
    			classes: 3,
    			padding: 4,
    			bold: 5,
    			right: 6,
    			left: 7,
    			top: 8,
    			bottom: 9,
    			events: 11,
    			register: 13,
    			onUpdate: 14
    		});
    	}
    }

    /* src/elements/various/ui.progress.svelte generated by Svelte v3.46.6 */

    function create_fragment$Y(ctx) {
    	let progress;
    	let t0;
    	let t1;
    	let progress_class_value;

    	return {
    		c() {
    			progress = element("progress");
    			t0 = text(/*value*/ ctx[0]);
    			t1 = text("%");
    			attr(progress, "class", progress_class_value = "progress " + /*classes*/ ctx[4] + " " + (/*color*/ ctx[2] ? `is-${/*color*/ ctx[2]}` : '') + " " + (/*size*/ ctx[3] ? `is-${/*size*/ ctx[3]}` : ''));
    			progress.value = /*value*/ ctx[0];
    			attr(progress, "max", /*max*/ ctx[1]);
    		},
    		m(target, anchor) {
    			insert(target, progress, anchor);
    			append(progress, t0);
    			append(progress, t1);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) set_data(t0, /*value*/ ctx[0]);

    			if (dirty & /*classes, color, size*/ 28 && progress_class_value !== (progress_class_value = "progress " + /*classes*/ ctx[4] + " " + (/*color*/ ctx[2] ? `is-${/*color*/ ctx[2]}` : '') + " " + (/*size*/ ctx[3] ? `is-${/*size*/ ctx[3]}` : ''))) {
    				attr(progress, "class", progress_class_value);
    			}

    			if (dirty & /*value*/ 1) {
    				progress.value = /*value*/ ctx[0];
    			}

    			if (dirty & /*max*/ 2) {
    				attr(progress, "max", /*max*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(progress);
    		}
    	};
    }

    function instance$Y($$self, $$props, $$invalidate) {
    	let { value } = $$props;
    	let { max = 100 } = $$props;
    	let { color = '' } = $$props;
    	let { size = '' } = $$props;
    	let { classes = '' } = $$props;

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('max' in $$props) $$invalidate(1, max = $$props.max);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    		if ('classes' in $$props) $$invalidate(4, classes = $$props.classes);
    	};

    	return [value, max, color, size, classes];
    }

    class Ui_progress extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$Y, create_fragment$Y, safe_not_equal, {
    			value: 0,
    			max: 1,
    			color: 2,
    			size: 3,
    			classes: 4
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function initDict() {
      let target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      const handler = {
        get: function (target, prop) {
          if (!Object.prototype.hasOwnProperty.call(target, prop)) {
            return prop;
          }

          return Reflect.get(...arguments);
        }
      };
      return new Proxy(target, handler);
    }

    function createLocale() {
      const {
        subscribe,
        set,
        update
      } = writable(initDict());
      return {
        subscribe,
        update,
        set: function (val) {
          set(initDict(val));
        },
        reset: function () {
          return set(initDict());
        }
      };
    }

    const LOCALE = createLocale();

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var EventEmitter = createCommonjsModule(function (module) {
    (function (exports) {

        /**
         * Class for managing events.
         * Can be extended to provide event functionality in other classes.
         *
         * @class EventEmitter Manages event registering and emitting.
         */
        function EventEmitter() {}

        // Shortcuts to improve speed and size
        var proto = EventEmitter.prototype;
        var originalGlobalValue = exports.EventEmitter;

        /**
         * Finds the index of the listener for the event in its storage array.
         *
         * @param {Function[]} listeners Array of listeners to search through.
         * @param {Function} listener Method to look for.
         * @return {Number} Index of the specified listener, -1 if not found
         * @api private
         */
        function indexOfListener(listeners, listener) {
            var i = listeners.length;
            while (i--) {
                if (listeners[i].listener === listener) {
                    return i;
                }
            }

            return -1;
        }

        /**
         * Alias a method while keeping the context correct, to allow for overwriting of target method.
         *
         * @param {String} name The name of the target method.
         * @return {Function} The aliased method
         * @api private
         */
        function alias(name) {
            return function aliasClosure() {
                return this[name].apply(this, arguments);
            };
        }

        /**
         * Returns the listener array for the specified event.
         * Will initialise the event object and listener arrays if required.
         * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
         * Each property in the object response is an array of listener functions.
         *
         * @param {String|RegExp} evt Name of the event to return the listeners from.
         * @return {Function[]|Object} All listener functions for the event.
         */
        proto.getListeners = function getListeners(evt) {
            var events = this._getEvents();
            var response;
            var key;

            // Return a concatenated array of all matching events if
            // the selector is a regular expression.
            if (evt instanceof RegExp) {
                response = {};
                for (key in events) {
                    if (events.hasOwnProperty(key) && evt.test(key)) {
                        response[key] = events[key];
                    }
                }
            }
            else {
                response = events[evt] || (events[evt] = []);
            }

            return response;
        };

        /**
         * Takes a list of listener objects and flattens it into a list of listener functions.
         *
         * @param {Object[]} listeners Raw listener objects.
         * @return {Function[]} Just the listener functions.
         */
        proto.flattenListeners = function flattenListeners(listeners) {
            var flatListeners = [];
            var i;

            for (i = 0; i < listeners.length; i += 1) {
                flatListeners.push(listeners[i].listener);
            }

            return flatListeners;
        };

        /**
         * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
         *
         * @param {String|RegExp} evt Name of the event to return the listeners from.
         * @return {Object} All listener functions for an event in an object.
         */
        proto.getListenersAsObject = function getListenersAsObject(evt) {
            var listeners = this.getListeners(evt);
            var response;

            if (listeners instanceof Array) {
                response = {};
                response[evt] = listeners;
            }

            return response || listeners;
        };

        function isValidListener (listener) {
            if (typeof listener === 'function' || listener instanceof RegExp) {
                return true
            } else if (listener && typeof listener === 'object') {
                return isValidListener(listener.listener)
            } else {
                return false
            }
        }

        /**
         * Adds a listener function to the specified event.
         * The listener will not be added if it is a duplicate.
         * If the listener returns true then it will be removed after it is called.
         * If you pass a regular expression as the event name then the listener will be added to all events that match it.
         *
         * @param {String|RegExp} evt Name of the event to attach the listener to.
         * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.addListener = function addListener(evt, listener) {
            if (!isValidListener(listener)) {
                throw new TypeError('listener must be a function');
            }

            var listeners = this.getListenersAsObject(evt);
            var listenerIsWrapped = typeof listener === 'object';
            var key;

            for (key in listeners) {
                if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                    listeners[key].push(listenerIsWrapped ? listener : {
                        listener: listener,
                        once: false
                    });
                }
            }

            return this;
        };

        /**
         * Alias of addListener
         */
        proto.on = alias('addListener');

        /**
         * Semi-alias of addListener. It will add a listener that will be
         * automatically removed after its first execution.
         *
         * @param {String|RegExp} evt Name of the event to attach the listener to.
         * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.addOnceListener = function addOnceListener(evt, listener) {
            return this.addListener(evt, {
                listener: listener,
                once: true
            });
        };

        /**
         * Alias of addOnceListener.
         */
        proto.once = alias('addOnceListener');

        /**
         * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
         * You need to tell it what event names should be matched by a regex.
         *
         * @param {String} evt Name of the event to create.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.defineEvent = function defineEvent(evt) {
            this.getListeners(evt);
            return this;
        };

        /**
         * Uses defineEvent to define multiple events.
         *
         * @param {String[]} evts An array of event names to define.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.defineEvents = function defineEvents(evts) {
            for (var i = 0; i < evts.length; i += 1) {
                this.defineEvent(evts[i]);
            }
            return this;
        };

        /**
         * Removes a listener function from the specified event.
         * When passed a regular expression as the event name, it will remove the listener from all events that match it.
         *
         * @param {String|RegExp} evt Name of the event to remove the listener from.
         * @param {Function} listener Method to remove from the event.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.removeListener = function removeListener(evt, listener) {
            var listeners = this.getListenersAsObject(evt);
            var index;
            var key;

            for (key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    index = indexOfListener(listeners[key], listener);

                    if (index !== -1) {
                        listeners[key].splice(index, 1);
                    }
                }
            }

            return this;
        };

        /**
         * Alias of removeListener
         */
        proto.off = alias('removeListener');

        /**
         * Adds listeners in bulk using the manipulateListeners method.
         * If you pass an object as the first argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
         * You can also pass it a regular expression to add the array of listeners to all events that match it.
         * Yeah, this function does quite a bit. That's probably a bad thing.
         *
         * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
         * @param {Function[]} [listeners] An optional array of listener functions to add.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.addListeners = function addListeners(evt, listeners) {
            // Pass through to manipulateListeners
            return this.manipulateListeners(false, evt, listeners);
        };

        /**
         * Removes listeners in bulk using the manipulateListeners method.
         * If you pass an object as the first argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
         * You can also pass it an event name and an array of listeners to be removed.
         * You can also pass it a regular expression to remove the listeners from all events that match it.
         *
         * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
         * @param {Function[]} [listeners] An optional array of listener functions to remove.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.removeListeners = function removeListeners(evt, listeners) {
            // Pass through to manipulateListeners
            return this.manipulateListeners(true, evt, listeners);
        };

        /**
         * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
         * The first argument will determine if the listeners are removed (true) or added (false).
         * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
         * You can also pass it an event name and an array of listeners to be added/removed.
         * You can also pass it a regular expression to manipulate the listeners of all events that match it.
         *
         * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
         * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
         * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
            var i;
            var value;
            var single = remove ? this.removeListener : this.addListener;
            var multiple = remove ? this.removeListeners : this.addListeners;

            // If evt is an object then pass each of its properties to this method
            if (typeof evt === 'object' && !(evt instanceof RegExp)) {
                for (i in evt) {
                    if (evt.hasOwnProperty(i) && (value = evt[i])) {
                        // Pass the single listener straight through to the singular method
                        if (typeof value === 'function') {
                            single.call(this, i, value);
                        }
                        else {
                            // Otherwise pass back to the multiple function
                            multiple.call(this, i, value);
                        }
                    }
                }
            }
            else {
                // So evt must be a string
                // And listeners must be an array of listeners
                // Loop over it and pass each one to the multiple method
                i = listeners.length;
                while (i--) {
                    single.call(this, evt, listeners[i]);
                }
            }

            return this;
        };

        /**
         * Removes all listeners from a specified event.
         * If you do not specify an event then all listeners will be removed.
         * That means every event will be emptied.
         * You can also pass a regex to remove all events that match it.
         *
         * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.removeEvent = function removeEvent(evt) {
            var type = typeof evt;
            var events = this._getEvents();
            var key;

            // Remove different things depending on the state of evt
            if (type === 'string') {
                // Remove all listeners for the specified event
                delete events[evt];
            }
            else if (evt instanceof RegExp) {
                // Remove all events matching the regex.
                for (key in events) {
                    if (events.hasOwnProperty(key) && evt.test(key)) {
                        delete events[key];
                    }
                }
            }
            else {
                // Remove all listeners in all events
                delete this._events;
            }

            return this;
        };

        /**
         * Alias of removeEvent.
         *
         * Added to mirror the node API.
         */
        proto.removeAllListeners = alias('removeEvent');

        /**
         * Emits an event of your choice.
         * When emitted, every listener attached to that event will be executed.
         * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
         * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
         * So they will not arrive within the array on the other side, they will be separate.
         * You can also pass a regular expression to emit to all events that match it.
         *
         * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
         * @param {Array} [args] Optional array of arguments to be passed to each listener.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.emitEvent = function emitEvent(evt, args) {
            var listenersMap = this.getListenersAsObject(evt);
            var listeners;
            var listener;
            var i;
            var key;
            var response;

            for (key in listenersMap) {
                if (listenersMap.hasOwnProperty(key)) {
                    listeners = listenersMap[key].slice(0);

                    for (i = 0; i < listeners.length; i++) {
                        // If the listener returns true then it shall be removed from the event
                        // The function is executed either with a basic call or an apply if there is an args array
                        listener = listeners[i];

                        if (listener.once === true) {
                            this.removeListener(evt, listener.listener);
                        }

                        response = listener.listener.apply(this, args || []);

                        if (response === this._getOnceReturnValue()) {
                            this.removeListener(evt, listener.listener);
                        }
                    }
                }
            }

            return this;
        };

        /**
         * Alias of emitEvent
         */
        proto.trigger = alias('emitEvent');

        /**
         * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
         * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
         *
         * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
         * @param {...*} Optional additional arguments to be passed to each listener.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.emit = function emit(evt) {
            var args = Array.prototype.slice.call(arguments, 1);
            return this.emitEvent(evt, args);
        };

        /**
         * Sets the current value to check against when executing listeners. If a
         * listeners return value matches the one set here then it will be removed
         * after execution. This value defaults to true.
         *
         * @param {*} value The new value to check for when executing listeners.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.setOnceReturnValue = function setOnceReturnValue(value) {
            this._onceReturnValue = value;
            return this;
        };

        /**
         * Fetches the current value to check against when executing listeners. If
         * the listeners return value matches this one then it should be removed
         * automatically. It will return true by default.
         *
         * @return {*|Boolean} The current value to check for or the default, true.
         * @api private
         */
        proto._getOnceReturnValue = function _getOnceReturnValue() {
            if (this.hasOwnProperty('_onceReturnValue')) {
                return this._onceReturnValue;
            }
            else {
                return true;
            }
        };

        /**
         * Fetches the events object and creates one if required.
         *
         * @return {Object} The events storage object.
         * @api private
         */
        proto._getEvents = function _getEvents() {
            return this._events || (this._events = {});
        };

        /**
         * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
         *
         * @return {Function} Non conflicting EventEmitter class.
         */
        EventEmitter.noConflict = function noConflict() {
            exports.EventEmitter = originalGlobalValue;
            return EventEmitter;
        };

        // Expose the class either via AMD, CommonJS or the global object
        if (module.exports){
            module.exports = EventEmitter;
        }
        else {
            exports.EventEmitter = EventEmitter;
        }
    }(typeof window !== 'undefined' ? window : commonjsGlobal || {}));
    });

    /**
     * Purpose of this Locale object is that it will hold library of localization
     * templates and provide basic localization service to other modules
     **/

    class notLocale extends EventEmitter {
      constructor() {
        super();
        this.dict = {}; //dictionary of phrases

        this.helpers = {}; //additional helper functions and constants

        let dict = this.restoreFromStorage();

        if (dict) {
          this.set(dict);
        }
      }
      /**
       * String format should comply notPath standart.
       * {path_to_access} - is
       * : - is used to access to params
       * :: - is used to access to helpers
       * Welcome, {:where}! - will replace {:where} with content of params.where
       * Welcome, {::where}! - will replace {:where} with content of this.helpers.where
       * () - after path is to invoke function of target object
       * Welcome, {::where()}! - will try to exec this.helpers.where(params, undefined)
       * @param    {string}  str         localized string template with mark to include data
       * @param    {object}  params      params to use in string
       * @returns  {string}              localized version of string with
       */


      format(str, params) {
        return notPath.parseSubs(str, params, this.helpers);
      }
      /**
       * Return localized version of string with injected data from provided object
       * may also use Locale.helpers as source of data
       * @param {string}   phrase    name of string to localize
       * @param {object}   params    object with data to inject in phrase template
       * @return {string}            localized string with injected data
       */


      say(phrase) {
        let params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        try {
          if (Object.prototype.hasOwnProperty.call(this.dict, phrase)) {
            let tmpl = this.dict[phrase],
                result = '';

            if (params) {
              result = this.format(tmpl, params);
            } else {
              result = tmpl;
            }

            return result;
          } else {
            throw new Error(`Unknown locale phrase: ${phrase}`);
          }
        } catch (e) {
          notCommon$2.debug(e);
          return phrase;
        }
      }
      /**
       * Setting new dictionary. triggers event 'change'
       * @param {object}     dict      vocabulary of phrases and templates
       **/


      set(dict) {
        LOCALE.set(dict);
        this.saveToStorage(dict);
        this.dict = Object.assign({}, { ...dict
        });
        this.emit('change');
      }

      saveToStorage(dict) {
        if (window.localStorage) {
          try {
            return window.localStorage.setItem('dictionary', JSON.stringify(dict));
          } catch (e) {
            notCommon$2.debug(e);
            return false;
          }
        }

        return false;
      }

      restoreFromStorage() {
        if (window.localStorage) {
          try {
            let str = window.localStorage.getItem('dictionary');

            if (str) {
              let dict = JSON.parse(str);
              return dict;
            } else {
              return false;
            }
          } catch (e) {
            notCommon$2.debug(e);
            return false;
          }
        }

        return false;
      }
      /**
       * Returns writable store of phrases
       * @return {object}  writable store
       */


      vocabulary() {
        return LOCALE;
      }

    }

    var notLocale$1 = new notLocale();

    const say = notLocale$1.say.bind(notLocale$1);

    /* src/elements/various/ui.tag.svelte generated by Svelte v3.46.6 */

    function create_if_block$D(ctx) {
    	let span;
    	let t_value = /*$LOCALE*/ ctx[12][/*title*/ ctx[0]] + "";
    	let t;
    	let span_id_value;
    	let span_class_value;

    	return {
    		c() {
    			span = element("span");
    			t = text(t_value);
    			attr(span, "id", span_id_value = "tag-" + /*id*/ ctx[1]);

    			attr(span, "class", span_class_value = "tag " + (/*bold*/ ctx[5] ? 'has-text-weight-bold' : '') + " " + (/*padding*/ ctx[4] !== 'normal'
    			? `is-padded-${/*padding*/ ctx[4]}`
    			: '') + " is-" + /*size*/ ctx[3] + " is-" + /*color*/ ctx[2] + " " + (/*sided*/ ctx[11] ? 'is-sided' : '') + " " + (/*right*/ ctx[6] ? 'is-sided-right' : '') + " " + (/*left*/ ctx[7] ? 'is-sided-left' : '') + " " + (/*top*/ ctx[8] ? 'is-sided-top' : '') + " " + (/*bottom*/ ctx[9] ? 'is-sided-bottom' : '') + " " + /*classes*/ ctx[10]);
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, title*/ 4097 && t_value !== (t_value = /*$LOCALE*/ ctx[12][/*title*/ ctx[0]] + "")) set_data(t, t_value);

    			if (dirty & /*id*/ 2 && span_id_value !== (span_id_value = "tag-" + /*id*/ ctx[1])) {
    				attr(span, "id", span_id_value);
    			}

    			if (dirty & /*bold, padding, size, color, sided, right, left, top, bottom, classes*/ 4092 && span_class_value !== (span_class_value = "tag " + (/*bold*/ ctx[5] ? 'has-text-weight-bold' : '') + " " + (/*padding*/ ctx[4] !== 'normal'
    			? `is-padded-${/*padding*/ ctx[4]}`
    			: '') + " is-" + /*size*/ ctx[3] + " is-" + /*color*/ ctx[2] + " " + (/*sided*/ ctx[11] ? 'is-sided' : '') + " " + (/*right*/ ctx[6] ? 'is-sided-right' : '') + " " + (/*left*/ ctx[7] ? 'is-sided-left' : '') + " " + (/*top*/ ctx[8] ? 'is-sided-top' : '') + " " + (/*bottom*/ ctx[9] ? 'is-sided-bottom' : '') + " " + /*classes*/ ctx[10])) {
    				attr(span, "class", span_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function create_fragment$X(ctx) {
    	let if_block_anchor;
    	let if_block = /*title*/ ctx[0] && create_if_block$D(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (/*title*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$D(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$X($$self, $$props, $$invalidate) {
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(12, $LOCALE = $$value));
    	let { id = 'tagId' } = $$props;
    	let { title = 'tag' } = $$props;
    	let { color = 'info' } = $$props;
    	let { size = 'normal' } = $$props;
    	let { padding = 'normal' } = $$props;
    	let { bold = false } = $$props;
    	let { right = false } = $$props;
    	let { left = false } = $$props;
    	let { top = false } = $$props;
    	let { bottom = false } = $$props;
    	let { classes = '' } = $$props;
    	let sided = false;
    	let { events = {} } = $$props;
    	let { register = notCommon$2.registerWidgetEvents.bind(notCommon$2) } = $$props;

    	let { onUpdate = data => {
    		if (Object.prototype.hasOwnProperty.call(data, 'title')) {
    			$$invalidate(0, title = data.title);
    		}
    	} } = $$props;

    	function getStandartUpdateEventName() {
    		return `tag-${id}:update`;
    	}

    	onMount(() => {
    		if (!Object.prototype.hasOwnProperty.call(events, getStandartUpdateEventName())) {
    			$$invalidate(13, events[getStandartUpdateEventName()] = onUpdate, events);
    		}

    		register(events);
    	});

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    		if ('padding' in $$props) $$invalidate(4, padding = $$props.padding);
    		if ('bold' in $$props) $$invalidate(5, bold = $$props.bold);
    		if ('right' in $$props) $$invalidate(6, right = $$props.right);
    		if ('left' in $$props) $$invalidate(7, left = $$props.left);
    		if ('top' in $$props) $$invalidate(8, top = $$props.top);
    		if ('bottom' in $$props) $$invalidate(9, bottom = $$props.bottom);
    		if ('classes' in $$props) $$invalidate(10, classes = $$props.classes);
    		if ('events' in $$props) $$invalidate(13, events = $$props.events);
    		if ('register' in $$props) $$invalidate(14, register = $$props.register);
    		if ('onUpdate' in $$props) $$invalidate(15, onUpdate = $$props.onUpdate);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*right, left, top, bottom*/ 960) {
    			$$invalidate(11, sided = right || left || top || bottom);
    		}
    	};

    	return [
    		title,
    		id,
    		color,
    		size,
    		padding,
    		bold,
    		right,
    		left,
    		top,
    		bottom,
    		classes,
    		sided,
    		$LOCALE,
    		events,
    		register,
    		onUpdate
    	];
    }

    class Ui_tag$1 extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$X, create_fragment$X, safe_not_equal, {
    			id: 1,
    			title: 0,
    			color: 2,
    			size: 3,
    			padding: 4,
    			bold: 5,
    			right: 6,
    			left: 7,
    			top: 8,
    			bottom: 9,
    			classes: 10,
    			events: 13,
    			register: 14,
    			onUpdate: 15
    		});
    	}
    }

    /* src/elements/various/ui.title.svelte generated by Svelte v3.46.6 */

    function create_if_block$C(ctx) {
    	let html_tag;
    	let html_anchor;

    	return {
    		c() {
    			html_tag = new HtmlTag();
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m(target, anchor) {
    			html_tag.m(/*resultSubtitle*/ ctx[1], target, anchor);
    			insert(target, html_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*resultSubtitle*/ 2) html_tag.p(/*resultSubtitle*/ ctx[1]);
    		},
    		d(detaching) {
    			if (detaching) detach(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};
    }

    function create_fragment$W(ctx) {
    	let html_tag;
    	let t;
    	let if_block_anchor;
    	let if_block = /*subtitle*/ ctx[0] && create_if_block$C(ctx);

    	return {
    		c() {
    			html_tag = new HtmlTag();
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			html_tag.a = t;
    		},
    		m(target, anchor) {
    			html_tag.m(/*resultTitle*/ ctx[2], target, anchor);
    			insert(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*resultTitle*/ 4) html_tag.p(/*resultTitle*/ ctx[2]);

    			if (/*subtitle*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$C(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) html_tag.d();
    			if (detaching) detach(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$W($$self, $$props, $$invalidate) {
    	let spacedStyle;
    	let resultTitle;
    	let resultSubtitle;
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(9, $LOCALE = $$value));
    	let { title = '' } = $$props;
    	let { subtitle } = $$props;
    	let { size = 1 } = $$props;
    	let { subsize } = $$props;
    	let { spaced = false } = $$props;
    	let size2;

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(3, title = $$props.title);
    		if ('subtitle' in $$props) $$invalidate(0, subtitle = $$props.subtitle);
    		if ('size' in $$props) $$invalidate(4, size = $$props.size);
    		if ('subsize' in $$props) $$invalidate(5, subsize = $$props.subsize);
    		if ('spaced' in $$props) $$invalidate(6, spaced = $$props.spaced);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*subsize, size*/ 48) {
    			$$invalidate(7, size2 = subsize ? subsize : size < 6 ? size + 1 : size);
    		}

    		if ($$self.$$.dirty & /*spaced*/ 64) {
    			$$invalidate(8, spacedStyle = spaced ? 'is-spaced' : '');
    		}

    		if ($$self.$$.dirty & /*size, spacedStyle, $LOCALE, title*/ 792) {
    			$$invalidate(2, resultTitle = `<h${size} class="title ${spacedStyle} is-${size}">${$LOCALE[title]}</h${size}>`);
    		}

    		if ($$self.$$.dirty & /*size2, $LOCALE, subtitle*/ 641) {
    			$$invalidate(1, resultSubtitle = `<h${size2} class="subtitle is-${size2}">${$LOCALE[subtitle]}</h${size2}>`);
    		}
    	};

    	return [
    		subtitle,
    		resultSubtitle,
    		resultTitle,
    		title,
    		size,
    		subsize,
    		spaced,
    		size2,
    		spacedStyle,
    		$LOCALE
    	];
    }

    class Ui_title extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$W, create_fragment$W, safe_not_equal, {
    			title: 3,
    			subtitle: 0,
    			size: 4,
    			subsize: 5,
    			spaced: 6
    		});
    	}
    }

    /* src/elements/various/ui.user.card.svelte generated by Svelte v3.46.6 */

    function create_fragment$V(ctx) {
    	let article;
    	let figure;
    	let p0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let div0;
    	let p1;
    	let strong0;
    	let t1;
    	let t2;
    	let small;
    	let t4;
    	let strong1;
    	let t5;

    	return {
    		c() {
    			article = element("article");
    			figure = element("figure");
    			p0 = element("p");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			p1 = element("p");
    			strong0 = element("strong");
    			t1 = text(/*username*/ ctx[0]);
    			t2 = space();
    			small = element("small");
    			small.textContent = "@";
    			t4 = space();
    			strong1 = element("strong");
    			t5 = text(/*role*/ ctx[1]);
    			if (!src_url_equal(img.src, img_src_value = /*image*/ ctx[2])) attr(img, "src", img_src_value);
    			attr(img, "alt", /*username*/ ctx[0]);
    			attr(p0, "class", "image is-32x32");
    			attr(figure, "class", "media-left");
    			attr(div0, "class", "content");
    			attr(div1, "class", "media-content");
    			attr(article, "id", /*getCompId*/ ctx[3]());
    			attr(article, "class", "media");
    		},
    		m(target, anchor) {
    			insert(target, article, anchor);
    			append(article, figure);
    			append(figure, p0);
    			append(p0, img);
    			append(article, t0);
    			append(article, div1);
    			append(div1, div0);
    			append(div0, p1);
    			append(p1, strong0);
    			append(strong0, t1);
    			append(p1, t2);
    			append(p1, small);
    			append(p1, t4);
    			append(p1, strong1);
    			append(strong1, t5);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*image*/ 4 && !src_url_equal(img.src, img_src_value = /*image*/ ctx[2])) {
    				attr(img, "src", img_src_value);
    			}

    			if (dirty & /*username*/ 1) {
    				attr(img, "alt", /*username*/ ctx[0]);
    			}

    			if (dirty & /*username*/ 1) set_data(t1, /*username*/ ctx[0]);
    			if (dirty & /*role*/ 2) set_data(t5, /*role*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(article);
    		}
    	};
    }

    function instance$V($$self, $$props, $$invalidate) {
    	let { id = 'userCard' } = $$props;
    	let { image = 'https://bulma.io/images/placeholders/32x32.png' } = $$props;
    	let { username = 'John Doe' } = $$props;
    	let { role = 'admin' } = $$props;
    	let { events = {} } = $$props;
    	let { register = notCommon$2.registerWidgetEvents } = $$props;

    	let { onUpdate = data => {
    		if (Object.prototype.hasOwnProperty.call(data, 'username')) {
    			$$invalidate(0, username = data.username);
    		}

    		if (Object.prototype.hasOwnProperty.call(data, 'role')) {
    			$$invalidate(1, role = data.role);
    		}
    	} } = $$props;

    	function getCompId() {
    		return `usercard-${id}`;
    	}

    	function getStandartUpdateEventName() {
    		let compId = getCompId();
    		return `${compId}:update`;
    	}

    	onMount(() => {
    		if (!Object.prototype.hasOwnProperty.call(events, getStandartUpdateEventName())) {
    			$$invalidate(4, events[getStandartUpdateEventName()] = onUpdate, events);
    		}

    		register(events);
    	});

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(5, id = $$props.id);
    		if ('image' in $$props) $$invalidate(2, image = $$props.image);
    		if ('username' in $$props) $$invalidate(0, username = $$props.username);
    		if ('role' in $$props) $$invalidate(1, role = $$props.role);
    		if ('events' in $$props) $$invalidate(4, events = $$props.events);
    		if ('register' in $$props) $$invalidate(6, register = $$props.register);
    		if ('onUpdate' in $$props) $$invalidate(7, onUpdate = $$props.onUpdate);
    	};

    	return [username, role, image, getCompId, events, id, register, onUpdate];
    }

    class Ui_user_card extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$V, create_fragment$V, safe_not_equal, {
    			id: 5,
    			image: 2,
    			username: 0,
    			role: 1,
    			events: 4,
    			register: 6,
    			onUpdate: 7
    		});
    	}
    }

    var index$b = /*#__PURE__*/Object.freeze({
        __proto__: null,
        UIBooleans: Ui_booleans,
        UIIndicator: Ui_indicator,
        UIProgress: Ui_progress,
        UITag: Ui_tag$1,
        UIUserCard: Ui_user_card,
        UITitle: Ui_title
    });

    /* src/elements/button/ui.button.svelte generated by Svelte v3.46.6 */

    function create_else_block$t(ctx) {
    	let t_value = /*$LOCALE*/ ctx[16][/*title*/ ctx[0]] + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, title*/ 65537 && t_value !== (t_value = /*$LOCALE*/ ctx[16][/*title*/ ctx[0]] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (40:2) {#if icon }
    function create_if_block$B(ctx) {
    	let t0;
    	let t1;
    	let if_block2_anchor;
    	let if_block0 = /*iconSide*/ ctx[14] === 'left' && create_if_block_3$i(ctx);
    	let if_block1 = /*title*/ ctx[0] && create_if_block_2$k(ctx);
    	let if_block2 = /*iconSide*/ ctx[14] === 'right' && create_if_block_1$t(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, if_block2_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (/*iconSide*/ ctx[14] === 'left') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$i(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*title*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$k(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*iconSide*/ ctx[14] === 'right') {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$t(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach(if_block2_anchor);
    		}
    	};
    }

    // (41:2) {#if iconSide === 'left' }
    function create_if_block_3$i(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[13] + " " + (/*size*/ ctx[11] ? `is-${/*size*/ ctx[11]}` : ''));
    			attr(span, "class", "icon");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon, size*/ 10240 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[13] + " " + (/*size*/ ctx[11] ? `is-${/*size*/ ctx[11]}` : ''))) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (44:2) {#if title }
    function create_if_block_2$k(ctx) {
    	let span;
    	let t_value = /*$LOCALE*/ ctx[16][/*title*/ ctx[0]] + "";
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, title*/ 65537 && t_value !== (t_value = /*$LOCALE*/ ctx[16][/*title*/ ctx[0]] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (47:2) {#if iconSide === 'right' }
    function create_if_block_1$t(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[13] + " " + (/*size*/ ctx[11] ? `is-${/*size*/ ctx[11]}` : ''));
    			attr(span, "class", "icon");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon, size*/ 10240 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[13] + " " + (/*size*/ ctx[11] ? `is-${/*size*/ ctx[11]}` : ''))) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function create_fragment$U(ctx) {
    	let button;
    	let button_type_value;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*icon*/ ctx[13]) return create_if_block$B;
    		return create_else_block$t;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			button = element("button");
    			if_block.c();
    			button.disabled = /*disabled*/ ctx[7];
    			attr(button, "type", button_type_value = /*type*/ ctx[9] ? /*type*/ ctx[9] : "");
    			attr(button, "class", button_class_value = "button " + /*classes*/ ctx[12] + " " + (/*state*/ ctx[8] ? `is-${/*state*/ ctx[8]}` : '') + " " + (/*inverted*/ ctx[5] ? `is-inverted` : '') + " " + (/*outlined*/ ctx[4] ? `is-outlined` : '') + " " + (/*raised*/ ctx[3] ? `is-raised` : '') + " " + (/*rounded*/ ctx[6] ? `is-rounded` : '') + " " + (/*light*/ ctx[1] ? `is-light` : '') + " " + (/*loading*/ ctx[2] ? `is-loading` : '') + " " + (/*color*/ ctx[10] ? `is-${/*color*/ ctx[10]}` : '') + " " + (/*size*/ ctx[11] ? `is-${/*size*/ ctx[11]}` : '') + "");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			if_block.m(button, null);

    			if (!mounted) {
    				dispose = listen(button, "click", function () {
    					if (is_function(/*action*/ ctx[15])) /*action*/ ctx[15].apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, null);
    				}
    			}

    			if (dirty & /*disabled*/ 128) {
    				button.disabled = /*disabled*/ ctx[7];
    			}

    			if (dirty & /*type*/ 512 && button_type_value !== (button_type_value = /*type*/ ctx[9] ? /*type*/ ctx[9] : "")) {
    				attr(button, "type", button_type_value);
    			}

    			if (dirty & /*classes, state, inverted, outlined, raised, rounded, light, loading, color, size*/ 7550 && button_class_value !== (button_class_value = "button " + /*classes*/ ctx[12] + " " + (/*state*/ ctx[8] ? `is-${/*state*/ ctx[8]}` : '') + " " + (/*inverted*/ ctx[5] ? `is-inverted` : '') + " " + (/*outlined*/ ctx[4] ? `is-outlined` : '') + " " + (/*raised*/ ctx[3] ? `is-raised` : '') + " " + (/*rounded*/ ctx[6] ? `is-rounded` : '') + " " + (/*light*/ ctx[1] ? `is-light` : '') + " " + (/*loading*/ ctx[2] ? `is-loading` : '') + " " + (/*color*/ ctx[10] ? `is-${/*color*/ ctx[10]}` : '') + " " + (/*size*/ ctx[11] ? `is-${/*size*/ ctx[11]}` : '') + "")) {
    				attr(button, "class", button_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$U($$self, $$props, $$invalidate) {
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(16, $LOCALE = $$value));
    	let { title = '' } = $$props;
    	let { light = false } = $$props;
    	let { loading = false } = $$props;
    	let { raised = false } = $$props;
    	let { outlined = false } = $$props;
    	let { inverted = false } = $$props;
    	let { rounded = false } = $$props;
    	let { disabled = false } = $$props;
    	let { state = '' } = $$props;
    	let { type = '' } = $$props;
    	let { color = '' } = $$props;
    	let { size = '' } = $$props;
    	let { classes = '' } = $$props;
    	let { icon = false } = $$props;
    	let { iconSide = 'right' } = $$props;

    	let { action = () => {
    		return true;
    	} } = $$props;

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('light' in $$props) $$invalidate(1, light = $$props.light);
    		if ('loading' in $$props) $$invalidate(2, loading = $$props.loading);
    		if ('raised' in $$props) $$invalidate(3, raised = $$props.raised);
    		if ('outlined' in $$props) $$invalidate(4, outlined = $$props.outlined);
    		if ('inverted' in $$props) $$invalidate(5, inverted = $$props.inverted);
    		if ('rounded' in $$props) $$invalidate(6, rounded = $$props.rounded);
    		if ('disabled' in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ('state' in $$props) $$invalidate(8, state = $$props.state);
    		if ('type' in $$props) $$invalidate(9, type = $$props.type);
    		if ('color' in $$props) $$invalidate(10, color = $$props.color);
    		if ('size' in $$props) $$invalidate(11, size = $$props.size);
    		if ('classes' in $$props) $$invalidate(12, classes = $$props.classes);
    		if ('icon' in $$props) $$invalidate(13, icon = $$props.icon);
    		if ('iconSide' in $$props) $$invalidate(14, iconSide = $$props.iconSide);
    		if ('action' in $$props) $$invalidate(15, action = $$props.action);
    	};

    	return [
    		title,
    		light,
    		loading,
    		raised,
    		outlined,
    		inverted,
    		rounded,
    		disabled,
    		state,
    		type,
    		color,
    		size,
    		classes,
    		icon,
    		iconSide,
    		action,
    		$LOCALE
    	];
    }

    class Ui_button extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$U, create_fragment$U, safe_not_equal, {
    			title: 0,
    			light: 1,
    			loading: 2,
    			raised: 3,
    			outlined: 4,
    			inverted: 5,
    			rounded: 6,
    			disabled: 7,
    			state: 8,
    			type: 9,
    			color: 10,
    			size: 11,
    			classes: 12,
    			icon: 13,
    			iconSide: 14,
    			action: 15
    		});
    	}
    }

    /* src/elements/button/ui.buttons.row.svelte generated by Svelte v3.46.6 */

    const get_right_slot_changes = dirty => ({});
    const get_right_slot_context = ctx => ({});
    const get_center_slot_changes = dirty => ({});
    const get_center_slot_context = ctx => ({});
    const get_left_slot_changes = dirty => ({});
    const get_left_slot_context = ctx => ({});

    function create_fragment$T(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;
    	const left_slot_template = /*#slots*/ ctx[2].left;
    	const left_slot = create_slot(left_slot_template, ctx, /*$$scope*/ ctx[1], get_left_slot_context);
    	const center_slot_template = /*#slots*/ ctx[2].center;
    	const center_slot = create_slot(center_slot_template, ctx, /*$$scope*/ ctx[1], get_center_slot_context);
    	const right_slot_template = /*#slots*/ ctx[2].right;
    	const right_slot = create_slot(right_slot_template, ctx, /*$$scope*/ ctx[1], get_right_slot_context);

    	return {
    		c() {
    			div = element("div");
    			if (left_slot) left_slot.c();
    			t0 = space();
    			if (center_slot) center_slot.c();
    			t1 = space();
    			if (right_slot) right_slot.c();
    			attr(div, "class", /*classes*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (left_slot) {
    				left_slot.m(div, null);
    			}

    			append(div, t0);

    			if (center_slot) {
    				center_slot.m(div, null);
    			}

    			append(div, t1);

    			if (right_slot) {
    				right_slot.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (left_slot) {
    				if (left_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						left_slot,
    						left_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(left_slot_template, /*$$scope*/ ctx[1], dirty, get_left_slot_changes),
    						get_left_slot_context
    					);
    				}
    			}

    			if (center_slot) {
    				if (center_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						center_slot,
    						center_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(center_slot_template, /*$$scope*/ ctx[1], dirty, get_center_slot_changes),
    						get_center_slot_context
    					);
    				}
    			}

    			if (right_slot) {
    				if (right_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						right_slot,
    						right_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(right_slot_template, /*$$scope*/ ctx[1], dirty, get_right_slot_changes),
    						get_right_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*classes*/ 1) {
    				attr(div, "class", /*classes*/ ctx[0]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(left_slot, local);
    			transition_in(center_slot, local);
    			transition_in(right_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(left_slot, local);
    			transition_out(center_slot, local);
    			transition_out(right_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (left_slot) left_slot.d(detaching);
    			if (center_slot) center_slot.d(detaching);
    			if (right_slot) right_slot.d(detaching);
    		}
    	};
    }

    function instance$T($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { classes = '' } = $$props;

    	$$self.$$set = $$props => {
    		if ('classes' in $$props) $$invalidate(0, classes = $$props.classes);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	return [classes, $$scope, slots];
    }

    class Ui_buttons_row extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$T, create_fragment$T, safe_not_equal, { classes: 0 });
    	}
    }

    /* src/elements/button/ui.buttons.svelte generated by Svelte v3.46.6 */

    function get_each_context$g(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (11:2) {#each values as item (item) }
    function create_each_block$g(key_1, ctx) {
    	let first;
    	let uibutton;
    	let current;
    	const uibutton_spread_levels = [/*item*/ ctx[4]];
    	let uibutton_props = {};

    	for (let i = 0; i < uibutton_spread_levels.length; i += 1) {
    		uibutton_props = assign(uibutton_props, uibutton_spread_levels[i]);
    	}

    	uibutton = new Ui_button({ props: uibutton_props });

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(uibutton.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(uibutton, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			const uibutton_changes = (dirty & /*values*/ 1)
    			? get_spread_update(uibutton_spread_levels, [get_spread_object(/*item*/ ctx[4])])
    			: {};

    			uibutton.$set(uibutton_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uibutton.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uibutton.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(uibutton, detaching);
    		}
    	};
    }

    function create_fragment$S(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_class_value;
    	let current;
    	let each_value = /*values*/ ctx[0];
    	const get_key = ctx => /*item*/ ctx[4];

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$g(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$g(key, child_ctx));
    	}

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", div_class_value = "buttons has-addons " + (/*centered*/ ctx[1] ? 'is-centered' : '') + " " + (/*right*/ ctx[2] ? 'is-right' : '') + " " + /*classes*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*values*/ 1) {
    				each_value = /*values*/ ctx[0];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$g, null, get_each_context$g);
    				check_outros();
    			}

    			if (!current || dirty & /*centered, right, classes*/ 14 && div_class_value !== (div_class_value = "buttons has-addons " + (/*centered*/ ctx[1] ? 'is-centered' : '') + " " + (/*right*/ ctx[2] ? 'is-right' : '') + " " + /*classes*/ ctx[3])) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    function instance$S($$self, $$props, $$invalidate) {
    	let { values = [] } = $$props;
    	let { centered = false } = $$props;
    	let { right = false } = $$props;
    	let { classes = '' } = $$props;

    	$$self.$$set = $$props => {
    		if ('values' in $$props) $$invalidate(0, values = $$props.values);
    		if ('centered' in $$props) $$invalidate(1, centered = $$props.centered);
    		if ('right' in $$props) $$invalidate(2, right = $$props.right);
    		if ('classes' in $$props) $$invalidate(3, classes = $$props.classes);
    	};

    	return [values, centered, right, classes];
    }

    class Ui_buttons extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$S, create_fragment$S, safe_not_equal, {
    			values: 0,
    			centered: 1,
    			right: 2,
    			classes: 3
    		});
    	}
    }

    var index$a = /*#__PURE__*/Object.freeze({
        __proto__: null,
        UIButton: Ui_button,
        UIButtonsRow: Ui_buttons_row,
        UIButtons: Ui_buttons
    });

    /* node_modules/simple-svelte-autocomplete/src/SimpleAutocomplete.svelte generated by Svelte v3.46.6 */

    const get_no_results_slot_changes = dirty => ({
    	noResultsText: dirty[0] & /*noResultsText*/ 2048
    });

    const get_no_results_slot_context = ctx => ({ noResultsText: /*noResultsText*/ ctx[11] });

    const get_create_slot_changes = dirty => ({
    	createText: dirty[0] & /*createText*/ 16384
    });

    const get_create_slot_context = ctx => ({ createText: /*createText*/ ctx[14] });

    const get_loading_slot_changes = dirty => ({
    	loadingText: dirty[0] & /*loadingText*/ 4096
    });

    const get_loading_slot_context = ctx => ({ loadingText: /*loadingText*/ ctx[12] });

    function get_each_context$f(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[116] = list[i];
    	child_ctx[118] = i;
    	return child_ctx;
    }

    const get_item_slot_changes = dirty => ({
    	item: dirty[1] & /*filteredListItems*/ 1,
    	label: dirty[1] & /*filteredListItems*/ 1
    });

    const get_item_slot_context = ctx => ({
    	item: /*listItem*/ ctx[116].item,
    	label: /*listItem*/ ctx[116].highlighted
    	? /*listItem*/ ctx[116].highlighted
    	: /*listItem*/ ctx[116].label
    });

    function get_each_context_1$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[119] = list[i];
    	return child_ctx;
    }

    const get_tag_slot_changes = dirty => ({
    	label: dirty[0] & /*selectedItem*/ 2,
    	item: dirty[0] & /*selectedItem*/ 2
    });

    const get_tag_slot_context = ctx => ({
    	label: /*safeLabelFunction*/ ctx[38](/*tagItem*/ ctx[119]),
    	item: /*tagItem*/ ctx[119],
    	unselectItem: /*unselectItem*/ ctx[45]
    });

    function get_each_context_2$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[118] = list[i];
    	return child_ctx;
    }

    // (1023:39) 
    function create_if_block_12$1(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*selectedItem*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$3(get_each_context_2$3(ctx, each_value_2, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*valueFunction, selectedItem*/ 18 | dirty[1] & /*safeLabelFunction*/ 128) {
    				each_value_2 = /*selectedItem*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$3(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (1021:4) {#if !multiple && value}
    function create_if_block_11$1(ctx) {
    	let option;
    	let t;

    	return {
    		c() {
    			option = element("option");
    			t = text(/*text*/ ctx[3]);
    			option.__value = /*value*/ ctx[2];
    			option.value = option.__value;
    			option.selected = true;
    			attr(option, "class", "svelte-1nqq7zl");
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*text*/ 8) set_data(t, /*text*/ ctx[3]);

    			if (dirty[0] & /*value*/ 4) {
    				option.__value = /*value*/ ctx[2];
    				option.value = option.__value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    // (1024:6) {#each selectedItem as i}
    function create_each_block_2$3(ctx) {
    	let option;
    	let t0_value = /*safeLabelFunction*/ ctx[38](/*i*/ ctx[118]) + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	return {
    		c() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*valueFunction*/ ctx[4](/*i*/ ctx[118], true);
    			option.value = option.__value;
    			option.selected = true;
    			attr(option, "class", "svelte-1nqq7zl");
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t0);
    			append(option, t1);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*selectedItem*/ 2 && t0_value !== (t0_value = /*safeLabelFunction*/ ctx[38](/*i*/ ctx[118]) + "")) set_data(t0, t0_value);

    			if (dirty[0] & /*valueFunction, selectedItem*/ 18 && option_value_value !== (option_value_value = /*valueFunction*/ ctx[4](/*i*/ ctx[118], true))) {
    				option.__value = option_value_value;
    				option.value = option.__value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    // (1032:4) {#if multiple && selectedItem}
    function create_if_block_10$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*selectedItem*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$5(get_each_context_1$5(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*selectedItem*/ 2 | dirty[1] & /*unselectItem, safeLabelFunction*/ 16512 | dirty[2] & /*$$scope*/ 1048576) {
    				each_value_1 = /*selectedItem*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$5(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (1034:90)            
    function fallback_block_4(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*safeLabelFunction*/ ctx[38](/*tagItem*/ ctx[119]) + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = space();
    			attr(span0, "class", "tag svelte-1nqq7zl");
    			attr(span1, "class", "tag is-delete svelte-1nqq7zl");
    			attr(div, "class", "tags has-addons svelte-1nqq7zl");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, span0);
    			append(span0, t0);
    			append(div, t1);
    			append(div, span1);
    			insert(target, t2, anchor);

    			if (!mounted) {
    				dispose = listen(span1, "click", prevent_default(function () {
    					if (is_function(/*unselectItem*/ ctx[45](/*tagItem*/ ctx[119]))) /*unselectItem*/ ctx[45](/*tagItem*/ ctx[119]).apply(this, arguments);
    				}));

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*selectedItem*/ 2 && t0_value !== (t0_value = /*safeLabelFunction*/ ctx[38](/*tagItem*/ ctx[119]) + "")) set_data(t0, t0_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (detaching) detach(t2);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (1033:6) {#each selectedItem as tagItem}
    function create_each_block_1$5(ctx) {
    	let current;
    	const tag_slot_template = /*#slots*/ ctx[83].tag;
    	const tag_slot = create_slot(tag_slot_template, ctx, /*$$scope*/ ctx[82], get_tag_slot_context);
    	const tag_slot_or_fallback = tag_slot || fallback_block_4(ctx);

    	return {
    		c() {
    			if (tag_slot_or_fallback) tag_slot_or_fallback.c();
    		},
    		m(target, anchor) {
    			if (tag_slot_or_fallback) {
    				tag_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (tag_slot) {
    				if (tag_slot.p && (!current || dirty[0] & /*selectedItem*/ 2 | dirty[2] & /*$$scope*/ 1048576)) {
    					update_slot_base(
    						tag_slot,
    						tag_slot_template,
    						ctx,
    						/*$$scope*/ ctx[82],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
    						: get_slot_changes(tag_slot_template, /*$$scope*/ ctx[82], dirty, get_tag_slot_changes),
    						get_tag_slot_context
    					);
    				}
    			} else {
    				if (tag_slot_or_fallback && tag_slot_or_fallback.p && (!current || dirty[0] & /*selectedItem*/ 2)) {
    					tag_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1] : dirty);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(tag_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(tag_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (tag_slot_or_fallback) tag_slot_or_fallback.d(detaching);
    		}
    	};
    }

    // (1065:4) {#if clearable}
    function create_if_block_9$1(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			span = element("span");
    			span.textContent = "✖";
    			attr(span, "class", "autocomplete-clear-button svelte-1nqq7zl");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);

    			if (!mounted) {
    				dispose = listen(span, "click", /*clear*/ ctx[49]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(span);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (1118:28) 
    function create_if_block_8$1(ctx) {
    	let div;
    	let current;
    	const no_results_slot_template = /*#slots*/ ctx[83]["no-results"];
    	const no_results_slot = create_slot(no_results_slot_template, ctx, /*$$scope*/ ctx[82], get_no_results_slot_context);
    	const no_results_slot_or_fallback = no_results_slot || fallback_block_3(ctx);

    	return {
    		c() {
    			div = element("div");
    			if (no_results_slot_or_fallback) no_results_slot_or_fallback.c();
    			attr(div, "class", "autocomplete-list-item-no-results svelte-1nqq7zl");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (no_results_slot_or_fallback) {
    				no_results_slot_or_fallback.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (no_results_slot) {
    				if (no_results_slot.p && (!current || dirty[0] & /*noResultsText*/ 2048 | dirty[2] & /*$$scope*/ 1048576)) {
    					update_slot_base(
    						no_results_slot,
    						no_results_slot_template,
    						ctx,
    						/*$$scope*/ ctx[82],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
    						: get_slot_changes(no_results_slot_template, /*$$scope*/ ctx[82], dirty, get_no_results_slot_changes),
    						get_no_results_slot_context
    					);
    				}
    			} else {
    				if (no_results_slot_or_fallback && no_results_slot_or_fallback.p && (!current || dirty[0] & /*noResultsText*/ 2048)) {
    					no_results_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1] : dirty);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(no_results_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(no_results_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (no_results_slot_or_fallback) no_results_slot_or_fallback.d(detaching);
    		}
    	};
    }

    // (1114:21) 
    function create_if_block_7$3(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const create_slot_template = /*#slots*/ ctx[83].create;
    	const create_slot_1 = create_slot(create_slot_template, ctx, /*$$scope*/ ctx[82], get_create_slot_context);
    	const create_slot_or_fallback = create_slot_1 || fallback_block_2(ctx);

    	return {
    		c() {
    			div = element("div");
    			if (create_slot_or_fallback) create_slot_or_fallback.c();
    			attr(div, "class", "autocomplete-list-item-create svelte-1nqq7zl");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (create_slot_or_fallback) {
    				create_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen(div, "click", /*selectItem*/ ctx[39]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (create_slot_1) {
    				if (create_slot_1.p && (!current || dirty[0] & /*createText*/ 16384 | dirty[2] & /*$$scope*/ 1048576)) {
    					update_slot_base(
    						create_slot_1,
    						create_slot_template,
    						ctx,
    						/*$$scope*/ ctx[82],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
    						: get_slot_changes(create_slot_template, /*$$scope*/ ctx[82], dirty, get_create_slot_changes),
    						get_create_slot_context
    					);
    				}
    			} else {
    				if (create_slot_or_fallback && create_slot_or_fallback.p && (!current || dirty[0] & /*createText*/ 16384)) {
    					create_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1] : dirty);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(create_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(create_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (create_slot_or_fallback) create_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (1110:37) 
    function create_if_block_6$3(ctx) {
    	let div;
    	let current;
    	const loading_slot_template = /*#slots*/ ctx[83].loading;
    	const loading_slot = create_slot(loading_slot_template, ctx, /*$$scope*/ ctx[82], get_loading_slot_context);
    	const loading_slot_or_fallback = loading_slot || fallback_block_1(ctx);

    	return {
    		c() {
    			div = element("div");
    			if (loading_slot_or_fallback) loading_slot_or_fallback.c();
    			attr(div, "class", "autocomplete-list-item-loading svelte-1nqq7zl");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (loading_slot_or_fallback) {
    				loading_slot_or_fallback.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (loading_slot) {
    				if (loading_slot.p && (!current || dirty[0] & /*loadingText*/ 4096 | dirty[2] & /*$$scope*/ 1048576)) {
    					update_slot_base(
    						loading_slot,
    						loading_slot_template,
    						ctx,
    						/*$$scope*/ ctx[82],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
    						: get_slot_changes(loading_slot_template, /*$$scope*/ ctx[82], dirty, get_loading_slot_changes),
    						get_loading_slot_context
    					);
    				}
    			} else {
    				if (loading_slot_or_fallback && loading_slot_or_fallback.p && (!current || dirty[0] & /*loadingText*/ 4096)) {
    					loading_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1] : dirty);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(loading_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(loading_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (loading_slot_or_fallback) loading_slot_or_fallback.d(detaching);
    		}
    	};
    }

    // (1074:4) {#if filteredListItems && filteredListItems.length > 0}
    function create_if_block$A(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	let each_value = /*filteredListItems*/ ctx[31];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$f(get_each_context$f(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*maxItemsToShowInList*/ ctx[5] > 0 && /*filteredListItems*/ ctx[31].length > /*maxItemsToShowInList*/ ctx[5] && create_if_block_1$s(ctx);

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*highlightIndex, maxItemsToShowInList*/ 1073741856 | dirty[1] & /*isConfirmed, filteredListItems, onListItemClick*/ 524801 | dirty[2] & /*$$scope*/ 1048576) {
    				each_value = /*filteredListItems*/ ctx[31];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$f(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$f(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*maxItemsToShowInList*/ ctx[5] > 0 && /*filteredListItems*/ ctx[31].length > /*maxItemsToShowInList*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$s(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (1120:48) {noResultsText}
    function fallback_block_3(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*noResultsText*/ ctx[11]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*noResultsText*/ 2048) set_data(t, /*noResultsText*/ ctx[11]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (1116:41) {createText}
    function fallback_block_2(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*createText*/ ctx[14]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*createText*/ 16384) set_data(t, /*createText*/ ctx[14]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (1112:43) {loadingText}
    function fallback_block_1(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*loadingText*/ ctx[12]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*loadingText*/ 4096) set_data(t, /*loadingText*/ ctx[12]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (1076:8) {#if listItem && (maxItemsToShowInList <= 0 || i < maxItemsToShowInList)}
    function create_if_block_3$h(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*listItem*/ ctx[116] && create_if_block_4$e(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*listItem*/ ctx[116]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[1] & /*filteredListItems*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_4$e(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (1077:10) {#if listItem}
    function create_if_block_4$e(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const item_slot_template = /*#slots*/ ctx[83].item;
    	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[82], get_item_slot_context);
    	const item_slot_or_fallback = item_slot || fallback_block(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[86](/*listItem*/ ctx[116]);
    	}

    	function pointerenter_handler() {
    		return /*pointerenter_handler*/ ctx[87](/*i*/ ctx[118]);
    	}

    	return {
    		c() {
    			div = element("div");
    			if (item_slot_or_fallback) item_slot_or_fallback.c();

    			attr(div, "class", div_class_value = "autocomplete-list-item " + (/*i*/ ctx[118] === /*highlightIndex*/ ctx[30]
    			? 'selected'
    			: '') + " svelte-1nqq7zl");

    			toggle_class(div, "confirmed", /*isConfirmed*/ ctx[50](/*listItem*/ ctx[116].item));
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (item_slot_or_fallback) {
    				item_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(div, "click", click_handler),
    					listen(div, "pointerenter", pointerenter_handler)
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (item_slot) {
    				if (item_slot.p && (!current || dirty[1] & /*filteredListItems*/ 1 | dirty[2] & /*$$scope*/ 1048576)) {
    					update_slot_base(
    						item_slot,
    						item_slot_template,
    						ctx,
    						/*$$scope*/ ctx[82],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
    						: get_slot_changes(item_slot_template, /*$$scope*/ ctx[82], dirty, get_item_slot_changes),
    						get_item_slot_context
    					);
    				}
    			} else {
    				if (item_slot_or_fallback && item_slot_or_fallback.p && (!current || dirty[1] & /*filteredListItems*/ 1)) {
    					item_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1] : dirty);
    				}
    			}

    			if (!current || dirty[0] & /*highlightIndex*/ 1073741824 && div_class_value !== (div_class_value = "autocomplete-list-item " + (/*i*/ ctx[118] === /*highlightIndex*/ ctx[30]
    			? 'selected'
    			: '') + " svelte-1nqq7zl")) {
    				attr(div, "class", div_class_value);
    			}

    			if (dirty[0] & /*highlightIndex*/ 1073741824 | dirty[1] & /*isConfirmed, filteredListItems*/ 524289) {
    				toggle_class(div, "confirmed", /*isConfirmed*/ ctx[50](/*listItem*/ ctx[116].item));
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(item_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(item_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (item_slot_or_fallback) item_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (1093:16) {:else}
    function create_else_block$s(ctx) {
    	let html_tag;
    	let raw_value = /*listItem*/ ctx[116].label + "";
    	let html_anchor;

    	return {
    		c() {
    			html_tag = new HtmlTag();
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert(target, html_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[1] & /*filteredListItems*/ 1 && raw_value !== (raw_value = /*listItem*/ ctx[116].label + "")) html_tag.p(raw_value);
    		},
    		d(detaching) {
    			if (detaching) detach(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};
    }

    // (1091:16) {#if listItem.highlighted}
    function create_if_block_5$6(ctx) {
    	let html_tag;
    	let raw_value = /*listItem*/ ctx[116].highlighted + "";
    	let html_anchor;

    	return {
    		c() {
    			html_tag = new HtmlTag();
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert(target, html_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[1] & /*filteredListItems*/ 1 && raw_value !== (raw_value = /*listItem*/ ctx[116].highlighted + "")) html_tag.p(raw_value);
    		},
    		d(detaching) {
    			if (detaching) detach(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};
    }

    // (1090:15)                  
    function fallback_block(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*listItem*/ ctx[116].highlighted) return create_if_block_5$6;
    		return create_else_block$s;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (1075:6) {#each filteredListItems as listItem, i}
    function create_each_block$f(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*listItem*/ ctx[116] && (/*maxItemsToShowInList*/ ctx[5] <= 0 || /*i*/ ctx[118] < /*maxItemsToShowInList*/ ctx[5]) && create_if_block_3$h(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*listItem*/ ctx[116] && (/*maxItemsToShowInList*/ ctx[5] <= 0 || /*i*/ ctx[118] < /*maxItemsToShowInList*/ ctx[5])) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*maxItemsToShowInList*/ 32 | dirty[1] & /*filteredListItems*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_3$h(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (1102:6) {#if maxItemsToShowInList > 0 && filteredListItems.length > maxItemsToShowInList}
    function create_if_block_1$s(ctx) {
    	let if_block_anchor;
    	let if_block = /*moreItemsText*/ ctx[13] && create_if_block_2$j(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (/*moreItemsText*/ ctx[13]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$j(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (1103:8) {#if moreItemsText}
    function create_if_block_2$j(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*filteredListItems*/ ctx[31].length - /*maxItemsToShowInList*/ ctx[5] + "";
    	let t1;
    	let t2;
    	let t3;

    	return {
    		c() {
    			div = element("div");
    			t0 = text("...");
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(/*moreItemsText*/ ctx[13]);
    			attr(div, "class", "autocomplete-list-item-no-results svelte-1nqq7zl");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t0);
    			append(div, t1);
    			append(div, t2);
    			append(div, t3);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*maxItemsToShowInList*/ 32 | dirty[1] & /*filteredListItems*/ 1 && t1_value !== (t1_value = /*filteredListItems*/ ctx[31].length - /*maxItemsToShowInList*/ ctx[5] + "")) set_data(t1, t1_value);
    			if (dirty[0] & /*moreItemsText*/ 8192) set_data(t3, /*moreItemsText*/ ctx[13]);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    function create_fragment$R(ctx) {
    	let div2;
    	let select;
    	let t0;
    	let div0;
    	let t1;
    	let input_1;
    	let input_1_class_value;
    	let input_1_id_value;
    	let input_1_autocomplete_value;
    	let input_1_readonly_value;
    	let t2;
    	let t3;
    	let div1;
    	let current_block_type_index;
    	let if_block3;
    	let div1_class_value;
    	let div2_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*multiple*/ ctx[6] && /*value*/ ctx[2]) return create_if_block_11$1;
    		if (/*multiple*/ ctx[6] && /*selectedItem*/ ctx[1]) return create_if_block_12$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	let if_block1 = /*multiple*/ ctx[6] && /*selectedItem*/ ctx[1] && create_if_block_10$1(ctx);
    	let if_block2 = /*clearable*/ ctx[35] && create_if_block_9$1(ctx);
    	const if_block_creators = [create_if_block$A, create_if_block_6$3, create_if_block_7$3, create_if_block_8$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*filteredListItems*/ ctx[31] && /*filteredListItems*/ ctx[31].length > 0) return 0;
    		if (/*loading*/ ctx[34] && /*loadingText*/ ctx[12]) return 1;
    		if (/*create*/ ctx[7]) return 2;
    		if (/*noResultsText*/ ctx[11]) return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block3 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	return {
    		c() {
    			div2 = element("div");
    			select = element("select");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			input_1 = element("input");
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			div1 = element("div");
    			if (if_block3) if_block3.c();
    			attr(select, "name", /*selectName*/ ctx[20]);
    			attr(select, "id", /*selectId*/ ctx[21]);
    			select.multiple = /*multiple*/ ctx[6];
    			attr(select, "class", "svelte-1nqq7zl");
    			attr(input_1, "type", "text");

    			attr(input_1, "class", input_1_class_value = "" + ((/*inputClassName*/ ctx[17]
    			? /*inputClassName*/ ctx[17]
    			: '') + " " + (/*noInputStyles*/ ctx[27]
    			? ''
    			: 'input autocomplete-input') + " svelte-1nqq7zl"));

    			attr(input_1, "id", input_1_id_value = /*inputId*/ ctx[18] ? /*inputId*/ ctx[18] : "");
    			attr(input_1, "autocomplete", input_1_autocomplete_value = /*html5autocomplete*/ ctx[23] ? "on" : "off");
    			attr(input_1, "placeholder", /*placeholder*/ ctx[15]);
    			attr(input_1, "name", /*name*/ ctx[19]);
    			input_1.disabled = /*disabled*/ ctx[26];
    			input_1.required = /*required*/ ctx[28];
    			attr(input_1, "title", /*title*/ ctx[22]);
    			input_1.readOnly = input_1_readonly_value = /*readonly*/ ctx[24] || /*lock*/ ctx[8] && /*selectedItem*/ ctx[1];
    			attr(input_1, "tabindex", /*tabindex*/ ctx[29]);
    			attr(div0, "class", "input-container svelte-1nqq7zl");

    			attr(div1, "class", div1_class_value = "" + ((/*dropdownClassName*/ ctx[25]
    			? /*dropdownClassName*/ ctx[25]
    			: '') + " autocomplete-list " + (/*showList*/ ctx[36] ? '' : 'hidden') + " is-fullwidth" + " svelte-1nqq7zl"));

    			attr(div2, "class", div2_class_value = "" + ((/*className*/ ctx[16] ? /*className*/ ctx[16] : '') + " " + (/*hideArrow*/ ctx[9] || !/*items*/ ctx[0].length
    			? 'hide-arrow'
    			: '') + " " + (/*multiple*/ ctx[6] ? 'is-multiple' : '') + " autocomplete select is-fullwidth " + /*uniqueId*/ ctx[37] + " svelte-1nqq7zl"));

    			toggle_class(div2, "show-clear", /*clearable*/ ctx[35]);
    			toggle_class(div2, "is-loading", /*showLoadingIndicator*/ ctx[10] && /*loading*/ ctx[34]);
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, select);
    			if (if_block0) if_block0.m(select, null);
    			append(div2, t0);
    			append(div2, div0);
    			if (if_block1) if_block1.m(div0, null);
    			append(div0, t1);
    			append(div0, input_1);
    			/*input_1_binding*/ ctx[84](input_1);
    			set_input_value(input_1, /*text*/ ctx[3]);
    			append(div0, t2);
    			if (if_block2) if_block2.m(div0, null);
    			append(div2, t3);
    			append(div2, div1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div1, null);
    			}

    			/*div1_binding*/ ctx[88](div1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(window, "click", /*onDocumentClick*/ ctx[41]),
    					listen(input_1, "input", /*input_1_input_handler*/ ctx[85]),
    					listen(input_1, "input", /*onInput*/ ctx[44]),
    					listen(input_1, "focus", /*onFocusInternal*/ ctx[47]),
    					listen(input_1, "blur", /*onBlurInternal*/ ctx[48]),
    					listen(input_1, "keydown", /*onKeyDown*/ ctx[42]),
    					listen(input_1, "click", /*onInputClick*/ ctx[46]),
    					listen(input_1, "keypress", /*onKeyPress*/ ctx[43])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(select, null);
    				}
    			}

    			if (!current || dirty[0] & /*selectName*/ 1048576) {
    				attr(select, "name", /*selectName*/ ctx[20]);
    			}

    			if (!current || dirty[0] & /*selectId*/ 2097152) {
    				attr(select, "id", /*selectId*/ ctx[21]);
    			}

    			if (!current || dirty[0] & /*multiple*/ 64) {
    				select.multiple = /*multiple*/ ctx[6];
    			}

    			if (/*multiple*/ ctx[6] && /*selectedItem*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*multiple, selectedItem*/ 66) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_10$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*inputClassName, noInputStyles*/ 134348800 && input_1_class_value !== (input_1_class_value = "" + ((/*inputClassName*/ ctx[17]
    			? /*inputClassName*/ ctx[17]
    			: '') + " " + (/*noInputStyles*/ ctx[27]
    			? ''
    			: 'input autocomplete-input') + " svelte-1nqq7zl"))) {
    				attr(input_1, "class", input_1_class_value);
    			}

    			if (!current || dirty[0] & /*inputId*/ 262144 && input_1_id_value !== (input_1_id_value = /*inputId*/ ctx[18] ? /*inputId*/ ctx[18] : "")) {
    				attr(input_1, "id", input_1_id_value);
    			}

    			if (!current || dirty[0] & /*html5autocomplete*/ 8388608 && input_1_autocomplete_value !== (input_1_autocomplete_value = /*html5autocomplete*/ ctx[23] ? "on" : "off")) {
    				attr(input_1, "autocomplete", input_1_autocomplete_value);
    			}

    			if (!current || dirty[0] & /*placeholder*/ 32768) {
    				attr(input_1, "placeholder", /*placeholder*/ ctx[15]);
    			}

    			if (!current || dirty[0] & /*name*/ 524288) {
    				attr(input_1, "name", /*name*/ ctx[19]);
    			}

    			if (!current || dirty[0] & /*disabled*/ 67108864) {
    				input_1.disabled = /*disabled*/ ctx[26];
    			}

    			if (!current || dirty[0] & /*required*/ 268435456) {
    				input_1.required = /*required*/ ctx[28];
    			}

    			if (!current || dirty[0] & /*title*/ 4194304) {
    				attr(input_1, "title", /*title*/ ctx[22]);
    			}

    			if (!current || dirty[0] & /*readonly, lock, selectedItem*/ 16777474 && input_1_readonly_value !== (input_1_readonly_value = /*readonly*/ ctx[24] || /*lock*/ ctx[8] && /*selectedItem*/ ctx[1])) {
    				input_1.readOnly = input_1_readonly_value;
    			}

    			if (!current || dirty[0] & /*tabindex*/ 536870912) {
    				attr(input_1, "tabindex", /*tabindex*/ ctx[29]);
    			}

    			if (dirty[0] & /*text*/ 8 && input_1.value !== /*text*/ ctx[3]) {
    				set_input_value(input_1, /*text*/ ctx[3]);
    			}

    			if (/*clearable*/ ctx[35]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_9$1(ctx);
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block3) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block3 = if_blocks[current_block_type_index];

    					if (!if_block3) {
    						if_block3 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block3.c();
    					} else {
    						if_block3.p(ctx, dirty);
    					}

    					transition_in(if_block3, 1);
    					if_block3.m(div1, null);
    				} else {
    					if_block3 = null;
    				}
    			}

    			if (!current || dirty[0] & /*dropdownClassName*/ 33554432 | dirty[1] & /*showList*/ 32 && div1_class_value !== (div1_class_value = "" + ((/*dropdownClassName*/ ctx[25]
    			? /*dropdownClassName*/ ctx[25]
    			: '') + " autocomplete-list " + (/*showList*/ ctx[36] ? '' : 'hidden') + " is-fullwidth" + " svelte-1nqq7zl"))) {
    				attr(div1, "class", div1_class_value);
    			}

    			if (!current || dirty[0] & /*className, hideArrow, items, multiple*/ 66113 && div2_class_value !== (div2_class_value = "" + ((/*className*/ ctx[16] ? /*className*/ ctx[16] : '') + " " + (/*hideArrow*/ ctx[9] || !/*items*/ ctx[0].length
    			? 'hide-arrow'
    			: '') + " " + (/*multiple*/ ctx[6] ? 'is-multiple' : '') + " autocomplete select is-fullwidth " + /*uniqueId*/ ctx[37] + " svelte-1nqq7zl"))) {
    				attr(div2, "class", div2_class_value);
    			}

    			if (dirty[0] & /*className, hideArrow, items, multiple*/ 66113 | dirty[1] & /*clearable*/ 16) {
    				toggle_class(div2, "show-clear", /*clearable*/ ctx[35]);
    			}

    			if (dirty[0] & /*className, hideArrow, items, multiple, showLoadingIndicator*/ 67137 | dirty[1] & /*loading*/ 8) {
    				toggle_class(div2, "is-loading", /*showLoadingIndicator*/ ctx[10] && /*loading*/ ctx[34]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(if_block3);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block1);
    			transition_out(if_block3);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);

    			if (if_block0) {
    				if_block0.d();
    			}

    			if (if_block1) if_block1.d();
    			/*input_1_binding*/ ctx[84](null);
    			if (if_block2) if_block2.d();

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			/*div1_binding*/ ctx[88](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function safeFunction(theFunction, argument) {
    	if (typeof theFunction !== "function") {
    		console.error("Not a function: " + theFunction + ", argument: " + argument);
    		return undefined;
    	}

    	let result;

    	try {
    		result = theFunction(argument);
    	} catch(error) {
    		console.warn("Error executing Autocomplete function on value: " + argument + " function: " + theFunction);
    	}

    	return result;
    }

    function safeStringFunction(theFunction, argument) {
    	let result = safeFunction(theFunction, argument);

    	if (result === undefined || result === null) {
    		result = "";
    	}

    	if (typeof result !== "string") {
    		result = result.toString();
    	}

    	return result;
    }

    function numberOfMatches(listItem, searchWords) {
    	if (!listItem) {
    		return 0;
    	}

    	const itemKeywords = listItem.keywords;
    	let matches = 0;

    	searchWords.forEach(searchWord => {
    		if (itemKeywords.includes(searchWord)) {
    			matches++;
    		}
    	});

    	return matches;
    }

    function defaultItemSortFunction(obj1, obj2, searchWords) {
    	return numberOfMatches(obj2, searchWords) - numberOfMatches(obj1, searchWords);
    }

    function removeAccents(str) {
    	return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function instance$R($$self, $$props, $$invalidate) {
    	let showList;
    	let clearable;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { items = [] } = $$props;
    	let { searchFunction = false } = $$props;
    	let { labelFieldName = undefined } = $$props;
    	let { keywordsFieldName = labelFieldName } = $$props;
    	let { valueFieldName = undefined } = $$props;

    	let { labelFunction = function (item) {
    		if (item === undefined || item === null) {
    			return "";
    		}

    		return labelFieldName ? item[labelFieldName] : item;
    	} } = $$props;

    	let { keywordsFunction = function (item) {
    		if (item === undefined || item === null) {
    			return "";
    		}

    		return keywordsFieldName
    		? item[keywordsFieldName]
    		: labelFunction(item);
    	} } = $$props;

    	let { valueFunction = function (item, forceSingle = false) {
    		if (item === undefined || item === null) {
    			return item;
    		}

    		if (!multiple || forceSingle) {
    			return valueFieldName ? item[valueFieldName] : item;
    		} else {
    			return item.map(i => valueFieldName ? i[valueFieldName] : i);
    		}
    	} } = $$props;

    	let { keywordsCleanFunction = function (keywords) {
    		return keywords;
    	} } = $$props;

    	let { textCleanFunction = function (userEnteredText) {
    		return userEnteredText;
    	} } = $$props;

    	let { beforeChange = function (oldSelectedItem, newSelectedItem) {
    		return true;
    	} } = $$props;

    	let { onChange = function (newSelectedItem) {
    		
    	} } = $$props;

    	let { onFocus = function () {
    		
    	} } = $$props;

    	let { onBlur = function () {
    		
    	} } = $$props;

    	let { onCreate = function (text) {
    		if (debug) {
    			console.log("onCreate: " + text);
    		}
    	} } = $$props;

    	let { selectFirstIfEmpty = false } = $$props;
    	let { minCharactersToSearch = 1 } = $$props;
    	let { maxItemsToShowInList = 0 } = $$props;
    	let { multiple = false } = $$props;
    	let { create = false } = $$props;
    	let { ignoreAccents = true } = $$props;
    	let { matchAllKeywords = true } = $$props;
    	let { sortByMatchedKeywords = false } = $$props;
    	let { itemFilterFunction = undefined } = $$props;
    	let { itemSortFunction = undefined } = $$props;
    	let { lock = false } = $$props;
    	let { delay = 0 } = $$props;
    	let { localFiltering = true } = $$props;
    	let { localSorting = true } = $$props;
    	let { cleanUserText = true } = $$props;
    	let { closeOnBlur = false } = $$props;
    	let { hideArrow = false } = $$props;
    	let { showClear = false } = $$props;
    	let { showLoadingIndicator = false } = $$props;
    	let { noResultsText = "No results found" } = $$props;
    	let { loadingText = "Loading results..." } = $$props;
    	let { moreItemsText = "items not shown" } = $$props;
    	let { createText = "Not found, add anyway?" } = $$props;
    	let { placeholder = undefined } = $$props;
    	let { className = undefined } = $$props;
    	let { inputClassName = undefined } = $$props;
    	let { inputId = undefined } = $$props;
    	let { name = undefined } = $$props;
    	let { selectName = undefined } = $$props;
    	let { selectId = undefined } = $$props;
    	let { title = undefined } = $$props;
    	let { html5autocomplete = undefined } = $$props;
    	let { readonly = undefined } = $$props;
    	let { dropdownClassName = undefined } = $$props;
    	let { disabled = false } = $$props;
    	let { noInputStyles = false } = $$props;
    	let { required = null } = $$props;
    	let { debug = false } = $$props;
    	let { tabindex = 0 } = $$props;
    	let { selectedItem = multiple ? [] : undefined } = $$props;
    	let { value = undefined } = $$props;
    	let { highlightedItem = undefined } = $$props;

    	// --- Internal State ----
    	const uniqueId = "sautocomplete-" + Math.floor(Math.random() * 1000);

    	// HTML elements
    	let input;

    	let list;

    	// UI state
    	let opened = false;

    	let loading = false;
    	let highlightIndex = -1;
    	let { text } = $$props;
    	let filteredTextLength = 0;

    	// view model
    	let filteredListItems;

    	let listItems = [];

    	// requests/responses counters
    	let lastRequestId = 0;

    	let lastResponseId = 0;

    	// other state
    	let inputDelayTimeout;

    	function safeLabelFunction(item) {
    		// console.log("labelFunction: " + labelFunction);
    		// console.log("safeLabelFunction, item: " + item);
    		return safeStringFunction(labelFunction, item);
    	}

    	function safeKeywordsFunction(item) {
    		// console.log("safeKeywordsFunction");
    		const keywords = safeStringFunction(keywordsFunction, item);

    		let result = safeStringFunction(keywordsCleanFunction, keywords);
    		result = result.toLowerCase().trim();

    		if (ignoreAccents) {
    			result = removeAccents(result);
    		}

    		if (debug) {
    			console.log("Extracted keywords: '" + result + "' from item: " + JSON.stringify(item));
    		}

    		return result;
    	}

    	function prepareListItems() {
    		let timerId;

    		if (debug) {
    			timerId = `Autocomplete prepare list ${inputId ? `(id: ${inputId})` : ""}`;
    			console.time(timerId);
    			console.log("Prepare items to search");
    			console.log("items: " + JSON.stringify(items));
    		}

    		if (!Array.isArray(items)) {
    			console.warn("Autocomplete items / search function did not return array but", items);
    			$$invalidate(0, items = []);
    		}

    		const length = items ? items.length : 0;
    		listItems = new Array(length);

    		if (length > 0) {
    			items.forEach((item, i) => {
    				const listItem = getListItem(item);

    				if (listItem === undefined) {
    					console.log("Undefined item for: ", item);
    				}

    				listItems[i] = listItem;
    			});
    		}

    		$$invalidate(31, filteredListItems = listItems);

    		if (debug) {
    			console.log(listItems.length + " items to search");
    			console.timeEnd(timerId);
    		}
    	}

    	function getListItem(item) {
    		return {
    			// keywords representation of the item
    			keywords: localFiltering ? safeKeywordsFunction(item) : [],
    			// item label
    			label: safeLabelFunction(item),
    			// store reference to the origial item
    			item
    		};
    	}

    	function onSelectedItemChanged() {
    		$$invalidate(2, value = valueFunction(selectedItem));
    		$$invalidate(3, text = !multiple ? safeLabelFunction(selectedItem) : "");
    		$$invalidate(31, filteredListItems = listItems);
    		onChange(selectedItem);
    	}

    	function prepareUserEnteredText(userEnteredText) {
    		if (userEnteredText === undefined || userEnteredText === null) {
    			return "";
    		}

    		if (!cleanUserText) {
    			return userEnteredText;
    		}

    		const textFiltered = userEnteredText.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, " ").trim();
    		const cleanUserEnteredText = safeStringFunction(textCleanFunction, textFiltered);
    		const textFilteredLowerCase = cleanUserEnteredText.toLowerCase().trim();
    		return textFilteredLowerCase;
    	}

    	async function search() {
    		let timerId;

    		if (debug) {
    			timerId = `Autocomplete search ${inputId ? `(id: ${inputId})` : ""}`;
    			console.time(timerId);
    			console.log("Searching user entered text: '" + text + "'");
    		}

    		let textFiltered = prepareUserEnteredText(text);

    		if (minCharactersToSearch > 1 && textFiltered.length < minCharactersToSearch) {
    			textFiltered = "";
    		}

    		$$invalidate(81, filteredTextLength = textFiltered.length);

    		if (debug) {
    			console.log("Changed user entered text '" + text + "' into '" + textFiltered + "'");
    		}

    		// if no search text load all items
    		if (textFiltered === "") {
    			if (searchFunction) {
    				// we will need to rerun the search
    				$$invalidate(0, items = []);

    				if (debug) {
    					console.log("User entered text is empty clear list of items");
    				}
    			} else {
    				$$invalidate(31, filteredListItems = listItems);

    				if (debug) {
    					console.log("User entered text is empty set the list of items to all items");
    				}
    			}

    			closeIfMinCharsToSearchReached();

    			if (debug) {
    				console.timeEnd(timerId);
    			}

    			return;
    		}

    		if (!searchFunction) {
    			// internal search
    			processListItems(textFiltered);
    		} else {
    			// external search which provides items
    			lastRequestId = lastRequestId + 1;

    			const currentRequestId = lastRequestId;
    			$$invalidate(34, loading = true);

    			// searchFunction is a generator
    			if (searchFunction.constructor.name === "AsyncGeneratorFunction") {
    				for await (const chunk of searchFunction(textFiltered)) {
    					// a chunk of an old response: throw it away
    					if (currentRequestId < lastResponseId) {
    						return false;
    					}

    					// a chunk for a new response: reset the item list
    					if (currentRequestId > lastResponseId) {
    						$$invalidate(0, items = []);
    					}

    					lastResponseId = currentRequestId;
    					$$invalidate(0, items = [...items, ...chunk]);
    					processListItems(textFiltered);
    				}

    				// there was nothing in the chunk
    				if (lastResponseId < currentRequestId) {
    					lastResponseId = currentRequestId;
    					$$invalidate(0, items = []);
    					processListItems(textFiltered);
    				}
    			} else // searchFunction is a regular function
    			{
    				let result = await searchFunction(textFiltered);

    				// If a response to a newer request has been received
    				// while responses to this request were being loaded,
    				// then we can just throw away this outdated results.
    				if (currentRequestId < lastResponseId) {
    					return false;
    				}

    				lastResponseId = currentRequestId;
    				$$invalidate(0, items = result);
    				processListItems(textFiltered);
    			}

    			$$invalidate(34, loading = false);
    		}

    		if (debug) {
    			console.timeEnd(timerId);
    			console.log("Search found " + filteredListItems.length + " items");
    		}
    	}

    	function defaultItemFilterFunction(listItem, searchWords) {
    		const matches = numberOfMatches(listItem, searchWords);

    		if (matchAllKeywords) {
    			return matches >= searchWords.length;
    		} else {
    			return matches > 0;
    		}
    	}

    	function processListItems(textFiltered) {
    		// cleans, filters, orders, and highlights the list items
    		prepareListItems();

    		const textFilteredWithoutAccents = ignoreAccents
    		? removeAccents(textFiltered)
    		: textFiltered;

    		const searchWords = textFilteredWithoutAccents.split(/\s+/g);

    		// local search
    		let tempfilteredListItems;

    		if (localFiltering) {
    			if (itemFilterFunction) {
    				tempfilteredListItems = listItems.filter(item => itemFilterFunction(item.item, searchWords));
    			} else {
    				tempfilteredListItems = listItems.filter(item => defaultItemFilterFunction(item, searchWords));
    			}

    			if (localSorting) {
    				if (itemSortFunction) {
    					tempfilteredListItems = tempfilteredListItems.sort((item1, item2) => itemSortFunction(item1.item, item2.item, searchWords));
    				} else {
    					if (sortByMatchedKeywords) {
    						tempfilteredListItems = tempfilteredListItems.sort((item1, item2) => defaultItemSortFunction(item1, item2, searchWords));
    					}
    				}
    			}
    		} else {
    			tempfilteredListItems = listItems;
    		}

    		const hlfilter = highlightFilter(searchWords, "label");
    		$$invalidate(31, filteredListItems = tempfilteredListItems.map(hlfilter));
    		closeIfMinCharsToSearchReached();
    		return true;
    	}

    	// $: text, search();
    	function afterCreate(createdItem) {
    		let listItem;

    		if (debug) {
    			console.log("createdItem", createdItem);
    		}

    		if ("undefined" !== typeof createdItem) {
    			prepareListItems();
    			$$invalidate(31, filteredListItems = listItems);
    			let index = findItemIndex(createdItem, filteredListItems);

    			// if the items array was not updated, add the created item manually
    			if (index <= 0) {
    				$$invalidate(0, items = [createdItem]);
    				prepareListItems();
    				$$invalidate(31, filteredListItems = listItems);
    				index = 0;
    			}

    			if (index >= 0) {
    				$$invalidate(30, highlightIndex = index);
    				listItem = filteredListItems[highlightIndex];
    			}
    		}

    		return listItem;
    	}

    	function selectListItem(listItem) {
    		if (debug) {
    			console.log("selectListItem", listItem);
    		}

    		if ("undefined" === typeof listItem && create) {
    			// allow undefined items if create is enabled
    			const createdItem = onCreate(text);

    			if ("undefined" !== typeof createdItem) {
    				if (typeof createdItem.then === "function") {
    					createdItem.then(newItem => {
    						if ("undefined" !== typeof newItem) {
    							const newListItem = afterCreate(newItem);

    							if ("undefined" !== typeof newListItem) {
    								selectListItem(newListItem);
    							}
    						}
    					});

    					return true;
    				} else {
    					listItem = afterCreate(createdItem);
    				}
    			}
    		}

    		if ("undefined" === typeof listItem) {
    			if (debug) {
    				console.log(`listItem is undefined. Can not select.`);
    			}

    			return false;
    		}

    		if (lock && selectedItem) {
    			return true;
    		}

    		const newSelectedItem = listItem.item;

    		if (beforeChange(selectedItem, newSelectedItem)) {
    			// simple selection
    			if (!multiple) {
    				$$invalidate(1, selectedItem = undefined); // triggers change even if the the same item is selected
    				$$invalidate(1, selectedItem = newSelectedItem);
    			} else // first selection of multiple ones
    			if (!selectedItem) {
    				$$invalidate(1, selectedItem = [newSelectedItem]);
    			} else // selecting something already selected => unselect it
    			if (selectedItem.includes(newSelectedItem)) {
    				$$invalidate(1, selectedItem = selectedItem.filter(i => i !== newSelectedItem));
    			} else // adds the element to the selection
    			{
    				$$invalidate(1, selectedItem = [...selectedItem, newSelectedItem]);
    			}
    		}

    		return true;
    	}

    	function selectItem() {
    		if (debug) {
    			console.log("selectItem", highlightIndex);
    		}

    		const listItem = filteredListItems[highlightIndex];

    		if (selectListItem(listItem)) {
    			if (debug) {
    				console.log("selectListItem true, closing");
    			}

    			close();

    			if (multiple) {
    				input.focus();
    			}
    		} else {
    			if (debug) {
    				console.log("selectListItem false, not closing");
    			}
    		}
    	}

    	function up() {
    		if (debug) {
    			console.log("up");
    		}

    		open();

    		if (highlightIndex > 0) {
    			$$invalidate(30, highlightIndex--, highlightIndex);
    		}

    		highlight();
    	}

    	function down() {
    		if (debug) {
    			console.log("down");
    		}

    		open();

    		if (highlightIndex < filteredListItems.length - 1) {
    			$$invalidate(30, highlightIndex++, highlightIndex);
    		}

    		highlight();
    	}

    	function highlight() {
    		if (debug) {
    			console.log("highlight");
    		}

    		const query = ".selected";

    		if (debug) {
    			console.log("Seaching DOM element: " + query + " in " + list);
    		}

    		/**
     * @param {Element} el
     */
    		const el = list && list.querySelector(query);

    		if (el) {
    			if (typeof el.scrollIntoViewIfNeeded === "function") {
    				if (debug) {
    					console.log("Scrolling selected item into view");
    				}

    				el.scrollIntoViewIfNeeded();
    			} else if (el.scrollIntoView === "function") {
    				if (debug) {
    					console.log("Scrolling selected item into view");
    				}

    				el.scrollIntoView();
    			} else {
    				if (debug) {
    					console.warn("Could not scroll selected item into view, scrollIntoViewIfNeeded not supported");
    				}
    			}
    		} else {
    			if (debug) {
    				console.warn("Selected item not found to scroll into view");
    			}
    		}
    	}

    	function onListItemClick(listItem) {
    		if (debug) {
    			console.log("onListItemClick");
    		}

    		if (selectListItem(listItem)) {
    			close();

    			if (multiple) {
    				input.focus();
    			}
    		}
    	}

    	function onDocumentClick(e) {
    		if (debug) {
    			console.log("onDocumentClick");
    		}

    		if (e.composedPath().some(path => path.classList && path.classList.contains(uniqueId))) {
    			if (debug) {
    				console.log("onDocumentClick inside");
    			}

    			// resetListToAllItemsAndOpen();
    			highlight();
    		} else {
    			if (debug) {
    				console.log("onDocumentClick outside");
    			}

    			close();
    		}
    	}

    	function onKeyDown(e) {
    		if (debug) {
    			console.log("onKeyDown");
    		}

    		let key = e.key;
    		if (key === "Tab" && e.shiftKey) key = "ShiftTab";

    		const fnmap = {
    			Tab: opened ? close() : null,
    			ShiftTab: opened ? close() : null,
    			ArrowDown: down.bind(this),
    			ArrowUp: up.bind(this),
    			Escape: onEsc.bind(this),
    			Backspace: multiple && selectedItem && selectedItem.length && !text
    			? onBackspace.bind(this)
    			: null
    		};

    		const fn = fnmap[key];

    		if (typeof fn === "function") {
    			fn(e);
    		}
    	}

    	function onKeyPress(e) {
    		if (debug) {
    			console.log("onKeyPress");
    		}

    		if (e.key === "Enter") {
    			e.preventDefault();
    			onEnter();
    		}
    	}

    	function onEnter() {
    		selectItem();
    	}

    	function onInput(e) {
    		if (debug) {
    			console.log("onInput");
    		}

    		$$invalidate(3, text = e.target.value);

    		if (inputDelayTimeout) {
    			clearTimeout(inputDelayTimeout);
    		}

    		if (delay) {
    			inputDelayTimeout = setTimeout(processInput, delay);
    		} else {
    			processInput();
    		}
    	}

    	function unselectItem(tag) {
    		if (debug) {
    			console.log("unselectItem", tag);
    		}

    		$$invalidate(1, selectedItem = selectedItem.filter(i => i !== tag));
    		input.focus();
    	}

    	function processInput() {
    		if (search()) {
    			$$invalidate(30, highlightIndex = 0);
    			open();
    		}
    	}

    	function onInputClick() {
    		if (debug) {
    			console.log("onInputClick");
    		}

    		resetListToAllItemsAndOpen();
    	}

    	function onEsc(e) {
    		if (debug) {
    			console.log("onEsc");
    		}

    		//if (text) return clear();
    		e.stopPropagation();

    		if (opened) {
    			input.focus();
    			close();
    		}
    	}

    	function onBackspace(e) {
    		if (debug) {
    			console.log("onBackspace");
    		}

    		unselectItem(selectedItem[selectedItem.length - 1]);
    	}

    	function onFocusInternal() {
    		if (debug) {
    			console.log("onFocus");
    		}

    		onFocus();
    		resetListToAllItemsAndOpen();
    	}

    	function onBlurInternal() {
    		if (debug) {
    			console.log("onBlur");
    		}

    		if (closeOnBlur) {
    			close();
    		}

    		onBlur();
    	}

    	function resetListToAllItemsAndOpen() {
    		if (debug) {
    			console.log("resetListToAllItemsAndOpen");
    		}

    		if (!text) {
    			$$invalidate(31, filteredListItems = listItems);
    		} else // When an async component is initialized, the item list
    		// must be loaded when the input is focused.
    		if (!listItems.length && selectedItem && searchFunction) {
    			search();
    		}

    		open();

    		// find selected item
    		if (selectedItem) {
    			if (debug) {
    				console.log("Searching currently selected item: " + JSON.stringify(selectedItem));
    			}

    			const index = findItemIndex(selectedItem, filteredListItems);

    			if (index >= 0) {
    				$$invalidate(30, highlightIndex = index);
    				highlight();
    			}
    		}
    	}

    	function findItemIndex(item, items) {
    		if (debug) {
    			console.log("Finding index for item", item);
    		}

    		let index = -1;

    		for (let i = 0; i < items.length; i++) {
    			const listItem = items[i];

    			if ("undefined" === typeof listItem) {
    				if (debug) {
    					console.log(`listItem ${i} is undefined. Skipping.`);
    				}

    				continue;
    			}

    			if (debug) {
    				console.log("Item " + i + ": " + JSON.stringify(listItem));
    			}

    			if (item === listItem.item) {
    				index = i;
    				break;
    			}
    		}

    		if (debug) {
    			if (index >= 0) {
    				console.log("Found index for item: " + index);
    			} else {
    				console.warn("Not found index for item: " + item);
    			}
    		}

    		return index;
    	}

    	function open() {
    		if (debug) {
    			console.log("open");
    		}

    		// check if the search text has more than the min chars required
    		if (notEnoughSearchText()) {
    			return;
    		}

    		$$invalidate(80, opened = true);
    	}

    	function close() {
    		if (debug) {
    			console.log("close");
    		}

    		$$invalidate(80, opened = false);
    		$$invalidate(34, loading = false);

    		if (!text && selectFirstIfEmpty) {
    			$$invalidate(30, highlightIndex = 0);
    			selectItem();
    		}
    	}

    	function notEnoughSearchText() {
    		return minCharactersToSearch > 1 && filteredTextLength < minCharactersToSearch;
    	}

    	function closeIfMinCharsToSearchReached() {
    		if (notEnoughSearchText()) {
    			close();
    		}
    	}

    	function clear() {
    		if (debug) {
    			console.log("clear");
    		}

    		$$invalidate(3, text = "");
    		$$invalidate(1, selectedItem = multiple ? [] : undefined);

    		setTimeout(() => {
    			input.focus();
    			close();
    		});
    	}

    	function highlightFilter(keywords, field) {
    		return item => {
    			let label = item[field];
    			const newItem = Object.assign({ highlighted: undefined }, item);
    			newItem.highlighted = label;
    			const labelLowercase = label.toLowerCase();

    			const labelLowercaseNoAc = ignoreAccents
    			? removeAccents(labelLowercase)
    			: labelLowercase;

    			if (keywords && keywords.length) {
    				const positions = [];

    				for (let i = 0; i < keywords.length; i++) {
    					let keyword = keywords[i];

    					if (ignoreAccents) {
    						keyword = removeAccents(keyword);
    					}

    					const keywordLen = keyword.length;
    					let pos1 = 0;

    					do {
    						pos1 = labelLowercaseNoAc.indexOf(keyword, pos1);

    						if (pos1 >= 0) {
    							let pos2 = pos1 + keywordLen;
    							positions.push([pos1, pos2]);
    							pos1 = pos2;
    						}
    					} while (pos1 !== -1);
    				}

    				if (positions.length > 0) {
    					const keywordPatterns = new Set();

    					for (let i = 0; i < positions.length; i++) {
    						const pair = positions[i];
    						const pos1 = pair[0];
    						const pos2 = pair[1];
    						const keywordPattern = labelLowercase.substring(pos1, pos2);
    						keywordPatterns.add(keywordPattern);
    					}

    					for (let keywordPattern of keywordPatterns) {
    						// FIXME pst: workarond for wrong replacement <b> tags
    						if (keywordPattern === "b") {
    							continue;
    						}

    						const reg = new RegExp("(" + keywordPattern + ")", "ig");
    						const newHighlighted = newItem.highlighted.replace(reg, "<b>$1</b>");
    						newItem.highlighted = newHighlighted;
    					}
    				}
    			}

    			return newItem;
    		};
    	}

    	function isConfirmed(listItem) {
    		if (!selectedItem) {
    			return false;
    		}

    		if (multiple) {
    			return selectedItem.includes(listItem);
    		} else {
    			return listItem === selectedItem;
    		}
    	}

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			input = $$value;
    			$$invalidate(32, input);
    		});
    	}

    	function input_1_input_handler() {
    		text = this.value;
    		$$invalidate(3, text);
    	}

    	const click_handler = listItem => onListItemClick(listItem);

    	const pointerenter_handler = i => {
    		$$invalidate(30, highlightIndex = i);
    	};

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			list = $$value;
    			$$invalidate(33, list);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('searchFunction' in $$props) $$invalidate(52, searchFunction = $$props.searchFunction);
    		if ('labelFieldName' in $$props) $$invalidate(53, labelFieldName = $$props.labelFieldName);
    		if ('keywordsFieldName' in $$props) $$invalidate(54, keywordsFieldName = $$props.keywordsFieldName);
    		if ('valueFieldName' in $$props) $$invalidate(55, valueFieldName = $$props.valueFieldName);
    		if ('labelFunction' in $$props) $$invalidate(56, labelFunction = $$props.labelFunction);
    		if ('keywordsFunction' in $$props) $$invalidate(57, keywordsFunction = $$props.keywordsFunction);
    		if ('valueFunction' in $$props) $$invalidate(4, valueFunction = $$props.valueFunction);
    		if ('keywordsCleanFunction' in $$props) $$invalidate(58, keywordsCleanFunction = $$props.keywordsCleanFunction);
    		if ('textCleanFunction' in $$props) $$invalidate(59, textCleanFunction = $$props.textCleanFunction);
    		if ('beforeChange' in $$props) $$invalidate(60, beforeChange = $$props.beforeChange);
    		if ('onChange' in $$props) $$invalidate(61, onChange = $$props.onChange);
    		if ('onFocus' in $$props) $$invalidate(62, onFocus = $$props.onFocus);
    		if ('onBlur' in $$props) $$invalidate(63, onBlur = $$props.onBlur);
    		if ('onCreate' in $$props) $$invalidate(64, onCreate = $$props.onCreate);
    		if ('selectFirstIfEmpty' in $$props) $$invalidate(65, selectFirstIfEmpty = $$props.selectFirstIfEmpty);
    		if ('minCharactersToSearch' in $$props) $$invalidate(66, minCharactersToSearch = $$props.minCharactersToSearch);
    		if ('maxItemsToShowInList' in $$props) $$invalidate(5, maxItemsToShowInList = $$props.maxItemsToShowInList);
    		if ('multiple' in $$props) $$invalidate(6, multiple = $$props.multiple);
    		if ('create' in $$props) $$invalidate(7, create = $$props.create);
    		if ('ignoreAccents' in $$props) $$invalidate(67, ignoreAccents = $$props.ignoreAccents);
    		if ('matchAllKeywords' in $$props) $$invalidate(68, matchAllKeywords = $$props.matchAllKeywords);
    		if ('sortByMatchedKeywords' in $$props) $$invalidate(69, sortByMatchedKeywords = $$props.sortByMatchedKeywords);
    		if ('itemFilterFunction' in $$props) $$invalidate(70, itemFilterFunction = $$props.itemFilterFunction);
    		if ('itemSortFunction' in $$props) $$invalidate(71, itemSortFunction = $$props.itemSortFunction);
    		if ('lock' in $$props) $$invalidate(8, lock = $$props.lock);
    		if ('delay' in $$props) $$invalidate(72, delay = $$props.delay);
    		if ('localFiltering' in $$props) $$invalidate(73, localFiltering = $$props.localFiltering);
    		if ('localSorting' in $$props) $$invalidate(74, localSorting = $$props.localSorting);
    		if ('cleanUserText' in $$props) $$invalidate(75, cleanUserText = $$props.cleanUserText);
    		if ('closeOnBlur' in $$props) $$invalidate(76, closeOnBlur = $$props.closeOnBlur);
    		if ('hideArrow' in $$props) $$invalidate(9, hideArrow = $$props.hideArrow);
    		if ('showClear' in $$props) $$invalidate(77, showClear = $$props.showClear);
    		if ('showLoadingIndicator' in $$props) $$invalidate(10, showLoadingIndicator = $$props.showLoadingIndicator);
    		if ('noResultsText' in $$props) $$invalidate(11, noResultsText = $$props.noResultsText);
    		if ('loadingText' in $$props) $$invalidate(12, loadingText = $$props.loadingText);
    		if ('moreItemsText' in $$props) $$invalidate(13, moreItemsText = $$props.moreItemsText);
    		if ('createText' in $$props) $$invalidate(14, createText = $$props.createText);
    		if ('placeholder' in $$props) $$invalidate(15, placeholder = $$props.placeholder);
    		if ('className' in $$props) $$invalidate(16, className = $$props.className);
    		if ('inputClassName' in $$props) $$invalidate(17, inputClassName = $$props.inputClassName);
    		if ('inputId' in $$props) $$invalidate(18, inputId = $$props.inputId);
    		if ('name' in $$props) $$invalidate(19, name = $$props.name);
    		if ('selectName' in $$props) $$invalidate(20, selectName = $$props.selectName);
    		if ('selectId' in $$props) $$invalidate(21, selectId = $$props.selectId);
    		if ('title' in $$props) $$invalidate(22, title = $$props.title);
    		if ('html5autocomplete' in $$props) $$invalidate(23, html5autocomplete = $$props.html5autocomplete);
    		if ('readonly' in $$props) $$invalidate(24, readonly = $$props.readonly);
    		if ('dropdownClassName' in $$props) $$invalidate(25, dropdownClassName = $$props.dropdownClassName);
    		if ('disabled' in $$props) $$invalidate(26, disabled = $$props.disabled);
    		if ('noInputStyles' in $$props) $$invalidate(27, noInputStyles = $$props.noInputStyles);
    		if ('required' in $$props) $$invalidate(28, required = $$props.required);
    		if ('debug' in $$props) $$invalidate(78, debug = $$props.debug);
    		if ('tabindex' in $$props) $$invalidate(29, tabindex = $$props.tabindex);
    		if ('selectedItem' in $$props) $$invalidate(1, selectedItem = $$props.selectedItem);
    		if ('value' in $$props) $$invalidate(2, value = $$props.value);
    		if ('highlightedItem' in $$props) $$invalidate(51, highlightedItem = $$props.highlightedItem);
    		if ('text' in $$props) $$invalidate(3, text = $$props.text);
    		if ('$$scope' in $$props) $$invalidate(82, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*items*/ 1) {
    			// -- Reactivity --
    			(prepareListItems());
    		}

    		if ($$self.$$.dirty[0] & /*selectedItem*/ 2) {
    			(onSelectedItemChanged());
    		}

    		if ($$self.$$.dirty[0] & /*highlightIndex*/ 1073741824 | $$self.$$.dirty[1] & /*filteredListItems*/ 1) {
    			$$invalidate(51, highlightedItem = filteredListItems && highlightIndex && highlightIndex >= 0 && highlightIndex < filteredListItems.length
    			? filteredListItems[highlightIndex].item
    			: null);
    		}

    		if ($$self.$$.dirty[0] & /*items*/ 1 | $$self.$$.dirty[2] & /*opened, filteredTextLength*/ 786432) {
    			$$invalidate(36, showList = opened && (items && items.length > 0 || filteredTextLength > 0));
    		}

    		if ($$self.$$.dirty[0] & /*lock, multiple, selectedItem*/ 322 | $$self.$$.dirty[2] & /*showClear*/ 32768) {
    			$$invalidate(35, clearable = showClear || (lock || multiple) && selectedItem);
    		}
    	};

    	return [
    		items,
    		selectedItem,
    		value,
    		text,
    		valueFunction,
    		maxItemsToShowInList,
    		multiple,
    		create,
    		lock,
    		hideArrow,
    		showLoadingIndicator,
    		noResultsText,
    		loadingText,
    		moreItemsText,
    		createText,
    		placeholder,
    		className,
    		inputClassName,
    		inputId,
    		name,
    		selectName,
    		selectId,
    		title,
    		html5autocomplete,
    		readonly,
    		dropdownClassName,
    		disabled,
    		noInputStyles,
    		required,
    		tabindex,
    		highlightIndex,
    		filteredListItems,
    		input,
    		list,
    		loading,
    		clearable,
    		showList,
    		uniqueId,
    		safeLabelFunction,
    		selectItem,
    		onListItemClick,
    		onDocumentClick,
    		onKeyDown,
    		onKeyPress,
    		onInput,
    		unselectItem,
    		onInputClick,
    		onFocusInternal,
    		onBlurInternal,
    		clear,
    		isConfirmed,
    		highlightedItem,
    		searchFunction,
    		labelFieldName,
    		keywordsFieldName,
    		valueFieldName,
    		labelFunction,
    		keywordsFunction,
    		keywordsCleanFunction,
    		textCleanFunction,
    		beforeChange,
    		onChange,
    		onFocus,
    		onBlur,
    		onCreate,
    		selectFirstIfEmpty,
    		minCharactersToSearch,
    		ignoreAccents,
    		matchAllKeywords,
    		sortByMatchedKeywords,
    		itemFilterFunction,
    		itemSortFunction,
    		delay,
    		localFiltering,
    		localSorting,
    		cleanUserText,
    		closeOnBlur,
    		showClear,
    		debug,
    		highlightFilter,
    		opened,
    		filteredTextLength,
    		$$scope,
    		slots,
    		input_1_binding,
    		input_1_input_handler,
    		click_handler,
    		pointerenter_handler,
    		div1_binding
    	];
    }

    class SimpleAutocomplete extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$R,
    			create_fragment$R,
    			safe_not_equal,
    			{
    				items: 0,
    				searchFunction: 52,
    				labelFieldName: 53,
    				keywordsFieldName: 54,
    				valueFieldName: 55,
    				labelFunction: 56,
    				keywordsFunction: 57,
    				valueFunction: 4,
    				keywordsCleanFunction: 58,
    				textCleanFunction: 59,
    				beforeChange: 60,
    				onChange: 61,
    				onFocus: 62,
    				onBlur: 63,
    				onCreate: 64,
    				selectFirstIfEmpty: 65,
    				minCharactersToSearch: 66,
    				maxItemsToShowInList: 5,
    				multiple: 6,
    				create: 7,
    				ignoreAccents: 67,
    				matchAllKeywords: 68,
    				sortByMatchedKeywords: 69,
    				itemFilterFunction: 70,
    				itemSortFunction: 71,
    				lock: 8,
    				delay: 72,
    				localFiltering: 73,
    				localSorting: 74,
    				cleanUserText: 75,
    				closeOnBlur: 76,
    				hideArrow: 9,
    				showClear: 77,
    				showLoadingIndicator: 10,
    				noResultsText: 11,
    				loadingText: 12,
    				moreItemsText: 13,
    				createText: 14,
    				placeholder: 15,
    				className: 16,
    				inputClassName: 17,
    				inputId: 18,
    				name: 19,
    				selectName: 20,
    				selectId: 21,
    				title: 22,
    				html5autocomplete: 23,
    				readonly: 24,
    				dropdownClassName: 25,
    				disabled: 26,
    				noInputStyles: 27,
    				required: 28,
    				debug: 78,
    				tabindex: 29,
    				selectedItem: 1,
    				value: 2,
    				highlightedItem: 51,
    				text: 3,
    				highlightFilter: 79
    			},
    			null,
    			[-1, -1, -1, -1]
    		);
    	}

    	get highlightFilter() {
    		return this.$$.ctx[79];
    	}
    }

    class UICommon {
      /**
       *  Reformats input from any string to strict phone format
       *  @param {string}    phone    free style phone number
       *  @returns {string}          phone number
       **/
      static formatPhone(val) {
        let filler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.FILLER;
        //starting from 11 digits in phone number
        const slots = [1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5];
        let digits = val.replace(/\D/g, ''); //if there are more, move them to country code slot

        if (digits.length > 11) {
          let d = digits.length - 11;

          while (d > 0) {
            d--;
            slots.unshift(1);
          }
        }

        let stack = ['', '', '', '', ''];
        Array.from(digits).forEach(function (digit, index) {
          let slot = slots[index];
          stack[slot - 1] = stack[slot - 1] + digit;
        }); //creating map of parts lengths

        const lens = slots.reduce(function (acc, curr) {
          if (typeof acc[curr] === 'undefined') {
            acc[curr] = 1;
          } else {
            acc[curr] += 1;
          }

          return acc;
        }, {}); //fill empty positions with filler (_)

        for (let t in stack) {
          let dif = lens[parseInt(t) + 1] - stack[t].length;

          while (dif > 0) {
            stack[t] = stack[t] + filler;
            dif--;
          }
        }

        return `+${stack[0]} (${stack[1]}) ${stack[2]}-${stack[3]}-${stack[4]}`;
      }

      static setMoneySign(val) {
        this.MONEY_SIGN = val;
      }

      static formatPrice(price) {
        let major = parseInt(Math.floor(price / 100)),
            minor = parseInt(price % 100);
        major = '' + major;
        return `${this.MONEY_SIGN}${major}.${minor}`;
      }

      static formatTimestamp(timestamp) {
        let offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        let offsetLocal = new Date().getTimezoneOffset();
        let deltaOffset = (offsetLocal - parseInt(offset)) * 60 * 1000;
        let localDateTime = new Date(parseInt(timestamp) - deltaOffset);
        return localDateTime.toLocaleString(window.navigator.language);
      }

      static declOfNum(n, text_forms) {
        n = Math.abs(n) % 100;
        let n1 = n % 10;

        if (n > 10 && n < 20) {
          return text_forms[2];
        }

        if (n1 > 1 && n1 < 5) {
          return text_forms[1];
        }

        if (n1 == 1) {
          return text_forms[0];
        }

        return text_forms[2];
      }

      static humanizedTimeDiff(date
      /* unix time */
      ) {
        let currentTime = new Date().getTime();
        let sec = Math.round((currentTime - date) / 1000);
        let unit;

        if (sec < 60) {
          unit = this.declOfNum(sec, this.TIME.SECONDS);
          return `${sec} ${unit} назад`;
        } else if (sec < 3600) {
          let min = Math.floor(sec / 60);
          unit = this.declOfNum(min, this.TIME.MINUTES);
          return `${min} ${unit} назад`;
        } else {
          let hours = Math.floor(sec / (60 * 60));
          unit = this.declOfNum(hours, this.TIME.HOURS);
          return `${hours} ${unit} назад`;
        }
      }

    }

    _defineProperty(UICommon, "ERROR_DEFAULT", 'Что пошло не так.');

    _defineProperty(UICommon, "DEFAULT_REDIRECT_TIMEOUT", 3000);

    _defineProperty(UICommon, "CLASS_OK", 'is-success');

    _defineProperty(UICommon, "CLASS_ERR", 'is-danger');

    _defineProperty(UICommon, "FILLER", '_');

    _defineProperty(UICommon, "MONEY_SIGN", '&#8381;');

    _defineProperty(UICommon, "TIME", {
      SECONDS: ['секунду', 'секунды', 'секунд'],
      MINUTES: ['минуту', 'минуты', 'минут'],
      HOURS: ['час', 'часа', 'часов']
    });

    /* src/elements/form/ui.textfield.svelte generated by Svelte v3.46.6 */

    function create_if_block_4$d(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[4]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 16 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[4])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (64:4) {#if validated === true }
    function create_if_block_1$r(ctx) {
    	let span;

    	function select_block_type(ctx, dirty) {
    		if (/*valid*/ ctx[8] === true) return create_if_block_2$i;
    		if (/*valid*/ ctx[8] === false) return create_if_block_3$g;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (68:35) 
    function create_if_block_3$g(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (66:6) {#if valid === true }
    function create_if_block_2$i(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (77:4) {:else}
    function create_else_block$r(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (75:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$z(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[12]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 4096) set_data(t, /*helper*/ ctx[12]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$Q(ctx) {
    	let div;
    	let input;
    	let input_id_value;
    	let input_class_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t0;
    	let t1;
    	let div_class_value;
    	let t2;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[4] && create_if_block_4$d(ctx);
    	let if_block1 = /*validated*/ ctx[9] === true && create_if_block_1$r(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!(/*validated*/ ctx[9] && /*valid*/ ctx[8]) && /*inputStarted*/ ctx[0]) return create_if_block$z;
    		return create_else_block$r;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	return {
    		c() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			p = element("p");
    			if_block2.c();
    			attr(input, "id", input_id_value = "form-field-textfield-" + /*fieldname*/ ctx[3]);
    			attr(input, "class", input_class_value = "input " + /*validationClasses*/ ctx[10]);
    			attr(input, "type", "text");
    			attr(input, "name", /*fieldname*/ ctx[3]);
    			attr(input, "invalid", /*invalid*/ ctx[11]);
    			input.disabled = /*disabled*/ ctx[6];
    			input.required = /*required*/ ctx[5];
    			input.readOnly = /*readonly*/ ctx[7];
    			attr(input, "placeholder", /*placeholder*/ ctx[2]);
    			attr(input, "autocomplete", /*fieldname*/ ctx[3]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    			attr(div, "class", div_class_value = "control " + /*iconClasses*/ ctx[13]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[10]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);
    			set_input_value(input, /*value*/ ctx[1]);
    			append(div, t0);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			insert(target, t2, anchor);
    			insert(target, p, anchor);
    			if_block2.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[20]),
    					listen(input, "change", /*onBlur*/ ctx[14]),
    					listen(input, "input", /*onInput*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*fieldname*/ 8 && input_id_value !== (input_id_value = "form-field-textfield-" + /*fieldname*/ ctx[3])) {
    				attr(input, "id", input_id_value);
    			}

    			if (dirty & /*validationClasses*/ 1024 && input_class_value !== (input_class_value = "input " + /*validationClasses*/ ctx[10])) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*fieldname*/ 8) {
    				attr(input, "name", /*fieldname*/ ctx[3]);
    			}

    			if (dirty & /*invalid*/ 2048) {
    				attr(input, "invalid", /*invalid*/ ctx[11]);
    			}

    			if (dirty & /*disabled*/ 64) {
    				input.disabled = /*disabled*/ ctx[6];
    			}

    			if (dirty & /*required*/ 32) {
    				input.required = /*required*/ ctx[5];
    			}

    			if (dirty & /*readonly*/ 128) {
    				input.readOnly = /*readonly*/ ctx[7];
    			}

    			if (dirty & /*placeholder*/ 4) {
    				attr(input, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (dirty & /*fieldname*/ 8) {
    				attr(input, "autocomplete", /*fieldname*/ ctx[3]);
    			}

    			if (dirty & /*fieldname*/ 8 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*fieldname*/ 8 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}

    			if (/*icon*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$d(ctx);
    					if_block0.c();
    					if_block0.m(div, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*validated*/ ctx[9] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$r(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*iconClasses*/ 8192 && div_class_value !== (div_class_value = "control " + /*iconClasses*/ ctx[13])) {
    				attr(div, "class", div_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 1024 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[10])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 8 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(p, "id", p_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach(t2);
    			if (detaching) detach(p);
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$Q($$self, $$props, $$invalidate) {
    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;
    	let { value = '' } = $$props;
    	let { placeholder = 'input some text here, please' } = $$props;
    	let { fieldname = 'textfield' } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { disabled = false } = $$props;
    	let { readonly = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur() /*ev*/ {
    		let data = { field: fieldname, value };
    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.currentTarget.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	$$self.$$set = $$props => {
    		if ('inputStarted' in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ('fieldname' in $$props) $$invalidate(3, fieldname = $$props.fieldname);
    		if ('icon' in $$props) $$invalidate(4, icon = $$props.icon);
    		if ('required' in $$props) $$invalidate(5, required = $$props.required);
    		if ('disabled' in $$props) $$invalidate(6, disabled = $$props.disabled);
    		if ('readonly' in $$props) $$invalidate(7, readonly = $$props.readonly);
    		if ('valid' in $$props) $$invalidate(8, valid = $$props.valid);
    		if ('validated' in $$props) $$invalidate(9, validated = $$props.validated);
    		if ('errors' in $$props) $$invalidate(16, errors = $$props.errors);
    		if ('formErrors' in $$props) $$invalidate(17, formErrors = $$props.formErrors);
    		if ('formLevelError' in $$props) $$invalidate(18, formLevelError = $$props.formLevelError);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 16) {
    			$$invalidate(13, iconClasses = (icon ? ' has-icons-left ' : '') + ' has-icons-right ');
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 196608) {
    			$$invalidate(19, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 524292) {
    			$$invalidate(12, helper = allErrors ? allErrors.join(', ') : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 262400) {
    			$$invalidate(11, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 257) {
    			$$invalidate(10, validationClasses = valid === true || !inputStarted
    			? UICommon.CLASS_OK
    			: UICommon.CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		placeholder,
    		fieldname,
    		icon,
    		required,
    		disabled,
    		readonly,
    		valid,
    		validated,
    		validationClasses,
    		invalid,
    		helper,
    		iconClasses,
    		onBlur,
    		onInput,
    		errors,
    		formErrors,
    		formLevelError,
    		allErrors,
    		input_input_handler
    	];
    }

    class Ui_textfield extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$Q, create_fragment$Q, safe_not_equal, {
    			inputStarted: 0,
    			value: 1,
    			placeholder: 2,
    			fieldname: 3,
    			icon: 4,
    			required: 5,
    			disabled: 6,
    			readonly: 7,
    			valid: 8,
    			validated: 9,
    			errors: 16,
    			formErrors: 17,
    			formLevelError: 18
    		});
    	}
    }

    /* src/elements/form/ui.autocomplete.svelte generated by Svelte v3.46.6 */

    function create_else_block$q(ctx) {
    	let div;
    	let autocomplete;
    	let updating_selectedItem;
    	let t;
    	let if_block_anchor;
    	let current;

    	function autocomplete_selectedItem_binding(value) {
    		/*autocomplete_selectedItem_binding*/ ctx[24](value);
    	}

    	let autocomplete_props = {
    		showClear: /*showClear*/ ctx[8],
    		disabled: /*disabled*/ ctx[11],
    		placeholder: /*placeholder*/ ctx[9],
    		noResultsText: /*noResultsText*/ ctx[7],
    		onChange: /*onChange*/ ctx[19],
    		searchFunction: /*searchFunction*/ ctx[16],
    		hideArrow: true,
    		labelFieldName: /*labelField*/ ctx[3],
    		valueFieldName: /*idField*/ ctx[2],
    		minCharactersToSearch: /*minCharactersToSearch*/ ctx[4],
    		selectFirstIfEmpty: /*selectFirstIfEmpty*/ ctx[5],
    		maxItemsToShowInList: /*maxItemsToShowInList*/ ctx[6]
    	};

    	if (/*value*/ ctx[1] !== void 0) {
    		autocomplete_props.selectedItem = /*value*/ ctx[1];
    	}

    	autocomplete = new SimpleAutocomplete({ props: autocomplete_props });
    	binding_callbacks.push(() => bind(autocomplete, 'selectedItem', autocomplete_selectedItem_binding));
    	let if_block = !(/*validated*/ ctx[15] && /*valid*/ ctx[14]) && /*inputStarted*/ ctx[0] && create_if_block_1$q(ctx);

    	return {
    		c() {
    			div = element("div");
    			create_component(autocomplete.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr(div, "class", "control");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(autocomplete, div, null);
    			insert(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const autocomplete_changes = {};
    			if (dirty & /*showClear*/ 256) autocomplete_changes.showClear = /*showClear*/ ctx[8];
    			if (dirty & /*disabled*/ 2048) autocomplete_changes.disabled = /*disabled*/ ctx[11];
    			if (dirty & /*placeholder*/ 512) autocomplete_changes.placeholder = /*placeholder*/ ctx[9];
    			if (dirty & /*noResultsText*/ 128) autocomplete_changes.noResultsText = /*noResultsText*/ ctx[7];
    			if (dirty & /*searchFunction*/ 65536) autocomplete_changes.searchFunction = /*searchFunction*/ ctx[16];
    			if (dirty & /*labelField*/ 8) autocomplete_changes.labelFieldName = /*labelField*/ ctx[3];
    			if (dirty & /*idField*/ 4) autocomplete_changes.valueFieldName = /*idField*/ ctx[2];
    			if (dirty & /*minCharactersToSearch*/ 16) autocomplete_changes.minCharactersToSearch = /*minCharactersToSearch*/ ctx[4];
    			if (dirty & /*selectFirstIfEmpty*/ 32) autocomplete_changes.selectFirstIfEmpty = /*selectFirstIfEmpty*/ ctx[5];
    			if (dirty & /*maxItemsToShowInList*/ 64) autocomplete_changes.maxItemsToShowInList = /*maxItemsToShowInList*/ ctx[6];

    			if (!updating_selectedItem && dirty & /*value*/ 2) {
    				updating_selectedItem = true;
    				autocomplete_changes.selectedItem = /*value*/ ctx[1];
    				add_flush_callback(() => updating_selectedItem = false);
    			}

    			autocomplete.$set(autocomplete_changes);

    			if (!(/*validated*/ ctx[15] && /*valid*/ ctx[14]) && /*inputStarted*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$q(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(autocomplete.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(autocomplete.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(autocomplete);
    			if (detaching) detach(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (57:0) {#if readonly }
    function create_if_block$y(ctx) {
    	let uitextfield;
    	let current;

    	uitextfield = new Ui_textfield({
    			props: {
    				value: /*value*/ ctx[1] ? /*value*/ ctx[1].title : '',
    				fieldname: /*fieldname*/ ctx[10],
    				placeholder: /*placeholder*/ ctx[9],
    				icon: /*icon*/ ctx[13]
    			}
    		});

    	return {
    		c() {
    			create_component(uitextfield.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uitextfield, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uitextfield_changes = {};
    			if (dirty & /*value*/ 2) uitextfield_changes.value = /*value*/ ctx[1] ? /*value*/ ctx[1].title : '';
    			if (dirty & /*fieldname*/ 1024) uitextfield_changes.fieldname = /*fieldname*/ ctx[10];
    			if (dirty & /*placeholder*/ 512) uitextfield_changes.placeholder = /*placeholder*/ ctx[9];
    			if (dirty & /*icon*/ 8192) uitextfield_changes.icon = /*icon*/ ctx[13];
    			uitextfield.$set(uitextfield_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uitextfield.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uitextfield.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uitextfield, detaching);
    		}
    	};
    }

    // (77:0) {#if !(validated && valid) && (inputStarted) }
    function create_if_block_1$q(ctx) {
    	let p;
    	let t;
    	let p_class_value;
    	let p_id_value;

    	return {
    		c() {
    			p = element("p");
    			t = text(/*helper*/ ctx[18]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[17]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[10]);
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    			append(p, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 262144) set_data(t, /*helper*/ ctx[18]);

    			if (dirty & /*validationClasses*/ 131072 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[17])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 1024 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[10])) {
    				attr(p, "id", p_id_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(p);
    		}
    	};
    }

    function create_fragment$P(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$y, create_else_block$q];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*readonly*/ ctx[12]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$P($$self, $$props, $$invalidate) {
    	let allErrors;
    	let helper;
    	let validationClasses;
    	let dispatch = createEventDispatcher();
    	let { idField = '_id' } = $$props;
    	let { labelField = 'title' } = $$props;
    	let { minCharactersToSearch = 3 } = $$props;
    	let { selectFirstIfEmpty = false } = $$props;
    	let { maxItemsToShowInList = 20 } = $$props;
    	let { noResultsText = 'Ничего не найдено' } = $$props;
    	let { showClear = true } = $$props;
    	let { value } = $$props;
    	let { placeholder = '' } = $$props;
    	let { fieldname = 'checkbox-list' } = $$props;
    	let { disabled = false } = $$props;
    	let { readonly = false } = $$props;
    	let { icon = false } = $$props;
    	let { inputStarted = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	let { searchFunction = () => /*term*/ {
    		return [];
    	} } = $$props;

    	function onChange() {
    		let data = { field: fieldname, value };
    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function autocomplete_selectedItem_binding(value$1) {
    		value = value$1;
    		$$invalidate(1, value);
    	}

    	$$self.$$set = $$props => {
    		if ('idField' in $$props) $$invalidate(2, idField = $$props.idField);
    		if ('labelField' in $$props) $$invalidate(3, labelField = $$props.labelField);
    		if ('minCharactersToSearch' in $$props) $$invalidate(4, minCharactersToSearch = $$props.minCharactersToSearch);
    		if ('selectFirstIfEmpty' in $$props) $$invalidate(5, selectFirstIfEmpty = $$props.selectFirstIfEmpty);
    		if ('maxItemsToShowInList' in $$props) $$invalidate(6, maxItemsToShowInList = $$props.maxItemsToShowInList);
    		if ('noResultsText' in $$props) $$invalidate(7, noResultsText = $$props.noResultsText);
    		if ('showClear' in $$props) $$invalidate(8, showClear = $$props.showClear);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate(9, placeholder = $$props.placeholder);
    		if ('fieldname' in $$props) $$invalidate(10, fieldname = $$props.fieldname);
    		if ('disabled' in $$props) $$invalidate(11, disabled = $$props.disabled);
    		if ('readonly' in $$props) $$invalidate(12, readonly = $$props.readonly);
    		if ('icon' in $$props) $$invalidate(13, icon = $$props.icon);
    		if ('inputStarted' in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ('valid' in $$props) $$invalidate(14, valid = $$props.valid);
    		if ('validated' in $$props) $$invalidate(15, validated = $$props.validated);
    		if ('errors' in $$props) $$invalidate(20, errors = $$props.errors);
    		if ('formErrors' in $$props) $$invalidate(21, formErrors = $$props.formErrors);
    		if ('formLevelError' in $$props) $$invalidate(22, formLevelError = $$props.formLevelError);
    		if ('searchFunction' in $$props) $$invalidate(16, searchFunction = $$props.searchFunction);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 8192) ;

    		if ($$self.$$.dirty & /*errors, formErrors*/ 3145728) {
    			$$invalidate(23, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 8389120) {
    			$$invalidate(18, helper = allErrors ? allErrors.join(', ') : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 4210688) ;

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 16385) {
    			$$invalidate(17, validationClasses = valid === true || !inputStarted
    			? UICommon.CLASS_OK
    			: UICommon.CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		idField,
    		labelField,
    		minCharactersToSearch,
    		selectFirstIfEmpty,
    		maxItemsToShowInList,
    		noResultsText,
    		showClear,
    		placeholder,
    		fieldname,
    		disabled,
    		readonly,
    		icon,
    		valid,
    		validated,
    		searchFunction,
    		validationClasses,
    		helper,
    		onChange,
    		errors,
    		formErrors,
    		formLevelError,
    		allErrors,
    		autocomplete_selectedItem_binding
    	];
    }

    class Ui_autocomplete extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$P, create_fragment$P, safe_not_equal, {
    			idField: 2,
    			labelField: 3,
    			minCharactersToSearch: 4,
    			selectFirstIfEmpty: 5,
    			maxItemsToShowInList: 6,
    			noResultsText: 7,
    			showClear: 8,
    			value: 1,
    			placeholder: 9,
    			fieldname: 10,
    			disabled: 11,
    			readonly: 12,
    			icon: 13,
    			inputStarted: 0,
    			valid: 14,
    			validated: 15,
    			errors: 20,
    			formErrors: 21,
    			formLevelError: 22,
    			searchFunction: 16
    		});
    	}
    }

    /* src/elements/form/ui.checkbox.list.svelte generated by Svelte v3.46.6 */

    function get_each_context$e(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	child_ctx[21] = list;
    	child_ctx[22] = i;
    	return child_ctx;
    }

    // (56:2) {#each value as item(item.id) }
    function create_each_block$e(key_1, ctx) {
    	let label;
    	let input;
    	let input_data_id_value;
    	let input_id_value;
    	let input_placeholder_value;
    	let input_name_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let input_disabled_value;
    	let t0;
    	let t1_value = /*$LOCALE*/ ctx[10][/*item*/ ctx[20].label] + "";
    	let t1;
    	let t2;
    	let label_disabled_value;
    	let label_for_value;
    	let mounted;
    	let dispose;

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[18].call(input, /*each_value*/ ctx[21], /*item_index*/ ctx[22]);
    	}

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr(input, "data-id", input_data_id_value = /*item*/ ctx[20].id);
    			attr(input, "id", input_id_value = "form-field-checkboxlist-" + (/*fieldname*/ ctx[2] + '_' + /*item*/ ctx[20].id));
    			attr(input, "type", "checkbox");
    			attr(input, "placeholder", input_placeholder_value = /*item*/ ctx[20].placeholder);
    			attr(input, "name", input_name_value = /*fieldname*/ ctx[2] + '_' + /*item*/ ctx[20].id);
    			input.readOnly = /*readonly*/ ctx[3];
    			attr(input, "invalid", /*invalid*/ ctx[8]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + (/*fieldname*/ ctx[2] + '_' + /*item*/ ctx[20].id));
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + (/*fieldname*/ ctx[2] + '_' + /*item*/ ctx[20].id));
    			input.disabled = input_disabled_value = /*disabled*/ ctx[4] || /*item*/ ctx[20].disabled;
    			attr(label, "class", "checkbox pr-2");
    			attr(label, "disabled", label_disabled_value = /*disabled*/ ctx[4] || /*item*/ ctx[20].disabled);
    			attr(label, "for", label_for_value = "form-field-checkbox-" + (/*fieldname*/ ctx[2] + '_' + /*item*/ ctx[20].id));
    			this.first = label;
    		},
    		m(target, anchor) {
    			insert(target, label, anchor);
    			append(label, input);
    			input.checked = /*item*/ ctx[20].value;
    			append(label, t0);
    			append(label, t1);
    			append(label, t2);

    			if (!mounted) {
    				dispose = [
    					listen(input, "change", input_change_handler),
    					listen(input, "change", /*onBlur*/ ctx[11]),
    					listen(input, "input", /*onInput*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*value*/ 2 && input_data_id_value !== (input_data_id_value = /*item*/ ctx[20].id)) {
    				attr(input, "data-id", input_data_id_value);
    			}

    			if (dirty & /*fieldname, value*/ 6 && input_id_value !== (input_id_value = "form-field-checkboxlist-" + (/*fieldname*/ ctx[2] + '_' + /*item*/ ctx[20].id))) {
    				attr(input, "id", input_id_value);
    			}

    			if (dirty & /*value*/ 2 && input_placeholder_value !== (input_placeholder_value = /*item*/ ctx[20].placeholder)) {
    				attr(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*fieldname, value*/ 6 && input_name_value !== (input_name_value = /*fieldname*/ ctx[2] + '_' + /*item*/ ctx[20].id)) {
    				attr(input, "name", input_name_value);
    			}

    			if (dirty & /*readonly*/ 8) {
    				input.readOnly = /*readonly*/ ctx[3];
    			}

    			if (dirty & /*invalid*/ 256) {
    				attr(input, "invalid", /*invalid*/ ctx[8]);
    			}

    			if (dirty & /*fieldname, value*/ 6 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + (/*fieldname*/ ctx[2] + '_' + /*item*/ ctx[20].id))) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*fieldname, value*/ 6 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + (/*fieldname*/ ctx[2] + '_' + /*item*/ ctx[20].id))) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*disabled, value*/ 18 && input_disabled_value !== (input_disabled_value = /*disabled*/ ctx[4] || /*item*/ ctx[20].disabled)) {
    				input.disabled = input_disabled_value;
    			}

    			if (dirty & /*value*/ 2) {
    				input.checked = /*item*/ ctx[20].value;
    			}

    			if (dirty & /*$LOCALE, value*/ 1026 && t1_value !== (t1_value = /*$LOCALE*/ ctx[10][/*item*/ ctx[20].label] + "")) set_data(t1, t1_value);

    			if (dirty & /*disabled, value*/ 18 && label_disabled_value !== (label_disabled_value = /*disabled*/ ctx[4] || /*item*/ ctx[20].disabled)) {
    				attr(label, "disabled", label_disabled_value);
    			}

    			if (dirty & /*fieldname, value*/ 6 && label_for_value !== (label_for_value = "form-field-checkbox-" + (/*fieldname*/ ctx[2] + '_' + /*item*/ ctx[20].id))) {
    				attr(label, "for", label_for_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(label);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (80:2) {:else}
    function create_else_block$p(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (78:2) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$x(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[9]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 512) set_data(t, /*helper*/ ctx[9]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$O(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let each_value = /*value*/ ctx[1];
    	const get_key = ctx => /*item*/ ctx[20].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$e(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$e(key, child_ctx));
    	}

    	function select_block_type(ctx, dirty) {
    		if (!(/*validated*/ ctx[6] && /*valid*/ ctx[5]) && /*inputStarted*/ ctx[0]) return create_if_block$x;
    		return create_else_block$p;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			p = element("p");
    			if_block.c();
    			attr(div, "class", "control");
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[7]);
    			attr(p, "id", p_id_value = "form-field-helper-" + /*fieldname*/ ctx[2]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			insert(target, t, anchor);
    			insert(target, p, anchor);
    			if_block.m(p, null);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*disabled, value, fieldname, $LOCALE, readonly, invalid, onBlur, onInput*/ 7454) {
    				each_value = /*value*/ ctx[1];
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$e, null, get_each_context$e);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 128 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[7])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 4 && p_id_value !== (p_id_value = "form-field-helper-" + /*fieldname*/ ctx[2])) {
    				attr(p, "id", p_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach(t);
    			if (detaching) detach(p);
    			if_block.d();
    		}
    	};
    }

    function instance$O($$self, $$props, $$invalidate) {
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(10, $LOCALE = $$value));
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;
    	let { value = [] } = $$props;
    	let { fieldname = 'checkbox-list' } = $$props;
    	let { placeholder = '' } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let id = parseInt(ev.currentTarget.dataset.id);
    		let copy = [...value];
    		copy.find(itm => itm.id == id).value = ev.currentTarget.checked;
    		let data = { id, field: fieldname, value: copy };
    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function onInput(ev) {
    		let id = parseInt(ev.currentTarget.dataset.id);
    		let copy = [...value];
    		copy.find(itm => itm.id === id).value = ev.currentTarget.checked;
    		let data = { id, field: fieldname, value: copy };
    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function input_change_handler(each_value, item_index) {
    		each_value[item_index].value = this.checked;
    		$$invalidate(1, value);
    	}

    	$$self.$$set = $$props => {
    		if ('inputStarted' in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('fieldname' in $$props) $$invalidate(2, fieldname = $$props.fieldname);
    		if ('placeholder' in $$props) $$invalidate(13, placeholder = $$props.placeholder);
    		if ('readonly' in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ('disabled' in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ('valid' in $$props) $$invalidate(5, valid = $$props.valid);
    		if ('validated' in $$props) $$invalidate(6, validated = $$props.validated);
    		if ('errors' in $$props) $$invalidate(14, errors = $$props.errors);
    		if ('formErrors' in $$props) $$invalidate(15, formErrors = $$props.formErrors);
    		if ('formLevelError' in $$props) $$invalidate(16, formLevelError = $$props.formLevelError);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*errors, formErrors*/ 49152) {
    			$$invalidate(17, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 139264) {
    			$$invalidate(9, helper = allErrors ? allErrors.join(', ') : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 65568) {
    			$$invalidate(8, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 33) {
    			$$invalidate(7, validationClasses = valid === true || !inputStarted
    			? UICommon.CLASS_OK
    			: UICommon.CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		fieldname,
    		readonly,
    		disabled,
    		valid,
    		validated,
    		validationClasses,
    		invalid,
    		helper,
    		$LOCALE,
    		onBlur,
    		onInput,
    		placeholder,
    		errors,
    		formErrors,
    		formLevelError,
    		allErrors,
    		input_change_handler
    	];
    }

    class Ui_checkbox_list extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$O, create_fragment$O, safe_not_equal, {
    			inputStarted: 0,
    			value: 1,
    			fieldname: 2,
    			placeholder: 13,
    			readonly: 3,
    			disabled: 4,
    			valid: 5,
    			validated: 6,
    			errors: 14,
    			formErrors: 15,
    			formLevelError: 16
    		});
    	}
    }

    /* src/elements/form/ui.checkbox.svelte generated by Svelte v3.46.6 */

    function create_else_block$o(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (59:2) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$w(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[12]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 4096) set_data(t, /*helper*/ ctx[12]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$N(ctx) {
    	let div;
    	let label_1;
    	let input;
    	let input_id_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t0;
    	let t1_value = /*$LOCALE*/ ctx[14][/*label*/ ctx[2]] + "";
    	let t1;
    	let label_1_for_value;
    	let div_class_value;
    	let t2;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!(/*validated*/ ctx[9] && /*valid*/ ctx[8]) && /*inputStarted*/ ctx[0]) return create_if_block$w;
    		return create_else_block$o;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			div = element("div");
    			label_1 = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			if_block.c();
    			attr(input, "type", "checkbox");
    			attr(input, "id", input_id_value = "form-field-checkbox-" + /*fieldname*/ ctx[4]);
    			attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			attr(input, "name", /*fieldname*/ ctx[4]);
    			input.required = /*required*/ ctx[5];
    			input.readOnly = /*readonly*/ ctx[6];
    			attr(input, "invalid", /*invalid*/ ctx[11]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			input.disabled = /*disabled*/ ctx[7];
    			attr(label_1, "class", "checkbox");
    			attr(label_1, "disabled", /*disabled*/ ctx[7]);
    			attr(label_1, "for", label_1_for_value = "form-field-checkbox-" + /*fieldname*/ ctx[4]);
    			attr(div, "class", div_class_value = "control " + /*iconClasses*/ ctx[13]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[10]);
    			attr(p, "id", p_id_value = "form-field-helper-" + /*fieldname*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, label_1);
    			append(label_1, input);
    			input.checked = /*value*/ ctx[1];
    			append(label_1, t0);
    			append(label_1, t1);
    			insert(target, t2, anchor);
    			insert(target, p, anchor);
    			if_block.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "change", /*input_change_handler*/ ctx[22]),
    					listen(input, "change", /*onBlur*/ ctx[15]),
    					listen(input, "input", /*onInput*/ ctx[16])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*fieldname*/ 16 && input_id_value !== (input_id_value = "form-field-checkbox-" + /*fieldname*/ ctx[4])) {
    				attr(input, "id", input_id_value);
    			}

    			if (dirty & /*placeholder*/ 8) {
    				attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "name", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*required*/ 32) {
    				input.required = /*required*/ ctx[5];
    			}

    			if (dirty & /*readonly*/ 64) {
    				input.readOnly = /*readonly*/ ctx[6];
    			}

    			if (dirty & /*invalid*/ 2048) {
    				attr(input, "invalid", /*invalid*/ ctx[11]);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*disabled*/ 128) {
    				input.disabled = /*disabled*/ ctx[7];
    			}

    			if (dirty & /*value*/ 2) {
    				input.checked = /*value*/ ctx[1];
    			}

    			if (dirty & /*$LOCALE, label*/ 16388 && t1_value !== (t1_value = /*$LOCALE*/ ctx[14][/*label*/ ctx[2]] + "")) set_data(t1, t1_value);

    			if (dirty & /*disabled*/ 128) {
    				attr(label_1, "disabled", /*disabled*/ ctx[7]);
    			}

    			if (dirty & /*fieldname*/ 16 && label_1_for_value !== (label_1_for_value = "form-field-checkbox-" + /*fieldname*/ ctx[4])) {
    				attr(label_1, "for", label_1_for_value);
    			}

    			if (dirty & /*iconClasses*/ 8192 && div_class_value !== (div_class_value = "control " + /*iconClasses*/ ctx[13])) {
    				attr(div, "class", div_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 1024 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[10])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 16 && p_id_value !== (p_id_value = "form-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(p, "id", p_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			if (detaching) detach(t2);
    			if (detaching) detach(p);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$N($$self, $$props, $$invalidate) {
    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(14, $LOCALE = $$value));
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;
    	let { value = false } = $$props;
    	let { label = 'checkbox' } = $$props;
    	let { placeholder = 'checkbox placeholder' } = $$props;
    	let { fieldname = 'checkbox' } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.currentTarget.type === 'checkbox'
    			? ev.currentTarget.checked
    			: value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.currentTarget.type === 'checkbox'
    			? ev.currentTarget.checked
    			: value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function input_change_handler() {
    		value = this.checked;
    		$$invalidate(1, value);
    	}

    	$$self.$$set = $$props => {
    		if ('inputStarted' in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('label' in $$props) $$invalidate(2, label = $$props.label);
    		if ('placeholder' in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ('fieldname' in $$props) $$invalidate(4, fieldname = $$props.fieldname);
    		if ('icon' in $$props) $$invalidate(17, icon = $$props.icon);
    		if ('required' in $$props) $$invalidate(5, required = $$props.required);
    		if ('readonly' in $$props) $$invalidate(6, readonly = $$props.readonly);
    		if ('disabled' in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ('valid' in $$props) $$invalidate(8, valid = $$props.valid);
    		if ('validated' in $$props) $$invalidate(9, validated = $$props.validated);
    		if ('errors' in $$props) $$invalidate(18, errors = $$props.errors);
    		if ('formErrors' in $$props) $$invalidate(19, formErrors = $$props.formErrors);
    		if ('formLevelError' in $$props) $$invalidate(20, formLevelError = $$props.formLevelError);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 131072) {
    			$$invalidate(13, iconClasses = (icon ? ' has-icons-left ' : '') + ' has-icons-right ');
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 786432) {
    			$$invalidate(21, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 2097160) {
    			$$invalidate(12, helper = allErrors ? allErrors.join(', ') : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 1048832) {
    			$$invalidate(11, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 257) {
    			$$invalidate(10, validationClasses = valid === true || !inputStarted
    			? UICommon.CLASS_OK
    			: UICommon.CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		label,
    		placeholder,
    		fieldname,
    		required,
    		readonly,
    		disabled,
    		valid,
    		validated,
    		validationClasses,
    		invalid,
    		helper,
    		iconClasses,
    		$LOCALE,
    		onBlur,
    		onInput,
    		icon,
    		errors,
    		formErrors,
    		formLevelError,
    		allErrors,
    		input_change_handler
    	];
    }

    class Ui_checkbox extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$N, create_fragment$N, safe_not_equal, {
    			inputStarted: 0,
    			value: 1,
    			label: 2,
    			placeholder: 3,
    			fieldname: 4,
    			icon: 17,
    			required: 5,
    			readonly: 6,
    			disabled: 7,
    			valid: 8,
    			validated: 9,
    			errors: 18,
    			formErrors: 19,
    			formLevelError: 20
    		});
    	}
    }

    /* src/elements/form/ui.color.svelte generated by Svelte v3.46.6 */

    function create_if_block_4$c(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[4]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 16 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[4])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (61:4) {#if validated === true }
    function create_if_block_1$p(ctx) {
    	let span;

    	function select_block_type(ctx, dirty) {
    		if (/*valid*/ ctx[7] === true) return create_if_block_2$h;
    		if (/*valid*/ ctx[7] === false) return create_if_block_3$f;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (65:35) 
    function create_if_block_3$f(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (63:6) {#if valid === true }
    function create_if_block_2$h(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (74:4) {:else}
    function create_else_block$n(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (72:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$v(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[11]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 2048) set_data(t, /*helper*/ ctx[11]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$M(ctx) {
    	let div;
    	let input;
    	let input_id_value;
    	let input_class_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t0;
    	let t1;
    	let div_class_value;
    	let t2;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[4] && create_if_block_4$c(ctx);
    	let if_block1 = /*validated*/ ctx[8] === true && create_if_block_1$p(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!(/*validated*/ ctx[8] && /*valid*/ ctx[7]) && /*inputStarted*/ ctx[0]) return create_if_block$v;
    		return create_else_block$n;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	return {
    		c() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			p = element("p");
    			if_block2.c();
    			attr(input, "id", input_id_value = "form-field-color-" + /*fieldname*/ ctx[3]);
    			attr(input, "class", input_class_value = "input " + /*validationClasses*/ ctx[9]);
    			attr(input, "type", "color");
    			attr(input, "name", /*fieldname*/ ctx[3]);
    			attr(input, "invalid", /*invalid*/ ctx[10]);
    			input.required = /*required*/ ctx[5];
    			attr(input, "placeholder", /*placeholder*/ ctx[2]);
    			attr(input, "autocomplete", /*fieldname*/ ctx[3]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    			input.readOnly = /*readonly*/ ctx[6];
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    			attr(div, "class", div_class_value = "control " + /*iconClasses*/ ctx[12]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[9]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);
    			set_input_value(input, /*value*/ ctx[1]);
    			append(div, t0);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			insert(target, t2, anchor);
    			insert(target, p, anchor);
    			if_block2.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[19]),
    					listen(input, "change", /*onBlur*/ ctx[13]),
    					listen(input, "input", /*onInput*/ ctx[14])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*fieldname*/ 8 && input_id_value !== (input_id_value = "form-field-color-" + /*fieldname*/ ctx[3])) {
    				attr(input, "id", input_id_value);
    			}

    			if (dirty & /*validationClasses*/ 512 && input_class_value !== (input_class_value = "input " + /*validationClasses*/ ctx[9])) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*fieldname*/ 8) {
    				attr(input, "name", /*fieldname*/ ctx[3]);
    			}

    			if (dirty & /*invalid*/ 1024) {
    				attr(input, "invalid", /*invalid*/ ctx[10]);
    			}

    			if (dirty & /*required*/ 32) {
    				input.required = /*required*/ ctx[5];
    			}

    			if (dirty & /*placeholder*/ 4) {
    				attr(input, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (dirty & /*fieldname*/ 8) {
    				attr(input, "autocomplete", /*fieldname*/ ctx[3]);
    			}

    			if (dirty & /*fieldname*/ 8 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*readonly*/ 64) {
    				input.readOnly = /*readonly*/ ctx[6];
    			}

    			if (dirty & /*fieldname*/ 8 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}

    			if (/*icon*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$c(ctx);
    					if_block0.c();
    					if_block0.m(div, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*validated*/ ctx[8] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$p(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*iconClasses*/ 4096 && div_class_value !== (div_class_value = "control " + /*iconClasses*/ ctx[12])) {
    				attr(div, "class", div_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 512 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[9])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 8 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(p, "id", p_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach(t2);
    			if (detaching) detach(p);
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$M($$self, $$props, $$invalidate) {
    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;
    	let { value = '' } = $$props;
    	let { placeholder = 'Select you favorite color' } = $$props;
    	let { fieldname = 'color' } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.currentTarget.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.currentTarget.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	$$self.$$set = $$props => {
    		if ('inputStarted' in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ('fieldname' in $$props) $$invalidate(3, fieldname = $$props.fieldname);
    		if ('icon' in $$props) $$invalidate(4, icon = $$props.icon);
    		if ('required' in $$props) $$invalidate(5, required = $$props.required);
    		if ('readonly' in $$props) $$invalidate(6, readonly = $$props.readonly);
    		if ('valid' in $$props) $$invalidate(7, valid = $$props.valid);
    		if ('validated' in $$props) $$invalidate(8, validated = $$props.validated);
    		if ('errors' in $$props) $$invalidate(15, errors = $$props.errors);
    		if ('formErrors' in $$props) $$invalidate(16, formErrors = $$props.formErrors);
    		if ('formLevelError' in $$props) $$invalidate(17, formLevelError = $$props.formLevelError);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 16) {
    			$$invalidate(12, iconClasses = (icon ? ' has-icons-left ' : '') + ' has-icons-right ');
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 98304) {
    			$$invalidate(18, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 262148) {
    			$$invalidate(11, helper = allErrors ? allErrors.join(', ') : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 131200) {
    			$$invalidate(10, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 129) {
    			$$invalidate(9, validationClasses = valid === true || !inputStarted
    			? UICommon.CLASS_OK
    			: UICommon.CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		placeholder,
    		fieldname,
    		icon,
    		required,
    		readonly,
    		valid,
    		validated,
    		validationClasses,
    		invalid,
    		helper,
    		iconClasses,
    		onBlur,
    		onInput,
    		errors,
    		formErrors,
    		formLevelError,
    		allErrors,
    		input_input_handler
    	];
    }

    class Ui_color extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$M, create_fragment$M, safe_not_equal, {
    			inputStarted: 0,
    			value: 1,
    			placeholder: 2,
    			fieldname: 3,
    			icon: 4,
    			required: 5,
    			readonly: 6,
    			valid: 7,
    			validated: 8,
    			errors: 15,
    			formErrors: 16,
    			formLevelError: 17
    		});
    	}
    }

    /* src/elements/form/ui.date.svelte generated by Svelte v3.46.6 */

    function create_if_block_4$b(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[4]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 16 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[4])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (62:4) {#if validated === true }
    function create_if_block_1$o(ctx) {
    	let span;

    	function select_block_type(ctx, dirty) {
    		if (/*valid*/ ctx[7] === true) return create_if_block_2$g;
    		if (/*valid*/ ctx[7] === false) return create_if_block_3$e;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (66:35) 
    function create_if_block_3$e(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (64:6) {#if valid === true }
    function create_if_block_2$g(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (75:4) {:else}
    function create_else_block$m(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (73:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$u(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[11]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 2048) set_data(t, /*helper*/ ctx[11]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$L(ctx) {
    	let div;
    	let input;
    	let input_class_value;
    	let input_id_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t0;
    	let t1;
    	let div_class_value;
    	let t2;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[4] && create_if_block_4$b(ctx);
    	let if_block1 = /*validated*/ ctx[8] === true && create_if_block_1$o(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!(/*validated*/ ctx[8] && /*valid*/ ctx[7]) && /*inputStarted*/ ctx[0]) return create_if_block$u;
    		return create_else_block$m;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	return {
    		c() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			p = element("p");
    			if_block2.c();
    			attr(input, "class", input_class_value = "input " + /*validationClasses*/ ctx[9]);
    			attr(input, "id", input_id_value = "form-field-date-" + /*fieldname*/ ctx[3]);
    			attr(input, "type", "date");
    			attr(input, "name", /*fieldname*/ ctx[3]);
    			attr(input, "invalid", /*invalid*/ ctx[10]);
    			input.required = /*required*/ ctx[5];
    			attr(input, "placeholder", /*placeholder*/ ctx[2]);
    			input.readOnly = /*readonly*/ ctx[6];
    			attr(input, "autocomplete", /*fieldname*/ ctx[3]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    			attr(div, "class", div_class_value = "control " + /*iconClasses*/ ctx[12]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[9]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);
    			set_input_value(input, /*value*/ ctx[1]);
    			append(div, t0);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			insert(target, t2, anchor);
    			insert(target, p, anchor);
    			if_block2.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[19]),
    					listen(input, "change", /*onBlur*/ ctx[13]),
    					listen(input, "input", /*onInput*/ ctx[14])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*validationClasses*/ 512 && input_class_value !== (input_class_value = "input " + /*validationClasses*/ ctx[9])) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*fieldname*/ 8 && input_id_value !== (input_id_value = "form-field-date-" + /*fieldname*/ ctx[3])) {
    				attr(input, "id", input_id_value);
    			}

    			if (dirty & /*fieldname*/ 8) {
    				attr(input, "name", /*fieldname*/ ctx[3]);
    			}

    			if (dirty & /*invalid*/ 1024) {
    				attr(input, "invalid", /*invalid*/ ctx[10]);
    			}

    			if (dirty & /*required*/ 32) {
    				input.required = /*required*/ ctx[5];
    			}

    			if (dirty & /*placeholder*/ 4) {
    				attr(input, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (dirty & /*readonly*/ 64) {
    				input.readOnly = /*readonly*/ ctx[6];
    			}

    			if (dirty & /*fieldname*/ 8) {
    				attr(input, "autocomplete", /*fieldname*/ ctx[3]);
    			}

    			if (dirty & /*fieldname*/ 8 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*fieldname*/ 8 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}

    			if (/*icon*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$b(ctx);
    					if_block0.c();
    					if_block0.m(div, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*validated*/ ctx[8] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$o(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*iconClasses*/ 4096 && div_class_value !== (div_class_value = "control " + /*iconClasses*/ ctx[12])) {
    				attr(div, "class", div_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 512 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[9])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 8 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(p, "id", p_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach(t2);
    			if (detaching) detach(p);
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$L($$self, $$props, $$invalidate) {
    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;
    	let { value = '' } = $$props;
    	let { placeholder = 'Date and time of event' } = $$props;
    	let { fieldname = 'datetime' } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.currentTarget.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.currentTarget.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	$$self.$$set = $$props => {
    		if ('inputStarted' in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ('fieldname' in $$props) $$invalidate(3, fieldname = $$props.fieldname);
    		if ('icon' in $$props) $$invalidate(4, icon = $$props.icon);
    		if ('required' in $$props) $$invalidate(5, required = $$props.required);
    		if ('readonly' in $$props) $$invalidate(6, readonly = $$props.readonly);
    		if ('valid' in $$props) $$invalidate(7, valid = $$props.valid);
    		if ('validated' in $$props) $$invalidate(8, validated = $$props.validated);
    		if ('errors' in $$props) $$invalidate(15, errors = $$props.errors);
    		if ('formErrors' in $$props) $$invalidate(16, formErrors = $$props.formErrors);
    		if ('formLevelError' in $$props) $$invalidate(17, formLevelError = $$props.formLevelError);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 16) {
    			$$invalidate(12, iconClasses = (icon ? ' has-icons-left ' : '') + ' has-icons-right ');
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 98304) {
    			$$invalidate(18, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 262148) {
    			$$invalidate(11, helper = allErrors ? allErrors.join(', ') : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 131200) {
    			$$invalidate(10, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 129) {
    			$$invalidate(9, validationClasses = valid === true || !inputStarted
    			? UICommon.CLASS_OK
    			: UICommon.CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		placeholder,
    		fieldname,
    		icon,
    		required,
    		readonly,
    		valid,
    		validated,
    		validationClasses,
    		invalid,
    		helper,
    		iconClasses,
    		onBlur,
    		onInput,
    		errors,
    		formErrors,
    		formLevelError,
    		allErrors,
    		input_input_handler
    	];
    }

    class Ui_date extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$L, create_fragment$L, safe_not_equal, {
    			inputStarted: 0,
    			value: 1,
    			placeholder: 2,
    			fieldname: 3,
    			icon: 4,
    			required: 5,
    			readonly: 6,
    			valid: 7,
    			validated: 8,
    			errors: 15,
    			formErrors: 16,
    			formLevelError: 17
    		});
    	}
    }

    /* src/elements/form/ui.email.svelte generated by Svelte v3.46.6 */

    function create_if_block_4$a(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[4]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 16 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[4])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (67:4) {#if validated === true }
    function create_if_block_1$n(ctx) {
    	let span;

    	function select_block_type(ctx, dirty) {
    		if (/*valid*/ ctx[8] === true) return create_if_block_2$f;
    		if (/*valid*/ ctx[8] === false) return create_if_block_3$d;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (71:35) 
    function create_if_block_3$d(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (69:6) {#if valid === true }
    function create_if_block_2$f(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (80:4) {:else}
    function create_else_block$l(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (78:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$t(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[12]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 4096) set_data(t, /*helper*/ ctx[12]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$K(ctx) {
    	let div;
    	let input;
    	let input_class_value;
    	let input_id_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t0;
    	let t1;
    	let div_class_value;
    	let t2;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[4] && create_if_block_4$a(ctx);
    	let if_block1 = /*validated*/ ctx[9] === true && create_if_block_1$n(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!(/*validated*/ ctx[9] && /*valid*/ ctx[8]) && /*inputStarted*/ ctx[0]) return create_if_block$t;
    		return create_else_block$l;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	return {
    		c() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			p = element("p");
    			if_block2.c();
    			attr(input, "class", input_class_value = "input " + /*validationClasses*/ ctx[10]);
    			attr(input, "id", input_id_value = "form-field-email-" + /*fieldname*/ ctx[3]);
    			attr(input, "type", "email");
    			attr(input, "name", /*fieldname*/ ctx[3]);
    			attr(input, "invalid", /*invalid*/ ctx[11]);
    			input.required = /*required*/ ctx[5];
    			input.readOnly = /*readonly*/ ctx[6];
    			input.disabled = /*disabled*/ ctx[7];
    			attr(input, "placeholder", /*placeholder*/ ctx[2]);
    			attr(input, "autocomplete", /*fieldname*/ ctx[3]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    			attr(div, "class", div_class_value = "control " + /*iconClasses*/ ctx[13]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[10]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);
    			set_input_value(input, /*value*/ ctx[1]);
    			append(div, t0);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			insert(target, t2, anchor);
    			insert(target, p, anchor);
    			if_block2.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[20]),
    					listen(input, "change", /*onBlur*/ ctx[14]),
    					listen(input, "input", /*onInput*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*validationClasses*/ 1024 && input_class_value !== (input_class_value = "input " + /*validationClasses*/ ctx[10])) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*fieldname*/ 8 && input_id_value !== (input_id_value = "form-field-email-" + /*fieldname*/ ctx[3])) {
    				attr(input, "id", input_id_value);
    			}

    			if (dirty & /*fieldname*/ 8) {
    				attr(input, "name", /*fieldname*/ ctx[3]);
    			}

    			if (dirty & /*invalid*/ 2048) {
    				attr(input, "invalid", /*invalid*/ ctx[11]);
    			}

    			if (dirty & /*required*/ 32) {
    				input.required = /*required*/ ctx[5];
    			}

    			if (dirty & /*readonly*/ 64) {
    				input.readOnly = /*readonly*/ ctx[6];
    			}

    			if (dirty & /*disabled*/ 128) {
    				input.disabled = /*disabled*/ ctx[7];
    			}

    			if (dirty & /*placeholder*/ 4) {
    				attr(input, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (dirty & /*fieldname*/ 8) {
    				attr(input, "autocomplete", /*fieldname*/ ctx[3]);
    			}

    			if (dirty & /*fieldname*/ 8 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*fieldname*/ 8 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}

    			if (/*icon*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$a(ctx);
    					if_block0.c();
    					if_block0.m(div, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*validated*/ ctx[9] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$n(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*iconClasses*/ 8192 && div_class_value !== (div_class_value = "control " + /*iconClasses*/ ctx[13])) {
    				attr(div, "class", div_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 1024 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[10])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 8 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(p, "id", p_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach(t2);
    			if (detaching) detach(p);
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$K($$self, $$props, $$invalidate) {
    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;
    	let { value = '' } = $$props;
    	let { placeholder = '' } = $$props;
    	let { fieldname = 'email' } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.currentTarget.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.currentTarget.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	$$self.$$set = $$props => {
    		if ('inputStarted' in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ('fieldname' in $$props) $$invalidate(3, fieldname = $$props.fieldname);
    		if ('icon' in $$props) $$invalidate(4, icon = $$props.icon);
    		if ('required' in $$props) $$invalidate(5, required = $$props.required);
    		if ('readonly' in $$props) $$invalidate(6, readonly = $$props.readonly);
    		if ('disabled' in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ('valid' in $$props) $$invalidate(8, valid = $$props.valid);
    		if ('validated' in $$props) $$invalidate(9, validated = $$props.validated);
    		if ('errors' in $$props) $$invalidate(16, errors = $$props.errors);
    		if ('formErrors' in $$props) $$invalidate(17, formErrors = $$props.formErrors);
    		if ('formLevelError' in $$props) $$invalidate(18, formLevelError = $$props.formLevelError);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 16) {
    			$$invalidate(13, iconClasses = (icon ? ' has-icons-left ' : '') + ' has-icons-right ');
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 196608) {
    			$$invalidate(19, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 524292) {
    			$$invalidate(12, helper = allErrors ? allErrors.join(', ') : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 262400) {
    			$$invalidate(11, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 257) {
    			$$invalidate(10, validationClasses = valid === true || !inputStarted
    			? UICommon.CLASS_OK
    			: UICommon.CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		placeholder,
    		fieldname,
    		icon,
    		required,
    		readonly,
    		disabled,
    		valid,
    		validated,
    		validationClasses,
    		invalid,
    		helper,
    		iconClasses,
    		onBlur,
    		onInput,
    		errors,
    		formErrors,
    		formLevelError,
    		allErrors,
    		input_input_handler
    	];
    }

    class Ui_email extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$K, create_fragment$K, safe_not_equal, {
    			inputStarted: 0,
    			value: 1,
    			placeholder: 2,
    			fieldname: 3,
    			icon: 4,
    			required: 5,
    			readonly: 6,
    			disabled: 7,
    			valid: 8,
    			validated: 9,
    			errors: 16,
    			formErrors: 17,
    			formLevelError: 18
    		});
    	}
    }

    /* src/elements/form/ui.hidden.svelte generated by Svelte v3.46.6 */

    function create_fragment$J(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			input = element("input");
    			attr(input, "type", "hidden");
    			input.required = /*required*/ ctx[2];
    			input.readOnly = /*readonly*/ ctx[3];
    			attr(input, "name", /*fieldname*/ ctx[1]);
    		},
    		m(target, anchor) {
    			insert(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen(input, "input", /*input_input_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*required*/ 4) {
    				input.required = /*required*/ ctx[2];
    			}

    			if (dirty & /*readonly*/ 8) {
    				input.readOnly = /*readonly*/ ctx[3];
    			}

    			if (dirty & /*fieldname*/ 2) {
    				attr(input, "name", /*fieldname*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(input);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$J($$self, $$props, $$invalidate) {
    	let { value = '' } = $$props;
    	let { fieldname = 'hidden' } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('fieldname' in $$props) $$invalidate(1, fieldname = $$props.fieldname);
    		if ('required' in $$props) $$invalidate(2, required = $$props.required);
    		if ('readonly' in $$props) $$invalidate(3, readonly = $$props.readonly);
    	};

    	return [value, fieldname, required, readonly, input_input_handler];
    }

    class Ui_hidden extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$J, create_fragment$J, safe_not_equal, {
    			value: 0,
    			fieldname: 1,
    			required: 2,
    			readonly: 3
    		});
    	}
    }

    /* src/elements/form/ui.label.svelte generated by Svelte v3.46.6 */

    function create_fragment$I(ctx) {
    	let label_1;
    	let t_value = /*$LOCALE*/ ctx[2][/*label*/ ctx[1]] + "";
    	let t;

    	return {
    		c() {
    			label_1 = element("label");
    			t = text(t_value);
    			attr(label_1, "class", "label");
    			attr(label_1, "for", /*id*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, label_1, anchor);
    			append(label_1, t);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*$LOCALE, label*/ 6 && t_value !== (t_value = /*$LOCALE*/ ctx[2][/*label*/ ctx[1]] + "")) set_data(t, t_value);

    			if (dirty & /*id*/ 1) {
    				attr(label_1, "for", /*id*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(label_1);
    		}
    	};
    }

    function instance$I($$self, $$props, $$invalidate) {
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(2, $LOCALE = $$value));
    	let { id } = $$props;
    	let { label = 'label' } = $$props;

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('label' in $$props) $$invalidate(1, label = $$props.label);
    	};

    	return [id, label, $LOCALE];
    }

    class Ui_label extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$I, create_fragment$I, safe_not_equal, { id: 0, label: 1 });
    	}
    }

    /* src/elements/form/ui.password.svelte generated by Svelte v3.46.6 */

    function create_if_block_4$9(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[4]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 16 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[4])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (58:4) {#if validated === true }
    function create_if_block_1$m(ctx) {
    	let span;

    	function select_block_type(ctx, dirty) {
    		if (/*valid*/ ctx[7] === true) return create_if_block_2$e;
    		if (/*valid*/ ctx[7] === false) return create_if_block_3$c;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (62:35) 
    function create_if_block_3$c(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (60:6) {#if valid === true }
    function create_if_block_2$e(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (71:4) {:else}
    function create_else_block$k(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (69:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$s(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[11]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 2048) set_data(t, /*helper*/ ctx[11]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$H(ctx) {
    	let div;
    	let input;
    	let input_class_value;
    	let input_id_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t0;
    	let t1;
    	let div_class_value;
    	let t2;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[4] && create_if_block_4$9(ctx);
    	let if_block1 = /*validated*/ ctx[8] === true && create_if_block_1$m(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!(/*validated*/ ctx[8] && /*valid*/ ctx[7]) && /*inputStarted*/ ctx[0]) return create_if_block$s;
    		return create_else_block$k;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	return {
    		c() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			p = element("p");
    			if_block2.c();
    			attr(input, "class", input_class_value = "input " + /*validationClasses*/ ctx[9]);
    			input.readOnly = /*readonly*/ ctx[6];
    			attr(input, "id", input_id_value = "form-field-password-" + /*fieldname*/ ctx[3]);
    			attr(input, "type", "password");
    			attr(input, "name", /*fieldname*/ ctx[3]);
    			attr(input, "invalid", /*invalid*/ ctx[10]);
    			input.required = /*required*/ ctx[5];
    			attr(input, "placeholder", /*placeholder*/ ctx[2]);
    			attr(input, "autocomplete", /*fieldname*/ ctx[3]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    			attr(div, "class", div_class_value = "control " + /*iconClasses*/ ctx[12]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[9]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);
    			set_input_value(input, /*value*/ ctx[1]);
    			append(div, t0);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			insert(target, t2, anchor);
    			insert(target, p, anchor);
    			if_block2.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[19]),
    					listen(input, "change", /*onBlur*/ ctx[13]),
    					listen(input, "input", /*onInput*/ ctx[14])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*validationClasses*/ 512 && input_class_value !== (input_class_value = "input " + /*validationClasses*/ ctx[9])) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*readonly*/ 64) {
    				input.readOnly = /*readonly*/ ctx[6];
    			}

    			if (dirty & /*fieldname*/ 8 && input_id_value !== (input_id_value = "form-field-password-" + /*fieldname*/ ctx[3])) {
    				attr(input, "id", input_id_value);
    			}

    			if (dirty & /*fieldname*/ 8) {
    				attr(input, "name", /*fieldname*/ ctx[3]);
    			}

    			if (dirty & /*invalid*/ 1024) {
    				attr(input, "invalid", /*invalid*/ ctx[10]);
    			}

    			if (dirty & /*required*/ 32) {
    				input.required = /*required*/ ctx[5];
    			}

    			if (dirty & /*placeholder*/ 4) {
    				attr(input, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (dirty & /*fieldname*/ 8) {
    				attr(input, "autocomplete", /*fieldname*/ ctx[3]);
    			}

    			if (dirty & /*fieldname*/ 8 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*fieldname*/ 8 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}

    			if (/*icon*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$9(ctx);
    					if_block0.c();
    					if_block0.m(div, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*validated*/ ctx[8] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$m(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*iconClasses*/ 4096 && div_class_value !== (div_class_value = "control " + /*iconClasses*/ ctx[12])) {
    				attr(div, "class", div_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 512 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[9])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 8 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(p, "id", p_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach(t2);
    			if (detaching) detach(p);
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$H($$self, $$props, $$invalidate) {
    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;
    	let { value = '' } = $$props;
    	let { placeholder = 'input some text here, please' } = $$props;
    	let { fieldname = 'password' } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.currentTarget.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.currentTarget.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	$$self.$$set = $$props => {
    		if ('inputStarted' in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ('fieldname' in $$props) $$invalidate(3, fieldname = $$props.fieldname);
    		if ('icon' in $$props) $$invalidate(4, icon = $$props.icon);
    		if ('required' in $$props) $$invalidate(5, required = $$props.required);
    		if ('readonly' in $$props) $$invalidate(6, readonly = $$props.readonly);
    		if ('valid' in $$props) $$invalidate(7, valid = $$props.valid);
    		if ('validated' in $$props) $$invalidate(8, validated = $$props.validated);
    		if ('errors' in $$props) $$invalidate(15, errors = $$props.errors);
    		if ('formErrors' in $$props) $$invalidate(16, formErrors = $$props.formErrors);
    		if ('formLevelError' in $$props) $$invalidate(17, formLevelError = $$props.formLevelError);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 16) {
    			$$invalidate(12, iconClasses = (icon ? ' has-icons-left ' : '') + ' has-icons-right ');
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 98304) {
    			$$invalidate(18, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 262148) {
    			$$invalidate(11, helper = allErrors ? allErrors.join(', ') : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 131200) {
    			$$invalidate(10, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 129) {
    			$$invalidate(9, validationClasses = valid === true || !inputStarted
    			? UICommon.CLASS_OK
    			: UICommon.CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		placeholder,
    		fieldname,
    		icon,
    		required,
    		readonly,
    		valid,
    		validated,
    		validationClasses,
    		invalid,
    		helper,
    		iconClasses,
    		onBlur,
    		onInput,
    		errors,
    		formErrors,
    		formLevelError,
    		allErrors,
    		input_input_handler
    	];
    }

    class Ui_password extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$H, create_fragment$H, safe_not_equal, {
    			inputStarted: 0,
    			value: 1,
    			placeholder: 2,
    			fieldname: 3,
    			icon: 4,
    			required: 5,
    			readonly: 6,
    			valid: 7,
    			validated: 8,
    			errors: 15,
    			formErrors: 16,
    			formLevelError: 17
    		});
    	}
    }

    /* src/elements/form/ui.select.svelte generated by Svelte v3.46.6 */

    function get_each_context$d(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    // (85:8) {#if placeholder.length > 0 }
    function create_if_block_6$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*value*/ ctx[1]) return create_if_block_7$2;
    		return create_else_block_2$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (88:8) {:else}
    function create_else_block_2$2(ctx) {
    	let option;
    	let t_value = /*$LOCALE*/ ctx[16][/*placeholder*/ ctx[3]] + "";
    	let t;

    	return {
    		c() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = CLEAR_MACRO;
    			option.value = option.__value;
    			option.selected = "selected";
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, placeholder*/ 65544 && t_value !== (t_value = /*$LOCALE*/ ctx[16][/*placeholder*/ ctx[3]] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    // (86:8) {#if value }
    function create_if_block_7$2(ctx) {
    	let option;
    	let t_value = /*$LOCALE*/ ctx[16][/*placeholder*/ ctx[3]] + "";
    	let t;

    	return {
    		c() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = CLEAR_MACRO;
    			option.value = option.__value;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, placeholder*/ 65544 && t_value !== (t_value = /*$LOCALE*/ ctx[16][/*placeholder*/ ctx[3]] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    // (95:8) {:else}
    function create_else_block_1$3(ctx) {
    	let option;
    	let t_value = /*$LOCALE*/ ctx[16][/*variant*/ ctx[25].title] + "";
    	let t;
    	let option_value_value;
    	let option_selected_value;

    	return {
    		c() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*variant*/ ctx[25].id;
    			option.value = option.__value;
    			option.selected = option_selected_value = /*value*/ ctx[1] == /*variant*/ ctx[25].id;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, variants*/ 65540 && t_value !== (t_value = /*$LOCALE*/ ctx[16][/*variant*/ ctx[25].title] + "")) set_data(t, t_value);

    			if (dirty & /*variants*/ 4 && option_value_value !== (option_value_value = /*variant*/ ctx[25].id)) {
    				option.__value = option_value_value;
    				option.value = option.__value;
    			}

    			if (dirty & /*value, variants*/ 6 && option_selected_value !== (option_selected_value = /*value*/ ctx[1] == /*variant*/ ctx[25].id)) {
    				option.selected = option_selected_value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    // (93:8) {#if multiple }
    function create_if_block_5$5(ctx) {
    	let option;
    	let t_value = /*$LOCALE*/ ctx[16][/*variant*/ ctx[25].title] + "";
    	let t;
    	let option_value_value;
    	let option_selected_value;

    	return {
    		c() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*variant*/ ctx[25].id;
    			option.value = option.__value;
    			option.selected = option_selected_value = /*value*/ ctx[1] && /*value*/ ctx[1].indexOf(/*variant*/ ctx[25].id) > -1;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, variants*/ 65540 && t_value !== (t_value = /*$LOCALE*/ ctx[16][/*variant*/ ctx[25].title] + "")) set_data(t, t_value);

    			if (dirty & /*variants*/ 4 && option_value_value !== (option_value_value = /*variant*/ ctx[25].id)) {
    				option.__value = option_value_value;
    				option.value = option.__value;
    			}

    			if (dirty & /*value, variants*/ 6 && option_selected_value !== (option_selected_value = /*value*/ ctx[1] && /*value*/ ctx[1].indexOf(/*variant*/ ctx[25].id) > -1)) {
    				option.selected = option_selected_value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    // (92:8) {#each variants as variant}
    function create_each_block$d(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*multiple*/ ctx[8]) return create_if_block_5$5;
    		return create_else_block_1$3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (101:4) {#if icon }
    function create_if_block_4$8(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[5]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 32 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[5])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (104:4) {#if validated === true }
    function create_if_block_1$l(ctx) {
    	let span;

    	function select_block_type_2(ctx, dirty) {
    		if (/*valid*/ ctx[10] === true) return create_if_block_2$d;
    		if (/*valid*/ ctx[10] === false) return create_if_block_3$b;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_2(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (108:35) 
    function create_if_block_3$b(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (106:6) {#if valid === true }
    function create_if_block_2$d(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (117:4) {:else}
    function create_else_block$j(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (115:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$r(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[14]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 16384) set_data(t, /*helper*/ ctx[14]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$G(ctx) {
    	let div1;
    	let div0;
    	let select;
    	let if_block0_anchor;
    	let select_id_value;
    	let select_size_value;
    	let div0_class_value;
    	let t0;
    	let t1;
    	let div1_class_value;
    	let t2;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*placeholder*/ ctx[3].length > 0 && create_if_block_6$2(ctx);
    	let each_value = /*variants*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$d(get_each_context$d(ctx, each_value, i));
    	}

    	let if_block1 = /*icon*/ ctx[5] && create_if_block_4$8(ctx);
    	let if_block2 = /*validated*/ ctx[11] === true && create_if_block_1$l(ctx);

    	function select_block_type_3(ctx, dirty) {
    		if (!(/*validated*/ ctx[11] && /*valid*/ ctx[10]) && /*inputStarted*/ ctx[0]) return create_if_block$r;
    		return create_else_block$j;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block3 = current_block_type(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			select = element("select");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			p = element("p");
    			if_block3.c();
    			attr(select, "id", select_id_value = "form-field-select-" + /*fieldname*/ ctx[4]);
    			attr(select, "name", /*fieldname*/ ctx[4]);
    			attr(select, "readonly", /*readonly*/ ctx[7]);
    			select.required = /*required*/ ctx[6];
    			select.multiple = /*multiple*/ ctx[8];
    			attr(select, "size", select_size_value = /*multiple*/ ctx[8] ? /*size*/ ctx[9] : false);
    			attr(div0, "class", div0_class_value = "select " + /*validationClasses*/ ctx[13] + " " + /*multipleClass*/ ctx[12]);
    			attr(div1, "class", div1_class_value = "control " + /*iconClasses*/ ctx[15]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[13]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, select);
    			if (if_block0) if_block0.m(select, null);
    			append(select, if_block0_anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			append(div1, t0);
    			if (if_block1) if_block1.m(div1, null);
    			append(div1, t1);
    			if (if_block2) if_block2.m(div1, null);
    			insert(target, t2, anchor);
    			insert(target, p, anchor);
    			if_block3.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(select, "blur", /*onBlur*/ ctx[17]),
    					listen(select, "input", /*onInput*/ ctx[18])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (/*placeholder*/ ctx[3].length > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6$2(ctx);
    					if_block0.c();
    					if_block0.m(select, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*variants, value, $LOCALE, multiple*/ 65798) {
    				each_value = /*variants*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$d(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$d(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*fieldname*/ 16 && select_id_value !== (select_id_value = "form-field-select-" + /*fieldname*/ ctx[4])) {
    				attr(select, "id", select_id_value);
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(select, "name", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*readonly*/ 128) {
    				attr(select, "readonly", /*readonly*/ ctx[7]);
    			}

    			if (dirty & /*required*/ 64) {
    				select.required = /*required*/ ctx[6];
    			}

    			if (dirty & /*multiple*/ 256) {
    				select.multiple = /*multiple*/ ctx[8];
    			}

    			if (dirty & /*multiple, size*/ 768 && select_size_value !== (select_size_value = /*multiple*/ ctx[8] ? /*size*/ ctx[9] : false)) {
    				attr(select, "size", select_size_value);
    			}

    			if (dirty & /*validationClasses, multipleClass*/ 12288 && div0_class_value !== (div0_class_value = "select " + /*validationClasses*/ ctx[13] + " " + /*multipleClass*/ ctx[12])) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (/*icon*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4$8(ctx);
    					if_block1.c();
    					if_block1.m(div1, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*validated*/ ctx[11] === true) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$l(ctx);
    					if_block2.c();
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*iconClasses*/ 32768 && div1_class_value !== (div1_class_value = "control " + /*iconClasses*/ ctx[15])) {
    				attr(div1, "class", div1_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if_block3.d(1);
    				if_block3 = current_block_type(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 8192 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[13])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 16 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(p, "id", p_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (detaching) detach(t2);
    			if (detaching) detach(p);
    			if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    const CLEAR_MACRO = '__CLEAR__';

    function instance$G($$self, $$props, $$invalidate) {
    	let iconClasses;
    	let allErrors;
    	let helper;
    	let validationClasses;
    	let multipleClass;
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(16, $LOCALE = $$value));
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;
    	let { value = '' } = $$props;
    	let { variants = [] } = $$props;
    	let { placeholder = 'empty select item' } = $$props;
    	let { fieldname = 'select' } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { multiple = false } = $$props;
    	let { size = 8 } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.currentTarget.value
    		};

    		if (multiple) {
    			$$invalidate(1, value = Array.from(ev.target.selectedOptions).map(el => el.value));

    			if (value.indexOf(CLEAR_MACRO) > -1) {
    				$$invalidate(1, value = []);
    			}

    			data.value = value;
    		} else {
    			if (data.value === CLEAR_MACRO) {
    				$$invalidate(1, value = '');
    			}
    		}

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.currentTarget.value
    		};

    		if (multiple) {
    			$$invalidate(1, value = Array.from(ev.target.selectedOptions).map(el => el.value));

    			if (value.indexOf(CLEAR_MACRO) > -1) {
    				$$invalidate(1, value = []);
    			}

    			data.value = value;
    		} else {
    			if (data.value === CLEAR_MACRO) {
    				$$invalidate(1, value = '');
    			}
    		}

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	$$self.$$set = $$props => {
    		if ('inputStarted' in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('variants' in $$props) $$invalidate(2, variants = $$props.variants);
    		if ('placeholder' in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ('fieldname' in $$props) $$invalidate(4, fieldname = $$props.fieldname);
    		if ('icon' in $$props) $$invalidate(5, icon = $$props.icon);
    		if ('required' in $$props) $$invalidate(6, required = $$props.required);
    		if ('readonly' in $$props) $$invalidate(7, readonly = $$props.readonly);
    		if ('multiple' in $$props) $$invalidate(8, multiple = $$props.multiple);
    		if ('size' in $$props) $$invalidate(9, size = $$props.size);
    		if ('valid' in $$props) $$invalidate(10, valid = $$props.valid);
    		if ('validated' in $$props) $$invalidate(11, validated = $$props.validated);
    		if ('errors' in $$props) $$invalidate(19, errors = $$props.errors);
    		if ('formErrors' in $$props) $$invalidate(20, formErrors = $$props.formErrors);
    		if ('formLevelError' in $$props) $$invalidate(21, formLevelError = $$props.formLevelError);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 32) {
    			$$invalidate(15, iconClasses = (icon ? ' has-icons-left ' : '') + ' has-icons-right ');
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 1572864) {
    			$$invalidate(22, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 4194312) {
    			$$invalidate(14, helper = allErrors ? allErrors.join(', ') : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 2098176) ;

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 1025) {
    			$$invalidate(13, validationClasses = valid === true || !inputStarted
    			? UICommon.CLASS_OK
    			: UICommon.CLASS_ERR);
    		}

    		if ($$self.$$.dirty & /*multiple*/ 256) {
    			$$invalidate(12, multipleClass = multiple ? ' is-multiple ' : '');
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		variants,
    		placeholder,
    		fieldname,
    		icon,
    		required,
    		readonly,
    		multiple,
    		size,
    		valid,
    		validated,
    		multipleClass,
    		validationClasses,
    		helper,
    		iconClasses,
    		$LOCALE,
    		onBlur,
    		onInput,
    		errors,
    		formErrors,
    		formLevelError,
    		allErrors
    	];
    }

    class Ui_select extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$G, create_fragment$G, safe_not_equal, {
    			inputStarted: 0,
    			value: 1,
    			variants: 2,
    			placeholder: 3,
    			fieldname: 4,
    			icon: 5,
    			required: 6,
    			readonly: 7,
    			multiple: 8,
    			size: 9,
    			valid: 10,
    			validated: 11,
    			errors: 19,
    			formErrors: 20,
    			formLevelError: 21
    		});
    	}
    }

    /* src/elements/form/ui.switch.svelte generated by Svelte v3.46.6 */

    function create_else_block$i(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (69:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$q(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[13]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 8192) set_data(t, /*helper*/ ctx[13]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$F(ctx) {
    	let div;
    	let input;
    	let input_class_value;
    	let input_id_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t0;
    	let label_1;
    	let t1_value = /*$LOCALE*/ ctx[14][/*label*/ ctx[2]] + "";
    	let t1;
    	let label_1_for_value;
    	let t2;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!(/*validated*/ ctx[10] && /*valid*/ ctx[8]) && /*inputStarted*/ ctx[0]) return create_if_block$q;
    		return create_else_block$i;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label_1 = element("label");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			if_block.c();
    			attr(input, "type", "checkbox");
    			attr(input, "class", input_class_value = "switch " + /*styling*/ ctx[9]);
    			attr(input, "id", input_id_value = "form-field-switch-" + /*fieldname*/ ctx[4]);
    			attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			attr(input, "name", /*fieldname*/ ctx[4]);
    			input.disabled = /*disabled*/ ctx[7];
    			input.required = /*required*/ ctx[5];
    			input.readOnly = /*readonly*/ ctx[6];
    			attr(input, "invalid", /*invalid*/ ctx[12]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(label_1, "class", "label");
    			attr(label_1, "for", label_1_for_value = "form-field-switch-" + /*fieldname*/ ctx[4]);
    			attr(div, "class", "control");
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[11]);
    			attr(p, "id", p_id_value = "form-field-helper-" + /*fieldname*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);
    			input.checked = /*value*/ ctx[1];
    			append(div, t0);
    			append(div, label_1);
    			append(label_1, t1);
    			insert(target, t2, anchor);
    			insert(target, p, anchor);
    			if_block.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "change", /*input_change_handler*/ ctx[22]),
    					listen(input, "blur", /*onBlur*/ ctx[15]),
    					listen(input, "input", /*onInput*/ ctx[16])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*styling*/ 512 && input_class_value !== (input_class_value = "switch " + /*styling*/ ctx[9])) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*fieldname*/ 16 && input_id_value !== (input_id_value = "form-field-switch-" + /*fieldname*/ ctx[4])) {
    				attr(input, "id", input_id_value);
    			}

    			if (dirty & /*placeholder*/ 8) {
    				attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "name", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*disabled*/ 128) {
    				input.disabled = /*disabled*/ ctx[7];
    			}

    			if (dirty & /*required*/ 32) {
    				input.required = /*required*/ ctx[5];
    			}

    			if (dirty & /*readonly*/ 64) {
    				input.readOnly = /*readonly*/ ctx[6];
    			}

    			if (dirty & /*invalid*/ 4096) {
    				attr(input, "invalid", /*invalid*/ ctx[12]);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*value*/ 2) {
    				input.checked = /*value*/ ctx[1];
    			}

    			if (dirty & /*$LOCALE, label*/ 16388 && t1_value !== (t1_value = /*$LOCALE*/ ctx[14][/*label*/ ctx[2]] + "")) set_data(t1, t1_value);

    			if (dirty & /*fieldname*/ 16 && label_1_for_value !== (label_1_for_value = "form-field-switch-" + /*fieldname*/ ctx[4])) {
    				attr(label_1, "for", label_1_for_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 2048 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[11])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 16 && p_id_value !== (p_id_value = "form-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(p, "id", p_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			if (detaching) detach(t2);
    			if (detaching) detach(p);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$F($$self, $$props, $$invalidate) {
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(14, $LOCALE = $$value));
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;
    	let { value = false } = $$props;
    	let { label = 'textfield' } = $$props;
    	let { placeholder = 'input some text here, please' } = $$props;
    	let { fieldname = 'textfield' } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { valid = true } = $$props;
    	let { styling = " is-rounded is-success " } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.currentTarget.type === 'checkbox'
    			? ev.currentTarget.checked
    			: value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.currentTarget.type === 'checkbox'
    			? ev.currentTarget.checked
    			: value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function input_change_handler() {
    		value = this.checked;
    		$$invalidate(1, value);
    	}

    	$$self.$$set = $$props => {
    		if ('inputStarted' in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('label' in $$props) $$invalidate(2, label = $$props.label);
    		if ('placeholder' in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ('fieldname' in $$props) $$invalidate(4, fieldname = $$props.fieldname);
    		if ('icon' in $$props) $$invalidate(17, icon = $$props.icon);
    		if ('required' in $$props) $$invalidate(5, required = $$props.required);
    		if ('readonly' in $$props) $$invalidate(6, readonly = $$props.readonly);
    		if ('disabled' in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ('valid' in $$props) $$invalidate(8, valid = $$props.valid);
    		if ('styling' in $$props) $$invalidate(9, styling = $$props.styling);
    		if ('validated' in $$props) $$invalidate(10, validated = $$props.validated);
    		if ('errors' in $$props) $$invalidate(18, errors = $$props.errors);
    		if ('formErrors' in $$props) $$invalidate(19, formErrors = $$props.formErrors);
    		if ('formLevelError' in $$props) $$invalidate(20, formLevelError = $$props.formLevelError);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 131072) ;

    		if ($$self.$$.dirty & /*errors, formErrors*/ 786432) {
    			$$invalidate(21, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 2097160) {
    			$$invalidate(13, helper = allErrors ? allErrors.join(', ') : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 1048832) {
    			$$invalidate(12, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 257) {
    			$$invalidate(11, validationClasses = valid === true || !inputStarted
    			? UICommon.CLASS_OK
    			: UICommon.CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		label,
    		placeholder,
    		fieldname,
    		required,
    		readonly,
    		disabled,
    		valid,
    		styling,
    		validated,
    		validationClasses,
    		invalid,
    		helper,
    		$LOCALE,
    		onBlur,
    		onInput,
    		icon,
    		errors,
    		formErrors,
    		formLevelError,
    		allErrors,
    		input_change_handler
    	];
    }

    class Ui_switch$1 extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$F, create_fragment$F, safe_not_equal, {
    			inputStarted: 0,
    			value: 1,
    			label: 2,
    			placeholder: 3,
    			fieldname: 4,
    			icon: 17,
    			required: 5,
    			readonly: 6,
    			disabled: 7,
    			valid: 8,
    			styling: 9,
    			validated: 10,
    			errors: 18,
    			formErrors: 19,
    			formLevelError: 20
    		});
    	}
    }

    /* src/elements/form/ui.tag.svelte generated by Svelte v3.46.6 */

    function get_each_context$c(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (56:6) {#if !readonly }
    function create_if_block_1$k(ctx) {
    	let button;
    	let button_data_id_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			attr(button, "data-id", button_data_id_value = /*item*/ ctx[13].id);
    			attr(button, "class", "delete is-small");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*remove*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*items*/ 1 && button_data_id_value !== (button_data_id_value = /*item*/ ctx[13].id)) {
    				attr(button, "data-id", button_data_id_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (54:4) {#each items as item (item.id)}
    function create_each_block_1$4(key_1, ctx) {
    	let span;
    	let t0_value = /*$LOCALE*/ ctx[4][/*item*/ ctx[13].title] + "";
    	let t0;
    	let t1;
    	let t2;
    	let span_class_value;
    	let if_block = !/*readonly*/ ctx[2] && create_if_block_1$k(ctx);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr(span, "class", span_class_value = "mx-1 tag is-" + /*item*/ ctx[13].type);
    			this.first = span;
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t0);
    			append(span, t1);
    			if (if_block) if_block.m(span, null);
    			append(span, t2);
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$LOCALE, items*/ 17 && t0_value !== (t0_value = /*$LOCALE*/ ctx[4][/*item*/ ctx[13].title] + "")) set_data(t0, t0_value);

    			if (!/*readonly*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$k(ctx);
    					if_block.c();
    					if_block.m(span, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*items*/ 1 && span_class_value !== (span_class_value = "mx-1 tag is-" + /*item*/ ctx[13].type)) {
    				attr(span, "class", span_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    			if (if_block) if_block.d();
    		}
    	};
    }

    // (62:2) {#if !readonly }
    function create_if_block$p(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let select;
    	let option;
    	let t0_value = /*$LOCALE*/ ctx[4]['Выберите из списка...'] + "";
    	let t0;
    	let t1;
    	let button;
    	let t2_value = /*$LOCALE*/ ctx[4]['Добавить'] + "";
    	let t2;
    	let mounted;
    	let dispose;
    	let each_value = /*variants*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$c(get_each_context$c(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			select = element("select");
    			option = element("option");
    			t0 = text(t0_value);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			button = element("button");
    			t2 = text(t2_value);
    			option.__value = "-1";
    			option.value = option.__value;
    			option.selected = true;
    			attr(div0, "class", "select is-small");
    			attr(button, "class", "button is-primary is-small");
    			attr(div1, "class", "control");
    			attr(div2, "class", "column");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div1);
    			append(div1, div0);
    			append(div0, select);
    			append(select, option);
    			append(option, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			append(div1, t1);
    			append(div1, button);
    			append(button, t2);

    			if (!mounted) {
    				dispose = listen(button, "click", /*add*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE*/ 16 && t0_value !== (t0_value = /*$LOCALE*/ ctx[4]['Выберите из списка...'] + "")) set_data(t0, t0_value);

    			if (dirty & /*variants, $LOCALE*/ 18) {
    				each_value = /*variants*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$c(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$c(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$LOCALE*/ 16 && t2_value !== (t2_value = /*$LOCALE*/ ctx[4]['Добавить'] + "")) set_data(t2, t2_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (68:10) {#each variants as variant}
    function create_each_block$c(ctx) {
    	let option;
    	let t_value = /*$LOCALE*/ ctx[4][/*variant*/ ctx[10].title] + "";
    	let t;
    	let option_value_value;

    	return {
    		c() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*variant*/ ctx[10].id;
    			option.value = option.__value;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, variants*/ 18 && t_value !== (t_value = /*$LOCALE*/ ctx[4][/*variant*/ ctx[10].title] + "")) set_data(t, t_value);

    			if (dirty & /*variants*/ 2 && option_value_value !== (option_value_value = /*variant*/ ctx[10].id)) {
    				option.__value = option_value_value;
    				option.value = option.__value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    function create_fragment$E(ctx) {
    	let div1;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div0_class_value;
    	let t;
    	let each_value_1 = /*items*/ ctx[0];
    	const get_key = ctx => /*item*/ ctx[13].id;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$4(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$4(key, child_ctx));
    	}

    	let if_block = !/*readonly*/ ctx[2] && create_if_block$p(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			attr(div0, "class", div0_class_value = "column " + /*classes*/ ctx[3]);
    			attr(div1, "class", "columns");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append(div1, t);
    			if (if_block) if_block.m(div1, null);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*items, remove, readonly, $LOCALE*/ 53) {
    				each_value_1 = /*items*/ ctx[0];
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div0, destroy_block, create_each_block_1$4, null, get_each_context_1$4);
    			}

    			if (dirty & /*classes*/ 8 && div0_class_value !== (div0_class_value = "column " + /*classes*/ ctx[3])) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (!/*readonly*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$p(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block) if_block.d();
    		}
    	};
    }

    function instance$E($$self, $$props, $$invalidate) {
    	let classes;
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(4, $LOCALE = $$value));
    	let dispatch = createEventDispatcher();
    	let { items = [] } = $$props;
    	let { variants = [] } = $$props;
    	let { error = false } = $$props;
    	let { readonly = false } = $$props;

    	let { beforeAdd = () => /*item, list*/ {
    		return true;
    	} } = $$props;

    	function remove(e) {
    		e && e.preventDefault();
    		let id = parseInt(e.currentTarget.dataset.id);
    		let item = items.find(el => el.id === id);

    		if (item) {
    			items.splice(items.indexOf(item), 1);
    			$$invalidate(0, items);
    			dispatch('change', items);
    		}

    		return false;
    	}

    	function add(e) {
    		e && e.preventDefault();
    		let id = parseInt(e.currentTarget.parentNode.querySelector('select').value);
    		let item = variants.find(el => el.id === id);

    		if (!beforeAdd(item, items)) {
    			return false;
    		}

    		if (item && items.indexOf(item) === -1) {
    			items.push(item);
    			$$invalidate(0, items);
    			dispatch('change', items);
    		}

    		return false;
    	}

    	$$self.$$set = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('variants' in $$props) $$invalidate(1, variants = $$props.variants);
    		if ('error' in $$props) $$invalidate(7, error = $$props.error);
    		if ('readonly' in $$props) $$invalidate(2, readonly = $$props.readonly);
    		if ('beforeAdd' in $$props) $$invalidate(8, beforeAdd = $$props.beforeAdd);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*error*/ 128) {
    			$$invalidate(3, classes = error ? 'is-danger' : '');
    		}
    	};

    	return [items, variants, readonly, classes, $LOCALE, remove, add, error, beforeAdd];
    }

    class Ui_tag extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$E, create_fragment$E, safe_not_equal, {
    			items: 0,
    			variants: 1,
    			error: 7,
    			readonly: 2,
    			beforeAdd: 8
    		});
    	}
    }

    /* src/elements/form/ui.telephone.svelte generated by Svelte v3.46.6 */

    function create_if_block_4$7(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[4]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 16 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[4])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (74:4) {#if validated === true }
    function create_if_block_1$j(ctx) {
    	let span;

    	function select_block_type(ctx, dirty) {
    		if (/*valid*/ ctx[7] === true) return create_if_block_2$c;
    		if (/*valid*/ ctx[7] === false) return create_if_block_3$a;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (78:35) 
    function create_if_block_3$a(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (76:6) {#if valid === true }
    function create_if_block_2$c(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (87:4) {:else}
    function create_else_block$h(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (85:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$o(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[11]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 2048) set_data(t, /*helper*/ ctx[11]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$D(ctx) {
    	let div;
    	let input;
    	let input_id_value;
    	let input_class_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t0;
    	let t1;
    	let div_class_value;
    	let t2;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[4] && create_if_block_4$7(ctx);
    	let if_block1 = /*validated*/ ctx[8] === true && create_if_block_1$j(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!(/*validated*/ ctx[8] && /*valid*/ ctx[7]) && /*inputStarted*/ ctx[0]) return create_if_block$o;
    		return create_else_block$h;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	return {
    		c() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			p = element("p");
    			if_block2.c();
    			attr(input, "id", input_id_value = "form-field-telephone-" + /*fieldname*/ ctx[3]);
    			attr(input, "class", input_class_value = "input " + /*validationClasses*/ ctx[9]);
    			attr(input, "type", "tel");
    			attr(input, "name", /*fieldname*/ ctx[3]);
    			attr(input, "invalid", /*invalid*/ ctx[10]);
    			input.required = /*required*/ ctx[5];
    			input.readOnly = /*readonly*/ ctx[6];
    			attr(input, "placeholder", /*placeholder*/ ctx[2]);
    			attr(input, "autocomplete", /*fieldname*/ ctx[3]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    			attr(div, "class", div_class_value = "control " + /*iconClasses*/ ctx[12]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[9]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);
    			set_input_value(input, /*value*/ ctx[1]);
    			append(div, t0);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			insert(target, t2, anchor);
    			insert(target, p, anchor);
    			if_block2.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[19]),
    					listen(input, "change", /*onBlur*/ ctx[13]),
    					listen(input, "input", /*onInput*/ ctx[14])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*fieldname*/ 8 && input_id_value !== (input_id_value = "form-field-telephone-" + /*fieldname*/ ctx[3])) {
    				attr(input, "id", input_id_value);
    			}

    			if (dirty & /*validationClasses*/ 512 && input_class_value !== (input_class_value = "input " + /*validationClasses*/ ctx[9])) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*fieldname*/ 8) {
    				attr(input, "name", /*fieldname*/ ctx[3]);
    			}

    			if (dirty & /*invalid*/ 1024) {
    				attr(input, "invalid", /*invalid*/ ctx[10]);
    			}

    			if (dirty & /*required*/ 32) {
    				input.required = /*required*/ ctx[5];
    			}

    			if (dirty & /*readonly*/ 64) {
    				input.readOnly = /*readonly*/ ctx[6];
    			}

    			if (dirty & /*placeholder*/ 4) {
    				attr(input, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (dirty & /*fieldname*/ 8) {
    				attr(input, "autocomplete", /*fieldname*/ ctx[3]);
    			}

    			if (dirty & /*fieldname*/ 8 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*fieldname*/ 8 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}

    			if (/*icon*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$7(ctx);
    					if_block0.c();
    					if_block0.m(div, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*validated*/ ctx[8] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$j(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*iconClasses*/ 4096 && div_class_value !== (div_class_value = "control " + /*iconClasses*/ ctx[12])) {
    				attr(div, "class", div_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 512 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[9])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 8 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(p, "id", p_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach(t2);
    			if (detaching) detach(p);
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$D($$self, $$props, $$invalidate) {
    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;
    	let { value = '' } = $$props;
    	let { placeholder = '+7 (987) 654-32-10' } = $$props;
    	let { fieldname = 'telephone' } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		ev.preventDefault();
    		let val = UICommon.formatPhone(ev.currentTarget.value);
    		let data = { field: fieldname, value: val };
    		$$invalidate(1, value = val);
    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return false;
    	}

    	function onInput(ev) {
    		ev.preventDefault();
    		let val = UICommon.formatPhone(ev.currentTarget.value);
    		let data = { field: fieldname, value: val };
    		$$invalidate(1, value = val);
    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return false;
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	$$self.$$set = $$props => {
    		if ('inputStarted' in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ('fieldname' in $$props) $$invalidate(3, fieldname = $$props.fieldname);
    		if ('icon' in $$props) $$invalidate(4, icon = $$props.icon);
    		if ('required' in $$props) $$invalidate(5, required = $$props.required);
    		if ('readonly' in $$props) $$invalidate(6, readonly = $$props.readonly);
    		if ('valid' in $$props) $$invalidate(7, valid = $$props.valid);
    		if ('validated' in $$props) $$invalidate(8, validated = $$props.validated);
    		if ('errors' in $$props) $$invalidate(15, errors = $$props.errors);
    		if ('formErrors' in $$props) $$invalidate(16, formErrors = $$props.formErrors);
    		if ('formLevelError' in $$props) $$invalidate(17, formLevelError = $$props.formLevelError);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 16) {
    			$$invalidate(12, iconClasses = (icon ? ' has-icons-left ' : '') + ' has-icons-right ');
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 98304) {
    			$$invalidate(18, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 262148) {
    			$$invalidate(11, helper = allErrors ? allErrors.join(', ') : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 131200) {
    			$$invalidate(10, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 129) {
    			$$invalidate(9, validationClasses = valid === true || !inputStarted
    			? UICommon.CLASS_OK
    			: UICommon.CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		placeholder,
    		fieldname,
    		icon,
    		required,
    		readonly,
    		valid,
    		validated,
    		validationClasses,
    		invalid,
    		helper,
    		iconClasses,
    		onBlur,
    		onInput,
    		errors,
    		formErrors,
    		formLevelError,
    		allErrors,
    		input_input_handler
    	];
    }

    class Ui_telephone extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$D, create_fragment$D, safe_not_equal, {
    			inputStarted: 0,
    			value: 1,
    			placeholder: 2,
    			fieldname: 3,
    			icon: 4,
    			required: 5,
    			readonly: 6,
    			valid: 7,
    			validated: 8,
    			errors: 15,
    			formErrors: 16,
    			formLevelError: 17
    		});
    	}
    }

    /* src/elements/form/ui.textarea.svelte generated by Svelte v3.46.6 */

    function create_if_block_4$6(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[4]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 16 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[4])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (67:4) {#if validated === true }
    function create_if_block_1$i(ctx) {
    	let span;

    	function select_block_type(ctx, dirty) {
    		if (/*valid*/ ctx[9] === true) return create_if_block_2$b;
    		if (/*valid*/ ctx[9] === false) return create_if_block_3$9;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (71:35) 
    function create_if_block_3$9(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (69:6) {#if valid === true }
    function create_if_block_2$b(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (80:4) {:else}
    function create_else_block$g(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (78:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$n(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[13]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 8192) set_data(t, /*helper*/ ctx[13]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$C(ctx) {
    	let div;
    	let textarea;
    	let textarea_id_value;
    	let textarea_class_value;
    	let textarea_aria_controls_value;
    	let textarea_aria_describedby_value;
    	let t0;
    	let t1;
    	let div_class_value;
    	let t2;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[4] && create_if_block_4$6(ctx);
    	let if_block1 = /*validated*/ ctx[10] === true && create_if_block_1$i(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!(/*validated*/ ctx[10] && /*valid*/ ctx[9]) && /*inputStarted*/ ctx[0]) return create_if_block$n;
    		return create_else_block$g;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	return {
    		c() {
    			div = element("div");
    			textarea = element("textarea");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			p = element("p");
    			if_block2.c();
    			attr(textarea, "id", textarea_id_value = "form-field-textarea-" + /*fieldname*/ ctx[3]);
    			attr(textarea, "invalid", /*invalid*/ ctx[12]);
    			textarea.disabled = /*disabled*/ ctx[8];
    			textarea.required = /*required*/ ctx[6];
    			textarea.readOnly = /*readonly*/ ctx[7];
    			attr(textarea, "class", textarea_class_value = "textarea " + /*validationClasses*/ ctx[11]);
    			attr(textarea, "name", /*fieldname*/ ctx[3]);
    			attr(textarea, "placeholder", /*placeholder*/ ctx[2]);
    			attr(textarea, "rows", /*rows*/ ctx[5]);
    			attr(textarea, "aria-controls", textarea_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    			attr(textarea, "aria-describedby", textarea_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    			attr(div, "class", div_class_value = "control " + /*iconClasses*/ ctx[14]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[11]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, textarea);
    			set_input_value(textarea, /*value*/ ctx[1]);
    			append(div, t0);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			insert(target, t2, anchor);
    			insert(target, p, anchor);
    			if_block2.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(textarea, "blur", /*onBlur*/ ctx[15]),
    					listen(textarea, "input", /*textarea_input_handler*/ ctx[20])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*fieldname*/ 8 && textarea_id_value !== (textarea_id_value = "form-field-textarea-" + /*fieldname*/ ctx[3])) {
    				attr(textarea, "id", textarea_id_value);
    			}

    			if (dirty & /*invalid*/ 4096) {
    				attr(textarea, "invalid", /*invalid*/ ctx[12]);
    			}

    			if (dirty & /*disabled*/ 256) {
    				textarea.disabled = /*disabled*/ ctx[8];
    			}

    			if (dirty & /*required*/ 64) {
    				textarea.required = /*required*/ ctx[6];
    			}

    			if (dirty & /*readonly*/ 128) {
    				textarea.readOnly = /*readonly*/ ctx[7];
    			}

    			if (dirty & /*validationClasses*/ 2048 && textarea_class_value !== (textarea_class_value = "textarea " + /*validationClasses*/ ctx[11])) {
    				attr(textarea, "class", textarea_class_value);
    			}

    			if (dirty & /*fieldname*/ 8) {
    				attr(textarea, "name", /*fieldname*/ ctx[3]);
    			}

    			if (dirty & /*placeholder*/ 4) {
    				attr(textarea, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (dirty & /*rows*/ 32) {
    				attr(textarea, "rows", /*rows*/ ctx[5]);
    			}

    			if (dirty & /*fieldname*/ 8 && textarea_aria_controls_value !== (textarea_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(textarea, "aria-controls", textarea_aria_controls_value);
    			}

    			if (dirty & /*fieldname*/ 8 && textarea_aria_describedby_value !== (textarea_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(textarea, "aria-describedby", textarea_aria_describedby_value);
    			}

    			if (dirty & /*value*/ 2) {
    				set_input_value(textarea, /*value*/ ctx[1]);
    			}

    			if (/*icon*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$6(ctx);
    					if_block0.c();
    					if_block0.m(div, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*validated*/ ctx[10] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$i(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*iconClasses*/ 16384 && div_class_value !== (div_class_value = "control " + /*iconClasses*/ ctx[14])) {
    				attr(div, "class", div_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 2048 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[11])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 8 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[3])) {
    				attr(p, "id", p_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach(t2);
    			if (detaching) detach(p);
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$C($$self, $$props, $$invalidate) {
    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;
    	let { value = '' } = $$props;
    	let { placeholder = 'input some text here, please' } = $$props;
    	let { fieldname = 'textarea' } = $$props;
    	let { icon = false } = $$props;
    	let { rows = 10 } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.target.type === 'checkbox'
    			? ev.target.checked
    			: ev.target.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch('change', data);
    		return true;
    	}

    	function textarea_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	$$self.$$set = $$props => {
    		if ('inputStarted' in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ('fieldname' in $$props) $$invalidate(3, fieldname = $$props.fieldname);
    		if ('icon' in $$props) $$invalidate(4, icon = $$props.icon);
    		if ('rows' in $$props) $$invalidate(5, rows = $$props.rows);
    		if ('required' in $$props) $$invalidate(6, required = $$props.required);
    		if ('readonly' in $$props) $$invalidate(7, readonly = $$props.readonly);
    		if ('disabled' in $$props) $$invalidate(8, disabled = $$props.disabled);
    		if ('valid' in $$props) $$invalidate(9, valid = $$props.valid);
    		if ('validated' in $$props) $$invalidate(10, validated = $$props.validated);
    		if ('errors' in $$props) $$invalidate(16, errors = $$props.errors);
    		if ('formErrors' in $$props) $$invalidate(17, formErrors = $$props.formErrors);
    		if ('formLevelError' in $$props) $$invalidate(18, formLevelError = $$props.formLevelError);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 16) {
    			$$invalidate(14, iconClasses = (icon ? ' has-icons-left ' : '') + ' has-icons-right ');
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 196608) {
    			$$invalidate(19, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 524292) {
    			$$invalidate(13, helper = allErrors ? allErrors.join(', ') : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 262656) {
    			$$invalidate(12, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 513) {
    			$$invalidate(11, validationClasses = valid === true || !inputStarted
    			? UICommon.CLASS_OK
    			: UICommon.CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		placeholder,
    		fieldname,
    		icon,
    		rows,
    		required,
    		readonly,
    		disabled,
    		valid,
    		validated,
    		validationClasses,
    		invalid,
    		helper,
    		iconClasses,
    		onBlur,
    		errors,
    		formErrors,
    		formLevelError,
    		allErrors,
    		textarea_input_handler
    	];
    }

    class Ui_textarea extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {
    			inputStarted: 0,
    			value: 1,
    			placeholder: 2,
    			fieldname: 3,
    			icon: 4,
    			rows: 5,
    			required: 6,
    			readonly: 7,
    			disabled: 8,
    			valid: 9,
    			validated: 10,
    			errors: 16,
    			formErrors: 17,
    			formLevelError: 18
    		});
    	}
    }

    var index$9 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        UIAutocomplete: Ui_autocomplete,
        UICheckboxList: Ui_checkbox_list,
        UICheckbox: Ui_checkbox,
        UIColor: Ui_color,
        UIDate: Ui_date,
        UIEmail: Ui_email,
        UIHidden: Ui_hidden,
        UILabel: Ui_label,
        UIPassword: Ui_password,
        UISelect: Ui_select,
        UISwitch: Ui_switch$1,
        UITag: Ui_tag,
        UITelephone: Ui_telephone,
        UITextarea: Ui_textarea,
        UITextfield: Ui_textfield
    });

    /* src/elements/icon/ui.icon.button.with.tag.svelte generated by Svelte v3.46.6 */

    function create_fragment$B(ctx) {
    	let uibutton;
    	let t;
    	let uitag;
    	let current;
    	const uibutton_spread_levels = [/*button*/ ctx[0]];
    	let uibutton_props = {};

    	for (let i = 0; i < uibutton_spread_levels.length; i += 1) {
    		uibutton_props = assign(uibutton_props, uibutton_spread_levels[i]);
    	}

    	uibutton = new Ui_button({ props: uibutton_props });
    	const uitag_spread_levels = [/*tag*/ ctx[1], { classes: "is-top-right" }];
    	let uitag_props = {};

    	for (let i = 0; i < uitag_spread_levels.length; i += 1) {
    		uitag_props = assign(uitag_props, uitag_spread_levels[i]);
    	}

    	uitag = new Ui_tag$1({ props: uitag_props });

    	return {
    		c() {
    			create_component(uibutton.$$.fragment);
    			t = space();
    			create_component(uitag.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uibutton, target, anchor);
    			insert(target, t, anchor);
    			mount_component(uitag, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const uibutton_changes = (dirty & /*button*/ 1)
    			? get_spread_update(uibutton_spread_levels, [get_spread_object(/*button*/ ctx[0])])
    			: {};

    			uibutton.$set(uibutton_changes);

    			const uitag_changes = (dirty & /*tag*/ 2)
    			? get_spread_update(uitag_spread_levels, [get_spread_object(/*tag*/ ctx[1]), uitag_spread_levels[1]])
    			: {};

    			uitag.$set(uitag_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uibutton.$$.fragment, local);
    			transition_in(uitag.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uibutton.$$.fragment, local);
    			transition_out(uitag.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uibutton, detaching);
    			if (detaching) detach(t);
    			destroy_component(uitag, detaching);
    		}
    	};
    }

    function instance$B($$self, $$props, $$invalidate) {
    	let { button = {} } = $$props;
    	let { tag = {} } = $$props;

    	$$self.$$set = $$props => {
    		if ('button' in $$props) $$invalidate(0, button = $$props.button);
    		if ('tag' in $$props) $$invalidate(1, tag = $$props.tag);
    	};

    	return [button, tag];
    }

    class Ui_icon_button_with_tag extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, { button: 0, tag: 1 });
    	}
    }

    /* src/elements/icon/ui.icon.floating.svelte generated by Svelte v3.46.6 */

    function create_fragment$A(ctx) {
    	let div;
    	let uibutton;
    	let current;
    	const uibutton_spread_levels = [{ action: toggle }, /*trigger*/ ctx[0]];
    	let uibutton_props = {};

    	for (let i = 0; i < uibutton_spread_levels.length; i += 1) {
    		uibutton_props = assign(uibutton_props, uibutton_spread_levels[i]);
    	}

    	uibutton = new Ui_button({ props: uibutton_props });

    	return {
    		c() {
    			div = element("div");
    			create_component(uibutton.$$.fragment);
    			attr(div, "class", "is-fab svelte-1haul9u");
    			attr(div, "style", /*positionStyle*/ ctx[1]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(uibutton, div, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const uibutton_changes = (dirty & /*toggle, trigger*/ 1)
    			? get_spread_update(uibutton_spread_levels, [
    					dirty & /*toggle*/ 0 && { action: toggle },
    					dirty & /*trigger*/ 1 && get_spread_object(/*trigger*/ ctx[0])
    				])
    			: {};

    			uibutton.$set(uibutton_changes);

    			if (!current || dirty & /*positionStyle*/ 2) {
    				attr(div, "style", /*positionStyle*/ ctx[1]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uibutton.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uibutton.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(uibutton);
    		}
    	};
    }

    function toggle() {
    	
    }

    function instance$A($$self, $$props, $$invalidate) {
    	let { trigger = {
    		title: 'Click me!',
    		icon: 'plus',
    		color: 'primary',
    		size: 'medium'
    	} } = $$props;

    	let positionStyle = '';

    	onMount(() => {
    		$$invalidate(1, positionStyle = '');
    	});

    	$$self.$$set = $$props => {
    		if ('trigger' in $$props) $$invalidate(0, trigger = $$props.trigger);
    	};

    	return [trigger, positionStyle];
    }

    class Ui_icon_floating extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, { trigger: 0 });
    	}
    }

    /* src/elements/icon/ui.icon.font.svelte generated by Svelte v3.46.6 */

    function create_else_block$f(ctx) {
    	let span;
    	let i;
    	let i_class_value;
    	let span_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*font*/ ctx[1]);
    			attr(span, "class", span_class_value = "icon " + (/*size*/ ctx[2] ? `is-${/*size*/ ctx[2]}` : '') + " " + (/*size*/ ctx[2] == 'medium' ? 'fa-lg' : '') + " " + (/*size*/ ctx[2] == 'large' ? 'fa-2x' : ''));
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*font*/ 2 && i_class_value !== (i_class_value = "fas fa-" + /*font*/ ctx[1])) {
    				attr(i, "class", i_class_value);
    			}

    			if (dirty & /*size*/ 4 && span_class_value !== (span_class_value = "icon " + (/*size*/ ctx[2] ? `is-${/*size*/ ctx[2]}` : '') + " " + (/*size*/ ctx[2] == 'medium' ? 'fa-lg' : '') + " " + (/*size*/ ctx[2] == 'large' ? 'fa-2x' : ''))) {
    				attr(span, "class", span_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (8:0) {#if title}
    function create_if_block$m(ctx) {
    	let span2;
    	let span0;
    	let i;
    	let i_class_value;
    	let span0_class_value;
    	let t0;
    	let span1;
    	let t1_value = /*$LOCALE*/ ctx[3][/*title*/ ctx[0]] + "";
    	let t1;

    	return {
    		c() {
    			span2 = element("span");
    			span0 = element("span");
    			i = element("i");
    			t0 = space();
    			span1 = element("span");
    			t1 = text(t1_value);
    			attr(i, "class", i_class_value = "fas fa-" + /*font*/ ctx[1] + " " + (/*size*/ ctx[2] == 'medium' ? 'fa-lg' : '') + " " + (/*size*/ ctx[2] == 'large' ? 'fa-2x' : '') + "");
    			attr(span0, "class", span0_class_value = "icon " + (/*size*/ ctx[2] ? `is-${/*size*/ ctx[2]}` : ''));
    			attr(span2, "class", "icon-text");
    		},
    		m(target, anchor) {
    			insert(target, span2, anchor);
    			append(span2, span0);
    			append(span0, i);
    			append(span2, t0);
    			append(span2, span1);
    			append(span1, t1);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*font, size*/ 6 && i_class_value !== (i_class_value = "fas fa-" + /*font*/ ctx[1] + " " + (/*size*/ ctx[2] == 'medium' ? 'fa-lg' : '') + " " + (/*size*/ ctx[2] == 'large' ? 'fa-2x' : '') + "")) {
    				attr(i, "class", i_class_value);
    			}

    			if (dirty & /*size*/ 4 && span0_class_value !== (span0_class_value = "icon " + (/*size*/ ctx[2] ? `is-${/*size*/ ctx[2]}` : ''))) {
    				attr(span0, "class", span0_class_value);
    			}

    			if (dirty & /*$LOCALE, title*/ 9 && t1_value !== (t1_value = /*$LOCALE*/ ctx[3][/*title*/ ctx[0]] + "")) set_data(t1, t1_value);
    		},
    		d(detaching) {
    			if (detaching) detach(span2);
    		}
    	};
    }

    function create_fragment$z(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*title*/ ctx[0]) return create_if_block$m;
    		return create_else_block$f;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$z($$self, $$props, $$invalidate) {
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(3, $LOCALE = $$value));
    	let { title = '' } = $$props;
    	let { font = '' } = $$props;
    	let { size = '' } = $$props;

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('font' in $$props) $$invalidate(1, font = $$props.font);
    		if ('size' in $$props) $$invalidate(2, size = $$props.size);
    	};

    	return [title, font, size, $LOCALE];
    }

    class Ui_icon_font extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, { title: 0, font: 1, size: 2 });
    	}
    }

    /* src/elements/icon/ui.icon.svelte generated by Svelte v3.46.6 */

    function create_if_block_2$a(ctx) {
    	let figure;
    	let img;
    	let img_src_value;
    	let figure_class_value;

    	return {
    		c() {
    			figure = element("figure");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[4])) attr(img, "src", img_src_value);
    			attr(img, "title", /*title*/ ctx[0]);
    			attr(img, "alt", /*title*/ ctx[0]);
    			attr(img, "width", /*width*/ ctx[5]);
    			attr(img, "height", /*height*/ ctx[6]);

    			attr(figure, "class", figure_class_value = "image " + (/*width*/ ctx[5] && /*height*/ ctx[6]
    			? `is-${/*width*/ ctx[5]}x${/*height*/ ctx[6]}`
    			: '') + "");
    		},
    		m(target, anchor) {
    			insert(target, figure, anchor);
    			append(figure, img);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*src*/ 16 && !src_url_equal(img.src, img_src_value = /*src*/ ctx[4])) {
    				attr(img, "src", img_src_value);
    			}

    			if (dirty & /*title*/ 1) {
    				attr(img, "title", /*title*/ ctx[0]);
    			}

    			if (dirty & /*title*/ 1) {
    				attr(img, "alt", /*title*/ ctx[0]);
    			}

    			if (dirty & /*width*/ 32) {
    				attr(img, "width", /*width*/ ctx[5]);
    			}

    			if (dirty & /*height*/ 64) {
    				attr(img, "height", /*height*/ ctx[6]);
    			}

    			if (dirty & /*width, height*/ 96 && figure_class_value !== (figure_class_value = "image " + (/*width*/ ctx[5] && /*height*/ ctx[6]
    			? `is-${/*width*/ ctx[5]}x${/*height*/ ctx[6]}`
    			: '') + "")) {
    				attr(figure, "class", figure_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(figure);
    		}
    	};
    }

    // (18:15) 
    function create_if_block_1$h(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			attr(span, "class", "icon");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			span.innerHTML = /*svg*/ ctx[3];
    		},
    		p(ctx, dirty) {
    			if (dirty & /*svg*/ 8) span.innerHTML = /*svg*/ ctx[3];		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (16:0) {#if font }
    function create_if_block$l(ctx) {
    	let uiiconfont;
    	let current;

    	uiiconfont = new Ui_icon_font({
    			props: {
    				font: /*font*/ ctx[2],
    				size: /*size*/ ctx[1],
    				title: /*title*/ ctx[0]
    			}
    		});

    	return {
    		c() {
    			create_component(uiiconfont.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uiiconfont, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uiiconfont_changes = {};
    			if (dirty & /*font*/ 4) uiiconfont_changes.font = /*font*/ ctx[2];
    			if (dirty & /*size*/ 2) uiiconfont_changes.size = /*size*/ ctx[1];
    			if (dirty & /*title*/ 1) uiiconfont_changes.title = /*title*/ ctx[0];
    			uiiconfont.$set(uiiconfont_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiiconfont.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiiconfont.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uiiconfont, detaching);
    		}
    	};
    }

    function create_fragment$y(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$l, create_if_block_1$h, create_if_block_2$a];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*font*/ ctx[2]) return 0;
    		if (/*svg*/ ctx[3]) return 1;
    		if (/*src*/ ctx[4]) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$y($$self, $$props, $$invalidate) {
    	let { title = '' } = $$props;
    	let { size = '' } = $$props;
    	let { font = '' } = $$props;
    	let { svg = '' } = $$props;
    	let { src = '' } = $$props;
    	let { width } = $$props;
    	let { height } = $$props;

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('size' in $$props) $$invalidate(1, size = $$props.size);
    		if ('font' in $$props) $$invalidate(2, font = $$props.font);
    		if ('svg' in $$props) $$invalidate(3, svg = $$props.svg);
    		if ('src' in $$props) $$invalidate(4, src = $$props.src);
    		if ('width' in $$props) $$invalidate(5, width = $$props.width);
    		if ('height' in $$props) $$invalidate(6, height = $$props.height);
    	};

    	return [title, size, font, svg, src, width, height];
    }

    class Ui_icon extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {
    			title: 0,
    			size: 1,
    			font: 2,
    			svg: 3,
    			src: 4,
    			width: 5,
    			height: 6
    		});
    	}
    }

    var index$8 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        UIIconButtonWithTag: Ui_icon_button_with_tag,
        UIIconFloating: Ui_icon_floating,
        UIIconFont: Ui_icon_font,
        UIIcon: Ui_icon
    });

    /* src/elements/image/ui.images.svelte generated by Svelte v3.46.6 */

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (12:0) {:else}
    function create_else_block$e(ctx) {
    	let figure;
    	let img;
    	let img_alt_value;
    	let img_src_value;
    	let img_crossorigin_value;
    	let t;

    	return {
    		c() {
    			figure = element("figure");
    			img = element("img");
    			t = space();
    			attr(img, "class", "");
    			attr(img, "alt", img_alt_value = /*item*/ ctx[1].title);
    			if (!src_url_equal(img.src, img_src_value = /*item*/ ctx[1].url)) attr(img, "src", img_src_value);
    			attr(img, "crossorigin", img_crossorigin_value = /*item*/ ctx[1].cors);
    			attr(figure, "class", "image is-64x64");
    		},
    		m(target, anchor) {
    			insert(target, figure, anchor);
    			append(figure, img);
    			append(figure, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*values*/ 1 && img_alt_value !== (img_alt_value = /*item*/ ctx[1].title)) {
    				attr(img, "alt", img_alt_value);
    			}

    			if (dirty & /*values*/ 1 && !src_url_equal(img.src, img_src_value = /*item*/ ctx[1].url)) {
    				attr(img, "src", img_src_value);
    			}

    			if (dirty & /*values*/ 1 && img_crossorigin_value !== (img_crossorigin_value = /*item*/ ctx[1].cors)) {
    				attr(img, "crossorigin", img_crossorigin_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(figure);
    		}
    	};
    }

    // (6:0) {#if item.urlFull }
    function create_if_block$k(ctx) {
    	let a;
    	let figure;
    	let img;
    	let img_alt_value;
    	let img_src_value;
    	let img_crossorigin_value;
    	let t;
    	let a_href_value;
    	let a_alt_value;

    	return {
    		c() {
    			a = element("a");
    			figure = element("figure");
    			img = element("img");
    			t = space();
    			attr(img, "class", "");
    			attr(img, "alt", img_alt_value = /*item*/ ctx[1].title);
    			if (!src_url_equal(img.src, img_src_value = /*item*/ ctx[1].url)) attr(img, "src", img_src_value);
    			attr(img, "crossorigin", img_crossorigin_value = /*item*/ ctx[1].cors);
    			attr(figure, "class", "image is-64x64");
    			attr(a, "href", a_href_value = /*item*/ ctx[1].urlFull);
    			attr(a, "alt", a_alt_value = /*item*/ ctx[1].title);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, figure);
    			append(figure, img);
    			append(a, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*values*/ 1 && img_alt_value !== (img_alt_value = /*item*/ ctx[1].title)) {
    				attr(img, "alt", img_alt_value);
    			}

    			if (dirty & /*values*/ 1 && !src_url_equal(img.src, img_src_value = /*item*/ ctx[1].url)) {
    				attr(img, "src", img_src_value);
    			}

    			if (dirty & /*values*/ 1 && img_crossorigin_value !== (img_crossorigin_value = /*item*/ ctx[1].cors)) {
    				attr(img, "crossorigin", img_crossorigin_value);
    			}

    			if (dirty & /*values*/ 1 && a_href_value !== (a_href_value = /*item*/ ctx[1].urlFull)) {
    				attr(a, "href", a_href_value);
    			}

    			if (dirty & /*values*/ 1 && a_alt_value !== (a_alt_value = /*item*/ ctx[1].title)) {
    				attr(a, "alt", a_alt_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    		}
    	};
    }

    // (5:0) {#each values as item (item.url) }
    function create_each_block$b(key_1, ctx) {
    	let first;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[1].urlFull) return create_if_block$k;
    		return create_else_block$e;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$x(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*values*/ ctx[0];
    	const get_key = ctx => /*item*/ ctx[1].url;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$b(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$b(key, child_ctx));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*values*/ 1) {
    				each_value = /*values*/ ctx[0];
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$b, each_1_anchor, get_each_context$b);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let { values = [] } = $$props;

    	$$self.$$set = $$props => {
    		if ('values' in $$props) $$invalidate(0, values = $$props.values);
    	};

    	return [values];
    }

    class Ui_images extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, { values: 0 });
    	}
    }

    var index$7 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        UIImages: Ui_images
    });

    /* src/elements/layout/ui.column.svelte generated by Svelte v3.46.6 */

    function create_fragment$w(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr(div, "class", div_class_value = "column " + /*classes*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*classes*/ 1 && div_class_value !== (div_class_value = "column " + /*classes*/ ctx[0])) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { classes = "" } = $$props;

    	$$self.$$set = $$props => {
    		if ('classes' in $$props) $$invalidate(0, classes = $$props.classes);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	return [classes, $$scope, slots];
    }

    class Ui_column extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, { classes: 0 });
    	}
    }

    /* src/elements/layout/ui.columns.svelte generated by Svelte v3.46.6 */

    function create_fragment$v(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr(div, "class", div_class_value = "columns " + /*classes*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*classes*/ 1 && div_class_value !== (div_class_value = "columns " + /*classes*/ ctx[0])) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { classes = "" } = $$props;

    	$$self.$$set = $$props => {
    		if ('classes' in $$props) $$invalidate(0, classes = $$props.classes);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	return [classes, $$scope, slots];
    }

    class Ui_columns extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, { classes: 0 });
    	}
    }

    /* src/elements/layout/ui.container.svelte generated by Svelte v3.46.6 */

    function create_fragment$u(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr(div, "id", /*id*/ ctx[0]);
    			attr(div, "class", div_class_value = "container " + /*classes*/ ctx[1]);
    			toggle_class(div, "is-widescreen", /*widescreen*/ ctx[2]);
    			toggle_class(div, "is-fullhd", /*fullhd*/ ctx[3]);
    			toggle_class(div, "is-max-desktop", /*maxDesktop*/ ctx[4]);
    			toggle_class(div, "is-max-widescreen", /*maxWidescreen*/ ctx[5]);
    			toggle_class(div, "is-fluid", /*fluid*/ ctx[6]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*id*/ 1) {
    				attr(div, "id", /*id*/ ctx[0]);
    			}

    			if (!current || dirty & /*classes*/ 2 && div_class_value !== (div_class_value = "container " + /*classes*/ ctx[1])) {
    				attr(div, "class", div_class_value);
    			}

    			if (dirty & /*classes, widescreen*/ 6) {
    				toggle_class(div, "is-widescreen", /*widescreen*/ ctx[2]);
    			}

    			if (dirty & /*classes, fullhd*/ 10) {
    				toggle_class(div, "is-fullhd", /*fullhd*/ ctx[3]);
    			}

    			if (dirty & /*classes, maxDesktop*/ 18) {
    				toggle_class(div, "is-max-desktop", /*maxDesktop*/ ctx[4]);
    			}

    			if (dirty & /*classes, maxWidescreen*/ 34) {
    				toggle_class(div, "is-max-widescreen", /*maxWidescreen*/ ctx[5]);
    			}

    			if (dirty & /*classes, fluid*/ 66) {
    				toggle_class(div, "is-fluid", /*fluid*/ ctx[6]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { id = '' } = $$props;
    	let { classes = '' } = $$props;
    	let { widescreen = false } = $$props;
    	let { fullhd = false } = $$props;
    	let { maxDesktop = false } = $$props;
    	let { maxWidescreen = false } = $$props;
    	let { fluid = false } = $$props;

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('classes' in $$props) $$invalidate(1, classes = $$props.classes);
    		if ('widescreen' in $$props) $$invalidate(2, widescreen = $$props.widescreen);
    		if ('fullhd' in $$props) $$invalidate(3, fullhd = $$props.fullhd);
    		if ('maxDesktop' in $$props) $$invalidate(4, maxDesktop = $$props.maxDesktop);
    		if ('maxWidescreen' in $$props) $$invalidate(5, maxWidescreen = $$props.maxWidescreen);
    		if ('fluid' in $$props) $$invalidate(6, fluid = $$props.fluid);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	return [
    		id,
    		classes,
    		widescreen,
    		fullhd,
    		maxDesktop,
    		maxWidescreen,
    		fluid,
    		$$scope,
    		slots
    	];
    }

    class Ui_container extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {
    			id: 0,
    			classes: 1,
    			widescreen: 2,
    			fullhd: 3,
    			maxDesktop: 4,
    			maxWidescreen: 5,
    			fluid: 6
    		});
    	}
    }

    /* src/elements/layout/ui.footer.svelte generated by Svelte v3.46.6 */

    function create_fragment$t(ctx) {
    	let footer;
    	let footer_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	return {
    		c() {
    			footer = element("footer");
    			if (default_slot) default_slot.c();
    			attr(footer, "id", /*id*/ ctx[0]);
    			attr(footer, "class", footer_class_value = "footer " + /*classes*/ ctx[1] + "");
    		},
    		m(target, anchor) {
    			insert(target, footer, anchor);

    			if (default_slot) {
    				default_slot.m(footer, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*id*/ 1) {
    				attr(footer, "id", /*id*/ ctx[0]);
    			}

    			if (!current || dirty & /*classes*/ 2 && footer_class_value !== (footer_class_value = "footer " + /*classes*/ ctx[1] + "")) {
    				attr(footer, "class", footer_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(footer);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { id = '' } = $$props;
    	let { classes = '' } = $$props;

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('classes' in $$props) $$invalidate(1, classes = $$props.classes);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	return [id, classes, $$scope, slots];
    }

    class Ui_footer extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, { id: 0, classes: 1 });
    	}
    }

    /* src/elements/layout/ui.section.svelte generated by Svelte v3.46.6 */

    function create_fragment$s(ctx) {
    	let section;
    	let section_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	return {
    		c() {
    			section = element("section");
    			if (default_slot) default_slot.c();
    			attr(section, "id", /*id*/ ctx[0]);
    			attr(section, "class", section_class_value = "section " + (/*size*/ ctx[1] ? 'is-' + /*size*/ ctx[1] : '') + " " + /*classes*/ ctx[2]);
    		},
    		m(target, anchor) {
    			insert(target, section, anchor);

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*id*/ 1) {
    				attr(section, "id", /*id*/ ctx[0]);
    			}

    			if (!current || dirty & /*size, classes*/ 6 && section_class_value !== (section_class_value = "section " + (/*size*/ ctx[1] ? 'is-' + /*size*/ ctx[1] : '') + " " + /*classes*/ ctx[2])) {
    				attr(section, "class", section_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(section);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { id = '' } = $$props;
    	let { size } = $$props;
    	let { classes = '' } = $$props;

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('size' in $$props) $$invalidate(1, size = $$props.size);
    		if ('classes' in $$props) $$invalidate(2, classes = $$props.classes);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	return [id, size, classes, $$scope, slots];
    }

    class Ui_section$2 extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, { id: 0, size: 1, classes: 2 });
    	}
    }

    var index$6 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        UIColumn: Ui_column,
        UIColumns: Ui_columns,
        UIContainer: Ui_container,
        UIFooter: Ui_footer,
        UISection: Ui_section$2
    });

    /* src/elements/link/ui.link.svelte generated by Svelte v3.46.6 */

    function create_else_block$d(ctx) {
    	let t_value = /*$LOCALE*/ ctx[16][/*title*/ ctx[1]] + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, title*/ 65538 && t_value !== (t_value = /*$LOCALE*/ ctx[16][/*title*/ ctx[1]] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (30:2) {#if icon }
    function create_if_block$j(ctx) {
    	let t0;
    	let t1;
    	let if_block2_anchor;
    	let if_block0 = /*iconSide*/ ctx[14] === 'left' && create_if_block_3$8(ctx);
    	let if_block1 = /*title*/ ctx[1] && create_if_block_2$9(ctx);
    	let if_block2 = /*iconSide*/ ctx[14] === 'right' && create_if_block_1$g(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, if_block2_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (/*iconSide*/ ctx[14] === 'left') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$8(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*title*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$9(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*iconSide*/ ctx[14] === 'right') {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$g(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach(if_block2_anchor);
    		}
    	};
    }

    // (31:2) {#if iconSide === 'left' }
    function create_if_block_3$8(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[13] + " " + (/*size*/ ctx[12] ? `is-${/*size*/ ctx[12]}` : ''));
    			attr(span, "class", "icon");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon, size*/ 12288 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[13] + " " + (/*size*/ ctx[12] ? `is-${/*size*/ ctx[12]}` : ''))) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (34:4) {#if title }
    function create_if_block_2$9(ctx) {
    	let span;
    	let t_value = /*$LOCALE*/ ctx[16][/*title*/ ctx[1]] + "";
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, title*/ 65538 && t_value !== (t_value = /*$LOCALE*/ ctx[16][/*title*/ ctx[1]] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (37:2) {#if iconSide === 'right' }
    function create_if_block_1$g(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[13] + " " + (/*size*/ ctx[12] ? `is-${/*size*/ ctx[12]}` : ''));
    			attr(span, "class", "icon");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon, size*/ 12288 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[13] + " " + (/*size*/ ctx[12] ? `is-${/*size*/ ctx[12]}` : ''))) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function create_fragment$r(ctx) {
    	let a;
    	let a_class_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*icon*/ ctx[13]) return create_if_block$j;
    		return create_else_block$d;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			a = element("a");
    			if_block.c();
    			attr(a, "href", /*url*/ ctx[2]);
    			attr(a, "class", a_class_value = "" + (/*classes*/ ctx[0] + " " + (/*state*/ ctx[9] ? `is-${/*state*/ ctx[9]}` : '') + " " + (/*inverted*/ ctx[7] ? `is-inverted` : '') + " " + (/*outlined*/ ctx[6] ? `is-outlined` : '') + " " + (/*raised*/ ctx[5] ? `is-raised` : '') + " " + (/*rounded*/ ctx[8] ? `is-rounded` : '') + " " + (/*light*/ ctx[3] ? `is-light` : '') + " " + (/*loading*/ ctx[4] ? `is-loading` : '') + " " + (/*color*/ ctx[11] ? `is-${/*color*/ ctx[11]}` : '') + " " + (/*type*/ ctx[10] ? `is-${/*type*/ ctx[10]}` : '') + " " + (/*size*/ ctx[12] ? `is-${/*size*/ ctx[12]}` : '')));
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			if_block.m(a, null);

    			if (!mounted) {
    				dispose = listen(a, "click", function () {
    					if (is_function(/*action*/ ctx[15])) /*action*/ ctx[15].apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(a, null);
    				}
    			}

    			if (dirty & /*url*/ 4) {
    				attr(a, "href", /*url*/ ctx[2]);
    			}

    			if (dirty & /*classes, state, inverted, outlined, raised, rounded, light, loading, color, type, size*/ 8185 && a_class_value !== (a_class_value = "" + (/*classes*/ ctx[0] + " " + (/*state*/ ctx[9] ? `is-${/*state*/ ctx[9]}` : '') + " " + (/*inverted*/ ctx[7] ? `is-inverted` : '') + " " + (/*outlined*/ ctx[6] ? `is-outlined` : '') + " " + (/*raised*/ ctx[5] ? `is-raised` : '') + " " + (/*rounded*/ ctx[8] ? `is-rounded` : '') + " " + (/*light*/ ctx[3] ? `is-light` : '') + " " + (/*loading*/ ctx[4] ? `is-loading` : '') + " " + (/*color*/ ctx[11] ? `is-${/*color*/ ctx[11]}` : '') + " " + (/*type*/ ctx[10] ? `is-${/*type*/ ctx[10]}` : '') + " " + (/*size*/ ctx[12] ? `is-${/*size*/ ctx[12]}` : '')))) {
    				attr(a, "class", a_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(a);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(16, $LOCALE = $$value));
    	let { title = '' } = $$props;
    	let { url = '' } = $$props;
    	let { light = false } = $$props;
    	let { loading = false } = $$props;
    	let { raised = false } = $$props;
    	let { outlined = false } = $$props;
    	let { inverted = false } = $$props;
    	let { rounded = false } = $$props;
    	let { state = '' } = $$props;
    	let { type = '' } = $$props;
    	let { color = '' } = $$props;
    	let { size = '' } = $$props;
    	let { classes = 'button ' } = $$props;
    	let { icon = false } = $$props;
    	let { iconSide = 'right' } = $$props;

    	let { action = () => {
    		return true;
    	} } = $$props;

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('url' in $$props) $$invalidate(2, url = $$props.url);
    		if ('light' in $$props) $$invalidate(3, light = $$props.light);
    		if ('loading' in $$props) $$invalidate(4, loading = $$props.loading);
    		if ('raised' in $$props) $$invalidate(5, raised = $$props.raised);
    		if ('outlined' in $$props) $$invalidate(6, outlined = $$props.outlined);
    		if ('inverted' in $$props) $$invalidate(7, inverted = $$props.inverted);
    		if ('rounded' in $$props) $$invalidate(8, rounded = $$props.rounded);
    		if ('state' in $$props) $$invalidate(9, state = $$props.state);
    		if ('type' in $$props) $$invalidate(10, type = $$props.type);
    		if ('color' in $$props) $$invalidate(11, color = $$props.color);
    		if ('size' in $$props) $$invalidate(12, size = $$props.size);
    		if ('classes' in $$props) $$invalidate(0, classes = $$props.classes);
    		if ('icon' in $$props) $$invalidate(13, icon = $$props.icon);
    		if ('iconSide' in $$props) $$invalidate(14, iconSide = $$props.iconSide);
    		if ('action' in $$props) $$invalidate(15, action = $$props.action);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*state, light, type, size*/ 5640) {
    			{
    				$$invalidate(0, classes = (state && state.length > 0 ? ` is-${state} ` : '') + (light ? ` is-light ` : '') + (type && type.length > 0 ? ` is-${type} ` : '') + (size && size.length > 0 ? ` is-${size} ` : ''));
    			}
    		}
    	};

    	return [
    		classes,
    		title,
    		url,
    		light,
    		loading,
    		raised,
    		outlined,
    		inverted,
    		rounded,
    		state,
    		type,
    		color,
    		size,
    		icon,
    		iconSide,
    		action,
    		$LOCALE
    	];
    }

    class Ui_link extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {
    			title: 1,
    			url: 2,
    			light: 3,
    			loading: 4,
    			raised: 5,
    			outlined: 6,
    			inverted: 7,
    			rounded: 8,
    			state: 9,
    			type: 10,
    			color: 11,
    			size: 12,
    			classes: 0,
    			icon: 13,
    			iconSide: 14,
    			action: 15
    		});
    	}
    }

    /* src/elements/link/ui.links.svelte generated by Svelte v3.46.6 */

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (9:4) {#each values as item (item) }
    function create_each_block$a(key_1, ctx) {
    	let first;
    	let uilink;
    	let current;
    	const uilink_spread_levels = [/*item*/ ctx[1]];
    	let uilink_props = {};

    	for (let i = 0; i < uilink_spread_levels.length; i += 1) {
    		uilink_props = assign(uilink_props, uilink_spread_levels[i]);
    	}

    	uilink = new Ui_link({ props: uilink_props });

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(uilink.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(uilink, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			const uilink_changes = (dirty & /*values*/ 1)
    			? get_spread_update(uilink_spread_levels, [get_spread_object(/*item*/ ctx[1])])
    			: {};

    			uilink.$set(uilink_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uilink.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uilink.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(uilink, detaching);
    		}
    	};
    }

    function create_fragment$q(ctx) {
    	let div;
    	let p;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*values*/ ctx[0];
    	const get_key = ctx => /*item*/ ctx[1];

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$a(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$a(key, child_ctx));
    	}

    	return {
    		c() {
    			div = element("div");
    			p = element("p");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(p, "class", "control");
    			attr(div, "class", "field has-addons");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(p, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*values*/ 1) {
    				each_value = /*values*/ ctx[0];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, p, outro_and_destroy_block, create_each_block$a, null, get_each_context$a);
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let { values = [] } = $$props;

    	$$self.$$set = $$props => {
    		if ('values' in $$props) $$invalidate(0, values = $$props.values);
    	};

    	return [values];
    }

    class Ui_links extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, { values: 0 });
    	}
    }

    var index$5 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        UILink: Ui_link,
        UILinks: Ui_links
    });

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/elements/modal/ui.overlay.svelte generated by Svelte v3.46.6 */

    function create_if_block$i(ctx) {
    	let div;
    	let t;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*closeButton*/ ctx[0] && create_if_block_1$f(ctx);
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	return {
    		c() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr(div, "class", "is-overlay not-overlay");
    			set_style(div, "z-index", zIndexStep * /*layer*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen(div, "click", /*overlayClick*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (/*closeButton*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$f(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*layer*/ 8) {
    				set_style(div, "z-index", zIndexStep * /*layer*/ ctx[3]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (66:1) {#if closeButton}
    function create_if_block_1$f(ctx) {
    	let button;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			attr(button, "class", button_class_value = "delete is-" + /*closeSize*/ ctx[2]);
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*closeButtonClick*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*closeSize*/ 4 && button_class_value !== (button_class_value = "delete is-" + /*closeSize*/ ctx[2])) {
    				attr(button, "class", button_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$p(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*show*/ ctx[1] && create_if_block$i(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*show*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*show*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$i(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    const zIndexStep = 1000;

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let overflowSave = '';
    	const dispatch = createEventDispatcher();
    	let { closeButton = false } = $$props;
    	let { show = true } = $$props;
    	let { closeOnClick = true } = $$props;
    	let { closeSize = 'normal' } = $$props;
    	let { layer = 1 } = $$props;

    	function overlayClick(e) {
    		if (closeOnClick) {
    			closeOverlay(e);
    		}
    	}

    	function closeButtonClick() {
    		rejectOverlay();
    	}

    	function closeOverlay(e) {
    		if (e && e.originalTarget && e.originalTarget.classList && e.originalTarget.classList.contains('is-overlay')) {
    			rejectOverlay();
    		}
    	}

    	function rejectOverlay(data = {}) {
    		dispatch('reject', data);
    	}

    	/*
    	function resolveOverlay(data = {}) {
    	  dispatch('resolve', data);
    	}
    */
    	onMount(() => {
    		$$invalidate(7, overflowSave = document.body.style.overflow);
    	});

    	onDestroy(() => {
    		document.body.style.overflow = overflowSave;
    	});

    	$$self.$$set = $$props => {
    		if ('closeButton' in $$props) $$invalidate(0, closeButton = $$props.closeButton);
    		if ('show' in $$props) $$invalidate(1, show = $$props.show);
    		if ('closeOnClick' in $$props) $$invalidate(6, closeOnClick = $$props.closeOnClick);
    		if ('closeSize' in $$props) $$invalidate(2, closeSize = $$props.closeSize);
    		if ('layer' in $$props) $$invalidate(3, layer = $$props.layer);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*show, overflowSave*/ 130) {
    			if (show) {
    				document.body.style.overflow = 'hidden';
    			} else {
    				document.body.style.overflow = overflowSave;
    			}
    		}
    	};

    	return [
    		closeButton,
    		show,
    		closeSize,
    		layer,
    		overlayClick,
    		closeButtonClick,
    		closeOnClick,
    		overflowSave,
    		$$scope,
    		slots
    	];
    }

    class Ui_overlay extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {
    			closeButton: 0,
    			show: 1,
    			closeOnClick: 6,
    			closeSize: 2,
    			layer: 3
    		});
    	}
    }

    /* src/elements/modal/ui.modal.svelte generated by Svelte v3.46.6 */

    function create_if_block_1$e(ctx) {
    	let uibutton;
    	let current;
    	const uibutton_spread_levels = [/*closeButton*/ ctx[0]];
    	let uibutton_props = {};

    	for (let i = 0; i < uibutton_spread_levels.length; i += 1) {
    		uibutton_props = assign(uibutton_props, uibutton_spread_levels[i]);
    	}

    	uibutton = new Ui_button({ props: uibutton_props });

    	return {
    		c() {
    			create_component(uibutton.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uibutton, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uibutton_changes = (dirty & /*closeButton*/ 1)
    			? get_spread_update(uibutton_spread_levels, [get_spread_object(/*closeButton*/ ctx[0])])
    			: {};

    			uibutton.$set(uibutton_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uibutton.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uibutton.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uibutton, detaching);
    		}
    	};
    }

    // (34:10) {#if applyButton}
    function create_if_block$h(ctx) {
    	let uibutton;
    	let current;
    	const uibutton_spread_levels = [/*applyButton*/ ctx[1]];
    	let uibutton_props = {};

    	for (let i = 0; i < uibutton_spread_levels.length; i += 1) {
    		uibutton_props = assign(uibutton_props, uibutton_spread_levels[i]);
    	}

    	uibutton = new Ui_button({ props: uibutton_props });

    	return {
    		c() {
    			create_component(uibutton.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uibutton, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uibutton_changes = (dirty & /*applyButton*/ 2)
    			? get_spread_update(uibutton_spread_levels, [get_spread_object(/*applyButton*/ ctx[1])])
    			: {};

    			uibutton.$set(uibutton_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uibutton.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uibutton.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uibutton, detaching);
    		}
    	};
    }

    // (27:3) <UIContent>
    function create_default_slot_2(ctx) {
    	let div0;
    	let span;
    	let t0_value = /*$LOCALE*/ ctx[8][/*WAITING_TEXT*/ ctx[7]] + "";
    	let t0;
    	let div0_class_value;
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	let if_block0 = /*closeButton*/ ctx[0] && create_if_block_1$e(ctx);
    	let if_block1 = /*applyButton*/ ctx[1] && create_if_block$h(ctx);

    	return {
    		c() {
    			div0 = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			if (default_slot) default_slot.c();
    			t2 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr(span, "class", "title");
    			attr(div0, "class", div0_class_value = "pageloader " + (/*loading*/ ctx[3] ? 'is-active' : ''));
    			attr(div1, "class", "buttons is-grouped is-centered mt-4");
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);
    			append(div0, span);
    			append(span, t0);
    			insert(target, t1, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert(target, t2, anchor);
    			insert(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append(div1, t3);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if ((!current || dirty & /*$LOCALE, WAITING_TEXT*/ 384) && t0_value !== (t0_value = /*$LOCALE*/ ctx[8][/*WAITING_TEXT*/ ctx[7]] + "")) set_data(t0, t0_value);

    			if (!current || dirty & /*loading*/ 8 && div0_class_value !== (div0_class_value = "pageloader " + (/*loading*/ ctx[3] ? 'is-active' : ''))) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*closeButton*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*closeButton*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$e(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t3);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*applyButton*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*applyButton*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$h(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div0);
    			if (detaching) detach(t1);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach(t2);
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    }

    // (25:2) <UIBox {classes}>
    function create_default_slot_1$1(ctx) {
    	let uititle;
    	let t;
    	let uicontent;
    	let current;

    	uititle = new Ui_title({
    			props: {
    				size: "2",
    				title: /*$LOCALE*/ ctx[8][/*title*/ ctx[4]],
    				subtitle: /*$LOCALE*/ ctx[8][/*subtitle*/ ctx[5]]
    			}
    		});

    	uicontent = new Ui_content({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(uititle.$$.fragment);
    			t = space();
    			create_component(uicontent.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uititle, target, anchor);
    			insert(target, t, anchor);
    			mount_component(uicontent, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uititle_changes = {};
    			if (dirty & /*$LOCALE, title*/ 272) uititle_changes.title = /*$LOCALE*/ ctx[8][/*title*/ ctx[4]];
    			if (dirty & /*$LOCALE, subtitle*/ 288) uititle_changes.subtitle = /*$LOCALE*/ ctx[8][/*subtitle*/ ctx[5]];
    			uititle.$set(uititle_changes);
    			const uicontent_changes = {};

    			if (dirty & /*$$scope, applyButton, closeButton, loading, $LOCALE, WAITING_TEXT*/ 1419) {
    				uicontent_changes.$$scope = { dirty, ctx };
    			}

    			uicontent.$set(uicontent_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uititle.$$.fragment, local);
    			transition_in(uicontent.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uititle.$$.fragment, local);
    			transition_out(uicontent.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uititle, detaching);
    			if (detaching) detach(t);
    			destroy_component(uicontent, detaching);
    		}
    	};
    }

    // (24:0) <UIOverlay {show} closeOnClick={false} closeButton={false} >
    function create_default_slot$1(ctx) {
    	let uibox;
    	let current;

    	uibox = new Ui_box({
    			props: {
    				classes: /*classes*/ ctx[6],
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(uibox.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uibox, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uibox_changes = {};
    			if (dirty & /*classes*/ 64) uibox_changes.classes = /*classes*/ ctx[6];

    			if (dirty & /*$$scope, applyButton, closeButton, loading, $LOCALE, WAITING_TEXT, title, subtitle*/ 1467) {
    				uibox_changes.$$scope = { dirty, ctx };
    			}

    			uibox.$set(uibox_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uibox.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uibox.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uibox, detaching);
    		}
    	};
    }

    function create_fragment$o(ctx) {
    	let uioverlay;
    	let current;

    	uioverlay = new Ui_overlay({
    			props: {
    				show: /*show*/ ctx[2],
    				closeOnClick: false,
    				closeButton: false,
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(uioverlay.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uioverlay, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const uioverlay_changes = {};
    			if (dirty & /*show*/ 4) uioverlay_changes.show = /*show*/ ctx[2];

    			if (dirty & /*$$scope, classes, applyButton, closeButton, loading, $LOCALE, WAITING_TEXT, title, subtitle*/ 1531) {
    				uioverlay_changes.$$scope = { dirty, ctx };
    			}

    			uioverlay.$set(uioverlay_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uioverlay.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uioverlay.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uioverlay, detaching);
    		}
    	};
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(8, $LOCALE = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { closeButton = false } = $$props;
    	let { applyButton = false } = $$props;
    	let { show = false } = $$props;
    	let { loading = false } = $$props;
    	let { title = 'Modal window' } = $$props;
    	let { subtitle = '' } = $$props;
    	let { classes = '' } = $$props;
    	let { WAITING_TEXT = 'Обработка' } = $$props;

    	$$self.$$set = $$props => {
    		if ('closeButton' in $$props) $$invalidate(0, closeButton = $$props.closeButton);
    		if ('applyButton' in $$props) $$invalidate(1, applyButton = $$props.applyButton);
    		if ('show' in $$props) $$invalidate(2, show = $$props.show);
    		if ('loading' in $$props) $$invalidate(3, loading = $$props.loading);
    		if ('title' in $$props) $$invalidate(4, title = $$props.title);
    		if ('subtitle' in $$props) $$invalidate(5, subtitle = $$props.subtitle);
    		if ('classes' in $$props) $$invalidate(6, classes = $$props.classes);
    		if ('WAITING_TEXT' in $$props) $$invalidate(7, WAITING_TEXT = $$props.WAITING_TEXT);
    		if ('$$scope' in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	return [
    		closeButton,
    		applyButton,
    		show,
    		loading,
    		title,
    		subtitle,
    		classes,
    		WAITING_TEXT,
    		$LOCALE,
    		slots,
    		$$scope
    	];
    }

    class Ui_modal extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {
    			closeButton: 0,
    			applyButton: 1,
    			show: 2,
    			loading: 3,
    			title: 4,
    			subtitle: 5,
    			classes: 6,
    			WAITING_TEXT: 7
    		});
    	}
    }

    var index$4 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        UIModal: Ui_modal,
        UIOverlay: Ui_overlay
    });

    /* src/elements/notification/ui.error.svelte generated by Svelte v3.46.6 */

    function create_fragment$n(ctx) {
    	let article;
    	let div0;
    	let p;
    	let t0_value = /*$LOCALE*/ ctx[2][/*title*/ ctx[1]] + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*$LOCALE*/ ctx[2][/*message*/ ctx[0]] + "";
    	let t2;

    	return {
    		c() {
    			article = element("article");
    			div0 = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			attr(div0, "class", "message-header");
    			attr(div1, "class", "message-body");
    			attr(article, "class", "message is-danger");
    		},
    		m(target, anchor) {
    			insert(target, article, anchor);
    			append(article, div0);
    			append(div0, p);
    			append(p, t0);
    			append(article, t1);
    			append(article, div1);
    			append(div1, t2);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*$LOCALE, title*/ 6 && t0_value !== (t0_value = /*$LOCALE*/ ctx[2][/*title*/ ctx[1]] + "")) set_data(t0, t0_value);
    			if (dirty & /*$LOCALE, message*/ 5 && t2_value !== (t2_value = /*$LOCALE*/ ctx[2][/*message*/ ctx[0]] + "")) set_data(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(article);
    		}
    	};
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(2, $LOCALE = $$value));
    	let { message } = $$props;
    	let { title } = $$props;

    	$$self.$$set = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    	};

    	return [message, title, $LOCALE];
    }

    class Ui_error extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { message: 0, title: 1 });
    	}
    }

    /* src/elements/notification/ui.success.svelte generated by Svelte v3.46.6 */

    function create_fragment$m(ctx) {
    	let article;
    	let div0;
    	let p;
    	let t0_value = /*$LOCALE*/ ctx[2][/*title*/ ctx[1]] + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*$LOCALE*/ ctx[2][/*message*/ ctx[0]] + "";
    	let t2;

    	return {
    		c() {
    			article = element("article");
    			div0 = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			attr(div0, "class", "message-header");
    			attr(div1, "class", "message-body");
    			attr(article, "class", "message is-success");
    		},
    		m(target, anchor) {
    			insert(target, article, anchor);
    			append(article, div0);
    			append(div0, p);
    			append(p, t0);
    			append(article, t1);
    			append(article, div1);
    			append(div1, t2);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*$LOCALE, title*/ 6 && t0_value !== (t0_value = /*$LOCALE*/ ctx[2][/*title*/ ctx[1]] + "")) set_data(t0, t0_value);
    			if (dirty & /*$LOCALE, message*/ 5 && t2_value !== (t2_value = /*$LOCALE*/ ctx[2][/*message*/ ctx[0]] + "")) set_data(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(article);
    		}
    	};
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(2, $LOCALE = $$value));
    	let { message } = $$props;
    	let { title } = $$props;

    	$$self.$$set = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    	};

    	return [message, title, $LOCALE];
    }

    class Ui_success extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { message: 0, title: 1 });
    	}
    }

    /* src/elements/notification/ui.cookie.notification.svelte generated by Svelte v3.46.6 */

    function create_if_block$g(ctx) {
    	let div;
    	let p;
    	let t0_value = /*$LOCALE*/ ctx[3][/*message*/ ctx[1]] + "";
    	let t0;
    	let t1;
    	let button;
    	let t2_value = /*$LOCALE*/ ctx[3][/*agree*/ ctx[2]] + "";
    	let t2;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			button = element("button");
    			t2 = text(t2_value);
    			attr(p, "class", "svelte-19d5xat");
    			attr(button, "class", "button is-success cookie_accept svelte-19d5xat");
    			attr(div, "id", "cookie_notification");
    			attr(div, "class", "svelte-19d5xat");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p);
    			append(p, t0);
    			append(div, t1);
    			append(div, button);
    			append(button, t2);

    			if (!mounted) {
    				dispose = listen(button, "click", /*accept*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, message*/ 10 && t0_value !== (t0_value = /*$LOCALE*/ ctx[3][/*message*/ ctx[1]] + "")) set_data(t0, t0_value);
    			if (dirty & /*$LOCALE, agree*/ 12 && t2_value !== (t2_value = /*$LOCALE*/ ctx[3][/*agree*/ ctx[2]] + "")) set_data(t2, t2_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$l(ctx) {
    	let if_block_anchor;
    	let if_block = /*show*/ ctx[0] && create_if_block$g(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (/*show*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$g(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(3, $LOCALE = $$value));
    	let { show = false } = $$props;
    	let { message = 'Для улучшения работы сайта и его взаимодействия с пользователями мы используем файлы cookie. Продолжая работу с сайтом, Вы разрешаете использование cookie-файлов. Вы всегда можете отключить файлы cookie в настройках Вашего браузера.' } = $$props;
    	let { agree = 'Хорошо' } = $$props;

    	onMount(() => {
    		let cookieDate = localStorage.getItem('cookie_date');

    		if (!cookieDate || +cookieDate + 31536000000 < Date.now()) {
    			$$invalidate(0, show = true);
    		}
    	});

    	function accept() {
    		localStorage.setItem('cookie_date', Date.now());
    		$$invalidate(0, show = false);
    	}

    	$$self.$$set = $$props => {
    		if ('show' in $$props) $$invalidate(0, show = $$props.show);
    		if ('message' in $$props) $$invalidate(1, message = $$props.message);
    		if ('agree' in $$props) $$invalidate(2, agree = $$props.agree);
    	};

    	return [show, message, agree, $LOCALE, accept];
    }

    class Ui_cookie_notification extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { show: 0, message: 1, agree: 2 });
    	}
    }

    var index$3 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        UIError: Ui_error,
        UISuccess: Ui_success,
        UICookieNotification: Ui_cookie_notification
    });

    //block elements

    var index$2 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Blocks: index$c,
        Various: index$b,
        Buttons: index$a,
        Forms: index$9,
        Icons: index$8,
        Images: index$7,
        Layouts: index$6,
        Links: index$5,
        Modals: index$4,
        Notifications: index$3,
        UICommon: UICommon
    });

    const META_METHOD_INIT = Symbol('init'),
          META_DATA = Symbol('data'),
          META_WORKING = Symbol('working'),
          META_OPTIONS = Symbol('options');
    class notBase extends EventEmitter {
      constructor(input) {
        super();
        this[META_DATA] = {};
        this[META_WORKING] = {};
        this[META_OPTIONS] = {};
        this[META_METHOD_INIT](input);
        return this;
      }

      [META_METHOD_INIT](input) {
        if (!input) {
          input = {};
        }

        if (Object.prototype.hasOwnProperty.call(input, 'data')) {
          this.setData(input.data);
        }

        if (Object.prototype.hasOwnProperty.call(input, 'working')) {
          this.setWorking(input.working);
        }

        if (Object.prototype.hasOwnProperty.call(input, 'options')) {
          this.setOptions(input.options);
        }

        this.log = notCommon$2.genLogMsg(this.getWorking('name'));
        this.info = this.log;
        this.debug = notCommon$2.genLogDebug(this.getWorking('name'));
        this.error = notCommon$2.genLogError(this.getWorking('name'));
      }

      setCommon(what, args) {
        switch (args.length) {
          case 1:
            {
              /* set collection */
              what = args[0];
              break;
            }

          case 2:
            {
              /* set collection element */
              notPath.set(args[0]
              /* path */
              , what
              /* collection */
              , undefined
              /* helpers */
              , args[1]
              /* value */
              );
              break;
            }
        }

        return this;
      }

      getCommon(what, args) {
        switch (args.length) {
          /* if we want get data by path */
          case 1:
            {
              return notPath.get(args[0], what);
            }

          /* if we want get data by path with default value */

          case 2:
            {
              let res = notPath.get(args[0], what);

              if (res === undefined) {
                /* no data, return default value */
                return args[1];
              } else {
                /* data, return it */
                return res;
              }
            }

          /* return full collection */

          default:
            {
              return what;
            }
        }
      }
      /*
        CORE OBJECT
          DATA - information
          OPTIONS - how to work
          WORKING - temporarily generated in proccess
      */


      setData() {
        if (arguments.length === 1) {
          this[META_DATA] = arguments[0];
        } else {
          this.setCommon(this.getData(), arguments);
        }

        this.emit('change');
        return this;
      }

      getData() {
        return this.getCommon(this[META_DATA], arguments);
      }

      setOptions() {
        if (arguments.length === 1) {
          this[META_OPTIONS] = arguments[0];
        } else {
          this.setCommon(this.getOptions(), arguments);
        }

        return this;
      }

      getOptions() {
        return this.getCommon(this[META_OPTIONS], arguments);
      }

      setWorking() {
        if (arguments.length === 1) {
          this[META_WORKING] = arguments[0];
        } else {
          this.setCommon(this.getWorking(), arguments);
        }

        return this;
      }

      getWorking() {
        return this.getCommon(this[META_WORKING], arguments);
      }

      report(e) {
        if (notCommon$2.report) {
          notCommon$2.report(e);
        }
      }

      getApp() {
        return notCommon$2.getApp();
      }

      destroy() {
        this.removeEvent();
        this.setOptions(null);
        this.setWorking(null);
        this.setData(null);
        this.emit('destroy');
      }

    }

    const OPT_MODE_HISTORY = Symbol('history'),
          OPT_MODE_HASH = Symbol('hash'),
          OPT_DEFAULT_CHECK_INTERVAL = 50;

    class notRouter extends notBase {
      constructor() {
        super({
          working: {
            routes: [],
            mode: OPT_MODE_HISTORY,
            root: '/',
            //always in slashes /user/, /, /input/. and no /user or input/level
            initialized: false
          }
        });
        return this;
      }

      history() {
        this.setWorking('mode', OPT_MODE_HISTORY);
      }

      hash() {
        this.setWorking('mode', OPT_MODE_HASH);
      } // root should start and end with /


      setRoot(root) {
        this.setWorking('root', root && root !== '/' ? '/' + this.clearSlashes(root) + '/' : '/');
        return this;
      }

      clearSlashes(path) {
        //first and last slashes removal
        return path.toString().replace(/\/$/, '').replace(/^\//, '');
      }

      add(re, handler) {
        if (typeof re == 'function') {
          handler = re;
          re = '';
        }

        let rule = {
          re: re,
          handler: handler
        };
        this.getWorking('routes').push(rule);
        return this;
      }

      addList(list) {
        for (let t in list) {
          this.add(t, list[t]);
        }

        return this;
      }

      remove(param) {
        for (var i = 0, r; i < this.getWorking('routes').length, r = this.getWorking('routes')[i]; i++) {
          if (r.handler === param || r.re === param) {
            this.getWorking('routes').splice(i, 1);
            return this;
          }
        }

        return this;
      }

      flush() {
        this.setWorking({
          routes: [],
          mode: OPT_MODE_HISTORY,
          root: '/'
        });
        return this;
      }

      isInitialized() {
        return this.getWorking('initialized');
      }

      setInitialized() {
        let val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        return this.setWorking('initialized', val);
      }

      getFragment() {
        var fragment = '';

        if (this.getWorking('mode') === OPT_MODE_HISTORY) {
          if (!location) return '';
          fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
          fragment = fragment.replace(/\?(.*)$/, '');
          fragment = this.getWorking('root') != '/' ? fragment.replace(this.getWorking('root'), '') : fragment;
        } else {
          if (!window) return '';
          var match = window.location.href.match(/#(.*)$/);
          fragment = match ? match[1] : '';
        }

        return this.clearSlashes(fragment);
      }

      checkLocation() {
        let current = this.getWorking('current'),
            fragment = this.getFragment(),
            init = this.isInitialized();

        if (current !== fragment || !init) {
          this.setWorking('current', fragment);
          this.check(fragment);
          this.setInitialized(true);
        }
      }

      hrefClick() {//console.log(...arguments);
      }

      getRoot() {
        return this.getWorking('root');
      }

      listen() {
        let loopInterval = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : OPT_DEFAULT_CHECK_INTERVAL;
        this.setWorking('current', 'notInitialized');
        clearInterval(this.getWorking('interval'));
        this.setWorking('interval', setInterval(this.checkLocation.bind(this), loopInterval));
        window.addEventListener('popstate', this.hrefClick.bind(this));
        return this;
      }

      check(f) {
        let fragment = f || this.getFragment(),
            failBack = null;

        for (let i = 0; i < this.getWorking('routes').length; i++) {
          let path = this.getWorking('root') + this.getWorking('routes')[i].re,
              fullRE = this.clearSlashes(decodeURI(path)),
              match = fragment.match(fullRE);

          if (match && match.length) {
            if (fullRE === '') {
              match.shift();
              failBack = {
                route: this.getWorking('routes')[i],
                match
              };
            } else {
              match.shift();
              this.getWorking('routes')[i].handler.apply(this.host || {}, match);
              this.emit('afterRoute', this.getWorking('routes')[i]);
              return this;
            }
          }
        }

        if (failBack) {
          failBack.route.handler.apply(this.host || {}, failBack.match);
          this.emit('afterRoute', failBack.route);
        }

        return this;
      }
      /**
      *  Refreshes page
      * @param {integer} timeout time to wait in ms
      */


      refresh() {
        var _this = this;

        let timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        if (timeout > 0) {
          setTimeout(function () {
            return _this.refresh();
          }, timeout);
        } else {
          this.check(this.getWorking('current'));
        }
      }

      navigate(path) {
        path = path ? path : '';

        switch (this.getWorking('mode')) {
          case OPT_MODE_HISTORY:
            {
              //console.log('push state', this.getFullRoute(path));
              this.lastRoute = this.getFullRoute(path);
              history.pushState(null, null, this.lastRoute);
              break;
            }

          case OPT_MODE_HASH:
            {
              window.location.href.match(/#(.*)$/);
              window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
              break;
            }
        }

        return this;
      }

      getFullRoute() {
        let path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        path = this.clearSlashes(path);
        let root = this.getWorking('root');

        if (root !== '/') {
          if (path.indexOf(root.substring(1)) === 0) {
            return '/' + path;
          }
        }

        return this.getWorking('root') + this.clearSlashes(path);
      }

      getAllLinks() {
        var allElements = document.body.querySelectorAll('a');
        var list = [];

        for (var j = 0; j < allElements.length; j++) {
          for (var i = 0, atts = allElements[j].attributes, n = atts.length; i < n; i++) {
            if (atts[i].nodeName.indexOf('n-href') === 0) {
              list.push(allElements[j]);
              break;
            }
          }
        }

        return list;
      }

      reRouteExisted() {
        let list = this.getAllLinks();

        for (let t = 0; t < list.length; t++) {
          this.initRerouting(list[t], list[t].getAttribute('n-href'));
        }

        return this;
      }

      initRerouting(el, link) {
        var _this2 = this;

        if (!el.notRouterInitialized) {
          let fullLink = this.getFullRoute(link);
          el.setAttribute('href', fullLink);
          el.addEventListener('click', function (e) {
            e.preventDefault();

            _this2.navigate(link);

            return false;
          });
          el.notRouterInitialized = true;
        }

        return this;
      }

    }

    var notRouter$1 = new notRouter();

    const LOG_PREFIX$1 = 'APIQuee';

    class notAPIQueue extends notBase {
      constructor() {
        let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        super({
          working: {
            name: options.name ? options.name : LOG_PREFIX$1
          },
          options
        });
        this.busy = false;
        this.queue = [];
        this.busySince = false;
        this.afterEmpty = null;
        this.start();
        return this;
      }

      stop() {
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = undefined;
          this.busy = false;
          this.busySince = false;
        }
      }

      start() {
        this.stop();
        this.interval = setInterval(this.checkQueue.bind(this), this.QUEUE_CHECK_INTERVAL);
      }

      checkQueue() {
        var _this = this;

        if (!this.isEmpty() && !this.isBusy()) {
          this.setBusy().runNext().then(this.setFree.bind(this)).catch(function (e) {
            _this.error(e);

            _this.setFree();
          });
        } else {
          if (!this.isBusy()) {
            if (this.afterEmpty) {
              let t = this.afterEmpty;
              this.afterEmpty = null;
              t();
            }
          }
        }
      }

      addToQueue(task) {
        this.queue.push(task);
      }

      runNext() {
        let list = this.queue.map(function (action) {
          return action.title;
        }).join(', ');
        this.debug(`tasks [${list}]`);
        let task = this.queue.shift();

        if (!notCommon$2.isFunc(task.action)) {
          this.error('В задании нет исполнимой части, action не функция', task.title);
          return Promise.resolve();
        }

        if (!notCommon$2.isFunc(task.resolve)) {
          this.error('В задании нет возвратной части, resolve не функция', task.title);
          return task.action();
        }

        return task.action().then(task.resolve);
      }

      isBusy() {
        let busy = !!this.busy,
            now = Date.now() / 1000;

        if (busy) {
          if (now - this.busySince > this.MAX_BUSY_TIME) {
            this.setFree();
            return false;
          } else {
            return true;
          }
        } else {
          return false;
        }
      }

      setBusy() {
        this.busy = true;
        this.busySince = Date.now() / 1000;
        return this;
      }

      setFree() {
        this.busy = false;
        this.busySince = false;
        return this;
      }

      isEmpty() {
        return this.queue.length === 0;
      }
      /**
      * Исполнитель запросов
      * @param      {function}   action      должна возвращать Promise
      * @param      {function}   afterEmpty  будет выполнена когда очурудь опустеет и будет свободна. полезна при пачке однотипных заданий
      * @returns    {Promise}  результат функции
      **/


      run(action) {
        var _this2 = this;

        let afterEmpty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        let title = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

        if (afterEmpty && this.afterEmpty === null) {
          this.afterEmpty = afterEmpty;
        }

        return new Promise(function (resolve, reject) {
          try {
            _this2.addToQueue({
              action,
              resolve,
              title
            });
          } catch (e) {
            _this2.error(e);

            reject(e);
          }
        });
      }

      actionIsQueued(title) {
        return this.queue.some(function (queued) {
          return queued.title == title;
        });
      }

      runIfNotQueued(action) {
        let afterEmpty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        let title = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

        if (this.actionIsQueued(title)) {
          return Promise.resolve();
        } else {
          this.run(action, afterEmpty, title);
        }
      }

    }

    _defineProperty(notAPIQueue, "QUEUE_CHECK_INTERVAL", 100);

    _defineProperty(notAPIQueue, "MAX_BUSY_TIME", 300);

    let notAPIOptions = {
      rps: 50,
      protocol: 'http',
      host: 'localhost',
      port: 9000
    };

    const LOG_PREFIX = 'APIConnection';

    class notAPIConnection extends notBase {
      constructor(options) {
        super({
          options,
          working: {
            name: options.name ? options.name : LOG_PREFIX
          }
        });
        this.online = null;
        this.run();
        return this;
      }

      run() {
        this.int = window.setInterval(this.check.bind(this), 1000);
      }

      pause() {
        window.clearInterval(this.int);
      }

      resume() {
        this.run();
      }

      isOnline() {
        return window.navigator.onLine;
      }

      check() {
        let t = this.isOnline();

        if (this.online !== null) {
          if (this.online !== t) {
            this.changeState(t);
          }
        }

        this.online = t;
      }

      changeState() {
        let online = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        if (online) {
          this.emit('online');
        } else {
          this.emit('offline');
        }
      }

    }

    _defineProperty(notAPIConnection, "int", void 0);

    _defineProperty(notAPIConnection, "online", void 0);

    var index$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        notAPIQueue: notAPIQueue,
        notAPIOptions: notAPIOptions,
        notAPIConnection: notAPIConnection
    });

    var _lib = /*#__PURE__*/new WeakMap();

    class Lib {
      constructor(seedLib) {
        _classPrivateFieldInitSpec(this, _lib, {
          writable: true,
          value: {}
        });

        if (seedLib instanceof Lib) {
          this.import(seedLib.getContent());
        }
      }
      /**
      *
      * @params {string}  mode what to do if element exists [replace|add|skip]
      */


      add(name, comp) {
        let mode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'replace';

        if (this.contains(name)) {
          if (mode === 'replace') {
            _classPrivateFieldGet(this, _lib)[name] = comp;
          } else if (mode === 'add') {
            _classPrivateFieldGet(this, _lib)[name] = Object.assign(_classPrivateFieldGet(this, _lib)[name], comp);
          }
        } else {
          _classPrivateFieldGet(this, _lib)[name] = comp;
        }
      }

      get(name) {
        return _classPrivateFieldGet(this, _lib)[name];
      }

      contains(name) {
        return Object.prototype.hasOwnProperty.call(_classPrivateFieldGet(this, _lib), name);
      }

      import(bulk) {
        let mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'replace';

        for (let f in bulk) {
          this.add(f, bulk[f], mode);
        }
      }

      isEmpty() {
        return Object.keys(_classPrivateFieldGet(this, _lib)).length === 0;
      }

      getContent() {
        return { ..._classPrivateFieldGet(this, _lib)
        };
      }

    }

    /*
    * Библиотека UI конструкторов
    */
    const COMPONENTS$1 = new Lib();
    const FIELDS$2 = new Lib();
    const VARIANTS$1 = new Lib();

    const //interface
    //record
    META_INTERFACE = Symbol('interface'),
          META_MAP_TO_INTERFACE = ['getActionsCount', 'getActions', 'setFindBy', 'resetFilter', 'setFilter', 'getFilter', 'setSorter', 'getSorter', 'resetSorter', 'setPageNumber', 'setPageSize', 'setPager', 'setReturn', 'setSearch', 'getSearch', 'resetSearch', 'resetPager', 'getPager', 'addFormFieldType', 'addFormField', 'getFieldTypes', 'getActionFormFields'],
          DEFAULT_ACTION_PREFIX$1 = '$';

    const OPT_DEFAULT_INDEX_FIELD_NAME_PRIORITY = ['_id', 'id', 'ID'],
          DEFAULT_FILTER = {},
          DEFAULT_SEARCH = '',
          DEFAULT_RETURN = {},
          DEFAULT_PAGE_NUMBER = 0,
          DEFAULT_PAGE_SIZE = 10,
          DEFAULT_ACTION_PREFIX = '$',
          DEFAULT_WS_ROUTE_ACTION_SPLITTER = '//';

    class notInterface extends notBase {
      constructor(manifest, options) {
        super({
          working: {
            name: 'network interface for: ' + (manifest.model ? manifest.model : 'unknown'),
            filter: DEFAULT_FILTER,
            search: DEFAULT_SEARCH,
            return: DEFAULT_RETURN,
            pager: {
              size: DEFAULT_PAGE_SIZE,
              page: DEFAULT_PAGE_NUMBER
            }
          },
          options
        });
        this.manifest = manifest;
        this.initActions();
        return this;
      }

      initActions() {
        if (this.getActionsCount() > 0) {
          let actions = this.getActions();

          for (let actionName in actions) {
            this.initAction(actionName, actions[actionName]);
          }
        }
      }

      initAction(actionName) {
        var _this = this;

        if (!Object.prototype.hasOwnProperty.call(this, [DEFAULT_ACTION_PREFIX + actionName])) {
          this[DEFAULT_ACTION_PREFIX + actionName] = function (opts, headers) {
            let fileUpload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
            let files = arguments.length > 3 ? arguments[3] : undefined;
            return _this.request(_this, actionName, opts, headers, fileUpload, files);
          };
        }
      }

      requestHTTP(record, actionName, params) {
        let headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        let fileUpload = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
        let files = arguments.length > 5 ? arguments[5] : undefined;

        try {
          let compositeData = Object.assign({}, record.getData && typeof record.getData === 'function' ? record.getData() : record, params);
          let actionData = this.getActionData(actionName),
              requestParams = this.collectRequestData(actionData),
              requestParamsEncoded = this.encodeRequest(requestParams),
              //id = this.getID(compositeData, actionData, actionName),
          apiServerURL = this.getServerURL(),
              url = this.getURL(compositeData, actionData, actionName),
              opts = {};

          if (fileUpload) {
            url = this.getURL(params, actionData, actionName);
            const fd = new FormData();
            fd.append('file', files);
            opts.body = fd;
          } else {
            if (['OPTIONS', 'GET'].indexOf(actionData.method.toUpperCase()) === -1) {
              opts = {
                body: JSON.stringify(record.getData && typeof record.getData === 'function' ? record.getData() : record),
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                }
              };
            }
          }

          opts.method = actionData.method.toUpperCase();

          if (headers && Object.keys(headers).length) {
            opts.headers = headers;
          }

          return fetch(apiServerURL + url + requestParamsEncoded, opts).then(function (response) {
            return response.json();
          });
        } catch (e) {
          notCommon$2.error(e);
          notCommon$2.report(e);
        }
      }

      requestWS(record, actionName) {
        try {
          let actionData = this.getActionData(actionName),
              requestParams = this.collectRequestData(actionData);
          const WS = notCommon$2.getApp().getWSClient();
          const messageName = this.getWSRequestName(actionName);
          const payload = Object.assign({}, requestParams, record.getData());

          if (Object.prototype.hasOwnProperty.call(actionData, 'type') && typeof actionData.type === 'string' && actionData.type.length && actionData.type !== 'request') {
            return WS.message(actionData.type, messageName, payload).then(function (response) {
              return response.payload;
            });
          } else {
            return WS.request(messageName, payload).then(function (response) {
              return response.payload;
            });
          }
        } catch (e) {
          notCommon$2.error(e);
          notCommon$2.report(e);
        }
      }

      request() {
        let actionData = this.getActionData(arguments[1]);

        switch (this.selectTransport(actionData)) {
          case 'ws':
            return this.requestWS(...arguments);

          case 'http':
            return this.requestHTTP(...arguments);

          default:
            throw new Error('Offline');
        }
      }

      wsIsUp(actionData) {
        if (actionData.ws === true) {
          let client;

          if (Object.prototype.hasOwnProperty.call(actionData, 'wsClient') && actionData.wsClient) {
            client = notCommon$2.getApp().getWSClient(actionData.wsClient);
          } else {
            client = notCommon$2.getApp().getWSClient();
          }

          if (client) {
            return true;
          }
        }

        return false;
      }

      selectTransport(actionData) {
        if (this.wsIsUp(actionData)) {
          return 'ws'; //for ws/wss
        }

        if (Object.prototype.hasOwnProperty.call(actionData, 'method')) {
          return 'http'; //for http/https
        }

        return false; //for offline
      }

      getModelName() {
        return this && this.manifest ? this.manifest.model : null;
      }

      getActionData(actionName) {
        return this.getActions() && this.getActions()[actionName] ? this.getActions()[actionName] : null;
      }

      getActionsCount() {
        return this.getActions() ? Object.keys(this.getActions()).length : 0;
      }

      getActions() {
        return this.manifest && this.manifest.actions ? this.manifest.actions : {};
      }

      parseParams(start, end, line, record) {
        let fieldName = '';
        let len = start.length;

        while (line.indexOf(start) > -1) {
          let ind = line.indexOf(start);
          let startSlice = ind + len;
          let endSlice = line.indexOf(end);

          if (ind > endSlice) {
            break;
          }

          fieldName = line.slice(startSlice, endSlice);
          if (fieldName == '') break;
          this.log(start + fieldName + end, notPath.get(fieldName, record));
          line = line.replace(start + fieldName + end, notPath.get(fieldName, record));
        }

        return line;
      }

      parseLine(line, record, actionName) {
        line = line.replace(':modelName', this.manifest.model);
        line = line.replace(':actionName', actionName);
        line = this.parseParams(':record[', ']', line, record);
        line = this.parseParams(':', '?', line, record);
        return line;
      }

      getURL(record, actionData, actionName) {
        var line = this.parseLine(this.manifest.url, record, actionName) + (Object.prototype.hasOwnProperty.call(actionData, 'postFix') ? this.parseLine(actionData.postFix, record, actionName) : '');
        return line;
      }

      getServerURL() {
        return notCommon$2.getApp() ? notCommon$2.getApp().getOptions('api.server.url', '') : '';
      }

      getWSRequestName(actionName) {
        const modelName = this.manifest.model;
        return `${modelName}${DEFAULT_WS_ROUTE_ACTION_SPLITTER}${actionName}`;
      }

      encodeRequest(data) {
        let p = '?';

        for (let t in data) {
          if (typeof data[t] !== 'undefined' && data[t] !== null) {
            p += encodeURIComponent(t) + '=' + encodeURIComponent(data[t].constructor === Object ? JSON.stringify(data[t]) : data[t]) + '&';
          }
        } //for test purpose only, special test server needed


        if (this.getOptions('test')) {
          p += '&test=1';

          if (this.getOptions('test.session')) {
            p += '&session=' + this.getOptions('test.session');
          }

          if (this.getOptions('test.session')) {
            p += '&role=' + this.getOptions('test.role');
          }
        }

        return p;
      }

      collectRequestData(actionData) {
        let requestData = {};

        if (Object.prototype.hasOwnProperty.call(actionData, 'data') && Array.isArray(actionData.data)) {
          for (let i = 0; i < actionData.data.length; i++) {
            let dataProviderName = 'get' + notCommon$2.capitalizeFirstLetter(actionData.data[i]);

            if (this[dataProviderName] && typeof this[dataProviderName] === 'function') {
              let data = this[dataProviderName](),
                  res = {};

              if (['pager', 'sorter', 'filter', 'search', 'return'].indexOf(actionData.data[i]) > -1) {
                res[actionData.data[i]] = data;
              } else {
                res = data;
              }

              requestData = Object.assign(requestData, res);
            }
          }
        }

        return requestData;
      }

      getID(record, actionData) {
        let resultId,
            list = OPT_DEFAULT_INDEX_FIELD_NAME_PRIORITY,
            prefixes = ['', this.manifest.model];

        if (Object.prototype.hasOwnProperty.call(actionData, 'index') && actionData.index) {
          list = [actionData.index].concat(OPT_DEFAULT_INDEX_FIELD_NAME_PRIORITY);
        }

        for (let pre of prefixes) {
          for (let t of list) {
            if (Object.prototype.hasOwnProperty.call(record, pre + t)) {
              resultId = record[pre + t];
              break;
            }
          }
        }

        return resultId;
      }

      setFindBy(key, value) {
        var obj = {};
        obj[key] = value;
        return this.setFilter(obj);
      }

      setFilter() {
        let filterData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_FILTER;
        this.setWorking('filter', filterData);
        return this;
      }

      resetFilter() {
        return this.setFilter();
      }

      getFilter() {
        return this.getWorking('filter');
      }

      setSearch() {
        let searchData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_SEARCH;
        this.setWorking('search', searchData);
        return this;
      }

      resetSearch() {
        return this.setSearch();
      }

      getSearch() {
        return this.getWorking('search');
      }

      setSorter(sorterData) {
        this.setWorking('sorter', sorterData);
        return this;
      }

      resetSorter() {
        return this.setSorter({});
      }

      getSorter() {
        return this.getWorking('sorter');
      }

      setReturn() {
        let returnData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_RETURN;
        this.setWorking('return', returnData);
        return this;
      }

      resetReturn() {
        return this.setReturn({});
      }

      getReturn() {
        return this.getWorking('return');
      }

      setPageNumber(pageNumber) {
        this.setWorking('pager.page', pageNumber);
        return this;
      }

      setPageSize(pageSize) {
        this.setWorking('pager.size', pageSize);
        return this;
      }

      setPager() {
        let pageSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_PAGE_SIZE;
        let pageNumber = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_PAGE_NUMBER;

        if (pageSize.constructor === Number) {
          this.setWorking('pager', {
            size: pageSize,
            page: pageNumber
          });
        } else if (pageSize.constructor === Object) {
          this.setWorking('pager', {
            size: pageSize.size || DEFAULT_PAGE_SIZE,
            page: pageSize.page || DEFAULT_PAGE_NUMBER
          });
        }

        return this;
      }

      resetPager() {
        return this.setPager();
      }

      getPager() {
        return this.getWorking('pager');
      }

      getRecord() {
        this.getData();
      }

    }

    class notRecord extends notBase {
      constructor(manifest, item) {
        super();

        if (typeof item === 'undefined' || item === null || typeof item !== 'object') {
          return item;
        }

        if (item && item.isProxy) {
          notCommon$2.error('this is Proxy item');
          return item;
        }

        if (item && (item.isRecord || item.isProperty)) {
          return item;
        } else {
          if (Array.isArray(item)) {
            return this.createCollection(manifest, item);
          }
        }

        this.setOptions({});
        this[META_INTERFACE] = new notInterface(manifest, {});
        this.setData(item);
        this.interfaceUp();
        this.mapToInterface();
        this.mapToMethods();
        return this;
      }

      mapToInterface() {
        let rec = this;

        for (let t of META_MAP_TO_INTERFACE) {
          if (this[META_INTERFACE][t] && typeof this[META_INTERFACE][t] === 'function') {
            this[t] = function () {
              let res = rec[META_INTERFACE][t](...arguments);
              return res == rec[META_INTERFACE] ? rec : res;
            };
          }
        }
      }

      mapToMethods() {
        let manifest = this[META_INTERFACE].manifest,
            app = notCommon$2.getApp(),
            methods = {};

        if (manifest.methods) {
          methods = manifest.methods;
        } else if (app) {
          methods = app.getOptions(['models', this[META_INTERFACE].manifest.model].join('.'), {});
        }

        if (methods) {
          for (let t in methods) {
            if (Object.prototype.hasOwnProperty.call(methods, t)) {
              this[t] = methods[t];
            }
          }
        }
      }

      createCollection(manifest, items) {
        var collection = [];

        for (var i = 0; i < items.length; i++) {
          collection.push(new notRecord(manifest, items[i]));
        }

        return collection;
      }

      interfaceUp() {
        if (this[META_INTERFACE].getActionsCount() > 0) {
          let actions = this[META_INTERFACE].getActions();

          for (let i in actions) {
            this.actionUp(i, actions[i]);
          }
        }
      }

      actionUp(index) {
        var _this = this;

        if (!Object.prototype.hasOwnProperty.call(this, [DEFAULT_ACTION_PREFIX$1 + index])) {
          this[DEFAULT_ACTION_PREFIX$1 + index] = function () {
            return _this[META_INTERFACE].request(_this, index);
          };
        }
      }
      /*
      -> 'path.to.key', valueOfKey
      <- ok, with one onChange event triggered
      */


      setAttr(key, value) {
        return this.setData(key, value);
      }
      /*
      ->
      {
        'keyPath': value,
        'key.subPath': value2,
        'keyPath.0.title': value3
      }
      <- ok, with bunch of onChange events triggered
      */


      setAttrs(objectPart) {
        //notCommon.log('setAttrs', objectPart, Object.keys(objectPart));
        if (objectPart && typeof objectPart === 'object' && Object.keys(objectPart).length > 0) {
          for (let path in objectPart) {
            //notCommon.log('setAttrs one to go', path);
            this.setAttr(path, objectPart[path]);
          }
        }
      }
      /*
      -> 'pathToKey'
      <- value1
      */


      getAttr(what) {
        let plain = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        let prx = this.getData(what, {});

        if (plain) {
          return notCommon$2.stripProxy(prx);
        } else {
          return prx;
        }
      }
      /*
      -> ['pathToKey', 'path.to.key', 'simpleKey',...]
      <- [value1, value2, value3,...]
      */


      getAttrs(what) {
        let result = [];

        if (what && what.length > 0) {
          for (let path of what) {
            result.push(this.getAttr(path));
          }
        }

        return result;
      }

      getManifest() {
        if (this[META_INTERFACE]) {
          return this[META_INTERFACE].manifest;
        } else {
          return {};
        }
      }

      setItem(item) {
        this.setData(item);
        return this;
      }

    }

    const OPT_CONTROLLER_PREFIX = 'nc',
          OPT_RECORD_PREFIX = 'nr',
          DEFAULT_WS_CLIENT_NAME = 'main';
    class notApp extends notBase {
      constructor(options) {
        super({
          working: {
            name: options.name,
            interfaces: {},
            controllers: Object.prototype.hasOwnProperty.call(options, 'controllers') ? options.controllers : {},
            initController: null,
            currentController: null,
            uis: {},
            wsc: {},
            wss: {},
            services: {}
          },
          options
        });
        this.log('start app');
        notCommon$2.register('app', this);
        this.initManifest();
        return this;
      }

      initManifest() {
        notCommon$2.getJSON(this.getOptions('manifestURL'), {}).then(this.setInterfaceManifest.bind(this)).catch(notCommon$2.report.bind(this));
      }

      initRouter() {
        this.setWorking('router', notRouter$1);
        this.getWorking('router').setRoot(this.getOptions('router.root'));
        notRouter$1.reRouteExisted();
      }

      execRouter() {
        var routieInput = {};

        for (let t = 0; t < this.getOptions('router.manifest').length; t++) {
          let routeBlock = this.getOptions('router.manifest')[t],
              paths = routeBlock.paths,
              schemes = routeBlock.schemes,
              controller = routeBlock.controller;

          for (let i = 0; i < paths.length; i++) {
            let pathScheme = schemes && Array.isArray(schemes) && schemes.length > i ? schemes[i] : false;
            routieInput[paths[i]] = this.bindController(controller, pathScheme);
          }
        }

        this.getWorking('router').addList(routieInput).listen(); //.navigate(this.getOptions('router.index'));
      }

      setInterfaceManifest(manifest) {
        this.setOptions('interfaceManifest', manifest);
        this.initRouter();
        this.update();
      }

      getInterfaceManifest(modelName) {
        if (modelName) {
          return this.getOptions('interfaceManifest')[modelName];
        } else {
          return this.getOptions('interfaceManifest');
        }
      }

      update() {
        //нужно инициализировать
        //модели полученными интерфейсами
        this.updateInterfaces(); //иницилицировать и запустить контроллер инициализации

        this.initController();
        this.startApp();
      }

      startApp() {
        this.initServices(); //создать контроллеры
        //роутер и привязать к нему контроллеры

        this.execRouter();
        this.emit('afterStarted', this);
      }

      bindController(controllerName, controllerPathScheme) {
        let app = this;
        return function () {
          new controllerName(app, arguments, controllerPathScheme);
        };
      }

      initController() {
        if (typeof this.getOptions('initController') !== 'undefined') {
          let initController = this.getOptions('initController');
          this.setWorking('initController', new initController(this));
        }
      }

      getCurrentController() {
        return this.getWorking('currentController');
      }

      setCurrentController(ctrl) {
        let oldCtrl = this.getCurrentController();

        if (oldCtrl && oldCtrl.destroy) {
          oldCtrl.destroy();
        }

        this.setWorking('currentController', ctrl);
        return this;
      }

      updateInterfaces() {
        this.clearInterfaces();
        let manifests = this.getOptions('interfaceManifest');

        if (manifests) {
          for (let name in manifests) {
            let recordManifest = manifests[name],
                recordMethods = this.getOptions(['models', name].join('.'), {});
            recordManifest.methods = recordMethods;

            this.getWorking('interfaces')[name] = function (recordData) {
              return new notRecord(recordManifest, recordData);
            };

            window['nr' + notCommon$2.capitalizeFirstLetter(name)] = this.getWorking('interfaces')[name];
          }
        }
      }

      getRecordName(name) {
        return OPT_RECORD_PREFIX + notCommon$2.capitalizeFirstLetter(name);
      }

      getControllerName(name) {
        return OPT_CONTROLLER_PREFIX + notCommon$2.capitalizeFirstLetter(name);
      }

      getInterfaces() {
        return this.getWorking('interfaces');
      }

      clearInterfaces() {
        this.setWorking('interfaces', {});
        return this;
      }

      setWSClient() {
        let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_WS_CLIENT_NAME;
        let wsc = arguments.length > 1 ? arguments[1] : undefined;
        return this.setWorking(`wsc.${name}`, wsc);
      }

      getWSClient() {
        let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_WS_CLIENT_NAME;
        return this.getWorking(`wsc.${name}`);
      }

      getInterface(name) {
        return this.getInterfaces()[name];
      }

      getModel(name) {
        let data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return this.getInterface(name)(data);
      }

      setService(name, val) {
        return this.setWorking(`services.${name}`, val);
      }

      getService(name) {
        return this.getWorking(`services.${name}`);
      }

      initServices() {
        if (this.getOptions('services')) {
          for (let servName in this.getOptions('services')) {
            try {
              let serv = this.getOptions(`services.${servName}`);
              const servType = notCommon$2.detectType(serv);

              switch (servType) {
                case 'function':
                case 'class':
                  this.setService(servName, new serv(this));
                  break;

                default:
                  this.setService(servName, serv);
              }
            } catch (e) {
              this.error(`Service (${servName}) init error`, e);
            }
          }
        }
      }

      getConfigReaderForModule() {
        var _this = this;

        let moduleName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        const modConfPath = ['modules', moduleName].join('.');
        return {
          get: function (subPath, fallback) {
            if (subPath && typeof subPath == 'string' && subPath.length) {
              return _this.getOptions([modConfPath, subPath].join('.'), fallback);
            } else {
              return _this.getOptions(modConfPath, fallback);
            }
          }
        };
      }

    }

    _defineProperty(notApp, "DEFAULT_WS_CLIENT_NAME", DEFAULT_WS_CLIENT_NAME);

    /**
     * @const {string}  OPT_DEFAULT_ACTION_NAME      default action name
     */

    const OPT_DEFAULT_ACTION_NAME = 'default';
    /**
     * @const {string}  OPT_DEFAULT_CONTAINER_SELECTOR  selector of container HTML
     *                          element
     */

    const OPT_DEFAULT_CONTAINER_SELECTOR = 'main.content';
    /**
     * @const {string}  OPT_DEFAULT_PLURAL_NAME  default plural name of entities
     */

    const OPT_DEFAULT_PLURAL_NAME = 'Models';
    /**
     * @const {string}  OPT_DEFAULT_SINGLE_NAME  default single name of entities
     */

    const OPT_DEFAULT_SINGLE_NAME = 'Model';
    /**
     * @const {string}  OPT_DEFAULT_MODULE_NAME  default module name
     */

    const OPT_DEFAULT_MODULE_NAME = 'main';
    /**
     * @const {boolean}  OPT_DEFAULT_AUTO_NAME  if shoould be used auto name generator
     */

    const OPT_DEFAULT_AUTO_NAME = true;
    /*
     *  Basic class for user controller
     */

    class notController extends notBase {
      /**
       *  @static {number} PARAMS_LENGTH  number of params in URL path
       */

      /**
       *  @static {string} MODULE_NAME  name of module
       */

      /**
       *  @static {string} MODEL_NAME  name of model
       */

      /**
       *  @param {notApp} app
       */
      constructor(app, name) {
        var _this;

        super({});
        _this = this;
        this.app = app;
        this.app.setCurrentController(this);
        this.setWorking({
          name,
          ready: false,
          views: {},
          libs: {},
          helpers: {}
        });
        this.ui = {};
        this.els = {};
        this.setData({});
        this.setOptions({
          moduleName: OPT_DEFAULT_MODULE_NAME,
          containerSelector: OPT_DEFAULT_CONTAINER_SELECTOR,
          prefix: app.getOptions('paths.module'),
          names: {
            plural: OPT_DEFAULT_PLURAL_NAME,
            single: OPT_DEFAULT_SINGLE_NAME
          }
        });
        this.setURLPrefix(app.getOptions('router.root'));
        /*
          сразу делаем доступными модели notRecord из nc`ControllerName` будут доступны как this.nr`ModelName`
        */

        let interfaces = app.getInterfaces();
        this.make = {};

        for (let t in interfaces) {
          if (Object.prototype.hasOwnProperty.call(interfaces, t)) {
            this.make[t] = interfaces[t];
          }
        }

        this.on('destroy', function () {
          _this.app = null;

          for (let uiName in _this.ui) {
            _this.ui[uiName].destroy && _this.ui[uiName].destroy();
            _this.ui[uiName].$destroy && _this.ui[uiName].$destroy();
            _this.ui[uiName] = null;
          }

          _this.els = null;
          _this.make = null;
        });
        return this;
      }
      /**
       *  Returns current notApp
       *  @return {notApp}
       */


      getApp() {
        return notCommon$2.getApp();
      }
      /**
       *  Sets default controller model
       *  @param {notRecord}  model  notRecord interface object
       *  @return {notController}
       */


      setModel(model) {
        this.setWorking('model', model);
        return this;
      }
      /**
       *  Returns current model
       *  @param {object} data   model data
       *  @return {notRecord}
       */


      getModel(name, data) {
        if (typeof name === 'string') {
          return this.getInterface(name)(data || {});
        } else {
          return this.getInterface()(name || {});
        }
      }

      getInterface() {
        let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        return this.app.getInterface(name || this.getModelName());
      }
      /**
       *  Returns current model name
       *  @return {string}
       */


      getModelName() {
        return this.getWorking('modelName');
      }
      /**
       *  Sets default controller model name
       *  @param {string}  modelName  notRecord interface object
       *  @return {notController}
       */


      setModelName(modelName) {
        this.setWorking('modelName', notCommon$2.lowerFirstLetter(modelName));
        return this;
      }
      /**
       *  Returns current model primary ID field name
       *  @return {notRecord}
       */


      getModelIDFieldName() {
        return this.getWorking('modelIDFieldName', '_id');
      }
      /**
       *  Sets current model primary ID field name
       *  @return {notRecord}
       */


      setModelIDFieldName() {
        let val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '_id';
        return this.setWorking('modelIDFieldName', val);
      }
      /**
       *  Marks this controller as ready
       *  emits "ready"/"busy" events
       *  @param {Boolean}  val  true/false
       */


      setReady() {
        let val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        this.setWorking('ready', val);
        val ? this.emit('ready') : this.emit('busy');
      }
      /**
       *  Sets module URL prefix
       *  @param {sting} val URL prefix
       *  @return {notController} this
       */


      setURLPrefix(val) {
        this.setOptions('urlPrefix', val);
        this.updateAutoName();
        return this;
      }
      /**
       *  Returns module url prefix
       *  @return  {string} prefix
       */


      getURLPrefix() {
        return this.getOptions('urlPrefix');
      }
      /**
       *  Sets module name
       *  @param {sting} val name of the module
       *  @return {notController} this
       */


      setModuleName(val) {
        this.setOptions('moduleName', notCommon$2.lowerFirstLetter(val));
        this.updateAutoName();
        return this;
      }
      /**
       *  Returns module name
       *  @return  {string} module name
       */


      getModuleName() {
        return this.getOptions('moduleName');
      }
      /**
       *  Returns this module path prefix
       *  @return {string}  path to module dir
       */


      getModulePrefix() {
        return [notCommon$2.getApp().getOptions('paths.modules'), this.getModuleName()].join('/');
      }
      /**
       *  Returns this model URL with URL prefix
       *  @return {string}  url path
       */


      getModelURL() {
        return notCommon$2.buildURL({
          prefix: this.getURLPrefix(),
          module: this.getModuleName(),
          model: this.getModelName()
        });
      }
      /**
       *  Returns this model action URL with URL prefix
       * @param  {string}   id       some identificator of model
       * @param  {string}   action   action name
       *  @return {string}  url path
       */


      getModelActionURL(id) {
        let action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        return notCommon$2.buildURL({
          prefix: this.getURLPrefix(),
          module: this.getModuleName(),
          model: this.getModelName(),
          id,
          action
        });
      }

      buildURL(val) {
        return notCommon$2.buildURL(val);
      }
      /**
       *  Updates working name
       *  @param {sting} val name of the module
       *  @return {notController} this
       */


      updateAutoName() {
        if (this.getOptions('autoName', OPT_DEFAULT_AUTO_NAME)) ;
      }
      /**
       *  Sets object name
       *  @param {sting} val name of the object
       *  @return {notController} this
       */


      setName(val) {
        this.setWorking('name', val);
        this.setOptions('autoName', false);
        return this;
      }
      /**
       *  Preload records from server, using listAll method,
       *  returns Promise
       *  @param {object}  list  map of preloaded records
       *  @return {Promise}
       */


      preloadLib() {
        var _this2 = this;

        let list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return new Promise(function (resolve, reject) {
          if (typeof list !== 'object') {
            resolve();
          } else {
            _this2.setWorking('loading', []);

            for (let t in list) {
              _this2.getWorking('loading').push(list[t]);

              _this2.make[list[t]]({}).$listAll().then(function (data) {
                if (!_this2.getOptions('libs')) {
                  _this2.setOptions('libs', {});
                }

                _this2.getOptions('libs')[t] = data;

                if (_this2.getWorking('loading').indexOf(list[t]) > -1) {
                  _this2.getWorking('loading').splice(_this2.getWorking('loading').indexOf(list[t]), 1);
                }

                if (_this2.getWorking('loading').length === 0) {
                  resolve();
                }
              }).catch(function (err) {
                _this2.report(err);

                reject();
              });
            }

            if (_this2.getWorking('loading').length === 0) {
              resolve();
            }
          }
        });
      }
      /**
       * emits afterRender event
       */


      onAfterRender() {
        this.emit('afterRender');
      }
      /**
       *  Transform route name in action name
       *  @param {String}   name tranform action name
       *  @return {String}
       */


      getActionName() {
        let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : OPT_DEFAULT_ACTION_NAME;
        return 'run' + notCommon$2.capitalizeFirstLetter(name);
      }
      /**
       *  Get default controller action name
       *  @return {String} default action from options
       */


      getDefaultActionName() {
        return this.getActionName(this.getOptions('defaultAction', OPT_DEFAULT_ACTION_NAME));
      }
      /**
       *  Route params into specific run[Route_name] function
       *  @param {array}   params   controller input params
       *  @return {undefined}
       */


      route(params) {
        let [routerName, ...subParams] = params,
            actionName = this.getActionName(routerName ? routerName : OPT_DEFAULT_ACTION_NAME);

        if (typeof this[actionName] === 'function') {
          this.setCurrentAction(actionName);
          this[actionName](subParams);
        } else if (this[this.getDefaultActionName()]) {
          this.setCurrentAction(this.getDefaultActionName());
          this[this.getDefaultActionName()](subParams);
        } else {
          this.setCurrentAction(undefined);
          this.error('No action in router', params);
        }
      }

      setCurrentAction(actionName) {
        this.setWorking('action', actionName);
      }

      getCurrentAction() {
        return this.getWorking('action');
      }
      /**
       *  Return application options
       *  @return {object}
       */


      getAppOptions() {
        try {
          return this.getApp().getOptions();
        } catch (e) {
          this.error(e);
        }
      }
      /**
       *  Returns module options
       *  @param  {string}   moduleName    name of the module which options requested
       *  @return {object}
       */


      getModuleOptions(moduleName) {
        try {
          return this.getApp().getOptions(['modules', moduleName || this.getModuleName()].join('.'));
        } catch (e) {
          this.error(e);
        }
      }
      /**
       *  Returns module services
       *  @param  {string}   moduleName    name of the module which services requested
       *  @return {object}
       */


      getServices(moduleName) {
        try {
          return this.getApp().getOptions(['services', moduleName || this.getModuleName()].join('.'));
        } catch (e) {
          this.error(e);
        }
      }
      /**
       *  Returns module components
       *  @param  {string}   moduleName    name of the module which components requested
       *  @return {object}
       */


      getComponents(moduleName) {
        try {
          return this.getApp().getOptions(['components', moduleName || this.getModuleName()].join('.'));
        } catch (e) {
          this.error(e);
        }
      }
      /**
       *  Refreshes current URL, re-run all action
       *  @param {integer} timeout time to wait in ms
       */


      refresh() {
        let timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        this.app.getWorking('router').refresh(timeout);
      }
      /**
      * Returns path pattern for router
      * @params {number} [0] paramsCount   number of params
      * @return {string}  pattern for controller supported url
      */


      static getControllerRoute() {
        let paramsCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        let path = [];

        if (this.MODULE_NAME && this.MODULE_NAME.length > 0) {
          path.push(notCommon$2.lowerFirstLetter(this.MODULE_NAME));
        }

        if (this.MODEL_NAME && this.MODEL_NAME.length > 0) {
          path.push(notCommon$2.lowerFirstLetter(this.MODEL_NAME));
        }

        path = [path.join('/')];

        for (let i = 0; i < paramsCount; i++) {
          path.push('\/([^\/]+)');
        }

        return path.join('');
      }
      /**
      * Returns path patterns for router
      * @params {number} [0] paramsDeep   how many paths with params in the end
      * @return {string[]}  patterns for controller supported url in order of simplification
      */


      static getControllerRoutes() {
        let paramsDeep = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        let routes = [this.getControllerRoute(0)];

        for (let i = 0; i < paramsDeep; i++) {
          routes.unshift(this.getControllerRoute(i + 1));
        }

        return routes;
      }
      /**
      * Returns router rule.
      * @returns {Object} router rule {paths:String[], controller:notController}
      */


      static getRoutes() {
        return {
          paths: this.getControllerRoutes(this.PARAMS_LENGTH),
          controller: this
        };
      }

    }

    _defineProperty(notController, "PARAMS_LENGTH", 2);

    _defineProperty(notController, "MODULE_NAME", 'MODULE_NAME');

    _defineProperty(notController, "MODEL_NAME", 'MODEL_NAME');

    const ALL = {};

    function exist(key) {
      return Object.prototype.hasOwnProperty.call(ALL, key);
    }

    function get(key) {
      if (exist(key)) {
        return ALL[key];
      } else {
        return false;
      }
    }

    function create(key) {
      let props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        'raw': [],
        'filtered': [],
        'selected': {}
      };

      if (!exist(key)) {
        if (Object.keys(props).length > 0) {
          ALL[key] = {};
          Object.keys(props).forEach(function (name) {
            ALL[key][name] = writable(props[name]);
          });
        } else {
          throw new Error('store\'s props wasn\'t specified');
        }
      }

      return ALL[key];
    }

    /* src/frame/components/table/controls/ui.switch.svelte generated by Svelte v3.46.6 */

    function create_fragment$k(ctx) {
    	let input;
    	let input_class_value;
    	let input_id_value;
    	let t;
    	let label;
    	let label_for_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			input = element("input");
    			t = space();
    			label = element("label");
    			attr(input, "type", "checkbox");
    			attr(input, "class", input_class_value = "switch " + /*styling*/ ctx[5]);
    			attr(input, "id", input_id_value = "edit-table-row-cell-inline-switch-" + /*fieldname*/ ctx[2] + "-" + /*id*/ ctx[1]);
    			attr(input, "name", /*fieldname*/ ctx[2]);
    			input.readOnly = /*readonly*/ ctx[4];
    			input.disabled = /*disabled*/ ctx[3];
    			attr(label, "class", "label");
    			attr(label, "for", label_for_value = "edit-table-row-cell-inline-switch-" + /*fieldname*/ ctx[2] + "-" + /*id*/ ctx[1]);
    		},
    		m(target, anchor) {
    			insert(target, input, anchor);
    			input.checked = /*value*/ ctx[0];
    			insert(target, t, anchor);
    			insert(target, label, anchor);

    			if (!mounted) {
    				dispose = [
    					listen(input, "change", /*input_change_handler*/ ctx[7]),
    					listen(input, "input", /*onInput*/ ctx[6])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*styling*/ 32 && input_class_value !== (input_class_value = "switch " + /*styling*/ ctx[5])) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*fieldname, id*/ 6 && input_id_value !== (input_id_value = "edit-table-row-cell-inline-switch-" + /*fieldname*/ ctx[2] + "-" + /*id*/ ctx[1])) {
    				attr(input, "id", input_id_value);
    			}

    			if (dirty & /*fieldname*/ 4) {
    				attr(input, "name", /*fieldname*/ ctx[2]);
    			}

    			if (dirty & /*readonly*/ 16) {
    				input.readOnly = /*readonly*/ ctx[4];
    			}

    			if (dirty & /*disabled*/ 8) {
    				input.disabled = /*disabled*/ ctx[3];
    			}

    			if (dirty & /*value*/ 1) {
    				input.checked = /*value*/ ctx[0];
    			}

    			if (dirty & /*fieldname, id*/ 6 && label_for_value !== (label_for_value = "edit-table-row-cell-inline-switch-" + /*fieldname*/ ctx[2] + "-" + /*id*/ ctx[1])) {
    				attr(label, "for", label_for_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(input);
    			if (detaching) detach(t);
    			if (detaching) detach(label);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let { id = '' } = $$props;
    	let { value = false } = $$props;
    	let { fieldname = 'switch' } = $$props;
    	let { disabled = false } = $$props;
    	let { readonly = false } = $$props;
    	let { styling = " is-rounded is-success " } = $$props;

    	function onInput(ev) {
    		let data = {
    			id,
    			field: fieldname,
    			value: ev.target.type === 'checkbox'
    			? ev.target.checked
    			: ev.target.value
    		};

    		dispatch('change', data);
    		return true;
    	}

    	function input_change_handler() {
    		value = this.checked;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('fieldname' in $$props) $$invalidate(2, fieldname = $$props.fieldname);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$props.disabled);
    		if ('readonly' in $$props) $$invalidate(4, readonly = $$props.readonly);
    		if ('styling' in $$props) $$invalidate(5, styling = $$props.styling);
    	};

    	return [
    		value,
    		id,
    		fieldname,
    		disabled,
    		readonly,
    		styling,
    		onInput,
    		input_change_handler
    	];
    }

    class Ui_switch extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
    			id: 1,
    			value: 0,
    			fieldname: 2,
    			disabled: 3,
    			readonly: 4,
    			styling: 5
    		});
    	}
    }

    /* src/frame/components/table/controls/ui.tags.svelte generated by Svelte v3.46.6 */

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (31:0) {:else}
    function create_else_block_1$2(ctx) {
    	let span;
    	let t;
    	let span_class_value;

    	function select_block_type_2(ctx, dirty) {
    		if (/*item*/ ctx[1].url) return create_if_block_2$8;
    		return create_else_block_2$1;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if_block.c();
    			t = space();
    			attr(span, "class", span_class_value = "mx-1 tag is-" + /*item*/ ctx[1].color + " " + /*item*/ ctx[1].customClasses + " svelte-9c4k6c");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if_block.m(span, null);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, t);
    				}
    			}

    			if (dirty & /*values*/ 1 && span_class_value !== (span_class_value = "mx-1 tag is-" + /*item*/ ctx[1].color + " " + /*item*/ ctx[1].customClasses + " svelte-9c4k6c")) {
    				attr(span, "class", span_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    			if_block.d();
    		}
    	};
    }

    // (20:0) {#if Object.prototype.hasOwnProperty.call(item, 'value') }
    function create_if_block$f(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*item*/ ctx[1].title + "";
    	let t0;
    	let t1;
    	let span1;
    	let span1_class_value;
    	let t2;

    	function select_block_type_1(ctx, dirty) {
    		if (/*item*/ ctx[1].url) return create_if_block_1$d;
    		return create_else_block$c;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			if_block.c();
    			t2 = space();
    			attr(span0, "class", "tag");
    			attr(span1, "class", span1_class_value = "tag is-" + /*item*/ ctx[1].color + " " + /*item*/ ctx[1].customClasses + " svelte-9c4k6c");
    			attr(div, "class", "mx-1 tags has-addons svelte-9c4k6c");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, span0);
    			append(span0, t0);
    			append(div, t1);
    			append(div, span1);
    			if_block.m(span1, null);
    			append(div, t2);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*values*/ 1 && t0_value !== (t0_value = /*item*/ ctx[1].title + "")) set_data(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span1, null);
    				}
    			}

    			if (dirty & /*values*/ 1 && span1_class_value !== (span1_class_value = "tag is-" + /*item*/ ctx[1].color + " " + /*item*/ ctx[1].customClasses + " svelte-9c4k6c")) {
    				attr(span1, "class", span1_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if_block.d();
    		}
    	};
    }

    // (35:4) {:else}
    function create_else_block_2$1(ctx) {
    	let t_value = /*item*/ ctx[1].title + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*values*/ 1 && t_value !== (t_value = /*item*/ ctx[1].title + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (33:4) {#if item.url }
    function create_if_block_2$8(ctx) {
    	let a;
    	let t_value = /*item*/ ctx[1].title + "";
    	let t;
    	let a_href_value;
    	let a_class_value;

    	return {
    		c() {
    			a = element("a");
    			t = text(t_value);
    			attr(a, "href", a_href_value = /*item*/ ctx[1].url);
    			attr(a, "class", a_class_value = "" + (null_to_empty(/*item*/ ctx[1].urlCustomClasses) + " svelte-9c4k6c"));
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*values*/ 1 && t_value !== (t_value = /*item*/ ctx[1].title + "")) set_data(t, t_value);

    			if (dirty & /*values*/ 1 && a_href_value !== (a_href_value = /*item*/ ctx[1].url)) {
    				attr(a, "href", a_href_value);
    			}

    			if (dirty & /*values*/ 1 && a_class_value !== (a_class_value = "" + (null_to_empty(/*item*/ ctx[1].urlCustomClasses) + " svelte-9c4k6c"))) {
    				attr(a, "class", a_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    		}
    	};
    }

    // (26:6) {:else}
    function create_else_block$c(ctx) {
    	let t_value = /*item*/ ctx[1].value + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*values*/ 1 && t_value !== (t_value = /*item*/ ctx[1].value + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (24:6) {#if item.url }
    function create_if_block_1$d(ctx) {
    	let a;
    	let t_value = /*item*/ ctx[1].value + "";
    	let t;
    	let a_href_value;
    	let a_class_value;

    	return {
    		c() {
    			a = element("a");
    			t = text(t_value);
    			attr(a, "href", a_href_value = /*item*/ ctx[1].url);
    			attr(a, "class", a_class_value = "" + (null_to_empty(/*item*/ ctx[1].urlCustomClasses) + " svelte-9c4k6c"));
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*values*/ 1 && t_value !== (t_value = /*item*/ ctx[1].value + "")) set_data(t, t_value);

    			if (dirty & /*values*/ 1 && a_href_value !== (a_href_value = /*item*/ ctx[1].url)) {
    				attr(a, "href", a_href_value);
    			}

    			if (dirty & /*values*/ 1 && a_class_value !== (a_class_value = "" + (null_to_empty(/*item*/ ctx[1].urlCustomClasses) + " svelte-9c4k6c"))) {
    				attr(a, "class", a_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    		}
    	};
    }

    // (19:0) {#each values as item (item.id)}
    function create_each_block$9(key_1, ctx) {
    	let first;
    	let show_if;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*values*/ 1) show_if = null;
    		if (show_if == null) show_if = !!Object.prototype.hasOwnProperty.call(/*item*/ ctx[1], 'value');
    		if (show_if) return create_if_block$f;
    		return create_else_block_1$2;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$j(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*values*/ ctx[0];
    	const get_key = ctx => /*item*/ ctx[1].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$9(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$9(key, child_ctx));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*values, Object*/ 1) {
    				each_value = /*values*/ ctx[0];
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$9, each_1_anchor, get_each_context$9);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { values = [] } = $$props;

    	$$self.$$set = $$props => {
    		if ('values' in $$props) $$invalidate(0, values = $$props.values);
    	};

    	return [values];
    }

    class Ui_tags extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { values: 0 });
    	}
    }

    /* src/frame/components/table/notTableCell.svelte generated by Svelte v3.46.6 */

    function create_else_block$b(ctx) {
    	let t_value = /*$LOCALE*/ ctx[5][notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3])] + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, field, item, helpers*/ 46 && t_value !== (t_value = /*$LOCALE*/ ctx[5][notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3])] + "")) set_data(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (51:2) {#if !isNaN(field.maxLength) && field.maxLength }
    function create_if_block_7$1(ctx) {
    	let t_value = notCommon$2.strLengthCap(notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3]), /*field*/ ctx[1].maxLength) + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*field, item, helpers*/ 14 && t_value !== (t_value = notCommon$2.strLengthCap(notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3]), /*field*/ ctx[1].maxLength) + "")) set_data(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (48:40) 
    function create_if_block_6$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			id: /*getItemId*/ ctx[0](/*item*/ ctx[2])
    		},
    		{ fieldname: /*field*/ ctx[1].path },
    		{ disabled: /*field*/ ctx[1].disabled },
    		{ readonly: /*field*/ ctx[1].readonly },
    		{
    			value: notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3])
    		},
    		/*field*/ ctx[1].options
    	];

    	var switch_value = /*field*/ ctx[1].component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());

    		switch_instance.$on("change", function () {
    			if (is_function(/*field*/ ctx[1].onChange)) /*field*/ ctx[1].onChange.apply(this, arguments);
    		});
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			const switch_instance_changes = (dirty & /*getItemId, item, field, notPath, helpers*/ 15)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*getItemId, item*/ 5 && {
    						id: /*getItemId*/ ctx[0](/*item*/ ctx[2])
    					},
    					dirty & /*field*/ 2 && { fieldname: /*field*/ ctx[1].path },
    					dirty & /*field*/ 2 && { disabled: /*field*/ ctx[1].disabled },
    					dirty & /*field*/ 2 && { readonly: /*field*/ ctx[1].readonly },
    					dirty & /*notPath, field, item, helpers*/ 14 && {
    						value: notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3])
    					},
    					dirty & /*field*/ 2 && get_spread_object(/*field*/ ctx[1].options)
    				])
    			: {};

    			if (switch_value !== (switch_value = /*field*/ ctx[1].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$on("change", function () {
    						if (is_function(/*field*/ ctx[1].onChange)) /*field*/ ctx[1].onChange.apply(this, arguments);
    					});

    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    // (46:37) 
    function create_if_block_5$4(ctx) {
    	let tableswitch;
    	let current;

    	tableswitch = new Ui_switch({
    			props: {
    				id: /*getItemId*/ ctx[0](/*item*/ ctx[2]),
    				fieldname: /*field*/ ctx[1].path,
    				value: notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3]),
    				disabled: /*field*/ ctx[1].disabled,
    				readonly: /*field*/ ctx[1].readonly
    			}
    		});

    	tableswitch.$on("change", function () {
    		if (is_function(/*field*/ ctx[1].onChange)) /*field*/ ctx[1].onChange.apply(this, arguments);
    	});

    	return {
    		c() {
    			create_component(tableswitch.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(tableswitch, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tableswitch_changes = {};
    			if (dirty & /*getItemId, item*/ 5) tableswitch_changes.id = /*getItemId*/ ctx[0](/*item*/ ctx[2]);
    			if (dirty & /*field*/ 2) tableswitch_changes.fieldname = /*field*/ ctx[1].path;
    			if (dirty & /*field, item, helpers*/ 14) tableswitch_changes.value = notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3]);
    			if (dirty & /*field*/ 2) tableswitch_changes.disabled = /*field*/ ctx[1].disabled;
    			if (dirty & /*field*/ 2) tableswitch_changes.readonly = /*field*/ ctx[1].readonly;
    			tableswitch.$set(tableswitch_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(tableswitch.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(tableswitch.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(tableswitch, detaching);
    		}
    	};
    }

    // (44:34) 
    function create_if_block_4$5(ctx) {
    	let tabletags;
    	let current;

    	tabletags = new Ui_tags({
    			props: {
    				values: notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3])
    			}
    		});

    	return {
    		c() {
    			create_component(tabletags.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(tabletags, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const tabletags_changes = {};
    			if (dirty & /*field, item, helpers*/ 14) tabletags_changes.values = notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3]);
    			tabletags.$set(tabletags_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(tabletags.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(tabletags.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(tabletags, detaching);
    		}
    	};
    }

    // (42:38) 
    function create_if_block_3$7(ctx) {
    	let uibooleans;
    	let current;

    	uibooleans = new Ui_booleans({
    			props: {
    				values: notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3])
    			}
    		});

    	return {
    		c() {
    			create_component(uibooleans.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uibooleans, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uibooleans_changes = {};
    			if (dirty & /*field, item, helpers*/ 14) uibooleans_changes.values = notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3]);
    			uibooleans.$set(uibooleans_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uibooleans.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uibooleans.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uibooleans, detaching);
    		}
    	};
    }

    // (40:36) 
    function create_if_block_2$7(ctx) {
    	let uiimages;
    	let current;

    	uiimages = new Ui_images({
    			props: {
    				values: notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3])
    			}
    		});

    	return {
    		c() {
    			create_component(uiimages.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uiimages, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uiimages_changes = {};
    			if (dirty & /*field, item, helpers*/ 14) uiimages_changes.values = notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3]);
    			uiimages.$set(uiimages_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiimages.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiimages.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uiimages, detaching);
    		}
    	};
    }

    // (38:37) 
    function create_if_block_1$c(ctx) {
    	let uibuttons;
    	let current;

    	uibuttons = new Ui_buttons({
    			props: {
    				values: notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3])
    			}
    		});

    	return {
    		c() {
    			create_component(uibuttons.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uibuttons, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uibuttons_changes = {};
    			if (dirty & /*field, item, helpers*/ 14) uibuttons_changes.values = notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3]);
    			uibuttons.$set(uibuttons_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uibuttons.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uibuttons.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uibuttons, detaching);
    		}
    	};
    }

    // (36:2) {#if field.type === 'link' }
    function create_if_block$e(ctx) {
    	let uilinks;
    	let current;

    	uilinks = new Ui_links({
    			props: {
    				values: notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3])
    			}
    		});

    	return {
    		c() {
    			create_component(uilinks.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uilinks, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uilinks_changes = {};
    			if (dirty & /*field, item, helpers*/ 14) uilinks_changes.values = notPath.get(/*field*/ ctx[1].path, /*item*/ ctx[2], /*helpers*/ ctx[3]);
    			uilinks.$set(uilinks_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uilinks.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uilinks.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uilinks, detaching);
    		}
    	};
    }

    function create_fragment$i(ctx) {
    	let td;
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let td_class_value;
    	let current;

    	const if_block_creators = [
    		create_if_block$e,
    		create_if_block_1$c,
    		create_if_block_2$7,
    		create_if_block_3$7,
    		create_if_block_4$5,
    		create_if_block_5$4,
    		create_if_block_6$1,
    		create_if_block_7$1,
    		create_else_block$b
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*field*/ 2) show_if = null;
    		if (/*field*/ ctx[1].type === 'link') return 0;
    		if (/*field*/ ctx[1].type === 'button') return 1;
    		if (/*field*/ ctx[1].type === 'image') return 2;
    		if (/*field*/ ctx[1].type === 'boolean') return 3;
    		if (/*field*/ ctx[1].type === 'tag') return 4;
    		if (/*field*/ ctx[1].type === 'switch') return 5;
    		if (/*field*/ ctx[1].type === 'component') return 6;
    		if (show_if == null) show_if = !!(!isNaN(/*field*/ ctx[1].maxLength) && /*field*/ ctx[1].maxLength);
    		if (show_if) return 7;
    		return 8;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			td = element("td");
    			if_block.c();
    			attr(td, "class", td_class_value = /*field*/ ctx[1].hideOnMobile ? 'is-hidden-touch' : '');
    			attr(td, "title", /*title*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, td, anchor);
    			if_blocks[current_block_type_index].m(td, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(td, null);
    			}

    			if (!current || dirty & /*field*/ 2 && td_class_value !== (td_class_value = /*field*/ ctx[1].hideOnMobile ? 'is-hidden-touch' : '')) {
    				attr(td, "class", td_class_value);
    			}

    			if (!current || dirty & /*title*/ 16) {
    				attr(td, "title", /*title*/ ctx[4]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(td);
    			if_blocks[current_block_type_index].d();
    		}
    	};
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(5, $LOCALE = $$value));
    	let title = '';

    	onMount(() => {
    		if (typeof field.type === 'undefined') {
    			$$invalidate(4, title = notPath.get(field.path, item, helpers));
    		}
    	});

    	let { getItemId = item => item._id } = $$props;
    	let { field = {} } = $$props;
    	let { item = {} } = $$props;
    	let { helpers = {} } = $$props;

    	$$self.$$set = $$props => {
    		if ('getItemId' in $$props) $$invalidate(0, getItemId = $$props.getItemId);
    		if ('field' in $$props) $$invalidate(1, field = $$props.field);
    		if ('item' in $$props) $$invalidate(2, item = $$props.item);
    		if ('helpers' in $$props) $$invalidate(3, helpers = $$props.helpers);
    	};

    	return [getItemId, field, item, helpers, title, $LOCALE];
    }

    class NotTableCell extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			getItemId: 0,
    			field: 1,
    			item: 2,
    			helpers: 3
    		});
    	}
    }

    /* src/frame/components/table/notTableRow.svelte generated by Svelte v3.46.6 */

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (36:2) {#if showSelect && $selectedList }
    function create_if_block$d(ctx) {
    	let td;
    	let input;
    	let input_id_value;
    	let input_data_id_value;
    	let input_name_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			td = element("td");
    			input = element("input");
    			attr(input, "id", input_id_value = "table-row-select-" + /*getItemId*/ ctx[4](/*item*/ ctx[0]));
    			attr(input, "type", "checkbox");
    			attr(input, "data-id", input_data_id_value = /*getItemId*/ ctx[4](/*item*/ ctx[0]));
    			attr(input, "placeholder", "");
    			attr(input, "name", input_name_value = "row_selected_" + /*getItemId*/ ctx[4](/*item*/ ctx[0]));
    		},
    		m(target, anchor) {
    			insert(target, td, anchor);
    			append(td, input);
    			input.checked = /*$selectedList*/ ctx[7][/*itemId*/ ctx[5]];

    			if (!mounted) {
    				dispose = [
    					listen(input, "change", /*input_change_handler*/ ctx[10]),
    					listen(input, "change", /*onRowSelect*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*getItemId, item*/ 17 && input_id_value !== (input_id_value = "table-row-select-" + /*getItemId*/ ctx[4](/*item*/ ctx[0]))) {
    				attr(input, "id", input_id_value);
    			}

    			if (dirty & /*getItemId, item*/ 17 && input_data_id_value !== (input_data_id_value = /*getItemId*/ ctx[4](/*item*/ ctx[0]))) {
    				attr(input, "data-id", input_data_id_value);
    			}

    			if (dirty & /*getItemId, item*/ 17 && input_name_value !== (input_name_value = "row_selected_" + /*getItemId*/ ctx[4](/*item*/ ctx[0]))) {
    				attr(input, "name", input_name_value);
    			}

    			if (dirty & /*$selectedList, itemId*/ 160) {
    				input.checked = /*$selectedList*/ ctx[7][/*itemId*/ ctx[5]];
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(td);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (41:2) {#each fields as field }
    function create_each_block$8(ctx) {
    	let uitablecell;
    	let current;

    	uitablecell = new NotTableCell({
    			props: {
    				field: /*field*/ ctx[12],
    				helpers: /*helpers*/ ctx[1],
    				item: /*item*/ ctx[0],
    				getItemId: /*getItemId*/ ctx[4]
    			}
    		});

    	return {
    		c() {
    			create_component(uitablecell.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uitablecell, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uitablecell_changes = {};
    			if (dirty & /*fields*/ 4) uitablecell_changes.field = /*field*/ ctx[12];
    			if (dirty & /*helpers*/ 2) uitablecell_changes.helpers = /*helpers*/ ctx[1];
    			if (dirty & /*item*/ 1) uitablecell_changes.item = /*item*/ ctx[0];
    			if (dirty & /*getItemId*/ 16) uitablecell_changes.getItemId = /*getItemId*/ ctx[4];
    			uitablecell.$set(uitablecell_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uitablecell.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uitablecell.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uitablecell, detaching);
    		}
    	};
    }

    function create_fragment$h(ctx) {
    	let tr;
    	let t;
    	let current;
    	let if_block = /*showSelect*/ ctx[3] && /*$selectedList*/ ctx[7] && create_if_block$d(ctx);
    	let each_value = /*fields*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			tr = element("tr");
    			if (if_block) if_block.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    		},
    		m(target, anchor) {
    			insert(target, tr, anchor);
    			if (if_block) if_block.m(tr, null);
    			append(tr, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*showSelect*/ ctx[3] && /*$selectedList*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$d(ctx);
    					if_block.c();
    					if_block.m(tr, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*fields, helpers, item, getItemId*/ 23) {
    				each_value = /*fields*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tr, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(tr);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $selectedList,
    		$$unsubscribe_selectedList = noop,
    		$$subscribe_selectedList = () => ($$unsubscribe_selectedList(), $$unsubscribe_selectedList = subscribe(selectedList, $$value => $$invalidate(7, $selectedList = $$value)), selectedList);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_selectedList());
    	let dispatch = createEventDispatcher();
    	let itemId, selectedList;

    	onMount(() => {
    		$$invalidate(5, itemId = getItemId(item));
    		$$subscribe_selectedList($$invalidate(6, selectedList = get(id).selected));
    	});

    	let { id } = $$props;
    	let { item = {} } = $$props;
    	let { helpers = {} } = $$props;
    	let { fields = [] } = $$props;
    	let { showSelect = false } = $$props;

    	let { getItemId = () => {
    		
    	} } = $$props;

    	function onRowSelect(e) {
    		e.preventDefault();

    		dispatch('rowSelectChange', {
    			id: itemId,
    			selected: $selectedList[itemId]
    		});

    		return false;
    	}

    	function input_change_handler() {
    		$selectedList[itemId] = this.checked;
    		selectedList.set($selectedList);
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(9, id = $$props.id);
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    		if ('helpers' in $$props) $$invalidate(1, helpers = $$props.helpers);
    		if ('fields' in $$props) $$invalidate(2, fields = $$props.fields);
    		if ('showSelect' in $$props) $$invalidate(3, showSelect = $$props.showSelect);
    		if ('getItemId' in $$props) $$invalidate(4, getItemId = $$props.getItemId);
    	};

    	return [
    		item,
    		helpers,
    		fields,
    		showSelect,
    		getItemId,
    		itemId,
    		selectedList,
    		$selectedList,
    		onRowSelect,
    		id,
    		input_change_handler
    	];
    }

    class NotTableRow extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			id: 9,
    			item: 0,
    			helpers: 1,
    			fields: 2,
    			showSelect: 3,
    			getItemId: 4
    		});
    	}
    }

    /* src/frame/components/table/notTable.svelte generated by Svelte v3.46.6 */

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	return child_ctx;
    }

    // (92:0) {#if links.length}
    function create_if_block_5$3(ctx) {
    	let div;
    	let uilinks;
    	let current;
    	uilinks = new Ui_links({ props: { values: /*links*/ ctx[8] } });

    	return {
    		c() {
    			div = element("div");
    			create_component(uilinks.$$.fragment);
    			attr(div, "class", "field is-grouped");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(uilinks, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uilinks_changes = {};
    			if (dirty[0] & /*links*/ 256) uilinks_changes.values = /*links*/ ctx[8];
    			uilinks.$set(uilinks_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uilinks.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uilinks.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(uilinks);
    		}
    	};
    }

    // (97:0) {#if actions.length}
    function create_if_block_4$4(ctx) {
    	let div;
    	let uibuttons;
    	let current;
    	uibuttons = new Ui_buttons({ props: { values: /*actions*/ ctx[7] } });

    	return {
    		c() {
    			div = element("div");
    			create_component(uibuttons.$$.fragment);
    			attr(div, "class", "field is-grouped");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(uibuttons, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uibuttons_changes = {};
    			if (dirty[0] & /*actions*/ 128) uibuttons_changes.values = /*actions*/ ctx[7];
    			uibuttons.$set(uibuttons_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uibuttons.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uibuttons.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(uibuttons);
    		}
    	};
    }

    // (102:0) {#if showSearch }
    function create_if_block_3$6(ctx) {
    	let div1;
    	let div0;
    	let input;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			input = element("input");
    			attr(input, "class", "input");
    			attr(input, "type", "text");
    			attr(input, "placeholder", "Поиск");
    			attr(div0, "class", "control");
    			attr(div1, "class", "field");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, input);
    			set_input_value(input, /*search*/ ctx[2]);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[19]),
    					listen(input, "input", /*onSearchInput*/ ctx[13])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*search*/ 4 && input.value !== /*search*/ ctx[2]) {
    				set_input_value(input, /*search*/ ctx[2]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (111:2) {#if showSelect }
    function create_if_block_2$6(ctx) {
    	let th;
    	let input;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			th = element("th");
    			input = element("input");
    			attr(input, "type", "checkbox");
    			attr(input, "id", "table-row-select-page");
    			attr(input, "placeholder", "");
    			attr(input, "name", "row_selected_all");
    		},
    		m(target, anchor) {
    			insert(target, th, anchor);
    			append(th, input);
    			input.checked = /*selectAll*/ ctx[3];

    			if (!mounted) {
    				dispose = [
    					listen(input, "change", /*input_change_handler*/ ctx[20]),
    					listen(input, "change", /*onSelectAll*/ ctx[17])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*selectAll*/ 8) {
    				input.checked = /*selectAll*/ ctx[3];
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(th);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (114:2) {#each fields as field}
    function create_each_block_2$2(ctx) {
    	let th;
    	let t_value = /*$LOCALE*/ ctx[12][/*field*/ ctx[29].title] + "";
    	let t;
    	let th_class_value;

    	return {
    		c() {
    			th = element("th");
    			t = text(t_value);
    			attr(th, "class", th_class_value = /*field*/ ctx[29].hideOnMobile ? 'is-hidden-touch' : '');
    		},
    		m(target, anchor) {
    			insert(target, th, anchor);
    			append(th, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*$LOCALE, fields*/ 4160 && t_value !== (t_value = /*$LOCALE*/ ctx[12][/*field*/ ctx[29].title] + "")) set_data(t, t_value);

    			if (dirty[0] & /*fields*/ 64 && th_class_value !== (th_class_value = /*field*/ ctx[29].hideOnMobile ? 'is-hidden-touch' : '')) {
    				attr(th, "class", th_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(th);
    		}
    	};
    }

    // (119:2) {#each items as item (item._id)}
    function create_each_block_1$3(key_1, ctx) {
    	let first;
    	let uitablerow;
    	let current;

    	uitablerow = new NotTableRow({
    			props: {
    				id: /*id*/ ctx[4],
    				item: /*item*/ ctx[26],
    				fields: /*fields*/ ctx[6],
    				helpers: /*helpers*/ ctx[5],
    				showSelect: /*showSelect*/ ctx[10],
    				getItemId: /*getItemId*/ ctx[11]
    			}
    		});

    	uitablerow.$on("rowSelectChange", /*rowSelectChange_handler*/ ctx[21]);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(uitablerow.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(uitablerow, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const uitablerow_changes = {};
    			if (dirty[0] & /*id*/ 16) uitablerow_changes.id = /*id*/ ctx[4];
    			if (dirty[0] & /*items*/ 2) uitablerow_changes.item = /*item*/ ctx[26];
    			if (dirty[0] & /*fields*/ 64) uitablerow_changes.fields = /*fields*/ ctx[6];
    			if (dirty[0] & /*helpers*/ 32) uitablerow_changes.helpers = /*helpers*/ ctx[5];
    			if (dirty[0] & /*showSelect*/ 1024) uitablerow_changes.showSelect = /*showSelect*/ ctx[10];
    			if (dirty[0] & /*getItemId*/ 2048) uitablerow_changes.getItemId = /*getItemId*/ ctx[11];
    			uitablerow.$set(uitablerow_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uitablerow.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uitablerow.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(uitablerow, detaching);
    		}
    	};
    }

    // (128:2) {#if state.pagination && state.pagination.pages && state.pagination.pages.list }
    function create_if_block$c(ctx) {
    	let each_1_anchor;
    	let each_value = /*state*/ ctx[0].pagination.pages.list;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*state, goTo*/ 65537) {
    				each_value = /*state*/ ctx[0].pagination.pages.list;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (133:3) {:else}
    function create_else_block$a(ctx) {
    	let a;
    	let t_value = /*page*/ ctx[23].index + 1 + "";
    	let t;
    	let a_aria_label_value;
    	let a_data_page_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			a = element("a");
    			t = text(t_value);
    			attr(a, "href", "");
    			attr(a, "class", "pagination-link");
    			attr(a, "aria-label", a_aria_label_value = "Страница " + /*page*/ ctx[23].index);
    			attr(a, "data-page", a_data_page_value = /*page*/ ctx[23].index);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, t);

    			if (!mounted) {
    				dispose = listen(a, "click", /*goTo*/ ctx[16]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*state*/ 1 && t_value !== (t_value = /*page*/ ctx[23].index + 1 + "")) set_data(t, t_value);

    			if (dirty[0] & /*state*/ 1 && a_aria_label_value !== (a_aria_label_value = "Страница " + /*page*/ ctx[23].index)) {
    				attr(a, "aria-label", a_aria_label_value);
    			}

    			if (dirty[0] & /*state*/ 1 && a_data_page_value !== (a_data_page_value = /*page*/ ctx[23].index)) {
    				attr(a, "data-page", a_data_page_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (131:3) {#if page.active}
    function create_if_block_1$b(ctx) {
    	let a;
    	let t_value = /*page*/ ctx[23].index + 1 + "";
    	let t;
    	let a_aria_label_value;

    	return {
    		c() {
    			a = element("a");
    			t = text(t_value);
    			attr(a, "href", "");
    			attr(a, "class", "pagination-link is-current");
    			attr(a, "aria-label", a_aria_label_value = "Страница " + /*page*/ ctx[23].index);
    			attr(a, "aria-current", "page");
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*state*/ 1 && t_value !== (t_value = /*page*/ ctx[23].index + 1 + "")) set_data(t, t_value);

    			if (dirty[0] & /*state*/ 1 && a_aria_label_value !== (a_aria_label_value = "Страница " + /*page*/ ctx[23].index)) {
    				attr(a, "aria-label", a_aria_label_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    		}
    	};
    }

    // (129:2) {#each state.pagination.pages.list as page}
    function create_each_block$7(ctx) {
    	let li;
    	let t;

    	function select_block_type(ctx, dirty) {
    		if (/*page*/ ctx[23].active) return create_if_block_1$b;
    		return create_else_block$a;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			li = element("li");
    			if_block.c();
    			t = space();
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			if_block.m(li, null);
    			append(li, t);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(li, t);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			if_block.d();
    		}
    	};
    }

    function create_fragment$g(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let table;
    	let thead;
    	let t3;
    	let t4;
    	let tbody;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let t5;
    	let nav;
    	let a0;
    	let t7;
    	let a1;
    	let t9;
    	let ul;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*links*/ ctx[8].length && create_if_block_5$3(ctx);
    	let if_block1 = /*actions*/ ctx[7].length && create_if_block_4$4(ctx);
    	let if_block2 = /*showSearch*/ ctx[9] && create_if_block_3$6(ctx);
    	let if_block3 = /*showSelect*/ ctx[10] && create_if_block_2$6(ctx);
    	let each_value_2 = /*fields*/ ctx[6];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*items*/ ctx[1];
    	const get_key = ctx => /*item*/ ctx[26]._id;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$3(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block_1$3(key, child_ctx));
    	}

    	let if_block4 = /*state*/ ctx[0].pagination && /*state*/ ctx[0].pagination.pages && /*state*/ ctx[0].pagination.pages.list && create_if_block$c(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			table = element("table");
    			thead = element("thead");
    			if (if_block3) if_block3.c();
    			t3 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "Назад";
    			t7 = space();
    			a1 = element("a");
    			a1.textContent = "Вперед";
    			t9 = space();
    			ul = element("ul");
    			if (if_block4) if_block4.c();
    			attr(table, "class", "table");
    			attr(a0, "href", "");
    			attr(a0, "class", "pagination-previous");
    			attr(a1, "href", "");
    			attr(a1, "class", "pagination-next");
    			attr(ul, "class", "pagination-list");
    			attr(nav, "class", "pagination is-centered");
    			attr(nav, "aria-label", "pagination");
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, t2, anchor);
    			insert(target, table, anchor);
    			append(table, thead);
    			if (if_block3) if_block3.m(thead, null);
    			append(thead, t3);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(thead, null);
    			}

    			append(table, t4);
    			append(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			insert(target, t5, anchor);
    			insert(target, nav, anchor);
    			append(nav, a0);
    			append(nav, t7);
    			append(nav, a1);
    			append(nav, t9);
    			append(nav, ul);
    			if (if_block4) if_block4.m(ul, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(a0, "click", /*goPrev*/ ctx[14]),
    					listen(a1, "click", /*goNext*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (/*links*/ ctx[8].length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*links*/ 256) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_5$3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*actions*/ ctx[7].length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*actions*/ 128) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*showSearch*/ ctx[9]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_3$6(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*showSelect*/ ctx[10]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_2$6(ctx);
    					if_block3.c();
    					if_block3.m(thead, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty[0] & /*fields, $LOCALE*/ 4160) {
    				each_value_2 = /*fields*/ ctx[6];
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2$2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(thead, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty[0] & /*id, items, fields, helpers, showSelect, getItemId*/ 3186) {
    				each_value_1 = /*items*/ ctx[1];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each1_lookup, tbody, outro_and_destroy_block, create_each_block_1$3, null, get_each_context_1$3);
    				check_outros();
    			}

    			if (/*state*/ ctx[0].pagination && /*state*/ ctx[0].pagination.pages && /*state*/ ctx[0].pagination.pages.list) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block$c(ctx);
    					if_block4.c();
    					if_block4.m(ul, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach(t2);
    			if (detaching) detach(table);
    			if (if_block3) if_block3.d();
    			destroy_each(each_blocks_1, detaching);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach(t5);
    			if (detaching) detach(nav);
    			if (if_block4) if_block4.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(12, $LOCALE = $$value));
    	let dispatch = createEventDispatcher();
    	let { id } = $$props;
    	let { helpers = {} } = $$props;
    	let { state = {} } = $$props;
    	let { fields = [] } = $$props;
    	let { selected = {} } = $$props;
    	let { items = [] } = $$props;
    	let { actions = [] } = $$props;
    	let { links = [] } = $$props;
    	let { search = '' } = $$props;
    	let { showSearch = true } = $$props;
    	let { showSelect = true } = $$props;
    	let { selectAll = false } = $$props;
    	let { getItemId = item => item._id } = $$props;

    	onMount(() => {
    		if (showSelect) {
    			get(id).selected.subscribe(value => {
    				$$invalidate(18, selected = value);
    			});
    		}

    		get(id).refined.subscribe(value => {
    			$$invalidate(1, items = value);

    			if (showSelect) {
    				for (let itemId in selected) {
    					if (!items.some(item => getItemId(item) === itemId)) {
    						delete selected[itemId];
    					} else {
    						if (!Object.prototype.hasOwnProperty.call(selected, itemId)) {
    							$$invalidate(18, selected[itemId] = false, selected);
    						}
    					}
    				}

    				$$invalidate(18, selected);
    			}
    		});

    		get(id).state.subscribe(value => {
    			$$invalidate(0, state = value);
    		});
    	});

    	function onSearchInput(ev) {
    		try {
    			let data = ev.currentTarget.value.trim();
    			dispatch('searchChange', data);
    		} catch(e) {
    			return;
    		}
    	}

    	function goPrev() {
    		dispatch('goToPrevPage');
    	}

    	function goNext() {
    		dispatch('goToNextPage');
    	}

    	function goTo(e) {
    		e.preventDefault();
    		let el = e.target;
    		dispatch('goToPage', parseInt(el.dataset.page));
    		return false;
    	}

    	function onSelectAll() {
    		get(id).selected.update(value => {
    			items.forEach(item => {
    				value[getItemId(item)] = selectAll;
    			});

    			return value;
    		});
    	}

    	function input_input_handler() {
    		search = this.value;
    		$$invalidate(2, search);
    	}

    	function input_change_handler() {
    		selectAll = this.checked;
    		$$invalidate(3, selectAll);
    	}

    	function rowSelectChange_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(4, id = $$props.id);
    		if ('helpers' in $$props) $$invalidate(5, helpers = $$props.helpers);
    		if ('state' in $$props) $$invalidate(0, state = $$props.state);
    		if ('fields' in $$props) $$invalidate(6, fields = $$props.fields);
    		if ('selected' in $$props) $$invalidate(18, selected = $$props.selected);
    		if ('items' in $$props) $$invalidate(1, items = $$props.items);
    		if ('actions' in $$props) $$invalidate(7, actions = $$props.actions);
    		if ('links' in $$props) $$invalidate(8, links = $$props.links);
    		if ('search' in $$props) $$invalidate(2, search = $$props.search);
    		if ('showSearch' in $$props) $$invalidate(9, showSearch = $$props.showSearch);
    		if ('showSelect' in $$props) $$invalidate(10, showSelect = $$props.showSelect);
    		if ('selectAll' in $$props) $$invalidate(3, selectAll = $$props.selectAll);
    		if ('getItemId' in $$props) $$invalidate(11, getItemId = $$props.getItemId);
    	};

    	return [
    		state,
    		items,
    		search,
    		selectAll,
    		id,
    		helpers,
    		fields,
    		actions,
    		links,
    		showSearch,
    		showSelect,
    		getItemId,
    		$LOCALE,
    		onSearchInput,
    		goPrev,
    		goNext,
    		goTo,
    		onSelectAll,
    		selected,
    		input_input_handler,
    		input_change_handler,
    		rowSelectChange_handler
    	];
    }

    class NotTable extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$g,
    			create_fragment$g,
    			safe_not_equal,
    			{
    				id: 4,
    				helpers: 5,
    				state: 0,
    				fields: 6,
    				selected: 18,
    				items: 1,
    				actions: 7,
    				links: 8,
    				search: 2,
    				showSearch: 9,
    				showSelect: 10,
    				selectAll: 3,
    				getItemId: 11
    			},
    			null,
    			[-1, -1]
    		);
    	}
    }

    const CONST_ID_DUBLICATE_POSTFIX = '__dublicate__';
    const OPT_DEFAULT_PAGE_SIZE = 20,
          OPT_DEFAULT_PAGE_NUMBER = 0,
          OPT_DEFAULT_PAGE_RANGE = 6,
          OPT_DEFAULT_SORT_DIRECTION = 1,
          OPT_DEFAULT_SEARCH = '',
          OPT_DEFAULT_RETURN = {},
          OPT_DEFAULT_COMBINED = false,
          OPT_DEFAULT_COMBINED_ACTION = 'listAndCount',
          OPT_DEFAULT_COUNT_ACTION = 'count',
          OPT_DEFAULT_LIST_ACTION = 'list',
          OPT_DEFAULT_SORT_FIELD = '_id',
          OPT_FIELD_NAME_PRE_PROC = 'preprocessor';
    const DEFAULT_OPTIONS = {
      links: [],
      actions: [],
      endless: false,
      idField: '_id',
      getItemId: function (item) {
        return item._id;
      }
    };

    class notTable extends EventEmitter {
      constructor() {
        let input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        super();
        this.id = 'table-' + Math.random();
        this.options = Object.assign(DEFAULT_OPTIONS, input.options ? input.options : {});
        this.ui = {};
        this.data = {
          raw: [],
          filtered: [],
          refined: [],
          selected: {}
        };
        this.state = {
          pagination: {
            items: {
              count: 0,
              from: 0,
              to: 0
            },
            pages: {
              count: 0,
              from: 0,
              to: 0,
              current: 0,
              list: []
            }
          }
        };
        this.working = {};
        this.stores = create(this.id, {
          'raw': [],
          'filtered': [],
          'refined': [],
          'selected': {},
          'state': this.state,
          'working': this.working
        });
        this.stores.working.subscribe(this.onWorkingUpdate.bind(this)); //полученные из сети

        this.stores.raw.subscribe(this.onRawUpdate.bind(this)); //применены фильтры, сортировки и т.д.

        this.stores.filtered.subscribe(this.onFilteredUpdate.bind(this)); //урезаны до минимального набора, точно соотвествующего табличному формату

        this.stores.refined.subscribe(this.onRefinedUpdate.bind(this)); //словарь с идентификаторами выбранных строк

        this.stores.selected.subscribe(this.onSelectedUpdate.bind(this)); //pagination, items information

        this.stores.state.subscribe(this.onStateUpdate.bind(this));

        if (Object.prototype.hasOwnProperty.call(input, 'data') && Array.isArray(input.data)) {
          this.stores.raw.update(function (val) {
            val = input.data;
            return val;
          });
        }

        if (Object.prototype.hasOwnProperty.call(this.options, 'filter')) {
          this.setFilter(this.options.filter, true);
        } else {
          this.resetFilter();
        }

        if (Object.prototype.hasOwnProperty.call(this.options, 'pager')) {
          this.setPager(this.options.pager, true);
        } else {
          this.resetPager();
        }

        if (Object.prototype.hasOwnProperty.call(this.options, 'sorter')) {
          this.setSorter(this.options.sorter, true);
        } else {
          this.resetSorter(true);
        }

        if (Object.prototype.hasOwnProperty.call(this.options, 'return')) {
          this.setReturn(this.options.return);
        } else {
          this.setReturn();
        }

        if (Object.prototype.hasOwnProperty.call(this.options, 'search')) {
          this.setSearch(this.options.search, true);
        } else {
          this.setSearch();
        }

        this.render();
        this.updateData();
        return this;
      }

      onWorkingUpdate(val) {
        this.working = val;
        return val;
      }

      onRawUpdate(val) {
        this.data.raw = val;
        return val;
      }

      onFilteredUpdate(val) {
        this.data.filtered = val;
        this.refineFiltered();
        return val;
      }

      onRefinedUpdate(val) {
        this.data.refined = val;
        this.clearSelected();
        return val;
      }

      onStateUpdate(val) {
        this.state = val;
        return val;
      }

      onSearchChange(line) {
        if (line.length > 3) {
          this.setSearch(line);
        } else {
          this.setSearch();
        }
      }

      onSelectedUpdate(val) {
        this.data.selected = val;
      }

      clearSelected() {
        this.data.selected = {};
      }

      getSelected() {
        let object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        let store = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'refined';
        let res = [];

        for (let id in this.data.selected) {
          if (this.data.selected[id]) {
            if (object) {
              let indx = this.data[store].findIndex(function (item) {
                return item._id === id;
              });

              if (indx > -1) {
                res.push(this.data[store][indx]);
              }
            } else {
              res.push(id);
            }
          }
        }

        return res;
      }

      getItemId(item) {
        return this.getOptions('getItemId', DEFAULT_OPTIONS.getItemId)(item);
      }

      selectAll() {
        var _this = this;

        this.stores.selected.update(function () {
          let value = {};

          _this.data.filtered.forEach(function (item) {
            value[_this.getItemId(item)] = true;
          });

          return value;
        });
      }

      selectNone() {
        var _this2 = this;

        this.stores.selected.update(function () {
          let value = {};

          _this2.data.filtered.forEach(function (item) {
            value[_this2.getItemId(item)] = false;
          });

          return value;
        });
      }

      render() {
        var _this3 = this;

        if (!this.ui.table) {
          this.ui.table = new NotTable({
            target: this.options.targetEl,
            props: {
              id: this.id,
              helpers: Object.assign({}, this.getHelpers()),
              fields: this.getOptions('fields'),
              actions: this.getActions(),
              links: this.getLinks(),
              search: '',
              showSelect: this.getOptions('showSelect'),
              showSearch: this.getOptions('showSearch'),
              idField: this.getOptions('idField'),
              getItemId: this.getOptions('getItemId')
            }
          });
        }

        this.ui.table.$on('searchChange', function (e) {
          return _this3.onSearchChange(e.detail);
        });
        this.ui.table.$on('goToPage', function (e) {
          return _this3.goToPage(e.detail);
        });
        this.ui.table.$on('goToNextPage', function () {
          return _this3.goToNext();
        });
        this.ui.table.$on('goToPrevPage', function () {
          return _this3.goToPrev();
        });
      }

      getActions() {
        return this.getOptions('actions', []);
      }

      getLinks() {
        return this.getOptions('links', []);
      }

      getHelpers() {
        return this.options.helpers || {};
      }

      setWorking(key, value) {
        var _this4 = this;

        this.stores.working.update(function (val) {
          notPath.set(key, val, _this4.getHelpers(), value);
          return val;
        });
        return this;
      }

      getWorking(key, def) {
        let res = notPath.get(key, this.working, this.getHelpers());

        if (res === undefined) {
          return def;
        } else {
          return res;
        }
      }

      setState(key, value) {
        var _this5 = this;

        this.stores.state.update(function (val) {
          notPath.set(key, val, _this5.getHelpers(), value);
          return val;
        });
        return this;
      }

      getState(key, def) {
        let res = notPath.get(key, this.state, this.getHelpers());

        if (res === undefined) {
          return def;
        } else {
          return res;
        }
      }

      setOptions(key, value) {
        notPath.set(key, this.options, this.getHelpers(), value);
        return this;
      }

      getOptions(key, def) {
        let res = notPath.get(key, this.options, this.getHelpers());

        if (res === undefined) {
          return def;
        } else {
          return res;
        }
      }

      setFilter(hash) {
        let withoutInvalidation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        this.setState('filter', hash);

        if (withoutInvalidation) {
          return this;
        }

        this.invalidateData();
        this.updateData();
        return this;
      }

      resetFilter() {
        this.setState('filter', {});
        return this;
      }

      getFilter() {
        return this.getState('filter');
      }

      setPager(hash) {
        let withoutInvalidation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        this.setState('pager', hash);

        if (withoutInvalidation) {
          return this;
        }

        this.updateData();
        return this;
      }

      getDefaultPageNumber() {
        return isNaN(this.getOptions('pager.page')) ? OPT_DEFAULT_PAGE_NUMBER : this.getOptions('pager.page');
      }

      getDefaultPageSize() {
        return isNaN(this.getOptions('pager.size')) ? OPT_DEFAULT_PAGE_SIZE : this.getOptions('pager.size');
      }

      resetPager() {
        this.setState('pager', {
          size: this.getDefaultPageSize(),
          page: this.getDefaultPageNumber()
        });
      }

      getPager() {
        return this.getState('pager');
      }

      setSorter(hash) {
        let withoutInvalidation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        this.setWorking('sorter', hash);

        if (withoutInvalidation) {
          return this;
        }

        this.invalidateData();
        this.updateData();
        return this;
      }

      resetSorter() {
        let withoutInvalidation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        let t = {};
        t[OPT_DEFAULT_SORT_FIELD] = OPT_DEFAULT_SORT_DIRECTION;
        return this.setSorter(t, withoutInvalidation);
      }

      getSorter() {
        return this.getWorking('sorter');
      }

      getSorterDirection() {
        try {
          let names = Object.keys(this.getSorter());
          return this.getSorter()[names[0]];
        } catch (e) {
          return OPT_DEFAULT_SORT_DIRECTION;
        }
      }

      getSearch() {
        let search = typeof this.getWorking('search') !== 'undefined' && this.getWorking('search') !== null;
        return search ? this.getWorking('search') : '';
      }

      setSearch() {
        let line = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : OPT_DEFAULT_SEARCH;
        let withoutInvalidation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        this.setWorking('search', line);

        if (withoutInvalidation) {
          return this;
        }

        this.invalidateData();
        this.updateData();
        return this;
      }

      getReturn() {
        return this.getWorking('return');
      }

      setReturn() {
        let ret = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : OPT_DEFAULT_RETURN;
        this.setWorking('return', ret);
        return this;
      }

      clearFilteredData() {
        this.stores.filtered.update(function (val) {
          val.splice(0, val.length);
          return val;
        });
      }

      clearRawData() {
        this.stores.raw.update(function (val) {
          val.splice(0, val.length);
          return val;
        });
      }

      clearRefinedData() {
        this.stores.refined.update(function (val) {
          val.splice(0, val.length);
          return val;
        });
      }

      invalidateData() {
        //clearing filtered and sorted
        this.clearFilteredData(); //in case live loading from server

        if (this.isLive()) {
          //clearing loaded data
          this.clearRawData();
        } //resset pager anyway


        this.resetPager();
      }

      isLive() {
        return this.getOptions('interface') && this.getOptions('interface.factory');
      }

      setUpdating() {
        this.setState('updating', true);
      }

      setUpdated() {
        this.setState('updating', false);
      }

      ifUpdating() {
        return this.getState('updating');
      }

      getDataInterface() {
        let factory = this.getOptions('interface.factory');

        if (typeof factory === 'function') {
          return factory({});
        } else {
          return factory;
        }
      }

      getLoadDataActionName() {
        return this.getOptions('interface.listAction') ? this.getOptions('interface.listAction') : OPT_DEFAULT_LIST_ACTION;
      }

      getCombinedActionName() {
        return this.getOptions('interface.combinedAction') ? this.getOptions('interface.combinedAction') : OPT_DEFAULT_COMBINED_ACTION;
      }

      getCountActionName() {
        return this.getOptions('interface.countAction') ? this.getOptions('interface.countAction') : OPT_DEFAULT_COUNT_ACTION;
      }

      loadData() {
        //load from server
        let query = this.getDataInterface().setFilter(this.getFilter()).setSorter(this.getSorter()).setReturn(this.getReturn()).setSearch(this.getSearch()).setPager(this.getPager().size, this.getPager().page),
            actionName;

        if (this.getOptions('interface.combined', OPT_DEFAULT_COMBINED)) {
          actionName = this.getCombinedActionName();
        } else {
          actionName = this.getLoadDataActionName();
        }

        return query['$' + actionName]();
      }

      goToNext() {
        let next = isNaN(this.getState('pager.page')) ? this.getDefaultPageNumber() : this.getState('pager.page') + 1;
        this.setState('pager.page', Math.min(next, this.getState('pagination.pages.to')));
        this.updateData();
      }

      goToPrev() {
        let prev = isNaN(this.getState('pager.page')) ? this.getDefaultPageNumber() : this.getState('pager.page') - 1;
        this.setState('pager.page', Math.max(prev, this.getState('pagination.pages.from')));
        this.updateData();
      }

      goToFirst() {
        this.setState('pager.page', this.getState('pagination.pages.from'));
        this.updateData();
      }

      goToLast() {
        this.setState('pager.page', this.getState('pagination.pages.to'));
        this.updateData();
      }

      goToPage(pageNumber) {
        this.setState('pager.page', pageNumber);
        this.updateData();
      }

      testDataItem(item) {
        var strValue = this.getSearch().toLowerCase();

        for (var k in item) {
          var toComp = item[k].toString().toLowerCase();

          if (toComp.indexOf(strValue) > -1) {
            return true;
          }
        }

        return false;
      }

      getRowsCount() {
        var _this6 = this;

        let query = this.getDataInterface().setFilter(this.getFilter());
        return query['$' + this.getCountActionName()]().then(function (data) {
          _this6.updatePagination(data.count);
        }).catch(function (e) {
          _this6.error(e);
        });
      }

      updatePagination(itemsCount) {
        var _this7 = this;

        this.log('update pagination', itemsCount);
        this.state.pagination.pages.list.splice(0, this.state.pagination.pages.list.length);
        let itemsFrom = (this.getPager().page - OPT_DEFAULT_PAGE_NUMBER) * this.getPager().size + 1,
            pagesCount = itemsCount % this.getPager().size ? Math.floor(itemsCount / this.getPager().size) + 1 : Math.round(itemsCount / this.getPager().size),
            pagesFrom = Math.max(OPT_DEFAULT_PAGE_NUMBER, this.getPager().page - OPT_DEFAULT_PAGE_RANGE),
            pagesTo = Math.min(pagesCount - (1 - OPT_DEFAULT_PAGE_NUMBER), this.getPager().page + OPT_DEFAULT_PAGE_RANGE),
            list = [],
            itemsTo = Math.min(itemsFrom + this.getPager().size - 1, itemsCount);

        for (let t = pagesFrom; t <= pagesTo; t++) {
          list.push({
            index: t,
            active: t === this.getPager().page
          });
        }

        this.stores.state.update(function (val) {
          _this7.log('update pagination', val);

          val.pagination.items.count = itemsCount;
          val.pagination.items.from = itemsFrom;
          val.pagination.items.to = itemsTo;
          val.pagination.pages.count = pagesCount;
          val.pagination.pages.from = pagesFrom;
          val.pagination.pages.to = pagesTo;
          val.pagination.pages.current = _this7.getPager().page;
          val.pagination.pages.list.splice(0, val.pagination.pages.list.length, ...list);
          return val;
        });
      }

      updateData() {
        var _this8 = this;

        if (this.isLive()) {
          if (this.ifUpdating()) {
            return;
          }

          if (!this.getOptions('endless', false)) {
            this.clearRawData();
          }

          this.setUpdating();

          if (this.getOptions('interface.combined', OPT_DEFAULT_COMBINED)) {
            this.loadData().then(function (data) {
              let full = Object.prototype.hasOwnProperty.call(data, 'status') && Object.prototype.hasOwnProperty.call(data, 'result');

              _this8.stores.filtered.update(function (val) {
                if (!_this8.getOptions('endless', false)) {
                  _this8.clearFilteredData();
                }

                if (full) {
                  val.push(...data.result.list);
                } else {
                  if (Object.prototype.hasOwnProperty.call(data, 'list') && Array.isArray(data.list)) {
                    val.push(...data.list);
                  } else if (Array.isArray(data)) {
                    val.push(...data);
                  }
                }

                return val;
              });

              _this8.setWorking('lastCount', full ? data.result.count : data.count);
            }).then(function () {
              _this8.updatePagination(_this8.getWorking('lastCount'));
            }).catch(this.error.bind(this)).then(this.setUpdated.bind(this));
          } else {
            this.loadData().then(function (data) {
              _this8.stores.filtered.update(function (val) {
                val.push(...data);
                return val;
              });
            }).then(this.getRowsCount.bind(this)).catch(this.error.bind(this)).then(this.setUpdated.bind(this));
          }
        } else {
          //local magic
          this.setUpdating();
          this.processData();
          this.setUpdated();
        }
      }

      getData() {
        return this.data;
      }

      processData() {
        var _this9 = this;

        let thatFilter = this.getFilter(); //this.getData('rows').__setPassive;

        this.log(this.getData());

        if (typeof thatFilter !== 'undefined' && thatFilter !== null && typeof thatFilter.filterSearch !== 'undefined' && thatFilter.filterSearch !== null && thatFilter.filterSearch.length > 0) {
          this.stores.filtered.update(function (val) {
            val.splice(0, val.length, ..._this9.data.raw.filter(_this9.testDataItem.bind(_this9)));
            return val;
          });
        } else {
          this.stores.filtered.update(function (val) {
            val.splice(0, val.length, ..._this9.data.raw);
            return val;
          });
        } ////sorter


        let thatSorter = this.getSorter();

        if (typeof thatSorter !== 'undefined' && thatSorter !== null) {
          this.stores.filtered.update(function (val) {
            val.sort(function (item1, item2) {
              let t1 = notPath.get(thatSorter.sortByField, item1, {}),
                  t2 = notPath.get(thatSorter.sortByField, item2, {});

              if (isNaN(t1)) {
                if (typeof t1 !== 'undefined' && typeof t2 !== 'undefined' && t1.localeCompare) {
                  return t1.localeCompare() * -thatSorter.sortDirection;
                } else {
                  return 0;
                }
              } else {
                return (t1 < t2 ? 1 : -1) * thatSorter.sortDirection;
              }
            });
            return val;
          });
        }
      }

      error() {
        if (this.options.logger) {
          this.options.logger.error(...arguments);
        }
      }

      log() {
        if (this.options.logger) {
          this.options.logger.log(...arguments);
        }
      }

      checkFieldsNames() {
        const fieldId = this.getOptions('idField');
        const pathId = ':' + fieldId;
        let fields = this.getOptions('fields', []);
        fields.forEach(function (field) {
          if (pathId === field.path) {
            field.path = field.path + CONST_ID_DUBLICATE_POSTFIX;
          }
        });
      }

      readFieldValue(path, item, helpers) {
        if (path.indexOf(CONST_ID_DUBLICATE_POSTFIX) > -1) {
          const fieldId = this.getOptions('idField');
          const pathId = ':' + fieldId;
          return notPath.get(pathId, item, helpers);
        } else {
          return notPath.get(path, item, helpers);
        }
      }

      refineFiltered() {
        var _this10 = this;

        let result = [];
        this.checkFieldsNames();
        this.data.filtered.forEach(function (item, index) {
          let refined = {};

          if (_this10.getOptions('idField')) {
            refined[_this10.getOptions('idField')] = item[_this10.getOptions('idField')];
          }

          _this10.getOptions('fields', []).forEach(function (field) {
            let preprocessed = null,
                val = _this10.readFieldValue(field.path, item, _this10.getOptions('helpers'));

            if (Object.prototype.hasOwnProperty.call(field, OPT_FIELD_NAME_PRE_PROC)) {
              try {
                preprocessed = field[OPT_FIELD_NAME_PRE_PROC](val, item, index);
              } catch (e) {
                _this10.error('Error while preprocessing cell value', val, item, index);

                _this10.error(e);
              }

              notPath.set(field.path, refined, preprocessed);
            } else {
              notPath.set(field.path, refined, val);
            }
          });

          result.push(refined);
        });
        this.stores.refined.update(function (val) {
          val.splice(0, val.length, ...result);
          return val;
        });
      }

      $destroy() {
        for (let name in this.ui) {
          this.ui[name].$destroy && this.ui[name].$destroy();
          delete this.ui[name];
        }
      }

    }

    class notFormUtils$1 {
      static addComponent(name, value) {
        COMPONENTS$1.add(name, value);
      }

      static addVariants(name, value) {
        VARIANTS$1.add(name, value);
      }

      static addField(name, field) {
        FIELDS$2.add(name, field);
      }

      static actionFieldsInit(fieldName, options, data) {
        var _this = this;

        if (Array.isArray(fieldName)) {
          fieldName.forEach(function (subFieldName) {
            _this.actionFieldsInit(subFieldName, options, data);
          });
        } else {
          if (!notCommon$2.objHas(options, 'fields')) {
            options.fields = {};
          }

          if (!notCommon$2.objHas(options.fields, fieldName)) {
            options.fields[fieldName] = {};
          } //copying initial data


          if (typeof data !== 'undefined' && data !== null && typeof data[fieldName] !== 'undefined' && data[fieldName] !== null) {
            options.fields[fieldName].value = data[fieldName];
          }
        }
      }

    }

    _defineProperty(notFormUtils$1, "validator", null);

    const emptyFieldsResults = (data)=>{
      return Object.keys(data).reduce((acc, curr)=>{acc[curr] = []; return acc;}, {});
    };

    const FIELDS$1 = ['fields', 'form'];

    var result = class ValidationResult{
      #clean = true;
      #result;

      constructor(result){
        this.#result = JSON.parse(JSON.stringify(result));
        Object.keys(this.#result).forEach((fieldName)=>{
          if(!FIELDS$1.includes(fieldName)){
            delete this.#result[fieldName];
          }
        });
        this.#clean = this.#result.form.errors.length === 0;
        const list = this.#getFieldsList();
        for(let fieldName of list ){
          if(this.isFieldDirty(fieldName)){
            this.#clean = false;
          }
        }
      }

      destroy(){
        this.#result = undefined;
      }

      get clean(){
        return this.#clean;
      }

      static getDefaultResult(data){
        return {
          fields: emptyFieldsResults(data),
          form: {
            fields: emptyFieldsResults(data),
            errors:[],
            exceptions: []
          },
        };
      }

      getReport(){
        return JSON.parse(JSON.stringify(this.#getCompleteResult()));
      }

      getDetailedReport(){
        if(typeof this.#result === 'object'){
          return JSON.parse(JSON.stringify(this.#result));
        }else {
          return undefined;
        }
      }

      isFieldDirty(fieldName){
        if(
          Array.isArray(this.#result.fields[fieldName])
          && this.#result.fields[fieldName].length
        ){
          return true;
        }
        if(
          Array.isArray(this.#result.form.fields[fieldName])
          && this.#result.form.fields[fieldName].length
        ){
          return true;
        }
        return false;
      }

      getCompleteResultForField(fieldName){
        const fieldResult = [];
        if(Array.isArray(this.#result.fields[fieldName])){
          fieldResult.push(...this.#result.fields[fieldName]);
        }
        if(Array.isArray(this.#result.form.fields[fieldName])){
          fieldResult.push(...this.#result.form.fields[fieldName]);
        }
        return fieldResult;
      }

      #getCompleteResult(){
        const resultComplete = {
          clean: this.#clean,
          fields: {},
          form: []
        };
        const list = this.#getFieldsList();
        for(let fieldName of list){
          const errors = this.getCompleteResultForField(fieldName);
          if(errors.length){
            resultComplete.fields[fieldName] = errors;
          }
        }
        resultComplete.form = [...this.#result.form.errors];
        if(resultComplete.form.length === 0){
          delete resultComplete.form;
        }
        return resultComplete;
      }

      #getFieldsList(){
        const fields = Object.keys(this.#result.fields);
        const fieldsInForm = Object.keys(this.#result.form.fields);
        return [...new Set([...fieldsInForm, ...fields])];
      }


    };

    /**
     * Test argument type to be 'function'
     * @param {any}  func    possible function
     * @return {boolean}     if this is a function
     **/
    const isFunc = (func) => {
      return typeof func === 'function';
    };

    /**
     * Returns true if argument is Async function
     * @param {function} func  to test
     * @return {boolean}       if this function is constructed as AsyncFunction
     **/
    const isAsync = (func) => {
      return func.constructor.name === 'AsyncFunction';
    };

    var common = async (proc, params) => {
      if (isFunc(proc)) {
        if (isAsync(proc)) {
          return await proc(...params);
        } else {
          return proc(...params);
        }
      }
    };

    const ValidationSession = async (validators, data)=>{
      const result$1 = result.getDefaultResult(data);
      await validateFields({validators, data, result: result$1});
      await validateForm({validators, data, result: result$1});
      return new result(result$1);
    };

    var session = ValidationSession;

    const validateFields = async ({validators, data, result})=>{
      for(let t in data){
        await validateField(t, data[t], validators, result);
      }
    };

    const validateField = async (fieldName, value, validators, result) => {
      const fieldValidators = getFieldValidators(fieldName, validators);
      return await runFieldValidators(fieldName, value, fieldValidators, result);
    };

    const getFieldValidators = (name, validators)=>{
      return validators && validators.fields && validators.fields[name]?validators.fields[name]:[];
    };

    const runFieldValidators = async (fieldName, value, validators, result) => {
      for(let validatorRule of validators){
        try{
          const valid = await common(validatorRule['validator'], [value]);
          if(!valid){
            setFieldError(fieldName, validatorRule.message, result);
          }
        }catch(e){
          setFieldError(fieldName, validatorRule.message, result);
        }
      }
    };

    const setFieldError = (fieldName, errorMessage, result) => {
      if(!result.fields[fieldName].includes(errorMessage)){
        result.fields[fieldName].push(errorMessage);
      }
    };

    const validateForm = async ({validators, data, result}) => {
      const formValidators = getFormValidators(validators);
      await runFormValidators(data, formValidators, result);
    };

    const getFormValidators = (validators)=>{
      return validators && validators.form?validators.form: [];
    };

    const runFormValidators = async (data, formValidators, result) => {
      for(let validator of formValidators){
        try{
          await validator(data);
        }catch(e){
          if(e && typeof e.getFieldsErrors === 'function'){
            const formErrors = e.getFieldsErrors();
            (Array.isArray(formErrors.form)) && addFormErrors(formErrors.form, result);
            formErrors.fields && addFormFieldsErrors(formErrors.fields, result);
          }else {
            throw e;
          }
        }
      }
    };

    const addFormErrors = (errors, result) => {
      errors.forEach(error => {
        addFormError(error, result);
      });
    };

    const addFormError = (errorMessage, result) => {
      if(!result.form.errors.includes(errorMessage)){
        result.form.errors.push(errorMessage);
      }
    };

    const addFormFieldsErrors = (fieldsErrors, result)=>{
      for(let fieldName in fieldsErrors){
        addFormFieldErrors(fieldName, fieldsErrors[fieldName], result);
      }
    };

    const addFormFieldErrors = (fieldName, errorMessages, result) => {
      errorMessages.forEach(error => {
        addFormFieldError(fieldName, error, result);
      });
    };

    const addFormFieldError = (fieldName, errorMessage, result) => {
      if(!Array.isArray(result.form.fields[fieldName])){
        result.form.fields[fieldName] = [];
      }
      if(!result.form.fields[fieldName].includes(errorMessage)){
        result.form.fields[fieldName].push(errorMessage);
      }
    };

    const composeFieldsValidators$1 = (data, validatorsLib) => {
      if (validatorsLib && validatorsLib.fields) {
        const list = Object.keys(data);
        const result = {};
        list.forEach((fieldName) => {
          if (Array.isArray(validatorsLib.fields[fieldName])) {
            result[fieldName] = validatorsLib.fields[fieldName];
          }
        });
        return result;
      } else {
        return {};
      }
    };

    const composeFormValidators$1 = (name, validatorsLib) => {
      if (!validatorsLib) return [];
      if (validatorsLib.forms && Array.isArray(validatorsLib.forms[name])) {
        return validatorsLib.forms[name];
      }
      if (Array.isArray(validatorsLib.form)) {
        return validatorsLib.form;
      }
      return [];
    };

    var runner_utils = {
      composeFieldsValidators: composeFieldsValidators$1,
      composeFormValidators: composeFormValidators$1
    };

    const {
      composeFieldsValidators,
      composeFormValidators
    } = runner_utils;



    /**
    * Creates validation runner function from provided validation rules lib
    * @param {object}     validationLib object containing fields validation rules and form specific rules
    * @returns {function} (data: object, formName: string)=>Promise<ValidationResult>
    **/
    const ValidationRunner = (validatorsLib) => {
      /**
      * Validation session runner
      * @param {object} data      object to validate
      * @param {string} formName
      * @returns {Promise}
      **/
      return (data, formName) => {
        const validators = {
          //fields specific validators
          fields: composeFieldsValidators(data, validatorsLib),
          //form specific validators
          form: composeFormValidators(formName, validatorsLib),
        };
        return session(validators, data);
      };
    };

    var runner = ValidationRunner;

    const augmentFieldsValidators$1 = (fieldValidators, getValidatorEnv) => {
      return fieldValidators.map(fieldRule => augmentFieldValidator(fieldRule, getValidatorEnv));
    };

    const augmentFieldValidator = (rule, getValidatorEnv) => {
      if (rule.validator && typeof rule.validator === 'function') {
        const ruleValidator = rule.validator;
        const result = {
          ...rule
        };
        delete result.validator;
        result.validator = (val) => ruleValidator(val, getValidatorEnv());
        return result;
      }
      return rule;
    };

    const augmentFormValidators$1 = (rules, getValidatorEnv) => {
      return rules.map(rule => augmentFormValidator(rule, getValidatorEnv));
    };


    const augmentFormValidator = (rule, getValidatorEnv) => {
      return (val) => rule(val, getValidatorEnv());
    };


    var builder_utils = {
      augmentFieldsValidators: augmentFieldsValidators$1,
      augmentFieldValidator,
      augmentFormValidators: augmentFormValidators$1,
      augmentFormValidator
    };

    const objHas = (obj, name) => {
      return Object.prototype.hasOwnProperty.call(obj, name);
    };
    const {
      augmentFieldsValidators,
      augmentFormValidators,
    } = builder_utils;

    var builder = (validators, getValidatorEnv) => {
      if(typeof validators === 'undefined' || validators === null){return {};}
      if (objHas(validators, 'fields')) {
        transformFieldsValidators(validators.fields, getValidatorEnv);
      }
      if (objHas(validators, 'forms')) {
        transformFormsValidators(validators.forms, getValidatorEnv);
      }else {
        if (objHas(validators, 'form')) {
          validators.form = augmentFormValidators(validators.form, getValidatorEnv);
        }
      }
      return validators;
    };

    const transformFieldsValidators = (fields, getValidatorEnv)=>{
      for (let fieldName in fields) {
        if(Array.isArray(fields[fieldName])){
          fields[fieldName] = augmentFieldsValidators(fields[fieldName], getValidatorEnv);
        }
      }
    };

    const transformFormsValidators = (formsValidators, getValidatorEnv)=>{
      for (let formName in formsValidators) {
        if(Array.isArray(formsValidators[formName])){
          formsValidators[formName] = augmentFormValidators(formsValidators[formName], getValidatorEnv);
        }
      }
    };

    var src = {
      name: 'not-validation',
      Session: session,
      Runner: runner,
      Builder: builder,
      Result: result
    };
    var src_3 = src.Runner;

    const DEFAULT_FIELD = {
      label: '',
      placeholder: '',
      enabled: true,
      visible: true,
      required: true,
      validated: false,
      valid: false,
      errors: false
    };
    /**
    * Creates field manifest
    * @param {string} type      name/type of the field
    * @param {Object} mutation  mutation to manifest from library
    * @param {Object} VARIANTS  store which contains named lists of field value variants
    * @param {Object} FIELDS    store which contains named lists of field manifests
    * @return {Object}          field manifest
    **/

    function fieldInit(type) {
      let mutation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      let VARIANTS = arguments.length > 2 ? arguments[2] : undefined;
      let FIELDS = arguments.length > 3 ? arguments[3] : undefined;
      let field = { ...DEFAULT_FIELD
      }; //getting field core manifest

      if (FIELDS.contains(type)) {
        field = { ...field,
          ...FIELDS.get(type)
        };
      } //adding mutations


      if (mutation) {
        field = { ...field,
          ...mutation
        };
      } //adding variants list to field from VARIANTS store


      if (notCommon$2.objHas(field, 'variantsSource') && VARIANTS.contains(field.variantsSource)) {
        field.variants = VARIANTS.get(field.variantsSource);
      } else {
        if (!field.variants || field.variants.length === 0) {
          field.variants = [];
        }
      }

      return field;
    }
    /**
    * Initialization of form structure object
    * @param {object}               form          form structure object
    * @param {string|Array<string>} fieldName     name of the field type if string, array of strings = subform
    * @param {Object}               VARIANTS      store which contains named lists of field value variants
    * @param {Object}               FIELDS        store which contains named lists of field manifests
    * @param {Object}               formFieldsOptions   form wide options
    * @returns {Object}                           form structure object
    **/


    function initFormByField() {
      let form = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      let fieldName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      let VARIANTS = arguments.length > 2 ? arguments[2] : undefined;
      let FIELDS = arguments.length > 3 ? arguments[3] : undefined;
      let formFieldsOptions = arguments.length > 4 ? arguments[4] : undefined;
      let data = arguments.length > 5 ? arguments[5] : undefined;

      if (Array.isArray(fieldName)) {
        fieldName.forEach(function (subFormFieldName) {
          return initFormByField(form, subFormFieldName, VARIANTS, FIELDS, formFieldsOptions, data);
        });
      } else {
        let opts = {};

        if (formFieldsOptions && notCommon$2.objHas(formFieldsOptions, 'mutations') && notCommon$2.objHas(formFieldsOptions.mutations, fieldName)) {
          opts = formFieldsOptions.mutations[fieldName]; //option mutation for field
        }

        if (data && notCommon$2.objHas(data, fieldName)) {
          opts.value = data[fieldName];
        }

        form[fieldName] = fieldInit(fieldName, opts, VARIANTS, FIELDS); //if form readonly, marking every field as readonly

        if (formFieldsOptions && formFieldsOptions.readonly) {
          form[fieldName].readonly = true;
        }
      }

      return form;
    }
    /**
    *  Marking field as invalid by own validator
    * @param {Object}           form          form structure object
    * @param {string}           fieldName     name of the field
    * @param {any}              value         value of field
    * @param  {Array<string>}   errors        list of errors
    * @return {Object}                        form structure object
    **/


    function setFieldInvalid(form, fieldName, value, errors) {
      form[fieldName].errors = [...errors];
      form[fieldName].validated = true;
      form[fieldName].valid = false;
      form[fieldName].value = value;
      return form;
    }
    /**
    *  Marking field as valid by own validator
    * @param {Object}           form          form structure object
    * @param {string}           fieldName     name of the field
    * @param {any}              value         value of field
    * @return {Object}                        form structure object
    **/


    function setFieldValid(form, fieldName, value) {
      form[fieldName].errors = false;
      form[fieldName].validated = true;
      form[fieldName].valid = true;
      form[fieldName].value = value;

      for (let fname in form) {
        if (fname !== fieldName) {
          if (Array.isArray(form[fname].errors) && form[fname].errors.length === 0) {
            form[fname].errors = false;
          }

          if (form[fname].errors !== false) {
            break;
          }
        }
      }

      return form;
    }
    /**
    * Checks if field has errors
    * @param {Object}           form          form structure object
    * @param {string}           fieldName     name of the field
    * @returns {boolean}                      true - valid, false -invalid
    **/


    function isFieldValid(form, fieldName) {
      return !Array.isArray(form[fieldName].errors);
    }
    /**
    * Form level validator error in this field
    * @param {Object}           form          form structure object
    * @param {string}           fieldName     name of the field
    * @param  {Array<string>}   errors        list of errors
    * @return {Object}                        form structure object
    **/


    function setFormFieldInvalid(form, fieldName, errors) {
      form[fieldName].formErrors = [...errors];
      form[fieldName].validated = true;
      form[fieldName].inputStarted = true;
      form[fieldName].valid = false;
      form[fieldName].formLevelError = true;
      return form;
    }
    /**
    * Form level validator success in this field
    * @param {Object}           form          form structure object
    * @param {string}           fieldName     name of the field
    * @return {Object}                        form structure object
    **/


    function setFormFieldValid(form, fieldName) {
      form[fieldName].formErrors = false;
      form[fieldName].validated = true;
      form[fieldName].valid = true;
      form[fieldName].formLevelError = false;
      return form;
    }
    /**
    * Updates fields and form error labels
    * @param {Object}           form                  form structure object
    * @param {Object}           validationStatus      results of validation
    **/


    function updateFormValidationStatus(_ref
    /* FormValidationSession.getCompleteResult() */
    ) {
      let {
        form,
        formErrors,
        formHasErrors,
        fieldsHasErrors,
        validationStatus
      } = _ref;
      formHasErrors = false;
      fieldsHasErrors = false;

      if (Array.isArray(validationStatus.form) && validationStatus.form.length) {
        formErrors.splice(0, formErrors.length, ...validationStatus.form);
        formHasErrors = true;
      } else {
        formErrors.splice(0, formErrors.length);
      }

      formErrors = formErrors;

      if (validationStatus.fields) {
        for (let fieldName in validationStatus.fields) {
          if (Array.isArray(validationStatus.fields[fieldName]) && validationStatus.fields[fieldName].length) {
            setFormFieldInvalid(form, fieldName, validationStatus.fields[fieldName]);
            fieldsHasErrors = true;
          } else {
            setFormFieldValid(form, fieldName);
          }
        }
      }
    }

    function setFieldsVisibility(form, fieldsList, val) {
      if (Array.isArray(fieldsList)) {
        Object.keys(form).forEach(function (fieldName) {
          form[fieldName].visible = fieldsList.includes(fieldName) ? val : !val;
        });
        return true;
      }

      return false;
    }

    function setFieldValue(form, fieldName, value) {
      if (notCommon$2.objHas(form, fieldName)) {
        form[fieldName].value = value;
        return true;
      }

      return false;
    }

    function fieldIsVisibleAndFilled(form, fieldName) {
      return notCommon$2.objHas(form, fieldName) && form[fieldName].enabled && form[fieldName].visible && typeof form[fieldName].value !== 'undefined';
    }

    function collectData(fields, form) {
      let result = {};
      fields.flat().forEach(function (fieldName) {
        if (fieldIsVisibleAndFilled(form, fieldName)) {
          result[fieldName] = form[fieldName].value;
        }
      });
      return result;
    }

    var FormHelpers = {
      fieldInit,
      initFormByField,
      setFieldInvalid,
      setFieldValid,
      isFieldValid,
      setFormFieldInvalid,
      setFormFieldValid,
      updateFormValidationStatus,
      fieldIsVisibleAndFilled,
      setFieldsVisibility,
      setFieldValue,
      collectData
    };

    /* src/frame/components/form/field.svelte generated by Svelte v3.46.6 */

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (81:0) {:else}
    function create_else_block$9(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let each_value_2 = /*controls*/ ctx[3];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", div_class_value = "field " + /*fieldClasses*/ ctx[4] + " " + /*fieldId*/ ctx[6]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*COMPONENTS, controls, name, onControlChange*/ 138) {
    				each_value_2 = /*controls*/ ctx[3];
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*fieldClasses, fieldId*/ 80 && div_class_value !== (div_class_value = "field " + /*fieldClasses*/ ctx[4] + " " + /*fieldId*/ ctx[6])) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (70:0) {#if horizontal}
    function create_if_block_1$a(ctx) {
    	let div2;
    	let div0;
    	let uilabel;
    	let t;
    	let div1;
    	let div2_class_value;
    	let current;

    	uilabel = new Ui_label({
    			props: {
    				id: /*fieldId*/ ctx[6],
    				label: /*label*/ ctx[0] || /*controls*/ ctx[3][0].label
    			}
    		});

    	let each_value_1 = /*controls*/ ctx[3];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(uilabel.$$.fragment);
    			t = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div0, "class", "field-label is-normal");
    			attr(div1, "class", "field-body");
    			attr(div1, "id", /*fieldId*/ ctx[6]);
    			attr(div2, "class", div2_class_value = "field is-horizontal " + /*fieldClasses*/ ctx[4] + " " + /*fieldId*/ ctx[6]);
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			mount_component(uilabel, div0, null);
    			append(div2, t);
    			append(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			const uilabel_changes = {};
    			if (dirty & /*fieldId*/ 64) uilabel_changes.id = /*fieldId*/ ctx[6];
    			if (dirty & /*label, controls*/ 9) uilabel_changes.label = /*label*/ ctx[0] || /*controls*/ ctx[3][0].label;
    			uilabel.$set(uilabel_changes);

    			if (dirty & /*COMPONENTS, controls, name, onControlChange*/ 138) {
    				each_value_1 = /*controls*/ ctx[3];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*fieldId*/ 64) {
    				attr(div1, "id", /*fieldId*/ ctx[6]);
    			}

    			if (!current || dirty & /*fieldClasses, fieldId*/ 80 && div2_class_value !== (div2_class_value = "field is-horizontal " + /*fieldClasses*/ ctx[4] + " " + /*fieldId*/ ctx[6])) {
    				attr(div2, "class", div2_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uilabel.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			transition_out(uilabel.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			destroy_component(uilabel);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (62:0) {#if hidden }
    function create_if_block$b(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*controls*/ ctx[3];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*COMPONENTS, controls, name, onControlChange*/ 138) {
    				each_value = /*controls*/ ctx[3];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (83:2) {#each controls as control}
    function create_each_block_2$1(ctx) {
    	let uilabel;
    	let t;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	uilabel = new Ui_label({
    			props: {
    				id: "form-field-" + /*control*/ ctx[18].component + "-" + /*name*/ ctx[1],
    				label: /*control*/ ctx[18].label
    			}
    		});

    	const switch_instance_spread_levels = [/*control*/ ctx[18], { fieldname: /*name*/ ctx[1] }];
    	var switch_value = COMPONENTS$1.get(/*control*/ ctx[18].component);

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("change", /*onControlChange*/ ctx[7]);
    	}

    	return {
    		c() {
    			create_component(uilabel.$$.fragment);
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			mount_component(uilabel, target, anchor);
    			insert(target, t, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uilabel_changes = {};
    			if (dirty & /*controls, name*/ 10) uilabel_changes.id = "form-field-" + /*control*/ ctx[18].component + "-" + /*name*/ ctx[1];
    			if (dirty & /*controls*/ 8) uilabel_changes.label = /*control*/ ctx[18].label;
    			uilabel.$set(uilabel_changes);

    			const switch_instance_changes = (dirty & /*controls, name*/ 10)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*controls*/ 8 && get_spread_object(/*control*/ ctx[18]),
    					dirty & /*name*/ 2 && { fieldname: /*name*/ ctx[1] }
    				])
    			: {};

    			if (switch_value !== (switch_value = COMPONENTS$1.get(/*control*/ ctx[18].component))) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("change", /*onControlChange*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uilabel.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uilabel.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uilabel, detaching);
    			if (detaching) detach(t);
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    // (76:4) {#each controls as control}
    function create_each_block_1$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*control*/ ctx[18], { fieldname: /*name*/ ctx[1] }];
    	var switch_value = COMPONENTS$1.get(/*control*/ ctx[18].component);

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("change", /*onControlChange*/ ctx[7]);
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*controls, name*/ 10)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*controls*/ 8 && get_spread_object(/*control*/ ctx[18]),
    					dirty & /*name*/ 2 && { fieldname: /*name*/ ctx[1] }
    				])
    			: {};

    			if (switch_value !== (switch_value = COMPONENTS$1.get(/*control*/ ctx[18].component))) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("change", /*onControlChange*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    // (64:0) {#each controls as control}
    function create_each_block$6(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*control*/ ctx[18], { fieldname: /*name*/ ctx[1] }];
    	var switch_value = COMPONENTS$1.get(/*control*/ ctx[18].component);

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("change", /*onControlChange*/ ctx[7]);
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*controls, name*/ 10)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*controls*/ 8 && get_spread_object(/*control*/ ctx[18]),
    					dirty & /*name*/ 2 && { fieldname: /*name*/ ctx[1] }
    				])
    			: {};

    			if (switch_value !== (switch_value = COMPONENTS$1.get(/*control*/ ctx[18].component))) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("change", /*onControlChange*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    function create_fragment$f(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$b, create_if_block_1$a, create_else_block$9];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*hidden*/ ctx[5]) return 0;
    		if (/*horizontal*/ ctx[2]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let { label = '' } = $$props;
    	let { name = 'generic field' } = $$props;
    	let { readonly = false } = $$props;
    	let { horizontal = false } = $$props;
    	let { controls = [] } = $$props;
    	let { classes = '' } = $$props;
    	let { addons = false } = $$props;
    	let { addonsCentered = false } = $$props;
    	let { addonsRight = false } = $$props;
    	let { grouped = false } = $$props;
    	let { groupedMultiline = false } = $$props;
    	let { groupedRight = false } = $$props;
    	let { groupedCentered = false } = $$props;
    	let fieldClasses = '';
    	let hidden = false;
    	let fieldId;

    	onMount(() => {
    		$$invalidate(4, fieldClasses += ' ' + classes);
    		$$invalidate(4, fieldClasses += addons ? ' has-addons ' : '');
    		$$invalidate(4, fieldClasses += addonsCentered ? ' has-addons-centered ' : '');
    		$$invalidate(4, fieldClasses += addonsRight ? ' has-addons-right ' : '');
    		$$invalidate(4, fieldClasses += grouped ? ' is-grouped ' : '');
    		$$invalidate(4, fieldClasses += groupedMultiline ? ' is-grouped-multiline ' : '');
    		$$invalidate(4, fieldClasses += groupedRight ? ' is-grouped-right ' : '');
    		$$invalidate(4, fieldClasses += groupedCentered ? ' is-grouped-centered ' : '');

    		if (readonly) {
    			controls.forEach(control => {
    				control.readonly = true;
    			});
    		}

    		let notHidden = controls.filter(control => control.component !== 'UIHidden');
    		$$invalidate(5, hidden = notHidden.length === 0);
    		let tmp = controls.map(itm => itm.component).join('_');
    		$$invalidate(6, fieldId = `form-field-${tmp}-${name}`);
    	});

    	function onControlChange(ev) {
    		let data = ev.detail;
    		dispatch('change', data);
    	}

    	$$self.$$set = $$props => {
    		if ('label' in $$props) $$invalidate(0, label = $$props.label);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('readonly' in $$props) $$invalidate(8, readonly = $$props.readonly);
    		if ('horizontal' in $$props) $$invalidate(2, horizontal = $$props.horizontal);
    		if ('controls' in $$props) $$invalidate(3, controls = $$props.controls);
    		if ('classes' in $$props) $$invalidate(9, classes = $$props.classes);
    		if ('addons' in $$props) $$invalidate(10, addons = $$props.addons);
    		if ('addonsCentered' in $$props) $$invalidate(11, addonsCentered = $$props.addonsCentered);
    		if ('addonsRight' in $$props) $$invalidate(12, addonsRight = $$props.addonsRight);
    		if ('grouped' in $$props) $$invalidate(13, grouped = $$props.grouped);
    		if ('groupedMultiline' in $$props) $$invalidate(14, groupedMultiline = $$props.groupedMultiline);
    		if ('groupedRight' in $$props) $$invalidate(15, groupedRight = $$props.groupedRight);
    		if ('groupedCentered' in $$props) $$invalidate(16, groupedCentered = $$props.groupedCentered);
    	};

    	return [
    		label,
    		name,
    		horizontal,
    		controls,
    		fieldClasses,
    		hidden,
    		fieldId,
    		onControlChange,
    		readonly,
    		classes,
    		addons,
    		addonsCentered,
    		addonsRight,
    		grouped,
    		groupedMultiline,
    		groupedRight,
    		groupedCentered
    	];
    }

    class Field extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			label: 0,
    			name: 1,
    			readonly: 8,
    			horizontal: 2,
    			controls: 3,
    			classes: 9,
    			addons: 10,
    			addonsCentered: 11,
    			addonsRight: 12,
    			grouped: 13,
    			groupedMultiline: 14,
    			groupedRight: 15,
    			groupedCentered: 16
    		});
    	}
    }

    /* src/frame/components/form/form.svelte generated by Svelte v3.46.6 */

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	return child_ctx;
    }

    // (196:0) {#if loader!=='hidden' }
    function create_if_block_16(ctx) {
    	let div;
    	let span;
    	let t_value = /*$LOCALE*/ ctx[15][/*WAITING_TEXT*/ ctx[5]] + "";
    	let t;
    	let div_class_value;

    	return {
    		c() {
    			div = element("div");
    			span = element("span");
    			t = text(t_value);
    			attr(span, "class", "title");

    			attr(div, "class", div_class_value = "" + ((/*loader*/ ctx[2] === 'page'
    			? 'pageloader'
    			: 'containerloader') + " " + (/*loading*/ ctx[1] ? 'is-active' : '')));
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, span);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*$LOCALE, WAITING_TEXT*/ 32800 && t_value !== (t_value = /*$LOCALE*/ ctx[15][/*WAITING_TEXT*/ ctx[5]] + "")) set_data(t, t_value);

    			if (dirty[0] & /*loader, loading*/ 6 && div_class_value !== (div_class_value = "" + ((/*loader*/ ctx[2] === 'page'
    			? 'pageloader'
    			: 'containerloader') + " " + (/*loading*/ ctx[1] ? 'is-active' : '')))) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (204:0) {:else}
    function create_else_block$8(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let if_block3_anchor;
    	let current;
    	let if_block0 = /*title*/ ctx[6] && create_if_block_15(ctx);
    	let if_block1 = /*description*/ ctx[7] && create_if_block_14(ctx);
    	let if_block2 = /*buttonsFirst*/ ctx[8] && create_if_block_10(ctx);
    	let each_value = /*fields*/ ctx[3];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block3 = !/*buttonsFirst*/ ctx[8] && create_if_block_1$9(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, t2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, t3, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert(target, if_block3_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*title*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_15(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*description*/ ctx[7]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_14(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*buttonsFirst*/ ctx[8]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_10(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*fields, form, horizontal, onFieldChange*/ 66057) {
    				each_value = /*fields*/ ctx[3];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t3.parentNode, t3);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!/*buttonsFirst*/ ctx[8]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_1$9(ctx);
    					if_block3.c();
    					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach(t2);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(t3);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach(if_block3_anchor);
    		}
    	};
    }

    // (200:0) {#if success}
    function create_if_block$a(ctx) {
    	let div;
    	let h3;
    	let t_value = /*$LOCALE*/ ctx[15][/*SUCCESS_TEXT*/ ctx[4]] + "";
    	let t;

    	return {
    		c() {
    			div = element("div");
    			h3 = element("h3");
    			t = text(t_value);
    			attr(h3, "class", "form-success-message");
    			attr(div, "class", "notification is-success");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h3);
    			append(h3, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*$LOCALE, SUCCESS_TEXT*/ 32784 && t_value !== (t_value = /*$LOCALE*/ ctx[15][/*SUCCESS_TEXT*/ ctx[4]] + "")) set_data(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (205:0) {#if title }
    function create_if_block_15(ctx) {
    	let h5;
    	let t_value = /*$LOCALE*/ ctx[15][/*title*/ ctx[6]] + "";
    	let t;

    	return {
    		c() {
    			h5 = element("h5");
    			t = text(t_value);
    			attr(h5, "class", "title is-5");
    		},
    		m(target, anchor) {
    			insert(target, h5, anchor);
    			append(h5, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*$LOCALE, title*/ 32832 && t_value !== (t_value = /*$LOCALE*/ ctx[15][/*title*/ ctx[6]] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(h5);
    		}
    	};
    }

    // (208:0) {#if description }
    function create_if_block_14(ctx) {
    	let h6;
    	let t_value = /*$LOCALE*/ ctx[15][/*description*/ ctx[7]] + "";
    	let t;

    	return {
    		c() {
    			h6 = element("h6");
    			t = text(t_value);
    			attr(h6, "class", "subtitle is-6");
    		},
    		m(target, anchor) {
    			insert(target, h6, anchor);
    			append(h6, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*$LOCALE, description*/ 32896 && t_value !== (t_value = /*$LOCALE*/ ctx[15][/*description*/ ctx[7]] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(h6);
    		}
    	};
    }

    // (212:0) {#if buttonsFirst }
    function create_if_block_10(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block2_anchor;
    	let if_block0 = /*cancel*/ ctx[11].enabled && create_if_block_13(ctx);
    	let if_block1 = /*submit*/ ctx[10].enabled && create_if_block_12(ctx);
    	let if_block2 = /*formErrors*/ ctx[12].length > 0 && create_if_block_11(ctx);

    	return {
    		c() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr(div, "class", "buttons is-grouped is-centered");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			insert(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, if_block2_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (/*cancel*/ ctx[11].enabled) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_13(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*submit*/ ctx[10].enabled) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_12(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*formErrors*/ ctx[12].length > 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_11(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach(if_block2_anchor);
    		}
    	};
    }

    // (214:1) {#if cancel.enabled}
    function create_if_block_13(ctx) {
    	let button;
    	let t_value = /*$LOCALE*/ ctx[15][/*cancel*/ ctx[11].caption] + "";
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t = text(t_value);
    			attr(button, "class", button_class_value = "button is-outlined " + /*cancel*/ ctx[11].classes);
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", /*rejectForm*/ ctx[18]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*$LOCALE, cancel*/ 34816 && t_value !== (t_value = /*$LOCALE*/ ctx[15][/*cancel*/ ctx[11].caption] + "")) set_data(t, t_value);

    			if (dirty[0] & /*cancel*/ 2048 && button_class_value !== (button_class_value = "button is-outlined " + /*cancel*/ ctx[11].classes)) {
    				attr(button, "class", button_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (217:1) {#if submit.enabled}
    function create_if_block_12(ctx) {
    	let button;
    	let t_value = /*$LOCALE*/ ctx[15][/*submit*/ ctx[10].caption] + "";
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t = text(t_value);
    			button.disabled = /*formInvalid*/ ctx[14];
    			attr(button, "class", button_class_value = "button is-primary is-hovered " + /*submit*/ ctx[10].classes);
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", /*submitForm*/ ctx[17]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*$LOCALE, submit*/ 33792 && t_value !== (t_value = /*$LOCALE*/ ctx[15][/*submit*/ ctx[10].caption] + "")) set_data(t, t_value);

    			if (dirty[0] & /*formInvalid*/ 16384) {
    				button.disabled = /*formInvalid*/ ctx[14];
    			}

    			if (dirty[0] & /*submit*/ 1024 && button_class_value !== (button_class_value = "button is-primary is-hovered " + /*submit*/ ctx[10].classes)) {
    				attr(button, "class", button_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (222:0) {#if formErrors.length > 0 }
    function create_if_block_11(ctx) {
    	let div;
    	let t_value = /*formErrors*/ ctx[12].join(', ') + "";
    	let t;

    	return {
    		c() {
    			div = element("div");
    			t = text(t_value);
    			attr(div, "class", "edit-form-error notification is-danger");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*formErrors*/ 4096 && t_value !== (t_value = /*formErrors*/ ctx[12].join(', ') + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (248:0) {:else}
    function create_else_block_2(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*field*/ ctx[37] + "";
    	let t1;
    	let t2;

    	return {
    		c() {
    			div = element("div");
    			t0 = text("Field '");
    			t1 = text(t1_value);
    			t2 = text("' is not registered");
    			attr(div, "class", "notification is-danger");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t0);
    			append(div, t1);
    			append(div, t2);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*fields*/ 8 && t1_value !== (t1_value = /*field*/ ctx[37] + "")) set_data(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (244:0) {#if form[field] && form[field].component }
    function create_if_block_8(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*form*/ ctx[0][/*field*/ ctx[37]].visible && create_if_block_9(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*form*/ ctx[0][/*field*/ ctx[37]].visible) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*form, fields*/ 9) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (229:0) {#if Array.isArray(field) }
    function create_if_block_5$2(ctx) {
    	let div;
    	let current;
    	let each_value_1 = /*field*/ ctx[37];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", "columns");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*form, fields, horizontal, onFieldChange*/ 66057) {
    				each_value_1 = /*field*/ ctx[37];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (245:0) {#if form[field].visible}
    function create_if_block_9(ctx) {
    	let uifield;
    	let current;

    	uifield = new Field({
    			props: {
    				controls: [/*form*/ ctx[0][/*field*/ ctx[37]]],
    				name: /*field*/ ctx[37],
    				horizontal: /*horizontal*/ ctx[9],
    				label: /*form*/ ctx[0][/*field*/ ctx[37]].label
    			}
    		});

    	uifield.$on("change", /*onFieldChange*/ ctx[16]);

    	return {
    		c() {
    			create_component(uifield.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uifield, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uifield_changes = {};
    			if (dirty[0] & /*form, fields*/ 9) uifield_changes.controls = [/*form*/ ctx[0][/*field*/ ctx[37]]];
    			if (dirty[0] & /*fields*/ 8) uifield_changes.name = /*field*/ ctx[37];
    			if (dirty[0] & /*horizontal*/ 512) uifield_changes.horizontal = /*horizontal*/ ctx[9];
    			if (dirty[0] & /*form, fields*/ 9) uifield_changes.label = /*form*/ ctx[0][/*field*/ ctx[37]].label;
    			uifield.$set(uifield_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uifield.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uifield.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uifield, detaching);
    		}
    	};
    }

    // (238:1) {:else}
    function create_else_block_1$1(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*subfield*/ ctx[40] + "";
    	let t1;
    	let t2;

    	return {
    		c() {
    			div = element("div");
    			t0 = text("Subfield '");
    			t1 = text(t1_value);
    			t2 = text("' is not registered");
    			attr(div, "class", "column notification is-danger");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t0);
    			append(div, t1);
    			append(div, t2);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*fields*/ 8 && t1_value !== (t1_value = /*subfield*/ ctx[40] + "")) set_data(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (232:1) {#if form[subfield] && form[subfield].component }
    function create_if_block_6(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*form*/ ctx[0][/*subfield*/ ctx[40]].visible && create_if_block_7(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*form*/ ctx[0][/*subfield*/ ctx[40]].visible) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*form, fields*/ 9) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (233:1) {#if form[subfield].visible }
    function create_if_block_7(ctx) {
    	let div;
    	let uifield;
    	let div_class_value;
    	let current;

    	uifield = new Field({
    			props: {
    				controls: [/*form*/ ctx[0][/*subfield*/ ctx[40]]],
    				name: /*subfield*/ ctx[40],
    				horizontal: /*horizontal*/ ctx[9],
    				label: /*form*/ ctx[0][/*subfield*/ ctx[40]].label
    			}
    		});

    	uifield.$on("change", /*onFieldChange*/ ctx[16]);

    	return {
    		c() {
    			div = element("div");
    			create_component(uifield.$$.fragment);

    			attr(div, "class", div_class_value = "column " + (/*form*/ ctx[0][/*subfield*/ ctx[40]].fieldSize
    			? 'is-' + /*form*/ ctx[0][/*subfield*/ ctx[40]].fieldSize
    			: '') + "");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(uifield, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uifield_changes = {};
    			if (dirty[0] & /*form, fields*/ 9) uifield_changes.controls = [/*form*/ ctx[0][/*subfield*/ ctx[40]]];
    			if (dirty[0] & /*fields*/ 8) uifield_changes.name = /*subfield*/ ctx[40];
    			if (dirty[0] & /*horizontal*/ 512) uifield_changes.horizontal = /*horizontal*/ ctx[9];
    			if (dirty[0] & /*form, fields*/ 9) uifield_changes.label = /*form*/ ctx[0][/*subfield*/ ctx[40]].label;
    			uifield.$set(uifield_changes);

    			if (!current || dirty[0] & /*form, fields*/ 9 && div_class_value !== (div_class_value = "column " + (/*form*/ ctx[0][/*subfield*/ ctx[40]].fieldSize
    			? 'is-' + /*form*/ ctx[0][/*subfield*/ ctx[40]].fieldSize
    			: '') + "")) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uifield.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uifield.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(uifield);
    		}
    	};
    }

    // (231:1) {#each field as subfield }
    function create_each_block_1$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_6, create_else_block_1$1];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*form*/ ctx[0][/*subfield*/ ctx[40]] && /*form*/ ctx[0][/*subfield*/ ctx[40]].component) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (228:0) {#each fields as field}
    function create_each_block$5(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_5$2, create_if_block_8, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (dirty[0] & /*fields*/ 8) show_if = null;
    		if (show_if == null) show_if = !!Array.isArray(/*field*/ ctx[37]);
    		if (show_if) return 0;
    		if (/*form*/ ctx[0][/*field*/ ctx[37]] && /*form*/ ctx[0][/*field*/ ctx[37]].component) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_1(ctx, [-1, -1]);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (254:0) {#if !buttonsFirst }
    function create_if_block_1$9(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let if_block0 = /*formErrors*/ ctx[12].length > 0 && create_if_block_4$3(ctx);
    	let if_block1 = /*cancel*/ ctx[11].enabled && create_if_block_3$5(ctx);
    	let if_block2 = /*submit*/ ctx[10].enabled && create_if_block_2$5(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr(div, "class", "buttons is-grouped is-centered");
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			if (if_block1) if_block1.m(div, null);
    			append(div, t1);
    			if (if_block2) if_block2.m(div, null);
    		},
    		p(ctx, dirty) {
    			if (/*formErrors*/ ctx[12].length > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$3(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cancel*/ ctx[11].enabled) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3$5(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*submit*/ ctx[10].enabled) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2$5(ctx);
    					if_block2.c();
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(div);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};
    }

    // (255:0) {#if formErrors.length > 0 }
    function create_if_block_4$3(ctx) {
    	let div;
    	let t_value = /*formErrors*/ ctx[12].join(', ') + "";
    	let t;

    	return {
    		c() {
    			div = element("div");
    			t = text(t_value);
    			attr(div, "class", "edit-form-error notification is-danger");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*formErrors*/ 4096 && t_value !== (t_value = /*formErrors*/ ctx[12].join(', ') + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (259:1) {#if cancel.enabled}
    function create_if_block_3$5(ctx) {
    	let button;
    	let t_value = /*$LOCALE*/ ctx[15][/*cancel*/ ctx[11].caption] + "";
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t = text(t_value);
    			attr(button, "class", button_class_value = "button is-outlined " + /*cancel*/ ctx[11].classes);
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", /*rejectForm*/ ctx[18]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*$LOCALE, cancel*/ 34816 && t_value !== (t_value = /*$LOCALE*/ ctx[15][/*cancel*/ ctx[11].caption] + "")) set_data(t, t_value);

    			if (dirty[0] & /*cancel*/ 2048 && button_class_value !== (button_class_value = "button is-outlined " + /*cancel*/ ctx[11].classes)) {
    				attr(button, "class", button_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (262:1) {#if submit.enabled}
    function create_if_block_2$5(ctx) {
    	let button;
    	let t_value = /*$LOCALE*/ ctx[15][/*submit*/ ctx[10].caption] + "";
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t = text(t_value);
    			button.disabled = /*formInvalid*/ ctx[14];
    			attr(button, "class", button_class_value = "button is-primary is-hovered " + /*submit*/ ctx[10].classes);
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", /*submitForm*/ ctx[17]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*$LOCALE, submit*/ 33792 && t_value !== (t_value = /*$LOCALE*/ ctx[15][/*submit*/ ctx[10].caption] + "")) set_data(t, t_value);

    			if (dirty[0] & /*formInvalid*/ 16384) {
    				button.disabled = /*formInvalid*/ ctx[14];
    			}

    			if (dirty[0] & /*submit*/ 1024 && button_class_value !== (button_class_value = "button is-primary is-hovered " + /*submit*/ ctx[10].classes)) {
    				attr(button, "class", button_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$e(ctx) {
    	let div;
    	let t;
    	let current_block_type_index;
    	let if_block1;
    	let current;
    	let if_block0 = /*loader*/ ctx[2] !== 'hidden' && create_if_block_16(ctx);
    	const if_block_creators = [create_if_block$a, create_else_block$8];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*success*/ ctx[13]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if_block1.c();
    			attr(div, "class", "form-container");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*loader*/ ctx[2] !== 'hidden') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_16(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div, null);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();
    			if_blocks[current_block_type_index].d();
    		}
    	};
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let formInvalid;
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(15, $LOCALE = $$value));
    	let dispatch = createEventDispatcher();

    	//validation status
    	let formErrors = [];

    	let formHasErrors = false;
    	let fieldsHasErrors = false;
    	let success = false;
    	let { form = {} } = $$props;
    	let { loading = false } = $$props;
    	let { loader = 'container' } = $$props;
    	let { fields = [] } = $$props;
    	let { SUCCESS_TEXT = 'Операция завершена' } = $$props;
    	let { WAITING_TEXT = 'Отправка данных на сервер' } = $$props;
    	let { title = 'Форма' } = $$props;
    	let { description = 'Заполните пожалуйста форму' } = $$props;
    	let { buttonsFirst = false } = $$props;
    	let { horizontal = false } = $$props;
    	let { submit = { caption: 'Отправить', enabled: true } } = $$props;
    	let { cancel = { caption: 'Назад', enabled: true } } = $$props;

    	function collectData() {
    		return FormHelpers.collectData(fields, form);
    	}

    	function setFieldInvalid(fieldName, value, errors) {
    		$$invalidate(0, form = FormHelpers.setFieldInvalid(form, fieldName, value, errors));
    		$$invalidate(35, fieldsHasErrors = true);
    	}

    	function setFieldValid(fieldName, value) {
    		$$invalidate(0, form = FormHelpers.setFieldValid(form, fieldName, value));

    		if (fieldsHasErrors !== some) {
    			$$invalidate(35, fieldsHasErrors = some);
    		}
    	}

    	function isFieldValid(fieldName) {
    		return FormHelpers.isFieldValid(form, fieldName);
    	}

    	function setFormFieldInvalid(fieldName, errors) {
    		$$invalidate(0, form = FormHelpers.setFormFieldInvalid(form, fieldName, errors));
    		dispatch(`field.invalid`, { fieldName });
    	}

    	function setFormFieldValid(fieldName) {
    		$$invalidate(0, form = FormHelpers.setFormFieldValid(form, fieldName));
    		dispatch(`field.valid`, { fieldName });
    	}

    	function updateFormValidationStatus(validationStatus) {
    		$$invalidate(34, formHasErrors = false); /* FormValidationSession.getCompleteResult() */
    		$$invalidate(35, fieldsHasErrors = false);

    		if (Array.isArray(validationStatus.form) && validationStatus.form.length) {
    			formErrors.splice(0, formErrors.length, ...validationStatus.form);
    			$$invalidate(34, formHasErrors = true);
    		} else {
    			formErrors.splice(0, formErrors.length);
    		}

    		$$invalidate(12, formErrors);

    		if (validationStatus.fields) {
    			for (let fieldName of Object.keys(form)) {
    				if (Array.isArray(validationStatus.fields[fieldName]) && validationStatus.fields[fieldName].length) {
    					FormHelpers.setFormFieldInvalid(form, fieldName, validationStatus.fields[fieldName]);
    					$$invalidate(35, fieldsHasErrors = true);
    				} else {
    					FormHelpers.setFormFieldValid(form, fieldName);
    				}
    			}
    		}
    	}

    	function showSuccess() {
    		$$invalidate(13, success = true);
    	}

    	function setLoading() {
    		$$invalidate(1, loading = true);
    	}

    	function resetLoading() {
    		$$invalidate(1, loading = false);
    	}

    	function setFieldsVisibility(fieldsList, val) {
    		if (FormHelpers.setFieldsVisibility(form, fieldsList, val)) {
    			$$invalidate(0, form);
    		}
    	}

    	function setVisibleFields(fieldsList) {
    		setFieldsVisibility(fieldsList, true);
    	}

    	function setInvisibleFields(fieldsList) {
    		setFieldsVisibility(fieldsList, false);
    	}

    	function setFieldValue(fieldName, value) {
    		if (FormHelpers.setFieldValue(form, fieldName, value)) {
    			onFieldChange({ detail: { field: fieldName, value } });
    		}
    	}

    	function updateField(fieldName, props) {
    		$$invalidate(0, form[fieldName] = { ...form[fieldName], ...props }, form);
    		$$invalidate(0, form);
    	}

    	function onFieldChange(ev) {
    		let data = ev.detail;
    		$$invalidate(0, form[data.field].value = data.value, form);
    		$$invalidate(0, form);
    		dispatch('change', data);
    	}

    	function submitForm(e) {
    		e && e.preventDefault();
    		dispatch('submit', collectData());
    		return false;
    	}

    	function rejectForm() {
    		dispatch('reject');
    	}

    	$$self.$$set = $$props => {
    		if ('form' in $$props) $$invalidate(0, form = $$props.form);
    		if ('loading' in $$props) $$invalidate(1, loading = $$props.loading);
    		if ('loader' in $$props) $$invalidate(2, loader = $$props.loader);
    		if ('fields' in $$props) $$invalidate(3, fields = $$props.fields);
    		if ('SUCCESS_TEXT' in $$props) $$invalidate(4, SUCCESS_TEXT = $$props.SUCCESS_TEXT);
    		if ('WAITING_TEXT' in $$props) $$invalidate(5, WAITING_TEXT = $$props.WAITING_TEXT);
    		if ('title' in $$props) $$invalidate(6, title = $$props.title);
    		if ('description' in $$props) $$invalidate(7, description = $$props.description);
    		if ('buttonsFirst' in $$props) $$invalidate(8, buttonsFirst = $$props.buttonsFirst);
    		if ('horizontal' in $$props) $$invalidate(9, horizontal = $$props.horizontal);
    		if ('submit' in $$props) $$invalidate(10, submit = $$props.submit);
    		if ('cancel' in $$props) $$invalidate(11, cancel = $$props.cancel);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[1] & /*formHasErrors, fieldsHasErrors*/ 24) {
    			$$invalidate(14, formInvalid = formHasErrors || fieldsHasErrors);
    		}
    	};

    	return [
    		form,
    		loading,
    		loader,
    		fields,
    		SUCCESS_TEXT,
    		WAITING_TEXT,
    		title,
    		description,
    		buttonsFirst,
    		horizontal,
    		submit,
    		cancel,
    		formErrors,
    		success,
    		formInvalid,
    		$LOCALE,
    		onFieldChange,
    		submitForm,
    		rejectForm,
    		collectData,
    		setFieldInvalid,
    		setFieldValid,
    		isFieldValid,
    		setFormFieldInvalid,
    		setFormFieldValid,
    		updateFormValidationStatus,
    		showSuccess,
    		setLoading,
    		resetLoading,
    		setFieldsVisibility,
    		setVisibleFields,
    		setInvisibleFields,
    		setFieldValue,
    		updateField,
    		formHasErrors,
    		fieldsHasErrors
    	];
    }

    class Form extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$e,
    			create_fragment$e,
    			safe_not_equal,
    			{
    				form: 0,
    				loading: 1,
    				loader: 2,
    				fields: 3,
    				SUCCESS_TEXT: 4,
    				WAITING_TEXT: 5,
    				title: 6,
    				description: 7,
    				buttonsFirst: 8,
    				horizontal: 9,
    				submit: 10,
    				cancel: 11,
    				collectData: 19,
    				setFieldInvalid: 20,
    				setFieldValid: 21,
    				isFieldValid: 22,
    				setFormFieldInvalid: 23,
    				setFormFieldValid: 24,
    				updateFormValidationStatus: 25,
    				showSuccess: 26,
    				setLoading: 27,
    				resetLoading: 28,
    				setFieldsVisibility: 29,
    				setVisibleFields: 30,
    				setInvisibleFields: 31,
    				setFieldValue: 32,
    				updateField: 33
    			},
    			null,
    			[-1, -1]
    		);
    	}

    	get collectData() {
    		return this.$$.ctx[19];
    	}

    	get setFieldInvalid() {
    		return this.$$.ctx[20];
    	}

    	get setFieldValid() {
    		return this.$$.ctx[21];
    	}

    	get isFieldValid() {
    		return this.$$.ctx[22];
    	}

    	get setFormFieldInvalid() {
    		return this.$$.ctx[23];
    	}

    	get setFormFieldValid() {
    		return this.$$.ctx[24];
    	}

    	get updateFormValidationStatus() {
    		return this.$$.ctx[25];
    	}

    	get showSuccess() {
    		return this.$$.ctx[26];
    	}

    	get setLoading() {
    		return this.$$.ctx[27];
    	}

    	get resetLoading() {
    		return this.$$.ctx[28];
    	}

    	get setFieldsVisibility() {
    		return this.$$.ctx[29];
    	}

    	get setVisibleFields() {
    		return this.$$.ctx[30];
    	}

    	get setInvisibleFields() {
    		return this.$$.ctx[31];
    	}

    	get setFieldValue() {
    		return this.$$.ctx[32];
    	}

    	get updateField() {
    		return this.$$.ctx[33];
    	}
    }

    const DEFAULT_STATUS_SUCCESS = 'ok';

    const DEFAULT_CONTAINER_SELECTOR$1 = '.form';
    const DEFAULT_ACTION_NAME = 'default';

    var _uiComponent = /*#__PURE__*/new WeakMap();

    var _validationRunner = /*#__PURE__*/new WeakMap();

    var _form$1 = /*#__PURE__*/new WeakMap();

    var _action = /*#__PURE__*/new WeakMap();

    var _fields = /*#__PURE__*/new WeakMap();

    var _variants = /*#__PURE__*/new WeakMap();

    var _bindUIEvents = /*#__PURE__*/new WeakSet();

    var _getFormProps = /*#__PURE__*/new WeakSet();

    var _missingOverrideWarning = /*#__PURE__*/new WeakSet();

    class notForm extends notBase {
      //UI renderer component class constructor
      //form validation
      //ui component
      //model.action
      //fields schemas
      //fields of UI
      //variants sets for select menus and so on
      //variants for UI
      constructor(_ref) {
        let {
          target = null,
          name = 'Default',
          options = {},
          working = {},
          data: _data = {},
          ui = Form //default UI

        } = _ref;
        super({
          working: {
            name: `${name}Form`,
            ...working
          },
          options,
          data: _data
        });

        _classPrivateMethodInitSpec(this, _missingOverrideWarning);

        _classPrivateMethodInitSpec(this, _getFormProps);

        _classPrivateMethodInitSpec(this, _bindUIEvents);

        _classPrivateFieldInitSpec(this, _uiComponent, {
          writable: true,
          value: null
        });

        _classPrivateFieldInitSpec(this, _validationRunner, {
          writable: true,
          value: null
        });

        _classPrivateFieldInitSpec(this, _form$1, {
          writable: true,
          value: null
        });

        _classPrivateFieldInitSpec(this, _action, {
          writable: true,
          value: DEFAULT_ACTION_NAME
        });

        _classPrivateFieldInitSpec(this, _fields, {
          writable: true,
          value: new Lib()
        });

        _classPrivateFieldInitSpec(this, _variants, {
          writable: true,
          value: null
        });

        _classPrivateFieldSet(this, _variants, new Lib(VARIANTS$1.getContent()));

        if (target) {
          this.setOptions('target', target);
        }

        _classPrivateFieldSet(this, _uiComponent, ui);

        if (notCommon$2.objHas(options, 'action')) {
          _classPrivateFieldSet(this, _action, options.action);
        }

        this.initForm();
      }

      initForm() {
        if (this.getOptions('autoInit', true)) {
          this.initLibs();
        }

        if (this.getOptions('autoRender', true)) {
          this.initUI();
        }
      }

      initLibs() {
        this.initFields();
        this.initVariants();
        this.initValidator();
      }

      reInit() {
        this.initLibs();
        this.updateUI();
        this.resetLoading();
      }

      initFields() {
        const manifest = this.getFormManifest();

        if (notCommon$2.objHas(manifest, 'fields') && _classPrivateFieldGet(this, _fields).isEmpty()) {
          _classPrivateFieldGet(this, _fields).import(manifest.fields); //all fields available in model manifest

        }
      }

      initVariants() {
        if (this.getOptions('variants')) {
          _classPrivateFieldGet(this, _variants).import(this.getOptions('variants'));
        }
      } //creating validators runner for this specific form


      initValidator() {
        _classPrivateFieldSet(this, _validationRunner, src_3(this.getFormValidators()));
      }

      initUI() {
        try {
          const props = _classPrivateMethodGet(this, _getFormProps, _getFormProps2).call(this, {
            manifest: this.getFormManifest(),
            formOptions: this.getFormOptions(),
            data: this.getFormData()
          });

          const target = this.getFormTargetEl();

          _classPrivateFieldSet(this, _form$1, new (_classPrivateFieldGet(this, _uiComponent))({
            target,
            props
          }));

          _classPrivateMethodGet(this, _bindUIEvents, _bindUIEvents2).call(this);

          this.validateForm();
        } catch (e) {
          this.error(e);
        }
      }

      updateUI() {
        try {
          const props = _classPrivateMethodGet(this, _getFormProps, _getFormProps2).call(this, {
            manifest: this.getFormManifest(),
            formOptions: this.getFormOptions(),
            data: this.getFormData()
          });

          _classPrivateFieldGet(this, _form$1).$set(props);

          this.validateForm();
        } catch (e) {
          this.error(e);
        }
      }

      async validateForm() {
        try {
          const validationResult = await _classPrivateFieldGet(this, _validationRunner).call(this, _classPrivateFieldGet(this, _form$1).collectData(), this.getFormAction());

          _classPrivateFieldGet(this, _form$1).updateFormValidationStatus(validationResult.getReport());

          if (!validationResult.clean) {
            this.emit('error', validationResult.getReport());
          }
        } catch (e) {
          const report = {
            form: [UICommon.ERROR_DEFAULT, e.message]
          };
          _classPrivateFieldGet(this, _form$1) && _classPrivateFieldGet(this, _form$1).updateFormValidationStatus(report);
          this.emit('error', report);
          notCommon$2.report(e);
        }
      }

      submit(data) {
        this.emit('submit', data);
      }

      reject() {
        this.emit('reject');
      }

      setLoading() {
        this.emit('loading');

        _classPrivateFieldGet(this, _form$1).setLoading();
      }

      resetLoading() {
        this.emit('loaded');

        _classPrivateFieldGet(this, _form$1).resetLoading();
      }

      destroy() {
        this.emit('destroy');

        _classPrivateFieldSet(this, _form$1, null);

        _classPrivateFieldSet(this, _validationRunner, null);

        _classPrivateFieldSet(this, _action, null);

        _classPrivateFieldSet(this, _fields, null);

        _classPrivateFieldSet(this, _variants, null);

        this.setOptions(null);
        this.setWorking(null);
        this.setData(null);
      }

      getName() {
        return this.getWorking('name');
      }

      getFormAction() {
        return _classPrivateFieldGet(this, _action);
      }

      setFormAction(val) {
        if (val && val !== _classPrivateFieldGet(this, _action)) {
          _classPrivateFieldSet(this, _action, val);

          _classPrivateFieldGet(this, _form$1) && _classPrivateFieldGet(this, _form$1).$destroy();
          this.initForm();
        }
      }

      processResult(result) {
        if (result.status === DEFAULT_STATUS_SUCCESS) {
          this.setFormSuccess();
          return true;
        } else {
          this.setFormErrors(result);
          return false;
        }
      }
      /**
       *   Form validation result
       **/


      setFormSuccess() {
        _classPrivateFieldGet(this, _form$1).showSuccess();

        this.emit('success');
      }

      setFormErrors(result) {
        const status = {
          form: [],
          fields: {}
        };

        if (result.message) {
          status.form.push(result.message);
        }

        if (result.errors && Object.keys(result.errors).length > 0) {
          status.fields = { ...result.errors
          };
        }

        _classPrivateFieldGet(this, _form$1).updateFormValidationStatus(status);

        this.emit('error', status);
      }
      /**
       * Returns variant by collection name and item id
       * @param {string}         name  name of the variants collection
       * @param {string|number}  id    item identificator
       * @returns {object}             item
       **/


      getVariant(name, id) {
        let lib = _classPrivateFieldGet(this, _variants).get(name);

        let result = lib.find(function (item) {
          return item.id === id;
        });

        if (result) {
          return result;
        }

        return null;
      }
      /***
       * Redefinable getters
       **/


      getFormTargetEl() {
        const targetEl = this.getOptions('target', DEFAULT_CONTAINER_SELECTOR$1);

        if (targetEl instanceof HTMLElement) {
          return targetEl;
        } else if (typeof targetEl === 'string') {
          return document.querySelector(targetEl);
        } else {
          throw new Error('Form parent element is not defined');
        }
      }

      getFormValidators() {
        if (this.getOptions('validators')) {
          return this.getOptions('validators', {});
        } else {
          _classPrivateMethodGet(this, _missingOverrideWarning, _missingOverrideWarning2).call(this, 'validators');

          return {};
        }
      }

      getFormManifest() {
        const modelName = this.getModelName();

        if (modelName && notCommon$2.getApp()) {
          return notCommon$2.getApp().getInterfaceManifest(modelName);
        }

        if (this.getOptions('manifest', undefined)) {
          return this.getOptions('manifest', {});
        } else {
          _classPrivateMethodGet(this, _missingOverrideWarning, _missingOverrideWarning2).call(this, 'manifest');

          return {};
        }
      }

      getFormData() {
        if (this.getData()) {
          return this.getData();
        } else {
          _classPrivateMethodGet(this, _missingOverrideWarning, _missingOverrideWarning2).call(this, 'data');

          return {};
        }
      }

      getFormOptions() {
        if (this.getOptions('ui', undefined) || this.getOptions('fields', undefined)) {
          return {
            ui: this.getOptions('ui', {}),
            fields: this.getOptions('fields', {})
          };
        } else {
          _classPrivateMethodGet(this, _missingOverrideWarning, _missingOverrideWarning2).call(this, 'options');

          return {
            ui: {},
            fields: {}
          };
        }
      }
      /**
       * Override empty message
       **/


      /**
       * Form operations
       **/
      collectData() {
        const data = _classPrivateFieldGet(this, _form$1).collectData();

        this.setData({ ...data
        }); //update in inner store

        return data;
      }

      updateField(fieldName, props) {
        _classPrivateFieldGet(this, _form$1).updateField(fieldName, props);
      }

      getModel(name, data) {
        if (typeof name === 'string') {
          return this.getInterface(name)(data || {});
        } else {
          return this.getInterface()(name || {});
        }
      }

      getInterface() {
        let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        return notCommon$2.getApp().getInterface(name || this.getModelName());
      }
      /**
       *  Returns current model name
       *  @return {string}
       */


      getModelName() {
        return this.getOptions('model');
      }

    }

    function _bindUIEvents2() {
      var _this = this;

      _classPrivateFieldGet(this, _form$1).$on('change', function () {
        return _this.validateForm();
      });

      _classPrivateFieldGet(this, _form$1).$on('change', function (ev) {
        _this.emit('change', ev.detail);

        _this.emit(`change.${ev.detail.field}`, ev.detail.value);
      });

      _classPrivateFieldGet(this, _form$1).$on('submit', function (ev) {
        return _this.submit(ev.detail);
      });

      _classPrivateFieldGet(this, _form$1).$on('reject', function () {
        return _this.reject();
      });

      _classPrivateFieldGet(this, _form$1).$on('error', function (_ref2) {
        let {
          detail
        } = _ref2;
        return _this.emit('error', detail);
      });
    }

    function _getFormProps2(_ref3) {
      let {
        manifest,
        //model manifest
        formOptions = {
          ui: {},
          fields: {}
        },
        //some options
        data = null //initial data for form

      } = _ref3;

      const action = _classPrivateFieldGet(this, _action);

      if (typeof formOptions === 'undefined' || formOptions === null) {
        formOptions = {
          ui: {},
          fields: {}
        };
      }

      const form = FormHelpers.initFormByField( //form seed object
      {},
      /*
      Form structure
      [
        //each item is line of form
        //field - field takes whole line of form
        //[field1, field2] - few fields in one line
        nameFirst, nameLast
        [age, country, language],
        [email, telephone]
      ]
      */
      manifest.actions[action].fields, //form fields structure
      _classPrivateFieldGet(this, _variants), //variants library
      _classPrivateFieldGet(this, _fields), //fields library
      formOptions.fields, //form wide fields options
      data);
      return {
        //if no auto init of form structure, set to loading state
        loading: !this.getOptions('autoInit', true),
        title: manifest.actions[action].title,
        description: manifest.actions[action].description,
        fields: manifest.actions[action].fields,
        form,
        //injecting options to UI from top level input
        ...formOptions.ui //form UI options

      };
    }

    function _missingOverrideWarning2(missing) {
      this.error(`${missing} for ${this.getWorking('name')} form is not defined`);
    }

    /* src/frame/components/form/form.set.svelte generated by Svelte v3.46.6 */

    function create_if_block$9(ctx) {
    	let uibuttons;
    	let updating_values;
    	let current;

    	function uibuttons_values_binding(value) {
    		/*uibuttons_values_binding*/ ctx[5](value);
    	}

    	let uibuttons_props = { centered: true, classes: "mt-4" };

    	if (/*FORMS_BUTTONS*/ ctx[2] !== void 0) {
    		uibuttons_props.values = /*FORMS_BUTTONS*/ ctx[2];
    	}

    	uibuttons = new Ui_buttons({ props: uibuttons_props });
    	binding_callbacks.push(() => bind(uibuttons, 'values', uibuttons_values_binding));

    	return {
    		c() {
    			create_component(uibuttons.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uibuttons, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uibuttons_changes = {};

    			if (!updating_values && dirty & /*FORMS_BUTTONS*/ 4) {
    				updating_values = true;
    				uibuttons_changes.values = /*FORMS_BUTTONS*/ ctx[2];
    				add_flush_callback(() => updating_values = false);
    			}

    			uibuttons.$set(uibuttons_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uibuttons.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uibuttons.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uibuttons, detaching);
    		}
    	};
    }

    function create_fragment$d(ctx) {
    	let div1;
    	let div0;
    	let div0_id_value;
    	let t;
    	let div1_id_value;
    	let current;
    	let if_block = /*showModes*/ ctx[1] && create_if_block$9(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			if (if_block) if_block.c();
    			attr(div0, "class", "form-paper");
    			attr(div0, "id", div0_id_value = "" + (/*name*/ ctx[0] + "-form-set-container"));
    			attr(div1, "class", "block-container");
    			attr(div1, "id", div1_id_value = "" + (/*name*/ ctx[0] + "-form-set"));
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div1, t);
    			if (if_block) if_block.m(div1, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1 && div0_id_value !== (div0_id_value = "" + (/*name*/ ctx[0] + "-form-set-container"))) {
    				attr(div0, "id", div0_id_value);
    			}

    			if (/*showModes*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showModes*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*name*/ 1 && div1_id_value !== (div1_id_value = "" + (/*name*/ ctx[0] + "-form-set"))) {
    				attr(div1, "id", div1_id_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block) if_block.d();
    		}
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let { name = 'default-form' } = $$props;
    	let { showModes = false } = $$props;
    	let { mode = 'default' } = $$props;
    	let { forms = [] } = $$props;

    	function setMode(val) {
    		$$invalidate(3, mode = val);
    		dispatch('mode', val);
    		updateModesButtons();
    	}

    	let FORMS_BUTTONS = [];

    	function updateModesButtons() {
    		$$invalidate(2, FORMS_BUTTONS = forms.filter(form => {
    			return mode !== form.mode;
    		}).map(form => {
    			return {
    				title: form.title,
    				outlined: true,
    				type: 'link',
    				action() {
    					setMode(form.mode);
    				}
    			};
    		}));
    	}

    	onMount(() => {
    		updateModesButtons();
    	});

    	function uibuttons_values_binding(value) {
    		FORMS_BUTTONS = value;
    		$$invalidate(2, FORMS_BUTTONS);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('showModes' in $$props) $$invalidate(1, showModes = $$props.showModes);
    		if ('mode' in $$props) $$invalidate(3, mode = $$props.mode);
    		if ('forms' in $$props) $$invalidate(4, forms = $$props.forms);
    	};

    	return [name, showModes, FORMS_BUTTONS, mode, forms, uibuttons_values_binding];
    }

    class Form_set extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { name: 0, showModes: 1, mode: 3, forms: 4 });
    	}
    }

    const DEFAULT_CONTAINER_SELECTOR = '.form-set';
    const DEFAULT_FORM_SET_NAME = 'form-set';

    var _formSetComponent = /*#__PURE__*/new WeakMap();

    var _formComponent = /*#__PURE__*/new WeakMap();

    var _form = /*#__PURE__*/new WeakMap();

    var _frame = /*#__PURE__*/new WeakMap();

    var _getFrameProps = /*#__PURE__*/new WeakSet();

    class notFormSet extends notBase {
      /*
      new notFormSet({
        options:{
          target: el,
          forms: [{
            mode: 'form1',
            title: 'Form 1',
            form: formConstructor1 //custom constructors
          },{
            mode: 'form2',
            title: 'Form 2',
            props: {}             //params to create notForm instance
          },{
            mode: 'form3',
            title: 'Form 3',
            form: formConstructor3 //custom constructors
          }]
        }
      });
      */
      constructor(_ref) {
        let {
          options = {},
          formComponent = Form,
          formSetComponent = Form_set
        } = _ref;
        super({
          options: {
            name: DEFAULT_FORM_SET_NAME,
            mode: 'default',
            showModes: true,
            ...options
          }
        });

        _classPrivateMethodInitSpec(this, _getFrameProps);

        _classPrivateFieldInitSpec(this, _formSetComponent, {
          writable: true,
          value: null
        });

        _classPrivateFieldInitSpec(this, _formComponent, {
          writable: true,
          value: null
        });

        _classPrivateFieldInitSpec(this, _form, {
          writable: true,
          value: null
        });

        _classPrivateFieldInitSpec(this, _frame, {
          writable: true,
          value: null
        });

        _classPrivateFieldSet(this, _formComponent, Form);

        _classPrivateFieldSet(this, _formSetComponent, Form_set);

        this.setFormMode(this.getOptions('mode'));
        this.initUI();
      }
      /**
       * Initalizing form frame mode, with switchers between modes
       **/


      initUI() {
        var _this = this;

        const target = this.getFrameTargetEl();

        _classPrivateFieldSet(this, _frame, new (_classPrivateFieldGet(this, _formSetComponent))({
          target,
          props: _classPrivateMethodGet(this, _getFrameProps, _getFrameProps2).call(this)
        }));

        _classPrivateFieldGet(this, _frame).$on('mode', function (ev) {
          _this.setFormMode(ev.detail);

          _this.updateForm();
        });

        this.updateForm();
      }

      setFormMode(name) {
        if (this.isModeExists(name)) {
          this.setWorking('mode', name);
        } else {
          this.setWorking('mode', this.getFirstMode());
          this.updateFormModeInUI();
        }
      }

      updateFormModeInUI() {
        if (_classPrivateFieldGet(this, _frame) && this.getWorking('mode') !== null) {
          _classPrivateFieldGet(this, _frame).$set({
            mode: this.getWorking('mode')
          });
        }
      }

      getFormMode() {
        return this.getWorking('mode');
      }

      updateForm() {
        this.destroyForm();

        if (this.getWorking('mode') !== null) {
          this.renderForm();
        }
      }

      renderForm() {
        const targetEl = this.getFormTargetEl();
        const formConfig = this.getFormConfig();

        if (!(targetEl instanceof HTMLElement && formConfig)) {
          throw new Error('error while form rendering');
        }

        if (formConfig.form) {
          _classPrivateFieldSet(this, _form, new formConfig.form({
            options: {
              target: targetEl
            }
          }));
        } else if (formConfig.props) {
          _classPrivateFieldSet(this, _form, new (_classPrivateFieldGet(this, _formComponent))({
            target: targetEl,
            ...formConfig.props
          }));
        }
      }

      getFormConfig() {
        var _this2 = this;

        return this.getOptions('forms').find(function (form) {
          return form.mode === _this2.getFormMode();
        });
      }

      destroyForm() {
        const containerEl = this.getFormTargetEl();

        if (containerEl) {
          while (containerEl.firstChild) {
            containerEl.removeChild(containerEl.lastChild);
          }
        }

        if (_classPrivateFieldGet(this, _form) && _classPrivateFieldGet(this, _form).$destroy) {
          _classPrivateFieldGet(this, _form).$destroy();
        }

        _classPrivateFieldSet(this, _form, null);
      }

      destroyFrame() {
        if (_classPrivateFieldGet(this, _frame) && _classPrivateFieldGet(this, _frame).$destroy) {
          _classPrivateFieldGet(this, _frame).$destroy();
        }

        _classPrivateFieldSet(this, _frame, null);
      }

      isModeExists(mode) {
        const forms = this.getOptions('forms', []);
        return forms.some(function (item) {
          return item.mode === mode;
        });
      }

      getFirstMode() {
        const forms = this.getOptions('forms', []);

        if (forms.length > 0) {
          return forms[0].mode;
        }

        return null;
      }

      destroy() {
        _classPrivateFieldSet(this, _formSetComponent, null);

        _classPrivateFieldSet(this, _formComponent, null);

        this.destroyForm();
        this.destroyFrame();
        thi.setData(null);
        thi.setOptions(null);
        thi.setWorking(null);
      }

      getFrameTargetEl() {
        const target = this.getOptions('target', DEFAULT_CONTAINER_SELECTOR);

        if (target instanceof HTMLElement) {
          return target;
        } else if (typeof target === 'string') {
          return document.querySelector(target);
        } else {
          throw new Error('form set target is not HTMLElement or string');
        }
      }

      getFormTargetEl() {
        const name = this.getOptions('name', DEFAULT_FORM_SET_NAME);
        return document.querySelector(`#${name}-form-set-container`);
      }

    }

    function _getFrameProps2() {
      return {
        showModes: this.getOptions('showModes', true),
        mode: this.getFormMode(),
        forms: this.getOptions('forms', []),
        name: this.getOptions('name', DEFAULT_FORM_SET_NAME)
      };
    }

    /* src/frame/components/breadcrumbs/ui.breadcrumbs.svelte generated by Svelte v3.46.6 */

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (29:4) {:else}
    function create_else_block$7(ctx) {
    	let li;
    	let a;
    	let t_value = /*$LOCALE*/ ctx[2][/*link*/ ctx[5].title] + "";
    	let t;
    	let a_href_value;
    	let a_data_href_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr(a, "href", a_href_value = "" + (/*root*/ ctx[0] + /*link*/ ctx[5].url));
    			attr(a, "data-href", a_data_href_value = /*link*/ ctx[5].url);
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			append(a, t);

    			if (!mounted) {
    				dispose = listen(a, "click", /*onClick*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, items*/ 6 && t_value !== (t_value = /*$LOCALE*/ ctx[2][/*link*/ ctx[5].title] + "")) set_data(t, t_value);

    			if (dirty & /*root, items*/ 3 && a_href_value !== (a_href_value = "" + (/*root*/ ctx[0] + /*link*/ ctx[5].url))) {
    				attr(a, "href", a_href_value);
    			}

    			if (dirty & /*items*/ 2 && a_data_href_value !== (a_data_href_value = /*link*/ ctx[5].url)) {
    				attr(a, "data-href", a_data_href_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (27:4) {#if link.url === false }
    function create_if_block_1$8(ctx) {
    	let li;
    	let t_value = /*$LOCALE*/ ctx[2][/*link*/ ctx[5].title] + "";
    	let t;

    	return {
    		c() {
    			li = element("li");
    			t = text(t_value);
    			attr(li, "class", "is-plain-crumb");
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, items*/ 6 && t_value !== (t_value = /*$LOCALE*/ ctx[2][/*link*/ ctx[5].title] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    		}
    	};
    }

    // (24:4) {#if (items.length === (index + 1)) }
    function create_if_block$8(ctx) {
    	let li;
    	let a;
    	let t_value = /*$LOCALE*/ ctx[2][/*link*/ ctx[5].title] + "";
    	let t;
    	let a_href_value;
    	let a_data_href_value;

    	return {
    		c() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr(a, "href", a_href_value = "" + (/*root*/ ctx[0] + /*link*/ ctx[5].url));
    			attr(a, "data-href", a_data_href_value = /*link*/ ctx[5].url);
    			attr(a, "aria-current", "page");
    			attr(li, "class", "is-active");
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			append(a, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, items*/ 6 && t_value !== (t_value = /*$LOCALE*/ ctx[2][/*link*/ ctx[5].title] + "")) set_data(t, t_value);

    			if (dirty & /*root, items*/ 3 && a_href_value !== (a_href_value = "" + (/*root*/ ctx[0] + /*link*/ ctx[5].url))) {
    				attr(a, "href", a_href_value);
    			}

    			if (dirty & /*items*/ 2 && a_data_href_value !== (a_data_href_value = /*link*/ ctx[5].url)) {
    				attr(a, "data-href", a_data_href_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    		}
    	};
    }

    // (23:4) {#each items as link, index}
    function create_each_block$4(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*items*/ ctx[1].length === /*index*/ ctx[7] + 1) return create_if_block$8;
    		if (/*link*/ ctx[5].url === false) return create_if_block_1$8;
    		return create_else_block$7;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$c(ctx) {
    	let nav;
    	let ul;
    	let each_value = /*items*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	return {
    		c() {
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(nav, "class", "breadcrumb");
    			attr(nav, "aria-label", "breadcrumbs");
    		},
    		m(target, anchor) {
    			insert(target, nav, anchor);
    			append(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*root, items, $LOCALE, onClick*/ 15) {
    				each_value = /*items*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(nav);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(2, $LOCALE = $$value));
    	let { root = '' } = $$props;
    	let { items = [] } = $$props;
    	let { go = null } = $$props;

    	function onClick(ev) {
    		if (typeof go === 'function') {
    			ev.preventDefault();
    			go(ev.currentTarget.dataset.href);
    			return false;
    		} else {
    			return true;
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('root' in $$props) $$invalidate(0, root = $$props.root);
    		if ('items' in $$props) $$invalidate(1, items = $$props.items);
    		if ('go' in $$props) $$invalidate(4, go = $$props.go);
    	};

    	return [root, items, $LOCALE, onClick, go];
    }

    class Ui_breadcrumbs extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { root: 0, items: 1, go: 4 });
    	}
    }

    class notBreadcrumbs {
      static render(_ref) {
        let {
          target,
          root = '',
          navigate
        } = _ref;
        this.remove();

        if (Breadcrumbs.UIConstructor) {
          this.ui = new Breadcrumbs.UIConstructor({
            target,
            props: {
              items: this.getBreadcrumbs(),
              root: root,
              go: navigate
            }
          });
        }
      }

      static setHead(head) {
        this.head.splice(0, this.head.length, ...head);
        return this;
      }

      static setTail(tail) {
        this.tail.splice(0, this.tail.length, ...tail);
        return this;
      }

      static getBreadcrumbs() {
        let crumbs = [];
        crumbs.push(...this.head);
        crumbs.push(...this.tail);
        return crumbs;
      }

      static update() {
        if (this.ui) {
          this.ui.$set({
            items: this.getBreadcrumbs()
          });
        }
      }

      static remove() {
        if (this.ui) {
          this.ui.$destroy();
          this.ui = null;
        }

        return this;
      }

    }

    _defineProperty(notBreadcrumbs, "UIConstructor", null);

    _defineProperty(notBreadcrumbs, "ui", null);

    _defineProperty(notBreadcrumbs, "head", []);

    _defineProperty(notBreadcrumbs, "tail", []);

    notBreadcrumbs.UIConstructor = Ui_breadcrumbs;

    class Menu {
      static setApp(app) {
        if (!this.app) {
          this.app = app;
        }

        return this;
      }

      static setOptions(options) {
        this.options = { ...this.options,
          ...options
        };
        return this;
      }

      static getOptionsPathTo(what) {
        return `menu.${this.options.type}.${what}`;
      }

      static isDirectNavigation() {
        return this.app ? this.app.getOptions(this.getOptionsPathTo('directNavigation'), this.options.directNavigation) : this.options.directNavigation;
      }

      static getOptions() {
        if (this.app) {
          return {
            brand: this.app.getOptions('brand', this.options.brand),
            items: this.app.getOptions(this.getOptionsPathTo('items'), this.options.items),
            sections: this.app.getOptions(this.getOptionsPathTo('sections'), this.options.sections),
            targetSelector: this.app.getOptions(this.getOptionsPathTo('targetSelector'), this.options.targetSelector),
            toggleSelector: this.app.getOptions(this.getOptionsPathTo('toggleSelector'), this.options.toggleSelector),
            open: this.app.getOptions(this.getOptionsPathTo('open'), this.options.open),
            directNavigation: this.app.getOptions(this.getOptionsPathTo('directNavigation'), this.options.directNavigation),
            root: this.app.getOptions('router.root', this.options.root),
            navigate: this.options.navigate.bind(this),
            getComponent: this.getComponent.bind(this)
          };
        } else {
          return this.options;
        }
      }

      static getComponent(name) {
        if (COMPONENTS$1.contains(name)) {
          return COMPONENTS$1.get(name);
        } else {
          return false;
        }
      }

      static initField(list) {
        var _this = this;

        let fields = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        list.forEach(function (item) {
          fields.forEach(function (field) {
            if (!Object.prototype.hasOwnProperty.call(item, field)) {
              item[field] = _this.DEFAULT[field];
            }
          });

          if (Object.prototype.hasOwnProperty.call(item, 'items')) {
            _this.initField(item.items, fields);
          }
        });
      }

      static sortList(list) {
        var _this2 = this;

        list.sort(function (item1, item2) {
          if (Object.prototype.hasOwnProperty.call(item1, 'items')) {
            _this2.sortList(item1.items);
          }

          if (Object.prototype.hasOwnProperty.call(item2, 'items')) {
            _this2.sortList(item2.items);
          }

          if (item1.priority === item2.priority) {
            return item1.title > item2.title ? 1 : -1;
          } else {
            return item1.priority < item2.priority ? 1 : -1;
          }
        });
      }

      static removeDublicates(sections) {
        for (let i = 0; i < sections.length; i++) {
          let priority = sections[i].priority;
          sections.filter(function (section) {
            return section.id === sections[i].id;
          }).forEach(function (item, indx) {
            if (indx === 0) {
              return;
            }

            if (item.priority < priority) {
              priority = item.priority;
            }

            sections.splice(sections.indexOf(item), 1);
          });
          sections[i].priority = priority;
        }

        return sections;
      }

      static prepareData() {
        let items = [];
        items.push(...this.getOptions().items);
        let sections = [];
        sections.push(...this.getOptions().sections);
        this.initField(sections, ['priority']);
        this.removeDublicates(sections);
        this.initField(items, ['priority', 'section', 'type']);
        this.sortList(sections);
        sections.push({
          id: this.DEFAULT.section,
          title: this.DEFAULT.sectionTitle
        });
        this.sortList(items);
        this.sections = sections;
        this.items = items;
      }

      static remove() {
        if (this.menu) {
          this.menu.$destroy();
          this.menu = null;
          clearInterval(this.interval);
        }
      }

      static updateIndicator(sectionId, itemId, state) {
        this.updateSection(sectionId, function (section) {
          section.indicator.state = state;
        });
        this.updateItem(itemId, function (item) {
          item.indicator.state = state;
        });
      }

      static updateTag(sectionId, itemId, tag) {
        this.updateSection(sectionId, function (section) {
          section.tag = tag;
        });
        this.updateItem(itemId, function (item) {
          item.tag = tag;
        });
      }

      static updateSectionTag(sectionId, tag) {
        this.updateSection(sectionId, function (section) {
          section.tag = { ...section.tag,
            ...tag
          };
        });
      }

      static updateItemTag(itemId, tag) {
        this.updateItem(itemId, function (item) {
          item.tag = { ...item.tag,
            ...tag
          };
        });
      }

      static updateSection(sectionId, proc) {
        if (this.sections && sectionId) {
          for (let section in this.sections) {
            if (this.sections[section].id !== sectionId) continue;
            proc(this.sections[section]);
          }

          if (this.menu) {
            this.menu.$set({
              sections: this.sections
            });
          }
        }
      }

      static updateSectionItems(sectionId, proc) {
        if (this.sections && sectionId) {
          let oldList = this.items.filter(function (item) {
            return item.section === sectionId;
          });

          for (let i of oldList) {
            this.items.splice(this.items.indexOf(i), 1);
          }

          this.items.push(...proc(oldList));

          if (this.menu) {
            this.menu.$set({
              items: this.items
            });
          }
        }
      }

      static updateItem(itemId, proc) {
        if (itemId && this.items) {
          this.items.forEach(function (item) {
            if (item.id !== itemId) return;
            proc(item);
          });

          if (this.menu) {
            this.menu.$set({
              items: this.items
            });
          }
        }
      }

      static isTouch() {
        return window.innerWidth <= this.MAX_TOUCH_WIDTH;
      }

      static getSectionComponent() {}

    }

    _defineProperty(Menu, "MAX_TOUCH_WIDTH", 1023);

    _defineProperty(Menu, "DEFAULT", {
      section: 'any',
      sectionTitle: 'Меню',
      priority: 0,
      //link, button, dropdown, component
      type: 'link'
    });

    _defineProperty(Menu, "app", false);

    _defineProperty(Menu, "directNavigation", false);

    _defineProperty(Menu, "menu", void 0);

    _defineProperty(Menu, "options", {
      directNavigation: false,
      navigate: function (urls) {
        Menu.hide();

        if (!Menu.isDirectNavigation() && Menu.app) {
          let func = Menu.app.getWorking('router');

          if (func) {
            return func.navigate(urls.short);
          }
        }

        document.location.assign(urls.full);
      }
    });

    _defineProperty(Menu, "items", []);

    _defineProperty(Menu, "sections", []);

    _defineProperty(Menu, "location", void 0);

    _defineProperty(Menu, "interval", void 0);

    /* src/frame/components/navigation/side/ui.item.without.children.svelte generated by Svelte v3.46.6 */

    function create_else_block$6(ctx) {
    	let li;
    	let t0_value = /*$LOCALE*/ ctx[2][/*item*/ ctx[1].title] + "";
    	let t0;
    	let t1;
    	let t2;
    	let li_class_value;
    	let current;
    	let if_block0 = /*item*/ ctx[1].tag && create_if_block_4$2(ctx);
    	let if_block1 = /*item*/ ctx[1].indicator && create_if_block_3$4(ctx);

    	return {
    		c() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr(li, "class", li_class_value = "is-no-follow-subtitle " + /*item*/ ctx[1].classes);
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, t0);
    			append(li, t1);
    			if (if_block0) if_block0.m(li, null);
    			append(li, t2);
    			if (if_block1) if_block1.m(li, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if ((!current || dirty & /*$LOCALE, item*/ 6) && t0_value !== (t0_value = /*$LOCALE*/ ctx[2][/*item*/ ctx[1].title] + "")) set_data(t0, t0_value);

    			if (/*item*/ ctx[1].tag) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*item*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(li, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*item*/ ctx[1].indicator) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*item*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_3$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(li, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*item*/ 2 && li_class_value !== (li_class_value = "is-no-follow-subtitle " + /*item*/ ctx[1].classes)) {
    				attr(li, "class", li_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    }

    // (22:0) {#if (typeof item.url !== 'undefined' && item.url!==false) }
    function create_if_block$7(ctx) {
    	let li;
    	let a;
    	let t0_value = /*$LOCALE*/ ctx[2][/*item*/ ctx[1].title] + "";
    	let t0;
    	let t1;
    	let t2;
    	let a_href_value;
    	let a_data_href_value;
    	let li_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*item*/ ctx[1].tag && create_if_block_2$4(ctx);
    	let if_block1 = /*item*/ ctx[1].indicator && create_if_block_1$7(ctx);

    	return {
    		c() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr(a, "href", a_href_value = "" + (/*root*/ ctx[0] + /*item*/ ctx[1].url));
    			attr(a, "data-href", a_data_href_value = /*item*/ ctx[1].url);
    			attr(li, "class", li_class_value = /*item*/ ctx[1].classes);
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			append(a, t0);
    			append(a, t1);
    			if (if_block0) if_block0.m(a, null);
    			append(a, t2);
    			if (if_block1) if_block1.m(a, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(a, "click", /*onClick*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if ((!current || dirty & /*$LOCALE, item*/ 6) && t0_value !== (t0_value = /*$LOCALE*/ ctx[2][/*item*/ ctx[1].title] + "")) set_data(t0, t0_value);

    			if (/*item*/ ctx[1].tag) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*item*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(a, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*item*/ ctx[1].indicator) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*item*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$7(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(a, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*root, item*/ 3 && a_href_value !== (a_href_value = "" + (/*root*/ ctx[0] + /*item*/ ctx[1].url))) {
    				attr(a, "href", a_href_value);
    			}

    			if (!current || dirty & /*item*/ 2 && a_data_href_value !== (a_data_href_value = /*item*/ ctx[1].url)) {
    				attr(a, "data-href", a_data_href_value);
    			}

    			if (!current || dirty & /*item*/ 2 && li_class_value !== (li_class_value = /*item*/ ctx[1].classes)) {
    				attr(li, "class", li_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (36:2) {#if item.tag }
    function create_if_block_4$2(ctx) {
    	let uiindicator;
    	let current;
    	const uiindicator_spread_levels = [{ id: /*item*/ ctx[1].id }, /*item*/ ctx[1].tag];
    	let uiindicator_props = {};

    	for (let i = 0; i < uiindicator_spread_levels.length; i += 1) {
    		uiindicator_props = assign(uiindicator_props, uiindicator_spread_levels[i]);
    	}

    	uiindicator = new Ui_indicator({ props: uiindicator_props });

    	return {
    		c() {
    			create_component(uiindicator.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uiindicator, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uiindicator_changes = (dirty & /*item*/ 2)
    			? get_spread_update(uiindicator_spread_levels, [{ id: /*item*/ ctx[1].id }, get_spread_object(/*item*/ ctx[1].tag)])
    			: {};

    			uiindicator.$set(uiindicator_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiindicator.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiindicator.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uiindicator, detaching);
    		}
    	};
    }

    // (39:2) {#if item.indicator }
    function create_if_block_3$4(ctx) {
    	let uiindicator;
    	let current;
    	const uiindicator_spread_levels = [{ id: /*item*/ ctx[1].id }, /*item*/ ctx[1].indicator];
    	let uiindicator_props = {};

    	for (let i = 0; i < uiindicator_spread_levels.length; i += 1) {
    		uiindicator_props = assign(uiindicator_props, uiindicator_spread_levels[i]);
    	}

    	uiindicator = new Ui_indicator({ props: uiindicator_props });

    	return {
    		c() {
    			create_component(uiindicator.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uiindicator, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uiindicator_changes = (dirty & /*item*/ 2)
    			? get_spread_update(uiindicator_spread_levels, [{ id: /*item*/ ctx[1].id }, get_spread_object(/*item*/ ctx[1].indicator)])
    			: {};

    			uiindicator.$set(uiindicator_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiindicator.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiindicator.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uiindicator, detaching);
    		}
    	};
    }

    // (26:2) {#if item.tag }
    function create_if_block_2$4(ctx) {
    	let uiindicator;
    	let current;
    	const uiindicator_spread_levels = [{ id: /*item*/ ctx[1].id }, /*item*/ ctx[1].tag];
    	let uiindicator_props = {};

    	for (let i = 0; i < uiindicator_spread_levels.length; i += 1) {
    		uiindicator_props = assign(uiindicator_props, uiindicator_spread_levels[i]);
    	}

    	uiindicator = new Ui_indicator({ props: uiindicator_props });

    	return {
    		c() {
    			create_component(uiindicator.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uiindicator, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uiindicator_changes = (dirty & /*item*/ 2)
    			? get_spread_update(uiindicator_spread_levels, [{ id: /*item*/ ctx[1].id }, get_spread_object(/*item*/ ctx[1].tag)])
    			: {};

    			uiindicator.$set(uiindicator_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiindicator.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiindicator.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uiindicator, detaching);
    		}
    	};
    }

    // (29:2) {#if item.indicator }
    function create_if_block_1$7(ctx) {
    	let uiindicator;
    	let current;
    	const uiindicator_spread_levels = [{ id: /*item*/ ctx[1].id }, /*item*/ ctx[1].indicator];
    	let uiindicator_props = {};

    	for (let i = 0; i < uiindicator_spread_levels.length; i += 1) {
    		uiindicator_props = assign(uiindicator_props, uiindicator_spread_levels[i]);
    	}

    	uiindicator = new Ui_indicator({ props: uiindicator_props });

    	return {
    		c() {
    			create_component(uiindicator.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uiindicator, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uiindicator_changes = (dirty & /*item*/ 2)
    			? get_spread_update(uiindicator_spread_levels, [{ id: /*item*/ ctx[1].id }, get_spread_object(/*item*/ ctx[1].indicator)])
    			: {};

    			uiindicator.$set(uiindicator_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiindicator.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiindicator.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uiindicator, detaching);
    		}
    	};
    }

    function create_fragment$b(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$7, create_else_block$6];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (typeof /*item*/ ctx[1].url !== 'undefined' && /*item*/ ctx[1].url !== false) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(2, $LOCALE = $$value));
    	const dispatch = createEventDispatcher();
    	let { root = '' } = $$props;
    	let { item = {} } = $$props;

    	function onClick(ev) {
    		ev.preventDefault();

    		dispatch('navigate', {
    			full: ev.target.getAttribute('href'),
    			short: ev.target.dataset.href
    		});

    		return false;
    	}

    	$$self.$$set = $$props => {
    		if ('root' in $$props) $$invalidate(0, root = $$props.root);
    		if ('item' in $$props) $$invalidate(1, item = $$props.item);
    	};

    	return [root, item, $LOCALE, onClick];
    }

    class Ui_item_without_children extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { root: 0, item: 1 });
    	}
    }

    /* src/frame/components/navigation/side/ui.trigger.svelte generated by Svelte v3.46.6 */

    function create_fragment$a(ctx) {
    	let span;
    	let i;
    	let i_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");

    			attr(i, "class", i_class_value = "fas " + (/*closed*/ ctx[0]
    			? /*icon_closed*/ ctx[2]
    			: /*icon_opened*/ ctx[1]));

    			attr(i, "aria-hidden", "true");
    			attr(span, "class", "icon is-small is-toggle-submenu is-pulled-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);

    			if (!mounted) {
    				dispose = listen(span, "click", /*onClick*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*closed, icon_closed, icon_opened*/ 7 && i_class_value !== (i_class_value = "fas " + (/*closed*/ ctx[0]
    			? /*icon_closed*/ ctx[2]
    			: /*icon_opened*/ ctx[1]))) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(span);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

    	const CLASS_ICON = {
    		OPENED: 'fa-angle-down',
    		CLOSED: 'fa-angle-up'
    	};

    	let { icon_opened = CLASS_ICON.OPENED } = $$props;
    	let { icon_closed = CLASS_ICON.CLOSED } = $$props;
    	let { closed = false } = $$props;

    	function onClick(e) {
    		e && e.preventDefault() && e.stopPropagation();
    		$$invalidate(0, closed = !closed);
    		dispatch('toggle', { closed });
    		return false;
    	}

    	$$self.$$set = $$props => {
    		if ('icon_opened' in $$props) $$invalidate(1, icon_opened = $$props.icon_opened);
    		if ('icon_closed' in $$props) $$invalidate(2, icon_closed = $$props.icon_closed);
    		if ('closed' in $$props) $$invalidate(0, closed = $$props.closed);
    	};

    	return [closed, icon_opened, icon_closed, onClick];
    }

    class Ui_trigger extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			icon_opened: 1,
    			icon_closed: 2,
    			closed: 0
    		});
    	}
    }

    /* src/frame/components/navigation/side/ui.item.label.svelte generated by Svelte v3.46.6 */

    function create_else_block$5(ctx) {
    	let span;
    	let t_value = /*$LOCALE*/ ctx[1][/*item*/ ctx[0].title] + "";
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(t_value);
    			attr(span, "class", "is-no-link");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, item*/ 3 && t_value !== (t_value = /*$LOCALE*/ ctx[1][/*item*/ ctx[0].title] + "")) set_data(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (14:94) 
    function create_if_block_3$3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ id: /*item*/ ctx[0].id }, /*item*/ ctx[0].props];
    	var switch_value = COMPONENTS$1.get(/*item*/ ctx[0].component);

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*item*/ 1)
    			? get_spread_update(switch_instance_spread_levels, [{ id: /*item*/ ctx[0].id }, get_spread_object(/*item*/ ctx[0].props)])
    			: {};

    			if (switch_value !== (switch_value = COMPONENTS$1.get(/*item*/ ctx[0].component))) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    // (12:0) {#if item.icon }
    function create_if_block_2$3(ctx) {
    	let uiicon;
    	let current;
    	const uiicon_spread_levels = [/*item*/ ctx[0].icon];
    	let uiicon_props = {};

    	for (let i = 0; i < uiicon_spread_levels.length; i += 1) {
    		uiicon_props = assign(uiicon_props, uiicon_spread_levels[i]);
    	}

    	uiicon = new Ui_icon_font({ props: uiicon_props });

    	return {
    		c() {
    			create_component(uiicon.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uiicon, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uiicon_changes = (dirty & /*item*/ 1)
    			? get_spread_update(uiicon_spread_levels, [get_spread_object(/*item*/ ctx[0].icon)])
    			: {};

    			uiicon.$set(uiicon_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiicon.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiicon.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uiicon, detaching);
    		}
    	};
    }

    // (23:0) {#if item.tag }
    function create_if_block_1$6(ctx) {
    	let uitag;
    	let current;
    	const uitag_spread_levels = [{ id: /*item*/ ctx[0].id }, /*item*/ ctx[0].tag];
    	let uitag_props = {};

    	for (let i = 0; i < uitag_spread_levels.length; i += 1) {
    		uitag_props = assign(uitag_props, uitag_spread_levels[i]);
    	}

    	uitag = new Ui_tag$1({ props: uitag_props });

    	return {
    		c() {
    			create_component(uitag.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uitag, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uitag_changes = (dirty & /*item*/ 1)
    			? get_spread_update(uitag_spread_levels, [{ id: /*item*/ ctx[0].id }, get_spread_object(/*item*/ ctx[0].tag)])
    			: {};

    			uitag.$set(uitag_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uitag.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uitag.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uitag, detaching);
    		}
    	};
    }

    // (26:0) {#if item.indicator }
    function create_if_block$6(ctx) {
    	let uiindicator;
    	let current;
    	const uiindicator_spread_levels = [{ id: /*item*/ ctx[0].id }, /*item*/ ctx[0].indicator];
    	let uiindicator_props = {};

    	for (let i = 0; i < uiindicator_spread_levels.length; i += 1) {
    		uiindicator_props = assign(uiindicator_props, uiindicator_spread_levels[i]);
    	}

    	uiindicator = new Ui_indicator({ props: uiindicator_props });

    	return {
    		c() {
    			create_component(uiindicator.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uiindicator, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uiindicator_changes = (dirty & /*item*/ 1)
    			? get_spread_update(uiindicator_spread_levels, [{ id: /*item*/ ctx[0].id }, get_spread_object(/*item*/ ctx[0].indicator)])
    			: {};

    			uiindicator.$set(uiindicator_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiindicator.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiindicator.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uiindicator, detaching);
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	const if_block_creators = [create_if_block_2$3, create_if_block_3$3, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*item*/ 1) show_if = null;
    		if (/*item*/ ctx[0].icon) return 0;
    		if (show_if == null) show_if = !!(/*item*/ ctx[0].type === 'component' && /*item*/ ctx[0].component && COMPONENTS$1.contains(/*item*/ ctx[0].component));
    		if (show_if) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*item*/ ctx[0].tag && create_if_block_1$6(ctx);
    	let if_block2 = /*item*/ ctx[0].indicator && create_if_block$6(ctx);
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	return {
    		c() {
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, t2, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(t0.parentNode, t0);
    			}

    			if (/*item*/ ctx[0].tag) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*item*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*item*/ ctx[0].indicator) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*item*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$6(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach(t2);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(1, $LOCALE = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { item = {} } = $$props;

    	$$self.$$set = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	return [item, $LOCALE, $$scope, slots];
    }

    class Ui_item_label extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { item: 0 });
    	}
    }

    /* src/frame/components/navigation/side/ui.items.svelte generated by Svelte v3.46.6 */

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[12] = list;
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (48:1) {:else}
    function create_else_block_1(ctx) {
    	let uisidemenuitemwithoutchildren;
    	let current;

    	uisidemenuitemwithoutchildren = new Ui_item_without_children({
    			props: {
    				root: /*root*/ ctx[0],
    				item: /*item*/ ctx[11]
    			}
    		});

    	uisidemenuitemwithoutchildren.$on("navigate", /*navigate_handler_1*/ ctx[9]);

    	return {
    		c() {
    			create_component(uisidemenuitemwithoutchildren.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uisidemenuitemwithoutchildren, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uisidemenuitemwithoutchildren_changes = {};
    			if (dirty & /*root*/ 1) uisidemenuitemwithoutchildren_changes.root = /*root*/ ctx[0];
    			if (dirty & /*items*/ 2) uisidemenuitemwithoutchildren_changes.item = /*item*/ ctx[11];
    			uisidemenuitemwithoutchildren.$set(uisidemenuitemwithoutchildren_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uisidemenuitemwithoutchildren.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uisidemenuitemwithoutchildren.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uisidemenuitemwithoutchildren, detaching);
    		}
    	};
    }

    // (33:1) {#if item.items && item.items.length }
    function create_if_block$5(ctx) {
    	let li;
    	let current_block_type_index;
    	let if_block;
    	let t0;
    	let ui_items;
    	let updating_closed;
    	let t1;
    	let li_class_value;
    	let current;
    	const if_block_creators = [create_if_block_1$5, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (typeof /*item*/ ctx[11].url !== 'undefined' && /*item*/ ctx[11].url !== false) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function ui_items_closed_binding(value) {
    		/*ui_items_closed_binding*/ ctx[7](value, /*index*/ ctx[13]);
    	}

    	let ui_items_props = {
    		root: /*root*/ ctx[0],
    		items: /*item*/ ctx[11].items
    	};

    	if (/*closedChildren*/ ctx[3][/*index*/ ctx[13]] !== void 0) {
    		ui_items_props.closed = /*closedChildren*/ ctx[3][/*index*/ ctx[13]];
    	}

    	ui_items = new Ui_items({ props: ui_items_props });
    	binding_callbacks.push(() => bind(ui_items, 'closed', ui_items_closed_binding));
    	ui_items.$on("navigate", /*navigate_handler*/ ctx[8]);

    	return {
    		c() {
    			li = element("li");
    			if_block.c();
    			t0 = space();
    			create_component(ui_items.$$.fragment);
    			t1 = space();
    			attr(li, "class", li_class_value = "is-no-follow-subtitle " + /*item*/ ctx[11].classes);
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			if_blocks[current_block_type_index].m(li, null);
    			append(li, t0);
    			mount_component(ui_items, li, null);
    			append(li, t1);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(li, t0);
    			}

    			const ui_items_changes = {};
    			if (dirty & /*root*/ 1) ui_items_changes.root = /*root*/ ctx[0];
    			if (dirty & /*items*/ 2) ui_items_changes.items = /*item*/ ctx[11].items;

    			if (!updating_closed && dirty & /*closedChildren*/ 8) {
    				updating_closed = true;
    				ui_items_changes.closed = /*closedChildren*/ ctx[3][/*index*/ ctx[13]];
    				add_flush_callback(() => updating_closed = false);
    			}

    			ui_items.$set(ui_items_changes);

    			if (!current || dirty & /*items*/ 2 && li_class_value !== (li_class_value = "is-no-follow-subtitle " + /*item*/ ctx[11].classes)) {
    				attr(li, "class", li_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(ui_items.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			transition_out(ui_items.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			if_blocks[current_block_type_index].d();
    			destroy_component(ui_items);
    		}
    	};
    }

    // (41:2) {:else}
    function create_else_block$4(ctx) {
    	let uisidemenuitemlabel;
    	let current;

    	uisidemenuitemlabel = new Ui_item_label({
    			props: {
    				item: /*item*/ ctx[11],
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(uisidemenuitemlabel.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uisidemenuitemlabel, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uisidemenuitemlabel_changes = {};
    			if (dirty & /*items*/ 2) uisidemenuitemlabel_changes.item = /*item*/ ctx[11];

    			if (dirty & /*$$scope, closedChildren*/ 16392) {
    				uisidemenuitemlabel_changes.$$scope = { dirty, ctx };
    			}

    			uisidemenuitemlabel.$set(uisidemenuitemlabel_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uisidemenuitemlabel.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uisidemenuitemlabel.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uisidemenuitemlabel, detaching);
    		}
    	};
    }

    // (35:2) {#if (typeof item.url !== 'undefined' && item.url!==false) }
    function create_if_block_1$5(ctx) {
    	let a;
    	let uisidemenuitemlabel;
    	let a_href_value;
    	let a_data_href_value;
    	let current;
    	let mounted;
    	let dispose;

    	uisidemenuitemlabel = new Ui_item_label({
    			props: {
    				item: /*item*/ ctx[11],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			a = element("a");
    			create_component(uisidemenuitemlabel.$$.fragment);
    			attr(a, "href", a_href_value = "" + (/*root*/ ctx[0] + /*item*/ ctx[11].url));
    			attr(a, "data-href", a_data_href_value = /*item*/ ctx[11].url);
    			attr(a, "class", "has-subitems");
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			mount_component(uisidemenuitemlabel, a, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(a, "click", /*onClick*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const uisidemenuitemlabel_changes = {};
    			if (dirty & /*items*/ 2) uisidemenuitemlabel_changes.item = /*item*/ ctx[11];

    			if (dirty & /*$$scope, closedChildren*/ 16392) {
    				uisidemenuitemlabel_changes.$$scope = { dirty, ctx };
    			}

    			uisidemenuitemlabel.$set(uisidemenuitemlabel_changes);

    			if (!current || dirty & /*root, items*/ 3 && a_href_value !== (a_href_value = "" + (/*root*/ ctx[0] + /*item*/ ctx[11].url))) {
    				attr(a, "href", a_href_value);
    			}

    			if (!current || dirty & /*items*/ 2 && a_data_href_value !== (a_data_href_value = /*item*/ ctx[11].url)) {
    				attr(a, "data-href", a_data_href_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uisidemenuitemlabel.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uisidemenuitemlabel.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    			destroy_component(uisidemenuitemlabel);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (42:3) <UISideMenuItemLabel {item} >
    function create_default_slot_1(ctx) {
    	let uisidemenutrigger;
    	let current;

    	function toggle_handler_1(...args) {
    		return /*toggle_handler_1*/ ctx[6](/*index*/ ctx[13], ...args);
    	}

    	uisidemenutrigger = new Ui_trigger({});
    	uisidemenutrigger.$on("toggle", toggle_handler_1);

    	return {
    		c() {
    			create_component(uisidemenutrigger.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uisidemenutrigger, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uisidemenutrigger.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uisidemenutrigger.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uisidemenutrigger, detaching);
    		}
    	};
    }

    // (37:3) <UISideMenuItemLabel {item} >
    function create_default_slot(ctx) {
    	let uisidemenutrigger;
    	let current;

    	function toggle_handler(...args) {
    		return /*toggle_handler*/ ctx[5](/*index*/ ctx[13], ...args);
    	}

    	uisidemenutrigger = new Ui_trigger({});
    	uisidemenutrigger.$on("toggle", toggle_handler);

    	return {
    		c() {
    			create_component(uisidemenutrigger.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uisidemenutrigger, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uisidemenutrigger.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uisidemenutrigger.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uisidemenutrigger, detaching);
    		}
    	};
    }

    // (32:0) {#each items as item, index}
    function create_each_block$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[11].items && /*item*/ ctx[11].items.length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	let ul;
    	let ul_class_value;
    	let current;
    	let each_value = /*items*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(ul, "class", ul_class_value = "menu-list " + (/*closed*/ ctx[2] ? 'is-closed' : ''));
    		},
    		m(target, anchor) {
    			insert(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*items, root, closedChildren, onClick*/ 27) {
    				each_value = /*items*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*closed*/ 4 && ul_class_value !== (ul_class_value = "menu-list " + (/*closed*/ ctx[2] ? 'is-closed' : ''))) {
    				attr(ul, "class", ul_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let closedChildren = {};
    	let { root = '' } = $$props;
    	let { items = [] } = $$props;
    	let { closed = false } = $$props;

    	function onClick(ev) {
    		ev.preventDefault();

    		dispatch('navigate', {
    			full: ev.target.getAttribute('href'),
    			short: ev.target.dataset.href
    		});

    		return false;
    	}

    	const toggle_handler = (index, { detail }) => {
    		$$invalidate(3, closedChildren[index] = detail.closed, closedChildren);
    	};

    	const toggle_handler_1 = (index, { detail }) => {
    		$$invalidate(3, closedChildren[index] = detail.closed, closedChildren);
    	};

    	function ui_items_closed_binding(value, index) {
    		if ($$self.$$.not_equal(closedChildren[index], value)) {
    			closedChildren[index] = value;
    			$$invalidate(3, closedChildren);
    		}
    	}

    	function navigate_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function navigate_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('root' in $$props) $$invalidate(0, root = $$props.root);
    		if ('items' in $$props) $$invalidate(1, items = $$props.items);
    		if ('closed' in $$props) $$invalidate(2, closed = $$props.closed);
    	};

    	return [
    		root,
    		items,
    		closed,
    		closedChildren,
    		onClick,
    		toggle_handler,
    		toggle_handler_1,
    		ui_items_closed_binding,
    		navigate_handler,
    		navigate_handler_1
    	];
    }

    class Ui_items extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { root: 0, items: 1, closed: 2 });
    	}
    }

    /* src/frame/components/navigation/side/ui.section.svelte generated by Svelte v3.46.6 */

    function create_if_block_1$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*sectionItems*/ ctx[2].length || /*section*/ ctx[0].component || /*section*/ ctx[0].tag || /*section*/ ctx[0].indicator) && create_if_block_2$2(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*sectionItems*/ ctx[2].length || /*section*/ ctx[0].component || /*section*/ ctx[0].tag || /*section*/ ctx[0].indicator) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*sectionItems, section*/ 5) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (15:0) {#if sectionItems.length || section.component || section.tag || section.indicator }
    function create_if_block_2$2(ctx) {
    	let p;
    	let show_if;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let t1;
    	let p_class_value;
    	let current;
    	const if_block_creators = [create_if_block_5$1, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*section*/ 1) show_if = null;
    		if (show_if == null) show_if = !!(/*section*/ ctx[0].type === 'component' && /*section*/ ctx[0].component && COMPONENTS$1.contains(/*section*/ ctx[0].component));
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*section*/ ctx[0].tag && create_if_block_4$1(ctx);
    	let if_block2 = /*section*/ ctx[0].indicator && create_if_block_3$2(ctx);

    	return {
    		c() {
    			p = element("p");
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr(p, "class", p_class_value = "menu-label " + /*section*/ ctx[0].classes);
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    			if_blocks[current_block_type_index].m(p, null);
    			append(p, t0);
    			if (if_block1) if_block1.m(p, null);
    			append(p, t1);
    			if (if_block2) if_block2.m(p, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(p, t0);
    			}

    			if (/*section*/ ctx[0].tag) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*section*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(p, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*section*/ ctx[0].indicator) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*section*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_3$2(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(p, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*section*/ 1 && p_class_value !== (p_class_value = "menu-label " + /*section*/ ctx[0].classes)) {
    				attr(p, "class", p_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(p);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};
    }

    // (23:2) {:else}
    function create_else_block$3(ctx) {
    	let t_value = /*$LOCALE*/ ctx[3][/*section*/ ctx[0].title] + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, section*/ 9 && t_value !== (t_value = /*$LOCALE*/ ctx[3][/*section*/ ctx[0].title] + "")) set_data(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (17:2) {#if (section.type==='component' && section.component && COMPONENTS.contains(section.component)) }
    function create_if_block_5$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ id: /*section*/ ctx[0].id }, /*section*/ ctx[0].props];
    	var switch_value = COMPONENTS$1.get(/*section*/ ctx[0].component);

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*section*/ 1)
    			? get_spread_update(switch_instance_spread_levels, [
    					{ id: /*section*/ ctx[0].id },
    					get_spread_object(/*section*/ ctx[0].props)
    				])
    			: {};

    			if (switch_value !== (switch_value = COMPONENTS$1.get(/*section*/ ctx[0].component))) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    // (26:2) {#if section.tag }
    function create_if_block_4$1(ctx) {
    	let uiindicator;
    	let current;
    	const uiindicator_spread_levels = [{ id: /*section*/ ctx[0].id }, /*section*/ ctx[0].tag];
    	let uiindicator_props = {};

    	for (let i = 0; i < uiindicator_spread_levels.length; i += 1) {
    		uiindicator_props = assign(uiindicator_props, uiindicator_spread_levels[i]);
    	}

    	uiindicator = new Ui_indicator({ props: uiindicator_props });

    	return {
    		c() {
    			create_component(uiindicator.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uiindicator, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uiindicator_changes = (dirty & /*section*/ 1)
    			? get_spread_update(uiindicator_spread_levels, [{ id: /*section*/ ctx[0].id }, get_spread_object(/*section*/ ctx[0].tag)])
    			: {};

    			uiindicator.$set(uiindicator_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiindicator.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiindicator.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uiindicator, detaching);
    		}
    	};
    }

    // (29:2) {#if section.indicator }
    function create_if_block_3$2(ctx) {
    	let uiindicator;
    	let current;
    	const uiindicator_spread_levels = [{ id: /*section*/ ctx[0].id }, /*section*/ ctx[0].indicator];
    	let uiindicator_props = {};

    	for (let i = 0; i < uiindicator_spread_levels.length; i += 1) {
    		uiindicator_props = assign(uiindicator_props, uiindicator_spread_levels[i]);
    	}

    	uiindicator = new Ui_indicator({ props: uiindicator_props });

    	return {
    		c() {
    			create_component(uiindicator.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uiindicator, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uiindicator_changes = (dirty & /*section*/ 1)
    			? get_spread_update(uiindicator_spread_levels, [
    					{ id: /*section*/ ctx[0].id },
    					get_spread_object(/*section*/ ctx[0].indicator)
    				])
    			: {};

    			uiindicator.$set(uiindicator_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiindicator.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiindicator.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uiindicator, detaching);
    		}
    	};
    }

    // (35:0) {#if sectionItems.length }
    function create_if_block$4(ctx) {
    	let uisidemenuitems;
    	let current;

    	uisidemenuitems = new Ui_items({
    			props: {
    				root: /*root*/ ctx[1],
    				items: /*sectionItems*/ ctx[2]
    			}
    		});

    	uisidemenuitems.$on("navigate", /*navigate_handler*/ ctx[5]);

    	return {
    		c() {
    			create_component(uisidemenuitems.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uisidemenuitems, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uisidemenuitems_changes = {};
    			if (dirty & /*root*/ 2) uisidemenuitems_changes.root = /*root*/ ctx[1];
    			if (dirty & /*sectionItems*/ 4) uisidemenuitems_changes.items = /*sectionItems*/ ctx[2];
    			uisidemenuitems.$set(uisidemenuitems_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uisidemenuitems.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uisidemenuitems.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uisidemenuitems, detaching);
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*section*/ ctx[0] && create_if_block_1$4(ctx);
    	let if_block1 = /*sectionItems*/ ctx[2].length && create_if_block$4(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*section*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*section*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*sectionItems*/ ctx[2].length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*sectionItems*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(if_block1_anchor);
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let sectionItems;
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(3, $LOCALE = $$value));
    	let { section } = $$props;
    	let { items = [] } = $$props;
    	let { root = '' } = $$props;

    	function navigate_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('section' in $$props) $$invalidate(0, section = $$props.section);
    		if ('items' in $$props) $$invalidate(4, items = $$props.items);
    		if ('root' in $$props) $$invalidate(1, root = $$props.root);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*items, section*/ 17) {
    			$$invalidate(2, sectionItems = items.filter(item => section.id === item.section));
    		}
    	};

    	return [section, root, sectionItems, $LOCALE, items, navigate_handler];
    }

    class Ui_section$1 extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { section: 0, items: 4, root: 1 });
    	}
    }

    /* src/frame/components/navigation/side/ui.side.menu.svelte generated by Svelte v3.46.6 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (16:0) {#each sections as section}
    function create_each_block$2(ctx) {
    	let uisidemenusection;
    	let current;

    	uisidemenusection = new Ui_section$1({
    			props: {
    				section: /*section*/ ctx[5],
    				items: /*items*/ ctx[1],
    				root: /*root*/ ctx[0]
    			}
    		});

    	uisidemenusection.$on("navigate", /*onClick*/ ctx[3]);

    	return {
    		c() {
    			create_component(uisidemenusection.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uisidemenusection, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uisidemenusection_changes = {};
    			if (dirty & /*sections*/ 4) uisidemenusection_changes.section = /*section*/ ctx[5];
    			if (dirty & /*items*/ 2) uisidemenusection_changes.items = /*items*/ ctx[1];
    			if (dirty & /*root*/ 1) uisidemenusection_changes.root = /*root*/ ctx[0];
    			uisidemenusection.$set(uisidemenusection_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uisidemenusection.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uisidemenusection.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uisidemenusection, detaching);
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*sections*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*sections, items, root, onClick*/ 15) {
    				each_value = /*sections*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { root = '' } = $$props;
    	let { items = [] } = $$props;
    	let { sections = [] } = $$props;
    	let { navigate = null } = $$props;

    	function onClick(ev) {
    		if (typeof navigate === 'function') {
    			navigate(ev.detail);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('root' in $$props) $$invalidate(0, root = $$props.root);
    		if ('items' in $$props) $$invalidate(1, items = $$props.items);
    		if ('sections' in $$props) $$invalidate(2, sections = $$props.sections);
    		if ('navigate' in $$props) $$invalidate(4, navigate = $$props.navigate);
    	};

    	return [root, items, sections, onClick, navigate];
    }

    class Ui_side_menu extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			root: 0,
    			items: 1,
    			sections: 2,
    			navigate: 4
    		});
    	}
    }

    const TYPE$1 = 'side';

    class notSideMenu extends Menu {
      static render(app) {
        if (app) {
          this.setApp(app);
        }

        this.prepareData();

        if (!this.menu) {
          this.createUI();
        }
      }

      static update() {
        if (this.menu) {
          this.menu.$destroy();
          this.createUI();
        }
      }

      static createUI() {
        let target = document.querySelector(this.getOptions().targetSelector);

        if (!target) {
          return;
        }

        this.menu = new Ui_side_menu({
          target,
          props: {
            items: this.items,
            sections: this.sections,
            root: this.getOptions().root,
            navigate: this.getOptions().navigate
          }
        });
        this.initSizeResponse();
        this.interval = setInterval(this.updateMenuActiveItem.bind(this), 200);
        this.bindToggle();
      }

      static itemIsActive(itemURL) {
        return (this.location + '/').indexOf(itemURL + '/') > -1;
      }

      static updateMenu() {
        var _this = this;

        Array.from(document.querySelectorAll(this.getOptions().targetSelector + ' a')).forEach(function (item) {
          if (_this.itemIsActive(item.getAttribute('href'))) {
            item.classList.add('is-active');
          } else {
            item.classList.remove('is-active');
          }
        });
      }

      static updateMenuActiveItem() {
        let url = window.location.toString(),
            lastLocation = this.location;

        if (lastLocation) {
          if (url !== lastLocation) {
            this.location = url;
            this.updateMenu();
          }
        } else {
          this.location = url;
          this.updateMenu();
        }
      }

      static initSizeResponse() {
        this.nav = document.querySelector('nav.navbar');
        this.aside = document.querySelector('aside');
        this.main = document.querySelector('main');
        this.resizeAsideAndMain(this.aside, this.main, this.nav);
        this.resizeMain(this.main, this.aside);
        window.addEventListener('resize', this.resizeMain.bind(this));

        if (this.getOptions().open) {
          this.show();
        } else {
          this.hide();
        }
      }

      static resizeMain() {
        if (this.isTouch()) {
          if (this.aside.classList.contains('is-active')) {
            this.main.style.display = 'none';
          } else {
            this.main.style.display = 'block';
            this.main.style.marginLeft = '0px';
          }
        } else {
          let rect = this.aside.getBoundingClientRect();
          this.main.style.display = 'block';

          if (this.main.style.height === '0px') {
            this.main.style.height = 'auto';
          }

          this.main.style.marginLeft = rect.width + rect.left + 'px';
        }
      }

      static resizeAside() {
        if (this.aside.style.display !== 'none') {
          let rect = this.nav.getBoundingClientRect();
          this.aside.style.height = window.innerHeight - rect.height + 'px';
          this.aside.style.marginTop = rect.height + 'px';
        }
      }

      static resizeAsideAndMain() {
        let rect = this.nav.getBoundingClientRect();
        this.aside.style.height = window.innerHeight - rect.height + 'px'; //this.aside.style.paddingTop = (rect.height) + 'px';

        this.main.style.marginTop = rect.height + 'px';
      }

      static bindToggle() {
        var _this2 = this;

        let els = document.querySelectorAll(this.getOptions().toggleSelector);
        Array.from(els).forEach(function (el) {
          el.removeEventListener('click', _this2.toggle.bind(_this2));
          el.addEventListener('click', _this2.toggle.bind(_this2));
        });
      }

      static toggle(e) {
        e && e.preventDefault();
        this.aside.classList.toggle('is-active');
        this.resizeMain();
        return false;
      }

      static hide(e) {
        e && e.preventDefault();
        this.aside.classList.remove('is-active');
        this.resizeMain();
        return false;
      }

      static show(e) {
        e && e.preventDefault();
        this.classList.add('is-active');
        this.resizeMain();
        return false;
      }

      static isOpen() {
        if (this.aside) {
          return this.aside.classList.contains('is-active');
        } else {
          return true;
        }
      }

    }

    _defineProperty(notSideMenu, "nav", void 0);

    _defineProperty(notSideMenu, "main", void 0);

    _defineProperty(notSideMenu, "aside", void 0);

    _defineProperty(notSideMenu, "DEFAULT", {
      section: 'any',
      sectionTitle: 'Меню',
      priority: 0,
      open: false
    });

    _defineProperty(notSideMenu, "options", {
      type: TYPE$1,
      items: [],
      sections: [],
      targetSelector: `#${TYPE$1}-menu`,
      toggleSelector: `.${TYPE$1}-menu-toggle`,
      root: '/',
      open: false,
      navigate: function (urls) {
        notSideMenu.hide();

        if (!notSideMenu.isDirectNavigation() && notSideMenu.app) {
          let func = notSideMenu.app.getWorking('router');

          if (func) {
            return func.navigate(urls.short);
          }
        }

        document.location.assign(urls.full);
      }
    });

    /* src/frame/components/navigation/top/ui.brand.svelte generated by Svelte v3.46.6 */

    function create_fragment$5(ctx) {
    	let a;
    	let uiicon;
    	let t_value = (/*title*/ ctx[1] ? ` ${/*title*/ ctx[1]}` : '') + "";
    	let t;
    	let current;
    	const uiicon_spread_levels = [/*icon*/ ctx[2]];
    	let uiicon_props = {};

    	for (let i = 0; i < uiicon_spread_levels.length; i += 1) {
    		uiicon_props = assign(uiicon_props, uiicon_spread_levels[i]);
    	}

    	uiicon = new Ui_icon({ props: uiicon_props });

    	return {
    		c() {
    			a = element("a");
    			create_component(uiicon.$$.fragment);
    			t = text(t_value);
    			attr(a, "class", "navbar-item");
    			attr(a, "href", /*url*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			mount_component(uiicon, a, null);
    			append(a, t);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const uiicon_changes = (dirty & /*icon*/ 4)
    			? get_spread_update(uiicon_spread_levels, [get_spread_object(/*icon*/ ctx[2])])
    			: {};

    			uiicon.$set(uiicon_changes);
    			if ((!current || dirty & /*title*/ 2) && t_value !== (t_value = (/*title*/ ctx[1] ? ` ${/*title*/ ctx[1]}` : '') + "")) set_data(t, t_value);

    			if (!current || dirty & /*url*/ 1) {
    				attr(a, "href", /*url*/ ctx[0]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiicon.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiicon.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    			destroy_component(uiicon);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { url = '/' } = $$props;
    	let { title = '' } = $$props;

    	let { icon = {
    		src: 'https://via.placeholder.com/56x28',
    		width: 28,
    		height: 56
    	} } = $$props;

    	$$self.$$set = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('icon' in $$props) $$invalidate(2, icon = $$props.icon);
    	};

    	return [url, title, icon];
    }

    class Ui_brand extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { url: 0, title: 1, icon: 2 });
    	}
    }

    /* src/frame/components/navigation/top/ui.item.content.svelte generated by Svelte v3.46.6 */

    function create_else_block$2(ctx) {
    	let t_value = /*$LOCALE*/ ctx[1][/*item*/ ctx[0].title] + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$LOCALE, item*/ 3 && t_value !== (t_value = /*$LOCALE*/ ctx[1][/*item*/ ctx[0].title] + "")) set_data(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (24:94) 
    function create_if_block_3$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ id: /*item*/ ctx[0].id }, /*item*/ ctx[0].props];
    	var switch_value = COMPONENTS$1.get(/*item*/ ctx[0].component);

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*item*/ 1)
    			? get_spread_update(switch_instance_spread_levels, [{ id: /*item*/ ctx[0].id }, get_spread_object(/*item*/ ctx[0].props)])
    			: {};

    			if (switch_value !== (switch_value = COMPONENTS$1.get(/*item*/ ctx[0].component))) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    // (22:0) {#if item.icon}
    function create_if_block_2$1(ctx) {
    	let uiicon;
    	let current;
    	const uiicon_spread_levels = [/*item*/ ctx[0].icon];
    	let uiicon_props = {};

    	for (let i = 0; i < uiicon_spread_levels.length; i += 1) {
    		uiicon_props = assign(uiicon_props, uiicon_spread_levels[i]);
    	}

    	uiicon = new Ui_icon({ props: uiicon_props });

    	return {
    		c() {
    			create_component(uiicon.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uiicon, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uiicon_changes = (dirty & /*item*/ 1)
    			? get_spread_update(uiicon_spread_levels, [get_spread_object(/*item*/ ctx[0].icon)])
    			: {};

    			uiicon.$set(uiicon_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiicon.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiicon.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uiicon, detaching);
    		}
    	};
    }

    // (34:0) {#if item.tag }
    function create_if_block_1$3(ctx) {
    	let uitag;
    	let current;

    	const uitag_spread_levels = [
    		{ top: true },
    		{ right: true },
    		{ size: "small" },
    		{ id: /*item*/ ctx[0].id },
    		/*item*/ ctx[0].tag
    	];

    	let uitag_props = {};

    	for (let i = 0; i < uitag_spread_levels.length; i += 1) {
    		uitag_props = assign(uitag_props, uitag_spread_levels[i]);
    	}

    	uitag = new Ui_tag$1({ props: uitag_props });

    	return {
    		c() {
    			create_component(uitag.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uitag, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uitag_changes = (dirty & /*item*/ 1)
    			? get_spread_update(uitag_spread_levels, [
    					uitag_spread_levels[0],
    					uitag_spread_levels[1],
    					uitag_spread_levels[2],
    					{ id: /*item*/ ctx[0].id },
    					get_spread_object(/*item*/ ctx[0].tag)
    				])
    			: {};

    			uitag.$set(uitag_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uitag.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uitag.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uitag, detaching);
    		}
    	};
    }

    // (38:0) {#if item.indicator }
    function create_if_block$3(ctx) {
    	let uiindicator;
    	let current;
    	const uiindicator_spread_levels = [{ id: /*item*/ ctx[0].id }, /*item*/ ctx[0].indicator];
    	let uiindicator_props = {};

    	for (let i = 0; i < uiindicator_spread_levels.length; i += 1) {
    		uiindicator_props = assign(uiindicator_props, uiindicator_spread_levels[i]);
    	}

    	uiindicator = new Ui_indicator({ props: uiindicator_props });

    	return {
    		c() {
    			create_component(uiindicator.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uiindicator, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uiindicator_changes = (dirty & /*item*/ 1)
    			? get_spread_update(uiindicator_spread_levels, [{ id: /*item*/ ctx[0].id }, get_spread_object(/*item*/ ctx[0].indicator)])
    			: {};

    			uiindicator.$set(uiindicator_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiindicator.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiindicator.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uiindicator, detaching);
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let t1;
    	let if_block2_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$1, create_if_block_3$1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*item*/ 1) show_if = null;
    		if (/*item*/ ctx[0].icon) return 0;
    		if (show_if == null) show_if = !!(/*item*/ ctx[0].type === 'component' && /*item*/ ctx[0].component && COMPONENTS$1.contains(/*item*/ ctx[0].component));
    		if (show_if) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*item*/ ctx[0].tag && create_if_block_1$3(ctx);
    	let if_block2 = /*item*/ ctx[0].indicator && create_if_block$3(ctx);

    	return {
    		c() {
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(t0.parentNode, t0);
    			}

    			if (/*item*/ ctx[0].tag) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*item*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*item*/ ctx[0].indicator) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*item*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$3(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach(if_block2_anchor);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $LOCALE;
    	component_subscribe($$self, LOCALE, $$value => $$invalidate(1, $LOCALE = $$value));
    	let { item } = $$props;

    	$$self.$$set = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    	};

    	return [item, $LOCALE];
    }

    class Ui_item_content extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { item: 0 });
    	}
    }

    /* src/frame/components/navigation/top/ui.item.svelte generated by Svelte v3.46.6 */

    function create_if_block_1$2(ctx) {
    	let hr;
    	let hr_class_value;

    	return {
    		c() {
    			hr = element("hr");

    			attr(hr, "class", hr_class_value = "navbar-divider " + (/*hidden*/ ctx[2]
    			? `is-hidden-${/*hidden*/ ctx[2]}`
    			: '') + "");
    		},
    		m(target, anchor) {
    			insert(target, hr, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*hidden*/ 4 && hr_class_value !== (hr_class_value = "navbar-divider " + (/*hidden*/ ctx[2]
    			? `is-hidden-${/*hidden*/ ctx[2]}`
    			: '') + "")) {
    				attr(hr, "class", hr_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(hr);
    		}
    	};
    }

    // (32:0) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let uiitemcontent;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	uiitemcontent = new Ui_item_content({ props: { item: /*item*/ ctx[1] } });

    	return {
    		c() {
    			div = element("div");
    			create_component(uiitemcontent.$$.fragment);

    			attr(div, "class", div_class_value = "navbar-item " + (/*hidden*/ ctx[2]
    			? `is-hidden-${/*hidden*/ ctx[2]}`
    			: '') + " " + /*item*/ ctx[1].classes + " " + /*classes*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(uiitemcontent, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div, "click", /*onClick*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const uiitemcontent_changes = {};
    			if (dirty & /*item*/ 2) uiitemcontent_changes.item = /*item*/ ctx[1];
    			uiitemcontent.$set(uiitemcontent_changes);

    			if (!current || dirty & /*hidden, item, classes*/ 14 && div_class_value !== (div_class_value = "navbar-item " + (/*hidden*/ ctx[2]
    			? `is-hidden-${/*hidden*/ ctx[2]}`
    			: '') + " " + /*item*/ ctx[1].classes + " " + /*classes*/ ctx[3])) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiitemcontent.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiitemcontent.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(uiitemcontent);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (23:0) {#if item.url }
    function create_if_block$2(ctx) {
    	let a;
    	let uiitemcontent;
    	let a_class_value;
    	let a_href_value;
    	let a_data_href_value;
    	let current;
    	let mounted;
    	let dispose;
    	uiitemcontent = new Ui_item_content({ props: { item: /*item*/ ctx[1] } });

    	return {
    		c() {
    			a = element("a");
    			create_component(uiitemcontent.$$.fragment);

    			attr(a, "class", a_class_value = "navbar-item " + (/*hidden*/ ctx[2]
    			? `is-hidden-${/*hidden*/ ctx[2]}`
    			: '') + " " + /*item*/ ctx[1].classes + " " + /*classes*/ ctx[3] + "");

    			attr(a, "href", a_href_value = "" + (/*root*/ ctx[0] + /*item*/ ctx[1].url));
    			attr(a, "data-href", a_data_href_value = /*item*/ ctx[1].url);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			mount_component(uiitemcontent, a, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(a, "click", /*onClick*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const uiitemcontent_changes = {};
    			if (dirty & /*item*/ 2) uiitemcontent_changes.item = /*item*/ ctx[1];
    			uiitemcontent.$set(uiitemcontent_changes);

    			if (!current || dirty & /*hidden, item, classes*/ 14 && a_class_value !== (a_class_value = "navbar-item " + (/*hidden*/ ctx[2]
    			? `is-hidden-${/*hidden*/ ctx[2]}`
    			: '') + " " + /*item*/ ctx[1].classes + " " + /*classes*/ ctx[3] + "")) {
    				attr(a, "class", a_class_value);
    			}

    			if (!current || dirty & /*root, item*/ 3 && a_href_value !== (a_href_value = "" + (/*root*/ ctx[0] + /*item*/ ctx[1].url))) {
    				attr(a, "href", a_href_value);
    			}

    			if (!current || dirty & /*item*/ 2 && a_data_href_value !== (a_data_href_value = /*item*/ ctx[1].url)) {
    				attr(a, "data-href", a_data_href_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiitemcontent.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiitemcontent.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    			destroy_component(uiitemcontent);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	let t;
    	let current_block_type_index;
    	let if_block1;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*item*/ ctx[1].break && create_if_block_1$2(ctx);
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[1].url) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*item*/ ctx[1].break) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block1_anchor);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { root = '' } = $$props;
    	let { item = {} } = $$props;
    	let { hidden = '' } = $$props;
    	let { classes = '' } = $$props;

    	function onClick(event) {
    		dispatch('click', { event, element: item });
    	}

    	$$self.$$set = $$props => {
    		if ('root' in $$props) $$invalidate(0, root = $$props.root);
    		if ('item' in $$props) $$invalidate(1, item = $$props.item);
    		if ('hidden' in $$props) $$invalidate(2, hidden = $$props.hidden);
    		if ('classes' in $$props) $$invalidate(3, classes = $$props.classes);
    	};

    	return [root, item, hidden, classes, onClick];
    }

    class Ui_item extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { root: 0, item: 1, hidden: 2, classes: 3 });
    	}
    }

    /* src/frame/components/navigation/top/ui.section.svelte generated by Svelte v3.46.6 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (47:0) {:else}
    function create_else_block(ctx) {
    	let div;
    	let uiitemcontent;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	uiitemcontent = new Ui_item_content({ props: { item: /*section*/ ctx[1] } });

    	return {
    		c() {
    			div = element("div");
    			create_component(uiitemcontent.$$.fragment);

    			attr(div, "class", div_class_value = "navbar-item " + (/*hidden*/ ctx[3]
    			? `is-hidden-${/*hidden*/ ctx[3]}`
    			: '') + "");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(uiitemcontent, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div, "click", /*onClick*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const uiitemcontent_changes = {};
    			if (dirty & /*section*/ 2) uiitemcontent_changes.item = /*section*/ ctx[1];
    			uiitemcontent.$set(uiitemcontent_changes);

    			if (!current || dirty & /*hidden*/ 8 && div_class_value !== (div_class_value = "navbar-item " + (/*hidden*/ ctx[3]
    			? `is-hidden-${/*hidden*/ ctx[3]}`
    			: '') + "")) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiitemcontent.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiitemcontent.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(uiitemcontent);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (39:0) {#if section.url }
    function create_if_block_1$1(ctx) {
    	let a;
    	let uiitemcontent;
    	let a_class_value;
    	let a_href_value;
    	let a_data_href_value;
    	let current;
    	let mounted;
    	let dispose;
    	uiitemcontent = new Ui_item_content({ props: { item: /*section*/ ctx[1] } });

    	return {
    		c() {
    			a = element("a");
    			create_component(uiitemcontent.$$.fragment);

    			attr(a, "class", a_class_value = "navbar-item " + (/*hidden*/ ctx[3]
    			? `is-hidden-${/*hidden*/ ctx[3]}`
    			: '') + "");

    			attr(a, "href", a_href_value = "" + (/*root*/ ctx[0] + /*section*/ ctx[1].url));
    			attr(a, "data-href", a_data_href_value = /*section*/ ctx[1].url);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			mount_component(uiitemcontent, a, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(a, "click", /*onClick*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const uiitemcontent_changes = {};
    			if (dirty & /*section*/ 2) uiitemcontent_changes.item = /*section*/ ctx[1];
    			uiitemcontent.$set(uiitemcontent_changes);

    			if (!current || dirty & /*hidden*/ 8 && a_class_value !== (a_class_value = "navbar-item " + (/*hidden*/ ctx[3]
    			? `is-hidden-${/*hidden*/ ctx[3]}`
    			: '') + "")) {
    				attr(a, "class", a_class_value);
    			}

    			if (!current || dirty & /*root, section*/ 3 && a_href_value !== (a_href_value = "" + (/*root*/ ctx[0] + /*section*/ ctx[1].url))) {
    				attr(a, "href", a_href_value);
    			}

    			if (!current || dirty & /*section*/ 2 && a_data_href_value !== (a_data_href_value = /*section*/ ctx[1].url)) {
    				attr(a, "data-href", a_data_href_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiitemcontent.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiitemcontent.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    			destroy_component(uiitemcontent);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (23:0) {#if items.length }
    function create_if_block$1(ctx) {
    	let div1;
    	let a;
    	let uiitemcontent;
    	let a_class_value;
    	let t;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div0_class_value;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	uiitemcontent = new Ui_item_content({ props: { item: /*section*/ ctx[1] } });
    	let each_value = /*items*/ ctx[2];
    	const get_key = ctx => /*item*/ ctx[10].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	return {
    		c() {
    			div1 = element("div");
    			a = element("a");
    			create_component(uiitemcontent.$$.fragment);
    			t = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(a, "href", "");
    			attr(a, "class", a_class_value = "navbar-link " + (/*arrowless*/ ctx[5] ? 'is-arrowless' : ''));
    			attr(div0, "class", div0_class_value = "navbar-dropdown " + (/*right*/ ctx[6] ? 'is-right' : ''));

    			attr(div1, "class", div1_class_value = "navbar-item has-dropdown " + (/*hoverable*/ ctx[4] ? 'is-hoverable' : '') + " " + (/*hidden*/ ctx[3]
    			? `is-hidden-${/*hidden*/ ctx[3]}`
    			: '') + "");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, a);
    			mount_component(uiitemcontent, a, null);
    			append(div1, t);
    			append(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen(a, "click", /*onClick*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const uiitemcontent_changes = {};
    			if (dirty & /*section*/ 2) uiitemcontent_changes.item = /*section*/ ctx[1];
    			uiitemcontent.$set(uiitemcontent_changes);

    			if (!current || dirty & /*arrowless*/ 32 && a_class_value !== (a_class_value = "navbar-link " + (/*arrowless*/ ctx[5] ? 'is-arrowless' : ''))) {
    				attr(a, "class", a_class_value);
    			}

    			if (dirty & /*root, items*/ 5) {
    				each_value = /*items*/ ctx[2];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}

    			if (!current || dirty & /*right*/ 64 && div0_class_value !== (div0_class_value = "navbar-dropdown " + (/*right*/ ctx[6] ? 'is-right' : ''))) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*hoverable, hidden*/ 24 && div1_class_value !== (div1_class_value = "navbar-item has-dropdown " + (/*hoverable*/ ctx[4] ? 'is-hoverable' : '') + " " + (/*hidden*/ ctx[3]
    			? `is-hidden-${/*hidden*/ ctx[3]}`
    			: '') + "")) {
    				attr(div1, "class", div1_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiitemcontent.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			transition_out(uiitemcontent.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			destroy_component(uiitemcontent);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (33:4) {#each items as item(item.id)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let uiitem;
    	let current;

    	uiitem = new Ui_item({
    			props: {
    				root: /*root*/ ctx[0],
    				item: /*item*/ ctx[10]
    			}
    		});

    	uiitem.$on("click", /*click_handler*/ ctx[8]);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(uiitem.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(uiitem, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const uiitem_changes = {};
    			if (dirty & /*root*/ 1) uiitem_changes.root = /*root*/ ctx[0];
    			if (dirty & /*items*/ 4) uiitem_changes.item = /*item*/ ctx[10];
    			uiitem.$set(uiitem_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uiitem.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uiitem.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(uiitem, detaching);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_1$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*items*/ ctx[2].length) return 0;
    		if (/*section*/ ctx[1].url) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { root = '' } = $$props;
    	let { section = {} } = $$props;
    	let { items = [] } = $$props;
    	let { hidden = '' } = $$props;
    	let { hoverable = true } = $$props;
    	let { arrowless = false } = $$props;
    	let { right = false } = $$props;

    	function onClick(event) {
    		dispatch('click', { event, element: section });
    	}

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('root' in $$props) $$invalidate(0, root = $$props.root);
    		if ('section' in $$props) $$invalidate(1, section = $$props.section);
    		if ('items' in $$props) $$invalidate(2, items = $$props.items);
    		if ('hidden' in $$props) $$invalidate(3, hidden = $$props.hidden);
    		if ('hoverable' in $$props) $$invalidate(4, hoverable = $$props.hoverable);
    		if ('arrowless' in $$props) $$invalidate(5, arrowless = $$props.arrowless);
    		if ('right' in $$props) $$invalidate(6, right = $$props.right);
    	};

    	return [
    		root,
    		section,
    		items,
    		hidden,
    		hoverable,
    		arrowless,
    		right,
    		onClick,
    		click_handler
    	];
    }

    class Ui_section extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			root: 0,
    			section: 1,
    			items: 2,
    			hidden: 3,
    			hoverable: 4,
    			arrowless: 5,
    			right: 6
    		});
    	}
    }

    /* src/frame/components/navigation/top/ui.burger.svelte generated by Svelte v3.46.6 */

    function create_fragment$1(ctx) {
    	let a;
    	let span0;
    	let t0;
    	let span1;
    	let t1;
    	let span2;
    	let a_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			a = element("a");
    			span0 = element("span");
    			t0 = space();
    			span1 = element("span");
    			t1 = space();
    			span2 = element("span");
    			attr(span0, "aria-hidden", "true");
    			attr(span1, "aria-hidden", "true");
    			attr(span2, "aria-hidden", "true");
    			attr(a, "href", "");
    			attr(a, "role", "button");
    			attr(a, "class", a_class_value = "navbar-burger " + (/*closed*/ ctx[0] ? '' : 'is-active'));
    			attr(a, "aria-label", "menu");
    			attr(a, "aria-expanded", "false");
    			attr(a, "data-target", "navbar");
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, span0);
    			append(a, t0);
    			append(a, span1);
    			append(a, t1);
    			append(a, span2);

    			if (!mounted) {
    				dispose = listen(a, "click", /*toggle*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*closed*/ 1 && a_class_value !== (a_class_value = "navbar-burger " + (/*closed*/ ctx[0] ? '' : 'is-active'))) {
    				attr(a, "class", a_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(a);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    const COMPONENT_NAME = 'top-navbar-burger';

    function getStandartUpdateEventName() {
    	return COMPONENT_NAME + ':update';
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { events = {} } = $$props;
    	let { register = notCommon$2.registerWidgetEvents.bind(notCommon$2) } = $$props;
    	let { closed = true } = $$props;

    	function toggle(e) {
    		e.preventDefault();
    		$$invalidate(0, closed = !closed);
    		dispatch('toggle', { closed });
    		return false;
    	}

    	let { onUpdate = data => {
    		$$invalidate(0, closed = data.closed);
    	} } = $$props;

    	onMount(() => {
    		if (!Object.prototype.hasOwnProperty.call(events, getStandartUpdateEventName())) {
    			$$invalidate(2, events[getStandartUpdateEventName()] = onUpdate, events);
    		}

    		register(events);
    	});

    	$$self.$$set = $$props => {
    		if ('events' in $$props) $$invalidate(2, events = $$props.events);
    		if ('register' in $$props) $$invalidate(3, register = $$props.register);
    		if ('closed' in $$props) $$invalidate(0, closed = $$props.closed);
    		if ('onUpdate' in $$props) $$invalidate(4, onUpdate = $$props.onUpdate);
    	};

    	return [closed, toggle, events, register, onUpdate];
    }

    class Ui_burger extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			events: 2,
    			register: 3,
    			closed: 0,
    			onUpdate: 4
    		});
    	}
    }

    /* src/frame/components/navigation/top/ui.top.svelte generated by Svelte v3.46.6 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (67:2) {#if brand }
    function create_if_block_5(ctx) {
    	let uibrand;
    	let current;
    	const uibrand_spread_levels = [/*brand*/ ctx[3]];
    	let uibrand_props = {};

    	for (let i = 0; i < uibrand_spread_levels.length; i += 1) {
    		uibrand_props = assign(uibrand_props, uibrand_spread_levels[i]);
    	}

    	uibrand = new Ui_brand({ props: uibrand_props });

    	return {
    		c() {
    			create_component(uibrand.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uibrand, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uibrand_changes = (dirty & /*brand*/ 8)
    			? get_spread_update(uibrand_spread_levels, [get_spread_object(/*brand*/ ctx[3])])
    			: {};

    			uibrand.$set(uibrand_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uibrand.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uibrand.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uibrand, detaching);
    		}
    	};
    }

    // (71:2) {#if section.showOnTouch}
    function create_if_block_4(ctx) {
    	let uinavbaritem;
    	let current;

    	uinavbaritem = new Ui_item({
    			props: {
    				hidden: "desktop",
    				item: /*section*/ ctx[13],
    				root: /*root*/ ctx[2]
    			}
    		});

    	uinavbaritem.$on("click", /*onClick*/ ctx[8]);

    	return {
    		c() {
    			create_component(uinavbaritem.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uinavbaritem, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uinavbaritem_changes = {};
    			if (dirty & /*sections*/ 1) uinavbaritem_changes.item = /*section*/ ctx[13];
    			if (dirty & /*root*/ 4) uinavbaritem_changes.root = /*root*/ ctx[2];
    			uinavbaritem.$set(uinavbaritem_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uinavbaritem.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uinavbaritem.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uinavbaritem, detaching);
    		}
    	};
    }

    // (70:2) {#each sections as section(section.id)}
    function create_each_block_3(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = /*section*/ ctx[13].showOnTouch && create_if_block_4(ctx);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*section*/ ctx[13].showOnTouch) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*sections*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (76:2) {#if item.showOnTouch}
    function create_if_block_3(ctx) {
    	let uinavbaritem;
    	let current;

    	uinavbaritem = new Ui_item({
    			props: {
    				hidden: "desktop",
    				item: /*item*/ ctx[16],
    				root: /*root*/ ctx[2]
    			}
    		});

    	uinavbaritem.$on("click", /*onClick*/ ctx[8]);

    	return {
    		c() {
    			create_component(uinavbaritem.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uinavbaritem, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uinavbaritem_changes = {};
    			if (dirty & /*items*/ 2) uinavbaritem_changes.item = /*item*/ ctx[16];
    			if (dirty & /*root*/ 4) uinavbaritem_changes.root = /*root*/ ctx[2];
    			uinavbaritem.$set(uinavbaritem_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uinavbaritem.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uinavbaritem.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uinavbaritem, detaching);
    		}
    	};
    }

    // (75:2) {#each items as item(item.id)}
    function create_each_block_2(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = /*item*/ ctx[16].showOnTouch && create_if_block_3(ctx);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*item*/ ctx[16].showOnTouch) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*items*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (80:2) {#if showBurger}
    function create_if_block_2(ctx) {
    	let uinavbarburger;
    	let current;
    	uinavbarburger = new Ui_burger({});
    	uinavbarburger.$on("toggle", /*toggleBurger*/ ctx[9]);

    	return {
    		c() {
    			create_component(uinavbarburger.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uinavbarburger, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(uinavbarburger.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uinavbarburger.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uinavbarburger, detaching);
    		}
    	};
    }

    // (87:4) {#if item.place === 'start' }
    function create_if_block_1(ctx) {
    	let uinavbaritem;
    	let current;

    	uinavbaritem = new Ui_item({
    			props: { hidden: "touch", item: /*item*/ ctx[16] }
    		});

    	uinavbaritem.$on("click", /*onClick*/ ctx[8]);

    	return {
    		c() {
    			create_component(uinavbaritem.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uinavbaritem, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uinavbaritem_changes = {};
    			if (dirty & /*items*/ 2) uinavbaritem_changes.item = /*item*/ ctx[16];
    			uinavbaritem.$set(uinavbaritem_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uinavbaritem.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uinavbaritem.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uinavbaritem, detaching);
    		}
    	};
    }

    // (86:4) {#each items as item}
    function create_each_block_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*item*/ ctx[16].place === 'start' && create_if_block_1(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*item*/ ctx[16].place === 'start') {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*items*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (94:4) {#if (sectionsItemsCount[section.id] || section.indicator || section.tag) && section.place=='end' }
    function create_if_block(ctx) {
    	let uinavbarsection;
    	let current;

    	uinavbarsection = new Ui_section({
    			props: {
    				right: true,
    				hidden: /*section*/ ctx[13].hidden,
    				root: /*root*/ ctx[2],
    				section: /*section*/ ctx[13],
    				items: /*sectionsItems*/ ctx[7][/*section*/ ctx[13].id]
    			}
    		});

    	uinavbarsection.$on("click", /*onClick*/ ctx[8]);

    	return {
    		c() {
    			create_component(uinavbarsection.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uinavbarsection, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uinavbarsection_changes = {};
    			if (dirty & /*sections*/ 1) uinavbarsection_changes.hidden = /*section*/ ctx[13].hidden;
    			if (dirty & /*root*/ 4) uinavbarsection_changes.root = /*root*/ ctx[2];
    			if (dirty & /*sections*/ 1) uinavbarsection_changes.section = /*section*/ ctx[13];
    			if (dirty & /*sectionsItems, sections*/ 129) uinavbarsection_changes.items = /*sectionsItems*/ ctx[7][/*section*/ ctx[13].id];
    			uinavbarsection.$set(uinavbarsection_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uinavbarsection.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uinavbarsection.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uinavbarsection, detaching);
    		}
    	};
    }

    // (93:4) {#each sections as section(section.id) }
    function create_each_block(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = (/*sectionsItemsCount*/ ctx[6][/*section*/ ctx[13].id] || /*section*/ ctx[13].indicator || /*section*/ ctx[13].tag) && /*section*/ ctx[13].place == 'end' && create_if_block(ctx);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if ((/*sectionsItemsCount*/ ctx[6][/*section*/ ctx[13].id] || /*section*/ ctx[13].indicator || /*section*/ ctx[13].tag) && /*section*/ ctx[13].place == 'end') {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*sectionsItemsCount, sections*/ 65) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let div0;
    	let t0;
    	let each_blocks_3 = [];
    	let each0_lookup = new Map();
    	let t1;
    	let each_blocks_2 = [];
    	let each1_lookup = new Map();
    	let t2;
    	let t3;
    	let div3;
    	let div1;
    	let t4;
    	let div2;
    	let each_blocks = [];
    	let each3_lookup = new Map();
    	let div3_class_value;
    	let current;
    	let if_block0 = /*brand*/ ctx[3] && create_if_block_5(ctx);
    	let each_value_3 = /*sections*/ ctx[0];
    	const get_key = ctx => /*section*/ ctx[13].id;

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		let child_ctx = get_each_context_3(ctx, each_value_3, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_3[i] = create_each_block_3(key, child_ctx));
    	}

    	let each_value_2 = /*items*/ ctx[1];
    	const get_key_1 = ctx => /*item*/ ctx[16].id;

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks_2[i] = create_each_block_2(key, child_ctx));
    	}

    	let if_block1 = /*showBurger*/ ctx[4] && create_if_block_2(ctx);
    	let each_value_1 = /*items*/ ctx[1];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*sections*/ ctx[0];
    	const get_key_2 = ctx => /*section*/ ctx[13].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key_2(child_ctx);
    		each3_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	return {
    		c() {
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t1 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			div3 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div0, "class", "navbar-brand");
    			attr(div1, "class", "navbar-start");
    			attr(div2, "class", "navbar-end");
    			attr(div3, "id", "navbar");
    			attr(div3, "class", div3_class_value = "navbar-menu " + (/*menuClosed*/ ctx[5] ? '' : 'is-active'));
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t0);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div0, null);
    			}

    			append(div0, t1);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append(div0, t2);
    			if (if_block1) if_block1.m(div0, null);
    			insert(target, t3, anchor);
    			insert(target, div3, anchor);
    			append(div3, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append(div3, t4);
    			append(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*brand*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*brand*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*sections, root, onClick*/ 261) {
    				each_value_3 = /*sections*/ ctx[0];
    				group_outros();
    				each_blocks_3 = update_keyed_each(each_blocks_3, dirty, get_key, 1, ctx, each_value_3, each0_lookup, div0, outro_and_destroy_block, create_each_block_3, t1, get_each_context_3);
    				check_outros();
    			}

    			if (dirty & /*items, root, onClick*/ 262) {
    				each_value_2 = /*items*/ ctx[1];
    				group_outros();
    				each_blocks_2 = update_keyed_each(each_blocks_2, dirty, get_key_1, 1, ctx, each_value_2, each1_lookup, div0, outro_and_destroy_block, create_each_block_2, t2, get_each_context_2);
    				check_outros();
    			}

    			if (/*showBurger*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showBurger*/ 16) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*items, onClick*/ 258) {
    				each_value_1 = /*items*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*sections, root, sectionsItems, onClick, sectionsItemsCount*/ 453) {
    				each_value = /*sections*/ ctx[0];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_2, 1, ctx, each_value, each3_lookup, div2, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}

    			if (!current || dirty & /*menuClosed*/ 32 && div3_class_value !== (div3_class_value = "navbar-menu " + (/*menuClosed*/ ctx[5] ? '' : 'is-active'))) {
    				attr(div3, "class", div3_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);

    			for (let i = 0; i < each_value_3.length; i += 1) {
    				transition_in(each_blocks_3[i]);
    			}

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			transition_in(if_block1);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				transition_out(each_blocks_3[i]);
    			}

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			transition_out(if_block1);
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div0);
    			if (if_block0) if_block0.d();

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].d();
    			}

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].d();
    			}

    			if (if_block1) if_block1.d();
    			if (detaching) detach(t3);
    			if (detaching) detach(div3);
    			destroy_each(each_blocks_1, detaching);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { sections = [] } = $$props;
    	let { items = [] } = $$props;
    	let { root = '' } = $$props;
    	let { navigate = null } = $$props;
    	let { brand = false } = $$props;
    	let { showBurger = true } = $$props;
    	let { burgerControlsSidemenu = true } = $$props;
    	let menuClosed = true;

    	function onClick({ detail }) {
    		let { event, element } = detail;

    		if (Object.prototype.hasOwnProperty.call(element, 'action')) {
    			return element.action(event, element);
    		}

    		event.preventDefault();

    		if (typeof navigate === 'function') {
    			navigate({
    				full: event.currentTarget.getAttribute('href'),
    				short: event.currentTarget.dataset.href
    			});
    		}

    		return false;
    	}

    	let sectionsItemsCount = {};
    	let sectionsItems = {};

    	beforeUpdate(() => {
    		for (let section of sections) {
    			$$invalidate(7, sectionsItems[section.id] = items.filter(t => t.section === section.id), sectionsItems);
    			$$invalidate(6, sectionsItemsCount[section.id] = items.filter(t => t.section === section.id).length, sectionsItemsCount);
    		}
    	});

    	function toggleBurger({ detail }) {
    		if (burgerControlsSidemenu) {
    			notSideMenu.toggle();
    		} else {
    			dispatch('toggleBurger', detail);
    			$$invalidate(5, menuClosed = detail.closed);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('sections' in $$props) $$invalidate(0, sections = $$props.sections);
    		if ('items' in $$props) $$invalidate(1, items = $$props.items);
    		if ('root' in $$props) $$invalidate(2, root = $$props.root);
    		if ('navigate' in $$props) $$invalidate(10, navigate = $$props.navigate);
    		if ('brand' in $$props) $$invalidate(3, brand = $$props.brand);
    		if ('showBurger' in $$props) $$invalidate(4, showBurger = $$props.showBurger);
    		if ('burgerControlsSidemenu' in $$props) $$invalidate(11, burgerControlsSidemenu = $$props.burgerControlsSidemenu);
    	};

    	return [
    		sections,
    		items,
    		root,
    		brand,
    		showBurger,
    		menuClosed,
    		sectionsItemsCount,
    		sectionsItems,
    		onClick,
    		toggleBurger,
    		navigate,
    		burgerControlsSidemenu
    	];
    }

    class Ui_top extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			sections: 0,
    			items: 1,
    			root: 2,
    			navigate: 10,
    			brand: 3,
    			showBurger: 4,
    			burgerControlsSidemenu: 11
    		});
    	}
    }

    const TYPE = 'top';

    class notTopMenu extends Menu {
      static render(app) {
        if (app) {
          this.setApp(app);
        }

        this.prepareData();

        if (!this.menu) {
          let target = document.querySelector(this.getOptions().targetSelector);

          if (!target) {
            return;
          }

          this.menu = new Ui_top({
            target,
            props: {
              brand: this.getOptions().brand,
              items: this.items,
              sections: this.sections,
              root: this.getOptions().root,
              navigate: this.getOptions().navigate
            }
          });
          this.interval = setInterval(this.updateMenuActiveItem.bind(this), 200);
        }
      }

      static updateMenu(url) {
        Array.from(document.querySelectorAll(this.getOptions().targetSelector + ' aside.menu a')).forEach(function (item) {
          if (item.href == url || url.href && url.href.indexOf(item.href) == 0) {
            item.classList.add('is-active');
          } else {
            item.classList.remove('is-active');
          }
        });
      }

      static updateMenuActiveItem() {
        let url = window.location.toString(),
            lastLocation = this.location;

        if (lastLocation) {
          if (url !== lastLocation) {
            this.location = url;
            this.updateMenu(url);
          }
        } else {
          this.location = url;
          this.updateMenu(url);
        }
      }

      static toggle() {
        let el = document.querySelector(this.getOptions().targetSelector);
        el.classList.toggle('is-active');
      }

      static hide() {
        let el = document.querySelector(this.getOptions().targetSelector);
        el.classList.remove('is-active');
      }

      static setBurgerState(menuClosed) {
        this.menu.$set({
          menuClosed
        });
      }

    }

    _defineProperty(notTopMenu, "DEFAULT", {
      section: 'any',
      sectionTitle: 'Меню',
      priority: 0,
      //link, button, dropdown, component
      type: 'link',
      place: 'main'
    });

    _defineProperty(notTopMenu, "options", {
      brand: false,
      type: TYPE,
      items: [],
      sections: [],
      targetSelector: `#${TYPE}-menu`,
      root: '/',
      directNavigation: false,
      navigate: function (urls) {
        notTopMenu.hide();

        if (!notTopMenu.isDirectNavigation() && notTopMenu.app) {
          let func = notTopMenu.app.getWorking('router');

          if (func) {
            return func.navigate(urls.short);
          }
        }

        document.location.assign(urls.full);
      }
    });

    const PRELOADABLE = ['create', 'update', 'list', 'delete', 'details'];
    class CRUDVariantsPreloader {
      static async preload(controller) {
        let type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'list';

        try {
          if (!PRELOADABLE.includes(type)) {
            return;
          }

          let preload = controller.getOptions(`${type}.preload`, {});

          if (Object.keys(preload).length == 0) {
            preload = controller.getOptions(`preload`, {});
          }

          if (Object.keys(preload).length > 0) {
            let libProps = Object.keys(preload);
            let proms = [];
            libProps.forEach(function (prop) {
              let modelName = notCommon$2.lowerFirstLetter(preload[prop]);
              let Model = controller.make[modelName]({});
              proms.push(Model.$listAll());
            });
            let results = await Promise.all(proms);

            for (let i = 0; i < libProps.length; i++) {
              const propName = libProps[i];

              if (Array.isArray(results[i])) {
                const variants = results[i].map(function (item) {
                  return {
                    id: item._id,
                    title: item.title
                  };
                });
                controller.getOptions(`variants.${type}.${propName}`, variants);
              }
            }
          }

          controller.log('preload finished');
        } catch (e) {
          controller.report(e);
          controller.showErrorMessage(e);
        }
      }

    }

    const DEFAULT_ACTION = 'list';
    class CRUDRouter {
      static extractActionName(params) {
        let actionName = DEFAULT_ACTION;

        if (params.length == 1) {
          if (params[0] === 'create') {
            actionName = 'create';
          } else {
            actionName = 'details';
          }
        } else if (params.length > 1) {
          if (params[1] === 'delete') {
            actionName = 'delete';
          } else if (params[1] === 'update') {
            actionName = 'update';
          } else {
            actionName = params[1];
          }
        }

        return actionName;
      }

      static route(controller, params) {
        try {
          const actionName = CRUDRouter.extractActionName(params);
          controller.setCurrentAction(actionName);
          return controller.runAction(actionName, params);
        } catch (e) {
          notCommon.report(e);
          controller.showErrorMessage(e);
        }
      }

    }

    class CRUDMessage {
      static error(controller, title, message) {
        controller.setUI('__message__', new Ui_error({
          target: controller.getContainerInnerElement(),
          props: {
            title,
            message
          }
        }));
      }

      static success(controller, title, message) {
        controller.setUI('__message__', new Ui_success({
          target: controller.getContainerInnerElement(),
          props: {
            title,
            message
          }
        }));
      }

    }

    const ACTION$4 = 'create';
    const MODEL_ACTION$2 = 'create';
    class CRUDActionCreate {
      static async run(controller) {

        try {
          await controller.preloadVariants(ACTION$4);
          controller.setBreadcrumbs([{
            title: 'Добавление',
            url: controller.getModelActionURL(false, ACTION$4)
          }]);

          if (controller.ui[ACTION$4]) {
            return;
          } else {
            controller.$destroyUI();
          }

          const createActionName = controller.getOptions(`${ACTION$4}.actionName`, MODEL_ACTION$2);
          let defData = controller.createDefault();

          if (defData.getData) {
            defData = defData.getData();
          }

          controller.ui[ACTION$4] = new notForm({
            options: {
              target: controller.getContainerInnerElement(),
              model: controller.getModelName(),
              action: createActionName,
              name: `${controller.getName()}.${ACTION$4}Form`,
              validators: controller.getOptions('Validators'),
              variants: controller.getOptions(`variants.${ACTION$4}`, {})
            },
            data: defData
          });
          controller.ui[ACTION$4].$on('submit', async function (data) {
            const success = await controller.onActionSubmit(createActionName, data);

            if (success) {
              controller.ui[ACTION$4].setFormSuccess();
              setTimeout(function () {
                return controller.goList();
              }, 1000);
            }
          });
          controller.ui[ACTION$4].$on('reject', controller.goList.bind(controller));
          controller.emit(`after:render:${ACTION$4}`);
        } catch (e) {
          controller.report(e);
          controller.showErrorMessage(e);
        }
      }

    }

    const ACTION$3 = 'details';
    const MODEL_ACTION$1 = 'get';
    class CRUDActionDetails {
      static async run(controller, params) {
        try {
          await controller.preloadVariants(ACTION$3);
          const idField = controller.getOptions(`${ACTION$3}.idField`, '_id'),
                query = {
            [idField]: params[0]
          };
          controller.setBreadcrumbs([{
            title: 'Просмотр',
            url: controller.getModelActionURL(params[0], false)
          }]);

          if (controller.ui[ACTION$3]) {
            return;
          } else {
            controller.$destroyUI();
          }

          const detailsActionName = controller.getOptions(`${ACTION$3}.actionName`, MODEL_ACTION$1);
          let res = await controller.getModel(query)[`$${detailsActionName}`]();

          if (res.status !== 'ok') {
            controller.showErrorMessage(res);
          }

          const title = controller.getItemTitle(res.result);
          controller.setBreadcrumbs([{
            title: `Просмотр "${title}"`,
            url: controller.getModelActionURL(params[0], false)
          }]);
          controller.ui[ACTION$3] = new notForm({
            options: {
              target: controller.getContainerInnerElement(),
              model: controller.getModelName(),
              action: detailsActionName,
              name: `${controller.getName()}.${ACTION$3}Form`,
              fields: {
                readonly: true
              },
              validators: controller.getOptions('Validators'),
              variants: controller.getOptions(`variants.${ACTION$3}`, {})
            },
            data: res.result
          });
          controller.emit(`after:render:${ACTION$3}`);
          controller.ui[ACTION$3].$on('reject', controller.goList.bind(controller));
        } catch (e) {
          controller.report(e);
          controller.showErrorMessage(e);
        }
      }

    }

    const ACTION$2 = 'update';
    const MODEL_ACTION_GET = 'getRaw';
    const MODEL_ACTION_UPDATE = 'update';
    class CRUDActionUpdate {
      static async run(controller, params) {
        try {
          const idField = controller.getOptions(`${ACTION$2}.idField`, '_id'),
                id = params[0],
                query = {
            [idField]: id
          };
          await controller.preloadVariants(ACTION$2);
          controller.setBreadcrumbs([{
            title: 'Редактирование',
            url: controller.getModelActionURL(id, ACTION$2)
          }]);

          if (controller.ui[ACTION$2]) {
            return;
          } else {
            controller.$destroyUI();
          }

          const getActionName = controller.getOptions(`${ACTION$2}.actionName`, MODEL_ACTION_GET);
          let res = await controller.getModel(query)[`$${getActionName}`]();

          if (res.status !== 'ok') {
            controller.showErrorMessage(res);
          }

          const title = controller.getItemTitle(res.result);
          controller.setBreadcrumbs([{
            title: `Редактирование "${title}"`,
            url: controller.getModelActionURL(params[0], ACTION$2)
          }]);
          controller.ui[ACTION$2] = new notForm({
            options: {
              target: controller.getContainerInnerElement(),
              model: controller.getModelName(),
              action: MODEL_ACTION_UPDATE,
              name: `${controller.getName()}.${ACTION$2}Form`,
              validators: controller.getOptions('Validators'),
              variants: controller.getOptions(`variants.${ACTION$2}`, {}),
              ui: controller.getOptions(`${ACTION$2}.ui`, {}),
              fields: controller.getOptions(`${ACTION$2}.fields`, {})
            },
            data: notCommon$2.stripProxy(res.result)
          });
          controller.ui[ACTION$2].$on('submit', async function (ev) {
            const success = await controller.onActionSubmit(ACTION$2, ev.detail);

            if (success) {
              setTimeout(function () {
                return controller.goDetails(id);
              }, 1000);
            }
          });
          controller.ui[ACTION$2].$on('reject', controller.goList.bind(controller));
          controller.emit(`after:render:${ACTION$2}`);
        } catch (e) {
          controller.report(e);
          controller.showErrorMessage(e);
        }
      }

    }

    const ACTION$1 = 'delete';
    const MODEL_ACTION = 'delete';
    class CRUDActionDelete {
      static async run(controller, params) {
        try {
          await controller.preloadVariants(ACTION$1);
          controller.setBreadcrumbs([{
            title: 'Удаление',
            url: controller.getModelActionURL(params[0], ACTION$1)
          }]);

          if (confirm('Удалить запись?')) {
            const deleteActionName = controller.getOptions(`${ACTION$1}.actionName`, MODEL_ACTION);
            const success = await controller.onActionSubmit(deleteActionName, {
              _id: params[0]
            });

            if (success) {
              controller.goList();
            }
          } else {
            controller.goList();
          }
        } catch (e) {
          controller.report(e);
          controller.showErrorMessage(e);
        }
      }

    }

    const ACTION = 'list';
    class CRUDActionList {
      static async run(controller, params) {
        try {
          await controller.preloadVariants(ACTION);
          controller.setBreadcrumbs([{
            title: 'Список',
            url: controller.getModelURL()
          }]);

          if (controller.ui[ACTION]) {
            return;
          } else {
            controller.$destroyUI();
          }

          controller.ui[ACTION] = new notTable(CRUDActionList.prepareOptions(controller));
          controller.emit(`after:render:${ACTION}`);
        } catch (e) {
          controller.report(e);
          controller.showErrorMessage(e);
        }
      }

      static prepareOptions(controller) {
        const DEFAULT_OPTIONS_TABLE = {
          interface: {
            combined: true,
            factory: controller.getInterface()
          },
          fields: undefined,
          showSelect: undefined,
          getItemId: undefined,
          idField: undefined,
          preload: {},
          pager: {
            size: 50,
            page: 0
          },
          sorter: {
            id: -1
          },
          filter: undefined
        };
        const TABLE_OPTIONS = {
          options: {
            targetEl: controller.getContainerInnerElement(),
            endless: false,
            actions: [{
              title: 'Создать',
              action: controller.goCreate.bind(controller)
            }, ...controller.getOptions(`${ACTION}.actions`, [])]
          }
        };
        Object.keys(DEFAULT_OPTIONS_TABLE).forEach(function (key) {
          let optVal = controller.getOptions(`${ACTION}.${key}`, DEFAULT_OPTIONS_TABLE[key]);

          if (typeof optVal !== 'undefined') {
            TABLE_OPTIONS.options[key] = optVal;
          }
        });
        return TABLE_OPTIONS;
      }

    }

    var index = {
      create: CRUDActionCreate,
      details: CRUDActionDetails,
      update: CRUDActionUpdate,
      delete: CRUDActionDelete,
      list: CRUDActionList
    };

    var CRUDActions = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': index
    });

    const BREADCRUMBS = [];
    const TITLE_FIELDS_PRIORITY = ['title', 'label', 'id', 'name'];

    var _actions = /*#__PURE__*/new WeakMap();

    var _router = /*#__PURE__*/new WeakMap();

    var _preloader = /*#__PURE__*/new WeakMap();

    class notCRUD extends notController {
      constructor(app, name, _ref) {
        let {
          actions,
          router,
          preloader
        } = _ref;
        super(app, `CRUD.${name}`);

        _classPrivateFieldInitSpec(this, _actions, {
          writable: true,
          value: { ...CRUDActions
          }
        });

        _classPrivateFieldInitSpec(this, _router, {
          writable: true,
          value: CRUDRouter
        });

        _classPrivateFieldInitSpec(this, _preloader, {
          writable: true,
          value: CRUDVariantsPreloader
        });

        _defineProperty(this, "TITLE_FIELDS_PRIORITY", TITLE_FIELDS_PRIORITY);

        if (actions) {
          _classPrivateFieldSet(this, _actions, { ..._classPrivateFieldGet(this, _actions),
            ...actions
          });
        }

        if (router) {
          _classPrivateFieldSet(this, _router, router);
        }

        if (preloader) {
          _classPrivateFieldSet(this, _preloader, preloader);
        }

        this.ui = {};
        this.els = {};
        this.setOptions('names', {
          module: '',
          plural: 'plural',
          single: 'single'
        });
        this.setOptions('containerSelector', this.app.getOptions('crud.containerSelector'));
        this.buildFrame();
        return this;
      }

      start() {
        var _this = this;

        let newHead = [];

        if (this.getModuleName() && this.getOptions('names.module')) {
          newHead.push({
            title: this.getOptions('names.module'),
            url: false
          });
        }

        newHead.push({
          title: this.getOptions('names.plural'),
          url: this.getModelURL()
        });
        BREADCRUMBS.splice(0, BREADCRUMBS.length, ...newHead);
        notBreadcrumbs.setHead(BREADCRUMBS).render({
          root: '',
          target: this.els.top,
          navigate: function (url) {
            return _this.app.getWorking('router').navigate(url);
          }
        });
        this.route(this.getOptions('params'));
      }

      setBreadcrumbs(tail) {
        notBreadcrumbs.setTail(tail).update();
      }

      backToList() {
        this.app.getWorking('router').navigate(this.linkBackToList());
      }

      linkBackToList() {
        return this.getModelURL();
      }

      afterAction() {
        let action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'list';
        let navBack = this.app.getOptions('crud.navigateBackAfter', []);

        if (navBack && Array.isArray(navBack) && navBack.indexOf(action) > -1) {
          window.history.back();
        } else {
          this.backToList();
        }
      }

      buildFrame() {
        let el = document.querySelector(this.app.getOptions('crud.containerSelector', 'body'));

        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }

        this.els.top = document.createElement('div');
        this.els.top.id = 'crud-top';
        this.els.top.classList.add('box');
        el.appendChild(this.els.top);
        this.els.main = document.createElement('div');
        this.els.main.id = 'crud-main';
        this.els.main.classList.add('box');
        el.appendChild(this.els.main);
        this.els.bottom = document.createElement('div');
        this.els.bottom.id = 'crud-bottom';
        this.els.bottom.classList.add('box');
        el.appendChild(this.els.bottom);
      }

      getContainerTopElement() {
        return this.els.top;
      }

      getContainerInnerElement() {
        return this.els.main;
      }

      getContainerBottomElement() {
        return this.els.bottom;
      }

      async preloadVariants() {
        let type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'list';
        await _classPrivateFieldGet(this, _preloader).preload(this, type);
      }

      getTitleFromLib(propName, id) {
        throw new Error('not suported anymore'); //return Form.getVariant(propName, id).title;
      }

      getItemTitle(item) {
        const fieldName = this.TITLE_FIELDS_PRIORITY.find(function (key) {
          return notCommon$2.objHas(item, key);
        });

        if (fieldName) {
          return item[fieldName];
        } else {
          return '';
        }
      }

      createDefault() {
        let newRecord = this.getModel({
          '_id': null,
          title: this.getOptions('names.single'),
          products: []
        });
        return newRecord;
      }

      route() {
        let params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        try {
          return _classPrivateFieldGet(this, _router).route(this, params);
        } catch (e) {
          this.report(e);
          this.showErrorMessage(e);
        }
      }

      runAction(actionName, params) {
        if (Object.keys(_classPrivateFieldGet(this, _actions)).includes(actionName)) {
          return _classPrivateFieldGet(this, _actions)[actionName].run(this, params);
        } else if (typeof this['run' + notCommon$2.capitalizeFirstLetter(actionName)]) {
          throw new Error(`No such action: ${actionName} in contoller ${this.getWorking('name')}`);
        }
      }

      goCreate() {
        this.$destroyUI();
        this.app.getWorking('router').navigate(this.getModelActionURL(false, 'create'));
      }

      goDetails(value) {
        this.$destroyUI();
        this.app.getWorking('router').navigate(this.getModelActionURL(value, false));
      }

      goUpdate(value) {
        this.$destroyUI();
        this.app.getWorking('router').navigate(this.getModelActionURL(value, 'update'));
      }

      goDelete(value) {
        this.$destroyUI();
        this.app.getWorking('router').navigate(this.getModelActionURL(value, 'delete'));
      }

      goList() {
        this.$destroyUI();
        this.app.getWorking('router').navigate(this.getModelURL());
      }

      async onActionSubmit(action, item) {
        const actionUI = this.ui[action];

        if (actionUI) {
          try {
            actionUI.setLoading();
            let result = await this.getModel(item)[`$${action}`]();
            state = actionUI.processResult(result);
          } catch (e) {
            state = actionUI.processResult(e);
          } finally {
            actionUI.resetLoading();
            return state;
          }
        }

        throw new Error('Action UI doesnt exist');
      }

      $destroyUI() {
        for (let name in this.ui) {
          this.ui[name].$destroy && this.ui[name].$destroy();
          this.ui[name].destroy && this.ui[name].destroy();
          delete this.ui[name];
        }
      }

      showErrorMessage(res) {
        this.error(res);
        CRUDMessage.error(this, 'Произошла ошибка', res.message ? res.message : UICommon.ERROR_DEFAULT);
      }

      showSuccessMessage(title, message) {
        CRUDMessage.success(this, title, message);
      }

      setUI(name, val) {
        this.$destroyUI();
        this.ui[name] = val;
      }

      getActionUI() {
        return this.ui[this.getCurrentAction()];
      }

    }

    _defineProperty(notCRUD, "ERROR_DEFAULT", UICommon.ERROR_DEFAULT);

    //import 'babel-polyfill/dist/polyfill';
    const ncCRUD = notCRUD; //legacy alias

    var Frame = /*#__PURE__*/Object.freeze({
        __proto__: null,
        notCommon: notCommon$2,
        notPath: notPath,
        notController: notController,
        notBase: notBase,
        notRouter: notRouter$1,
        notRecord: notRecord,
        notInterface: notInterface,
        notApp: notApp,
        notAPI: index$1,
        notCRUD: notCRUD,
        ncCRUD: ncCRUD,
        COMPONENTS: COMPONENTS$1,
        FIELDS: FIELDS$2,
        VARIANTS: VARIANTS$1,
        notTable: notTable,
        UIForm: Form,
        notForm: notForm,
        notFormSet: notFormSet,
        notFormUtils: notFormUtils$1,
        notBreadcrumbs: notBreadcrumbs,
        notTopMenu: notTopMenu,
        notSideMenu: notSideMenu
    });

    const Locale = {
      LOCALE,
      say,
      notLocale: notLocale$1
    };
    const {
      notCommon: notCommon$1,
      COMPONENTS,
      FIELDS,
      VARIANTS,
      notFormUtils
    } = Frame;
    Object.keys(index$9).forEach(function (fieldtype) {
      notFormUtils$1.addComponent(fieldtype, index$9[fieldtype]);
    });

    exports.COMPONENTS = COMPONENTS;
    exports.Elements = index$2;
    exports.FIELDS = FIELDS;
    exports.Frame = Frame;
    exports.LOCALE = LOCALE;
    exports.Locale = Locale;
    exports.VARIANTS = VARIANTS;
    exports.notCommon = notCommon$1;
    exports.notFormUtils = notFormUtils;
    exports.notLocale = notLocale$1;
    exports.say = say;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
